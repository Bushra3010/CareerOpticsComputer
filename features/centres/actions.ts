"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/db/action";
import { callRpc } from "@/lib/db/rpc";
import { recordAudit } from "@/lib/audit";
import { getHeadOfficeContext } from "@/features/exams/access";

export interface CentreActionState {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string>;
}

const statusSchema = z.object({
  status: z.enum(["active", "suspended", "closed"]),
  reason: z
    .string()
    .trim()
    .min(5, "Give a reason of at least five characters.")
    .max(300),
});

/**
 * The only path to move a centre's lifecycle status. `set_centre_status`
 * carries its own authorisation and its own reason requirement — this action
 * additionally records a labelled audit entry via `recordAudit`, because the
 * generic before/after trigger on `centres` (migration 0012) captures the
 * column change but not the human reason typed alongside it, per CLAUDE.md §2.
 */
export async function changeCentreStatus(
  centreId: string,
  _prev: CentreActionState,
  formData: FormData,
): Promise<CentreActionState> {
  const supabase = await createClient();
  const context = await getHeadOfficeContext(supabase);
  if (!context) {
    return { status: "error", message: "You do not have head-office access." };
  }

  const parsed = statusSchema.safeParse({
    status: formData.get("status")?.toString() ?? "",
    reason: formData.get("reason")?.toString() ?? "",
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { status: "error", fieldErrors };
  }

  const { error } = await callRpc(supabase, "set_centre_status", {
    p_centre_id: centreId,
    p_status: parsed.data.status,
    p_reason: parsed.data.reason,
  });

  if (error) {
    return {
      status: "error",
      message:
        error.message.replace(/^.*?:\s*/, "") ||
        "Could not change the centre's status.",
    };
  }

  await recordAudit(supabase, {
    organizationId: context.organizationId,
    actorId: context.userId,
    action: "set_centre_status",
    tableName: "centres",
    rowId: centreId,
    reason: parsed.data.reason,
    after: { status: parsed.data.status },
  });

  revalidatePath(`/admin/centres/${centreId}`);
  revalidatePath("/admin/centres");
  return { status: "success", message: `Centre marked ${parsed.data.status}.` };
}

const profileSchema = z.object({
  name: z.string().trim().min(2).max(160),
  address: z.string().trim().min(3).max(300),
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().min(2).max(100),
  pincode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter a 6-digit PIN code."),
});

/**
 * Profile-detail edit. Deliberately touches only the columns
 * `centre.update`'s grant still covers after migration 0029 — status is not
 * among the fields this schema accepts, so there is no field for a crafted
 * request to smuggle a status change through even if someone tried.
 */
export async function updateCentreProfile(
  centreId: string,
  _prev: CentreActionState,
  formData: FormData,
): Promise<CentreActionState> {
  const supabase = await createClient();

  const parsed = profileSchema.safeParse({
    name: formData.get("name")?.toString() ?? "",
    address: formData.get("address")?.toString() ?? "",
    city: formData.get("city")?.toString() ?? "",
    state: formData.get("state")?.toString() ?? "",
    pincode: formData.get("pincode")?.toString() ?? "",
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { status: "error", fieldErrors };
  }

  const { error } = await supabase
    .from("centres")
    .update(parsed.data)
    .eq("id", centreId);

  if (error) {
    return {
      status: "error",
      message:
        error.code === "42501"
          ? "You do not have permission to edit this centre."
          : "Could not save the changes.",
    };
  }

  revalidatePath(`/admin/centres/${centreId}`);
  return { status: "success", message: "Centre profile updated." };
}
