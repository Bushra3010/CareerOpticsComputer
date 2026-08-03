import * as React from "react";
import {
  FileQuestion,
  Lock,
  RefreshCw,
  ServerCrash,
  WifiOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * The four states every screen must have — style guide §10.9, §16, and PRD §18
 * ("Empty, loading, error and permission states exist").
 *
 * These are components rather than a checklist so that a screen without them is
 * visibly incomplete during review.
 */

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: {
  title: string;
  /** One line. §10.9: "a clear title, one-line explanation and relevant action". */
  description: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-6 py-12 text-center",
        className,
      )}
    >
      <span
        className="bg-surface-subtle text-text-muted grid size-12 place-items-center rounded-full [&_svg]:size-6"
        aria-hidden="true"
      >
        {icon ?? <FileQuestion />}
      </span>
      <div>
        <p className="text-card-title text-text">{title}</p>
        <p className="text-body text-text-secondary mx-auto mt-1 max-w-sm">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}

/**
 * Permission-denied state — §10.9: "explains access level without leaking data."
 * Never name the record the user cannot see; that is an enumeration oracle.
 */
export function PermissionDeniedState({
  requiredFor = "this page",
  className,
}: {
  requiredFor?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-6 py-12 text-center",
        className,
      )}
    >
      <span
        className="bg-surface-subtle text-text-muted grid size-12 place-items-center rounded-full"
        aria-hidden="true"
      >
        <Lock className="size-6" />
      </span>
      <div>
        <p className="text-card-title text-text">
          You do not have access to {requiredFor}
        </p>
        <p className="text-body text-text-secondary mx-auto mt-1 max-w-sm">
          Your account does not include this permission. Ask your centre owner
          or head office if you need it.
        </p>
      </div>
    </div>
  );
}

/**
 * Error state. §10.9 requires offline, timeout and server error to be
 * distinguishable, so the kind is a required prop rather than free text.
 */
export function ErrorState({
  kind,
  onRetry,
  requestId,
  className,
}: {
  kind: "offline" | "timeout" | "server";
  onRetry?: () => void;
  /** Shown so support can correlate with server logs (PRD §12). */
  requestId?: string;
  className?: string;
}) {
  const copy = {
    offline: {
      icon: <WifiOff className="size-6" />,
      title: "You appear to be offline",
      body: "Nothing was lost. Reconnect and try again — unsaved work stays on this device until you do.",
    },
    timeout: {
      icon: <RefreshCw className="size-6" />,
      title: "That took too long to respond",
      body: "The server did not reply in time. This is usually temporary — try again in a moment.",
    },
    server: {
      icon: <ServerCrash className="size-6" />,
      title: "Something failed on our side",
      body: "Your action was not completed. Try again, and contact support with the reference below if it keeps happening.",
    },
  }[kind];

  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-6 py-12 text-center",
        className,
      )}
    >
      <span
        className="bg-danger-bg text-danger grid size-12 place-items-center rounded-full"
        aria-hidden="true"
      >
        {copy.icon}
      </span>
      <div>
        <p className="text-card-title text-text">{copy.title}</p>
        <p className="text-body text-text-secondary mx-auto mt-1 max-w-sm">
          {copy.body}
        </p>
        {requestId ? (
          <p className="text-meta text-text-muted mt-2" data-numeric>
            Reference: {requestId}
          </p>
        ) : null}
      </div>
      {onRetry ? (
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}

/**
 * Skeleton — §10.9: "Skeletons should resemble final content and avoid
 * continuous animation." The pulse is disabled under reduced-motion by the
 * global rule in globals.css.
 */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-surface-subtle animate-pulse rounded-[var(--radius-chip)]",
        className,
      )}
      aria-hidden="true"
      {...props}
    />
  );
}

/** Table loading placeholder shaped like the rows it replaces. */
export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="divide-border divide-y" role="status" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-4">
          <Skeleton className="size-9 rounded-full" />
          <Skeleton className="h-4 max-w-[180px] flex-1" />
          <Skeleton className="hidden h-4 w-24 lg:block" />
          <Skeleton className="hidden h-4 w-20 lg:block" />
          <Skeleton className="h-6 w-16 rounded-[var(--radius-pill)]" />
        </div>
      ))}
      <span className="sr-only">Loading results</span>
    </div>
  );
}
