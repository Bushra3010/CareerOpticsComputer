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
import { listAllCentresForAdmin } from "@/features/centres/queries";

export const metadata: Metadata = {
  title: "Centres",
  robots: { index: false },
};

export default async function AdminCentresPage() {
  const supabase = await createClient();
  const context = await getHeadOfficeContext(supabase);

  if (!context) {
    return (
      <div>
        <h1 className="text-page-title text-navy-900">Centres</h1>
        <PermissionDeniedState className="mt-8" />
      </div>
    );
  }

  const centres = await listAllCentresForAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-page-title text-navy-900">Centres</h1>
        <p className="text-body text-text-secondary mt-1">
          Every centre across the franchise. Open one to edit its profile or
          change its status.
        </p>
      </div>

      {centres.length === 0 ? (
        <EmptyState
          title="No centres yet"
          description="Centres are created when a franchise application is approved."
        />
      ) : (
        <ResponsiveCollection
          list={
            <MobileList label="Centres">
              {centres.map((c) => (
                <MobileListItem
                  key={c.id}
                  title={c.name}
                  subtitle={`${c.code} · ${c.city ?? "—"}, ${c.state ?? "—"}`}
                  href={`/admin/centres/${c.id}`}
                  status={<StatusBadge status={c.status} />}
                  fields={[
                    { label: "Students", value: String(c.studentCount) },
                    { label: "Since", value: c.createdOn },
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
                      Centre
                    </th>
                    <th scope="col" className="text-label px-4 py-3">
                      Location
                    </th>
                    <th scope="col" className="text-label px-4 py-3 text-right">
                      Students
                    </th>
                    <th scope="col" className="text-label px-4 py-3">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {centres.map((c) => (
                    <tr key={c.id} className="border-border border-t">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/centres/${c.id}`}
                          className="text-body text-brand-600 font-semibold hover:underline"
                        >
                          {c.name}
                        </Link>
                        <p className="text-meta text-text-secondary">
                          {c.code}
                        </p>
                      </td>
                      <td className="text-body text-text-secondary px-4 py-3">
                        {c.city ?? "—"}, {c.state ?? "—"}
                      </td>
                      <td className="text-body px-4 py-3 text-right tabular-nums">
                        {c.studentCount}
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
