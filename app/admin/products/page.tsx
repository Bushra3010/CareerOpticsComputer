import Link from "next/link";
import type { Metadata } from "next";

import { StatusBadge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, PermissionDeniedState } from "@/components/states";
import {
  MobileList,
  MobileListItem,
  ResponsiveCollection,
} from "@/components/tables/mobile-list";
import { createClient } from "@/lib/db/server";
import { getHeadOfficeContext } from "@/features/exams/access";
import { ProductForm } from "@/features/inventory/components/product-form";
import { ProductStatusButton } from "@/features/inventory/components/product-status-button";
import {
  listProductCategories,
  listProductsForAdmin,
} from "@/features/inventory/queries";

export const metadata: Metadata = {
  title: "Products",
  robots: { index: false },
};

export default async function ProductsPage() {
  const supabase = await createClient();
  const context = await getHeadOfficeContext(supabase);

  if (!context) {
    return (
      <div>
        <h1 className="text-page-title text-navy-900">Products</h1>
        <PermissionDeniedState className="mt-8" />
      </div>
    );
  }

  const [products, categories] = await Promise.all([
    listProductsForAdmin(),
    listProductCategories(),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-page-title text-navy-900">Products</h1>
        <div className="flex gap-4">
          <Link
            href="/admin/products/categories"
            className="text-body text-brand-600 font-semibold hover:underline"
          >
            Categories
          </Link>
          <Link
            href="/admin/inventory"
            className="text-body text-brand-600 font-semibold hover:underline"
          >
            Inventory
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New product</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm categories={categories} />
        </CardContent>
      </Card>

      {products.length === 0 ? (
        <EmptyState
          title="No products yet"
          description="Add one above. A product must be Active before a centre can order it."
        />
      ) : (
        <ResponsiveCollection
          list={
            <MobileList label="Products">
              {products.map((p) => (
                <MobileListItem
                  key={p.id}
                  title={p.name}
                  subtitle={`${p.sku} · ${p.categoryName}`}
                  status={<StatusBadge status={p.status} />}
                  fields={[
                    { label: "Price", value: p.priceLabel },
                    {
                      label: "Stock",
                      value: p.isLowStock
                        ? `${p.stockOnHand} (low)`
                        : String(p.stockOnHand),
                    },
                  ]}
                  action={
                    <ProductStatusButton
                      productId={p.id}
                      currentStatus={p.status}
                    />
                  }
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
                      Category
                    </th>
                    <th scope="col" className="text-label px-4 py-3 text-right">
                      Price
                    </th>
                    <th scope="col" className="text-label px-4 py-3 text-right">
                      Stock
                    </th>
                    <th scope="col" className="text-label px-4 py-3">
                      Status
                    </th>
                    <th scope="col" className="text-label px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-border border-t">
                      <td className="px-4 py-3">
                        <p className="text-body text-text font-semibold">
                          {p.name}
                        </p>
                        <p className="text-meta text-text-secondary">{p.sku}</p>
                      </td>
                      <td className="text-body text-text-secondary px-4 py-3">
                        {p.categoryName}
                      </td>
                      <td className="text-body text-text px-4 py-3 text-right tabular-nums">
                        {p.priceLabel}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={
                            p.isLowStock
                              ? "text-warning font-semibold"
                              : "text-body text-text"
                          }
                        >
                          {p.stockOnHand}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <ProductStatusButton
                          productId={p.id}
                          currentStatus={p.status}
                        />
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
