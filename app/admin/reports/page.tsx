import type { Metadata } from "next";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  KpiCard,
} from "@/components/ui/card";
import { EmptyState, PermissionDeniedState } from "@/components/states";
import {
  MobileList,
  MobileListItem,
  ResponsiveCollection,
} from "@/components/tables/mobile-list";
import { createClient } from "@/lib/db/server";
import { getHeadOfficeContext } from "@/features/exams/access";
import { getPlatformReport } from "@/features/reports/queries";
import { formatPaise } from "@/lib/money";

export const metadata: Metadata = {
  title: "Reports",
  robots: { index: false },
};

export default async function AdminReportsPage() {
  const supabase = await createClient();
  const context = await getHeadOfficeContext(supabase);

  if (!context) {
    return (
      <div>
        <h1 className="text-page-title text-navy-900">Reports</h1>
        <PermissionDeniedState className="mt-8" />
      </div>
    );
  }

  const report = await getPlatformReport();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-page-title text-navy-900">Reports</h1>
        <p className="text-body text-text-secondary mt-1">
          Platform figures as at {report.generatedOn}, counted from the records
          rather than stored anywhere.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-section-title text-navy-900">Network</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Centres"
            value={report.centresTotal}
            context={`${report.centresActive} active`}
          />
          <KpiCard
            label="Applications waiting"
            value={report.pendingApplications}
          />
          <KpiCard label="Active students" value={report.studentsTotal} />
          <KpiCard
            label="Admitted this month"
            value={report.admittedThisMonth}
          />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-section-title text-navy-900">Money</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Fees collected this month"
            value={formatPaise(report.collectedThisMonthPaise)}
          />
          <KpiCard
            label="Wallet balances"
            value={formatPaise(report.walletBalancePaise)}
            context="Sum of every centre's ledger"
          />
          <KpiCard
            label="Commission owed"
            value={formatPaise(report.commissionPayablePaise)}
            context="Approved and payable, not yet paid"
          />
          <KpiCard
            label="Orders to despatch"
            value={report.ordersAwaitingDispatch}
          />
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>By centre</CardTitle>
        </CardHeader>
        <CardContent>
          {report.centres.length === 0 ? (
            <EmptyState
              title="No centres yet"
              description="Approved centres appear here with their figures."
            />
          ) : (
            <ResponsiveCollection
              list={
                <MobileList label="Centres">
                  {report.centres.map((c) => (
                    <MobileListItem
                      key={c.centreId}
                      title={c.name}
                      fields={[
                        { label: "Students", value: String(c.students) },
                        {
                          label: "Collected",
                          value: formatPaise(c.collectedThisMonthPaise),
                        },
                      ]}
                    />
                  ))}
                </MobileList>
              }
              table={
                <div className="border-border rounded-[var(--radius-card)] border">
                  <table className="w-full text-left">
                    <thead className="bg-surface-subtle">
                      <tr>
                        <th scope="col" className="text-label px-4 py-3">
                          Centre
                        </th>
                        <th scope="col" className="text-label px-4 py-3">
                          Active students
                        </th>
                        <th
                          scope="col"
                          className="text-label px-4 py-3 text-right"
                        >
                          Collected this month
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.centres.map((c) => (
                        <tr key={c.centreId} className="border-border border-t">
                          <td className="text-body text-text px-4 py-3 font-semibold">
                            {c.name}
                          </td>
                          <td className="text-body text-text-secondary px-4 py-3">
                            {c.students}
                          </td>
                          <td className="text-body text-text px-4 py-3 text-right">
                            {formatPaise(c.collectedThisMonthPaise)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              }
            />
          )}
        </CardContent>
      </Card>

      <p className="text-meta text-text-secondary">
        Support: {report.openTickets} open{" "}
        {report.openTickets === 1 ? "ticket" : "tickets"} across the network.
      </p>
    </div>
  );
}
