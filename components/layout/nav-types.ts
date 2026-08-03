import type { LucideIcon } from "lucide-react";

/**
 * Navigation model shared by the desktop sidebar and the mobile shell.
 *
 * Style guide §8.1: "Avoid more than two nested navigation levels." The type
 * enforces exactly two — a group and its items — so a third level cannot be
 * added without changing this file deliberately.
 */
export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Permission code required to see this item. Absent = always visible. */
  permission?: string;
  /** Unread/pending count shown as a small indicator. */
  badge?: number;
  /** Marks the item active for nested routes, e.g. /centre/students/[id]. */
  matchPrefix?: boolean;
}

export interface NavGroup {
  /** Compact, muted, sentence case (§8.1). Omit for the first ungrouped block. */
  label?: string;
  items: NavItem[];
}

/**
 * The up-to-five destinations of the mobile bottom bar (§9.2).
 * The tuple length is capped at five at the type level.
 */
export type BottomNavItems =
  | [NavItem, NavItem, NavItem]
  | [NavItem, NavItem, NavItem, NavItem]
  | [NavItem, NavItem, NavItem, NavItem, NavItem];
