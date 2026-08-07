import type { Metadata } from "next";

import { EmptyState, PermissionDeniedState } from "@/components/states";
import {
  MobileList,
  MobileListItem,
  ResponsiveCollection,
} from "@/components/tables/mobile-list";
import { StatusBadge } from "@/components/ui/badge";
import { createClient } from "@/lib/db/server";
import { getHeadOfficeContext } from "@/features/exams/access";
import { listLeadsForAdmin } from "@/features/leads/queries";
import { LeadStatusSelect } from "@/features/leads/components/status-select";

export const metadata: Metadata = { title: "Leads", robots: { index: false } };

export default async function AdminLeadsPage() {
  const supabase = await createClient();
  const context = await getHeadOfficeContext(supabase);

  if (!context) {
    return (
      <div>
        <h1 className="text-page-title text-navy-900">Leads</h1>
        <PermissionDeniedState className="mt-8" />
      </div>
    );
  }

  const leads = await listLeadsForAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-page-title text-navy-900">Leads</h1>
        <p className="text-body text-text-secondary mt-1">
          Enquiries submitted from the public site. Most recent 200.
        </p>
      </div>

      {leads.length === 0 ? (
        <EmptyState
          title="No enquiries yet"
          description="Submissions from the admissions enquiry form appear here."
        />
      ) : (
        <ResponsiveCollection
          list={
            <MobileList label="Leads">
              {leads.map((l) => (
                <MobileListItem
                  key={l.id}
                  title={l.fullName}
                  subtitle={`${l.phone}${l.city ? ` · ${l.city}` : ""}`}
                  status={<StatusBadge status={l.status} />}
                  fields={[
                    { label: "Interested in", value: l.courseInterest ?? "—" },
                    { label: "Received", value: l.createdOn },
                  ]}
                  action={
                    <LeadStatusSelect leadId={l.id} currentStatus={l.status} />
                  }
                />
              ))}
            </MobileList>
          }
          table={
            <div className="border-border overflow-x-auto rounded-[var(--radius-card)] border">
              <table className="w-full text-left">
                <thead className="bg-surface-subtle">
                  <tr>
                    <th scope="col" className="text-label px-4 py-3">
                      Name
                    </th>
                    <th scope="col" className="text-label px-4 py-3">
                      Contact
                    </th>
                    <th scope="col" className="text-label px-4 py-3">
                      Interested in
                    </th>
                    <th scope="col" className="text-label px-4 py-3">
                      Received
                    </th>
                    <th scope="col" className="text-label px-4 py-3">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((l) => (
                    <tr key={l.id} className="border-border border-t align-top">
                      <td className="px-4 py-3">
                        <p className="text-body text-text font-semibold">
                          {l.fullName}
                        </p>
                        {l.message ? (
                          <p className="text-meta text-text-secondary max-w-xs">
                            {l.message}
                          </p>
                        ) : null}
                      </td>
                      <td className="text-body text-text-secondary px-4 py-3">
                        {l.phone}
                        {l.email ? (
                          <>
                            <br />
                            {l.email}
                          </>
                        ) : null}
                      </td>
                      <td className="text-body text-text-secondary px-4 py-3">
                        {l.courseInterest ?? "—"}
                      </td>
                      <td className="text-body text-text-secondary px-4 py-3">
                        {l.createdOn}
                      </td>
                      <td className="px-4 py-3">
                        <LeadStatusSelect
                          leadId={l.id}
                          currentStatus={l.status}
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
