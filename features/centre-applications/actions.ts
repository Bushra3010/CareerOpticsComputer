"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/db/action";
import { createServiceRoleClient } from "@/lib/db/service-role";
import { callRpc } from "@/lib/db/rpc";
import { checkRateLimit } from "@/lib/rate-limit";
import { recordAudit } from "@/lib/audit";

import { centreApplicationSchema } from "./schema";

const CAREER_OPTICS_SLUG = "career-optics";

export interface CentreApplicationFormState {
  status: "idle" | "success" | "error";
  message?: string;
  applicationNumber?: string;
  fieldErrors?: Record<string, string>;
}

export async function submitCentreApplication(
  _prevState: CentreApplicationFormState,
  formData: FormData,
): Promise<CentreApplicationFormState> {
  const raw = {
    applicantName: formData.get("applicantName")?.toString() ?? "",
    applicantEmail: formData.get("applicantEmail")?.toString() ?? "",
    applicantPhone: formData.get("applicantPhone")?.toString() ?? "",
    proposedCentreName: formData.get("proposedCentreName")?.toString() ?? "",
    city: formData.get("city")?.toString() ?? "",
    state: formData.get("state")?.toString() ?? "",
    pincode: formData.get("pincode")?.toString() ?? "",
    address: formData.get("address")?.toString() ?? "",
    message: formData.get("message")?.toString() ?? "",
    website: formData.get("website")?.toString() ?? "",
  };

  const parsed = centreApplicationSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (typeof field === "string" && !fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }
    return {
      status: "error",
      message: "Please fix the errors below.",
      fieldErrors,
    };
  }

  if (parsed.data.website) {
    return { status: "success", applicationNumber: "APP-0000" };
  }

  const { allowed } = checkRateLimit(
    `centre-application:${parsed.data.applicantEmail}`,
    3,
    60 * 60 * 1000,
  );
  if (!allowed) {
    return {
      status: "error",
      message:
        "Too many applications submitted recently. Please try again later.",
    };
  }

  const supabase = await createClient();
  const { data, error } = await callRpc(supabase, "submit_centre_application", {
    p_organization_slug: CAREER_OPTICS_SLUG,
    p_applicant_name: parsed.data.applicantName,
    p_applicant_email: parsed.data.applicantEmail,
    p_applicant_phone: parsed.data.applicantPhone,
    p_proposed_centre_name: parsed.data.proposedCentreName,
    p_city: parsed.data.city,
    p_state: parsed.data.state,
    p_pincode: parsed.data.pincode,
    p_address: parsed.data.address,
    p_message: parsed.data.message || null,
  });

  if (error || !data) {
    return {
      status: "error",
      message: "Something went wrong. Please try again.",
    };
  }

  return { status: "success", applicationNumber: data };
}

export interface ReviewActionState {
  status: "idle" | "error" | "success";
  message?: string;
}

/**
 * Approval is not one DB transaction: it spans the Auth Admin API (creating
 * the owner's user account) and the database, so it uses the service-role
 * client end to end and records an explicit audit entry with the reviewing
 * admin as actor — "the system did it" is not acceptable here.
 */
/**
 * Approving a centre.
 *
 * Creating the owner's auth account cannot join a database transaction, so it
 * happens first and everything else happens inside approve_centre_application,
 * which is one statement and therefore one transaction. If the invite fails,
 * nothing has been written. If the transaction fails, an unused auth user is
 * left behind — harmless, and reused on retry.
 *
 * Ordering this the other way round is what produced orphan centres: the old
 * code created the centre first, so a failed invite left a live centre with no
 * owner and an application that still read "submitted".
 */
async function findOrInviteOwner(
  admin: ReturnType<typeof createServiceRoleClient>,
  email: string,
): Promise<{ userId?: string; error?: string }> {
  const { data: invited, error } =
    await admin.auth.admin.inviteUserByEmail(email);

  if (!error && invited.user) return { userId: invited.user.id };

  // A retry after a failed transaction hits "already been registered". That is
  // the expected path on retry, not an error — find the existing account and
  // carry on, so approval is genuinely idempotent rather than permanently
  // stuck once the first attempt got this far.
  const { data: list } = await admin.auth.admin.listUsers();
  const existing = list?.users.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase(),
  );
  if (existing) return { userId: existing.id };

  return { error: "Could not create an account for the applicant." };
}

export async function approveCentreApplication(
  applicationId: string,
  _prevState: ReviewActionState,
  formData: FormData,
): Promise<ReviewActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_platform_super_admin")
    .eq("id", user?.id ?? "")
    .maybeSingle();

  if (!user || !profile?.is_platform_super_admin) {
    return {
      status: "error",
      message: "You do not have permission to approve applications.",
    };
  }

  const comments = formData.get("comments")?.toString() ?? "";
  const admin = createServiceRoleClient();

  const { data: application } = await admin
    .from("centre_applications")
    .select("id, status, applicant_email, organization_id")
    .eq("id", applicationId)
    .maybeSingle();

  if (!application) {
    return { status: "error", message: "Application not found." };
  }
  if (application.status === "rejected") {
    return { status: "error", message: "This application was rejected." };
  }

  const owner = await findOrInviteOwner(admin, application.applicant_email);
  if (!owner.userId) {
    return { status: "error", message: owner.error };
  }

  const { data, error } = await callRpc(admin, "approve_centre_application", {
    p_application_id: applicationId,
    p_owner_user_id: owner.userId,
    p_reviewer_id: user.id,
    p_comments: comments,
  });

  const result = data?.[0];
  if (error || !result) {
    return {
      status: "error",
      message:
        error?.message?.replace(/^.*?:\s*/, "") ??
        "Could not approve this application.",
    };
  }

  await recordAudit(admin, {
    organizationId: application.organization_id,
    actorId: user.id,
    action: "approve",
    tableName: "centre_applications",
    rowId: applicationId,
    reason: comments || null,
  });

  revalidatePath("/admin/centre-applications");
  revalidatePath(`/admin/centre-applications/${applicationId}`);

  return {
    status: "success",
    message: result.already_approved
      ? `Already approved as ${result.centre_code}.`
      : `Centre ${result.centre_code} created and the owner invited.`,
  };
}

export async function rejectCentreApplication(
  applicationId: string,
  _prevState: ReviewActionState,
  formData: FormData,
): Promise<ReviewActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_platform_super_admin")
    .eq("id", user?.id ?? "")
    .maybeSingle();

  if (!user || !profile?.is_platform_super_admin) {
    return {
      status: "error",
      message: "You do not have permission to reject applications.",
    };
  }

  const comments = formData.get("comments")?.toString() ?? "";

  // The reason requirement and the already-approved guard both live in the
  // function, so a direct RPC call cannot skip them either.
  const { error } = await callRpc(supabase, "reject_centre_application", {
    p_application_id: applicationId,
    p_reviewer_id: user.id,
    p_reason: comments,
  });

  if (error) {
    return {
      status: "error",
      message:
        error.message?.replace(/^.*?:\s*/, "") ??
        "Could not reject the application.",
    };
  }

  revalidatePath("/admin/centre-applications");
  revalidatePath(`/admin/centre-applications/${applicationId}`);

  return { status: "success", message: "Application rejected." };
}
