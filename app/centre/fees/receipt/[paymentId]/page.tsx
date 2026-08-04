import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { ReceiptDocument } from "@/features/fees/components/receipt-document";
import { getPrintableReceipt } from "@/features/fees/queries";

export const metadata: Metadata = {
  title: "Receipt",
  robots: { index: false },
};

export default async function ReceiptPrintPage({
  params,
}: {
  params: Promise<{ paymentId: string }>;
}) {
  const { paymentId } = await params;
  const receipt = await getPrintableReceipt(paymentId);
  if (!receipt) notFound();

  return <ReceiptDocument receipt={receipt} />;
}
