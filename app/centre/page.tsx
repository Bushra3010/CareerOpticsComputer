import Link from "next/link";
import {
  CalendarCheck,
  GraduationCap,
  IndianRupee,
  Receipt,
  TriangleAlert,
  UserPlus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, KpiCard } from "@/components/ui/card";
import { EmptyState } from "@/components/states";
import { createClient } from "@/lib/db/server";
import { formatPaise } from "@/lib/money";
import { getCurrentCentreContext } from "@/features/centres/current-membership";
import { getCentreDashboard } from "@/features/dashboard/queries";

export default async function CentreDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const context = user
    ? await getCurrentCentreContext(supabase, user.id)
    : null;

  if (!context) {
    return (
      <div>
        <h1 className="text-page-title text-navy-900">Centre dashboard</h1>
        <EmptyState
          className="mt-8"
          title="No active centre membership"
          description="This account is not linked to an active centre. Ask your head office to check your invitation."
        />
      </div>
    );
  }

  const dashboard = await getCentreDashboard(context.centreId);

  if (!dashboard) {
    return (
      <div>
        <h1 className="text-page-title text-navy-900">Centre dashboard</h1>
        <EmptyState
          className="mt-8"
          title="Centre unavailable"
          description="Your centre could not be loaded. It may have been suspended — contact head office."
        />
      </div>
    );
  }

  const attendanceValue = dashboard.attendanceToday
    ? `${dashboard.attendanceToday.present}/${dashboard.attendanceToday.marked}`
    : "Not taken";

  return (
    <div>
      <h1 className="text-page-title text-navy-900">{dashboard.centreName}</h1>
      <p className="text-body text-text-secondary mt-1">
        {dashboard.centreCode} · today&rsquo;s operations
      </p>

      {/* Every tile drills down — §7.1 forbids decorative numbers with no
          accessible source list behind them. */}
      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <KpiCard
          label="Active students"
          value={dashboard.activeStudents.toLocaleString("en-IN")}
          context="Currently enrolled"
          icon={<GraduationCap />}
          accent="navy"
          href="/centre/students"
        />
        <KpiCard
          label="Attendance today"
          value={attendanceValue}
          context={
            dashboard.attendanceToday
              ? "Present of marked"
              : "No session recorded yet"
          }
          icon={<CalendarCheck />}
          accent="green"
          href="/centre/attendance"
        />
        <KpiCard
          label="Collected this month"
          value={formatPaise(dashboard.collectedThisMonth, {
            showDecimals: false,
          })}
          context="Payments posted"
          icon={<IndianRupee />}
          accent="blue"
          href="/centre/fees"
        />
        <KpiCard
          label="Outstanding dues"
          value={formatPaise(dashboard.outstandingDues, {
            showDecimals: false,
          })}
          context={
            dashboard.overdueInstalments > 0
              ? `${dashboard.overdueInstalments} instalment${dashboard.overdueInstalments === 1 ? "" : "s"} past due`
              : "Nothing past due"
          }
          icon={<TriangleAlert />}
          accent="orange"
          href="/centre/fees"
        />
      </div>

      {/* Quick actions. §10.1 allows one most important action per region, so
          one orange primary and the rest secondary — see C4(b). */}
      <Card className="mt-4 p-4 lg:mt-6 lg:p-5">
        <h2 className="text-card-title text-navy-900 mb-3">Quick actions</h2>
        <div className="tablet:grid-cols-3 grid gap-2">
          <Button asChild className="justify-start">
            <Link href="/centre/students/new">
              <UserPlus /> Admit a student
            </Link>
          </Button>
          <Button asChild variant="secondary" className="justify-start">
            <Link href="/centre/attendance/take">
              <CalendarCheck /> Take attendance
            </Link>
          </Button>
          <Button asChild variant="secondary" className="justify-start">
            <Link href="/centre/fees">
              <Receipt /> Collect fees
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
