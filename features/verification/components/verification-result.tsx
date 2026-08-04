import { StatusBadge } from "@/components/ui/badge";

import type { CertificateResult, RegistrationResult } from "../actions";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-meta text-text-secondary uppercase">{label}</dt>
      <dd className="text-body text-text mt-1">{value}</dd>
    </div>
  );
}

/**
 * Only the fields an employer needs to confirm a credential. No contact
 * details, date of birth, address, marks or registration number — see the
 * privacy note in migration 0016.
 */
export function VerificationResult({
  certificate,
  registration,
}: {
  certificate?: CertificateResult;
  registration?: RegistrationResult;
}) {
  if (certificate) {
    const revoked = certificate.status === "revoked";
    return (
      <div
        className={`rounded-[var(--radius-card)] border p-6 ${
          revoked
            ? "border-danger bg-danger-bg"
            : "border-green-600 bg-green-50"
        }`}
      >
        <StatusBadge
          status={revoked ? "revoked" : "verified"}
          label={revoked ? "Revoked" : "Verified"}
        />
        {revoked ? (
          <p className="text-body text-danger mt-2 font-semibold">
            This certificate has been revoked and is no longer valid.
          </p>
        ) : null}
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <Row label="Certificate number" value={certificate.documentNumber} />
          <Row label="Name" value={certificate.studentName} />
          <Row label="Course" value={certificate.courseName} />
          <Row label="Centre" value={certificate.centreName} />
          <Row
            label="Result"
            value={
              certificate.outcome === "distinction" ? "Distinction" : "Pass"
            }
          />
          <Row label="Issued on" value={certificate.issuedOn} />
        </dl>
      </div>
    );
  }

  if (registration) {
    return (
      <div className="rounded-[var(--radius-card)] border border-green-600 bg-green-50 p-6">
        <StatusBadge status="verified" label="Registered" />
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <Row
            label="Registration number"
            value={registration.registrationNumber}
          />
          <Row label="Name" value={registration.studentName} />
          <Row
            label="Course"
            value={registration.courseName ?? "Not currently enrolled"}
          />
          <Row label="Centre" value={registration.centreName} />
        </dl>
      </div>
    );
  }

  return null;
}
