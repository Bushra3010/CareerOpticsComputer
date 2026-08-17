import Link from "next/link";
import type { Metadata } from "next";

import { createClient } from "@/lib/db/server";
import { callRpc } from "@/lib/db/rpc";
import { StatusBadge } from "@/components/ui/badge";
import { VerificationResult } from "@/features/verification/components/verification-result";
import { allowVerificationLookup } from "@/features/verification/rate-limit";

export const metadata: Metadata = {
  title: "Certificate verification",
  robots: { index: false },
};

/**
 * QR landing target (route map §2.1): renders the result straight from the
 * number in the URL, with no form to fill in. Same minimal payload and same
 * server-side logging as the form route — verify_certificate does the logging
 * itself, so a QR scan cannot bypass it.
 */
export default async function QrVerifyPage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = await params;

  // Shares one budget with the form routes (PRD §19.12). Without this the QR
  // URL was an unmetered read of the whole sequential certificate series.
  if (!(await allowVerificationLookup())) {
    return (
      <div className="container-public max-w-2xl py-12">
        <h1 className="text-page-title text-navy-900">
          Certificate verification
        </h1>
        <div className="border-border bg-surface-subtle mt-6 rounded-[var(--radius-card)] border p-6">
          <StatusBadge status="on_hold" label="Too many lookups" />
          <p className="text-body text-text-secondary mt-2">
            Too many verification attempts from this connection. Please try
            again shortly.
          </p>
        </div>
      </div>
    );
  }

  const supabase = await createClient();
  const { data } = await callRpc(supabase, "verify_certificate", {
    p_number: decodeURIComponent(number),
  });
  const row = data?.[0];

  return (
    <div className="container-public max-w-2xl py-12">
      <h1 className="text-page-title text-navy-900">
        Certificate verification
      </h1>

      <div className="mt-6">
        {row ? (
          <VerificationResult
            certificate={{
              documentNumber: row.document_number,
              studentName: row.student_name,
              courseName: row.course_name,
              centreName: row.centre_name,
              outcome: row.outcome,
              issuedOn: row.issued_on,
              status: row.status,
            }}
          />
        ) : (
          <div className="border-border bg-surface-subtle rounded-[var(--radius-card)] border p-6">
            <StatusBadge status="rejected" label="No match" />
            <p className="text-body text-text-secondary mt-2">
              No certificate matches this code.
            </p>
          </div>
        )}
      </div>

      <Link
        href="/verify"
        className="text-body mt-6 inline-block font-semibold text-blue-700"
      >
        Verify another credential
      </Link>
    </div>
  );
}
