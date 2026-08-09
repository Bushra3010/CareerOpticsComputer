"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";

import {
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationActionState,
} from "../actions";
import type { NotificationRow } from "../queries";

const initial: NotificationActionState = { status: "idle" };

export function MarkAllReadButton() {
  const [, action, pending] = useActionState(markAllNotificationsRead, initial);
  return (
    <form action={action}>
      <Button
        type="submit"
        variant="secondary"
        size="sm"
        loading={pending}
        loadingLabel="Saving"
      >
        Mark all as read
      </Button>
    </form>
  );
}

export function NotificationItem({
  notification,
}: {
  notification: NotificationRow;
}) {
  const bound = markNotificationRead.bind(null, notification.id);
  const [, action, pending] = useActionState(bound, initial);
  const unread = notification.readAt === null;

  const content = (
    <>
      <p
        className={
          unread ? "text-body text-text font-semibold" : "text-body text-text"
        }
      >
        {notification.title}
      </p>
      {notification.body ? (
        <p className="text-meta text-text-secondary mt-0.5 line-clamp-2">
          {notification.body}
        </p>
      ) : null}
      <p className="text-meta text-text-secondary mt-1">
        {new Date(notification.createdAt).toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        })}
      </p>
    </>
  );

  return (
    <li
      className={
        unread
          ? "border-border bg-surface flex items-start justify-between gap-3 rounded-[var(--radius-card)] border border-l-4 border-l-orange-500 px-4 py-3"
          : "border-border bg-surface-subtle flex items-start justify-between gap-3 rounded-[var(--radius-card)] border px-4 py-3"
      }
    >
      <div className="min-w-0">
        {notification.href ? (
          <Link href={notification.href} className="block hover:underline">
            {content}
          </Link>
        ) : (
          content
        )}
      </div>
      {unread ? (
        <form action={action} className="shrink-0">
          <Button
            type="submit"
            variant="tertiary"
            size="sm"
            loading={pending}
            loadingLabel="Saving"
          >
            Mark read
          </Button>
        </form>
      ) : null}
    </li>
  );
}
