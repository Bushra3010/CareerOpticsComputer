/**
 * The dashboards' charts and lists, worked out from real records.
 *
 * Both dashboards used to draw fixed numbers -- a fee chart for April to
 * August, a week of attendance, three batches taught by invented faculty, a
 * funnel of 18/7/5/11 and "9 students below 75%" -- whatever the database
 * held. These take the rows and do the counting; fetching is in
 * lib/supabase/dashboardCharts.ts.
 */

export interface PaymentPoint {
  amount: number | string | null;
  paidAt: string | null;
  reversedAt?: string | null;
}
export interface OpenInvoice {
  totalAmount: number | string | null;
  paidAmount: number | string | null;
  dueDate: string | null;
}
export interface AttendancePoint {
  studentId?: string | null;
  date: string;
  status: string;
}
export interface TimingPoint {
  batchId: string;
  day: string;
  startTime?: string | null;
  endTime?: string | null;
  instructor?: string | null;
  subject?: string | null;
}
export interface BatchPoint {
  id: string;
  name: string;
  instructor?: string | null;
  courseName?: string | null;
}
export interface StudentPoint {
  id: string;
  batchId?: string | null;
  admissionStatus?: string | null;
  admissionDate?: string | null;
  createdAt?: string | null;
}
export interface EnquiryPoint {
  status?: string | null;
  followUpDate?: string | null;
  createdAt?: string | null;
  visitDate?: string | null;
}

const num = (v: unknown) => Number(v) || 0;
const ym = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
const localDay = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
/** Thousands of rupees, to one decimal: the unit both fee charts are labelled in. */
const thousands = (rupees: number) => Math.round(rupees / 100) / 10;
const present = (status: string) => ["PRESENT", "LATE"].includes(String(status).toUpperCase());

/** The first day of the month `back` months before `now`. */
export const monthsBack = (now: Date, back: number) => new Date(now.getFullYear(), now.getMonth() - back, 1);

/**
 * Collected (payments received, less reversed ones) and still due (what is
 * left on open invoices, by the month they fall due), per month, in ₹ thousand.
 */
export function monthlyFees(payments: PaymentPoint[], invoices: OpenInvoice[], now: Date, months = 5) {
  const rows = Array.from({ length: months }, (_, i) => {
    const d = monthsBack(now, months - 1 - i);
    return { key: ym(d), m: d.toLocaleString("en-US", { month: "short" }), collected: 0, due: 0 };
  });
  const byKey = new Map(rows.map((r) => [r.key, r]));
  for (const p of payments) {
    if (!p.paidAt || p.reversedAt) continue;
    const row = byKey.get(p.paidAt.slice(0, 7));
    if (row) row.collected += num(p.amount);
  }
  for (const inv of invoices) {
    if (!inv.dueDate) continue;
    const row = byKey.get(inv.dueDate.slice(0, 7));
    if (row) row.due += Math.max(0, num(inv.totalAmount) - num(inv.paidAmount));
  }
  return rows.map(({ m, collected, due }) => ({ m, collected: thousands(collected), due: thousands(due) }));
}

const WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Monday to Saturday of this week: attendance %, and fees collected in ₹ thousand. */
export function weekActivity(attendance: AttendancePoint[], payments: PaymentPoint[], now: Date) {
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return WEEK.map((day, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const date = localDay(d);
    const marks = attendance.filter((a) => a.date?.slice(0, 10) === date);
    const fees = payments
      .filter((p) => !p.reversedAt && p.paidAt && localDay(new Date(p.paidAt)) === date)
      .reduce((sum, p) => sum + num(p.amount), 0);
    return {
      day,
      // No register taken that day is not 0% attendance: the point is left out.
      attendance: marks.length ? Math.round((marks.filter((m) => present(m.status)).length / marks.length) * 100) : null,
      fees: thousands(fees),
    };
  });
}

const DAY_NAMES = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
const hhmm = (t?: string | null) => (t ? t.slice(0, 5) : "");

/** Batches with a class today, earliest first, with how many students they hold. */
export function todaysBatches(timings: TimingPoint[], batches: BatchPoint[], students: StudentPoint[], now: Date) {
  const today = DAY_NAMES[now.getDay()];
  const byId = new Map(batches.map((b) => [b.id, b]));
  return timings
    .filter((t) => String(t.day).toUpperCase() === today && byId.has(t.batchId))
    .sort((a, b) => String(a.startTime).localeCompare(String(b.startTime)))
    .map((t) => {
      const batch = byId.get(t.batchId)!;
      return {
        key: `${t.batchId}-${t.startTime}`,
        name: batch.courseName ? `${batch.name} · ${batch.courseName}` : batch.name,
        time: [hhmm(t.startTime), hhmm(t.endTime)].filter(Boolean).join(" – ") || "Time not set",
        faculty: t.instructor || batch.instructor || "Faculty not assigned",
        strength: students.filter((s) => s.batchId === t.batchId).length,
      };
    });
}

/** Where admissions stand this month. */
export function admissionFunnel(enquiries: EnquiryPoint[], students: StudentPoint[], now: Date) {
  const monthStart = localDay(monthsBack(now, 0));
  const today = localDay(now);
  const day = (v?: string | null) => (v ? v.slice(0, 10) : "");
  return {
    newEnquiries: enquiries.filter(
      (e) => String(e.status ?? "").toUpperCase() === "NEW" && day(e.visitDate ?? e.createdAt) >= monthStart,
    ).length,
    followUpDue: enquiries.filter((e) => {
      const status = String(e.status ?? "").toUpperCase();
      return !!e.followUpDate && day(e.followUpDate) <= today && status !== "CLOSED" && status !== "CONVERTED";
    }).length,
    onlineApplications: students.filter((s) => String(s.admissionStatus ?? "").toUpperCase() === "SUBMITTED").length,
    admittedThisMonth: students.filter((s) => day(s.admissionDate ?? s.createdAt) >= monthStart).length,
  };
}

/** Students whose attendance over the records given is below `threshold` percent. */
export function belowAttendance(attendance: AttendancePoint[], threshold = 75) {
  const tally = new Map<string, { marked: number; present: number }>();
  for (const a of attendance) {
    if (!a.studentId) continue;
    const t = tally.get(a.studentId) ?? { marked: 0, present: 0 };
    t.marked += 1;
    if (present(a.status)) t.present += 1;
    tally.set(a.studentId, t);
  }
  return [...tally.values()].filter((t) => (t.present / t.marked) * 100 < threshold).length;
}
