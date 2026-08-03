import { createClient } from "@/lib/db/server";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, is_platform_super_admin")
    .eq("id", user!.id)
    .maybeSingle();

  return (
    <div>
      <h1 className="text-page-title text-navy-900">Platform dashboard</h1>
      <p className="text-body text-text-secondary mt-2">
        Signed in as {profile?.full_name ?? user?.email}.
      </p>
      <p className="text-body text-text-secondary mt-1">
        {profile?.is_platform_super_admin
          ? "Platform super admin."
          : "No platform admin role — most admin features will be denied by RLS and authorize()."}
      </p>
    </div>
  );
}
