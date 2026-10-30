/**
 * The rows the dashboards' charts are drawn from. The counting is done in
 * lib/dashboardCharts.ts.
 *
 * Each query stands alone: one that fails leaves its chart empty rather than
 * taking the dashboard down, the same bargain getDashboardStats makes.
 */
import { supabase } from "@/lib/supabase/client";
import { getBatchTimings, getBatches, getBatchesByOrg, getCourses } from "@/lib/supabase/data";
import {
  monthsBack,
  type AttendancePoint,
  type BatchPoint,
  type EnquiryPoint,
  type OpenInvoice,
  type PaymentPoint,
  type StudentPoint,
  type TimingPoint,
} from "@/lib/dashboardCharts";

export interface DashboardRows {
  payments: PaymentPoint[];
  invoices: OpenInvoice[];
  attendance: AttendancePoint[];
  students: StudentPoint[];
  enquiries: EnquiryPoint[];
  batches: BatchPoint[];
  timings: TimingPoint[];
}

const rows = async <T>(query: PromiseLike<{ data: unknown; error: unknown }>): Promise<T[]> => {
  try {
    const { data, error } = await query;
    return error ? [] : ((data ?? []) as T[]);
  } catch {
    return [];
  }
};

const isoDay = (d: Date) => d.toISOString().slice(0, 10);

export async function getDashboardRows(
  branchId: string | null,
  organizationId: string | null,
  now = new Date(),
): Promise<DashboardRows> {
  const since = monthsBack(now, 4); // five months, this one included
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86_400_000);

  // fee_payments reaches a branch only through its invoice.
  const payments = rows<PaymentPoint>(
    branchId
      ? supabase
          .from("fee_payments")
          .select("amount, paidAt, reversedAt, fee_invoices!inner(branchId)")
          .gte("paidAt", since.toISOString())
          .eq("fee_invoices.branchId", branchId)
      : supabase.from("fee_payments").select("amount, paidAt, reversedAt").gte("paidAt", since.toISOString()),
  );

  let invoiceQuery = supabase
    .from("fee_invoices")
    .select("totalAmount, paidAmount, dueDate")
    .in("status", ["DUE", "PARTIAL"])
    .gte("dueDate", isoDay(since));
  if (branchId) invoiceQuery = invoiceQuery.eq("branchId", branchId);

  let attendanceQuery = supabase
    .from("attendance_records")
    .select("studentId, date, status")
    .gte("date", isoDay(thirtyDaysAgo));
  if (branchId) attendanceQuery = attendanceQuery.eq("branchId", branchId);

  let studentQuery = supabase
    .from("students")
    .select("id, batchId, admissionStatus, admissionDate, createdAt")
    .is("deletedAt", null);
  if (branchId) studentQuery = studentQuery.eq("branchId", branchId);

  let enquiryQuery = supabase.from("visit_enquiries").select("status, followUpDate, createdAt, visitDate");
  if (branchId) enquiryQuery = enquiryQuery.eq("branchId", branchId);

  const batchesAndTimings = (async () => {
    try {
      const batchResult = branchId ? await getBatches(branchId) : await getBatchesByOrg(organizationId);
      const list = (batchResult.data ?? []) as Array<Record<string, unknown>>;
      const [timingResult, courseResult] = await Promise.all([
        getBatchTimings(branchId || "", branchId ? undefined : { batchIds: list.map((b) => String(b.id)) }),
        getCourses(organizationId, branchId).catch(() => ({ data: [] })),
      ]);
      const courseName = new Map(
        ((courseResult.data ?? []) as Array<{ id: string; name: string }>).map((c) => [c.id, c.name]),
      );
      return {
        batches: list.map((b) => ({
          id: String(b.id),
          name: String(b.name ?? "Batch"),
          instructor: (b.instructor as string) || null,
          courseName: courseName.get(String(b.courseId)) ?? null,
        })),
        timings: (timingResult.data ?? []) as unknown as TimingPoint[],
      };
    } catch {
      return { batches: [] as BatchPoint[], timings: [] as TimingPoint[] };
    }
  })();

  const [p, i, a, s, e, bt] = await Promise.all([
    payments,
    rows<OpenInvoice>(invoiceQuery),
    rows<AttendancePoint>(attendanceQuery),
    rows<StudentPoint>(studentQuery),
    rows<EnquiryPoint>(enquiryQuery),
    batchesAndTimings,
  ]);
  return { payments: p, invoices: i, attendance: a, students: s, enquiries: e, ...bt };
}
