import { redirect } from "next/navigation";

import { LogoLockup } from "@/components/brand/logo";
import { StudentPortalShell } from "@/components/layout/student-portal-shell";
import { SignOutButton } from "@/features/auth/components/sign-out-button";
import { countUnreadNotifications } from "@/features/notifications/queries";
import { createClient } from "@/lib/db/server";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in/student");
  }

  const { data: student, error } = await supabase
    .from("students")
    .select("full_name")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  // A login with no student record gets no navigation to nowhere — the page
  // itself explains. This is the pre-shell layout, kept for exactly this case.
  //
  // A *failed* query is not that case, and the two must not collapse into
  // one: observed in development, a request that errored transiently
  // rendered every page without its navigation, which looks like a broken
  // portal rather than a hiccup. On error the shell still renders.
  if (!student && !error) {
    return (
      <div className="bg-canvas min-h-dvh">
        <header className="bg-surface border-border flex items-center justify-between border-b px-6 py-4">
          <LogoLockup size="sm" surface="light" />
          <SignOutButton />
        </header>
        <main className="container-portal py-8">{children}</main>
      </div>
    );
  }

  const unreadNotifications = await countUnreadNotifications();

  return (
    <StudentPortalShell
      studentName={student?.full_name ?? "Student"}
      notificationCount={unreadNotifications}
      headerAction={<SignOutButton />}
    >
      {children}
    </StudentPortalShell>
  );
}
