import type { Metadata } from "next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, PermissionDeniedState } from "@/components/states";
import {
  MobileList,
  MobileListItem,
  ResponsiveCollection,
} from "@/components/tables/mobile-list";
import { createClient } from "@/lib/db/server";
import { getHeadOfficeContext } from "@/features/exams/access";
import { listCentreWalletSummaries } from "@/features/wallet/queries";
import { RechargeForm } from "@/features/wallet/components/recharge-form";

export const metadata: Metadata = {
  title: "Wallets",
  robots: { index: false },
};

export default async function AdminWalletsPage() {
  const supabase = await createClient();
  const context = await getHeadOfficeContext(supabase);

  if (!context) {
    return (
      <div>
        <h1 className="text-page-title text-navy-900">Wallets</h1>
        <PermissionDeniedState className="mt-8" />
      </div>
    );
  }

  const centres = await listCentreWalletSummaries();
  const totalPaise = centres.reduce((n, c) => n + c.balancePaise, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-page-title text-navy-900">Wallets</h1>
        <p className="text-body text-text-secondary mt-1">
          Record a recharge after a centre&rsquo;s offline payment is received.
          Every balance below is the sum of its own ledger, never a stored
          figure.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recharge a centre</CardTitle>
        </CardHeader>
        <CardContent>
          <RechargeForm
            centres={centres.map((c) => ({
              centreId: c.centreId,
              centreName: c.centreName,
              centreCode: c.centreCode,
            }))}
          />
        </CardContent>
      </Card>

      {centres.length === 0 ? (
        <EmptyState
          title="No active centres"
          description="Wallets appear once a centre is active."
        />
      ) : (
        <ResponsiveCollection
          list={
            <MobileList label="Centre wallets">
              {centres.map((c) => (
                <MobileListItem
                  key={c.centreId}
                  title={c.centreName}
                  subtitle={c.centreCode}
                  fields={[{ label: "Balance", value: c.balanceLabel }]}
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
                    <th scope="col" className="text-label px-4 py-3 text-right">
                      Balance
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {centres.map((c) => (
                    <tr key={c.centreId} className="border-border border-t">
                      <td className="px-4 py-3">
                        <p className="text-body text-text font-semibold">
                          {c.centreName}
                        </p>
                        <p className="text-meta text-text-secondary">
                          {c.centreCode}
                        </p>
                      </td>
                      <td className="text-body px-4 py-3 text-right font-semibold tabular-nums">
                        {c.balanceLabel}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-border border-t">
                    <td className="text-body px-4 py-3 font-semibold">Total</td>
                    <td className="text-body px-4 py-3 text-right font-semibold tabular-nums">
                      {(totalPaise / 100).toLocaleString("en-IN", {
                        style: "currency",
                        currency: "INR",
                        maximumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          }
        />
      )}
    </div>
  );
}
