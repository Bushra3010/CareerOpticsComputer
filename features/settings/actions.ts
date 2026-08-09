"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/db/action";
import { getHeadOfficeContext } from "@/features/exams/access";

export interface SettingsActionState {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string>;
}

const nameSchema = z.object({
  name: z.string().trim().min(3, "Give the organisation a name.").max(120),
});

/**
 * The one organisation-level write settings has today. RLS
 * (`organizations_all_platform`) is the real gate — a head-office role
 * without platform standing gets a refusal here, worded, rather than a
 * silent zero-row update.
 */
export async function updateOrganisationName(
  _prev: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const supabase = await createClient();
  const context = await getHeadOfficeContext(supabase);
  if (!context) {
    return { status: "error", message: "You do not have head-office access." };
  }

  const parsed = nameSchema.safeParse({
    name: formData.get("name")?.toString() ?? "",
  });
  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: { name: parsed.error.issues[0]?.message ?? "Invalid name." },
    };
  }

  const { data, error } = await supabase
    .from("organizations")
    .update({ name: parsed.data.name, updated_by: context.userId })
    .eq("id", context.organizationId)
    .select("id");

  if (error) {
    return { status: "error", message: "Could not update the organisation." };
  }
  if (!data || data.length === 0) {
    return {
      status: "error",
      message: "Only a platform administrator can change the organisation.",
    };
  }

  revalidatePath("/admin/settings");
  return { status: "success", message: "Organisation updated." };
}
