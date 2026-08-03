"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoMark } from "@/components/brand/logo";
import type { BottomNavItems, NavGroup } from "./nav-types";

/**
 * Mobile app shell — style guide §9.
 * "Mobile screens must look like a professional installed application."
 * Deliberately NOT a narrow rendering of the desktop shell: no sidebar, no
 * breadcrumb, no page description alongside the title (§9.1).
 */

/** App header — 56px plus the safe-area top inset (§9.1). */
export function AppHeader({
  title,
  backHref,
  action,
  surface = "light",
}: {
  title: string;
  /** Renders a back button in place of the compact logo. */
  backHref?: string;
  /** One contextual action or the notification/profile control. */
  action?: React.ReactNode;
  surface?: "light" | "navy";
}) {
  const onNavy = surface === "navy";

  return (
    <header
      data-surface={onNavy ? "navy" : undefined}
      className={cn(
        "pt-safe sticky top-0 z-30 lg:hidden",
        onNavy ? "bg-navy-900" : "border-border bg-surface border-b",
      )}
    >
      <div className="flex h-[var(--size-app-header)] items-center gap-2 px-2">
        {backHref ? (
          <Link
            href={backHref}
            aria-label="Back"
            className={cn(
              "grid size-11 shrink-0 place-items-center rounded-[var(--radius-control)]",
              onNavy ? "text-white" : "text-text-secondary",
            )}
          >
            <ArrowLeft className="size-5" aria-hidden="true" />
          </Link>
        ) : (
          <span
            className={cn(
              "ml-1 grid shrink-0 place-items-center",
              onNavy && "rounded-[var(--radius-chip)] bg-white p-0.5",
            )}
          >
            <LogoMark size="sm" className="size-9" />
          </span>
        )}

        <h1
          className={cn(
            "text-card-title min-w-0 flex-1 truncate font-semibold",
            onNavy ? "text-white" : "text-text",
          )}
        >
          {title}
        </h1>

        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </header>
  );
}

/**
 * Bottom navigation — §9.2.
 * 64px plus safe-area inset, maximum five destinations, labels always visible,
 * active tab uses navy icon/text with a small orange indicator.
 */
export function BottomNav({ items }: { items: BottomNavItems }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className={cn(
        "border-border bg-surface pb-safe fixed inset-x-0 bottom-0 z-30 border-t lg:hidden",
        "shadow-[var(--shadow-bottom-nav)]",
      )}
    >
      <ul className="flex h-[var(--size-bottom-nav)]">
        {items.map((item) => {
          const active = item.matchPrefix
            ? pathname === item.href || pathname.startsWith(`${item.href}/`)
            : pathname === item.href;
          const Icon = item.icon;

          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-full flex-col items-center justify-center gap-0.5",
                  active ? "text-navy-900" : "text-text-secondary",
                )}
              >
                {/* Small orange indicator (§9.2), above the icon so it never
                    overlaps the label. */}
                {active ? (
                  <span
                    className="absolute top-0 h-0.5 w-8 rounded-b-full bg-orange-500"
                    aria-hidden="true"
                  />
                ) : null}
                <span className="relative">
                  <Icon className="size-[22px]" aria-hidden="true" />
                  {item.badge && item.badge > 0 ? (
                    <span
                      className="absolute -top-1 -right-2 min-w-4 rounded-[var(--radius-pill)] bg-orange-500 px-1 text-center text-[11px] leading-4 font-semibold text-white"
                      aria-hidden="true"
                    >
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  ) : null}
                </span>
                {/* Labels remain visible; no unexplained icons (§9.2). */}
                <span
                  className={cn(
                    "text-[11px] leading-tight",
                    active && "font-semibold",
                  )}
                >
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/**
 * "More" destination content — §9.3: secondary navigation "opens a grouped
 * sheet or page, never a 20-item horizontal tab bar."
 */
export function MoreMenu({ groups }: { groups: NavGroup[] }) {
  return (
    <div className="space-y-6">
      {groups.map((group, gi) => (
        <section key={group.label ?? `group-${gi}`}>
          {group.label ? (
            <h2 className="text-meta text-text-secondary px-1 pb-2 font-semibold">
              {group.label}
            </h2>
          ) : null}
          <ul className="border-border bg-surface overflow-hidden rounded-[var(--radius-card)] border">
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <li
                  key={item.href}
                  className="border-border border-b last:border-b-0"
                >
                  <Link
                    href={item.href}
                    className="active:bg-surface-subtle flex min-h-[52px] items-center gap-3 px-4 py-3"
                  >
                    <Icon
                      className="text-text-secondary size-5 shrink-0"
                      aria-hidden="true"
                    />
                    <span className="text-body text-text min-w-0 flex-1 truncate">
                      {item.label}
                    </span>
                    {item.badge && item.badge > 0 ? (
                      <span className="bg-warning-bg text-meta text-warning tabular rounded-[var(--radius-pill)] px-2 font-semibold">
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
