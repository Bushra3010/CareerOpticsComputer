import { redirect } from "next/navigation";

import { createClient } from "@/lib/db/server";
import { getCurrentCentreContext } from "@/features/centres/current-membership";
import { getPermissionCodes } from "@/features/centres/nav";
import { countUnreadNotifications } from "@/features/notifications/queries";
import { CentrePortalShell } from "@/features/centres/components/centre-portal-shell";
import { SignOutButton } from "@/features/auth/components/sign-out-button";

export default async function CentreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in/centre");
  }

  const context = await getCurrentCentreContext(supabase, user.id);

  // No membership means no navigation to build. The page itself renders the
  // explanation, so the shell would only wrap it in links that go nowhere.
  if (!context) {
    return (
      <div className="bg-canvas min-h-dvh">
        <main className="container-portal py-8">{children}</main>
      </div>
    );
  }

  const [codes, { data: centre }, unreadNotifications] = await Promise.all([
    getPermissionCodes(supabase, user.id, context.centreId),
    supabase
      .from("centres")
      .select("name")
      .eq("id", context.centreId)
      .maybeSingle(),
    countUnreadNotifications(),
  ]);

  return (
    <CentrePortalShell
      permissionCodes={[...codes]}
      centreName={centre?.name ?? "Centre"}
      notificationCount={unreadNotifications}
      headerAction={<SignOutButton />}
    >
      {children}
    </CentrePortalShell>
  );
}
