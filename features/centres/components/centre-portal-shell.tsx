"use client";

import { PortalShell } from "@/components/layout/portal-shell";
import { CENTRE_BOTTOM_NAV, CENTRE_NAV } from "@/lib/navigation/centre-nav";

import { filterBottomNav, filterNavGroups } from "../nav-filter";

/**
 * The navigation definitions carry Lucide `icon` components, and a function
 * cannot cross the RSC boundary — passing CENTRE_NAV from the server layout
 * into PortalShell (a Client Component) fails with "Functions cannot be passed
 * directly to Client Components".
 *
 * So the nav is imported on this side of the boundary and the server sends
 * only serialisable data: the permission codes the user holds.
 */
export function CentrePortalShell({
  permissionCodes,
  centreName,
  headerAction,
  children,
}: {
  permissionCodes: string[];
  centreName: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
}) {
  const codes = new Set(permissionCodes);

  return (
    <PortalShell
      navGroups={filterNavGroups(CENTRE_NAV, codes)}
      bottomNavItems={filterBottomNav(CENTRE_BOTTOM_NAV, codes)}
      homeHref="/centre"
      profileHref="/centre/profile"
      title={centreName}
      breadcrumbs={[{ label: centreName, href: "/centre" }]}
      headerAction={headerAction}
    >
      {children}
    </PortalShell>
  );
}
