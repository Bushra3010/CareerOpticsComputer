"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/db/action";
import { callRpc } from "@/lib/db/rpc";
import { getHeadOfficeContext } from "@/features/exams/access";
import { fromRupees, MoneyError } from "@/lib/money";

import {
  commissionRuleSchema,
  createReferralCodeSchema,
  payCommissionSchema,
  qualifyReferralSchema,
  recordReferralSchema,
  reverseCommissionSchema,
} from "./schema";

export interface ReferralActionState {
  status: "idle" | "error" | "success";
  message?: string;
  code?: string;
  fieldErrors?: Record<string, string>;
}

function fieldErrorsFrom(issues: { path: PropertyKey[]; message: string }[]) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of issues) {
    const field = issue.path[0];
    if (typeof field === "string" && !fieldErrors[field]) {
      fieldErrors[field] = issue.message;
    }
  }
  return fieldErrors;
}

function friendlyMessage(message: string, fallback: string): string {
  return message.replace(/^.*?:\s*/, "") || fallback;
}

/**
 * `referral.manage` is organisation-wide (matrix: Centre Owner only ever
 * gets "read (own)", never create) — only a platform admin holds it today,
 * the same gap migration 0031's header recorded for `product.manage`. This
 * form is deliberately centre-only: `owner_type = 'user'` exists in the
 * schema for the PRD's "authorised centres/users" wording, but there is no
 * picker UI for an arbitrary staff user yet, so it is not exposed here.
 */
export async function createReferralCode(
  _prev: ReferralActionState,
  formData: FormData,
): Promise<ReferralActionState> {
  const supabase = await createClient();
  const context = await getHeadOfficeContext(supabase);
  if (!context) {
    return { status: "error", message: "You do not have head-office access." };
  }

  const parsed = createReferralCodeSchema.safeParse({
    ownerCentreId: formData.get("ownerCentreId")?.toString() ?? "",
    validUntil: formData.get("validUntil")?.toString() ?? "",
  });
  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: fieldErrorsFrom(parsed.error.issues),
    };
  }

  const { data: code, error } = await callRpc(
    supabase,
    "create_referral_code",
    {
      p_organization_id: context.organizationId,
      p_owner_type: "centre",
      p_owner_id: parsed.data.ownerCentreId,
      p_valid_until: parsed.data.validUntil || null,
    },
  );

  if (error) {
    return {
      status: "error",
      message: friendlyMessage(
        error.message,
        "Could not create a referral code.",
      ),
    };
  }

  revalidatePath("/admin/referrals");
  return {
    status: "success",
    message: "Referral code created.",
    code: code as string,
  };
}

export async function recordReferral(
  _prev: ReferralActionState,
  formData: FormData,
): Promise<ReferralActionState> {
  const supabase = await createClient();
  const context = await getHeadOfficeContext(supabase);
  if (!context) {
    return { status: "error", message: "You do not have head-office access." };
  }

  const parsed = recordReferralSchema.safeParse({
    code: formData.get("code")?.toString() ?? "",
    referredEntityType: formData.get("referredEntityType")?.toString() ?? "",
    referredEntityId: formData.get("referredEntityId")?.toString() ?? "",
  });
  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: fieldErrorsFrom(parsed.error.issues),
    };
  }

  const { error } = await callRpc(supabase, "record_referral", {
    p_code: parsed.data.code,
    p_referred_entity_type: parsed.data.referredEntityType,
    p_referred_entity_id: parsed.data.referredEntityId,
  });

  if (error) {
    return {
      status: "error",
      message: friendlyMessage(error.message, "Could not record the referral."),
    };
  }

  revalidatePath("/admin/referrals");
  return { status: "success", message: "Referral recorded." };
}

export async function createCommissionRule(
  _prev: ReferralActionState,
  formData: FormData,
): Promise<ReferralActionState> {
  const supabase = await createClient();
  const context = await getHeadOfficeContext(supabase);
  if (!context) {
    return { status: "error", message: "You do not have head-office access." };
  }

  const parsed = commissionRuleSchema.safeParse({
    event: formData.get("event")?.toString() ?? "",
    amountType: formData.get("amountType")?.toString() ?? "",
    flatAmountRupees: formData.get("flatAmountRupees")?.toString() ?? "",
    percentage: formData.get("percentage")?.toString() ?? "",
    effectiveFrom: formData.get("effectiveFrom")?.toString() ?? "",
    effectiveTo: formData.get("effectiveTo")?.toString() ?? "",
  });
  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: fieldErrorsFrom(parsed.error.issues),
    };
  }

  let flatAmountPaise: number | null = null;
  if (parsed.data.amountType === "flat" && parsed.data.flatAmountRupees) {
    try {
      flatAmountPaise = fromRupees(parsed.data.flatAmountRupees);
    } catch (err) {
      const message =
        err instanceof MoneyError ? err.message : "Invalid amount.";
      return { status: "error", fieldErrors: { flatAmountRupees: message } };
    }
  }

  const { error } = await supabase.from("commission_rules").insert({
    organization_id: context.organizationId,
    event: parsed.data.event,
    amount_type: parsed.data.amountType,
    flat_amount_paise:
      parsed.data.amountType === "flat" ? flatAmountPaise : null,
    percentage:
      parsed.data.amountType === "percentage" ? parsed.data.percentage : null,
    effective_from: parsed.data.effectiveFrom,
    effective_to: parsed.data.effectiveTo || null,
    created_by: context.userId,
  });

  if (error) {
    return {
      status: "error",
      message:
        error.code === "42501"
          ? "You do not have permission to manage commission rules."
          : "Could not create the rule.",
    };
  }

  revalidatePath("/admin/commissions/rules");
  return { status: "success", message: "Commission rule created." };
}

