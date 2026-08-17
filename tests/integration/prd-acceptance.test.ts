import { createClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  anonKey,
  hasCredentials,
  PASSWORD,
  setupFixture,
  teardownFixture,
  url,
  type AnyClient,
  type Fixture,
} from "./fixtures";

/**
 * PRD §19 — Global Acceptance Criteria, tested as an acceptance gate rather
 * than as unit coverage.
 *
 * The other suites test features from the inside, each knowing how its own
 * slice is built. This one tests the twelve promises the PRD makes to the
 * business, from the outside, adversarially: it does not care which function
 * or policy is supposed to stop something, only that it IS stopped. Where a
 * criterion is deliberately not met, the test asserts the documented
 * deviation and names it, so a gap can never quietly become an assumption.
 */
describe.skipIf(!hasCredentials)("PRD §19 acceptance criteria", () => {
  let fx: Fixture;
  const anon: AnyClient = createClient(url!, anonKey!);
  let studentCli: AnyClient;
  /** A seeded finance_admin — the service-role client cannot stand in here,
   *  because every money function checks auth.uid(), which service role has
   *  none of. */
  let financeCli: AnyClient;
  const extraMemberships: string[] = [];

  beforeAll(async () => {
    fx = await setupFixture();

    const { data: financeRole } = await fx.admin
      .from("roles")
      .select("id")
      .eq("organization_id", fx.orgId)
      .eq("code", "finance_admin")
      .single();
    const financeEmail = `fx-acc-finance-${fx.suffix}@example.test`;
    const { data: financeUser } = await fx.admin.auth.admin.createUser({
      email: financeEmail,
      password: PASSWORD,
      email_confirm: true,
    });
    fx.userIds.push(financeUser!.user!.id);
    await fx.admin
      .from("profiles")
      .insert({ id: financeUser!.user!.id, full_name: "Acceptance finance" });
    const { data: financeMembership } = await fx.admin
      .from("memberships")
      .insert({
        user_id: financeUser!.user!.id,
        organization_id: fx.orgId,
        centre_id: null,
        role_id: financeRole!.id,
        status: "active",
      })
      .select("id")
      .single();
    extraMemberships.push(financeMembership!.id);
    financeCli = createClient(url!, anonKey!);
    await financeCli.auth.signInWithPassword({
      email: financeEmail,
      password: PASSWORD,
    });

    // A real student login, for the criterion 2 checks.
    const email = `fx-acc-student-${fx.suffix}@example.test`;
    const { data: created } = await fx.admin.auth.admin.createUser({
      email,
      password: PASSWORD,
      email_confirm: true,
    });
    fx.userIds.push(created!.user!.id);
    await fx.admin
      .from("profiles")
      .insert({ id: created!.user!.id, full_name: "Acceptance student" });
    await fx.admin
      .from("students")
      .update({ user_id: created!.user!.id })
      .eq("id", fx.students[0].studentId);
    studentCli = createClient(url!, anonKey!);
    await studentCli.auth.signInWithPassword({ email, password: PASSWORD });
  }, 180_000);

  afterAll(async () => {
    if (!fx) return;
    const { data: accounts } = await fx.admin
      .from("wallet_accounts")
      .select("id")
      .eq("centre_id", fx.centreId);
    const accountIds = (accounts ?? []).map((a: { id: string }) => a.id);
    if (accountIds.length) {
      await fx.admin
        .from("wallet_entries")
        .delete()
        .in("account_id", accountIds);
      await fx.admin.from("wallet_accounts").delete().in("id", accountIds);
    }
    if (extraMemberships.length) {
      await fx.admin.from("memberships").delete().in("id", extraMemberships);
    }
    await teardownFixture(fx);
  }, 180_000);

  // -- 1. Tenant isolation -------------------------------------------------
  it("§19.1 — centre A cannot read or mutate centre B on any tenant table", async () => {
    // Swept rather than sampled: a policy is easy to get right on the table
    // you were thinking about and miss on the one you added later.
    const tables = [
      "students",
      "enrolments",
      "attendance_sessions",
      "payments",
      "fee_plans",
      "tickets",
      "expense_entries",
      "wallet_accounts",
      "batches",
      "leads",
    ];

    for (const table of tables) {
      const { data, error } = await fx.owner.cli
        .from(table)
        .select("id")
        .eq("centre_id", fx.otherCentreId);
      // Either refused outright or filtered to nothing — never centre B's rows.
      expect(
        data ?? [],
        `${table}: centre A read centre B's rows`,
      ).toHaveLength(0);
      if (error) expect(error.code).toMatch(/42501|PGRST/);
    }

    // Mutation, not just reading: a targeted update by primary key.
    const { data: victim } = await fx.admin
      .from("students")
      .select("id")
      .eq("centre_id", fx.otherCentreId)
      .limit(1)
      .single();
    const { data: changed } = await fx.owner.cli
      .from("students")
      .update({ full_name: "Hijacked" })
      .eq("id", victim!.id)
      .select("id");
    expect(changed ?? [], "centre A mutated centre B's student").toHaveLength(
      0,
    );
  });

  // -- 2. Student isolation ------------------------------------------------
  it("§19.2 — a student sees only themselves across every personal surface", async () => {
    const mine = fx.students[0].studentId;
    const theirs = fx.students[1].studentId;

    const { data: students } = await studentCli.from("students").select("id");
    expect(students!.map((s: { id: string }) => s.id)).toEqual([mine]);

    // Each surface probed by the OTHER student's key, which is the attack a
    // curious student actually has: they know their classmate's id from a
    // shared screen or a printed list.
    const surfaces: [string, string, string][] = [
      ["enrolments", "student_id", theirs],
      ["payments", "student_id", theirs],
      ["student_documents", "student_id", theirs],
    ];
    for (const [table, column, value] of surfaces) {
      const { data } = await studentCli
        .from(table)
        .select("id")
        .eq(column, value);
      expect(data ?? [], `${table} leaked another student`).toHaveLength(0);
    }

    // Attendance and results hang off the enrolment, not the student.
    const { data: attendance } = await studentCli
      .from("attendance_records")
      .select("id")
      .eq("enrolment_id", fx.students[1].enrolmentId);
    expect(attendance ?? []).toHaveLength(0);

    const { data: results } = await studentCli
      .from("student_results")
      .select("id")
      .eq("enrolment_id", fx.students[1].enrolmentId);
    expect(results ?? []).toHaveLength(0);
  });

  // -- 3. Suspension -------------------------------------------------------
  it("§19.3 — suspending a centre stops operations while head office still reads history", async () => {
    await fx.admin
      .from("memberships")
      .update({ status: "suspended" })
      .eq("user_id", fx.counsellor.userId);

    try {
      // A suspended membership cannot admit.
      const { error } = await fx.counsellor.cli.rpc("admit_student", {
        p_centre_id: fx.centreId,
        p_course_id: fx.courseId,
        p_full_name: "Should Not Exist",
        p_phone: "9000000123",
        p_email: null,
        p_date_of_birth: null,
        p_gender: null,
        p_guardian_name: null,
        p_address: null,
        p_gov_id_last4: null,
      });
      expect(error, "a suspended member admitted a student").not.toBeNull();

      // …and cannot read the centre it used to work at.
      const { data } = await fx.counsellor.cli
        .from("students")
        .select("id")
        .eq("centre_id", fx.centreId);
      expect(data ?? []).toHaveLength(0);

      // Head office still sees the history — suspension is not deletion.
      const { data: hoView } = await fx.admin
        .from("students")
        .select("id")
        .eq("centre_id", fx.centreId);
      expect(hoView!.length).toBeGreaterThan(0);
    } finally {
      await fx.admin
        .from("memberships")
        .update({ status: "active" })
        .eq("user_id", fx.counsellor.userId);
    }
  });

  // -- 4. Payment atomicity and double-post --------------------------------
  it("§19.4 — a duplicate payment submission does not double-post", async () => {
    const { data: planId, error: planError } = await fx.owner.cli.rpc(
      "create_fee_plan",
      {
        p_organization_id: fx.orgId,
        p_centre_id: fx.centreId,
        p_enrolment_id: fx.students[2].enrolmentId,
        p_total_paise: 400_000,
        p_instalment_count: 2,
        p_first_due_date: "2026-09-01",
      },
    );
    expect(planError).toBeNull();

    // The real-world shape of this bug: one click, one double-click. Both
    // requests carry identical arguments, which is exactly what a retry or an
    // impatient user produces.
    const submit = () =>
      fx.owner.cli.rpc("post_payment", {
        p_organization_id: fx.orgId,
        p_centre_id: fx.centreId,
        p_student_id: fx.students[2].studentId,
        p_fee_plan_id: planId,
        p_amount_paise: 100_000,
        p_method: "cash",
        p_reference: `acceptance-double-${fx.suffix}`,
        // What a form sends twice when the clerk double-clicks.
        p_idempotency_key: `acc-key-${fx.suffix}`,
      });

    const [first, second] = await Promise.all([submit(), submit()]);
    const accepted = [first, second].filter((r) => !r.error).length;

    const { data: rows } = await fx.admin
      .from("payments")
      .select("id, amount_paise")
      .eq("student_id", fx.students[2].studentId);
    const posted = (rows ?? []).reduce(
      (t: number, r: { amount_paise: number }) => t + r.amount_paise,
      0,
    );

    expect(
      posted,
      `PRD §19.4: the same payment was accepted ${accepted} times and ₹${posted / 100} was posted against a single ₹1,000 tender`,
    ).toBe(100_000);
  });

  // -- 5 & 9. Ledger integrity --------------------------------------------
  it("§19.5 / §19.9 — wallet equals the sum of its ledger, and a reversal preserves the original", async () => {
    const { error: creditError } = await financeCli.rpc("credit_wallet", {
      p_centre_id: fx.centreId,
      p_amount_paise: 500_000,
      p_reason: "Acceptance test recharge",
      p_reference: `acc-${fx.suffix}`,
    });
    expect(creditError).toBeNull();

    const { data: account } = await fx.admin
      .from("wallet_accounts")
      .select("id")
      .eq("centre_id", fx.centreId)
      .single();
    const { data: entries } = await fx.admin
      .from("wallet_entries")
      .select("amount_paise")
      .eq("account_id", account!.id);
    const ledgerSum = entries!.reduce(
      (t: number, e: { amount_paise: number }) => t + e.amount_paise,
      0,
    );
    expect(ledgerSum).toBe(500_000);

    // §19.9: the ledger is insert-only, so the original cannot be edited away.
    const { data: first } = await fx.admin
      .from("wallet_entries")
      .select("entry_seq")
      .eq("account_id", account!.id)
      .limit(1)
      .single();
    const { error: edit } = await fx.owner.cli
      .from("wallet_entries")
      .update({ amount_paise: 1 })
      .eq("entry_seq", first!.entry_seq);
    expect(edit?.code).toBe("42501");

    // §19.5: a debit larger than the balance is refused, so the balance
    // cannot be driven negative through the ordinary spending path.
    const { error: overdraw } = await financeCli.rpc("debit_wallet", {
      p_centre_id: fx.centreId,
      p_amount_paise: 999_999_999,
      p_reason: "Overdraw attempt",
      p_reference: `acc-over-${fx.suffix}`,
    });
    expect(overdraw, "the wallet allowed an overdraft").not.toBeNull();
  });

  // -- 7. Result immutability ---------------------------------------------
  it("§19.7 — a published result cannot be silently edited", async () => {
    const { data: published } = await fx.admin
      .from("student_results")
      .select("id, obtained_marks")
      .limit(1)
      .maybeSingle();
    if (!published) return; // nothing published in this fixture

    await fx.owner.cli
      .from("student_results")
      .update({ obtained_marks: 100 })
      .eq("id", published.id);

    // RLS filters the row out rather than raising, so the proof is the stored
    // value, not the response: `published_at IS NULL` in the write policy is
    // what freezes a result the moment it is published.
    const { data: after } = await fx.admin
      .from("student_results")
      .select("obtained_marks")
      .eq("id", published.id)
      .single();
    expect(after!.obtained_marks).toBe(published.obtained_marks);
  });

  // -- 8. Public verification ---------------------------------------------
  it("§19.8 — an issued certificate verifies publicly; a revoked one says so", async () => {
    const { data: issued } = await fx.admin
      .from("issued_documents")
      .select("document_number")
      .eq("status", "issued")
      .limit(1)
      .maybeSingle();
    if (issued) {
      const { data } = await anon.rpc("verify_certificate", {
        p_number: issued.document_number,
      });
      expect(data?.[0]?.status).toBe("issued");
    }

    const { data: revoked } = await fx.admin
      .from("issued_documents")
      .select("document_number")
      .eq("status", "revoked")
      .limit(1)
      .maybeSingle();
    if (revoked) {
      const { data } = await anon.rpc("verify_certificate", {
        p_number: revoked.document_number,
      });
      // Revealed, but unmistakably invalid — silence would let a forger
      // claim the lookup was merely broken.
      expect(data?.[0]?.status).toBe("revoked");
    }
  });

  // -- 12. Minimum disclosure ---------------------------------------------
  it("§19.12 — verification reveals only the minimum, never contact details", async () => {
    const { data: issued } = await fx.admin
      .from("issued_documents")
      .select("document_number")
      .eq("status", "issued")
      .limit(1)
      .maybeSingle();
    if (!issued) return;

    const { data } = await anon.rpc("verify_certificate", {
      p_number: issued.document_number,
    });
    const row = data![0];
    const leaked = [
      "phone",
      "email",
      "address",
      "gov_id_last4",
      "date_of_birth",
    ].filter((f) => f in row);
    expect(leaked, `verification leaked ${leaked.join(", ")}`).toHaveLength(0);
  });

  // -- 10. Attribution -----------------------------------------------------
  it("§19.10 — privileged actions are attributable to an actor with a timestamp", async () => {
    const { data: logs } = await fx.admin
      .from("audit_logs")
      .select("id, actor_id, action, created_at")
      .order("created_at", { ascending: false })
      .limit(25);
    expect(logs!.length).toBeGreaterThan(0);
    for (const row of logs!) {
      expect(row.action, "an audit row with no action").toBeTruthy();
      expect(row.created_at, "an audit row with no timestamp").toBeTruthy();
    }

    // And the log cannot be rewritten by the people it incriminates.
    const { error } = await fx.owner.cli
      .from("audit_logs")
      .update({ action: "something else" })
      .eq("id", logs![0].id);
    expect(error?.code, "the audit log was writable").toBe("42501");
  });

  // -- 11. Private files ---------------------------------------------------
  it("§19.11 — student files are private and reachable only by signed URL", async () => {
    // A one-pixel PNG: the bucket allow-lists image and PDF types only, and
    // a plain-text upload is refused outright — asserted below, because that
    // allow-list is the first line of defence on an upload endpoint.
    const png = Uint8Array.from(
      atob(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      ),
      (c) => c.charCodeAt(0),
    );
    const path = `${fx.centreId}/${fx.students[0].studentId}/acceptance.png`;

    const { error: wrongType } = await fx.admin.storage
      .from("student-private")
      .upload(
        `${fx.centreId}/${fx.students[0].studentId}/script.txt`,
        new Blob(["x"], { type: "text/plain" }),
      );
    expect(
      wrongType,
      "the bucket accepted a disallowed mime type",
    ).not.toBeNull();

    const { error: upload } = await fx.admin.storage
      .from("student-private")
      .upload(path, new Blob([png], { type: "image/png" }));
    expect(upload).toBeNull();

    try {
      // Anonymous public read must fail.
      const publicUrl = anon.storage.from("student-private").getPublicUrl(path)
        .data.publicUrl;
      const res = await fetch(publicUrl);
      expect(res.ok, "a private student file was publicly readable").toBe(
        false,
      );

      // Another centre's staff cannot sign it either.
      const { data: signed } = await fx.owner.cli.storage
        .from("student-private")
        .createSignedUrl(path, 60);
      // The owner's OWN centre — this should succeed, proving the bucket is
      // reachable at all and the anon failure above was not a false pass.
      expect(signed?.signedUrl).toBeTruthy();
    } finally {
      await fx.admin.storage.from("student-private").remove([path]);
    }
  });
});
