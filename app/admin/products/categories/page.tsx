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
import { CategoryForm } from "@/features/inventory/components/category-form";
import { listProductCategories } from "@/features/inventory/queries";

export const metadata: Metadata = {
  title: "Product categories",
  robots: { index: false },
};

export default async function ProductCategoriesPage() {
  const supabase = await createClient();
  const context = await getHeadOfficeContext(supabase);

  if (!context) {
    return (
      <div>
        <h1 className="text-page-title text-navy-900">Product categories</h1>
        <PermissionDeniedState className="mt-8" />
      </div>
    );
  }

  const categories = await listProductCategories();

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/products"
          className="text-meta text-text-secondary hover:text-text"
        >
          &larr; Products
        </Link>
        <h1 className="text-page-title text-navy-900 mt-2">
          Product categories
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New category</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryForm />
        </CardContent>
      </Card>

      {categories.length === 0 ? (
        <EmptyState title="No categories yet" description="Add one above." />
      ) : (
        <ResponsiveCollection
          list={
            <MobileList label="Categories">
              {categories.map((c) => (
                <MobileListItem
                  key={c.id}
                  title={c.name}
                  subtitle={c.code}
                  status={<StatusBadge status={c.status} />}
                  fields={[]}
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
                      Name
                    </th>
                    <th scope="col" className="text-label px-4 py-3">
                      Code
                    </th>
                    <th scope="col" className="text-label px-4 py-3">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((c) => (
                    <tr key={c.id} className="border-border border-t">
                      <td className="text-body text-text px-4 py-3 font-semibold">
                        {c.name}
                      </td>
                      <td className="text-body text-text-secondary px-4 py-3">
                        {c.code}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={c.status} />
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
