"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/db/action";
import { callRpc } from "@/lib/db/rpc";
import { authorize } from "@/lib/permissions";
import { fromRupees, MoneyError } from "@/lib/money";
import { getCurrentCentreContext } from "@/features/centres/current-membership";

import { createFeePlanSchema, postPaymentSchema } from "./schema";

export interface FeeActionState {
  status: "idle" | "error" | "success";
  message?: string;
  receiptNumber?: string;
  fieldErrors?: Record<string, string>;
}

function collectFieldErrors(
  issues: { path: PropertyKey[]; message: string }[],
) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of issues) {
    const field = issue.path[0];
    if (typeof field === "string" && !fieldErrors[field]) {
      fieldErrors[field] = issue.message;
    }
  }
  return fieldErrors;
}

export async function createFeePlan(
  enrolmentId: string,
  studentId: string,
  _prevState: FeeActionState,
  formData: FormData,
): Promise<FeeActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "You must be signed in." };
  }

  const context = await getCurrentCentreContext(supabase, user.id);
  if (!context) {
    return {
      status: "error",
      message: "No active centre membership found for this account.",
    };
  }

  try {
    await authorize(
      supabase,
      "fee.manage",
      context.organizationId,
      context.centreId,
    );
  } catch {
    return {
      status: "error",
      message: "You do not have permission to create fee plans.",
    };
  }

  const parsed = createFeePlanSchema.safeParse({
    totalRupees: formData.get("totalRupees")?.toString() ?? "",
    instalmentCount: formData.get("instalmentCount")?.toString() ?? "",
    firstDueDate: formData.get("firstDueDate")?.toString() ?? "",
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please fix the errors below.",
      fieldErrors: collectFieldErrors(parsed.error.issues),
    };
  }

  let totalPaise: number;
  try {
    totalPaise = fromRupees(parsed.data.totalRupees);
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof MoneyError ? error.message : "Enter a valid amount.",
    };
  }

  const { error } = await callRpc(supabase, "create_fee_plan", {
    p_organization_id: context.organizationId,
    p_centre_id: context.centreId,
    p_enrolment_id: enrolmentId,
    p_total_paise: totalPaise,
    p_instalment_count: parsed.data.instalmentCount,
    p_first_due_date: parsed.data.firstDueDate,
  });

  if (error) {
    return {
      status: "error",
      message: "Could not create the fee plan. Please try again.",
    };
  }

  revalidatePath(`/centre/fees/${studentId}`);
  revalidatePath("/centre/fees");

  return { status: "success", message: "Fee plan created." };
}

export async function postPayment(
  feePlanId: string,
  studentId: string,
  _prevState: FeeActionState,
  formData: FormData,
): Promise<FeeActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "You must be signed in." };
  }

  const context = await getCurrentCentreContext(supabase, user.id);
  if (!context) {
    return {
      status: "error",
      message: "No active centre membership found for this account.",
    };
  }

  try {
    await authorize(
      supabase,
      "payment.post",
      context.organizationId,
      context.centreId,
    );
  } catch {
    return {
      status: "error",
      message: "You do not have permission to post payments.",
    };
  }

  const parsed = postPaymentSchema.safeParse({
    amountRupees: formData.get("amountRupees")?.toString() ?? "",
    method: formData.get("method")?.toString() ?? "",
    reference: formData.get("reference")?.toString() ?? "",
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please fix the errors below.",
      fieldErrors: collectFieldErrors(parsed.error.issues),
    };
  }

  let amountPaise: number;
  try {
    amountPaise = fromRupees(parsed.data.amountRupees);
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof MoneyError ? error.message : "Enter a valid amount.",
    };
  }

  const { data, error } = await callRpc(supabase, "post_payment", {
    p_organization_id: context.organizationId,
    p_centre_id: context.centreId,
    p_student_id: studentId,
    p_fee_plan_id: feePlanId,
    p_amount_paise: amountPaise,
    p_method: parsed.data.method,
    p_reference: parsed.data.reference || null,
  });

  if (error || !data || data.length === 0) {
    // post_payment raises when the amount exceeds the outstanding balance;
    // surface that specific case rather than a generic failure.
    const overpaid = error?.message?.includes(
      "exceeds the outstanding balance",
    );
    return {
      status: "error",
      message: overpaid
        ? "That amount is more than the outstanding balance."
        : "Could not post the payment. Please try again.",
    };
  }

  revalidatePath(`/centre/fees/${studentId}`);
  revalidatePath("/centre/fees");

  return { status: "success", receiptNumber: data[0].receipt_number };
}
