"use client";

import { PortalShell } from "@/components/layout/portal-shell";
import { ADMIN_BOTTOM_NAV, ADMIN_NAV } from "@/lib/navigation/admin-nav";
import {
  filterBottomNav,
  filterNavGroups,
} from "@/features/centres/nav-filter";

/**
 * Same RSC-boundary shape as CentrePortalShell: the nav definitions carry
 * icon components, so they are imported on this side and the server sends
 * only serialisable facts — the permission codes, and whether the viewer is
 * a platform admin.
 */
export function AdminPortalShell({
  permissionCodes,
  isPlatformAdmin,
  notificationCount = 0,
  headerAction,
  children,
}: {
  permissionCodes: string[];
  isPlatformAdmin: boolean;
  notificationCount?: number;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
}) {
  // A platform admin holds no role_permissions rows at all — their standing
  // is the profile flag, checked in RLS as app.is_platform_admin(). For the
  // display filter that means: every permission gate passes, and only the
  // `planned` flag still hides anything.
  const codes = isPlatformAdmin
    ? new Set(
        ADMIN_NAV.flatMap((g) =>
          g.items.map((i) => i.permission).filter((p): p is string => !!p),
        ),
      )
    : new Set(permissionCodes);

  return (
    <PortalShell
      navGroups={filterNavGroups(ADMIN_NAV, codes)}
      bottomNavItems={filterBottomNav(ADMIN_BOTTOM_NAV, codes)}
      homeHref="/admin"
      profileHref="/admin"
      title="Head office"
      breadcrumbs={[{ label: "Head office", href: "/admin" }]}
      notificationCount={notificationCount}
      headerAction={headerAction}
    >
      {children}
    </PortalShell>
  );
}
