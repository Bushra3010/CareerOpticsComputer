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
import { getHeadOfficeContext } from "@/features/exams/access";
import { listOrdersForAdmin } from "@/features/orders/queries";

export const metadata: Metadata = {
  title: "Shop and orders",
  robots: { index: false },
};

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const context = await getHeadOfficeContext(supabase);

  if (!context) {
    return (
      <div>
        <h1 className="text-page-title text-navy-900">Shop and orders</h1>
        <PermissionDeniedState className="mt-8" />
      </div>
    );
  }

  const orders = await listOrdersForAdmin();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-page-title text-navy-900">Shop and orders</h1>
        <div className="flex gap-4">
          <Link
            href="/admin/products"
            className="text-body text-brand-600 font-semibold hover:underline"
          >
            Products
          </Link>
          <Link
            href="/admin/inventory"
            className="text-body text-brand-600 font-semibold hover:underline"
          >
            Inventory
          </Link>
        </div>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="Orders appear here once a centre checks out from the shop."
        />
      ) : (
        <ResponsiveCollection
          list={
            <MobileList label="Orders">
              {orders.map((o) => (
                <MobileListItem
                  key={o.id}
                  title={o.orderNumber}
                  subtitle={o.centreName}
                  status={<StatusBadge status={o.status} />}
                  fields={[
                    { label: "Items", value: String(o.itemCount) },
                    { label: "Total", value: o.totalLabel },
                    { label: "Placed", value: o.placedOn },
                  ]}
                  href={`/admin/orders/${o.id}`}
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
                    <th scope="col" className="text-label px-4 py-3">
                      Centre
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
                          href={`/admin/orders/${o.id}`}
                          className="text-body text-brand-600 font-semibold hover:underline"
                        >
                          {o.orderNumber}
                        </Link>
                      </td>
                      <td className="text-body text-text-secondary px-4 py-3">
                        {o.centreName}
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
