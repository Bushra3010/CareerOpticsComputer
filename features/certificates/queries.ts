import { createClient } from "@/lib/db/server";

export interface IssuedCertificate {
  id: string;
  documentNumber: string;
  studentName: string;
  registrationNumber: string;
  status: "pending" | "issued" | "revoked";
  issuedOn: string;
  revokedReason: string | null;
}

function one<T>(rel: unknown): T | null {
  return Array.isArray(rel) ? ((rel[0] as T) ?? null) : ((rel as T) ?? null);
}

export async function listIssuedCertificates(
  centreId: string,
): Promise<IssuedCertificate[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("issued_documents")
    .select(
      "id, document_number, status, issued_at, revoked_reason, students(full_name, registration_number)",
    )
    .eq("centre_id", centreId)
    .order("issued_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load certificates: ${error.message}`);
  }

  return (data ?? []).map((d) => {
    const s = one<{ full_name: string; registration_number: string }>(
      d.students,
    );
    return {
      id: d.id,
      documentNumber: d.document_number,
      studentName: s?.full_name ?? "Unknown",
      registrationNumber: s?.registration_number ?? "",
      status: d.status,
      issuedOn: d.issued_at.slice(0, 10),
      revokedReason: d.revoked_reason,
    };
  });
}
