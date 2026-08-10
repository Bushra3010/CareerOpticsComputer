import { createClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";

/**
 * Build plan §6 step 10 — the one journey no single-page test proves:
 *
 *   public application → head-office approval → invitation → first
 *   password → the new owner's dashboard.
 *
 * Everything else in the suite checks a page; this checks the seam BETWEEN
 * pages, which is where the onboarding flow actually broke twice before
 * (the invite emails that landed on the home page, the approval that
 * assumed a session the server action did not have).
 *
 * The invitation email cannot be read by a test, so after approval the
 * test mints its own magic link for the invited address via the service
 * key and follows it through Supabase's /auth/v1/verify — the same
 * fragment-session shape a real emailed link produces, consumed by the
 * same /invite page.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.E2E_ADMIN_EMAIL ?? "admin@careeroptics.in";
const adminPassword = process.env.E2E_PASSWORD ?? "";

const canRun = Boolean(url && serviceKey && adminPassword);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function admin(): any {
  return createClient(url!, serviceKey!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

test.describe("onboarding journey", () => {
  test.skip(
    !canRun,
    "needs NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and E2E_PASSWORD",
  );

  // One flow, one test: the steps only mean anything in sequence.
  test("application → approval → invitation → first login → dashboard", async ({
    browser,
  }) => {
    test.setTimeout(240_000);

    const suffix = Math.random().toString(36).slice(2, 8);
    const applicantEmail = `e2e-journey-${suffix}@example.test`;
    const centreName = `Journey Centre ${suffix}`;
    const cleanup = admin();

    try {
      // -- 1. A stranger applies from the public site --------------------
      const applicant = await browser.newContext();
      const applyPage = await applicant.newPage();
      await applyPage.goto("/partner-with-us/apply");

      await applyPage.getByLabel("Your name").fill(`Journey Owner ${suffix}`);
      await applyPage.getByLabel("Mobile number").fill("9876501234");
      // Not exact: the visible label is "Email*" — the required marker is
      // part of the label text, so an exact match never resolves.
      await applyPage.getByLabel("Email").fill(applicantEmail);
      await applyPage.getByLabel("Proposed centre name").fill(centreName);
      await applyPage.getByLabel("City").fill("Kanpur");
      await applyPage.getByLabel("State").fill("Uttar Pradesh");
      await applyPage.getByLabel("PIN code").fill("208001");
      await applyPage
        .getByLabel("Proposed centre address")
        .fill("12 Journey Road, Kanpur");

      await applyPage
        .getByRole("button", { name: "Submit application" })
        .click();
      await expect(applyPage.getByText("Application submitted")).toBeVisible({
        timeout: 20_000,
      });
      await applicant.close();

      const { data: application } = await cleanup
        .from("centre_applications")
        .select("id")
        .eq("applicant_email", applicantEmail)
        .single();
      expect(application, "application row should exist").toBeTruthy();

      // GoTrue refuses to *invite* an undeliverable .test address (real
      // applicants have real inboxes), so the test pre-creates the account —
      // which lands approval on its documented idempotent-retry path: invite
      // fails, the existing account is found, everything else proceeds. No
      // email leaves the building.
      const { data: preCreated } = await cleanup.auth.admin.createUser({
        email: applicantEmail,
        email_confirm: true,
      });
      expect(preCreated?.user, "pre-created applicant account").toBeTruthy();

      // -- 2. Head office approves it in the admin UI --------------------
      const ho = await browser.newContext();
      const hoPage = await ho.newPage();
      await hoPage.goto("/sign-in/admin");
      await hoPage.getByLabel("Email").fill(adminEmail);
      await hoPage.getByLabel("Password").fill(adminPassword);
      await hoPage.getByRole("button", { name: "Sign in" }).click();
      await hoPage.waitForURL((u) => !u.pathname.startsWith("/sign-in"), {
        timeout: 30_000,
      });

      await hoPage.goto(`/admin/centre-applications/${application!.id}`);
      await expect(hoPage.getByText(centreName).first()).toBeVisible();
      await hoPage
        .getByRole("button", { name: "Approve & create centre" })
        .click();

      // The atomic approval either did everything or nothing — the centre
      // row is the proof, and polling the database beats guessing at UI.
      await expect
        .poll(
          async () => {
            const { data } = await cleanup
              .from("centres")
              .select("id")
              .eq("name", centreName)
              .maybeSingle();
            return data?.id ?? null;
          },
          { timeout: 30_000 },
        )
        .not.toBeNull();
      await ho.close();

      const { data: invitedUsers } = await cleanup.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });
      const invited = invitedUsers.users.find(
        (u: { email?: string }) => u.email === applicantEmail,
      );
      expect(
        invited,
        "approval should have invited the applicant",
      ).toBeTruthy();

      // -- 3. The invitee follows their link and sets a password ---------
      // A test cannot read email, so it mints a link for the same address
      // and follows it through the same verify endpoint the emailed link
      // uses. The fragment session it produces is what /invite consumes.
      const { data: link, error: linkError } =
        await cleanup.auth.admin.generateLink({
          type: "magiclink",
          email: applicantEmail,
          options: { redirectTo: "http://localhost:3000/invite" },
        });
      expect(linkError).toBeNull();

      const verifyUrl = new URL("/auth/v1/verify", url!);
      verifyUrl.searchParams.set(
        "token",
        link!.properties!.hashed_token as string,
      );
      verifyUrl.searchParams.set("type", "magiclink");
      verifyUrl.searchParams.set("redirect_to", "http://localhost:3000/invite");

      const invitee = await browser.newContext();
      const invitePage = await invitee.newPage();
      await invitePage.goto(verifyUrl.toString());
      await invitePage.waitForURL("**/invite**", { timeout: 30_000 });

      const newPassword = `Journey!${suffix}A9`;
      // Anchored regex, not `exact`: the label renders as "Password*" (the
      // required marker is inside it), and a loose "Password" would also
      // match "Confirm password".
      await invitePage.getByLabel(/^Password\*?$/).fill(newPassword);
      await invitePage.getByLabel("Confirm password").fill(newPassword);
      await invitePage
        .getByRole("button", { name: "Set password and continue" })
        .click();
      await invitePage.waitForURL((u) => !u.pathname.startsWith("/invite"), {
        timeout: 30_000,
      });
      await invitee.close();

      // -- 4. First real sign-in lands on their own centre ---------------
      const owner = await browser.newContext();
      const ownerPage = await owner.newPage();
      await ownerPage.goto("/sign-in/centre");
      await ownerPage.getByLabel("Email").fill(applicantEmail);
      await ownerPage.getByLabel("Password").fill(newPassword);
      await ownerPage.getByRole("button", { name: "Sign in" }).click();
      await ownerPage.waitForURL((u) => !u.pathname.startsWith("/sign-in"), {
        timeout: 30_000,
      });

      await ownerPage.goto("/centre");
      // The shell renders the mobile and desktop compositions both and hides
      // one with CSS (CLAUDE.md, style guide §9), so the centre name exists
      // several times over and a bare .first() lands on the hidden mobile
      // header. Filter to what is actually on screen.
      await expect(
        ownerPage.getByText(centreName).filter({ visible: true }).first(),
        "the new owner's dashboard should carry their centre's name",
      ).toBeVisible({ timeout: 30_000 });
      await owner.close();
    } finally {
      // -- Teardown: the journey leaves no residue -----------------------
      // Applications go FIRST: an approved one carries centre_id, and that
      // foreign key silently defeated an earlier version of this teardown —
      // the centre survived and showed up as a real row on the head-office
      // dashboard.
      await cleanup
        .from("centre_applications")
        .delete()
        .eq("applicant_email", applicantEmail);

      const { data: centre } = await cleanup
        .from("centres")
        .select("id")
        .eq("name", centreName)
        .maybeSingle();
      if (centre) {
        const { data: accounts } = await cleanup
          .from("wallet_accounts")
          .select("id")
          .eq("centre_id", centre.id);
        const accountIds = (accounts ?? []).map((a: { id: string }) => a.id);
        if (accountIds.length) {
          await cleanup
            .from("wallet_entries")
            .delete()
            .in("account_id", accountIds);
          await cleanup.from("wallet_accounts").delete().in("id", accountIds);
        }
        await cleanup.from("memberships").delete().eq("centre_id", centre.id);
        await cleanup
          .from("document_sequences")
          .delete()
          .eq("centre_id", centre.id);
        await cleanup.from("centres").delete().eq("id", centre.id);
      }
      const { data: users } = await cleanup.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });
      const ghost = users.users.find(
        (u: { email?: string }) => u.email === applicantEmail,
      );
      if (ghost) {
        await cleanup
          .from("notifications")
          .delete()
          .eq("recipient_user_id", ghost.id);
        await cleanup.from("profiles").delete().eq("id", ghost.id);
        await cleanup.auth.admin.deleteUser(ghost.id);
      }
    }
  });
});
