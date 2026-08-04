import type {
  BottomNavItems,
  NavGroup,
  NavItem,
} from "@/components/layout/nav-types";

/**
 * Pure display filters, kept out of nav.ts so a Client Component can import
 * them without dragging in the Supabase client.
 *
 * Hiding a link is not access control. Every destination enforces its own
 * permission in the server action and again in RLS, so a user who types the
 * URL still gets nothing.
 */
function visible(item: NavItem, codes: Set<string>): boolean {
  // `planned` marks a route in the plan that has not been built. Showing it
  // would hand the user a 404 dressed up as a feature.
  if (item.planned) return false;
  return item.permission ? codes.has(item.permission) : true;
}

export function filterNavGroups(
  groups: NavGroup[],
  codes: Set<string>,
): NavGroup[] {
  return groups
    .map((g) => ({ ...g, items: g.items.filter((i) => visible(i, codes)) }))
    .filter((g) => g.items.length > 0);
}

/**
 * The bottom bar needs three to five items (§9.2, enforced by the tuple type).
 * If filtering drops it below three the type can no longer be satisfied, so
 * fall back to the unfiltered list rather than crash — a mobile user with a
 * very narrow role sees a couple of links they cannot use, which the
 * destination pages then refuse politely. That is the better failure.
 */
export function filterBottomNav(
  items: BottomNavItems,
  codes: Set<string>,
): BottomNavItems {
  const kept = items.filter((i) => visible(i, codes));
  return (kept.length >= 3 ? kept : items) as BottomNavItems;
}
