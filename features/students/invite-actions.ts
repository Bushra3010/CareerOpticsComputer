"use server";

import { revalidatePath } from "next/cache";
import type { AuthError } from "@supabase/supabase-js";

import { createClient } from "@/lib/db/action";
import { createServiceRoleClient } from "@/lib/db/service-role";
import { authorize } from "@/lib/permissions";
import { recordAudit } from "@/lib/audit";
import { getCurrentCentreContext } from "@/features/centres/current-membership";

export interface InviteState {
  status: "idle" | "error" | "success";
  message?: string;
}

/**
 * Turns an Auth API failure into something the person at the centre desk can
 * act on.
 *
 * The three below are configuration, not bad luck: no amount of retrying fixes
 * a project whose mail sender is not set up, and telling staff to "try again"
 * sends them round the same loop while the real fix sits in a dashboard nobody
 * has been pointed at. Anything unrecognised keeps the retry wording, because
 * a genuine transient failure is the one case where retrying is right.
 */
function inviteFailureMessage(error: AuthError | null): string {
  switch (error?.code) {
    case "over_email_send_rate_limit":
      return "Too many invitations have been sent recently. Wait an hour and try again.";
    case "email_address_not_authorized":
      return "The email service is not configured to send to this address. Head office needs to set up SMTP before portal invitations will work.";
    case "validation_failed":
      return "The invitation was rejected as invalid — usually the site's redirect URL is not on the allowed list. Contact head office.";
    default:
      return "Could not send the invitation. Please try again.";
  }
}

/**
 * Invites a student to the portal.
 *
 * Like centre approval, this spans the Auth Admin API and the database, so it
 * runs on the service-role client — but the caller's own permission is checked
 * first against their session, and the student is re-read scoped to the
 * caller's centre so a bound studentId from another centre cannot be invited.
 */
export async function inviteStudentToPortal(
  studentId: string,
  _prevState: InviteState,
  _formData: FormData,
): Promise<InviteState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "You must be signed in." };
  }

  const context = await getCurrentCentreContext(supabase, user.id);
  if (!context) {
    return { status: "error", message: "No active centre membership found." };
  }

  try {
    await authorize(
      supabase,
      "student.create",
      context.organizationId,
      context.centreId,
    );
  } catch {
    return {
      status: "error",
      message: "You do not have permission to invite students.",
    };
  }

  // Re-read through the caller's own RLS, scoped to their centre. A studentId
  // bound into the action is client-controllable; this is what stops centre A
  // inviting centre B's student.
  const { data: student } = await supabase
    .from("students")
    .select("id, full_name, email, user_id")
    .eq("id", studentId)
    .eq("centre_id", context.centreId)
    .maybeSingle();

  if (!student) {
    return { status: "error", message: "Student not found at your centre." };
  }
  if (student.user_id) {
    return {
      status: "error",
      message: "This student already has a portal login.",
    };
  }
  if (!student.email) {
    return {
      status: "error",
      message: "Add an email address to this student before inviting them.",
    };
  }

  const admin = createServiceRoleClient();
  const { data: invited, error: inviteError } =
    await admin.auth.admin.inviteUserByEmail(student.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/invite`,
    });

  if (inviteError || !invited.user) {
    // Swallowing this made the failure undiagnosable from outside: a mail
    // provider that is not configured, a rate limit and a rejected redirect
    // URL all looked like the same "try again" to the centre staff, and
    // nothing at all reached the server logs.
    console.error("[students] portal invitation failed:", inviteError);

    return {
      status: "error",
      message: inviteFailureMessage(inviteError),
    };
  }

  // Link only after the account exists. link_student_login refuses to move a
  // login onto a student that already has one, so a replayed invite cannot
  // silently reassign the portal account.
  const { error: linkError } = await admin.rpc("link_student_login", {
    p_student_id: student.id,
    p_user_id: invited.user.id,
  });

  if (linkError) {
    // Support cannot act on "contact support" without the cause, and this
    // branch leaves an orphaned auth account behind — worth a log line.
    console.error("[students] link_student_login failed:", linkError);
    return {
      status: "error",
      message:
        "The account was created but could not be linked. Contact support.",
    };
  }

  await recordAudit(admin, {
    organizationId: context.organizationId,
    actorId: user.id,
    action: "invite_portal",
    tableName: "students",
    rowId: student.id,
    reason: `Portal invitation sent to ${student.email}`,
  });

  revalidatePath("/centre/students");

  return { status: "success", message: `Invitation sent to ${student.email}.` };
}
