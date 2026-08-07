import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { StatusBadge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PermissionDeniedState } from "@/components/states";
import { createClient } from "@/lib/db/server";
import { getCurrentCentreContext } from "@/features/centres/current-membership";
import { CancelOrderButton } from "@/features/orders/components/cancel-order-button";
import { MarkDeliveredButton } from "@/features/orders/components/mark-delivered-button";
import { PayNowButton } from "@/features/orders/components/pay-now-button";
import { getOrderDetail } from "@/features/orders/queries";

export const metadata: Metadata = { title: "Order", robots: { index: false } };

const CANCELLABLE = new Set([
  "pending_payment",
  "confirmed",
  "processing",
  "packed",
]);

export default async function CentreOrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ paymentError?: string }>;
}) {
  const { id } = await params;
  const { paymentError } = await searchParams;
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
        <h1 className="text-page-title text-navy-900">Order</h1>
        <PermissionDeniedState className="mt-8" />
      </div>
    );
  }

  const order = await getOrderDetail(id);
  if (!order || order.centreId !== context.centreId) notFound();

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/centre/orders"
          className="text-meta text-text-secondary hover:text-text"
        >
          &larr; My orders
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-page-title text-navy-900">{order.orderNumber}</h1>
          <StatusBadge status={order.status} />
        </div>
      </div>

      {paymentError ? (
        <p
          role="alert"
          className="border-danger-border bg-danger-bg text-danger text-body rounded-[var(--radius-card)] border px-4 py-3"
        >
          {paymentError}
        </p>
      ) : null}

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

      <div className="flex flex-wrap gap-3">
        {order.status === "pending_payment" ? (
          <PayNowButton orderId={order.id} />
        ) : null}
        {order.status === "dispatched" ? (
          <MarkDeliveredButton orderId={order.id} />
        ) : null}
        {CANCELLABLE.has(order.status) ? (
          <CancelOrderButton
            orderId={order.id}
            orderNumber={order.orderNumber}
          />
        ) : null}
      </div>
    </div>
  );
}
