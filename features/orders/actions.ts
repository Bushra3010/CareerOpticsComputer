"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/db/action";
import { callRpc } from "@/lib/db/rpc";
import { getCurrentCentreContext } from "@/features/centres/current-membership";
import { getDefaultLocationId } from "./queries";

import { cancelOrderSchema, cartSchema, dispatchSchema } from "./schema";

export interface OrderActionState {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string>;
}

function friendlyMessage(message: string, fallback: string): string {
  return message.replace(/^.*?:\s*/, "") || fallback;
}

/**
 * Cart -> order -> payment in one submit. `create_order` never touches stock
 * or the wallet (migration 0031); `pay_order` does both atomically. If
 * payment fails after the order is created — most likely an empty wallet —
 * the order is left sitting in `pending_payment` rather than lost, and the
 * order page offers "Pay now" to retry once the wallet is topped up.
 */
export async function placeOrder(
  centreId: string,
  _prev: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { status: "error", message: "You must be signed in." };
  }

  const context = await getCurrentCentreContext(supabase, user.id);
  if (!context || context.centreId !== centreId) {
    return { status: "error", message: "No active membership at this centre." };
  }

  let items: unknown;
  try {
    items = JSON.parse(formData.get("items")?.toString() ?? "[]");
  } catch {
    return { status: "error", message: "The cart could not be read." };
  }

  const parsed = cartSchema.safeParse(items);
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid cart.",
    };
  }

  const { data: orderId, error: createErr } = await callRpc(
    supabase,
    "create_order",
    {
      p_centre_id: centreId,
      p_items: parsed.data,
    },
  );

  if (createErr || !orderId) {
    return {
      status: "error",
      message: friendlyMessage(
        createErr?.message ?? "",
        "Could not place the order.",
      ),
    };
  }

  const locationId = await getDefaultLocationId();
  if (!locationId) {
    redirect(
      `/centre/orders/${orderId}?paymentError=${encodeURIComponent("No stock location is set up yet — ask head office to add one.")}`,
    );
  }

  const { error: payErr } = await callRpc(supabase, "pay_order", {
    p_order_id: orderId as string,
    p_location_id: locationId,
    p_idempotency_key: `order-${orderId}`,
  });

  revalidatePath("/centre/orders");
  if (payErr) {
    redirect(
      `/centre/orders/${orderId}?paymentError=${encodeURIComponent(friendlyMessage(payErr.message, "Payment could not be completed."))}`,
    );
  }

  redirect(`/centre/orders/${orderId}`);
}

/** Retries payment on an order still sitting in `pending_payment` — the
 *  recharge-and-retry path after `placeOrder` could not pay it. */
export async function payOrder(
  orderId: string,
  _prev: OrderActionState,
  _formData: FormData,
): Promise<OrderActionState> {
  const supabase = await createClient();

  const locationId = await getDefaultLocationId();
  if (!locationId) {
    return { status: "error", message: "No stock location is set up yet." };
  }

  const { error } = await callRpc(supabase, "pay_order", {
    p_order_id: orderId,
    p_location_id: locationId,
    p_idempotency_key: `order-${orderId}`,
  });

  if (error) {
    return {
      status: "error",
      message: friendlyMessage(
        error.message,
        "Payment could not be completed.",
      ),
    };
  }

  revalidatePath(`/centre/orders/${orderId}`);
  revalidatePath("/centre/orders");
  return { status: "success", message: "Payment completed." };
}

export async function dispatchOrder(
  orderId: string,
  _prev: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  const supabase = await createClient();

  const parsed = dispatchSchema.safeParse({
    courier: formData.get("courier")?.toString() ?? "",
    trackingNumber: formData.get("trackingNumber")?.toString() ?? "",
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { status: "error", fieldErrors };
  }

  const { error } = await callRpc(supabase, "dispatch_order", {
    p_order_id: orderId,
    p_courier: parsed.data.courier,
    p_tracking_number: parsed.data.trackingNumber || null,
  });

  if (error) {
    return {
      status: "error",
      message: friendlyMessage(error.message, "Could not dispatch the order."),
    };
  }

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  return { status: "success", message: "Order dispatched." };
}

export async function markOrderDelivered(
  orderId: string,
  _prev: OrderActionState,
  _formData: FormData,
): Promise<OrderActionState> {
  const supabase = await createClient();
  const { error } = await callRpc(supabase, "mark_order_delivered", {
    p_order_id: orderId,
  });

  if (error) {
    return {
      status: "error",
      message: friendlyMessage(
        error.message,
        "Could not mark the order delivered.",
      ),
    };
  }

  revalidatePath(`/centre/orders/${orderId}`);
  revalidatePath("/centre/orders");
  return { status: "success", message: "Delivery acknowledged." };
}

export async function cancelOrder(
  orderId: string,
  _prev: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  const supabase = await createClient();

  const parsed = cancelOrderSchema.safeParse({
    reason: formData.get("reason")?.toString() ?? "",
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "A reason is required.",
    };
  }

  const { error } = await callRpc(supabase, "cancel_order", {
    p_order_id: orderId,
    p_reason: parsed.data.reason,
  });

  if (error) {
    return {
      status: "error",
      message: friendlyMessage(error.message, "Could not cancel the order."),
    };
  }

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath(`/centre/orders/${orderId}`);
  revalidatePath("/admin/orders");
  revalidatePath("/centre/orders");
  return { status: "success", message: "Order cancelled." };
}
