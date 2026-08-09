"use client";

import { PortalShell } from "@/components/layout/portal-shell";
import { STUDENT_BOTTOM_NAV, STUDENT_NAV } from "@/lib/navigation/student-nav";
import {
  filterBottomNav,
  filterNavGroups,
} from "@/features/centres/nav-filter";

/**
 * Students have no role_permissions — every destination is theirs by being
 * themselves, enforced by RLS's self-scoping on each table. The display
 * filter therefore passes an empty code set and only `planned` flags hide
 * anything, which is exactly what filterNavGroups does with items that
 * carry no permission field.
 */
export function StudentPortalShell({
  studentName,
  notificationCount = 0,
  headerAction,
  children,
}: {
  studentName: string;
  notificationCount?: number;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
}) {
  const none = new Set<string>();

  return (
    <PortalShell
      navGroups={filterNavGroups(STUDENT_NAV, none)}
      bottomNavItems={filterBottomNav(STUDENT_BOTTOM_NAV, none)}
      homeHref="/student"
      profileHref="/student/profile"
      title={studentName}
      breadcrumbs={[{ label: studentName, href: "/student" }]}
      notificationCount={notificationCount}
      headerAction={headerAction}
    >
      {children}
    </PortalShell>
  );
}
