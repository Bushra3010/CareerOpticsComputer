import { createClient } from "@/lib/db/server";
import { businessDate, monthRangeUtc } from "@/lib/dates";
import { paise, type Paise } from "@/lib/money";

/**
 * Reports are aggregates over tables that already carry RLS, so the same
 * query means "my centre" for centre staff and "the platform" for head
 * office — the policies do the scoping, not a parameter. Nothing here adds
 * a filter that a policy is already responsible for.
 */

async function countOf(
  supabase: Awaited<ReturnType<typeof createClient>>,
  table: string,
  build: (q: ReturnType<typeof buildCount>) => typeof q = (q) => q,
): Promise<number> {
  const query = build(buildCount(supabase, table));
  const { count } = await query;
  return count ?? 0;
}

function buildCount(
  supabase: Awaited<ReturnType<typeof createClient>>,
  table: string,
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- table name is a literal at every call site; the generic map cannot be indexed by a string variable.
  return (supabase.from(table as any) as any).select("id", {
    count: "exact",
    head: true,
  });
}

export interface CentreReport {
  activeStudents: number;
  admittedThisMonth: number;
  activeBatches: number;
  collectedThisMonthPaise: Paise;
  outstandingPaise: Paise;
  attendancePercent: number | null;
  attendanceSessions: number;
  examOutcomes: { passed: number; failed: number; distinction: number };
  certificatesIssued: number;
  openTickets: number;
  cashboxNetPaise: Paise;
}

export async function getCentreReport(centreId: string): Promise<CentreReport> {
  const supabase = await createClient();
  const { startUtc, endUtc } = monthRangeUtc();

  const [
    activeStudents,
    admittedThisMonth,
    activeBatches,
    certificatesIssued,
    openTickets,
  ] = await Promise.all([
    countOf(supabase, "students", (q) =>
      q.eq("centre_id", centreId).eq("status", "active"),
    ),
    countOf(supabase, "students", (q) =>
      q
        .eq("centre_id", centreId)
        .gte("created_at", startUtc)
        .lt("created_at", endUtc),
    ),
    countOf(supabase, "batches", (q) =>
      q.eq("centre_id", centreId).eq("status", "active"),
    ),
    countOf(supabase, "issued_documents", (q) =>
      q.eq("centre_id", centreId).eq("status", "issued"),
    ),
    countOf(supabase, "tickets", (q) =>
      q.eq("centre_id", centreId).not("status", "in", '("resolved","closed")'),
    ),
  ]);

  const [{ data: monthPayments }, { data: plans }, { data: allocations }] =
    await Promise.all([
      supabase
        .from("payments")
        .select("amount_paise")
        .eq("centre_id", centreId)
        .gte("posted_at", startUtc)
        .lt("posted_at", endUtc),
      supabase
        .from("fee_plans")
        .select("id, total_paise")
        .eq("centre_id", centreId),
      supabase
        .from("payments")
        .select("amount_paise")
        .eq("centre_id", centreId),
    ]);

  const collected = (monthPayments ?? []).reduce(
    (sum, p) => sum + p.amount_paise,
    0,
  );
  const billed = (plans ?? []).reduce((sum, p) => sum + p.total_paise, 0);
  const paidEver = (allocations ?? []).reduce(
    (sum, p) => sum + p.amount_paise,
    0,
  );

  // Attendance over the last 30 days, from the records themselves.
  const since = new Date(Date.now() - 30 * 86_400_000)
    .toISOString()
    .slice(0, 10);
  const { data: sessions } = await supabase
    .from("attendance_sessions")
    .select("id")
    .eq("centre_id", centreId)
    .gte("session_date", since);
  const sessionIds = (sessions ?? []).map((s) => s.id);

  let present = 0;
  let marked = 0;
  if (sessionIds.length) {
    const { data: records } = await supabase
      .from("attendance_records")
      .select("status")
      .in("session_id", sessionIds);
    for (const r of records ?? []) {
      marked += 1;
      if (r.status === "present" || r.status === "late") present += 1;
    }
  }

  const { data: results } = await supabase
    .from("student_results")
    .select("outcome, result_publications!inner(centre_id)")
    .eq("result_publications.centre_id", centreId);
  const outcomes = { passed: 0, failed: 0, distinction: 0 };
  for (const r of (results ?? []) as { outcome: string }[]) {
    if (r.outcome === "pass") outcomes.passed += 1;
    else if (r.outcome === "fail") outcomes.failed += 1;
    else if (r.outcome === "distinction") outcomes.distinction += 1;
  }

  const { data: cashbox } = await supabase
    .from("expense_entries")
    .select("entry_type, amount_paise")
    .eq("centre_id", centreId);
  let net = 0;
  for (const e of cashbox ?? []) {
    net += e.entry_type === "income" ? e.amount_paise : -e.amount_paise;
  }

  return {
    activeStudents,
    admittedThisMonth,
    activeBatches,
    collectedThisMonthPaise: paise(collected),
    outstandingPaise: paise(Math.max(billed - paidEver, 0)),
    attendancePercent: marked > 0 ? Math.round((present / marked) * 100) : null,
    attendanceSessions: sessionIds.length,
    examOutcomes: outcomes,
    certificatesIssued,
    openTickets,
    cashboxNetPaise: paise(net),
  };
}

