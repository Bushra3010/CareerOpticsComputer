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
import { listCentreOptions } from "@/features/exams/queries";
import { CreateCodeForm } from "@/features/referrals/components/create-code-form";
import { RecordReferralForm } from "@/features/referrals/components/record-referral-form";
import {
  listReferralCodesForAdmin,
  listReferralsForAdmin,
} from "@/features/referrals/queries";

export const metadata: Metadata = {
  title: "Referrals",
  robots: { index: false },
};

export default async function AdminReferralsPage() {
  const supabase = await createClient();
  const context = await getHeadOfficeContext(supabase);

  if (!context) {
    return (
      <div>
        <h1 className="text-page-title text-navy-900">Referrals</h1>
        <PermissionDeniedState className="mt-8" />
      </div>
    );
  }

  const [codes, referrals, centres] = await Promise.all([
    listReferralCodesForAdmin(),
    listReferralsForAdmin(),
    listCentreOptions(),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-page-title text-navy-900">Referrals</h1>
        <Link
          href="/admin/commissions"
          className="text-body text-brand-600 font-semibold hover:underline"
        >
          Commissions
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Issue a referral code</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateCodeForm centres={centres} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Record a referral</CardTitle>
        </CardHeader>
        <CardContent>
          <RecordReferralForm />
        </CardContent>
      </Card>

      <div>
        <h2 className="text-section text-navy-900">Codes issued</h2>
        {codes.length === 0 ? (
          <EmptyState
            className="mt-3"
            title="No codes issued yet"
            description="Issue one above."
          />
        ) : (
          <ul className="mt-3 space-y-2">
            {codes.map((c) => (
              <li
                key={c.id}
                className="border-border bg-surface flex items-center justify-between gap-3 rounded-[var(--radius-card)] border px-4 py-3"
              >
                <div>
                  <p className="text-body text-text font-semibold">{c.code}</p>
                  <p className="text-meta text-text-secondary">
                    {c.ownerLabel} &middot; issued {c.createdOn}
                    {c.validUntil ? ` · valid until ${c.validUntil}` : ""}
                  </p>
                </div>
                <StatusBadge status={c.status} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="text-section text-navy-900">Referrals recorded</h2>
        {referrals.length === 0 ? (
          <EmptyState
            className="mt-3"
            title="No referrals recorded yet"
            description="Record one above when someone uses a code."
          />
        ) : (
          <ResponsiveCollection
            list={
              <MobileList label="Referrals">
                {referrals.map((r) => (
                  <MobileListItem
                    key={r.id}
                    title={r.referredEntityLabel}
                    subtitle={`Code ${r.code}`}
                    status={<StatusBadge status={r.status} />}
                    fields={[
                      { label: "Type", value: r.referredEntityType },
                      { label: "Event", value: r.qualifyingEvent ?? "—" },
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
                        Referred
                      </th>
                      <th scope="col" className="text-label px-4 py-3">
                        Code
                      </th>
                      <th scope="col" className="text-label px-4 py-3">
                        Event
                      </th>
                      <th scope="col" className="text-label px-4 py-3">
                        Status
                      </th>
                      <th scope="col" className="text-label px-4 py-3">
                        Recorded
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {referrals.map((r) => (
                      <tr key={r.id} className="border-border border-t">
                        <td className="px-4 py-3">
                          <p className="text-body text-text font-semibold">
                            {r.referredEntityLabel}
                          </p>
                          <p className="text-meta text-text-secondary capitalize">
                            {r.referredEntityType}
                          </p>
                        </td>
                        <td className="text-body text-text-secondary px-4 py-3">
                          {r.code}
                        </td>
                        <td className="text-body text-text-secondary px-4 py-3">
                          {r.qualifyingEvent ?? "—"}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={r.status} />
                        </td>
                        <td className="text-body text-text-secondary px-4 py-3">
                          {r.createdOn}
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
    </div>
  );
}
