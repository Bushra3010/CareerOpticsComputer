import { createClient } from "@/lib/db/server";
import { businessDate, monthRangeUtc } from "@/lib/dates";
import { paise, type Paise } from "@/lib/money";

export interface CentreDashboard {
  centreName: string;
  centreCode: string;
  activeStudents: number;
  /** null when no attendance session exists for today — "not taken yet", not 0%. */
  attendanceToday: { present: number; marked: number } | null;
  collectedThisMonth: Paise;
  outstandingDues: Paise;
  overdueInstalments: number;
}

/**
 * All figures are scoped to one centre and read through RLS, so a query that
 * somehow escaped its tenant would return nothing rather than another centre's
 * numbers. Counts use `head: true` so Postgres returns the count without the
 * rows.
 */
export async function getCentreDashboard(
  centreId: string,
): Promise<CentreDashboard | null> {
  const supabase = await createClient();

  const { data: centre } = await supabase
    .from("centres")
    .select("name, code")
    .eq("id", centreId)
    .maybeSingle();

  if (!centre) return null;

  const today = businessDate();
  const { startUtc, endUtc } = monthRangeUtc();

  const [studentCount, sessions, monthPayments, plans, allPayments, overdue] =
    await Promise.all([
      supabase
        .from("students")
        .select("id", { count: "exact", head: true })
        .eq("centre_id", centreId)
        .eq("status", "active"),
      supabase
        .from("attendance_sessions")
        .select("id")
        .eq("centre_id", centreId)
        .eq("session_date", today),
      supabase
        .from("payments")
        .select("amount_paise")
        .eq("centre_id", centreId)
        .gte("posted_at", startUtc)
        .lt("posted_at", endUtc),
      supabase
        .from("fee_plans")
        .select("total_paise")
        .eq("centre_id", centreId),
      supabase
        .from("payments")
        .select("amount_paise")
        .eq("centre_id", centreId),
      supabase
        .from("fee_instalments")
        .select("id, fee_plans!inner(centre_id)", {
          count: "exact",
          head: true,
        })
        .eq("fee_plans.centre_id", centreId)
        .lt("due_date", today)
        .in("status", ["pending", "partially_paid"]),
    ]);

  let attendanceToday: CentreDashboard["attendanceToday"] = null;
  const sessionIds = (sessions.data ?? []).map((s) => s.id);
  if (sessionIds.length > 0) {
    const { data: records } = await supabase
      .from("attendance_records")
      .select("status")
      .in("session_id", sessionIds);

    attendanceToday = {
      present: (records ?? []).filter((r) => r.status === "present").length,
      marked: (records ?? []).length,
    };
  }

  const billed = (plans.data ?? []).reduce((sum, p) => sum + p.total_paise, 0);
  const collectedEver = (allPayments.data ?? []).reduce(
    (sum, p) => sum + p.amount_paise,
    0,
  );

  return {
    centreName: centre.name,
    centreCode: centre.code,
    activeStudents: studentCount.count ?? 0,
    attendanceToday,
    collectedThisMonth: paise(
      (monthPayments.data ?? []).reduce((sum, p) => sum + p.amount_paise, 0),
    ),
    // Clamped at zero: an overpayment can't be posted today, but a future
    // reversal/credit feature could make this negative, and a negative "due"
    // reads as a bug to a centre owner.
    outstandingDues: paise(Math.max(0, billed - collectedEver)),
    overdueInstalments: overdue.count ?? 0,
  };
}

export interface AdminDashboard {
  activeCentres: number;
  pendingApplications: number;
  totalStudents: number;
  newLeads: number;
  publishedCourses: number;
}

export async function getAdminDashboard(): Promise<AdminDashboard> {
  const supabase = await createClient();

  const [centres, applications, students, leads, courses] = await Promise.all([
    supabase
      .from("centres")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("centre_applications")
      .select("id", { count: "exact", head: true })
      .in("status", ["submitted", "under_review"]),
    supabase.from("students").select("id", { count: "exact", head: true }),
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("status", "new"),
    supabase
      .from("courses")
      .select("id", { count: "exact", head: true })
      .eq("status", "published"),
  ]);

  return {
    activeCentres: centres.count ?? 0,
    pendingApplications: applications.count ?? 0,
    totalStudents: students.count ?? 0,
    newLeads: leads.count ?? 0,
    publishedCourses: courses.count ?? 0,
  };
}
