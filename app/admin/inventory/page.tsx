import Link from "next/link";
import type { Metadata } from "next";

import { KpiCard } from "@/components/ui/card";
import { EmptyState, PermissionDeniedState } from "@/components/states";
import { AlertTriangle } from "@/components/ui/badge";
import { createClient } from "@/lib/db/server";
import { getHeadOfficeContext } from "@/features/exams/access";
import {
  listInventoryLocations,
  listProductsForAdmin,
} from "@/features/inventory/queries";

export const metadata: Metadata = {
  title: "Inventory",
  robots: { index: false },
};

export default async function InventoryPage() {
  const supabase = await createClient();
  const context = await getHeadOfficeContext(supabase);

  if (!context) {
    return (
      <div>
        <h1 className="text-page-title text-navy-900">Inventory</h1>
        <PermissionDeniedState className="mt-8" />
      </div>
    );
  }

  const [locations, products] = await Promise.all([
    listInventoryLocations(),
    listProductsForAdmin(),
  ]);
  const lowStock = products.filter(
    (p) => p.status === "active" && p.isLowStock,
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-page-title text-navy-900">Inventory</h1>
        <div className="flex gap-4">
          <Link
            href="/admin/inventory/locations"
            className="text-body text-brand-600 font-semibold hover:underline"
          >
            Locations
          </Link>
          <Link
            href="/admin/inventory/ledger"
            className="text-body text-brand-600 font-semibold hover:underline"
          >
            Stock ledger
          </Link>
          <Link
            href="/admin/products"
            className="text-body text-brand-600 font-semibold hover:underline"
          >
            Products
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard label="Locations" value={String(locations.length)} />
        <KpiCard
          label="Active products"
          value={String(products.filter((p) => p.status === "active").length)}
        />
        <KpiCard label="Low-stock products" value={String(lowStock.length)} />
      </div>

      <div>
        <h2 className="text-section text-navy-900">
          Low stock — PRD&rsquo;s reorder report
        </h2>
        {lowStock.length === 0 ? (
          <EmptyState
            className="mt-3"
            title="Nothing is low on stock"
            description="Every active product is above its reorder threshold."
          />
        ) : (
          <ul className="mt-3 space-y-2">
            {lowStock.map((p) => (
              <li
                key={p.id}
                className="border-warning-border bg-warning-bg flex items-center justify-between gap-3 rounded-[var(--radius-card)] border px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle
                    className="text-warning size-4"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-body text-text font-semibold">
                      {p.name}
                    </p>
                    <p className="text-meta text-text-secondary">{p.sku}</p>
                  </div>
                </div>
                <p className="text-body text-text tabular-nums">
                  {p.stockOnHand} on hand &middot; reorder below{" "}
                  {p.lowStockThreshold}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
