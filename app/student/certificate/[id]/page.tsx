import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { CertificateDocument } from "@/features/certificates/components/certificate-document";
import { getPrintableCertificate } from "@/features/certificates/queries";

export const metadata: Metadata = {
  title: "Certificate",
  robots: { index: false },
};

export default async function CertificatePrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cert = await getPrintableCertificate(id);
  if (!cert) notFound();

  return <CertificateDocument cert={cert} />;
}
