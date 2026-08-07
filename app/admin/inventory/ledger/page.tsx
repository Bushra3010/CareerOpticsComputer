import Link from "next/link";
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
import { AdjustStockForm } from "@/features/inventory/components/adjust-stock-form";
import { ReceiveStockForm } from "@/features/inventory/components/receive-stock-form";
import {
  listActiveProductOptions,
  listInventoryLocations,
  listStockLedger,
} from "@/features/inventory/queries";

export const metadata: Metadata = {
  title: "Stock ledger",
  robots: { index: false },
};

const REASON_LABELS: Record<string, string> = {
  opening_stock: "Opening stock",
  purchase_receipt: "Purchase receipt",
  reservation: "Order reservation",
  dispatch: "Dispatch",
  return: "Return",
  adjustment: "Adjustment",
};

export default async function InventoryLedgerPage() {
  const supabase = await createClient();
  const context = await getHeadOfficeContext(supabase);

  if (!context) {
    return (
      <div>
        <h1 className="text-page-title text-navy-900">Stock ledger</h1>
        <PermissionDeniedState className="mt-8" />
      </div>
    );
  }

  const [ledger, locations, products] = await Promise.all([
    listStockLedger(),
    listInventoryLocations(),
    listActiveProductOptions(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/inventory"
          className="text-meta text-text-secondary hover:text-text"
        >
          &larr; Inventory
        </Link>
        <h1 className="text-page-title text-navy-900 mt-2">Stock ledger</h1>
        <p className="text-body text-text-secondary mt-1">
          Insert-only, like every other ledger in this system — a correction is
          a new adjustment row, never an edit to one already here.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Receive stock</CardTitle>
          </CardHeader>
          <CardContent>
            <ReceiveStockForm locations={locations} products={products} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Adjust stock</CardTitle>
          </CardHeader>
          <CardContent>
            <AdjustStockForm locations={locations} products={products} />
          </CardContent>
        </Card>
      </div>

      {ledger.length === 0 ? (
        <EmptyState
          title="No stock movements yet"
          description="Receive some stock above to get started."
        />
      ) : (
        <ResponsiveCollection
          list={
            <MobileList label="Stock ledger">
              {ledger.map((e) => (
                <MobileListItem
                  key={e.entrySeq}
                  title={e.productName}
                  subtitle={`${e.locationName} · ${REASON_LABELS[e.reason] ?? e.reason}`}
                  fields={[
                    {
                      label: "Change",
                      value:
                        e.quantityDelta > 0
                          ? `+${e.quantityDelta}`
                          : String(e.quantityDelta),
                    },
                    { label: "Balance", value: String(e.balanceAfter) },
                    { label: "Date", value: e.on },
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
                      Product
                    </th>
                    <th scope="col" className="text-label px-4 py-3">
                      Location
                    </th>
                    <th scope="col" className="text-label px-4 py-3">
                      Reason
                    </th>
                    <th scope="col" className="text-label px-4 py-3 text-right">
                      Change
                    </th>
                    <th scope="col" className="text-label px-4 py-3 text-right">
                      Balance
                    </th>
                    <th scope="col" className="text-label px-4 py-3">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ledger.map((e) => (
                    <tr key={e.entrySeq} className="border-border border-t">
                      <td className="text-body text-text px-4 py-3 font-semibold">
                        {e.productName}
                      </td>
                      <td className="text-body text-text-secondary px-4 py-3">
                        {e.locationName}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-body text-text">
                          {REASON_LABELS[e.reason] ?? e.reason}
                        </p>
                        {e.notes ? (
                          <p className="text-meta text-text-secondary">
                            {e.notes}
                          </p>
                        ) : null}
                        {e.reference ? (
                          <p className="text-meta text-text-secondary">
                            Ref: {e.reference}
                          </p>
                        ) : null}
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-semibold tabular-nums ${
                          e.quantityDelta > 0 ? "text-green-700" : "text-text"
                        }`}
                      >
                        {e.quantityDelta > 0
                          ? `+${e.quantityDelta}`
                          : e.quantityDelta}
                      </td>
                      <td className="text-body text-text px-4 py-3 text-right tabular-nums">
                        {e.balanceAfter}
                      </td>
                      <td className="text-body text-text-secondary px-4 py-3">
                        {e.on}
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
