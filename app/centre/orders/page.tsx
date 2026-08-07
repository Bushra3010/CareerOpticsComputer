import Link from "next/link";
import type { Metadata } from "next";

import { StatusBadge } from "@/components/ui/badge";
import { EmptyState, PermissionDeniedState } from "@/components/states";
import {
  MobileList,
  MobileListItem,
  ResponsiveCollection,
} from "@/components/tables/mobile-list";
import { createClient } from "@/lib/db/server";
import { getCurrentCentreContext } from "@/features/centres/current-membership";
import { listOrdersForCentre } from "@/features/orders/queries";

export const metadata: Metadata = {
  title: "My orders",
  robots: { index: false },
};

export default async function CentreOrdersPage() {
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
        <h1 className="text-page-title text-navy-900">My orders</h1>
        <PermissionDeniedState className="mt-8" />
      </div>
    );
  }

  const orders = await listOrdersForCentre(context.centreId);

  return (
    <div className="space-y-6">
      <h1 className="text-page-title text-navy-900">My orders</h1>

      {orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="Visit the shop to order books, ID cards or stationery."
        />
      ) : (
        <ResponsiveCollection
          list={
            <MobileList label="Orders">
              {orders.map((o) => (
                <MobileListItem
                  key={o.id}
                  title={o.orderNumber}
                  subtitle={`${o.itemCount} item${o.itemCount === 1 ? "" : "s"}`}
                  status={<StatusBadge status={o.status} />}
                  fields={[
                    { label: "Total", value: o.totalLabel },
                    { label: "Placed", value: o.placedOn },
                  ]}
                  href={`/centre/orders/${o.id}`}
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
                      Order
                    </th>
                    <th scope="col" className="text-label px-4 py-3 text-right">
                      Items
                    </th>
                    <th scope="col" className="text-label px-4 py-3 text-right">
                      Total
                    </th>
                    <th scope="col" className="text-label px-4 py-3">
                      Status
                    </th>
                    <th scope="col" className="text-label px-4 py-3">
                      Placed
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="border-border border-t">
                      <td className="px-4 py-3">
                        <Link
                          href={`/centre/orders/${o.id}`}
                          className="text-body text-brand-600 font-semibold hover:underline"
                        >
                          {o.orderNumber}
                        </Link>
                      </td>
                      <td className="text-body text-text px-4 py-3 text-right tabular-nums">
                        {o.itemCount}
                      </td>
                      <td className="text-body text-text px-4 py-3 text-right tabular-nums">
                        {o.totalLabel}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={o.status} />
                      </td>
                      <td className="text-body text-text-secondary px-4 py-3">
                        {o.placedOn}
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
