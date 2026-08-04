import type { Metadata } from "next";

import { VerifyForm } from "@/features/verification/components/verify-form";

export const metadata: Metadata = { title: "Verify a certificate" };

export default function VerifyCertificatePage() {
  return (
    <div className="container-public max-w-2xl py-12">
      <h1 className="text-page-title text-navy-900">Verify a certificate</h1>
      <p className="text-body text-text-secondary mt-2 max-w-prose">
        Enter the certificate number exactly as printed. Lookups are recorded.
      </p>
      <div className="mt-8">
        <VerifyForm kind="certificate" />
      </div>
    </div>
  );
}
