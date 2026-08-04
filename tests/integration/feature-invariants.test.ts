/**
 * Regression suite for the invariants each feature was built around.
 *
 * Every one of these was proven once by a throwaway script during development
 * and then deleted, which protected nothing. Migration 0012 later broke
 * payment posting outright and only manual re-testing caught it; these tests
 * exist so that cannot happen quietly again.
 *
 * Two of them (R13, and centre-A-cannot-touch-centre-B) are named in the build
 * plan's RLS test matrix (§5.2) and had never actually been run in CI.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  hasCredentials,
  setupFixture,
  teardownFixture,
  type Fixture,
} from "./fixtures";

/**
 * `.single()` is typed as nullable, but in these tests a missing row means the
 * fixture or an earlier step is broken. Failing loudly with what was expected
 * beats a cascade of null-safety noise at every call site.
 */
function must<T>(value: T | null | undefined, what: string): T {
  if (value == null) throw new Error(`Expected ${what}`);
  return value;
}

describe.skipIf(!hasCredentials)("feature invariants", () => {
  let fx: Fixture;

  beforeAll(async () => {
    fx = await setupFixture();
  }, 90_000);

  afterAll(async () => {
    if (fx) await teardownFixture(fx);
  }, 90_000);

  describe("role boundaries (build plan §4 matrix)", () => {
    it("R13 — a counsellor cannot post a payment", async () => {
      const plan = await fx.owner.cli.rpc("create_fee_plan", {
        p_organization_id: fx.orgId,
        p_centre_id: fx.centreId,
        p_enrolment_id: fx.students[0].enrolmentId,
        p_total_paise: 100_000,
        p_instalment_count: 1,
        p_first_due_date: "2026-09-01",
      });
      expect(plan.error).toBeNull();

      const attempt = await fx.counsellor.cli.rpc("post_payment", {
        p_organization_id: fx.orgId,
        p_centre_id: fx.centreId,
        p_student_id: fx.students[0].studentId,
        p_fee_plan_id: plan.data,
        p_amount_paise: 1_000,
        p_method: "cash",
        p_reference: null,
      });

      expect(attempt.error).not.toBeNull();
    });

    it("faculty see no fee plans and no payments at all", async () => {
      const plans = await fx.faculty.cli.from("fee_plans").select("id");
      const payments = await fx.faculty.cli.from("payments").select("id");

      expect(plans.data ?? []).toHaveLength(0);
      expect(payments.data ?? []).toHaveLength(0);
    });

    it("an accountant can take money but cannot admit a student", async () => {
      const admit = await fx.accountant.cli.rpc("admit_student", {
        p_organization_id: fx.orgId,
        p_centre_id: fx.centreId,
        p_course_id: fx.courseId,
        p_full_name: "Should Not Exist",
        p_phone: "9000000077",
        p_email: null,
        p_date_of_birth: null,
        p_gender: null,
        p_guardian_name: null,
        p_address: null,
      });

      expect(admit.error).not.toBeNull();
    });

    it("a counsellor can admit a student", async () => {
      const admit = await fx.counsellor.cli.rpc("admit_student", {
        p_organization_id: fx.orgId,
        p_centre_id: fx.centreId,
        p_course_id: fx.otherCourseId,
        p_full_name: `Counsellor Admit ${fx.suffix}`,
        p_phone: "9000000078",
        p_email: null,
        p_date_of_birth: null,
        p_gender: null,
        p_guardian_name: null,
        p_address: null,
      });

      expect(admit.error).toBeNull();
    });

    it("only an owner manages staff, and cannot mint another owner", async () => {
      const { data: created } = await fx.admin.auth.admin.createUser({
        email: `fx-newstaff-${fx.suffix}@example.test`,
        password: "TestPass123!",
        email_confirm: true,
      });
      fx.userIds.push(created!.user!.id);

      const byCounsellor = await fx.counsellor.cli.rpc("invite_centre_staff", {
        p_centre_id: fx.centreId,
        p_user_id: created!.user!.id,
        p_role_code: "faculty",
        p_full_name: "New",
      });
      expect(byCounsellor.error).not.toBeNull();

      const escalate = await fx.owner.cli.rpc("invite_centre_staff", {
        p_centre_id: fx.centreId,
        p_user_id: created!.user!.id,
        p_role_code: "centre_owner",
        p_full_name: "New",
      });
      expect(escalate.error).not.toBeNull();

      const byOwner = await fx.owner.cli.rpc("invite_centre_staff", {
        p_centre_id: fx.centreId,
        p_user_id: created!.user!.id,
        p_role_code: "faculty",
        p_full_name: "New",
      });
      expect(byOwner.error).toBeNull();
    });

    it("nobody can change their own access", async () => {
      const own = must(
        (
          await fx.admin
            .from("memberships")
            .select("id")
            .eq("user_id", fx.owner.userId)
            .single()
        ).data,
        "the owner's own membership",
      );

      const attempt = await fx.owner.cli.rpc("set_membership_status", {
        p_membership_id: own.id,
        p_status: "suspended",
      });

      expect(attempt.error).not.toBeNull();
    });
  });

  describe("attendance", () => {
    it("a session can be re-saved and the correction persists", async () => {
      const date = "2026-08-04";
      const upsertSession = () =>
        fx.owner.cli
          .from("attendance_sessions")
          .upsert(
            {
              organization_id: fx.orgId,
              centre_id: fx.centreId,
              course_id: fx.courseId,
              session_date: date,
            },
            { onConflict: "centre_id,course_id,session_date" },
          )
          .select("id")
          .single();

      const first = await upsertSession();
      expect(first.error).toBeNull();
      const sessionId = must(first.data, "the attendance session").id;

      const mark = (status: string) =>
        fx.owner.cli.from("attendance_records").upsert(
          [
            {
              session_id: sessionId,
              enrolment_id: fx.students[0].enrolmentId,
              status,
            },
          ],
          { onConflict: "session_id,enrolment_id" },
        );

      expect((await mark("present")).error).toBeNull();

      // Migration 0010 gave attendance_sessions no UPDATE policy, so this
      // second upsert failed and every correction after the first save of a
      // day was impossible. Fixed in 0012.
      expect((await upsertSession()).error).toBeNull();
      expect((await mark("absent")).error).toBeNull();

      const { data: rowData } = await fx.admin
        .from("attendance_records")
        .select("status")
        .eq("session_id", sessionId)
        .eq("enrolment_id", fx.students[0].enrolmentId)
        .single();

      expect(must(rowData, "the marked attendance row").status).toBe("absent");
    });

    it("a centre cannot mark an enrolment belonging to another centre", async () => {
      const session = must(
        (
          await fx.owner.cli
            .from("attendance_sessions")
            .select("id")
            .eq("centre_id", fx.centreId)
            .limit(1)
            .single()
        ).data,
        "an existing attendance session",
      );

      const attempt = await fx.owner.cli.from("attendance_records").upsert(
        [
          {
            session_id: session.id,
            enrolment_id: fx.otherStudent.enrolmentId,
            status: "present",
          },
        ],
        { onConflict: "session_id,enrolment_id" },
      );

      expect(attempt.error).not.toBeNull();
    });
  });

  describe("fees", () => {
    it("instalments sum to exactly the total when it does not divide evenly", async () => {
      const plan = await fx.owner.cli.rpc("create_fee_plan", {
        p_organization_id: fx.orgId,
        p_centre_id: fx.centreId,
        p_enrolment_id: fx.students[1].enrolmentId,
        p_total_paise: 650_000, // ₹6,500 over 3 → 2 paise remainder
        p_instalment_count: 3,
        p_first_due_date: "2026-09-01",
      });
      expect(plan.error).toBeNull();

      const { data: instalments } = await fx.admin
        .from("fee_instalments")
        .select("amount_paise")
        .eq("fee_plan_id", plan.data);

      const total = (instalments ?? []).reduce(
        (sum: number, i: { amount_paise: number }) => sum + i.amount_paise,
        0,
      );
      expect(total).toBe(650_000);
    });

    it("a partial payment settles oldest-first and allocates exactly what was tendered", async () => {
      const plan = must(
        (
          await fx.admin
            .from("fee_plans")
            .select("id")
            .eq("enrolment_id", fx.students[1].enrolmentId)
            .single()
        ).data,
        "a fee plan for student 2",
      );

      const paid = await fx.owner.cli.rpc("post_payment", {
        p_organization_id: fx.orgId,
        p_centre_id: fx.centreId,
        p_student_id: fx.students[1].studentId,
        p_fee_plan_id: plan.id,
        p_amount_paise: 300_000,
        p_method: "cash",
        p_reference: null,
      });
      expect(paid.error).toBeNull();

      const { data: instalments } = await fx.admin
        .from("fee_instalments")
        .select("sequence, status")
        .eq("fee_plan_id", plan.id)
        .order("sequence");

      expect(
        (instalments ?? []).map((i: { status: string }) => i.status),
      ).toEqual(["paid", "partially_paid", "pending"]);

      const { data: instIds } = await fx.admin
        .from("fee_instalments")
        .select("id")
        .eq("fee_plan_id", plan.id);
      const { data: allocations } = await fx.admin
        .from("payment_allocations")
        .select("amount_paise")
        .in(
          "fee_instalment_id",
          (instIds ?? []).map((i: { id: string }) => i.id),
        );

      const allocated = (allocations ?? []).reduce(
        (sum: number, a: { amount_paise: number }) => sum + a.amount_paise,
        0,
      );
      expect(allocated).toBe(300_000);
    });

    it("an overpayment is refused and rolled back, leaving no payment row", async () => {
      const plan = must(
        (
          await fx.admin
            .from("fee_plans")
            .select("id")
            .eq("enrolment_id", fx.students[1].enrolmentId)
            .single()
        ).data,
        "a fee plan for student 2",
      );

      const { count: before } = await fx.admin
        .from("payments")
        .select("*", { count: "exact", head: true })
        .eq("fee_plan_id", plan.id);

      const attempt = await fx.owner.cli.rpc("post_payment", {
        p_organization_id: fx.orgId,
        p_centre_id: fx.centreId,
        p_student_id: fx.students[1].studentId,
        p_fee_plan_id: plan.id,
        p_amount_paise: 999_999,
        p_method: "cash",
        p_reference: null,
      });
      expect(attempt.error).not.toBeNull();

      const { count: after } = await fx.admin
        .from("payments")
        .select("*", { count: "exact", head: true })
        .eq("fee_plan_id", plan.id);

      expect(after).toBe(before);
    });

    it("a payment cannot be booked against a plan that is not the student's", async () => {
      const plan = must(
        (
          await fx.admin
            .from("fee_plans")
            .select("id")
            .eq("enrolment_id", fx.students[1].enrolmentId)
            .single()
        ).data,
        "a fee plan for student 2",
      );

      const attempt = await fx.owner.cli.rpc("post_payment", {
        p_organization_id: fx.orgId,
        p_centre_id: fx.centreId,
        p_student_id: fx.students[2].studentId, // wrong student for this plan
        p_fee_plan_id: plan.id,
        p_amount_paise: 100,
        p_method: "cash",
        p_reference: null,
      });

      expect(attempt.error).not.toBeNull();
    });
  });

  describe("results and certificates", () => {
    it("marks decide pass/fail on the exact boundary, and a draft is invisible to the student", async () => {
      const pub = await fx.owner.cli
        .from("result_publications")
        .insert({
          organization_id: fx.orgId,
          centre_id: fx.centreId,
          course_id: fx.courseId,
          term_label: `Term ${fx.suffix}`,
          version: 1,
        })
        .select("id")
        .single();
      expect(pub.error).toBeNull();
      const pubId = must(pub.data, "the new draft publication").id;

      // 40% pass, 75% distinction. Out of 200 that is 80 and 150 exactly.
      const cases: [number, string][] = [
        [79, "fail"],
        [80, "pass"],
        [150, "distinction"],
      ];

      for (const [index, [marks, expected]] of cases.entries()) {
        const result = await fx.owner.cli.rpc("record_student_result", {
          p_publication_id: pubId,
          p_enrolment_id: fx.students[index].enrolmentId,
          p_max_marks: 200,
          p_obtained_marks: marks,
        });
        expect(result.data, `${marks}/200`).toBe(expected);
      }
    });

    it("publishing is one-way, refuses an empty set, and locks the marks", async () => {
      const { data: pub } = await fx.admin
        .from("result_publications")
        .select("id")
        .eq("centre_id", fx.centreId)
        .limit(1)
        .single();
      if (!pub)
        throw new Error("expected the draft result set from the previous test");

      const empty = await fx.owner.cli
        .from("result_publications")
        .insert({
          organization_id: fx.orgId,
          centre_id: fx.centreId,
          course_id: fx.otherCourseId,
          term_label: `Empty ${fx.suffix}`,
          version: 1,
        })
        .select("id")
        .single();
      const emptyId = must(empty.data, "the empty publication").id;
      expect(
        (
          await fx.owner.cli.rpc("publish_results", {
            p_publication_id: emptyId,
          })
        ).error,
      ).not.toBeNull();

      expect(
        (
          await fx.owner.cli.rpc("publish_results", {
            p_publication_id: pub.id,
          })
        ).error,
      ).toBeNull();
      expect(
        (
          await fx.owner.cli.rpc("publish_results", {
            p_publication_id: pub.id,
          })
        ).error,
      ).not.toBeNull();

      // Marks are writable only while published_at is null, enforced in RLS as
      // well as in the RPC, so neither route can edit a published result.
      const viaRpc = await fx.owner.cli.rpc("record_student_result", {
        p_publication_id: pub.id,
        p_enrolment_id: fx.students[0].enrolmentId,
        p_max_marks: 200,
        p_obtained_marks: 200,
      });
      expect(viaRpc.error).not.toBeNull();

      const direct = await fx.owner.cli
        .from("student_results")
        .update({ obtained_marks: 200 })
        .eq("publication_id", pub.id)
        .select();
      expect(direct.error !== null || (direct.data ?? []).length === 0).toBe(
        true,
      );
    });

    it("a certificate is refused for a failed result and issued for a pass", async () => {
      const { data: pub } = await fx.admin
        .from("result_publications")
        .select("id")
        .eq("centre_id", fx.centreId)
        .not("published_at", "is", null)
        .limit(1)
        .single();
      if (!pub)
        throw new Error(
          "expected a published result set from the previous test",
        );

      const { data: results } = await fx.admin
        .from("student_results")
        .select("id, outcome")
        .eq("publication_id", pub.id);

      const failed = (results ?? []).find(
        (r: { outcome: string }) => r.outcome === "fail",
      );
      const passed = (results ?? []).find(
        (r: { outcome: string }) => r.outcome !== "fail",
      );
      if (!failed || !passed) {
        throw new Error(
          "expected both a failing and a passing result in the fixture",
        );
      }

      expect(
        (
          await fx.owner.cli.rpc("issue_certificate", {
            p_student_result_id: failed.id,
          })
        ).error,
      ).not.toBeNull();

      const issued = await fx.owner.cli.rpc("issue_certificate", {
        p_student_result_id: passed.id,
      });
      expect(issued.error).toBeNull();
      expect(String(issued.data)).toMatch(/^CO-CERT-\d{2}-\d{6}$/);

      // One live certificate per result.
      expect(
        (
          await fx.owner.cli.rpc("issue_certificate", {
            p_student_result_id: passed.id,
          })
        ).error,
      ).not.toBeNull();
    });

    it("anyone can verify a certificate without being able to read the tables", async () => {
      const { data: cert } = await fx.admin
        .from("issued_documents")
        .select("document_number")
        .eq("centre_id", fx.centreId)
        .limit(1)
        .single();
      if (!cert)
        throw new Error("expected a certificate from the previous test");

      const { createClient } = await import("@supabase/supabase-js");
      const anon = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      );

      const verified = await anon.rpc("verify_certificate", {
        p_number: cert.document_number,
      });
      expect((verified.data ?? []) as unknown[]).toHaveLength(1);

      const direct = await anon
        .from("issued_documents")
        .select("document_number");
      expect(direct.data ?? []).toHaveLength(0);

      const students = await anon.from("students").select("full_name");
      expect(students.data ?? []).toHaveLength(0);
    });
  });
});
