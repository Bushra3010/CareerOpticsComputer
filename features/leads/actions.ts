"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/db/action";

export interface LeadActionState {
  status: "idle" | "error" | "success";
  message?: string;
}

const VALID = ["new", "contacted", "converted", "closed"] as const;

/**
 * `leads_platform_write` gates on `app.is_platform_admin()` alone, same as
 * courses — there is no dedicated counsellor-at-head-office role yet, so this
 * is a platform-admin-only action for now rather than a permission code
 * nobody can hold.
 *
 * Only `leadId` is bound; the target status comes from the submitted form
 * field rather than a second bound argument, because it changes per selection
 * — a `<select onChange>` that resubmits cannot bind a value it does not know
 * until the moment of change.
 */
export async function setLeadStatus(
  leadId: string,
  _prev: LeadActionState,
  formData: FormData,
): Promise<LeadActionState> {
  const raw = formData.get("status")?.toString();
  if (!VALID.includes(raw as (typeof VALID)[number])) {
    return { status: "error", message: "Not a valid status." };
  }
  const nextStatus = raw as (typeof VALID)[number];

  const supabase = await createClient();
  const { error } = await supabase
    .from("leads")
    .update({ status: nextStatus })
    .eq("id", leadId);

  if (error) {
    return {
      status: "error",
      message:
        error.code === "42501"
          ? "You do not have permission to update leads."
          : "Could not update the lead.",
    };
  }

  revalidatePath("/admin/leads");
  revalidatePath("/centre/leads");
  return { status: "success", message: "Updated." };
}

/**
 * Head-office assignment of a lead into a centre's pipeline. RLS
 * (`leads_centre_update`, migration 0044) is the gate: only org-level
 * `lead.manage` holders and platform admins can move a lead between
 * centres or back to the pool — a centre's own staff cannot, by the same
 * policy's WITH CHECK.
 */
export async function assignLeadToCentre(
  leadId: string,
  _prev: LeadActionState,
  formData: FormData,
): Promise<LeadActionState> {
  const raw = formData.get("centreId")?.toString() ?? "";
  const centreId = raw === "pool" ? null : raw;
  if (centreId !== null && !/^[0-9a-f-]{36}$/.test(centreId)) {
    return { status: "error", message: "Choose a centre." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .update({ centre_id: centreId })
    .eq("id", leadId)
    .select("id");

  if (error || !data?.length) {
    return {
      status: "error",
      message: "You do not have permission to assign leads.",
    };
  }

  revalidatePath("/admin/leads");
  revalidatePath("/centre/leads");
  return { status: "success", message: "Assigned." };
}
