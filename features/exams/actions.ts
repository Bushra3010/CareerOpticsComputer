"use server";

import { revalidatePath } from "next/cache";

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