export async function qualifyReferral(
  referralId: string,
  _prev: ReferralActionState,
  formData: FormData,
): Promise<ReferralActionState> {
  const supabase = await createClient();

  const parsed = qualifyReferralSchema.safeParse({
    referralId,
    event: formData.get("event")?.toString() ?? "",
    baseAmountRupees: formData.get("baseAmountRupees")?.toString() ?? "",
  });
  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: fieldErrorsFrom(parsed.error.issues),
    };
  }

  let baseAmountPaise: number | null = null;
  if (parsed.data.baseAmountRupees) {
    try {
      baseAmountPaise = fromRupees(parsed.data.baseAmountRupees);
    } catch (err) {
      const message =
        err instanceof MoneyError ? err.message : "Invalid amount.";
      return { status: "error", fieldErrors: { baseAmountRupees: message } };
    }
  }

  const { error } = await callRpc(supabase, "qualify_referral", {
    p_referral_id: parsed.data.referralId,
    p_event: parsed.data.event,
    p_base_amount_paise: baseAmountPaise,
  });

  if (error) {
    return {
      status: "error",
      message: friendlyMessage(
        error.message,
        "Could not qualify the referral.",
      ),
    };
  }

  revalidatePath("/admin/referrals");
  revalidatePath("/admin/commissions");
  return {
    status: "success",
    message: "Referral qualified — a commission entry was created.",
  };
}

export async function approveCommission(
  commissionEntryId: string,
  _prev: ReferralActionState,
  _formData: FormData,
): Promise<ReferralActionState> {
  const supabase = await createClient();
  const { error } = await callRpc(supabase, "approve_commission", {
    p_commission_entry_id: commissionEntryId,
  });
  if (error) {
    return {
      status: "error",
      message: friendlyMessage(
        error.message,
        "Could not approve the commission.",
      ),
    };
  }
  revalidatePath("/admin/commissions");
  return { status: "success", message: "Commission approved." };
}

export async function markCommissionPayable(
  commissionEntryId: string,
  _prev: ReferralActionState,
  _formData: FormData,
): Promise<ReferralActionState> {
  const supabase = await createClient();
  const { error } = await callRpc(supabase, "mark_commission_payable", {
    p_commission_entry_id: commissionEntryId,
  });
  if (error) {
    return {
      status: "error",
      message: friendlyMessage(
        error.message,
        "Could not mark the commission payable.",
      ),
    };
  }
  revalidatePath("/admin/commissions");
  return { status: "success", message: "Commission marked payable." };
}

export async function payCommission(
  commissionEntryId: string,
  _prev: ReferralActionState,
  formData: FormData,
): Promise<ReferralActionState> {
  const supabase = await createClient();
  const parsed = payCommissionSchema.safeParse({
    payoutReference: formData.get("payoutReference")?.toString() ?? "",
  });
  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: fieldErrorsFrom(parsed.error.issues),
    };
  }

  const { error } = await callRpc(supabase, "pay_commission", {
    p_commission_entry_id: commissionEntryId,
    p_payout_reference: parsed.data.payoutReference || null,
  });

  if (error) {
    return {
      status: "error",
      message: friendlyMessage(error.message, "Could not pay the commission."),
    };
  }

  revalidatePath("/admin/commissions");
  return { status: "success", message: "Commission paid." };
}

export async function reverseCommission(
  commissionEntryId: string,
  _prev: ReferralActionState,
  formData: FormData,
): Promise<ReferralActionState> {
  const supabase = await createClient();
  const parsed = reverseCommissionSchema.safeParse({
    reason: formData.get("reason")?.toString() ?? "",
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "A reason is required.",
    };
  }

  const { error } = await callRpc(supabase, "reverse_commission", {
    p_commission_entry_id: commissionEntryId,
    p_reason: parsed.data.reason,
  });

  if (error) {
    return {
      status: "error",
      message: friendlyMessage(
        error.message,
        "Could not reverse the commission.",
      ),
    };
  }

  revalidatePath("/admin/commissions");
  return { status: "success", message: "Commission reversed." };
}
