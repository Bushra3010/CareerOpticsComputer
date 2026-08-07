import Link from "next/link";
import type { Metadata } from "next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, PermissionDeniedState } from "@/components/states";
import { createClient } from "@/lib/db/server";
import { getHeadOfficeContext } from "@/features/exams/access";
import { LocationForm } from "@/features/inventory/components/location-form";
import { listInventoryLocations } from "@/features/inventory/queries";

export const metadata: Metadata = {
  title: "Stock locations",
  robots: { index: false },
};

export default async function InventoryLocationsPage() {
  const supabase = await createClient();
  const context = await getHeadOfficeContext(supabase);

  if (!context) {
    return (
      <div>
        <h1 className="text-page-title text-navy-900">Stock locations</h1>
        <PermissionDeniedState className="mt-8" />
      </div>
    );
  }

  const locations = await listInventoryLocations();

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/inventory"
          className="text-meta text-text-secondary hover:text-text"
        >
          &larr; Inventory
        </Link>
        <h1 className="text-page-title text-navy-900 mt-2">Stock locations</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New location</CardTitle>
        </CardHeader>
        <CardContent>
          <LocationForm />
        </CardContent>
      </Card>

      {locations.length === 0 ? (
        <EmptyState
          title="No locations yet"
          description="Add a warehouse above before receiving any stock — an order's payment step needs one to reserve stock from."
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {locations.map((l) => (
            <li
              key={l.id}
              className="border-border bg-surface rounded-[var(--radius-card)] border px-4 py-3"
            >
              <p className="text-body text-text font-semibold">{l.name}</p>
              <p className="text-meta text-text-secondary capitalize">
                {l.type.replace("_", " ")}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
