import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { LogoLockup } from "@/components/brand/logo";
import { EmptyState } from "@/components/states";
import { SignOutButton } from "@/features/auth/components/sign-out-button";
import {
  MarkAllReadButton,
  NotificationItem,
} from "@/features/notifications/components/notification-list";
import { listMyNotifications } from "@/features/notifications/queries";
import { createClient } from "@/lib/db/server";

export const metadata: Metadata = {
  title: "Notifications",
  robots: { index: false },
};

/**
 * One page for every portal — the centre shell's bell, and later the
 * student shell's, both land here. Which rows appear is decided entirely
 * by RLS (staff user id, or the student linked to this login), so the
 * page itself has no idea which portal sent the reader.
 */
export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const notifications = await listMyNotifications();
  const unread = notifications.filter((n) => n.readAt === null).length;

  return (
    <div className="bg-canvas min-h-dvh">
      <header className="bg-surface border-border flex items-center justify-between border-b px-6 py-4">
        <LogoLockup size="sm" surface="light" />
        <SignOutButton />
      </header>
      <main className="container-portal py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-page-title text-navy-900">Notifications</h1>
          {unread > 0 ? <MarkAllReadButton /> : null}
        </div>

        {notifications.length === 0 ? (
          <EmptyState
            className="mt-8"
            title="Nothing yet"
            description="Replies to your tickets, order updates and published results appear here."
          />
        ) : (
          <ul className="mt-6 space-y-2">
            {notifications.map((n) => (
              <NotificationItem key={n.id} notification={n} />
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
