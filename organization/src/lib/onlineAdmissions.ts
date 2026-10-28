/**
 * How the Online Admission List reads a student record.
 *
 * Everything here comes from the record itself or the student's invoices --
 * the list used to fall back to five made-up applications, call every payment
 * "pending" (which then blocked every approval), show no documents however
 * many were uploaded, and write its decisions to a `status` column the
 * students table does not have.
 */
import type { InvoiceRow } from "@/lib/supabase/studentFee";
import { paidFromPayments } from "@/lib/supabase/studentFee";

/** "none" when no invoice has been raised: nothing is owed, and nothing is settled either. */
export type AdmissionPayment = "paid" | "pending" | "none";
export type AdmissionView = "pending" | "under_review" | "approved" | "rejected";

/** The documents an application is checked against. */
export const REQUIRED_DOCUMENTS = [
  "Photo",
  "10th Marksheet",
  "12th Marksheet",
  "Aadhar",
  "Transfer Certificate",
  "Admission Form",
] as const;

/** `students.documents` keys, as the admission form writes them, to the names above. */
const DOCUMENT_LABELS: Record<string, string> = {
  passportPhoto: "Photo",
  tenthMarksheet: "10th Marksheet",
  twelfthMarksheet: "12th Marksheet",
  aadharCardFront: "Aadhar",
  aadharCardBack: "Aadhar",
  transferCertificate: "Transfer Certificate",
  admissionForm: "Admission Form",
  casteCertificate: "Caste Certificate",
};
/** Older records keep some of them in columns of their own. */
const DOCUMENT_COLUMNS: Record<string, string> = {
  photo: "Photo",
  tenthMarksheet: "10th Marksheet",
  twelfthMarksheet: "12th Marksheet",
  aadharFront: "Aadhar",
  transferCertificate: "Transfer Certificate",
  casteCertificate: "Caste Certificate",
  admissionForm: "Admission Form",
};

const present = (value: unknown) => typeof value === "string" ? value.trim() !== "" : Boolean(value);

/** The documents actually on the record. */
export function uploadedDocuments(row: Record<string, unknown>): string[] {
  const found = new Set<string>();
  let docs = row.documents;
  if (typeof docs === "string") {
    try {
      docs = JSON.parse(docs);
    } catch {
      docs = null;
    }
  }
  if (docs && typeof docs === "object" && !Array.isArray(docs)) {
    for (const [key, value] of Object.entries(docs as Record<string, unknown>)) {
      if (present(value)) found.add(DOCUMENT_LABELS[key] ?? key);
    }
  }
  for (const [column, label] of Object.entries(DOCUMENT_COLUMNS)) {
    if (present(row[column])) found.add(label);
  }
  return [...found];
}

/** `requestedDocuments` is stored as "a, b" text; older rows may hold an array. */
export function requestedDocuments(row: Record<string, unknown>): string[] {
  const raw = row.requestedDocuments;
  const list = Array.isArray(raw) ? raw.map(String) : typeof raw === "string" ? raw.split(",") : [];
  return list.map((s) => s.trim()).filter(Boolean);
}

/**
 * The live enum has no "under review": asking for documents saves SUBMITTED
 * with the list of what was asked for, so that list is what tells the two apart.
 */
export function admissionView(row: Record<string, unknown>): AdmissionView {
  const status = String(row.admissionStatus ?? "").toUpperCase();
  if (status === "APPROVED") return "approved";
  if (status === "REJECTED") return "rejected";
  return requestedDocuments(row).length ? "under_review" : "pending";
}

/** Settled only when every invoice raised for the student is paid in full. */
export function paymentFor(invoices: InvoiceRow[]): AdmissionPayment {
  if (!invoices.length) return "none";
  const owing = invoices.some((invoice) => {
    const total = Number(invoice.totalAmount) || 0;
    return String(invoice.status ?? "").toUpperCase() !== "PAID" && paidFromPayments(invoice) < total;
  });
  return owing ? "pending" : "paid";
}
