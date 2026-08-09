import Link from "next/link";
import type { Metadata } from "next";

import { StatusBadge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/states";
import { listStudentCertificates } from "@/features/certificates/queries";

export const metadata: Metadata = {
  title: "Certificates",
  robots: { index: false },
};

export default async function StudentCertificatesPage() {
  const certificates = await listStudentCertificates();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-page-title text-navy-900">Certificates</h1>
        <p className="text-body text-text-secondary mt-1">
          Every certificate issued to you, each verifiable by anyone at the
          public verification page using its number.
        </p>
      </div>

      {certificates.length === 0 ? (
        <EmptyState
          title="No certificates yet"
          description="Certificates appear here once your centre issues them after a published result."
        />
      ) : (
        <div className="space-y-3">
          {certificates.map((c) => (
            <Card key={c.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-6">
                <div>
                  <p className="text-body text-text font-semibold">
                    {c.documentNumber}
                  </p>
                  <p className="text-meta text-text-secondary mt-0.5">
                    Issued {c.issuedOn}
                    {c.status === "revoked" && c.revokedReason
                      ? ` · revoked: ${c.revokedReason}`
                      : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={c.status} />
                  {c.status === "issued" ? (
                    <Link
                      href={`/student/certificate/${c.id}`}
                      className="text-body text-brand-600 font-semibold hover:underline"
                    >
                      View and print
                    </Link>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
