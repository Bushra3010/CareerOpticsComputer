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
import { listTicketsForAdmin } from "@/features/tickets/queries";

export const metadata: Metadata = {
  title: "Support tickets",
  robots: { index: false },
};

export default async function AdminTicketsPage() {
  const supabase = await createClient();
  const context = await getHeadOfficeContext(supabase);

  if (!context) {
    return (
      <div>
        <h1 className="text-page-title text-navy-900">Support tickets</h1>
        <PermissionDeniedState className="mt-8" />
      </div>
    );
  }

  const tickets = await listTicketsForAdmin();

  return (
    <div className="space-y-6">
      <h1 className="text-page-title text-navy-900">Support tickets</h1>

      {tickets.length === 0 ? (
        <EmptyState
          title="No tickets yet"
          description="Tickets raised by centres and students appear here."
        />
      ) : (
        <ResponsiveCollection
          list={
            <MobileList label="Tickets">
              {tickets.map((t) => (
                <MobileListItem
                  key={t.id}
                  title={t.subject}
                  subtitle={`${t.number} · ${t.centreName ?? ""}`}
                  status={<StatusBadge status={t.status} />}
                  fields={[
                    { label: "Priority", value: t.priority },
                    { label: "Category", value: t.category },
                  ]}
                  href={`/admin/tickets/${t.id}`}
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
                      Ticket
                    </th>
                    <th scope="col" className="text-label px-4 py-3">
                      Centre
                    </th>
                    <th scope="col" className="text-label px-4 py-3">
                      Priority
                    </th>
                    <th scope="col" className="text-label px-4 py-3">
                      Status
                    </th>
                    <th scope="col" className="text-label px-4 py-3">
                      Raised
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((t) => (
                    <tr key={t.id} className="border-border border-t">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/tickets/${t.id}`}
                          className="text-body text-brand-600 font-semibold hover:underline"
                        >
                          {t.number}
                        </Link>
                        <p className="text-meta text-text-secondary">
                          {t.subject}
                        </p>
                      </td>
                      <td className="text-body text-text-secondary px-4 py-3">
                        {t.centreName}
                      </td>
                      <td className="text-body text-text px-4 py-3 capitalize">
                        {t.priority}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={t.status} />
                      </td>
                      <td className="text-body text-text-secondary px-4 py-3">
                        {t.createdOn}
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
