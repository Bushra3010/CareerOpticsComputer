"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoLockup, LogoMark } from "@/components/brand/logo";
import type { NavGroup } from "./nav-types";

/**
 * Desktop sidebar — style guide §8.1.
 * Expanded 256px / collapsed 72px, navy-900 background, 64–72px logo area,
 * labels at 88% white, icons at 76%, active item carries an orange left
 * indicator. Group headings are compact, muted and sentence case.
 */
export function Sidebar({
  groups,
  collapsed,
  onToggleCollapsed,
  homeHref,
}: {
  groups: NavGroup[];
  collapsed: boolean;
  onToggleCollapsed: () => void;
  homeHref: string;
}) {
  const pathname = usePathname();

  const isActive = (href: string, matchPrefix?: boolean) =>
    matchPrefix
      ? pathname === href || pathname.startsWith(`${href}/`)
      : pathname === href;

  return (
    <nav
      data-surface="navy"
      aria-label="Main"
      className={cn(
        "bg-sidebar sticky top-0 hidden h-dvh shrink-0 flex-col lg:flex",
        "transition-[width] duration-[var(--duration-standard)] ease-[var(--ease-out-standard)]",
        collapsed
          ? "w-[var(--size-sidebar-collapsed)]"
          : "w-[var(--size-sidebar)]",
      )}
    >
      {/* Logo area — 68px, within the 64–72px band the guide specifies. */}
      <div
        className={cn(
          "flex h-[68px] shrink-0 items-center",
          collapsed ? "justify-center px-2" : "px-4",
        )}
      >
        <Link
          href={homeHref}
          className="flex min-w-0 items-center rounded-[var(--radius-chip)]"
          aria-label="Career Optics home"
        >
          {collapsed ? (
            <span className="grid place-items-center rounded-[var(--radius-chip)] bg-white p-1">
              <LogoMark size="sm" priority />
            </span>
          ) : (
            <LogoLockup size="sm" surface="navy" priority />
          )}
        </Link>
      </div>

      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto pb-4">
        {groups.map((group, gi) => (
          <div
            key={group.label ?? `group-${gi}`}
            className="px-2 pt-3 first:pt-1"
          >
            {group.label && !collapsed ? (
              <p className="text-meta text-sidebar-muted px-3 pb-1.5 font-semibold">
                {group.label}
              </p>
            ) : null}
            {group.label && collapsed ? (
              <div
                className="mx-3 mb-2 border-t border-white/10"
                aria-hidden="true"
              />
            ) : null}

            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href, item.matchPrefix);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        "relative flex items-center gap-3 rounded-[var(--radius-control)]",
                        "text-label min-h-11 px-3 transition-colors duration-[var(--duration-standard)]",
                        collapsed && "justify-center px-0",
                        active
                          ? "bg-sidebar-active font-semibold text-white"
                          : "text-sidebar-fg hover:bg-sidebar-hover",
                      )}
                    >
                      {/* Orange left indicator (§8.1). Paired with a background
                          fill and bold weight so the active state is never
                          signalled by colour alone (§14). */}
                      {active ? (
                        <span
                          className="absolute top-1/2 left-0 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-orange-500"
                          aria-hidden="true"
                        />
                      ) : null}
                      <Icon
                        className={cn(
                          "size-[22px] shrink-0",
                          active ? "text-white" : "text-sidebar-icon",
                        )}
                        aria-hidden="true"
                      />
                      {!collapsed ? (
                        <span className="min-w-0 flex-1 truncate">
                          {item.label}
                        </span>
                      ) : null}
                      {item.badge && item.badge > 0 ? (
                        <span
                          className={cn(
                            "text-meta tabular rounded-[var(--radius-pill)] bg-orange-500 px-1.5 font-semibold text-white",
                            collapsed &&
                              "absolute top-1.5 right-2 px-1 py-0 leading-4",
                          )}
                        >
                          {item.badge > 99 ? "99+" : item.badge}
                          <span className="sr-only"> pending</span>
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="shrink-0 border-t border-white/10 p-2">
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-expanded={!collapsed}
          className={cn(
            "flex min-h-11 w-full items-center gap-3 rounded-[var(--radius-control)] px-3",
            "text-label text-sidebar-fg hover:bg-sidebar-hover",
            collapsed && "justify-center px-0",
          )}
        >
          {collapsed ? (
            <PanelLeftOpen className="size-[22px]" aria-hidden="true" />
          ) : (
            <PanelLeftClose className="size-[22px]" aria-hidden="true" />
          )}
          <span className={collapsed ? "sr-only" : undefined}>
            Collapse menu
          </span>
        </button>
      </div>
    </nav>
  );
}
