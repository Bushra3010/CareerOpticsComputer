"use server";

import { revalidatePath } from "next/cache";

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
    return {
      status: "error",
      message: "Could not send the invitation. Please try again.",
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
