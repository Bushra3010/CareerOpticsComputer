import Link from "next/link";

import { StatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/states";
import { listCentreApplications } from "@/features/centre-applications/queries";

export default async function CentreApplicationsPage() {
  const applications = await listCentreApplications();

  return (
    <div>
      <h1 className="text-page-title text-navy-900">Centre applications</h1>

      {applications.length === 0 ? (
        <EmptyState
          className="mt-8"
          title="No applications yet"
          description="Applications submitted via the public site will appear here."
        />
      ) : (
        <div className="border-border mt-6 overflow-x-auto rounded-[var(--radius-card)] border">
          <table className="w-full text-left">
            <thead className="bg-surface-subtle">
              <tr>
                <th className="text-label px-4 py-3">Number</th>
                <th className="text-label px-4 py-3">Applicant</th>
                <th className="text-label px-4 py-3">Proposed centre</th>
                <th className="text-label px-4 py-3">City</th>
                <th className="text-label px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id} className="border-border border-t">
                  <td className="text-body px-4 py-3">
                    <Link
                      href={`/admin/centre-applications/${app.id}`}
                      className="font-semibold text-blue-700"
                    >
                      {app.application_number}
                    </Link>
                  </td>
                  <td className="text-body px-4 py-3">{app.applicant_name}</td>
                  <td className="text-body px-4 py-3">
                    {app.proposed_centre_name}
                  </td>
                  <td className="text-body px-4 py-3">{app.city}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={app.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
