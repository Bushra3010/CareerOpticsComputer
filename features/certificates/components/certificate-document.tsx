import { LogoLockup } from "@/components/brand/logo";
import { PrintButton } from "@/features/certificates/components/print-button";
import type { PrintableCertificate } from "@/features/certificates/queries";
import { BRAND } from "@/lib/brand";
import { qrSvg, verificationUrl } from "@/lib/qr";

/**
 * The printed certificate.
 *
 * Rendered by both /centre/certificates/[id]/print and
 * /student/certificate/[id] — the same document, reached from two portals,
 * so it lives here rather than being duplicated or re-exported across routes.
 */
export async function CertificateDocument({
  cert,
}: {
  cert: PrintableCertificate;
}) {
  const url = verificationUrl(cert.documentNumber);
  const qr = await qrSvg(url, 104);

  const outcomeLabel =
    cert.outcome === "distinction"
      ? "with Distinction"
      : cert.outcome === "pass"
        ? "successfully"
        : "";

  return (
    <div className="mx-auto max-w-[210mm] py-8">
      <div data-print="hide" className="mb-6 flex flex-wrap items-center gap-3">
        <PrintButton />
        <p className="text-meta text-text-secondary">
          Prints to A4. Use your browser&rsquo;s &ldquo;Save as PDF&rdquo; to
          keep a copy.
        </p>
      </div>

      {cert.status === "revoked" ? (
        <p
          data-print="hide"
          role="alert"
          className="text-body text-danger mb-6 font-semibold"
        >
          This certificate has been revoked. Printing it would produce a
          document that public verification reports as invalid.
        </p>
      ) : null}

      <article
        data-print="sheet"
        className="border-navy-900 bg-surface relative border-4 px-10 py-12 text-center"
      >
        {/* A revoked certificate must never print as if it were valid. */}
        {cert.status === "revoked" ? (
          <p className="text-danger absolute inset-x-0 top-1/2 -translate-y-1/2 rotate-[-24deg] text-[64px] font-bold opacity-25">
            REVOKED
          </p>
        ) : null}

        <div className="flex justify-center">
          <LogoLockup size="md" surface="light" />
        </div>

        <p className="text-meta text-text-secondary mt-6 tracking-[0.2em] uppercase">
          Certificate of Completion
        </p>

        <p className="text-body text-text-secondary mt-8">
          This is to certify that
        </p>
        <p className="text-display text-navy-900 mt-2">{cert.studentName}</p>
        <p className="text-meta text-text-secondary mt-1">
          Registration number {cert.registrationNumber}
        </p>

        <p className="text-body text-text mx-auto mt-6 max-w-prose">
          has {outcomeLabel} completed the course
        </p>
        <p className="text-page-title text-navy-900 mt-2">{cert.courseName}</p>
        <p className="text-body text-text-secondary mt-2">
          at {cert.centreName}, scoring{" "}
          <span className="text-text font-semibold tabular-nums">
            {cert.obtainedMarks}/{cert.maxMarks}
          </span>
        </p>

        <div className="mt-10 flex items-end justify-between gap-6 text-left">
          <div>
            <p className="text-meta text-text-secondary uppercase">
              Certificate number
            </p>
            <p className="text-body text-navy-900 font-semibold">
              {cert.documentNumber}
            </p>
            <p className="text-meta text-text-secondary mt-3 uppercase">
              Issued on
            </p>
            <p className="text-body text-text">{cert.issuedOn}</p>
          </div>

          <div className="text-center">
            {/* Inline SVG so the printed page needs no network fetch. */}
            <div
              className="mx-auto"
              aria-hidden="true"
              dangerouslySetInnerHTML={{ __html: qr }}
            />
            <p className="text-meta text-text-secondary mt-2 max-w-[130px]">
              Scan to verify
            </p>
          </div>

          <div className="text-right">
            <div className="border-border-strong w-44 border-t pt-2">
              <p className="text-meta text-text-secondary">
                Authorised signatory
              </p>
              <p className="text-meta text-text-secondary">{BRAND.shortName}</p>
            </div>
          </div>
        </div>

        <p className="text-meta text-text-secondary mt-8">
          Verify this certificate at {url}
        </p>
      </article>
    </div>
  );
}
