import { createClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  PASSWORD,
  anonKey,
  hasCredentials,
  signIn,
  setupFixture,
  teardownFixture,
  url,
  type AnyClient,
  type Fixture,
} from "./fixtures";

/**
 * The CRUD completions found missing from the super-admin audit: retiring a
 * question bank or question, editing a draft exam's paper and assignments,
 * cancelling a published one, and deleting a draft outright. All of it was
 * already legal under RLS's `for all` policies — these tests are for the
 * shape of the *safe* path (retire over delete for anything referenced
 * downstream; delete only for a draft, which provably has no attempts).
 */
describe.skipIf(!hasCredentials)("exam and question-bank lifecycle", () => {
  let fx: Fixture;
  let hoCli: AnyClient;
  let roleId: string;
  let bankId: string;
  let questionId: string;

  beforeAll(async () => {
    fx = await setupFixture();

    const { data: role } = await fx.admin
      .from("roles")
      .insert({
        organization_id: fx.orgId,
        code: `exam_lc_${fx.suffix}`,
        name: "Exam lifecycle (test)",
        is_system_role: false,
      })
      .select("id")
      .single();
    roleId = role!.id;
    await fx.admin
      .from("role_permissions")
      .insert(
        ["question.read", "question.manage", "exam.read", "exam.manage"].map(
          (permission_code) => ({ role_id: roleId, permission_code }),
        ),
      );

    const email = `fx-elc-${fx.suffix}@example.test`;
    const { data: created } = await fx.admin.auth.admin.createUser({
      email,
      password: PASSWORD,
      email_confirm: true,
    });
    fx.userIds.push(created!.user!.id);
    await fx.admin
      .from("profiles")
      .insert({ id: created!.user!.id, full_name: "Exam Lifecycle" });
    await fx.admin.from("memberships").insert({
      user_id: created!.user!.id,
      organization_id: fx.orgId,
      centre_id: null,
      role_id: roleId,
      status: "active",
    });

    hoCli = createClient(url!, anonKey!);
    await signIn(hoCli, email, "sign-in");

    const { data: bank } = await hoCli
      .from("question_banks")
      .insert({
        organization_id: fx.orgId,
        name: `LC bank ${fx.suffix}`,
        status: "active",
      })
      .select("id")
      .single();
    bankId = bank!.id;

    const { data: q } = await hoCli
      .from("questions")
      .insert({
        bank_id: bankId,
        organization_id: fx.orgId,
        type: "true_false",
        body: "LC probe question",
        marks: 1,
        status: "active",
      })
      .select("id")
      .single();
    questionId = q!.id;
    await hoCli.rpc("save_question_options", {
      p_question_id: questionId,
      p_options: [
        { body: "True", is_correct: true },
        { body: "False", is_correct: false },
      ],
    });
  }, 120_000);

  afterAll(async () => {
    if (!fx) return;
    await fx.admin
      .from("question_options")
      .delete()
      .eq("question_id", questionId);
    await fx.admin.from("questions").delete().eq("id", questionId);
    await fx.admin.from("question_banks").delete().eq("id", bankId);
    await fx.admin.from("role_permissions").delete().eq("role_id", roleId);
    await fx.admin.from("memberships").delete().eq("role_id", roleId);
    await fx.admin.from("roles").delete().eq("id", roleId);
    await teardownFixture(fx);
  }, 120_000);

  const makeDraftExam = async () => {
    const now = Date.now();
    const { data: exam } = await hoCli
      .from("exams")
      .insert({
        organization_id: fx.orgId,
        bank_id: bankId,
        title: `LC exam ${fx.suffix}-${now}`,
        duration_minutes: 30,
        opens_at: new Date(now + 3600_000).toISOString(),
        closes_at: new Date(now + 7200_000).toISOString(),
        status: "draft",
      })
      .select("id")
      .single();
    const { data: eq } = await hoCli
      .from("exam_questions")
      .insert({
        exam_id: exam!.id,
        question_id: questionId,
        organization_id: fx.orgId,
        display_order: 1,
      })
      .select("id")
      .single();
    const { data: ea } = await hoCli
      .from("exam_assignments")
      .insert({
        exam_id: exam!.id,
        organization_id: fx.orgId,
        centre_id: fx.centreId,
      })
      .select("id")
      .single();
    return {
      examId: exam!.id as string,
      examQuestionId: eq!.id as string,
      assignmentId: ea!.id as string,
    };
  };

  it("retiring a question bank round-trips, and a centre still cannot touch it", async () => {
    const { error: retire } = await hoCli
      .from("question_banks")
      .update({ status: "retired" })
      .eq("id", bankId);
    expect(retire).toBeNull();

    const { error: notCentre } = await fx.owner.cli
      .from("question_banks")
      .update({ status: "active" })
      .eq("id", bankId);
    // Zero rows visible to a centre, so nothing to update — not an error, and
    // definitely not a state change.
    const { data: after } = await fx.admin
      .from("question_banks")
      .select("status")
      .eq("id", bankId)
      .single();
    expect(after!.status).toBe("retired");
    expect(notCentre).toBeNull();

    const { error: reactivate } = await hoCli
      .from("question_banks")
      .update({ status: "active" })
      .eq("id", bankId);
    expect(reactivate).toBeNull();
  });

  it("retiring a question does not remove it from a paper it is already on", async () => {
    const { examId, examQuestionId } = await makeDraftExam();

    await hoCli
      .from("questions")
      .update({ status: "retired" })
      .eq("id", questionId);

    const { data: stillOnPaper } = await fx.admin
      .from("exam_questions")
      .select("id")
      .eq("id", examQuestionId);
    expect(stillOnPaper).toHaveLength(1);

    await hoCli
      .from("questions")
      .update({ status: "active" })
      .eq("id", questionId);
    await fx.admin.from("exam_questions").delete().eq("exam_id", examId);
    await fx.admin.from("exam_assignments").delete().eq("exam_id", examId);
    await fx.admin.from("exams").delete().eq("id", examId);
  });

  it("removing a question from one exam's paper leaves other exams untouched", async () => {
    const a = await makeDraftExam();
    const b = await makeDraftExam();

    await hoCli.from("exam_questions").delete().eq("id", a.examQuestionId);

    const { data: aPaper } = await fx.admin
      .from("exam_questions")
      .select("id")
      .eq("exam_id", a.examId);
    const { data: bPaper } = await fx.admin
      .from("exam_questions")
      .select("id")
      .eq("exam_id", b.examId);
    expect(aPaper).toHaveLength(0);
    expect(bPaper).toHaveLength(1);

    for (const e of [a, b]) {
      await fx.admin.from("exam_questions").delete().eq("exam_id", e.examId);
      await fx.admin.from("exam_assignments").delete().eq("exam_id", e.examId);
      await fx.admin.from("exams").delete().eq("id", e.examId);
    }
  });

  it("unassigning the only centre makes the exam unpublishable again", async () => {
    const { examId, assignmentId } = await makeDraftExam();
    await hoCli.from("exams").update({ status: "published" }).eq("id", examId);

    // Back to draft first — the publish guard (migration 0022) only fires on
    // a transition INTO 'published', so it has to be re-entered to fire again.
    await hoCli.from("exams").update({ status: "draft" }).eq("id", examId);
    await hoCli.from("exam_assignments").delete().eq("id", assignmentId);

    const { error: publishAgain } = await hoCli
      .from("exams")
      .update({ status: "published" })
      .eq("id", examId);
    expect(publishAgain?.message).toMatch(/not be published/i);

    await fx.admin.from("exam_questions").delete().eq("exam_id", examId);
    await fx.admin.from("exams").delete().eq("id", examId);
  });

  it("a draft exam can be deleted outright; a published one cannot be, only cancelled", async () => {
    const draft = await makeDraftExam();
    const { error: deleteDraftErr, count: draftCount } = await hoCli
      .from("exams")
      .delete({ count: "exact" })
      .eq("id", draft.examId)
      .eq("status", "draft");
    expect(deleteDraftErr).toBeNull();
    expect(draftCount).toBe(1);

    const published = await makeDraftExam();
    await hoCli
      .from("exams")
      .update({ status: "published" })
      .eq("id", published.examId);

    const { error: deletePublishedErr, count: publishedCount } = await hoCli
      .from("exams")
      .delete({ count: "exact" })
      .eq("id", published.examId)
      .eq("status", "draft");
    // The `.eq("status", "draft")` guard is what the app's deleteExam() action
    // relies on — a published exam simply matches zero rows, no error, and is
    // left completely intact.
    expect(deletePublishedErr).toBeNull();
    expect(publishedCount).toBe(0);

    const { data: stillThere } = await fx.admin
      .from("exams")
      .select("status")
      .eq("id", published.examId)
      .single();
    expect(stillThere!.status).toBe("published");

    const { error: cancelErr } = await hoCli
      .from("exams")
      .update({ status: "cancelled" })
      .eq("id", published.examId);
    expect(cancelErr).toBeNull();

    await fx.admin
      .from("exam_questions")
      .delete()
      .eq("exam_id", published.examId);
    await fx.admin
      .from("exam_assignments")
      .delete()
      .eq("exam_id", published.examId);
    await fx.admin.from("exams").delete().eq("id", published.examId);
  });
});
