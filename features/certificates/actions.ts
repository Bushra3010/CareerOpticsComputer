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

export interface RevokeCertificateState {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string>;
}

/**
 * `revoke_certificate` (migration 0029) carries its own authorisation —
 * platform admin, or `certificate.revoke` at the document's centre. This
 * action's job is the readable error and the required, non-blank reason a
 * revocation must always carry.
 */
export async function revokeCertificate(
  documentNumber: string,
  _prev: RevokeCertificateState,
  formData: FormData,
): Promise<RevokeCertificateState> {
  // 10 characters to match ConfirmDialog's own stated minimum — the dialog
  // will not even submit below that, so this is the backstop for anything
  // that calls the action directly.
  const reason = formData.get("reason")?.toString().trim() ?? "";
  if (reason.length < 10) {
    return {
      status: "error",
      fieldErrors: { reason: "Give a reason of at least ten characters." },
    };
  }

  const supabase = await createClient();
  const { error } = await callRpc(supabase, "revoke_certificate", {
    p_document_number: documentNumber,
    p_reason: reason,
  });

  if (error) {
    return {
      status: "error",
      message:
        error.message.replace(/^.*?:\s*/, "") ||
        "Could not revoke the certificate.",
    };
  }

  revalidatePath("/admin/certificates");
  return { status: "success", message: "Certificate revoked." };
}
