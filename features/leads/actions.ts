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
  return { status: "success", message: "Updated." };
}
