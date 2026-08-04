import { createClient } from "@/lib/db/server";
import { paise, type Paise } from "@/lib/money";

export interface StudentFeeSummary {
  studentId: string;
  studentName: string;
  registrationNumber: string;
  feePlanId: string | null;
  totalPaise: Paise;
  paidPaise: Paise;
  duePaise: Paise;
}

export interface Instalment {
  id: string;
  sequence: number;
  dueDate: string;
  amountPaise: Paise;
  allocatedPaise: Paise;
  status: "pending" | "partially_paid" | "paid" | "waived";
}

export interface PaymentRow {
  id: string;
  receiptNumber: string;
  amountPaise: Paise;
  method: string;
  postedAt: string;
}

export interface StudentFeeDetail {
  studentId: string;
  studentName: string;
  registrationNumber: string;
  enrolmentId: string | null;
  feePlanId: string | null;
  totalPaise: Paise;
  paidPaise: Paise;
  duePaise: Paise;
  instalments: Instalment[];
  payments: PaymentRow[];
}

/** Fee position for every student at a centre — the "dues" view. */
export async function listStudentFeeSummaries(
  centreId: string,
): Promise<StudentFeeSummary[]> {
  const supabase = await createClient();

  const { data: students, error } = await supabase
    .from("students")
    .select("id, full_name, registration_number")
    .eq("centre_id", centreId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load students: ${error.message}`);
  }

  const { data: plans } = await supabase
    .from("fee_plans")
    .select("id, total_paise, enrolment_id, enrolments(student_id)")
    .eq("centre_id", centreId);

  const { data: payments } = await supabase
    .from("payments")
    .select("student_id, amount_paise")
    .eq("centre_id", centreId);

  const paidByStudent = new Map<string, number>();
  for (const payment of payments ?? []) {
    paidByStudent.set(
      payment.student_id,
      (paidByStudent.get(payment.student_id) ?? 0) + payment.amount_paise,
    );
  }

  const planByStudent = new Map<string, { id: string; total: number }>();
  for (const plan of plans ?? []) {
    const rel = plan.enrolments as unknown as
      { student_id: string } | { student_id: string }[] | null;
    const enrolment = Array.isArray(rel) ? rel[0] : rel;
    if (enrolment) {
      planByStudent.set(enrolment.student_id, {
        id: plan.id,
        total: plan.total_paise,
      });
    }
  }

  return (students ?? []).map((student) => {
    const plan = planByStudent.get(student.id);
    const total = plan?.total ?? 0;
    const paid = paidByStudent.get(student.id) ?? 0;

    return {
      studentId: student.id,
      studentName: student.full_name,
      registrationNumber: student.registration_number,
      feePlanId: plan?.id ?? null,
      totalPaise: paise(total),
      paidPaise: paise(paid),
      duePaise: paise(Math.max(0, total - paid)),
    };
  });
}

export async function getStudentFeeDetail(
  centreId: string,
  studentId: string,
): Promise<StudentFeeDetail | null> {
  const supabase = await createClient();

  const { data: student } = await supabase
    .from("students")
    .select("id, full_name, registration_number")
    .eq("centre_id", centreId)
    .eq("id", studentId)
    .maybeSingle();

  if (!student) return null;

  const { data: enrolment } = await supabase
    .from("enrolments")
    .select("id")
    .eq("student_id", studentId)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  const { data: plan } = enrolment
    ? await supabase
        .from("fee_plans")
        .select("id, total_paise")
        .eq("enrolment_id", enrolment.id)
        .maybeSingle()
    : { data: null };

  let instalments: Instalment[] = [];
  if (plan) {
    const { data: rows } = await supabase
      .from("fee_instalments")
      .select("id, sequence, due_date, amount_paise, status")
      .eq("fee_plan_id", plan.id)
      .order("sequence");

    const { data: allocations } = await supabase
      .from("payment_allocations")
      .select("fee_instalment_id, amount_paise")
      .in(
        "fee_instalment_id",
        (rows ?? []).map((r) => r.id),
      );

    const allocatedByInstalment = new Map<string, number>();
    for (const allocation of allocations ?? []) {
      allocatedByInstalment.set(
        allocation.fee_instalment_id,
        (allocatedByInstalment.get(allocation.fee_instalment_id) ?? 0) +
          allocation.amount_paise,
      );
    }

    instalments = (rows ?? []).map((row) => ({
      id: row.id,
      sequence: row.sequence,
      dueDate: row.due_date,
      amountPaise: paise(row.amount_paise),
      allocatedPaise: paise(allocatedByInstalment.get(row.id) ?? 0),
      status: row.status,
    }));
  }

  const { data: payments } = await supabase
    .from("payments")
    .select("id, receipt_number, amount_paise, method, posted_at")
    .eq("student_id", studentId)
    .order("posted_at", { ascending: false });

  const total = plan?.total_paise ?? 0;
  const paid = (payments ?? []).reduce((sum, p) => sum + p.amount_paise, 0);

  return {
    studentId: student.id,
    studentName: student.full_name,
    registrationNumber: student.registration_number,
    enrolmentId: enrolment?.id ?? null,
    feePlanId: plan?.id ?? null,
    totalPaise: paise(total),
    paidPaise: paise(paid),
    duePaise: paise(Math.max(0, total - paid)),
    instalments,
    payments: (payments ?? []).map((p) => ({
      id: p.id,
      receiptNumber: p.receipt_number,
      amountPaise: paise(p.amount_paise),
      method: p.method,
      postedAt: p.posted_at,
    })),
  };
}

export interface PrintableReceipt {
  receiptNumber: string;
  studentName: string;
  registrationNumber: string;
  centreName: string;
  courseName: string | null;
  amountPaise: Paise;
  method: string;
  reference: string | null;
  postedOn: string;
  totalPaise: Paise;
  paidPaise: Paise;
  duePaise: Paise;
}

function embedded<T>(rel: unknown): T | null {
  return Array.isArray(rel) ? ((rel[0] as T) ?? null) : ((rel as T) ?? null);
}

/**
 * One receipt, plus the running balance at the time it is printed.
 *
 * Scoped by RLS: payments_select covers centre staff and payments_select_self
 * covers the student, so both can print the same document without this query
 * taking a centre or student argument to be spoofed.
 */
export async function getPrintableReceipt(
  paymentId: string,
): Promise<PrintableReceipt | null> {
  const supabase = await createClient();

  const { data: payment } = await supabase
    .from("payments")
    .select(
      `receipt_number, amount_paise, method, reference, posted_at, student_id, fee_plan_id,
       students(full_name, registration_number),
       centres(name)`,
    )
    .eq("id", paymentId)
    .maybeSingle();

  if (!payment) return null;

  const student = embedded<{ full_name: string; registration_number: string }>(
    payment.students,
  );

  const { data: plan } = await supabase
    .from("fee_plans")
    .select("total_paise, enrolments(courses(name))")
    .eq("id", payment.fee_plan_id)
    .maybeSingle();

  const enrolment = embedded<{ courses: unknown }>(plan?.enrolments);

  // Everything paid on this plan so far, so the receipt shows a balance the
  // student can reconcile rather than just the one figure they handed over.
  const { data: allPayments } = await supabase
    .from("payments")
    .select("amount_paise")
    .eq("fee_plan_id", payment.fee_plan_id);

  const total = plan?.total_paise ?? 0;
  const paidSoFar = (allPayments ?? []).reduce(
    (sum: number, p: { amount_paise: number }) => sum + p.amount_paise,
    0,
  );

  return {
    receiptNumber: payment.receipt_number,
    studentName: student?.full_name ?? "Unknown",
    registrationNumber: student?.registration_number ?? "",
    centreName: embedded<{ name: string }>(payment.centres)?.name ?? "Centre",
    courseName: embedded<{ name: string }>(enrolment?.courses)?.name ?? null,
    amountPaise: paise(payment.amount_paise),
    method: payment.method,
    reference: payment.reference,
    postedOn: payment.posted_at.slice(0, 10),
    totalPaise: paise(total),
    paidPaise: paise(paidSoFar),
    duePaise: paise(Math.max(0, total - paidSoFar)),
  };
}
