import Link from "next/link";
import {
  CalendarCheck,
  GraduationCap,
  IndianRupee,
  TriangleAlert,
} from "lucide-react";

import { KpiCard } from "@/components/ui/card";
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
        {dashboard.centreCode}
      </p>

      {/* Every tile drills down — §7.1 forbids decorative numbers with no
          accessible source list behind them. */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Active students"
          value={dashboard.activeStudents.toLocaleString("en-IN")}
          context="Currently enrolled"
          icon={<GraduationCap />}
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
          href="/centre/attendance"
        />
        <KpiCard
          label="Collected this month"
          value={formatPaise(dashboard.collectedThisMonth, {
            showDecimals: false,
          })}
          context="Payments posted"
          icon={<IndianRupee />}
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
          href="/centre/fees"
        />
      </div>

      <div className="mt-8 flex flex-wrap gap-4">
        <Link
          href="/centre/students/new"
          className="text-body font-semibold text-blue-700"
        >
          Admit a student
        </Link>
        <Link
          href="/centre/attendance/take"
          className="text-body font-semibold text-blue-700"
        >
          Take attendance
        </Link>
        <Link
          href="/centre/fees"
          className="text-body font-semibold text-blue-700"
        >
          Collect fees
        </Link>
      </div>
    </div>
  );
}
