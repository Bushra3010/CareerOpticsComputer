"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/db/action";
import { callRpc } from "@/lib/db/rpc";

export interface IssueState {
  status: "idle" | "error" | "success";
  message?: string;
  number?: string;
}

/**
 * issue_certificate is SECURITY DEFINER and performs its own permission and
 * eligibility checks (published result, not a fail, one live certificate per
 * result), so this action deliberately does not duplicate them — a second,
 * drifting copy of those rules in TypeScript would be worse than none.
 */
export async function issueCertificate(
  studentResultId: string,
  publicationId: string,
  _prev: IssueState,
  _formData: FormData,
): Promise<IssueState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "You must be signed in." };

  const { data, error } = await callRpc(supabase, "issue_certificate", {
    p_student_result_id: studentResultId,
  });

  if (error) {
    const known = ["Not permitted", "unpublished", "failed result"].find((m) =>
      error.message?.includes(m),
    );
    return {
      status: "error",
      message: known
        ? error.message.replace(/^.*?:\s*/, "")
        : "Could not issue the certificate.",
    };
  }

  revalidatePath(`/centre/results/${publicationId}`);
  return { status: "success", number: String(data) };
}
