"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/db/action";
import { createServiceRoleClient } from "@/lib/db/service-role";
import { callRpc } from "@/lib/db/rpc";
import { authorize } from "@/lib/permissions";
import { recordAudit } from "@/lib/audit";
import { getCurrentCentreContext } from "@/features/centres/current-membership";

export interface StaffActionState {
  status: "idle" | "error" | "success";
  message?: string;
}

const inviteSchema = z.object({
  fullName: z.string().trim().min(2, "Enter their full name").max(200),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  roleCode: z.enum(["centre_manager", "counsellor", "faculty", "accountant"]),
});

export async function inviteStaff(
  _prev: StaffActionState,
  formData: FormData,
): Promise<StaffActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "You must be signed in." };

  const context = await getCurrentCentreContext(supabase, user.id);
  if (!context)
    return { status: "error", message: "No active centre membership found." };

  try {
    await authorize(
      supabase,
      "staff.invite",
      context.organizationId,
      context.centreId,
    );
  } catch {
    return {
      status: "error",
      message: "Only the centre owner can invite staff.",
    };
  }

  const parsed = inviteSchema.safeParse({
    fullName: formData.get("fullName")?.toString() ?? "",
    email: formData.get("email")?.toString() ?? "",
    roleCode: formData.get("roleCode")?.toString() ?? "",
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Check the form.",
    };
  }

  const admin = createServiceRoleClient();

  // Create the account first: it cannot join the membership transaction, and
  // an unused auth user is harmless while a membership pointing at nobody is
  // not. On retry the invite reports the address is taken, so fall back to
  // finding the existing account rather than getting permanently stuck.
  // Without an explicit target the link falls back to the project's Site URL
  // — the public home page, which has no way to consume an invite token, so
  // the invitation would dead-end there. `/invite` is the page that does.
  const { data: invited, error: inviteError } =
    await admin.auth.admin.inviteUserByEmail(parsed.data.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/invite`,
    });

  let userId = invited?.user?.id;
  if (inviteError || !userId) {
    const { data: list } = await admin.auth.admin.listUsers();
    userId = list?.users.find(
      (u) => u.email?.toLowerCase() === parsed.data.email,
    )?.id;
  }
  if (!userId) {
    return {
      status: "error",
      message: "Could not create an account for that email.",
    };
  }

  const { error } = await callRpc(admin, "invite_centre_staff", {
    p_centre_id: context.centreId,
    p_user_id: userId,
    p_role_code: parsed.data.roleCode,
    p_full_name: parsed.data.fullName,
  });

  if (error) {
    return {
      status: "error",
      message:
        error.message?.replace(/^.*?:\s*/, "") ??
        "Could not add them to the centre.",
    };
  }

  await recordAudit(admin, {
    organizationId: context.organizationId,
    actorId: user.id,
    action: "invite_staff",
    tableName: "memberships",
    rowId: null,
    reason: `${parsed.data.email} invited as ${parsed.data.roleCode}`,
  });

  revalidatePath("/centre/staff");
  return {
    status: "success",
    message: `Invitation sent to ${parsed.data.email}.`,
  };
}

export async function setStaffStatus(
  membershipId: string,
  nextStatus: "active" | "suspended",
  _prev: StaffActionState,
  _formData: FormData,
): Promise<StaffActionState> {
  const supabase = await createClient();

  // The function checks staff.invite, refuses self-changes, and is the only
  // write path — memberships has no UPDATE policy for centre staff.
  const { error } = await callRpc(supabase, "set_membership_status", {
    p_membership_id: membershipId,
    p_status: nextStatus,
  });

  if (error) {
    return {
      status: "error",
      message:
        error.message?.replace(/^.*?:\s*/, "") ??
        "Could not change their access.",
    };
  }

  revalidatePath("/centre/staff");
  return {
    status: "success",
    message: nextStatus === "active" ? "Access restored." : "Access suspended.",
  };
}
