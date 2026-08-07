"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/db/action";
import { callRpc } from "@/lib/db/rpc";
import { getHeadOfficeContext } from "@/features/exams/access";
import { fromRupees, MoneyError } from "@/lib/money";

export interface WalletActionState {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string>;
}

const rechargeSchema = z.object({
  centreId: z.string().uuid("Choose a centre."),
  // Kept as a string through validation — `fromRupees` parses the decimal text
  // itself and rejects a third decimal place instead of silently rounding it,
  // which `Number(...) * 100` would do (₹99.999 would become ₹100.00 without
  // a sound). The one rupee-typed field in the app is exactly where that
  // exactness has to happen.
  amountRupees: z
    .string()
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/, "Enter an amount like 1500 or 1500.50."),
  reason: z.string().trim().min(3, "Say what this recharge is for.").max(200),
  reference: z.string().trim().max(100).optional().or(z.literal("")),
});

const MAX_RECHARGE_PAISE = 10_000_000 * 100;

/**
 * Head-office recharge. `credit_wallet` itself re-checks `wallet.manage` at
 * the organisation — this action's own authorisation call exists for the
 * readable error and the audit trail a bare RLS denial would not give a
 * head-office user filling in a form, per CLAUDE.md §2.
 */
export async function rechargeWallet(
  _prev: WalletActionState,
  formData: FormData,
): Promise<WalletActionState> {
  const supabase = await createClient();
  const context = await getHeadOfficeContext(supabase);
  if (!context) {
    return { status: "error", message: "You do not have head-office access." };
  }

  const parsed = rechargeSchema.safeParse({
    centreId: formData.get("centreId")?.toString() ?? "",
    amountRupees: formData.get("amountRupees")?.toString() ?? "",
    reason: formData.get("reason")?.toString() ?? "",
    reference: formData.get("reference")?.toString() ?? "",
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { status: "error", fieldErrors };
  }

  let amountPaise: number;
  try {
    amountPaise = fromRupees(parsed.data.amountRupees);
  } catch (err) {
    const message = err instanceof MoneyError ? err.message : "Invalid amount.";
    return { status: "error", fieldErrors: { amountRupees: message } };
  }

  if (amountPaise <= 0) {
    return {
      status: "error",
      fieldErrors: { amountRupees: "Enter an amount greater than zero." },
    };
  }
  if (amountPaise > MAX_RECHARGE_PAISE) {
    return {
      status: "error",
      fieldErrors: {
        amountRupees:
          "That is larger than a single recharge should be — split it.",
      },
    };
  }

  const { error } = await callRpc(supabase, "credit_wallet", {
    p_centre_id: parsed.data.centreId,
    p_amount_paise: amountPaise,
    p_reason: parsed.data.reason,
    p_reference: parsed.data.reference || null,
  });

  if (error) {
    return {
      status: "error",
      message:
        error.message.replace(/^.*?:\s*/, "") ||
        "Could not recharge the wallet.",
    };
  }

  revalidatePath("/admin/wallets");
  return { status: "success", message: "Wallet recharged." };
}
