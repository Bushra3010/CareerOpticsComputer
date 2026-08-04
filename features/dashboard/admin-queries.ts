import { createClient } from "@/lib/db/server";
import { paise, type Paise } from "@/lib/money";
import type { TrendPoint } from "@/components/charts/trend-chart";

/**
 * Platform dashboard data.
 *
 * Every figure is a real aggregate — nothing here is synthetic. The page that
 * renders it is gated on `profiles.is_platform_super_admin`, so these queries
 * assume a caller who is allowed to see across every tenant.
 *
 * Deliberately built out of ordinary PostgREST calls rather than a SQL view or
 * RPC. A view would need a migration, and migrations on this project currently
 * have to be applied to the hosted database by hand — a dashboard is not worth
 * blocking on that. If these grow slow at scale, the fix is a materialised view
 * plus a scheduled refresh (PRD §13.1 says to reach for one only when a measured
 * query justifies it), not a hand-rolled cache.
 */

/** Rolling window used by both trend charts. */
const TREND_DAYS = 30;

export interface CentreApplicationRow {
  id: string;
  centreName: string;
  applicantName: string;
  district: string;
  status: string;
  appliedOn: string;
}

export interface TopCentreRow {
  id: string;
  name: string;
  students: number;
  revenue: Paise;
}

export interface TransactionRow {
  id: string;
  receiptNumber: string;
  centreName: string;
  method: string;
  amount: Paise;
  postedAt: string;
}

export interface ActivityRow {
  id: string;
  action: string;
  tableName: string;
  reason: string | null;
  occurredAt: string;
}

export interface AdminOverview {
  totalCentres: number;
  activeCentres: number;
  totalStudents: number;
  revenueThisMonth: Paise;

  centreGrowth: TrendPoint[];
  revenueTrend: TrendPoint[];

  recentApplications: CentreApplicationRow[];
  pendingApprovals: CentreApplicationRow[];
  topCentres: TopCentreRow[];
  recentTransactions: TransactionRow[];
  recentActivity: ActivityRow[];

  summary: {
    courses: number;
    resultPublications: number;
    certificatesIssued: number;
    openLeads: number;
  };
}

/** Midnight IST for `daysAgo` days back, as a UTC instant. */
function istDayStart(daysAgo: number): Date {
  const now = new Date();
  // IST is UTC+5:30 with no daylight saving, so a fixed offset is exact here.
  const istNow = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  istNow.setUTCHours(0, 0, 0, 0);
  istNow.setUTCDate(istNow.getUTCDate() - daysAgo);
  return new Date(istNow.getTime() - 5.5 * 60 * 60 * 1000);
}

