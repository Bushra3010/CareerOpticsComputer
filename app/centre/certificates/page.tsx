import Link from "next/link";
import { redirect } from "next/navigation";

import { StatusBadge } from "@/components/ui/badge";
import {
  MobileList,
  MobileListItem,
  ResponsiveCollection,
} from "@/components/tables/mobile-list";
import { EmptyState } from "@/components/states";
import { createClient } from "@/lib/db/server";
import { getCurrentCentreContext } from "@/features/centres/current-membership";
import { listIssuedCertificates } from "@/features/certificates/queries";

export default async function CertificatesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const context = user
    ? await getCurrentCentreContext(supabase, user.id)
    : null;
  if (!context) redirect("/centre");

  const certificates = await listIssuedCertificates(context.centreId);

  return (
    <div>
      <h1 className="text-page-title text-navy-900">Certificates</h1>
      <p className="text-body text-text-secondary mt-2 max-w-prose">
        Certificates are issued from a published result set. Anyone can confirm
        one at <span className="font-semibold">/verify/certificate</span>.
      </p>

      {certificates.length === 0 ? (
        <EmptyState
          className="mt-8"
          title="No certificates issued yet"
          description="Publish a result set, then issue certificates to the students who passed."
        />
      ) : (
        <ResponsiveCollection
          list={
            <MobileList label="Issued certificates" className="mt-6">
              {certificates.map((c) => (
                <MobileListItem
                  key={c.id}
                  title={c.documentNumber}
                  subtitle={c.studentName}
                  href={`/centre/certificates/${c.id}/print`}
                  status={
                    <StatusBadge
                      status={c.status === "revoked" ? "revoked" : "issued"}
                      label={c.status === "revoked" ? "Revoked" : "Issued"}
                    />
                  }
                  fields={[
                    { label: "Registration no.", value: c.registrationNumber },
                    { label: "Issued", value: c.issuedOn },
                  ]}
                />
              ))}
            </MobileList>
          }
          table={
            <div className="border-border mt-6 rounded-[var(--radius-card)] border">
              <table className="w-full text-left">
                <thead className="bg-surface-subtle">
                  <tr>
                    <th scope="col" className="text-label px-4 py-3">
                      Certificate no.
                    </th>
                    <th scope="col" className="text-label px-4 py-3">
                      Student
                    </th>
                    <th scope="col" className="text-label px-4 py-3">
                      Issued
                    </th>
                    <th scope="col" className="text-label px-4 py-3">
                      Status
                    </th>
                    <th scope="col" className="text-label px-4 py-3">
                      Document
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {certificates.map((c) => (
                    <tr key={c.id} className="border-border border-t">
                      <td className="text-body px-4 py-3 font-semibold">
                        {c.documentNumber}
                      </td>
                      <td className="text-body px-4 py-3">
                        {c.studentName}
                        <span className="text-meta text-text-secondary block">
                          {c.registrationNumber}
                        </span>
                      </td>
                      <td className="text-body px-4 py-3">{c.issuedOn}</td>
                      <td className="px-4 py-3">
                        <StatusBadge
                          status={c.status === "revoked" ? "revoked" : "issued"}
                          label={c.status === "revoked" ? "Revoked" : "Issued"}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/centre/certificates/${c.id}/print`}
                          className="text-meta font-semibold text-blue-700"
                        >
                          Print
                        </Link>
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