export interface PlatformReport {
  centresTotal: number;
  centresActive: number;
  pendingApplications: number;
  studentsTotal: number;
  admittedThisMonth: number;
  collectedThisMonthPaise: Paise;
  walletBalancePaise: Paise;
  ordersAwaitingDispatch: number;
  commissionPayablePaise: Paise;
  openTickets: number;
  generatedOn: string;
  centres: {
    centreId: string;
    name: string;
    students: number;
    collectedThisMonthPaise: Paise;
  }[];
}

export async function getPlatformReport(): Promise<PlatformReport> {
  const supabase = await createClient();
  const { startUtc, endUtc } = monthRangeUtc();

  const [
    centresTotal,
    centresActive,
    pendingApplications,
    studentsTotal,
    admittedThisMonth,
    ordersAwaitingDispatch,
    openTickets,
  ] = await Promise.all([
    countOf(supabase, "centres"),
    countOf(supabase, "centres", (q) => q.eq("status", "active")),
    countOf(supabase, "centre_applications", (q) =>
      q.in("status", ["submitted", "under_review"]),
    ),
    countOf(supabase, "students", (q) => q.eq("status", "active")),
    countOf(supabase, "students", (q) =>
      q.gte("created_at", startUtc).lt("created_at", endUtc),
    ),
    countOf(supabase, "orders", (q) => q.eq("status", "paid")),
    countOf(supabase, "tickets", (q) =>
      q.not("status", "in", '("resolved","closed")'),
    ),
  ]);

  const [
    { data: monthPayments },
    { data: walletEntries },
    { data: commissions },
    { data: centres },
  ] = await Promise.all([
    supabase
      .from("payments")
      .select("amount_paise, centre_id")
      .gte("posted_at", startUtc)
      .lt("posted_at", endUtc),
    supabase.from("wallet_entries").select("amount_paise"),
    supabase
      .from("commission_entries")
      .select("amount_paise")
      .in("status", ["approved", "payable"]),
    supabase.from("centres").select("id, name").order("name"),
  ]);

  const collectedByCentre = new Map<string, number>();
  let collected = 0;
  for (const p of (monthPayments ?? []) as {
    amount_paise: number;
    centre_id: string;
  }[]) {
    collected += p.amount_paise;
    collectedByCentre.set(
      p.centre_id,
      (collectedByCentre.get(p.centre_id) ?? 0) + p.amount_paise,
    );
  }

  const { data: studentsPerCentre } = await supabase
    .from("students")
    .select("centre_id")
    .eq("status", "active");
  const studentsByCentre = new Map<string, number>();
  for (const s of (studentsPerCentre ?? []) as { centre_id: string }[]) {
    studentsByCentre.set(
      s.centre_id,
      (studentsByCentre.get(s.centre_id) ?? 0) + 1,
    );
  }

  return {
    centresTotal,
    centresActive,
    pendingApplications,
    studentsTotal,
    admittedThisMonth,
    collectedThisMonthPaise: paise(collected),
    walletBalancePaise: paise(
      (walletEntries ?? []).reduce((sum, w) => sum + w.amount_paise, 0),
    ),
    ordersAwaitingDispatch,
    commissionPayablePaise: paise(
      (commissions ?? []).reduce((sum, c) => sum + c.amount_paise, 0),
    ),
    openTickets,
    generatedOn: businessDate(),
    centres: ((centres ?? []) as { id: string; name: string }[]).map((c) => ({
      centreId: c.id,
      name: c.name,
      students: studentsByCentre.get(c.id) ?? 0,
      collectedThisMonthPaise: paise(collectedByCentre.get(c.id) ?? 0),
    })),
  };
}
