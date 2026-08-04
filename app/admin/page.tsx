import {
  BookOpen,
  Building2,
  FileText,
  GraduationCap,
  UserPlus,
} from "lucide-react";

import { KpiCard } from "@/components/ui/card";
import { PermissionDeniedState } from "@/components/states";
import { createClient } from "@/lib/db/server";
import { getAdminDashboard } from "@/features/dashboard/queries";

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

  /* Every figure below is a cross-tenant aggregate, so gate the whole page on
     the platform-admin flag rather than rendering zeros to a signed-in centre
     user — zeros produced by RLS look like real data. */
  if (!profile?.is_platform_super_admin) {
    return (
      <div>
        <h1 className="text-page-title text-navy-900">Platform dashboard</h1>
        <PermissionDeniedState className="mt-8" />
      </div>
    );
  }

  const dashboard = await getAdminDashboard();

  return (
    <div>
      <h1 className="text-page-title text-navy-900">Platform dashboard</h1>
      <p className="text-body text-text-secondary mt-1">
        Signed in as {profile.full_name ?? user?.email}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <KpiCard
          label="Pending applications"
          value={dashboard.pendingApplications.toLocaleString("en-IN")}
          context="Awaiting head-office review"
          icon={<FileText />}
          href="/admin/centre-applications"
        />
        <KpiCard
          label="Active centres"
          value={dashboard.activeCentres.toLocaleString("en-IN")}
          context="Operating nationwide"
          icon={<Building2 />}
          href="/centres"
        />
        <KpiCard
          label="Students"
          value={dashboard.totalStudents.toLocaleString("en-IN")}
          context="Across all centres"
          icon={<GraduationCap />}
        />
        <KpiCard
          label="New enquiries"
          value={dashboard.newLeads.toLocaleString("en-IN")}
          context="Not yet contacted"
          icon={<UserPlus />}
        />
        <KpiCard
          label="Published courses"
          value={dashboard.publishedCourses.toLocaleString("en-IN")}
          context="Visible on the public site"
          icon={<BookOpen />}
          href="/courses"
        />
      </div>
    </div>
  );
}
