import { redirect } from "next/navigation";

import { LogoLockup } from "@/components/brand/logo";
import { SignOutButton } from "@/features/auth/components/sign-out-button";
import { createClient } from "@/lib/db/server";

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
