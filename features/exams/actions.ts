"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/db/action";
import { callRpc } from "@/lib/db/rpc";

import { authorizeHeadOffice, getHeadOfficeContext } from "./access";
import { bankSchema, questionSchema } from "./schema";

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
