import { createClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  anonKey,
  hasCredentials,
  PASSWORD,
  signIn,
  setupFixture,
  teardownFixture,
  url,
  type AnyClient,
  type Fixture,
} from "./fixtures";

/**
 * Attempts (migration 0024) — build plan R6.
 *
 * "Clock tampering, duplicate attempts, lost answers on flaky mobile
 * networks." Every test here is one of those three, plus the C8 grading
 * assumptions, which are assumptions rather than specified rules and therefore
 * need to be pinned down before somebody changes one by accident.
 */
describe.skipIf(!hasCredentials)("exam attempts", () => {
  let fx: Fixture;
  let studentCli: AnyClient;
  let otherStudentCli: AnyClient;
  let roleId: string;
  let bankId: string;
  let examId: string;
  let qSingle: string;
  let qMultiple: string;
  let qTrueFalse: string;
  /** option ids, so the tests can answer correctly and incorrectly on purpose */
  const opts: Record<string, { correct: string[]; wrong: string[] }> = {};

  const makeStudentLogin = async (studentId: string, tag: string) => {
    const email = `fx-sit-${tag}-${fx.suffix}@example.test`;
    const { data: created, error } = await fx.admin.auth.admin.createUser({
      email,
      password: PASSWORD,
      email_confirm: true,
    });
    if (error || !created.user)
      throw new Error(`student ${tag}: ${error?.message}`);
    fx.userIds.push(created.user.id);
    await fx.admin
      .from("profiles")
      .insert({ id: created.user.id, full_name: `Sitter ${tag}` });
    await fx.admin
      .from("students")
      .update({ user_id: created.user.id })
      .eq("id", studentId);
    const cli: AnyClient = createClient(url!, anonKey!);
    await signIn(cli, email, "sign-in");
    return cli;
  };

  const addQuestion = async (
    type: string,
    body: string,
    marks: number,
    negative: number,
    options: { body: string; ok: boolean }[],
  ) => {
    const { data: q } = await fx.admin
      .from("questions")
      .insert({
        bank_id: bankId,
        organization_id: fx.orgId,
        type,
        body,
        marks,
        negative_marks: negative,
        status: "active",
      })
      .select("id")
      .single();

    const { data: created } = await fx.admin
      .from("question_options")
      .insert(
        options.map((o, i) => ({
          question_id: q!.id,
          organization_id: fx.orgId,
          body: o.body,
          is_correct: o.ok,
          display_order: i + 1,
        })),
      )
      .select("id, is_correct");

    opts[q!.id] = {
      correct: (created ?? []).filter((o) => o.is_correct).map((o) => o.id),
      wrong: (created ?? []).filter((o) => !o.is_correct).map((o) => o.id),
    };
    return q!.id as string;
  };

  const openWindow = async (fromMinutes = -60, toMinutes = 60) => {
    const now = Date.now();
    await fx.admin
      .from("exams")
      .update({
        opens_at: new Date(now + fromMinutes * 60_000).toISOString(),
        closes_at: new Date(now + toMinutes * 60_000).toISOString(),
      })
      .eq("id", examId);
  };

  const clearAttempts = async () => {
    // student_results.attempt_id references exam_attempts (migration 0027), so
    // results recorded by a bridge test must go before the attempts can.
    const { data: ids } = await fx.admin
      .from("exam_attempts")
      .select("id")
      .eq("exam_id", examId);
    const attemptIds = (ids ?? []).map((a) => a.id);
    if (attemptIds.length) {
      await fx.admin
        .from("student_results")
        .delete()
        .in("attempt_id", attemptIds);
    }
    await fx.admin.from("exam_attempts").delete().eq("exam_id", examId);
  };

  beforeAll(async () => {
    fx = await setupFixture();

    const { data: role } = await fx.admin
      .from("roles")
      .insert({
        organization_id: fx.orgId,
        code: `exam_sit_${fx.suffix}`,
        name: "Exam Controller (sit)",
        is_system_role: false,
      })
      .select("id")
      .single();
    roleId = role!.id;

    const { data: bank } = await fx.admin
      .from("question_banks")
      .insert({
        organization_id: fx.orgId,
        name: `Sit bank ${fx.suffix}`,
        status: "active",
      })
      .select("id")
      .single();
    bankId = bank!.id;

    qSingle = await addQuestion("single_choice", "Single, 2 marks, -1", 2, 1, [
      { body: "Right", ok: true },
      { body: "Wrong", ok: false },
    ]);
    qMultiple = await addQuestion(
      "multiple_choice",
      "Multiple, 3 marks, -1",
      3,
      1,
      [
        { body: "A (correct)", ok: true },
        { body: "B (correct)", ok: true },
        { body: "C", ok: false },
      ],
    );
    qTrueFalse = await addQuestion(
      "true_false",
      "True/false, 1 mark, 0",
      1,
      0,
      [
        { body: "True", ok: true },
        { body: "False", ok: false },
      ],
    );

    const now = Date.now();
    const { data: exam } = await fx.admin
      .from("exams")
      .insert({
        organization_id: fx.orgId,
        bank_id: bankId,
        // The bridge joins attempts to publications through the course, so the
        // exam must carry the same course the fixture students are enrolled on.
        course_id: fx.courseId,
        title: `Sit exam ${fx.suffix}`,
        duration_minutes: 30,
        max_attempts: 1,
        opens_at: new Date(now - 3600_000).toISOString(),
        closes_at: new Date(now + 3600_000).toISOString(),
      })
      .select("id")
      .single();
    examId = exam!.id;

    let order = 0;
    for (const qid of [qSingle, qMultiple, qTrueFalse]) {
      order += 1;
      await fx.admin.from("exam_questions").insert({
        exam_id: examId,
        question_id: qid,
        organization_id: fx.orgId,
        display_order: order,
      });
    }
    await fx.admin.from("exam_assignments").insert({
      exam_id: examId,
      organization_id: fx.orgId,
      centre_id: fx.centreId,
    });
    await fx.admin
      .from("exams")
      .update({ status: "published" })
      .eq("id", examId);

    studentCli = await makeStudentLogin(fx.students[0].studentId, "a");
    otherStudentCli = await makeStudentLogin(fx.students[1].studentId, "b");
  }, 180_000);

  afterAll(async () => {
    if (!fx) return;
    await fx.admin.from("exams").delete().eq("id", examId);
    await fx.admin.from("question_banks").delete().eq("id", bankId);
    await fx.admin.from("roles").delete().eq("id", roleId);
    await teardownFixture(fx);
  }, 180_000);

  // --- R6: duplicate attempts ------------------------------------------------

  it("refreshing does not create a second attempt or move the deadline", async () => {
    await clearAttempts();

    const first = await studentCli.rpc("start_exam_attempt", {
      p_exam_id: examId,
    });
    expect(first.error).toBeNull();
    const a = (
      first.data as {
        attempt_id: string;
        deadline_at: string;
        resumed: boolean;
      }[]
    )[0];
    expect(a.resumed).toBe(false);

    const second = await studentCli.rpc("start_exam_attempt", {
      p_exam_id: examId,
    });
    const b = (
      second.data as {
        attempt_id: string;
        deadline_at: string;
        resumed: boolean;
      }[]
    )[0];

    // PRD §19.6, in one assertion.
    expect(b.attempt_id).toBe(a.attempt_id);
    expect(b.deadline_at).toBe(a.deadline_at);
    expect(b.resumed).toBe(true);

    const { count } = await fx.admin
      .from("exam_attempts")
      .select("id", { count: "exact", head: true })
      .eq("exam_id", examId);
    expect(count).toBe(1);
  });

  it("ten simultaneous starts still produce exactly one attempt", async () => {
    await clearAttempts();

    const results = await Promise.all(
      Array.from({ length: 10 }, () =>
        studentCli.rpc("start_exam_attempt", { p_exam_id: examId }),
      ),
    );
    const ids = new Set(
      results
        .map(
          (r) => (r.data as { attempt_id: string }[] | null)?.[0]?.attempt_id,
        )
        .filter(Boolean),
    );
    expect(ids.size).toBe(1);

    const { count } = await fx.admin
      .from("exam_attempts")
      .select("id", { count: "exact", head: true })
      .eq("exam_id", examId);
    expect(count).toBe(1);
  });

  // --- R6: clock -------------------------------------------------------------

  it("the deadline is the earlier of the duration and the exam's close", async () => {
    await clearAttempts();
    // Exam closes in ten minutes; duration is thirty. Ten wins.
    await openWindow(-60, 10);

    const { data } = await studentCli.rpc("start_exam_attempt", {
      p_exam_id: examId,
    });
    const deadline = Date.parse(
      (data as { deadline_at: string }[])[0].deadline_at,
    );
    const minutesLeft = (deadline - Date.now()) / 60_000;

    expect(minutesLeft).toBeGreaterThan(8);
    expect(minutesLeft).toBeLessThan(12);

    await openWindow();
  });

  it("a student cannot write their own attempt row", async () => {
    await clearAttempts();
    const { data } = await studentCli.rpc("start_exam_attempt", {
      p_exam_id: examId,
    });
    const attemptId = (data as { attempt_id: string }[])[0].attempt_id;

    // The whole reason attempts are written only by SECURITY DEFINER functions.
    const { error } = await studentCli
      .from("exam_attempts")
      .update({ deadline_at: new Date(Date.now() + 86_400_000).toISOString() })
      .eq("id", attemptId);
    expect(error?.code).toBe("42501");

    const { error: insertError } = await studentCli
      .from("exam_attempts")
      .insert({
        exam_id: examId,
        student_id: fx.students[0].studentId,
        organization_id: fx.orgId,
        centre_id: fx.centreId,
        deadline_at: new Date(Date.now() + 86_400_000).toISOString(),
      });
    expect(insertError?.code).toBe("42501");
  });

  it("an exam that has not opened cannot be started", async () => {
    await clearAttempts();
    await openWindow(60, 120);

    const { error } = await studentCli.rpc("start_exam_attempt", {
      p_exam_id: examId,
    });
    expect(error?.message).toMatch(/has not opened/i);

    await openWindow();
  });

  it("a student at an unassigned centre cannot start", async () => {
    await clearAttempts();
    await fx.admin.from("exam_assignments").delete().eq("exam_id", examId);

    const { error } = await studentCli.rpc("start_exam_attempt", {
      p_exam_id: examId,
    });
    expect(error?.message).toMatch(/not available at your centre/i);

    await fx.admin.from("exam_assignments").insert({
      exam_id: examId,
      organization_id: fx.orgId,
      centre_id: fx.centreId,
    });
  });

  it("the attempt limit is enforced", async () => {
    await clearAttempts();
    const { data } = await studentCli.rpc("start_exam_attempt", {
      p_exam_id: examId,
    });
    await studentCli.rpc("submit_exam_attempt", {
      p_attempt_id: (data as { attempt_id: string }[])[0].attempt_id,
    });

    const { error } = await studentCli.rpc("start_exam_attempt", {
      p_exam_id: examId,
    });
    expect(error?.message).toMatch(/all 1 attempts/i);
  });

  // --- R6: lost answers ------------------------------------------------------

  it("a stale save is discarded rather than overwriting a newer answer", async () => {
    await clearAttempts();
    const { data } = await studentCli.rpc("start_exam_attempt", {
      p_exam_id: examId,
    });
    const attemptId = (data as { attempt_id: string }[])[0].attempt_id;

    const save = (seq: number, optionId: string) =>
      studentCli.rpc("save_exam_answer", {
        p_attempt_id: attemptId,
        p_question_id: qSingle,
        p_answer: { option_id: optionId },
        p_client_seq: seq,
      });

    await save(5, opts[qSingle].correct[0]);
    // A retry from before, arriving late — the exact failure R6 names.
    const late = await save(2, opts[qSingle].wrong[0]);
    expect((late.data as { saved: boolean }[])[0].saved).toBe(false);

    const { data: stored } = await studentCli
      .from("exam_answers")
      .select("answer, client_seq")
      .eq("attempt_id", attemptId)
      .eq("question_id", qSingle)
      .single();
    expect((stored!.answer as { option_id: string }).option_id).toBe(
      opts[qSingle].correct[0],
    );
    expect(stored!.client_seq).toBe(5);
  });

  it("a question that is not on the paper is refused", async () => {
    await clearAttempts();
    const { data } = await studentCli.rpc("start_exam_attempt", {
      p_exam_id: examId,
    });

    const { error } = await studentCli.rpc("save_exam_answer", {
      p_attempt_id: (data as { attempt_id: string }[])[0].attempt_id,
      p_question_id: crypto.randomUUID(),
      p_answer: { option_id: crypto.randomUUID() },
      p_client_seq: 1,
    });
    expect(error?.message).toMatch(/not on this paper/i);
  });

  it("R05 — one student cannot read another's answers", async () => {
    await clearAttempts();
    const { data } = await studentCli.rpc("start_exam_attempt", {
      p_exam_id: examId,
    });
    const attemptId = (data as { attempt_id: string }[])[0].attempt_id;
    await studentCli.rpc("save_exam_answer", {
      p_attempt_id: attemptId,
      p_question_id: qSingle,
      p_answer: { option_id: opts[qSingle].correct[0] },
      p_client_seq: 1,
    });

    const { data: theirs } = await otherStudentCli
      .from("exam_answers")
      .select("id");
    expect(theirs ?? []).toHaveLength(0);

    const { error } = await otherStudentCli.rpc("save_exam_answer", {
      p_attempt_id: attemptId,
      p_question_id: qSingle,
      p_answer: { option_id: opts[qSingle].wrong[0] },
      p_client_seq: 99,
    });
    expect(error).not.toBeNull();
  });

  it("exam_events is insert-only, at the privilege level", async () => {
    const { data: event } = await fx.admin
      .from("exam_events")
      .select("id")
      .limit(1)
      .maybeSingle();
    if (!event) return;

    const { error: updateError } = await studentCli
      .from("exam_events")
      .update({ event_type: "heartbeat" })
      .eq("id", event.id);
    expect(updateError?.code).toBe("42501");

    const { error: deleteError } = await studentCli
      .from("exam_events")
      .delete()
      .eq("id", event.id);
    expect(deleteError?.code).toBe("42501");
  });

  // --- C8: the grading assumptions -------------------------------------------

  it("grades: right answers score, wrong ones take the negative, blanks take nothing", async () => {
    await clearAttempts();
    const { data } = await studentCli.rpc("start_exam_attempt", {
      p_exam_id: examId,
    });
    const attemptId = (data as { attempt_id: string }[])[0].attempt_id;

    // Single: correct        → +2
    // Multiple: both correct → +3
    // True/false: untouched  →  0  (C8(b): a blank takes no penalty)
    await studentCli.rpc("save_exam_answer", {
      p_attempt_id: attemptId,
      p_question_id: qSingle,
      p_answer: { option_id: opts[qSingle].correct[0] },
      p_client_seq: 1,
    });
    await studentCli.rpc("save_exam_answer", {
      p_attempt_id: attemptId,
      p_question_id: qMultiple,
      p_answer: { option_ids: opts[qMultiple].correct },
      p_client_seq: 1,
    });

    const { data: result } = await studentCli.rpc("submit_exam_attempt", {
      p_attempt_id: attemptId,
    });
    const r = (result as { score_marks: number; max_marks: number }[])[0];
    expect(r.score_marks).toBe(5);
    expect(r.max_marks).toBe(6);
  });

  it("C8(a) — a partially correct multiple-choice answer scores nothing", async () => {
    await clearAttempts();
    const { data } = await studentCli.rpc("start_exam_attempt", {
      p_exam_id: examId,
    });
    const attemptId = (data as { attempt_id: string }[])[0].attempt_id;

    // One of the two correct options. All-or-nothing, so this is wrong, and
    // wrong costs the negative mark.
    await studentCli.rpc("save_exam_answer", {
      p_attempt_id: attemptId,
      p_question_id: qMultiple,
      p_answer: { option_ids: [opts[qMultiple].correct[0]] },
      p_client_seq: 1,
    });
    await studentCli.rpc("save_exam_answer", {
      p_attempt_id: attemptId,
      p_question_id: qTrueFalse,
      p_answer: { option_id: opts[qTrueFalse].correct[0] },
      p_client_seq: 1,
    });

    const { data: result } = await studentCli.rpc("submit_exam_attempt", {
      p_attempt_id: attemptId,
    });
    // −1 for the partial multiple, +1 for true/false = 0.
    expect((result as { score_marks: number }[])[0].score_marks).toBe(0);
  });

  it("C8(c) — a cleared answer counts as blank, not as wrong", async () => {
    await clearAttempts();
    const { data } = await studentCli.rpc("start_exam_attempt", {
      p_exam_id: examId,
    });
    const attemptId = (data as { attempt_id: string }[])[0].attempt_id;

    // Answer, then change your mind and clear it. The row exists with `{}`.
    await studentCli.rpc("save_exam_answer", {
      p_attempt_id: attemptId,
      p_question_id: qSingle,
      p_answer: { option_id: opts[qSingle].wrong[0] },
      p_client_seq: 1,
    });
    await studentCli.rpc("save_exam_answer", {
      p_attempt_id: attemptId,
      p_question_id: qSingle,
      p_answer: {},
      p_client_seq: 2,
    });

    const { data: result } = await studentCli.rpc("submit_exam_attempt", {
      p_attempt_id: attemptId,
    });
    // Zero, not −1. The whole question this test exists for.
    expect((result as { score_marks: number }[])[0].score_marks).toBe(0);
  });

  it("C8(c) again — a JSON-null answer is blank, not wrong (regression)", async () => {
    // Found by an end-to-end sweep probe, not by this suite: the suite cleared
    // answers with `{}`, but a client clearing with `{"option_id": null}` was
    // graded as an attempted wrong answer, because in jsonb a JSON null is not
    // SQL NULL and the blank check fell through. Migration 0025. This pins the
    // shape the suite had missed.
    await clearAttempts();
    const { data } = await studentCli.rpc("start_exam_attempt", {
      p_exam_id: examId,
    });
    const attemptId = (data as { attempt_id: string }[])[0].attempt_id;

    // qSingle carries -1. Correct on true/false (+1), JSON-null on single.
    await studentCli.rpc("save_exam_answer", {
      p_attempt_id: attemptId,
      p_question_id: qSingle,
      p_answer: { option_id: null },
      p_client_seq: 1,
    });
    await studentCli.rpc("save_exam_answer", {
      p_attempt_id: attemptId,
      p_question_id: qTrueFalse,
      p_answer: { option_id: opts[qTrueFalse].correct[0] },
      p_client_seq: 1,
    });

    const { data: result } = await studentCli.rpc("submit_exam_attempt", {
      p_attempt_id: attemptId,
    });
    // +1 and a blank: 1. The bug scored it 0 (+1 − 1), which the zero floor
    // would NOT mask here.
    expect((result as { score_marks: number }[])[0].score_marks).toBe(1);
  });

  it("a negative total is floored at zero", async () => {
    await clearAttempts();
    const { data } = await studentCli.rpc("start_exam_attempt", {
      p_exam_id: examId,
    });
    const attemptId = (data as { attempt_id: string }[])[0].attempt_id;

    await studentCli.rpc("save_exam_answer", {
      p_attempt_id: attemptId,
      p_question_id: qSingle,
      p_answer: { option_id: opts[qSingle].wrong[0] },
      p_client_seq: 1,
    });
    await studentCli.rpc("save_exam_answer", {
      p_attempt_id: attemptId,
      p_question_id: qMultiple,
      p_answer: { option_ids: opts[qMultiple].wrong },
      p_client_seq: 1,
    });

    const { data: result } = await studentCli.rpc("submit_exam_attempt", {
      p_attempt_id: attemptId,
    });
    expect((result as { score_marks: number }[])[0].score_marks).toBe(0);
  });

  // --- submission ------------------------------------------------------------

  it("submitting twice is not an error and does not regrade", async () => {
    await clearAttempts();
    const { data } = await studentCli.rpc("start_exam_attempt", {
      p_exam_id: examId,
    });
    const attemptId = (data as { attempt_id: string }[])[0].attempt_id;
    await studentCli.rpc("save_exam_answer", {
      p_attempt_id: attemptId,
      p_question_id: qSingle,
      p_answer: { option_id: opts[qSingle].correct[0] },
      p_client_seq: 1,
    });

    const first = await studentCli.rpc("submit_exam_attempt", {
      p_attempt_id: attemptId,
    });
    const second = await studentCli.rpc("submit_exam_attempt", {
      p_attempt_id: attemptId,
    });

    expect(second.error).toBeNull();
    expect((second.data as { score_marks: number }[])[0].score_marks).toBe(
      (first.data as { score_marks: number }[])[0].score_marks,
    );
  });

  it("saving after the deadline is refused without being an error", async () => {
    await clearAttempts();
    const { data } = await studentCli.rpc("start_exam_attempt", {
      p_exam_id: examId,
    });
    const attemptId = (data as { attempt_id: string }[])[0].attempt_id;

    await fx.admin
      .from("exam_attempts")
      .update({ deadline_at: new Date(Date.now() - 1000).toISOString() })
      .eq("id", attemptId);

    const { data: saved, error } = await studentCli.rpc("save_exam_answer", {
      p_attempt_id: attemptId,
      p_question_id: qSingle,
      p_answer: { option_id: opts[qSingle].correct[0] },
      p_client_seq: 1,
    });
    // Not an exception: the client needs a shape it can act on, not a throw.
    expect(error).toBeNull();
    expect(
      (saved as { saved: boolean; remaining_seconds: number }[])[0].saved,
    ).toBe(false);
    expect(
      (saved as { remaining_seconds: number }[])[0].remaining_seconds,
    ).toBe(0);
  });

  it("the sweep auto-submits and grades an abandoned attempt", async () => {
    await clearAttempts();
    const { data } = await studentCli.rpc("start_exam_attempt", {
      p_exam_id: examId,
    });
    const attemptId = (data as { attempt_id: string }[])[0].attempt_id;
    await studentCli.rpc("save_exam_answer", {
      p_attempt_id: attemptId,
      p_question_id: qSingle,
      p_answer: { option_id: opts[qSingle].correct[0] },
      p_client_seq: 1,
    });

    await fx.admin
      .from("exam_attempts")
      .update({ deadline_at: new Date(Date.now() - 1000).toISOString() })
      .eq("id", attemptId);

    // Service role only — the sweep is the cron's, and `authenticated` has no
    // execute on it.
    const { data: swept } = await fx.admin.rpc("sweep_expired_exam_attempts", {
      p_limit: 50,
    });
    expect(swept as number).toBeGreaterThanOrEqual(1);

    const { data: after } = await fx.admin
      .from("exam_attempts")
      .select("status, score_marks, submitted_at")
      .eq("id", attemptId)
      .single();
    expect(after!.status).toBe("auto_submitted");
    expect(after!.score_marks).toBe(2);
    expect(after!.submitted_at).not.toBeNull();
  });

  it("a student cannot run the sweep", async () => {
    const { error } = await studentCli.rpc("sweep_expired_exam_attempts", {
      p_limit: 50,
    });
    expect(error).not.toBeNull();
  });

  it("a student sees their assigned exam, and the paper carries no answer key", async () => {
    // Before migration 0026 both of these failed silently: every exam policy
    // reached can_access_centre, which is membership-based, and a student has
    // students.user_id, not a membership. The runner would have rendered an
    // empty shell while the whole suite stayed green.
    await clearAttempts();

    const { data: visible } = await studentCli
      .from("exams")
      .select("id, title")
      .eq("id", examId);
    expect(visible).toHaveLength(1);

    const { data } = await studentCli.rpc("start_exam_attempt", {
      p_exam_id: examId,
    });
    const attemptId = (data as { attempt_id: string }[])[0].attempt_id;

    const { data: paper, error } = await studentCli.rpc("get_attempt_paper", {
      p_attempt_id: attemptId,
    });
    expect(error).toBeNull();
    const rows = paper as {
      question_id: string;
      body: string;
      options: { id: string; body: string }[];
    }[];
    expect(rows).toHaveLength(3);

    // The sanitisation is the point: no is_correct anywhere in the payload,
    // not as a key and not as a value smuggled into option objects.
    expect(JSON.stringify(paper)).not.toContain("is_correct");
    expect(
      rows.every((q) => q.options.every((o) => "id" in o && "body" in o)),
    ).toBe(true);
  });

  it("another student cannot fetch someone else's paper", async () => {
    await clearAttempts();
    const { data } = await studentCli.rpc("start_exam_attempt", {
      p_exam_id: examId,
    });

    const { error } = await otherStudentCli.rpc("get_attempt_paper", {
      p_attempt_id: (data as { attempt_id: string }[])[0].attempt_id,
    });
    expect(error).not.toBeNull();
  });

  it("C7-A — a graded attempt lands in the term publication with traceability", async () => {
    await clearAttempts();
    const { data } = await studentCli.rpc("start_exam_attempt", {
      p_exam_id: examId,
    });
    const attemptId = (data as { attempt_id: string }[])[0].attempt_id;
    await studentCli.rpc("save_exam_answer", {
      p_attempt_id: attemptId,
      p_question_id: qSingle,
      p_answer: { option_id: opts[qSingle].correct[0] },
      p_client_seq: 1,
    });
    await studentCli.rpc("submit_exam_attempt", { p_attempt_id: attemptId });
    // 2 of 6 = 33% against a 40% pass mark: a deliberate fail, so the outcome
    // computation is visible rather than everything happening to pass.

    const { data: pub, error: pubError } = await fx.owner.cli
      .from("result_publications")
      .insert({
        organization_id: fx.orgId,
        centre_id: fx.centreId,
        course_id: fx.courseId,
        term_label: `Bridge ${fx.suffix}`,
      })
      .select("id")
      .single();
    expect(pubError).toBeNull();

    const { data: imported, error } = await fx.owner.cli.rpc(
      "import_attempt_results",
      { p_publication_id: pub!.id },
    );
    expect(error).toBeNull();
    expect(imported as number).toBe(1);

    const { data: rows } = await fx.owner.cli
      .from("student_results")
      .select("obtained_marks, max_marks, outcome, attempt_id")
      .eq("publication_id", pub!.id);
    expect(rows).toHaveLength(1);
    expect(rows![0].obtained_marks).toBe(2);
    expect(rows![0].max_marks).toBe(6);
    expect(rows![0].outcome).toBe("fail");
    expect(rows![0].attempt_id).toBe(attemptId);

    // The attempt's lifecycle closes: submitted -> evaluated.
    const { data: after } = await fx.admin
      .from("exam_attempts")
      .select("status")
      .eq("id", attemptId)
      .single();
    expect(after!.status).toBe("evaluated");

    await fx.admin
      .from("student_results")
      .delete()
      .eq("publication_id", pub!.id);
    await fx.admin.from("result_publications").delete().eq("id", pub!.id);
  });

  it("the bridge is idempotent, refuses the unauthorised, and locks after publish", async () => {
    await clearAttempts();
    const { data } = await studentCli.rpc("start_exam_attempt", {
      p_exam_id: examId,
    });
    const attemptId = (data as { attempt_id: string }[])[0].attempt_id;
    await studentCli.rpc("save_exam_answer", {
      p_attempt_id: attemptId,
      p_question_id: qSingle,
      p_answer: { option_id: opts[qSingle].correct[0] },
      p_client_seq: 1,
    });
    await studentCli.rpc("submit_exam_attempt", { p_attempt_id: attemptId });

    const { data: pub } = await fx.owner.cli
      .from("result_publications")
      .insert({
        organization_id: fx.orgId,
        centre_id: fx.centreId,
        course_id: fx.courseId,
        term_label: `Bridge2 ${fx.suffix}`,
      })
      .select("id")
      .single();

    // An accountant holds no result.manage; importing marks IS mark entry.
    const { error: denied } = await fx.accountant.cli.rpc(
      "import_attempt_results",
      { p_publication_id: pub!.id },
    );
    expect(denied).not.toBeNull();

    const first = await fx.owner.cli.rpc("import_attempt_results", {
      p_publication_id: pub!.id,
    });
    const second = await fx.owner.cli.rpc("import_attempt_results", {
      p_publication_id: pub!.id,
    });
    expect(first.error).toBeNull();
    expect(second.error).toBeNull();

    const { count } = await fx.admin
      .from("student_results")
      .select("id", { count: "exact", head: true })
      .eq("publication_id", pub!.id);
    expect(count).toBe(1);

    await fx.owner.cli.rpc("publish_results", { p_publication_id: pub!.id });
    const { error: locked } = await fx.owner.cli.rpc("import_attempt_results", {
      p_publication_id: pub!.id,
    });
    expect(locked?.message).toMatch(/already published/i);

    // A published publication is immutable to users by design, so the service
    // role clears it — results first, because of the attempt FK.
    await fx.admin
      .from("student_results")
      .delete()
      .eq("publication_id", pub!.id);
    await fx.admin.from("result_publications").delete().eq("id", pub!.id);
  });

  it("the heartbeat reports the server's clock, not the client's", async () => {
    await clearAttempts();
    const { data } = await studentCli.rpc("start_exam_attempt", {
      p_exam_id: examId,
    });
    const attemptId = (data as { attempt_id: string }[])[0].attempt_id;

    const { data: beat } = await studentCli.rpc("exam_attempt_heartbeat", {
      p_attempt_id: attemptId,
    });
    const b = (beat as { remaining_seconds: number; status: string }[])[0];
    expect(b.status).toBe("in_progress");
    expect(b.remaining_seconds).toBeGreaterThan(1700);
    expect(b.remaining_seconds).toBeLessThanOrEqual(1800);
  });

  it("focus changes are recorded and nothing else happens", async () => {
    await clearAttempts();
    const { data } = await studentCli.rpc("start_exam_attempt", {
      p_exam_id: examId,
    });
    const attemptId = (data as { attempt_id: string }[])[0].attempt_id;

    await studentCli.rpc("record_exam_event", {
      p_attempt_id: attemptId,
      p_event: "focus_lost",
    });

    // PRD §7.7: a signal only. The attempt is untouched.
    const { data: attempt } = await fx.admin
      .from("exam_attempts")
      .select("status")
      .eq("id", attemptId)
      .single();
    expect(attempt!.status).toBe("in_progress");

    const { count } = await fx.admin
      .from("exam_events")
      .select("id", { count: "exact", head: true })
      .eq("attempt_id", attemptId)
      .eq("event_type", "focus_lost");
    expect(count).toBe(1);
  });

  it("a client cannot forge a submission event", async () => {
    await clearAttempts();
    const { data } = await studentCli.rpc("start_exam_attempt", {
      p_exam_id: examId,
    });

    const { error } = await studentCli.rpc("record_exam_event", {
      p_attempt_id: (data as { attempt_id: string }[])[0].attempt_id,
      p_event: "submitted",
    });
    expect(error?.message).toMatch(/not client-reportable/i);
  });
});
