import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { StatusBadge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PermissionDeniedState } from "@/components/states";
import { createClient } from "@/lib/db/server";
import { getHeadOfficeContext } from "@/features/exams/access";
import { CancelOrderButton } from "@/features/orders/components/cancel-order-button";
import { DispatchForm } from "@/features/orders/components/dispatch-form";
import { getOrderDetail } from "@/features/orders/queries";

export const metadata: Metadata = { title: "Order", robots: { index: false } };

const DISPATCHABLE = new Set(["confirmed", "processing", "packed"]);
const CANCELLABLE = new Set([
  "pending_payment",
  "confirmed",
  "processing",
  "packed",
]);

export default async function AdminOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const context = await getHeadOfficeContext(supabase);

  if (!context) {
    return (
      <div>
        <h1 className="text-page-title text-navy-900">Order</h1>
        <PermissionDeniedState className="mt-8" />
      </div>
    );
  }

  const order = await getOrderDetail(id);
  if (!order) notFound();

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/orders"
          className="text-meta text-text-secondary hover:text-text"
        >
          &larr; All orders
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-page-title text-navy-900">
              {order.orderNumber}
            </h1>
            <p className="text-body text-text-secondary mt-1">
              {order.centreName}
            </p>
          </div>
          <StatusBadge status={order.status} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ul className="space-y-2">
            {order.items.map((i) => (
              <li
                key={i.id}
                className="flex items-center justify-between gap-3"
              >
                <div>
                  <p className="text-body text-text">{i.productName}</p>
                  <p className="text-meta text-text-secondary">
                    {i.sku} &middot; {i.quantity} &times; {i.unitPriceLabel}
                  </p>
                </div>
                <p className="text-body text-text tabular-nums">
                  {i.lineTotalLabel}
                </p>
              </li>
            ))}
          </ul>
          <div className="border-border space-y-1 border-t pt-3 text-right">
            <p className="text-meta text-text-secondary">
              Subtotal {order.subtotalLabel}
            </p>
            <p className="text-meta text-text-secondary">
              Tax {order.taxLabel}
            </p>
            <p className="text-body text-text font-semibold">
              Total {order.totalLabel}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent className="text-body text-text-secondary space-y-1">
          <p>Placed {order.placedOn}</p>
          {order.confirmedOn ? <p>Paid {order.confirmedOn}</p> : null}
          {order.dispatchedOn ? <p>Dispatched {order.dispatchedOn}</p> : null}
          {order.deliveredOn ? <p>Delivered {order.deliveredOn}</p> : null}
          {order.cancelledOn ? (
            <p>
              Cancelled {order.cancelledOn} &mdash; {order.cancelledReason}
            </p>
          ) : null}
          {order.shipment ? (
            <p>
              Shipment: {order.shipment.courier}
              {order.shipment.trackingNumber
                ? ` (${order.shipment.trackingNumber})`
                : ""}
            </p>
          ) : null}
        </CardContent>
      </Card>

      {DISPATCHABLE.has(order.status) ? (
        <Card>
          <CardHeader>
            <CardTitle>Dispatch</CardTitle>
          </CardHeader>
          <CardContent>
            <DispatchForm orderId={order.id} />
          </CardContent>
        </Card>
      ) : null}

      {CANCELLABLE.has(order.status) ? (
        <CancelOrderButton orderId={order.id} orderNumber={order.orderNumber} />
      ) : null}
    </div>
  );
}
