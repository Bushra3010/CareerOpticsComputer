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

  const { data: application, error: appError } = await admin
    .from("centre_applications")
    .select("*")
    .eq("id", applicationId)
    .single();

  if (appError || !application) {
    return { status: "error", message: "Application not found." };
  }

  if (application.status === "approved") {
    return {
      status: "error",
      message: "This application is already approved.",
    };
  }

  const { data: existingCentres } = await admin
    .from("centres")
    .select("code")
    .eq("organization_id", application.organization_id);

  const stateCode = application.state.slice(0, 2).toUpperCase();
  const sequence = (existingCentres?.length ?? 0) + 1;
  const centreCode = `CO-${stateCode}${String(sequence).padStart(2, "0")}`;

  const { data: centre, error: centreError } = await admin
    .from("centres")
    .insert({
      organization_id: application.organization_id,
      code: centreCode,
      name: application.proposed_centre_name,
      city: application.city,
      state: application.state,
      pincode: application.pincode,
      address: application.address,
      status: "active",
    })
    .select("id")
    .single();

  if (centreError || !centre) {
    return {
      status: "error",
      message: "Could not create the centre. Please try again.",
    };
  }

  const { data: invited, error: inviteError } =
    await admin.auth.admin.inviteUserByEmail(application.applicant_email);

  if (inviteError || !invited.user) {
    return {
      status: "error",
      message:
        "Centre created, but the invitation email could not be sent. Contact support.",
    };
  }

  await admin
    .from("profiles")
    .insert({ id: invited.user.id, full_name: application.applicant_name });

  const { data: ownerRole } = await admin
    .from("roles")
    .select("id")
    .eq("organization_id", application.organization_id)
    .eq("code", "centre_owner")
    .maybeSingle();

  if (ownerRole) {
    await admin.from("memberships").insert({
      user_id: invited.user.id,
      organization_id: application.organization_id,
      centre_id: centre.id,
      role_id: ownerRole.id,
      status: "active",
    });
  }

  await admin
    .from("centre_applications")
    .update({
      status: "approved",
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      centre_id: centre.id,
    })
    .eq("id", applicationId);

  await admin.from("centre_application_reviews").insert({
    application_id: applicationId,
    reviewer_id: user.id,
    action: "approved",
    comments: comments || null,
  });

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
    message: `Centre ${centreCode} created and owner invited.`,
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
  if (!comments.trim()) {
    return {
      status: "error",
      message: "A reason is required to reject an application.",
    };
  }

  const { error } = await supabase
    .from("centre_applications")
    .update({
      status: "rejected",
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", applicationId);

  if (error) {
    return { status: "error", message: "Could not reject the application." };
  }

  await supabase.from("centre_application_reviews").insert({
    application_id: applicationId,
    reviewer_id: user.id,
    action: "rejected",
    comments,
  });

  revalidatePath("/admin/centre-applications");
  revalidatePath(`/admin/centre-applications/${applicationId}`);

  return { status: "success", message: "Application rejected." };
}
