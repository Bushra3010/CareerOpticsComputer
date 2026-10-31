import { supabase } from "./client";

/**
 * The nine figures on the centre dashboard, in the classic franchise-panel
 * layout: students split by where their admission stands, exams, money in and
 * money owed, and certificates ordered.
 *
 * Students are split by `admissionStatus`: an online application waiting for
 * the centre is "requested" (SUBMITTED / PENDING_PAYMENT, as in
 * online-admission.sql), an admitted student is "approved" (APPROVED, the
 * enum's only admitted value), and anything else on the roll is "registered".
 *
 * `branchId` null means the whole organisation, as the admin sees it.
 */
export interface CentreDashboard {
  totalStudents: number;
  registeredStudents: number;
  requestedStudents: number;
  approvedStudents: number;
  totalExams: number;
  todaysPayment: number;
  totalPayment: number;
  totalDues: number;
  orderedCertificates: number;
}

const REQUESTED = new Set(["SUBMITTED", "PENDING_PAYMENT"]);
const APPROVED = new Set(["APPROVED"]);

export async function getCentreDashboard(branchId: string | null): Promise<CentreDashboard> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let students = supabase.from("students").select("admissionStatus").is("deletedAt", null);
  if (branchId) students = students.eq("branchId", branchId);

  let exams = supabase.from("exams").select("id", { count: "exact", head: true });
  if (branchId) exams = exams.eq("branchId", branchId);
  // A centre's own online exams (centre-exams.sql) count as exams too.
  let onlineExams = supabase.from("online_exams").select("id", { count: "exact", head: true }).is("deletedAt", null);
  if (branchId) onlineExams = onlineExams.eq("branchId", branchId);

  // fee_payments reaches a branch only through its invoice.
  const payments = branchId
    ? supabase.from("fee_payments").select("amount, paidAt, fee_invoices!inner(branchId)").eq("fee_invoices.branchId", branchId)
    : supabase.from("fee_payments").select("amount, paidAt");

  let dues = supabase.from("fee_invoices").select("totalAmount,paidAmount").in("status", ["DUE", "PARTIAL"]);
  if (branchId) dues = dues.eq("branchId", branchId);

  // "Order Certificate" counts the orders placed from the centre panel.
  let certificates = supabase.from("certificate_orders").select("id", { count: "exact", head: true });
  if (branchId) certificates = certificates.eq("branchId", branchId);

  const [studentsRes, examsRes, onlineExamsRes, paymentsRes, duesRes, certificatesRes] = await Promise.all([
    students,
    exams,
    onlineExams,
    payments,
    dues,
    certificates,
  ]);

  // A table this database has not got yet reads as zero rather than taking the
  // dashboard down; the students query is the one that must succeed.
  if (studentsRes.error) throw new Error(studentsRes.error.message);

  const statuses = (studentsRes.data || []).map((s: { admissionStatus?: string | null }) =>
    String(s.admissionStatus || "").toUpperCase(),
  );
  const requestedStudents = statuses.filter((s) => REQUESTED.has(s)).length;
  const approvedStudents = statuses.filter((s) => APPROVED.has(s)).length;

  const paymentRows = (paymentsRes.data || []) as Array<{ amount: number | string; paidAt?: string | null }>;
  const totalPayment = paymentRows.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const todaysPayment = paymentRows
    .filter((p) => p.paidAt && new Date(p.paidAt) >= today)
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const totalDues = ((duesRes.data || []) as Array<{ totalAmount: number; paidAmount: number }>).reduce(
    (sum, inv) => sum + Math.max(0, Number(inv.totalAmount || 0) - Number(inv.paidAmount || 0)),
    0,
  );

  return {
    totalStudents: statuses.length,
    registeredStudents: statuses.length - requestedStudents - approvedStudents,
    requestedStudents,
    approvedStudents,
    totalExams: (examsRes.count || 0) + (onlineExamsRes.count || 0),
    todaysPayment,
    totalPayment,
    totalDues,
    orderedCertificates: certificatesRes.count || 0,
  };
}
