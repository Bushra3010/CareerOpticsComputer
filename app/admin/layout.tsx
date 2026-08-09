import { redirect } from "next/navigation";

import { AdminPortalShell } from "@/components/layout/admin-portal-shell";
import { SignOutButton } from "@/features/auth/components/sign-out-button";
import { getHeadOfficeContext } from "@/features/exams/access";
import { getOrgPermissionCodes } from "@/features/centres/nav";
import { countUnreadNotifications } from "@/features/notifications/queries";
import { createClient } from "@/lib/db/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in/admin");
  }

  const context = await getHeadOfficeContext(supabase);

  // Signed in but with no head-office standing at all: no navigation to
  // build. The page itself renders the permission-denied state, so the
  // shell would only wrap it in links that go nowhere.
  if (!context) {
    return (
      <div className="bg-canvas min-h-dvh">
        <main className="container-portal py-8">{children}</main>
      </div>
    );
  }

  const [codes, unreadNotifications] = await Promise.all([
    getOrgPermissionCodes(supabase, user.id),
    countUnreadNotifications(),
  ]);

  return (
    <AdminPortalShell
      permissionCodes={[...codes]}
      isPlatformAdmin={context.isPlatformAdmin}
      notificationCount={unreadNotifications}
      headerAction={<SignOutButton />}
    >
      {children}
    </AdminPortalShell>
  );
}
