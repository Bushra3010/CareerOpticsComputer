"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/db/action";
import { getCurrentCentreContext } from "@/features/centres/current-membership";
import { fromRupees, MoneyError } from "@/lib/money";

import { expenseEntrySchema, reverseEntrySchema } from "./schema";

export interface ExpenseActionState {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string>;
}

async function centreContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const context = user
    ? await getCurrentCentreContext(supabase, user.id)
    : null;
  return { supabase, context };
}

export async function recordExpenseEntry(
  _prev: ExpenseActionState,
  formData: FormData,
): Promise<ExpenseActionState> {
  const { supabase, context } = await centreContext();
  if (!context) {
    return { status: "error", message: "You do not have centre access." };
  }

  const parsed = expenseEntrySchema.safeParse({
    entryType: formData.get("entryType")?.toString() ?? "",
    category: formData.get("category")?.toString() ?? "",
    amountRupees: formData.get("amountRupees")?.toString() ?? "",
    entryDate: formData.get("entryDate")?.toString() ?? "",
    note: formData.get("note")?.toString() ?? "",
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0]);
      if (!fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    return { status: "error", fieldErrors };
  }

  let amountPaise: number;
  try {
    amountPaise = fromRupees(parsed.data.amountRupees);
  } catch (err) {
    return {
      status: "error",
      fieldErrors: {
        amountRupees:
          err instanceof MoneyError ? err.message : "Invalid amount.",
      },
    };
  }
  if (amountPaise <= 0) {
    return {
      status: "error",
      fieldErrors: { amountRupees: "The amount must be more than zero." },
    };
  }

  const { error } = await supabase.from("expense_entries").insert({
    organization_id: context.organizationId,
    centre_id: context.centreId,
    entry_type: parsed.data.entryType,
    category: parsed.data.category,
    amount_paise: amountPaise,
    entry_date: parsed.data.entryDate,
    note: parsed.data.note || null,
  });

  if (error) {
    return {
      status: "error",
      message:
        error.code === "42501"
          ? "You do not have permission to record entries."
          : "Could not record the entry.",
    };
  }

  revalidatePath("/centre/finance/expenses");
  return { status: "success", message: "Entry recorded." };
}

/**
 * A compensating row, never an edit — the 0045 trigger enforces the mirror
 * (opposite type, same amount, same centre) so this action only needs to
 * copy the original and flip the type.
 */
export async function reverseExpenseEntry(
  entryId: string,
  _prev: ExpenseActionState,
  formData: FormData,
): Promise<ExpenseActionState> {
  const { supabase, context } = await centreContext();
  if (!context) {
    return { status: "error", message: "You do not have centre access." };
  }

  const parsed = reverseEntrySchema.safeParse({
    note: formData.get("note")?.toString() ?? "",
  });
  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: {
        note: parsed.error.issues[0]?.message ?? "A reason is required.",
      },
    };
  }

  const { data: original } = await supabase
    .from("expense_entries")
    .select(
      "id, centre_id, organization_id, entry_type, category, amount_paise",
    )
    .eq("id", entryId)
    .maybeSingle();
  if (!original) {
    return { status: "error", message: "Entry not found." };
  }

  const { error } = await supabase.from("expense_entries").insert({
    organization_id: original.organization_id,
    centre_id: original.centre_id,
    entry_type: original.entry_type === "income" ? "expense" : "income",
    category: original.category,
    amount_paise: original.amount_paise,
    note: parsed.data.note,
    reverses_entry_id: original.id,
  });

  if (error) {
    return {
      status: "error",
      message: error.message.includes("cannot itself be reversed")
        ? "A reversal cannot be reversed — record a fresh entry instead."
        : error.code === "23505"
          ? "This entry has already been reversed."
          : "Could not reverse the entry.",
    };
  }

  revalidatePath("/centre/finance/expenses");
  return { status: "success", message: "Entry reversed." };
}
