import type { Metadata } from "next";

import { StatusBadge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  KpiCard,
} from "@/components/ui/card";
import { EmptyState, PermissionDeniedState } from "@/components/states";
import { createClient } from "@/lib/db/server";
import { getCurrentCentreContext } from "@/features/centres/current-membership";
import { RecordEntryForm } from "@/features/expenses/components/record-entry-form";
import { ReverseEntryButton } from "@/features/expenses/components/reverse-entry-button";
import { getExpenseLedger } from "@/features/expenses/queries";
import { formatPaise } from "@/lib/money";
import { businessDate } from "@/lib/dates";

export const metadata: Metadata = {
  title: "Income and expenses",
  robots: { index: false },
};

export default async function CentreExpensesPage() {
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
        <h1 className="text-page-title text-navy-900">Income and expenses</h1>
        <PermissionDeniedState className="mt-8" />
      </div>
    );
  }

  const ledger = await getExpenseLedger(context.centreId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-page-title text-navy-900">Income and expenses</h1>
        <p className="text-body text-text-secondary mt-1">
          The centre&rsquo;s own cash box — rent, salaries, printing income.
          Course fees are not recorded here; they have their own ledger under
          Fee management. Corrections are reversals, never edits.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard label="Income" value={formatPaise(ledger.incomePaise)} />
        <KpiCard label="Expenses" value={formatPaise(ledger.expensePaise)} />
        <KpiCard label="Net" value={formatPaise(ledger.netPaise)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Record an entry</CardTitle>
        </CardHeader>
        <CardContent>
          <RecordEntryForm today={businessDate()} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ledger</CardTitle>
        </CardHeader>
        <CardContent>
          {ledger.entries.length === 0 ? (
            <EmptyState
              title="Nothing recorded yet"
              description="The first entry you record appears here."
            />
          ) : (
            <ul className="divide-border divide-y">
              {ledger.entries.map((e) => (
                <li
                  key={e.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-body text-text font-semibold">
                      {e.category} · {e.amountLabel}
                    </p>
                    <p className="text-meta text-text-secondary">
                      {e.entryDate}
                      {e.note ? ` · ${e.note}` : ""}
                      {e.reversesEntryId ? " · reversal" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={e.entryType} />
                    {e.reversedById || e.reversesEntryId ? null : (
                      <ReverseEntryButton entryId={e.id} />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