function istDayKey(iso: string): string {
  const d = new Date(new Date(iso).getTime() + 5.5 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}

function dayLabel(key: string): string {
  const [, m, d] = key.split("-");
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${Number(d)} ${months[Number(m) - 1]}`;
}

/** The last `TREND_DAYS` IST dates, oldest first. */
function trendDayKeys(): string[] {
  return Array.from({ length: TREND_DAYS }, (_, i) => {
    const d = istDayStart(TREND_DAYS - 1 - i);
    return istDayKey(d.toISOString());
  });
}

export async function getAdminOverview(): Promise<AdminOverview> {
  const supabase = await createClient();
  const windowStart = istDayStart(TREND_DAYS - 1).toISOString();
  const monthStart = (() => {
    const d = istDayStart(0);
    const ist = new Date(d.getTime() + 5.5 * 60 * 60 * 1000);
    ist.setUTCDate(1);
    return new Date(ist.getTime() - 5.5 * 60 * 60 * 1000).toISOString();
  })();

  const [
    totalCentres,
    activeCentres,
    totalStudents,
    monthPayments,
    centresForTrend,
    paymentsForTrend,
    applications,
    students,
    paymentsAll,
    centresAll,
    transactions,
    activity,
    courses,
    publications,
    certificates,
    leads,
  ] = await Promise.all([
    supabase.from("centres").select("id", { count: "exact", head: true }),
    supabase
      .from("centres")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    supabase.from("students").select("id", { count: "exact", head: true }),
    supabase
      .from("payments")
      .select("amount_paise")
      .gte("posted_at", monthStart),

    supabase.from("centres").select("created_at").order("created_at"),
    supabase
      .from("payments")
      .select("amount_paise, posted_at")
      .gte("posted_at", windowStart)
      .order("posted_at"),

    supabase
      .from("centre_applications")
      .select(
        "id, proposed_centre_name, applicant_name, city, state, status, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(20),

    supabase.from("students").select("centre_id"),
    supabase.from("payments").select("centre_id, amount_paise"),
    supabase.from("centres").select("id, name"),

    supabase
      .from("payments")
      .select("id, receipt_number, method, amount_paise, posted_at, centre_id")
      .order("posted_at", { ascending: false })
      .limit(5),

    supabase
      .from("audit_logs")
      .select("id, action, table_name, reason, created_at")
      .order("created_at", { ascending: false })
      .limit(5),

    supabase
      .from("courses")
      .select("id", { count: "exact", head: true })
      .eq("status", "published"),
    supabase
      .from("result_publications")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("issued_documents")
      .select("id", { count: "exact", head: true })
      .eq("status", "issued"),
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("status", "new"),
  ]);

  const centreNames = new Map(
    (centresAll.data ?? []).map((c) => [c.id as string, c.name as string]),
  );

  // --- Centre growth: new centres per day, plus the running total ----------
  const days = trendDayKeys();
  const newPerDay = new Map<string, number>(days.map((d) => [d, 0]));

  // Centres created before the window still count towards the running total,
  // otherwise the line would start at zero and imply the platform was empty.
  let runningTotal = 0;
  const createdKeys = (centresForTrend.data ?? []).map((c) =>
    istDayKey(c.created_at as string),
  );
  const firstDay = days[0]!;
  for (const key of createdKeys) {
    if (key < firstDay) runningTotal += 1;
    else if (newPerDay.has(key)) newPerDay.set(key, newPerDay.get(key)! + 1);
  }

  const centreGrowth: TrendPoint[] = [];
  for (const key of days) {
    runningTotal += newPerDay.get(key)!;
    centreGrowth.push({
      label: dayLabel(key),
      line: runningTotal,
      bar: newPerDay.get(key)!,
    });
  }

  // --- Revenue: cumulative rupees across the window ------------------------
  const revenuePerDay = new Map<string, number>(days.map((d) => [d, 0]));
  for (const p of paymentsForTrend.data ?? []) {
    const key = istDayKey(p.posted_at as string);
    if (revenuePerDay.has(key)) {
      revenuePerDay.set(
        key,
        revenuePerDay.get(key)! + Number(p.amount_paise ?? 0),
      );
    }
  }
  let cumulative = 0;
  const revenueTrend: TrendPoint[] = days.map((key) => {
    cumulative += revenuePerDay.get(key)!;
    return { label: dayLabel(key), line: cumulative / 100 };
  });

  // --- Top centres by fee revenue -----------------------------------------
  const studentsPerCentre = new Map<string, number>();
  for (const s of students.data ?? []) {
    const id = s.centre_id as string | null;
    if (id) studentsPerCentre.set(id, (studentsPerCentre.get(id) ?? 0) + 1);
  }
  const revenuePerCentre = new Map<string, number>();
  for (const p of paymentsAll.data ?? []) {
    const id = p.centre_id as string | null;
    if (id)
      revenuePerCentre.set(
        id,
        (revenuePerCentre.get(id) ?? 0) + Number(p.amount_paise ?? 0),
      );
  }
  const topCentres: TopCentreRow[] = [...centreNames.entries()]
    .map(([id, name]) => ({
      id,
      name,
      students: studentsPerCentre.get(id) ?? 0,
      revenue: paise(revenuePerCentre.get(id) ?? 0),
    }))
    .sort((a, b) => Number(b.revenue) - Number(a.revenue))
    .slice(0, 5);

  const toApplicationRow = (a: {
    id: string;
    proposed_centre_name: string;
    applicant_name: string;
    city: string | null;
    state: string | null;
    status: string;
    created_at: string;
  }): CentreApplicationRow => ({
    id: a.id,
    centreName: a.proposed_centre_name,
    applicantName: a.applicant_name,
    district: a.city ?? a.state ?? "—",
    status: a.status,
    appliedOn: a.created_at,
  });

  const allApplications = (applications.data ?? []).map((a) =>
    toApplicationRow(a as never),
  );

  return {
    totalCentres: totalCentres.count ?? 0,
    activeCentres: activeCentres.count ?? 0,
    totalStudents: totalStudents.count ?? 0,
    revenueThisMonth: paise(
      (monthPayments.data ?? []).reduce(
        (sum, p) => sum + Number(p.amount_paise ?? 0),
        0,
      ),
    ),

    centreGrowth,
    revenueTrend,

    recentApplications: allApplications.slice(0, 5),
    pendingApprovals: allApplications
      .filter((a) => a.status === "submitted" || a.status === "under_review")
      .slice(0, 5),
    topCentres,

    recentTransactions: (transactions.data ?? []).map((t) => ({
      id: t.id as string,
      receiptNumber: (t.receipt_number as string) ?? "—",
      centreName: centreNames.get(t.centre_id as string) ?? "—",
      method: (t.method as string) ?? "—",
      amount: paise(Number(t.amount_paise ?? 0)),
      postedAt: t.posted_at as string,
    })),

    recentActivity: (activity.data ?? []).map((a) => ({
      id: String(a.id),
      action: a.action as string,
      tableName: a.table_name as string,
      reason: (a.reason as string) ?? null,
      occurredAt: a.created_at as string,
    })),

    summary: {
      courses: courses.count ?? 0,
      resultPublications: publications.count ?? 0,
      certificatesIssued: certificates.count ?? 0,
      openLeads: leads.count ?? 0,
    },
  };
}
