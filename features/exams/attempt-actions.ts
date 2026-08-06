"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/db/action";
import { callRpc } from "@/lib/db/rpc";

export interface StartExamState {
  status: "idle" | "error";
  message?: string;
}

/**
 * Starts (or resumes) an attempt and lands in the runner.
 *
 * All the eligibility logic lives in start_exam_attempt — assignment, window,
 * operational centre, attempt limit, and the idempotent resume. This action
 * only translates its refusals into sentences and its success into a redirect,
 * which is why it has no authorize() call of its own: the function's
 * `student_id = app.current_student_id()` check is the authorisation, and a
 * second app-layer copy of those rules would be a second thing to get wrong.
 */
export async function startExam(
  examId: string,
  _prev: StartExamState,
  _formData: FormData,
): Promise<StartExamState> {
  const supabase = await createClient();

  const { data, error } = await callRpc(supabase, "start_exam_attempt", {
    p_exam_id: examId,
  });

  if (error) {
    return {
      status: "error",
      // The function's messages are written for students; strip the Postgres
      // "P0001:" prefix noise and pass them through.
      message:
        error.message.replace(/^.*?:\s*/, "") || "Could not start the exam.",
    };
  }

  const attempt = (data as { attempt_id: string }[] | null)?.[0];
  if (!attempt) {
    return { status: "error", message: "Could not start the exam." };
  }

  redirect(`/exam/${attempt.attempt_id}`);
}
