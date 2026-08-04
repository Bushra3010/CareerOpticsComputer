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

export interface PrintableCertificate {
  documentNumber: string;
  studentId: string;
  studentName: string;
  registrationNumber: string;
  courseName: string;
  centreName: string;
  outcome: "fail" | "pass" | "distinction";
  obtainedMarks: number;
  maxMarks: number;
  issuedOn: string;
  status: "pending" | "issued" | "revoked";
}

/**
 * Everything printed on a certificate, in one read.
 *
 * Scoped by RLS, not by an argument: staff see their centre's certificates
 * (issued_documents_staff_select) and a student sees their own
 * (issued_documents_select_self), so the same query serves both without the
 * page needing to know which it is talking to.
 */
export async function getPrintableCertificate(
  certificateId: string,
): Promise<PrintableCertificate | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("issued_documents")
    .select(
      `document_number, status, issued_at, student_id,
       students(full_name, registration_number),
       student_results(obtained_marks, max_marks, outcome,
         result_publications(courses(name))),
       centres(name)`,
    )
    .eq("id", certificateId)
    .maybeSingle();

  if (!data) return null;

  const student = one<{ full_name: string; registration_number: string }>(
    data.students,
  );
  const result = one<{
    obtained_marks: number;
    max_marks: number;
    outcome: PrintableCertificate["outcome"];
    result_publications: unknown;
  }>(data.student_results);
  const publication = one<{ courses: unknown }>(result?.result_publications);

  return {
    documentNumber: data.document_number,
    studentId: data.student_id,
    studentName: student?.full_name ?? "Unknown",
    registrationNumber: student?.registration_number ?? "",
    courseName: one<{ name: string }>(publication?.courses)?.name ?? "Course",
    centreName: one<{ name: string }>(data.centres)?.name ?? "Centre",
    outcome: result?.outcome ?? "pass",
    obtainedMarks: result?.obtained_marks ?? 0,
    maxMarks: result?.max_marks ?? 0,
    issuedOn: data.issued_at.slice(0, 10),
    status: data.status,
  };
}

/**
 * The signed-in student's own certificates. Takes no id — RLS
 * (issued_documents_select_self) resolves the student from the session, so
 * there is no parameter to point at somebody else.
 */
export async function listStudentCertificates(): Promise<IssuedCertificate[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("issued_documents")
    .select(
      "id, document_number, status, issued_at, revoked_reason, students(full_name, registration_number)",
    )
    .order("issued_at", { ascending: false });

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
