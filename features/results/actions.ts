"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/db/action";
import { callRpc } from "@/lib/db/rpc";
import { authorize } from "@/lib/permissions";
import { getCurrentCentreContext } from "@/features/centres/current-membership";

export interface ResultActionState {
  status: "idle" | "error" | "success";
  message?: string;
}

const createSchema = z.object({
  courseId: z.uuid("Select a course"),
  termLabel: z.string().trim().min(1, "Enter a term label").max(60),
});

async function centreContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." as const };

  const context = await getCurrentCentreContext(supabase, user.id);
  if (!context) return { error: "No active centre membership found." as const };

  try {
    await authorize(
      supabase,
      "result.manage",
      context.organizationId,
      context.centreId,
    );
  } catch {
    return { error: "You do not have permission to manage results." as const };
  }
  return { supabase, context };
}

export async function createPublication(
  _prev: ResultActionState,
  formData: FormData,
): Promise<ResultActionState> {
  const ctx = await centreContext();
  if ("error" in ctx) return { status: "error", message: ctx.error };

  const parsed = createSchema.safeParse({
    courseId: formData.get("courseId")?.toString() ?? "",
    termLabel: formData.get("termLabel")?.toString() ?? "",
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Check the form.",
    };
  }

  // Version is one past the highest existing version for this
  // centre+course+term. The unique index on (centre, course, term, version) is
  // the real guarantee — this read only picks the next number.
  const { data: existing } = await ctx.supabase
    .from("result_publications")
    .select("version")
    .eq("centre_id", ctx.context.centreId)
    .eq("course_id", parsed.data.courseId)
    .eq("term_label", parsed.data.termLabel)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await ctx.supabase.from("result_publications").insert({
    organization_id: ctx.context.organizationId,
    centre_id: ctx.context.centreId,
    course_id: parsed.data.courseId,
    term_label: parsed.data.termLabel,
    version: (existing?.version ?? 0) + 1,
  });

  if (error) {
    // The single-draft partial index is the likely cause, and saying so is
    // more useful than "something went wrong".
    return {
      status: "error",
      message: error.message.includes("result_publications_single_draft_idx")
        ? "There is already an unpublished result set for this course and term."
        : "Could not create the result set.",
    };
  }

  revalidatePath("/centre/results");
  return { status: "success", message: "Result set created." };
}

export async function saveMarks(
  publicationId: string,
  _prev: ResultActionState,
  formData: FormData,
): Promise<ResultActionState> {
  const ctx = await centreContext();
  if ("error" in ctx) return { status: "error", message: ctx.error };

  const maxMarks = Number(formData.get("maxMarks"));
  if (!Number.isInteger(maxMarks) || maxMarks <= 0) {
    return {
      status: "error",
      message: "Enter a whole number for maximum marks.",
    };
  }

  const entries = [...formData.entries()].filter(([k]) =>
    k.startsWith("mark_"),
  );
  let saved = 0;

  for (const [key, value] of entries) {
    const raw = value.toString().trim();
    if (raw === "") continue; // blank means "not marked yet", not zero

    const obtained = Number(raw);
    if (!Number.isInteger(obtained) || obtained < 0 || obtained > maxMarks) {
      return {
        status: "error",
        message: `Marks must be whole numbers between 0 and ${maxMarks}.`,
      };
    }

    const { error } = await callRpc(ctx.supabase, "record_student_result", {
      p_publication_id: publicationId,
      p_enrolment_id: key.replace("mark_", ""),
      p_max_marks: maxMarks,
      p_obtained_marks: obtained,
    });

    if (error) {
      return {
        status: "error",
        message: "Could not save marks. Please try again.",
      };
    }
    saved += 1;
  }

  if (saved === 0) {
    return {
      status: "error",
      message: "Enter marks for at least one student.",
    };
  }

  revalidatePath(`/centre/results/${publicationId}`);
  revalidatePath("/centre/results");
  return { status: "success", message: `Saved marks for ${saved} student(s).` };
}

export async function publishPublication(
  publicationId: string,
  _prev: ResultActionState,
  _formData: FormData,
): Promise<ResultActionState> {
  const ctx = await centreContext();
  if ("error" in ctx) return { status: "error", message: ctx.error };

  const { error } = await callRpc(ctx.supabase, "publish_results", {
    p_publication_id: publicationId,
  });

  if (error) {
    const known = ["already published", "no marks in it"].find((m) =>
      error.message?.includes(m),
    );
    return {
      status: "error",
      message: known
        ? error.message.replace(/^.*?:\s*/, "")
        : "Could not publish these results.",
    };
  }

  revalidatePath(`/centre/results/${publicationId}`);
  revalidatePath("/centre/results");
  revalidatePath("/student");
  return {
    status: "success",
    message: "Results published. Students can now see them.",
  };
}

export async function importAttemptResults(
  publicationId: string,
  _prev: ResultActionState,
  _formData: FormData,
): Promise<ResultActionState> {
  const ctx = await centreContext();
  if ("error" in ctx) return { status: "error", message: ctx.error };

  const { data, error } = await callRpc(
    ctx.supabase,
    "import_attempt_results",
    {
      p_publication_id: publicationId,
    },
  );

  if (error) {
    return {
      status: "error",
      message:
        error.message.replace(/^.*?:\s*/, "") ||
        "Could not import exam results.",
    };
  }

  const imported = typeof data === "number" ? data : 0;
  revalidatePath(`/centre/results/${publicationId}`);
  return {
    status: "success",
    message:
      imported === 0
        ? "No graded exam attempts found for this course yet."
        : `Imported ${imported} ${imported === 1 ? "result" : "results"} from exam attempts.`,
  };
}
