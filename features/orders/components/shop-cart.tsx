"use client";

import { useActionState, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { formatPaise, percentOf, add, type Paise } from "@/lib/money";

import { placeOrder, type OrderActionState } from "../actions";
import type { ProductOption } from "@/features/inventory/queries";

const initial: OrderActionState = { status: "idle" };

/**
 * The cart lives only in this component's state — there is no `carts` table
 * (build plan §3 names none): `create_order` takes the full item list in one
 * call, so "cart" and "pending_payment order" are the same thing the moment
 * you submit. Losing the cart on a refresh is an accepted trade-off of that
 * design, not an oversight.
 */
export function ShopCart({
  centreId,
  products,
}: {
  centreId: string;
  products: ProductOption[];
}) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const bound = placeOrder.bind(null, centreId);
  const [state, action, pending] = useActionState(bound, initial);

  const lines = useMemo(
    () =>
      products
        .map((p) => ({ product: p, quantity: quantities[p.id] ?? 0 }))
        .filter((l) => l.quantity > 0),
    [products, quantities],
  );

  const total = useMemo(() => {
    const amounts = lines.map((l) => {
      const subtotal = (l.product.pricePaise * l.quantity) as Paise;
      const tax = percentOf(subtotal, l.product.taxPercent);
      return add(subtotal, tax);
    });
    return amounts.length ? add(...amounts) : (0 as Paise);
  }, [lines]);

  const itemsJson = JSON.stringify(
    lines.map((l) => ({ product_id: l.product.id, quantity: l.quantity })),
  );

  if (products.length === 0) {
    return (
      <p className="text-body text-text-secondary">
        Nothing is available to order right now.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <ul className="space-y-3">
        {products.map((p) => (
          <li
            key={p.id}
            className="border-border bg-surface flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-card)] border px-4 py-3"
          >
            <div>
              <p className="text-body text-text font-semibold">{p.name}</p>
              <p className="text-meta text-text-secondary">
                {p.sku} &middot; {p.priceLabel} each
                {p.taxPercent > 0
                  ? ` + ${p.taxPercent}% tax`
                  : ""} &middot;{" "}
                {p.stockOnHand > 0
                  ? `${p.stockOnHand} in stock`
                  : "Out of stock"}
              </p>
            </div>
            <Input
              type="number"
              min={0}
              className="w-24"
              aria-label={`Quantity of ${p.name}`}
              value={quantities[p.id] ?? 0}
              onChange={(e) =>
                setQuantities((q) => ({
                  ...q,
                  [p.id]: Math.max(0, Number(e.target.value) || 0),
                }))
              }
            />
          </li>
        ))}
      </ul>

      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-meta text-text-secondary">
              Cart total (incl. tax)
            </p>
            <p className="text-section text-navy-900">{formatPaise(total)}</p>
          </div>
          <form action={action}>
            <input type="hidden" name="items" value={itemsJson} />
            <Button
              type="submit"
              disabled={lines.length === 0}
              loading={pending}
              loadingLabel="Placing order"
            >
              Place order &amp; pay from wallet
            </Button>
          </form>
        </CardContent>
      </Card>

      {state.status === "error" && state.message ? (
        <p role="alert" className="text-body text-danger">
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
