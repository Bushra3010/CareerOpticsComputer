"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, CircleUserRound, HelpCircle, Search } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Desktop top bar — style guide §8.2.
 * 64px high, white surface with a bottom border, no large coloured banner.
 * Holds breadcrumb/page context, optional global search, notifications, help
 * and profile. Wallet balance may appear in the Centre portal "but must not
 * dominate every page", so it is a compact optional slot.
 */

export interface Breadcrumb {
  label: string;
  href?: string;
}

export function TopBar({
  breadcrumbs,
  searchSlot,
  searchWidth = "default",
  walletSlot,
  notificationCount = 0,
  profileHref,
  helpHref = "/support",
}: {
  breadcrumbs: Breadcrumb[];
  searchSlot?: React.ReactNode;
  /** `wide` suits a global search across several entity types. */
  searchWidth?: "default" | "wide";
  walletSlot?: React.ReactNode;
  notificationCount?: number;
  profileHref: string;
  helpHref?: string;
}) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 hidden h-[var(--size-topbar)] shrink-0 items-center gap-4",
        "border-border bg-surface border-b px-6 lg:flex",
      )}
    >
      <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
        <ol className="text-meta flex items-center gap-1.5">
          {breadcrumbs.map((crumb, i) => {
            const last = i === breadcrumbs.length - 1;
            return (
              <li
                key={`${crumb.label}-${i}`}
                className="flex items-center gap-1.5"
              >
                {i > 0 ? (
                  <span className="text-text-muted" aria-hidden="true">
                    /
                  </span>
                ) : null}
                {crumb.href && !last ? (
                  <Link
                    href={crumb.href}
                    className="text-text-secondary hover:text-text"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span
                    className={cn(
                      last ? "text-text font-semibold" : "text-text-secondary",
                    )}
                    aria-current={last ? "page" : undefined}
                  >
                    {crumb.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      {searchSlot ? (
        <div
          className={cn(
            "shrink-0",
            searchWidth === "wide" ? "w-96 max-w-[38%]" : "w-72",
          )}
        >
          {searchSlot}
        </div>
      ) : null}
      {walletSlot ? <div className="shrink-0">{walletSlot}</div> : null}

      <div className="flex shrink-0 items-center gap-1">
        <IconLink
          href="/notifications"
          label="Notifications"
          badge={notificationCount}
        >
          <Bell />
        </IconLink>
        <IconLink href={helpHref} label="Help and support">
          <HelpCircle />
        </IconLink>
        <IconLink href={profileHref} label="Your profile">
          <CircleUserRound />
        </IconLink>
      </div>
    </header>
  );
}

function IconLink({
  href,
  label,
  badge = 0,
  children,
}: {
  href: string;
  label: string;
  badge?: number;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={badge > 0 ? `${label}, ${badge} unread` : label}
      className={cn(
        "relative grid size-10 place-items-center rounded-[var(--radius-control)]",
        "text-text-secondary hover:bg-surface-subtle hover:text-text transition-colors",
        "[&_svg]:size-5",
      )}
    >
      {children}
      {badge > 0 ? (
        <span
          className="tabular absolute top-1.5 right-1.5 min-w-4 rounded-[var(--radius-pill)] bg-orange-500 px-1 text-center text-[11px] leading-4 font-semibold text-white"
          aria-hidden="true"
        >
          {badge > 9 ? "9+" : badge}
        </span>
      ) : null}
    </Link>
  );
}

/** Compact global search for the top bar. */
export function TopBarSearch({
  placeholder = "Search",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <Search
        className="text-text-muted pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
        aria-hidden="true"
      />
      <input
        type="search"
        placeholder={placeholder}
        aria-label={placeholder}
        className="border-border bg-canvas text-body placeholder:text-text-muted h-10 w-full rounded-[var(--radius-control)] border pr-3 pl-9"
        {...props}
      />
    </div>
  );
}
