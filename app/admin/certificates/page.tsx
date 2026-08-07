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
import { listAllCertificatesForAdmin } from "@/features/certificates/queries";
import { RevokeCertificateButton } from "@/features/certificates/components/admin/revoke-button";

export const metadata: Metadata = {
  title: "Certificates",
  robots: { index: false },
};

export default async function AdminCertificatesPage() {
  const supabase = await createClient();
  const context = await getHeadOfficeContext(supabase);

  if (!context) {
    return (
      <div>
        <h1 className="text-page-title text-navy-900">Certificates</h1>
        <PermissionDeniedState className="mt-8" />
      </div>
    );
  }

  const certificates = await listAllCertificatesForAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-page-title text-navy-900">Certificates</h1>
        <p className="text-body text-text-secondary mt-1">
          Every certificate issued across every centre. Most recent 200.
        </p>
      </div>

      {certificates.length === 0 ? (
        <EmptyState
          title="No certificates issued yet"
          description="Certificates appear here once a centre issues one against a published, passing result."
        />
      ) : (
        <ResponsiveCollection
          list={
            <MobileList label="Certificates">
              {certificates.map((c) => (
                <MobileListItem
                  key={c.id}
                  title={c.documentNumber}
                  subtitle={`${c.studentName} · ${c.centreName}`}
                  status={<StatusBadge status={c.status} />}
                  fields={[{ label: "Issued", value: c.issuedOn }]}
                  action={
                    c.status === "issued" ? (
                      <RevokeCertificateButton
                        documentNumber={c.documentNumber}
                      />
                    ) : undefined
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
                      Certificate
                    </th>
                    <th scope="col" className="text-label px-4 py-3">
                      Student
                    </th>
                    <th scope="col" className="text-label px-4 py-3">
                      Centre
                    </th>
                    <th scope="col" className="text-label px-4 py-3">
                      Issued
                    </th>
                    <th scope="col" className="text-label px-4 py-3">
                      Status
                    </th>
                    <th scope="col" className="text-label px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {certificates.map((c) => (
                    <tr key={c.id} className="border-border border-t">
                      <td className="text-body px-4 py-3 font-semibold">
                        {c.documentNumber}
                      </td>
                      <td className="text-body text-text-secondary px-4 py-3">
                        {c.studentName}
                      </td>
                      <td className="text-body text-text-secondary px-4 py-3">
                        {c.centreName}
                      </td>
                      <td className="text-body text-text-secondary px-4 py-3">
                        {c.issuedOn}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={c.status} />
                        {c.status === "revoked" && c.revokedReason ? (
                          <p className="text-meta text-text-secondary mt-1 max-w-xs">
                            {c.revokedReason}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {c.status === "issued" ? (
                          <RevokeCertificateButton
                            documentNumber={c.documentNumber}
                          />
                        ) : null}
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
