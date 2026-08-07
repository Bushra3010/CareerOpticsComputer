"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/db/action";
import { callRpc } from "@/lib/db/rpc";

import { authorizeHeadOffice, getHeadOfficeContext } from "./access";
import { bankSchema, examSchema, questionSchema } from "./schema";

export interface ExamActionState {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string>;
}

export async function createQuestionBank(
  _prev: ExamActionState,
  formData: FormData,
): Promise<ExamActionState> {
  const supabase = await createClient();
  const context = await getHeadOfficeContext(supabase);
  if (!context) {
    return { status: "error", message: "You do not have head-office access." };
  }

  try {
    await authorizeHeadOffice(supabase, context, "question.manage");
  } catch {
    return {
      status: "error",
      message: "You do not have permission to manage question banks.",
    };
  }

  const parsed = bankSchema.safeParse({
    name: formData.get("name")?.toString() ?? "",
    description: formData.get("description")?.toString() ?? "",
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { status: "error", fieldErrors };
  }

  const { error } = await supabase.from("question_banks").insert({
    organization_id: context.organizationId,
    name: parsed.data.name,
    description: parsed.data.description || null,
    created_by: context.userId,
    updated_by: context.userId,
  });

  if (error) {
    // 23505 is the case-insensitive unique index on (organization_id, name).
    // Worth its own message: "could not save" would send someone hunting.
    return {
      status: "error",
      message:
        error.code === "23505"
          ? "A bank with that name already exists."
          : "Could not create the bank. Please try again.",
    };
  }

  revalidatePath("/admin/exams/question-banks");
  return { status: "success", message: "Bank created." };
}

export async function createQuestion(
  bankId: string,
  _prev: ExamActionState,
  formData: FormData,
): Promise<ExamActionState> {
  const supabase = await createClient();
  const context = await getHeadOfficeContext(supabase);
  if (!context) {
    return { status: "error", message: "You do not have head-office access." };
  }

  try {
    await authorizeHeadOffice(supabase, context, "question.manage");
  } catch {
    return {
      status: "error",
      message: "You do not have permission to manage questions.",
    };
  }

  // Options arrive as parallel `option[]` / `correct[]` fields. Checkbox inputs
  // only submit when checked, so the correct set is read by index rather than
  // by position in a list that would be missing entries.
  const bodies = formData.getAll("option").map((v) => v.toString());
  const checked = new Set(formData.getAll("correct").map((v) => v.toString()));
  const options = bodies
    .map((body, index) => ({
      body: body.trim(),
      is_correct: checked.has(String(index)),
    }))
    .filter((o) => o.body.length > 0);

  const parsed = questionSchema.safeParse({
    type: formData.get("type")?.toString() ?? "",
    body: formData.get("body")?.toString() ?? "",
    marks: formData.get("marks")?.toString() ?? "1",
    negativeMarks: formData.get("negativeMarks")?.toString() ?? "0",
    difficulty: formData.get("difficulty")?.toString() ?? "medium",
    explanation: formData.get("explanation")?.toString() ?? "",
    options,
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { status: "error", fieldErrors };
  }

  const { data: question, error } = await supabase
    .from("questions")
    .insert({
      bank_id: bankId,
      organization_id: context.organizationId,
      type: parsed.data.type,
      body: parsed.data.body,
      marks: parsed.data.marks,
      negative_marks: parsed.data.negativeMarks,
      difficulty: parsed.data.difficulty,
      explanation: parsed.data.explanation || null,
      status: "active",
      created_by: context.userId,
      updated_by: context.userId,
    })
    .select("id")
    .single();

  if (error || !question) {
    return { status: "error", message: "Could not save the question." };
  }

  // Options go through the function because the privilege grant on
  // question_options withholds INSERT — see migration 0021, proof R19.
  const { error: optionsError } = await callRpc(
    supabase,
    "save_question_options",
    {
      p_question_id: question.id,
      p_options: parsed.data.options,
    },
  );

  if (optionsError) {
    // The question exists but has no usable options, which is not a question.
    // Remove it rather than leave a half-built row in the bank.
    await supabase.from("questions").delete().eq("id", question.id);
    return {
      status: "error",
      message:
        optionsError.message.replace(/^.*:\s*/, "") ||
        "Could not save the options.",
    };
  }

  revalidatePath(`/admin/exams/question-banks/${bankId}`);
  return { status: "success", message: "Question added." };
}

export async function createExam(
  _prev: ExamActionState,
  formData: FormData,
): Promise<ExamActionState> {
  const supabase = await createClient();
  const context = await getHeadOfficeContext(supabase);
  if (!context) {
    return { status: "error", message: "You do not have head-office access." };
  }
  try {
    await authorizeHeadOffice(supabase, context, "exam.manage");
  } catch {
    return {
      status: "error",
      message: "You do not have permission to create exams.",
    };
  }

  const parsed = examSchema.safeParse({
    bankId: formData.get("bankId")?.toString() ?? "",
    title: formData.get("title")?.toString() ?? "",
    instructions: formData.get("instructions")?.toString() ?? "",
    durationMinutes: formData.get("durationMinutes")?.toString() ?? "30",
    passPercent: formData.get("passPercent")?.toString() ?? "40",
    maxAttempts: formData.get("maxAttempts")?.toString() ?? "1",
    opensAt: formData.get("opensAt")?.toString() ?? "",
    closesAt: formData.get("closesAt")?.toString() ?? "",
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { status: "error", fieldErrors };
  }

  const { error } = await supabase.from("exams").insert({
    organization_id: context.organizationId,
    bank_id: parsed.data.bankId,
    title: parsed.data.title,
    instructions: parsed.data.instructions || null,
    duration_minutes: parsed.data.durationMinutes,
    pass_percent: parsed.data.passPercent,
    max_attempts: parsed.data.maxAttempts,
    // `datetime-local` has no timezone. The person filling it in is working in
    // IST, so it is read as IST rather than as the server's idea of local time.
    opens_at: istToUtc(parsed.data.opensAt),
    closes_at: istToUtc(parsed.data.closesAt),
    created_by: context.userId,
    updated_by: context.userId,
  });

  if (error) {
    return { status: "error", message: "Could not create the exam." };
  }

  revalidatePath("/admin/exams");
  return { status: "success", message: "Exam created." };
}

/**
 * `2026-08-10T14:30` typed by someone in Delhi means 14:30 IST, which is
 * 09:00 UTC. `new Date(value)` would read it as the server's local time — a
 * five-and-a-half-hour error that only shows up when the server is not in
 * India, which is to say in production.
 */
function istToUtc(local: string): string {
  return new Date(`${local}:00+05:30`).toISOString();
}

export async function addQuestionToExam(
  examId: string,
  _prev: ExamActionState,
  formData: FormData,
): Promise<ExamActionState> {
  const supabase = await createClient();
  const context = await getHeadOfficeContext(supabase);
  if (!context) return { status: "error", message: "No head-office access." };
  try {
    await authorizeHeadOffice(supabase, context, "exam.manage");
  } catch {
    return { status: "error", message: "You cannot edit this exam." };
  }

  const questionId = formData.get("questionId")?.toString();
  if (!questionId) return { status: "error", message: "Choose a question." };

  const { count } = await supabase
    .from("exam_questions")
    .select("id", { count: "exact", head: true })
    .eq("exam_id", examId);

  const { error } = await supabase.from("exam_questions").insert({
    exam_id: examId,
    question_id: questionId,
    organization_id: context.organizationId,
    display_order: (count ?? 0) + 1,
  });

  if (error) {
    return {
      status: "error",
      message:
        error.code === "23505"
          ? "That question is already on this paper."
          : "Could not add the question.",
    };
  }

  revalidatePath(`/admin/exams/${examId}`);
  return { status: "success", message: "Added to the paper." };
}

export async function assignExamToCentre(
  examId: string,
  _prev: ExamActionState,
  formData: FormData,
): Promise<ExamActionState> {
  const supabase = await createClient();
  const context = await getHeadOfficeContext(supabase);
  if (!context) return { status: "error", message: "No head-office access." };
  try {
    await authorizeHeadOffice(supabase, context, "exam.manage");
  } catch {
    return { status: "error", message: "You cannot assign this exam." };
  }

  const centreId = formData.get("centreId")?.toString();
  if (!centreId) return { status: "error", message: "Choose a centre." };

  const { error } = await supabase.from("exam_assignments").insert({
    exam_id: examId,
    organization_id: context.organizationId,
    centre_id: centreId,
    created_by: context.userId,
  });

  if (error) {
    return {
      status: "error",
      message:
        error.code === "23505"
          ? "That centre is already assigned."
          : "Could not assign the centre.",
    };
  }

  revalidatePath(`/admin/exams/${examId}`);
  return { status: "success", message: "Centre assigned." };
}

export async function publishExam(
  examId: string,
  _prev: ExamActionState,
  _formData: FormData,
): Promise<ExamActionState> {
  const supabase = await createClient();
  const context = await getHeadOfficeContext(supabase);
  if (!context) return { status: "error", message: "No head-office access." };
  try {
    await authorizeHeadOffice(supabase, context, "exam.manage");
  } catch {
    return { status: "error", message: "You cannot publish this exam." };
  }

  const { error } = await supabase
    .from("exams")
    .update({ status: "published", updated_by: context.userId })
    .eq("id", examId);

  if (error) {
    // The database refuses an empty or unassigned paper (migration 0022's
    // publish guard). Its message is the useful one, so it is passed through
    // rather than replaced with something vaguer.
    return {
      status: "error",
      message: error.message.replace(/^.*:\s*/, ""),
    };
  }

  revalidatePath(`/admin/exams/${examId}`);
  return { status: "success", message: "Published." };
}

/**
 * Cancelling, not deleting. `exam_attempts.exam_id` cascades from `exams`
 * (migration 0024), so a hard delete on a published exam with attempts would
 * silently destroy student answers and scores that had not yet been imported
 * into a result — a UI action must never be able to trigger that. `cancelled`
 * is the safe terminal state the enum already carries.
 */
export async function cancelExam(
  examId: string,
  _prev: ExamActionState,
  _formData: FormData,
): Promise<ExamActionState> {
  const supabase = await createClient();
  const context = await getHeadOfficeContext(supabase);
  if (!context) return { status: "error", message: "No head-office access." };
  try {
    await authorizeHeadOffice(supabase, context, "exam.manage");
  } catch {
    return { status: "error", message: "You cannot cancel this exam." };
  }

  const { error } = await supabase
    .from("exams")
    .update({ status: "cancelled", updated_by: context.userId })
    .eq("id", examId);

  if (error) {
    return { status: "error", message: "Could not cancel the exam." };
  }

  revalidatePath(`/admin/exams/${examId}`);
  revalidatePath("/admin/exams");
  return { status: "success", message: "Exam cancelled." };
}

/**
 * Removes a question from a paper. Only meaningful before the window opens —
 * exam_questions_read is time-windowed (proof R18) and this action's own
 * `exam.manage` requirement already means the caller could see the paper
 * regardless, so there is nothing further to gate on the window here.
 */
export async function removeQuestionFromExam(
  examId: string,
  examQuestionId: string,
  _prev: ExamActionState,
  _formData: FormData,
): Promise<ExamActionState> {
  const supabase = await createClient();
  const context = await getHeadOfficeContext(supabase);
  if (!context) return { status: "error", message: "No head-office access." };
  try {
    await authorizeHeadOffice(supabase, context, "exam.manage");
  } catch {
    return { status: "error", message: "You cannot edit this exam." };
  }

  const { error } = await supabase
    .from("exam_questions")
    .delete()
    .eq("id", examQuestionId);

  if (error) {
    return { status: "error", message: "Could not remove the question." };
  }

  revalidatePath(`/admin/exams/${examId}`);
  return { status: "success", message: "Removed from the paper." };
}

export async function unassignCentreFromExam(
  examId: string,
  assignmentId: string,
  _prev: ExamActionState,
  _formData: FormData,
): Promise<ExamActionState> {
  const supabase = await createClient();
  const context = await getHeadOfficeContext(supabase);
  if (!context) return { status: "error", message: "No head-office access." };
  try {
    await authorizeHeadOffice(supabase, context, "exam.manage");
  } catch {
    return { status: "error", message: "You cannot edit this exam." };
  }

  const { error } = await supabase
    .from("exam_assignments")
    .delete()
    .eq("id", assignmentId);

  if (error) {
    return { status: "error", message: "Could not unassign the centre." };
  }

  revalidatePath(`/admin/exams/${examId}`);
  return { status: "success", message: "Centre unassigned." };
}

/**
 * Retires a question bank rather than deleting it. `question_banks_write`
 * permits DELETE at the RLS level, but a bank referenced by any exam's paper
 * would fail on the FK from exam_questions with a raw Postgres error the UI
 * has no business surfacing — `retired` is the status the enum already
 * carries for exactly this, matching how courses are archived rather than
 * dropped.
 */
export async function retireQuestionBank(
  bankId: string,
  _prev: ExamActionState,
  _formData: FormData,
): Promise<ExamActionState> {
  const supabase = await createClient();
  const context = await getHeadOfficeContext(supabase);
  if (!context) return { status: "error", message: "No head-office access." };
  try {
    await authorizeHeadOffice(supabase, context, "question.manage");
  } catch {
    return { status: "error", message: "You cannot retire this bank." };
  }

  const { error } = await supabase
    .from("question_banks")
    .update({ status: "retired", updated_by: context.userId })
    .eq("id", bankId);

  if (error) {
    return { status: "error", message: "Could not retire the bank." };
  }

  revalidatePath("/admin/exams/question-banks");
  return { status: "success", message: "Bank retired." };
}

export async function activateQuestionBank(
  bankId: string,
  _prev: ExamActionState,
  _formData: FormData,
): Promise<ExamActionState> {
  const supabase = await createClient();
  const context = await getHeadOfficeContext(supabase);
  if (!context) return { status: "error", message: "No head-office access." };
  try {
    await authorizeHeadOffice(supabase, context, "question.manage");
  } catch {
    return { status: "error", message: "You cannot activate this bank." };
  }

  const { error } = await supabase
    .from("question_banks")
    .update({ status: "active", updated_by: context.userId })
    .eq("id", bankId);

  if (error) {
    return { status: "error", message: "Could not activate the bank." };
  }

  revalidatePath("/admin/exams/question-banks");
  return { status: "success", message: "Bank active." };
}

export async function retireQuestion(
  bankId: string,
  questionId: string,
  _prev: ExamActionState,
  _formData: FormData,
): Promise<ExamActionState> {
  const supabase = await createClient();
  const context = await getHeadOfficeContext(supabase);
  if (!context) return { status: "error", message: "No head-office access." };
  try {
    await authorizeHeadOffice(supabase, context, "question.manage");
  } catch {
    return { status: "error", message: "You cannot retire this question." };
  }

  const { error } = await supabase
    .from("questions")
    .update({ status: "retired", updated_by: context.userId })
    .eq("id", questionId);

  if (error) {
    return { status: "error", message: "Could not retire the question." };
  }

  revalidatePath(`/admin/exams/question-banks/${bankId}`);
  return { status: "success", message: "Question retired." };
}

/**
 * Hard delete, but only ever reachable for a draft. `start_exam_attempt`
 * requires `status = 'published'` (migration 0024), so a draft exam
 * provably has no attempts and nothing downstream to protect — the CASCADE
 * on exam_attempts.exam_id that makes deleting a published exam dangerous
 * cannot fire on one that never went live. A published exam is cancelled,
 * never deleted; see `cancelExam`.
 */
export async function deleteExam(
  examId: string,
  _prev: ExamActionState,
  _formData: FormData,
): Promise<ExamActionState> {
  const supabase = await createClient();
  const context = await getHeadOfficeContext(supabase);
  if (!context) return { status: "error", message: "No head-office access." };
  try {
    await authorizeHeadOffice(supabase, context, "exam.manage");
  } catch {
    return { status: "error", message: "You cannot delete this exam." };
  }

  const { error } = await supabase
    .from("exams")
    .delete()
    .eq("id", examId)
    .eq("status", "draft");

  if (error) {
    return { status: "error", message: "Could not delete the exam." };
  }

  revalidatePath("/admin/exams");
  redirect("/admin/exams");
}
