"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/db/action";
import { createServiceRoleClient } from "@/lib/db/service-role";
import { callRpc } from "@/lib/db/rpc";
import { recordAudit } from "@/lib/audit";
import { generateTemporaryPassword } from "@/lib/auth/temporary-password";

export interface StudentLoginState {
  status: "idle" | "error" | "success";
  message?: string;
  /** Shown once and stored nowhere. Supabase keeps only a bcrypt hash. */
  credentials?: { email: string; password: string };
}

/**
 * Give a student a portal login, or issue them a new password.
 *
 * This is the counterpart of `inviteStudentToPortal`, which emails an
 * invitation and fails outright when no mail provider is configured. Here the
 * password is generated and shown once instead, so access does not depend on
 * email working — the same trade the centre owner form makes.
 *
 * Authorisation is done twice, deliberately:
 *
 *  - the student is re-read through the *caller's own* RLS, so a studentId
 *    bound into the action cannot reach a student the caller cannot see;
 *  - `link_student_login` is then called on the caller's client too, not the
 *    service-role one, so its own check ("platform admin, or student.create at
 *    that centre") runs against the real user rather than being bypassed.
 *
 * Only the Auth Admin calls use the service-role client, because creating a
 * user is not something a session can do.
 */
export async function setStudentPortalLogin(
  studentId: string,
  _prevState: StudentLoginState,
  _formData: FormData,
): Promise<StudentLoginState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { status: "error", message: "You must be signed in." };

  const { data: student } = await supabase
    .from("students")
    .select("id, full_name, email, user_id, organization_id, centre_id")
    .eq("id", studentId)
    .maybeSingle();

  if (!student) {
    return { status: "error", message: "Student not found." };
  }

  if (!student.email) {
    return {
      status: "error",
      message:
        "This student has no email address. The centre must add one before a portal login can be created.",
    };
  }

  const email = student.email.toLowerCase();
  const admin = createServiceRoleClient();
  const password = generateTemporaryPassword();

  // Resolve the account first, then authorise, then set the password. The
  // order matters: link_student_login carries the real rule ("platform admin,
  // or student.create at that centre"), so calling it before the password is
  // written is what stops someone holding only `student.read` from resetting a
  // student's credentials. It is a no-op when the login is already this one,
  // and refuses outright to move a login between students.
  let userId = student.user_id;

  if (!userId) {
    const { data: created, error: createError } =
      await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    userId = created?.user?.id ?? null;

    // "Already registered" is the ordinary path when this address already has
    // an account, or when an earlier attempt got this far and then failed.
    // Paginated because listUsers() returns 50 by default and this project
    // passed that long ago.
    if (!userId) {
      for (let page = 1; page <= 20; page += 1) {
        const { data: list, error: listError } =
          await admin.auth.admin.listUsers({ page, perPage: 1000 });
        if (listError) break;
        const existing = list.users.find(
          (u) => u.email?.toLowerCase() === email,
        );
        if (existing) {
          userId = existing.id;
          break;
        }
        if (list.users.length < 1000) break;
      }
    }

    if (!userId) {
      return {
        status: "error",
        message: `Could not create the account: ${
          createError?.message ?? "unknown error"
        }`,
      };
    }
  }

  const { error: linkError } = await callRpc(supabase, "link_student_login", {
    p_student_id: student.id,
    p_user_id: userId,
  });

  if (linkError) {
    return {
      status: "error",
      message:
        linkError.message?.replace(/^.*?:\s*/, "") ??
        "You are not permitted to give this student a portal login.",
    };
  }

  // Only now, with the caller authorised, does a usable credential exist. An
  // account created above and then refused here is left unlinked and unusable,
  // and is picked up by the lookup on a later attempt.
  const { error: passwordError } = await admin.auth.admin.updateUserById(
    userId,
    { password, email_confirm: true },
  );

  if (passwordError) {
    return {
      status: "error",
      message: `Could not set the password: ${passwordError.message}`,
    };
  }

  await recordAudit(admin, {
    organizationId: student.organization_id,
    actorId: user.id,
    action: student.user_id ? "reset_portal_password" : "create_portal_login",
    tableName: "students",
    rowId: student.id,
    reason: `Portal password issued for ${email}`,
  });

  revalidatePath(`/admin/students/${student.id}`);
  revalidatePath(`/centre/students/${student.id}`);

  return {
    status: "success",
    message: student.user_id
      ? "New password issued. The old one no longer works."
      : "Portal login created.",
    credentials: { email, password },
  };
}
