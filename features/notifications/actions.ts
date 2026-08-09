"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/db/action";
import { callRpc } from "@/lib/db/rpc";

export interface NotificationActionState {
  status: "idle" | "error" | "success";
  message?: string;
}

/**
 * Both functions scope themselves to the caller inside the database —
 * passing somebody else's notification id matches zero rows rather than
 * erroring, so there is nothing to authorise here beyond being signed in.
 */
export async function markNotificationRead(
  notificationId: string,
  _prev: NotificationActionState,
  _formData: FormData,
): Promise<NotificationActionState> {
  const supabase = await createClient();
  const { error } = await callRpc(supabase, "mark_notification_read", {
    p_notification_id: notificationId,
  });
  if (error) {
    return {
      status: "error",
      message: "Could not mark the notification read.",
    };
  }
  revalidatePath("/notifications");
  return { status: "success" };
}

export async function markAllNotificationsRead(
  _prev: NotificationActionState,
  _formData: FormData,
): Promise<NotificationActionState> {
  const supabase = await createClient();
  const { error } = await callRpc(supabase, "mark_all_notifications_read", {});
  if (error) {
    return { status: "error", message: "Could not mark notifications read." };
  }
  revalidatePath("/notifications");
  return { status: "success" };
}
