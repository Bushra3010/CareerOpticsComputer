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

const createSchema = profileSchema.extend({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(
      /^[A-Z0-9-]{3,16}$/,
      "Use 3–16 characters: letters, digits or hyphens, e.g. CO-LKO03.",
    ),
});

/**
 * Create a centre directly, without waiting for a public application.
 *
 * The application → review → approval flow (PRD §6.1) remains the route for a
 * franchisee who applies from the website. This is the head-office counterpart
 * for a centre the organisation opens itself: there is no applicant to review,
 * so `approve_centre_application` has nothing to approve, and until now the
 * admin portal simply had no way to create one.
 *
 * No new privilege is introduced. `centres_write_platform` (migration 0003)
 * already admits `is_platform_admin() or has_permission('centre.create', …)`,
 * so RLS is the gate exactly as it was; this only supplies the missing screen.
 * A caller without that grant gets 42501 back from Postgres, not a softer path.
 *
 * The centre starts `active`: an organisation creating its own centre has
 * already made the decision that an application would have been reviewed for.
 * Status changes afterwards go through `changeCentreStatus`, which demands a
 * reason.
 */
export async function createCentre(
  _prev: CentreActionState,
  formData: FormData,
): Promise<CentreActionState> {
  const supabase = await createClient();

  const context = await getHeadOfficeContext(supabase);
  if (!context) {
    return {
      status: "error",
      message: "Only head office can create a centre.",
    };
  }

  const parsed = createSchema.safeParse({
    code: formData.get("code")?.toString() ?? "",
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

  const { data, error } = await supabase
    .from("centres")
    .insert({
      organization_id: context.organizationId,
      status: "active",
      ...parsed.data,
    })
    .select("id, code")
    .single();

  if (error) {
    /* 23505 is the (organization_id, code) unique index. Naming the offending
       field beats a generic failure — the code is the one thing the operator
       chose themselves and the one thing likely to collide. */
    if (error.code === "23505") {
      return {
        status: "error",
        fieldErrors: {
          code: "A centre with this code already exists. Pick another.",
        },
      };
    }
    return {
      status: "error",
      message:
        error.code === "42501"
          ? "You do not have permission to create a centre."
          : "Could not create the centre.",
    };
  }

  await recordAudit(supabase, {
    organizationId: context.organizationId,
    actorId: context.userId,
    action: "create_centre",
    tableName: "centres",
    rowId: data.id,
    reason: `Created directly by head office as ${data.code}`,
    after: { code: data.code, name: parsed.data.name, status: "active" },
  });

  revalidatePath("/admin/centres");
  revalidatePath("/admin");
  return {
    status: "success",
    message: `${parsed.data.name} created.`,
  };
}
