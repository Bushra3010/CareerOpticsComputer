import Link from "next/link";
import type { Metadata } from "next";

import { StatusBadge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, PermissionDeniedState } from "@/components/states";
import {
  MobileList,
  MobileListItem,
  ResponsiveCollection,
} from "@/components/tables/mobile-list";
import { createClient } from "@/lib/db/server";
import { getHeadOfficeContext } from "@/features/exams/access";
import {
  ApproveCommissionButton,
  MarkCommissionPayableButton,
  PayCommissionButton,
  ReverseCommissionButton,
} from "@/features/referrals/components/commission-lifecycle-buttons";
import { QualifyReferralForm } from "@/features/referrals/components/qualify-referral-form";
import {
  listCommissionEntriesForAdmin,
  listPendingReferrals,
} from "@/features/referrals/queries";

export const metadata: Metadata = {
  title: "Commissions",
  robots: { index: false },
};

export default async function AdminCommissionsPage() {
  const supabase = await createClient();
  const context = await getHeadOfficeContext(supabase);

  if (!context) {
    return (
      <div>
        <h1 className="text-page-title text-navy-900">Commissions</h1>
        <PermissionDeniedState className="mt-8" />
      </div>
    );
  }

  const [entries, pendingReferrals] = await Promise.all([
    listCommissionEntriesForAdmin(),
    listPendingReferrals(),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-page-title text-navy-900">Commissions</h1>
        <div className="flex gap-4">
          <Link
            href="/admin/commissions/rules"
            className="text-body text-brand-600 font-semibold hover:underline"
          >
            Rules
          </Link>
          <Link
            href="/admin/referrals"
            className="text-body text-brand-600 font-semibold hover:underline"
          >
            Referrals
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Qualify a referral</CardTitle>
        </CardHeader>
        <CardContent>
          <QualifyReferralForm referrals={pendingReferrals} />
        </CardContent>
      </Card>

      {entries.length === 0 ? (
        <EmptyState
          title="No commission entries yet"
          description="Qualify a referral above to create one."
        />
      ) : (
        <ResponsiveCollection
          list={
            <MobileList label="Commission entries">
              {entries.map((e) => (
                <MobileListItem
                  key={e.id}
                  title={e.beneficiaryLabel}
                  subtitle={e.amountLabel}
                  status={<StatusBadge status={e.status} />}
                  fields={[{ label: "Recorded", value: e.createdOn }]}
                  action={<CommissionActions id={e.id} status={e.status} />}
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
                      Beneficiary
                    </th>
                    <th scope="col" className="text-label px-4 py-3 text-right">
                      Amount
                    </th>
                    <th scope="col" className="text-label px-4 py-3">
                      Status
                    </th>
                    <th scope="col" className="text-label px-4 py-3">
                      Recorded
                    </th>
                    <th scope="col" className="text-label px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e) => (
                    <tr key={e.id} className="border-border border-t">
                      <td className="text-body text-text px-4 py-3 font-semibold">
                        {e.beneficiaryLabel}
                      </td>
                      <td className="text-body text-text px-4 py-3 text-right tabular-nums">
                        {e.amountLabel}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={e.status} />
                      </td>
                      <td className="text-body text-text-secondary px-4 py-3">
                        {e.createdOn}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <CommissionActions id={e.id} status={e.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          }
        />
      )}
    </div>
  );
}

function CommissionActions({ id, status }: { id: string; status: string }) {
  return (
    <div className="flex flex-wrap justify-end gap-2">
      {status === "pending" ? (
        <ApproveCommissionButton commissionEntryId={id} />
      ) : null}
      {status === "approved" ? (
        <MarkCommissionPayableButton commissionEntryId={id} />
      ) : null}
      {status === "payable" ? (
        <PayCommissionButton commissionEntryId={id} />
      ) : null}
      {status !== "reversed" ? (
        <ReverseCommissionButton commissionEntryId={id} />
      ) : null}
    </div>
  );
}
