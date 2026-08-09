import type { Metadata } from "next";

import { StatusBadge } from "@/components/ui/badge";
import { EmptyState, PermissionDeniedState } from "@/components/states";
import {
  MobileList,
  MobileListItem,
  ResponsiveCollection,
} from "@/components/tables/mobile-list";
import { createClient } from "@/lib/db/server";
import { can } from "@/lib/permissions";
import { getCurrentCentreContext } from "@/features/centres/current-membership";
import {
  listCommissionEntriesForCentre,
  listReferralCodesForCentre,
} from "@/features/referrals/queries";

export const metadata: Metadata = {
  title: "Referrals",
  robots: { index: false },
};

export default async function CentreReferralsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const context = user
    ? await getCurrentCentreContext(supabase, user.id)
    : null;

  // The matrix gives `referral.read` to the Centre Owner only — a manager or
  // counsellor gets the readable denial here, and RLS returns them nothing
  // anyway.
  const allowed =
    context !== null &&
    (await can(
      supabase,
      "referral.read",
      context.organizationId,
      context.centreId,
    ));

  if (!context || !allowed) {
    return (
      <div>
        <h1 className="text-page-title text-navy-900">Referrals</h1>
        <PermissionDeniedState className="mt-8" />
      </div>
    );
  }

  const [codes, commissions] = await Promise.all([
    listReferralCodesForCentre(),
    listCommissionEntriesForCentre(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-page-title text-navy-900">Referrals</h1>
        <p className="text-body text-text-secondary mt-1">
          Share your referral code. When head office attributes a referral to
          it, the commission appears below and is paid into your wallet.
        </p>
      </div>

      <div>
        <h2 className="text-section text-navy-900">Your codes</h2>
        {codes.length === 0 ? (
          <EmptyState
            className="mt-3"
            title="No referral code yet"
            description="Head office issues referral codes. Ask them for one to start referring."
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
                    Issued {c.createdOn}
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
        <h2 className="text-section text-navy-900">Commissions earned</h2>
        {commissions.length === 0 ? (
          <EmptyState
            className="mt-3"
            title="No commissions yet"
            description="When a referral qualifies, its commission appears here."
          />
        ) : (
          <ResponsiveCollection
            list={
              <MobileList label="Commissions">
                {commissions.map((e) => (
                  <MobileListItem
                    key={e.id}
                    title={e.amountLabel}
                    subtitle={`Recorded ${e.createdOn}`}
                    status={<StatusBadge status={e.status} />}
                  />
                ))}
              </MobileList>
            }
            table={
              <div className="border-border rounded-[var(--radius-card)] border">
                <table className="w-full text-left">
                  <thead className="bg-surface-subtle">
                    <tr>
                      <th
                        scope="col"
                        className="text-label px-4 py-3 text-right"
                      >
                        Amount
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
                    {commissions.map((e) => (
                      <tr key={e.id} className="border-border border-t">
                        <td className="text-body text-text px-4 py-3 text-right font-semibold tabular-nums">
                          {e.amountLabel}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={e.status} />
                        </td>
                        <td className="text-body text-text-secondary px-4 py-3">
                          {e.createdOn}
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
