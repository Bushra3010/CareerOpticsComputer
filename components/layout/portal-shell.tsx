"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "./sidebar";
import { TopBar, type Breadcrumb } from "./top-bar";
import { AppHeader, BottomNav } from "./mobile-shell";
import type { BottomNavItems, NavGroup } from "./nav-types";

/**
 * Portal shell — composes the desktop shell (§8) and the mobile app shell (§9)
 * into one layout. Which one is visible is a pure CSS decision at `lg`, so both
 * render server-side and there is no first-paint flash.
 *
 * Used by app/admin, app/centre and app/student layouts. Deliberately NOT used
 * by app/exam: §11.5 requires an active exam attempt to have no global
 * navigation at all.
 */
export function PortalShell({
  navGroups,
  bottomNavItems,
  homeHref,
  profileHref,
  title,
  breadcrumbs,
  backHref,
  searchSlot,
  searchWidth,
  portalName,
  walletSlot,
  headerAction,
  notificationCount,
  children,
}: {
  navGroups: NavGroup[];
  bottomNavItems: BottomNavItems;
  homeHref: string;
  profileHref: string;
  /** Mobile app-header title. */
  title: string;
  breadcrumbs: Breadcrumb[];
  backHref?: string;
  searchSlot?: React.ReactNode;
  searchWidth?: "default" | "wide";
  /** Shown under the sidebar wordmark, e.g. "Super Admin". */
  portalName?: string;
  walletSlot?: React.ReactNode;
  headerAction?: React.ReactNode;
  notificationCount?: number;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div className="flex min-h-dvh w-full">
      <Sidebar
        groups={navGroups}
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((c) => !c)}
        homeHref={homeHref}
        portalName={portalName}
      />

      {/* min-w-0 stops a wide table from forcing the whole page to scroll
          horizontally — §6: "No unintended horizontal scrolling at 360px." */}
      <div className="flex min-w-0 flex-1 flex-col">
        <a href="#main" className="sr-only-focusable">
          Skip to main content
        </a>

        <AppHeader title={title} backHref={backHref} action={headerAction} />
        <TopBar
          breadcrumbs={breadcrumbs}
          searchSlot={searchSlot}
          searchWidth={searchWidth}
          walletSlot={walletSlot}
          profileHref={profileHref}
          notificationCount={notificationCount}
        />

        <main
          id="main"
          className={cn(
            "container-portal flex-1 py-4 lg:py-6",
            // Reserve space so the fixed bottom nav never covers content
            // (§9.2: "must never cover content or sticky actions").
            "pb-[calc(var(--size-bottom-nav)+1rem)] lg:pb-6",
          )}
        >
          {children}
        </main>

        <BottomNav items={bottomNavItems} />
      </div>
    </div>
  );
}

/**
 * Page header — style guide §8.3.
 * "Header row: title and concise description left; one primary action and
 * optional secondary actions right."
 *
 * The description is hidden below `lg` because §9.1 forbids showing the desktop
 * title *and* description together on mobile, where the app header already
 * carries the title.
 */
export function PageHeader({
  title,
  description,
  primaryAction,
  secondaryActions,
  className,
}: {
  title: string;
  description?: string;
  primaryAction?: React.ReactNode;
  secondaryActions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-4 flex flex-wrap items-start justify-between gap-3 lg:mb-6",
        className,
      )}
    >
      <div className="min-w-0">
        {/* Desktop shows the page title; on mobile the app header owns it, so
            this h1 is visually hidden rather than duplicated (§9.1). */}
        <h1 className="text-page-title text-navy-900 max-lg:sr-only">
          {title}
        </h1>
        {description ? (
          <p className="text-body text-text-secondary mt-1 hidden max-w-2xl lg:block">
            {description}
          </p>
        ) : null}
      </div>

      {primaryAction || secondaryActions ? (
        // Full width on mobile so the primary action is a comfortable target
        // rather than a small right-aligned button; right-aligned on desktop.
        <div className="flex w-full shrink-0 items-center gap-2 lg:w-auto max-lg:[&>*]:flex-1">
          {secondaryActions}
          {primaryAction}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Filter row — §8.3: "Filter row sits below title and remains sticky on long
 * operational pages where useful." On mobile, filters belong in a bottom sheet
 * (§9.3), so pass the sheet trigger as `mobileTrigger`.
 */
export function FilterBar({
  children,
  mobileTrigger,
  sticky = false,
  className,
}: {
  children: React.ReactNode;
  mobileTrigger?: React.ReactNode;
  sticky?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border-border bg-surface mb-4 rounded-[var(--radius-card)] border p-3",
        sticky && "lg:sticky lg:top-[calc(var(--size-topbar)+1rem)] lg:z-20",
        className,
      )}
    >
      <div className="hidden flex-wrap items-center gap-2 lg:flex">
        {children}
      </div>
      <div className="lg:hidden">{mobileTrigger ?? children}</div>
    </div>
  );
}
