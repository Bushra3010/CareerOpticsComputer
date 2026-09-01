"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/db/action";
import { authorize } from "@/lib/permissions";
import { getCurrentCentreContext } from "@/features/centres/current-membership";

import { bankSchema, examSchema } from "./schema";
import type { ExamActionState } from "./actions";

/**
 * Exam authoring for a centre, as opposed to head office.
 *
 * Kept apart from `actions.ts` rather than branching inside it: those actions
 * resolve a head-office context and check `exam.manage`, and every one of them
 * would need a second path through it. The permissions differ too —
 * `exam.author` and `question.author` mean "my centre's own material" and
 * grant nothing across the organisation (migration 0056).
 *
 * Both writes set `centre_id`, which is what the RLS policies scope on. An
 * insert without it is an organisation-level row and is refused for a centre.
 */

async function centreContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const context = user
    ? await getCurrentCentreContext(supabase, user.id)
    : null;
  return { supabase, context, userId: user?.id ?? null };
}

function fieldErrorsFrom(issues: { path: PropertyKey[]; message: string }[]) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of issues) {
    const field = issue.path[0];
    if (typeof field === "string" && !fieldErrors[field]) {
      fieldErrors[field] = issue.message;
    }
  }
  return fieldErrors;
}

/**
 * `2026-08-10T14:30` typed by someone in Delhi means 14:30 IST, which is 09:00
 * UTC. `new Date(value)` would read it as the server's local time — a
 * five-and-a-half-hour error that only shows up when the server is not in
 * India, which is to say in production. Same reasoning as `actions.ts`.
 */
function istToUtc(local: string): string {
  return new Date(`${local}:00+05:30`).toISOString();
}

export async function createCentreQuestionBank(
  _prev: ExamActionState,
  formData: FormData,
): Promise<ExamActionState> {
  const { supabase, context, userId } = await centreContext();
  if (!context) {
    return { status: "error", message: "You do not have centre access." };
  }

  try {
    await authorize(
      supabase,
      "question.author",
      context.organizationId,
      context.centreId,
    );
  } catch (err) {
    // Distinct from the RLS refusal below on purpose. Both used to say the
    // same sentence, which made them indistinguishable from the outside — and
    // they have different causes and different fixes: this one is a missing
    // grant, that one is a policy the row does not satisfy.
    console.error("[exams] question.author denied:", {
      organizationId: context.organizationId,
      centreId: context.centreId,
      err,
    });
    return {
      status: "error",
      message:
        "Your role does not hold question.author at this centre. Head office grants it.",
    };
  }

  const parsed = bankSchema.safeParse({
    name: formData.get("name")?.toString() ?? "",
    description: formData.get("description")?.toString() ?? "",
  });
  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: fieldErrorsFrom(parsed.error.issues),
    };
  }

  const { error } = await supabase.from("question_banks").insert({
    organization_id: context.organizationId,
    centre_id: context.centreId,
    name: parsed.data.name,
    description: parsed.data.description || null,
    created_by: userId,
    updated_by: userId,
  });

  if (error) {
    console.error("[exams] question bank insert failed:", error);
    return {
      status: "error",
      message:
        error.code === "42501"
          ? "The database refused the question bank. Your permission is right, so this is the row-level policy — head office needs to look at it."
          : `Could not create the question bank (${error.code ?? "unknown"}).`,
    };
  }

  revalidatePath("/centre/exams");
  return { status: "success", message: "Question bank created." };
}

export async function createCentreExam(
  _prev: ExamActionState,
  formData: FormData,
): Promise<ExamActionState> {
  const { supabase, context, userId } = await centreContext();
  if (!context) {
    return { status: "error", message: "You do not have centre access." };
  }

  try {
    await authorize(
      supabase,
      "exam.author",
      context.organizationId,
      context.centreId,
    );
  } catch (err) {
    console.error("[exams] exam.author denied:", {
      organizationId: context.organizationId,
      centreId: context.centreId,
      err,
    });
    return {
      status: "error",
      message:
        "Your role does not hold exam.author at this centre. Head office grants it.",
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
    return {
      status: "error",
      fieldErrors: fieldErrorsFrom(parsed.error.issues),
    };
  }

  const { error } = await supabase.from("exams").insert({
    organization_id: context.organizationId,
    centre_id: context.centreId,
    bank_id: parsed.data.bankId,
    title: parsed.data.title,
    instructions: parsed.data.instructions || null,
    duration_minutes: parsed.data.durationMinutes,
    pass_percent: parsed.data.passPercent,
    max_attempts: parsed.data.maxAttempts,
    opens_at: istToUtc(parsed.data.opensAt),
    closes_at: istToUtc(parsed.data.closesAt),
    created_by: userId,
    updated_by: userId,
  });

  if (error) {
    // 0056's trigger refuses an exam whose bank belongs to a different centre.
    // The picker only offers this centre's banks, so this is a stale form or a
    // crafted request rather than an ordinary mistake — but it should still
    // read as something other than "unknown error".
    console.error("[exams] exam insert failed:", error);
    const sameCentre = error.message.includes("same centre");
    return {
      status: "error",
      message: sameCentre
        ? "That question bank belongs to another centre."
        : error.code === "42501"
          ? "The database refused the exam. Your permission is right, so this is the row-level policy — head office needs to look at it."
          : `Could not create the exam (${error.code ?? "unknown"}).`,
    };
  }

  revalidatePath("/centre/exams");
  return { status: "success", message: "Exam created as a draft." };
}
