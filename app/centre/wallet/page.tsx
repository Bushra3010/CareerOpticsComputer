import type { Metadata } from "next";

import { StatusBadge } from "@/components/ui/badge";
import { KpiCard } from "@/components/ui/card";
import { EmptyState } from "@/components/states";
import {
  MobileList,
  MobileListItem,
  ResponsiveCollection,
} from "@/components/tables/mobile-list";
import { Wallet } from "lucide-react";
import { createClient } from "@/lib/db/server";
import { getCurrentCentreContext } from "@/features/centres/current-membership";
import { getWallet } from "@/features/wallet/queries";

export const metadata: Metadata = { title: "Wallet", robots: { index: false } };

export default async function WalletPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const context = user
    ? await getCurrentCentreContext(supabase, user.id)
    : null;
  const wallet = context
    ? await getWallet(context.centreId)
    : { balancePaise: 0, balanceLabel: "₹0.00", entries: [] };

  return (
    <div>
      <h1 className="text-page-title text-navy-900">Wallet</h1>
      <p className="text-body text-text-secondary mt-1">
        Recharges are recorded by head office when your payment is received. The
        balance is always the sum of the ledger below.
      </p>

      <div className="mt-6 max-w-xs">
        <KpiCard
          label="Available balance"
          value={wallet.balanceLabel}
          icon={<Wallet aria-hidden="true" />}
          context="Sum of all ledger entries"
        />
      </div>

      {wallet.entries.length === 0 ? (
        <EmptyState
          className="mt-8"
          title="No wallet activity yet"
          description="Entries appear here when head office records a recharge or the system takes a fee."
        />
      ) : (
        <div className="mt-6">
          <ResponsiveCollection
            list={
              <MobileList label="Wallet ledger">
                {wallet.entries.map((e) => (
                  <MobileListItem
                    key={e.seq}
                    title={`${e.isCredit ? "+" : "−"}${e.amountLabel}`}
                    subtitle={e.reason}
                    status={
                      <StatusBadge
                        status={e.isCredit ? "paid" : "pending"}
                        label={e.typeLabel}
                      />
                    }
                    fields={[
                      { label: "Date", value: e.on },
                      { label: "Ref", value: e.reference ?? "—" },
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
                        Entry
                      </th>
                      <th scope="col" className="text-label px-4 py-3">
                        Reference
                      </th>
                      <th scope="col" className="text-label px-4 py-3">
                        Date
                      </th>
                      <th
                        scope="col"
                        className="text-label px-4 py-3 text-right"
                      >
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {wallet.entries.map((e) => (
                      <tr key={e.seq} className="border-border border-t">
                        <td className="px-4 py-3">
                          <p className="text-body text-text font-semibold">
                            {e.typeLabel}
                          </p>
                          <p className="text-meta text-text-secondary">
                            {e.reason}
                          </p>
                        </td>
                        <td className="text-body text-text-secondary px-4 py-3">
                          {e.reference ?? "—"}
                        </td>
                        <td className="text-body text-text-secondary px-4 py-3">
                          {e.on}
                        </td>
                        <td
                          className={`text-body px-4 py-3 text-right font-semibold tabular-nums ${
                            e.isCredit ? "text-green-700" : "text-text"
                          }`}
                        >
                          {e.isCredit ? "+" : "−"}
                          {e.amountLabel}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            }
          />
        </div>
      )}
    </div>
  );
}
