import Link from "next/link";
import {
  BookOpen,
  ClipboardCheck,
  Building2,
  FileText,
  GraduationCap,
  UserPlus,
} from "lucide-react";

import { Card, KpiCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
      <h1 className="text-page-title text-navy-900">
        Good morning, {profile.full_name ?? "Super Admin"}
      </h1>
      <p className="text-body text-text-secondary mt-1">
        Platform overview across every centre
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">
        <KpiCard
          label="Pending applications"
          value={dashboard.pendingApplications.toLocaleString("en-IN")}
          context="Awaiting head-office review"
          icon={<FileText />}
          accent="orange"
          href="/admin/centre-applications"
        />
        <KpiCard
          label="Active centres"
          value={dashboard.activeCentres.toLocaleString("en-IN")}
          context="Operating nationwide"
          icon={<Building2 />}
          accent="navy"
          href="/centres"
        />
        <KpiCard
          label="Students"
          value={dashboard.totalStudents.toLocaleString("en-IN")}
          context="Across all centres"
          icon={<GraduationCap />}
          accent="blue"
        />
        <KpiCard
          label="New enquiries"
          value={dashboard.newLeads.toLocaleString("en-IN")}
          context="Not yet contacted"
          icon={<UserPlus />}
          accent="green"
        />
        <KpiCard
          label="Published courses"
          value={dashboard.publishedCourses.toLocaleString("en-IN")}
          context="Visible on the public site"
          icon={<BookOpen />}
          accent="blue"
          href="/courses"
        />
      </div>

      {/* Quick actions. §10.1: one most important action per region — the rest
          are secondary. See C4(b) in docs/02-open-conflicts.md. */}
      <Card className="mt-4 p-4 lg:mt-6 lg:p-5">
        <h2 className="text-card-title text-navy-900 mb-3">Quick actions</h2>
        <div className="tablet:grid-cols-3 grid gap-2">
          <Button asChild className="justify-start">
            <Link href="/admin/centre-applications">
              <ClipboardCheck /> Review applications
            </Link>
          </Button>
          <Button asChild variant="secondary" className="justify-start">
            <Link href="/centres">
              <Building2 /> Browse centres
            </Link>
          </Button>
          <Button asChild variant="secondary" className="justify-start">
            <Link href="/courses">
              <BookOpen /> Course catalogue
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
