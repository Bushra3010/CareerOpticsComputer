import type { Metadata } from "next";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  KpiCard,
} from "@/components/ui/card";
import { PermissionDeniedState } from "@/components/states";
import { createClient } from "@/lib/db/server";
import { getCurrentCentreContext } from "@/features/centres/current-membership";
import { getCentreReport } from "@/features/reports/queries";
import { formatPaise } from "@/lib/money";

export const metadata: Metadata = {
  title: "Reports",
  robots: { index: false },
};

export default async function CentreReportsPage() {
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
        <h1 className="text-page-title text-navy-900">Reports</h1>
        <PermissionDeniedState className="mt-8" />
      </div>
    );
  }

  const report = await getCentreReport(context.centreId);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-page-title text-navy-900">Reports</h1>
        <p className="text-body text-text-secondary mt-1">
          Live figures for your centre. Every number is counted from the records
          themselves, so it always agrees with the screen it came from.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-section-title text-navy-900">Admissions</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <KpiCard label="Active students" value={report.activeStudents} />
          <KpiCard
            label="Admitted this month"
            value={report.admittedThisMonth}
          />
          <KpiCard label="Active batches" value={report.activeBatches} />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-section-title text-navy-900">Money</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <KpiCard
            label="Fees collected this month"
            value={formatPaise(report.collectedThisMonthPaise)}
          />
          <KpiCard
            label="Outstanding fees"
            value={formatPaise(report.outstandingPaise)}
            context="Billed by fee plans, less everything received"
          />
          <KpiCard
            label="Cash box, net"
            value={formatPaise(report.cashboxNetPaise)}
            context="Income less expenses, excluding course fees"
          />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-section-title text-navy-900">Teaching</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <KpiCard
            label="Attendance, last 30 days"
            value={
              report.attendancePercent === null
                ? "—"
                : `${report.attendancePercent}%`
            }
            context={
              report.attendanceSessions === 0
                ? "No sessions recorded yet"
                : `Across ${report.attendanceSessions} sessions`
            }
          />
          <KpiCard
            label="Certificates issued"
            value={report.certificatesIssued}
          />
          <KpiCard label="Open support tickets" value={report.openTickets} />
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Published exam outcomes</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-meta text-text-secondary">Distinction</dt>
              <dd className="text-kpi text-navy-900 mt-0.5">
                {report.examOutcomes.distinction}
              </dd>
            </div>
            <div>
              <dt className="text-meta text-text-secondary">Passed</dt>
              <dd className="text-kpi text-navy-900 mt-0.5">
                {report.examOutcomes.passed}
              </dd>
            </div>
            <div>
              <dt className="text-meta text-text-secondary">Failed</dt>
              <dd className="text-kpi text-navy-900 mt-0.5">
                {report.examOutcomes.failed}
              </dd>
            </div>
          </dl>
          <p className="text-meta text-text-secondary mt-4">
            Counts published results only — an unpublished publication is not a
            result yet.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
