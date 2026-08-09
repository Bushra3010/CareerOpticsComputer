import { createClient } from "@/lib/db/server";
import { paise, type Paise } from "@/lib/money";

export interface StudentAttendanceRow {
  sessionDate: string;
  status: "present" | "absent" | "late" | "excused";
}

export interface StudentInstalment {
  id: string;
  sequence: number;
  dueDate: string;
  amountPaise: Paise;
  allocatedPaise: Paise;
  status: "pending" | "partially_paid" | "paid" | "waived";
}

export interface StudentReceipt {
  id: string;
  receiptNumber: string;
  amountPaise: Paise;
  method: string;
  postedAt: string;
}

export interface StudentSelfProfile {
  fullName: string;
  registrationNumber: string;
  centreName: string | null;
  phone: string | null;
  email: string | null;
  guardianName: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  address: string | null;
  admittedOn: string;
  course: {
    name: string;
    durationLabel: string | null;
    description: string | null;
  } | null;
}

/**
 * The signed-in student's own record, contact fields included — same
 * no-parameter shape as getStudentOverview: the row comes from the session,
 * and RLS is the backstop. Corrections go through the centre, so there is
 * deliberately no edit action anywhere behind this.
 */
export async function getStudentSelfProfile(): Promise<StudentSelfProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: student } = await supabase
    .from("students")
    .select(
      "id, full_name, registration_number, phone, email, guardian_name, date_of_birth, gender, address, created_at, centres(name)",
    )
    .eq("user_id", user.id)
    .maybeSingle();
  if (!student) return null;

  const centre = (
    Array.isArray(student.centres) ? student.centres[0] : student.centres
  ) as { name: string } | null;

  const { data: enrolment } = await supabase
    .from("enrolments")
    .select("courses(name, duration_label, description)")
    .eq("student_id", student.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const course = (
    Array.isArray(enrolment?.courses)
      ? enrolment?.courses[0]
      : enrolment?.courses
  ) as {
    name: string;
    duration_label: string | null;
    description: string | null;
  } | null;

  return {
    fullName: student.full_name,
    registrationNumber: student.registration_number,
    centreName: centre?.name ?? null,
    phone: student.phone,
    email: student.email,
    guardianName: student.guardian_name,
    dateOfBirth: student.date_of_birth,
    gender: student.gender,
    address: student.address,
    admittedOn: student.created_at.slice(0, 10),
    course: course
      ? {
          name: course.name,
          durationLabel: course.duration_label,
          description: course.description,
        }
      : null,
  };
}

export interface StudentOverview {
  studentName: string;
  registrationNumber: string;
  centreName: string | null;
  courseName: string | null;
  /** null when no session has been held yet — distinct from 0%. */
  attendance: { present: number; total: number } | null;
  totalPaise: Paise;
  paidPaise: Paise;
  duePaise: Paise;
  instalments: StudentInstalment[];
  receipts: StudentReceipt[];
  attendanceHistory: StudentAttendanceRow[];
}

/**
 * Everything the signed-in student may see about themselves. Deliberately
 * takes no id: the row is resolved from the session, so there is no parameter
 * a student could change to look at somebody else. RLS (migration 0014) is the
 * backstop — every table below also filters to this student in Postgres.
 */
export async function getStudentOverview(): Promise<StudentOverview | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: student } = await supabase
    .from("students")
    .select("id, full_name, registration_number, centre_id, centres(name)")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!student) return null;

  /**
   * Unwraps a PostgREST embedded resource, which arrives as an object or a
   * one-element array depending on the relationship. Takes `unknown` because
   * types/database.generated.ts is hand-written with `Relationships: []`, so
   * the client cannot type embeds at all — one cast here beats one at every
   * call site.
   */
  const one = <T>(rel: unknown): T | null =>
    Array.isArray(rel) ? ((rel[0] as T) ?? null) : ((rel as T) ?? null);

  const { data: enrolment } = await supabase
    .from("enrolments")
    .select("id, courses(name)")
    .eq("student_id", student.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  const [records, plan, payments] = await Promise.all([
    enrolment
      ? supabase
          .from("attendance_records")
          .select("status, attendance_sessions(session_date)")
          .eq("enrolment_id", enrolment.id)
      : Promise.resolve({ data: [] as unknown[] }),
    enrolment
      ? supabase
          .from("fee_plans")
          .select("id, total_paise")
          .eq("enrolment_id", enrolment.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from("payments")
      .select("id, receipt_number, amount_paise, method, posted_at")
      .eq("student_id", student.id)
      .order("posted_at", { ascending: false }),
  ]);

  const attendanceHistory: StudentAttendanceRow[] = (
    (records.data ?? []) as {
      status: StudentAttendanceRow["status"];
      attendance_sessions:
        { session_date: string } | { session_date: string }[] | null;
    }[]
  )
    .map((r) => ({
      status: r.status,
      sessionDate:
        one<{ session_date: string }>(r.attendance_sessions)?.session_date ??
        "",
    }))
    .sort((a, b) => b.sessionDate.localeCompare(a.sessionDate));

  let instalments: StudentInstalment[] = [];
  const planRow = plan.data as { id: string; total_paise: number } | null;

  if (planRow) {
    const { data: rows } = await supabase
      .from("fee_instalments")
      .select("id, sequence, due_date, amount_paise, status")
      .eq("fee_plan_id", planRow.id)
      .order("sequence");

    const ids = (rows ?? []).map((r) => r.id);
    const { data: allocations } = ids.length
      ? await supabase
          .from("payment_allocations")
          .select("fee_instalment_id, amount_paise")
          .in("fee_instalment_id", ids)
      : { data: [] };

    const allocated = new Map<string, number>();
    for (const alloc of allocations ?? []) {
      allocated.set(
        alloc.fee_instalment_id,
        (allocated.get(alloc.fee_instalment_id) ?? 0) + alloc.amount_paise,
      );
    }

    instalments = (rows ?? []).map((r) => ({
      id: r.id,
      sequence: r.sequence,
      dueDate: r.due_date,
      amountPaise: paise(r.amount_paise),
      allocatedPaise: paise(allocated.get(r.id) ?? 0),
      status: r.status,
    }));
  }

  const total = planRow?.total_paise ?? 0;
  const paid = (payments.data ?? []).reduce(
    (sum, p) => sum + p.amount_paise,
    0,
  );
  const marked = attendanceHistory.length;

  return {
    studentName: student.full_name,
    registrationNumber: student.registration_number,
    centreName: one<{ name: string }>(student.centres)?.name ?? null,
    courseName: enrolment
      ? (one<{ name: string }>(enrolment.courses)?.name ?? null)
      : null,
    attendance: marked
      ? {
          present: attendanceHistory.filter((r) => r.status === "present")
            .length,
          total: marked,
        }
      : null,
    totalPaise: paise(total),
    paidPaise: paise(paid),
    duePaise: paise(Math.max(0, total - paid)),
    instalments,
    receipts: (payments.data ?? []).map((p) => ({
      id: p.id,
      receiptNumber: p.receipt_number,
      amountPaise: paise(p.amount_paise),
      method: p.method,
      postedAt: p.posted_at,
    })),
    attendanceHistory,
  };
}
