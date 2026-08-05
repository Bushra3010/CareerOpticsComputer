import { expect, test as setup } from "@playwright/test";

import { CENTRE_STATE, STUDENT_STATE } from "./auth-state";

/**
 * Signs in once per role and saves the session, so the portal scan does not
 * pay for a sign-in on every one of its assertions.
 *
 * The accounts come from `npm run db:seed:dev`, which prints a generated
 * password once and stores it nowhere. Put it in `.env.local` as
 * `E2E_PASSWORD` — this repository is public and a working credential for a
 * live project does not belong in it.
 */

const password = process.env.E2E_PASSWORD ?? "";
const centreEmail =
  process.env.E2E_CENTRE_EMAIL ?? "owner.lucknow@example.test";
const studentEmail =
  process.env.E2E_STUDENT_EMAIL ?? "student.lucknow@example.test";

async function signIn(
  page: import("@playwright/test").Page,
  signInPath: string,
  email: string,
  portalPath: string,
): Promise<void> {
  await page.goto(signInPath);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();

  // Leaving the sign-in page, rather than arriving anywhere specific: a
  // successful sign-in lands on the public home page, not the portal. An
  // earlier version waited for a pathname starting with "/", which every URL
  // satisfies — so it saved the session cookie before it had been set, and
  // every portal test redirected straight back to sign-in.
  await page.waitForURL((url) => !url.pathname.startsWith("/sign-in"), {
    timeout: 30_000,
  });

  // Then prove the session actually opens the portal before saving it. A
  // storage state that does not authenticate is worse than none: the portal
  // tests would fail on the redirect assertion and look like page bugs.
  await page.goto(portalPath);
  expect(
    new URL(page.url()).pathname,
    "sign-in did not produce a usable session",
  ).toBe(portalPath);
}

setup("authenticate as a centre owner", async ({ page }) => {
  setup.skip(!password, "E2E_PASSWORD is not set — run npm run db:seed:dev");
  await signIn(page, "/sign-in/centre", centreEmail, "/centre");
  await page.context().storageState({ path: CENTRE_STATE });
});

setup("authenticate as a student", async ({ page }) => {
  setup.skip(!password, "E2E_PASSWORD is not set — run npm run db:seed:dev");
  await signIn(page, "/sign-in/student", studentEmail, "/student");
  await page.context().storageState({ path: STUDENT_STATE });
});
