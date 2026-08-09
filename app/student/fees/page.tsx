import Link from "next/link";
import type { Metadata } from "next";

import { StatusBadge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  KpiCard,
} from "@/components/ui/card";
import { EmptyState } from "@/components/states";
import { getStudentOverview } from "@/features/student-portal/queries";
import { formatPaise } from "@/lib/money";

export const metadata: Metadata = {
  title: "Fees and receipts",
  robots: { index: false },
};

export default async function StudentFeesPage() {
  const overview = await getStudentOverview();

  if (!overview) {
    return (
      <div>
        <h1 className="text-page-title text-navy-900">Fees and receipts</h1>
        <EmptyState
          className="mt-8"
          title="No student record"
          description="This login is not linked to a student record. Ask your centre."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-page-title text-navy-900">Fees and receipts</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard label="Course fee" value={formatPaise(overview.totalPaise)} />
        <KpiCard label="Paid so far" value={formatPaise(overview.paidPaise)} />
        <KpiCard label="Balance due" value={formatPaise(overview.duePaise)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Instalments</CardTitle>
        </CardHeader>
        <CardContent>
          {overview.instalments.length === 0 ? (
            <EmptyState
              title="No fee plan yet"
              description="Your instalment plan appears here once your centre sets it."
            />
          ) : (
            <ul className="divide-border divide-y">
              {overview.instalments.map((i) => (
                <li
                  key={i.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-3"
                >
                  <div>
                    <p className="text-body text-text font-semibold">
                      Instalment {i.sequence} · {formatPaise(i.amountPaise)}
                    </p>
                    <p className="text-meta text-text-secondary">
                      Due {i.dueDate}
                      {i.allocatedPaise > 0
                        ? ` · ${formatPaise(i.allocatedPaise)} received`
                        : ""}
                    </p>
                  </div>
                  <StatusBadge status={i.status} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Receipts</CardTitle>
        </CardHeader>
        <CardContent>
          {overview.receipts.length === 0 ? (
            <EmptyState
              title="No payments yet"
              description="Every payment you make gets a printable receipt here."
            />
          ) : (
            <ul className="divide-border divide-y">
              {overview.receipts.map((r) => (
                <li
                  key={r.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-3"
                >
                  <div>
                    <p className="text-body text-text font-semibold">
                      {r.receiptNumber} · {formatPaise(r.amountPaise)}
                    </p>
                    <p className="text-meta text-text-secondary">
                      {r.postedAt.slice(0, 10)} · {r.method}
                    </p>
                  </div>
                  <Link
                    href={`/student/receipt/${r.id}`}
                    className="text-body text-brand-600 font-semibold hover:underline"
                  >
                    View receipt
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
