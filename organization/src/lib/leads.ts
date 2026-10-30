/**
 * Reading the admission pipeline.
 *
 * A lead's worth is in when it was last touched and when it is due to be
 * touched again, so the derivations here are mostly about dates: which calls
 * are overdue, which are today, and how the month is going against the last.
 */
import type { AdmissionLead, LeadStage } from "@/lib/supabase/data";
import { LEAD_STAGES } from "@/lib/supabase/data";

export type FollowUpBucket = "Overdue" | "Today" | "Upcoming" | "None";

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/**
 * When the next call on this lead falls.
 *
 * Compared as days rather than instants: a call booked for 4pm today is due
 * today, not overdue because the morning has passed.
 */
export function followUpBucket(followUpAt: string, now = new Date()): FollowUpBucket {
  if (!followUpAt) return "None";
  const due = new Date(followUpAt);
  if (Number.isNaN(due.getTime())) return "None";
  const today = startOfDay(now);
  const day = startOfDay(due);
  if (day < today) return "Overdue";
  if (day === today) return "Today";
  return "Upcoming";
}

/**
 * The board: one column per stage, in the order given.
 *
 * Structural rather than tied to one lead type — the franchise register runs
 * the same board over a different set of stages, and the date and grouping
 * rules below are worth having in one tested place rather than two.
 */
export function pipeline<S extends string, T extends { status: string }>(
  leads: T[],
  stages: readonly S[],
): Array<{ stage: S; leads: T[] }> {
  return stages.map((stage) => ({
    stage,
    leads: leads.filter((lead) => lead.status === stage),
  }));
}

/** The admission board, over the stages an admission lead moves through. */
export const admissionPipeline = (leads: AdmissionLead[]) =>
  pipeline<LeadStage, AdmissionLead>(leads, LEAD_STAGES as readonly LeadStage[]);

/**
 * Where enquiries come from, biggest first.
 *
 * A percentage of nothing is not zero percent, it is nothing to show — an
 * empty list says so rather than drawing five bars all at 0%.
 */
export function sourceBreakdown<T extends { source?: string }>(
  leads: T[],
): Array<{ source: string; count: number; percent: number }> {
  const counted = new Map<string, number>();
  for (const lead of leads) {
    const source = lead.source?.trim() || "Not recorded";
    counted.set(source, (counted.get(source) ?? 0) + 1);
  }
  const total = leads.length;
  if (!total) return [];
  return [...counted.entries()]
    .map(([source, count]) => ({ source, count, percent: Math.round((count / total) * 100) }))
    .sort((a, b) => b.count - a.count || a.source.localeCompare(b.source));
}

/** Leads created per month, oldest first, for the performance bars. */
export function monthlyEnquiries<T extends { createdAt?: string }>(
  leads: T[],
  months = 6,
  now = new Date(),
): Array<{ label: string; count: number }> {
  const buckets: Array<{ label: string; key: string; count: number }> = [];
  for (let back = months - 1; back >= 0; back -= 1) {
    const month = new Date(now.getFullYear(), now.getMonth() - back, 1);
    buckets.push({
      label: month.toLocaleDateString("en-IN", { month: "short" }),
      key: `${month.getFullYear()}-${month.getMonth()}`,
      count: 0,
    });
  }
  const index = new Map(buckets.map((bucket, i) => [bucket.key, i]));
  for (const lead of leads) {
    if (!lead.createdAt) continue;
    const created = new Date(lead.createdAt);
    if (Number.isNaN(created.getTime())) continue;
    const at = index.get(`${created.getFullYear()}-${created.getMonth()}`);
    if (at !== undefined) buckets[at].count += 1;
  }
  return buckets.map(({ label, count }) => ({ label, count }));
}

/** The eight figures across the top. */
export function leadSummary(leads: AdmissionLead[], now = new Date()) {
  const thisMonth = leads.filter((lead) => {
    if (!lead.createdAt) return false;
    const created = new Date(lead.createdAt);
    return (
      !Number.isNaN(created.getTime()) &&
      created.getMonth() === now.getMonth() &&
      created.getFullYear() === now.getFullYear()
    );
  });
  const dueToday = leads.filter((lead) => {
    const bucket = followUpBucket(lead.followUpAt, now);
    // Overdue calls are due too — leaving them out is how they stay missed.
    return bucket === "Today" || bucket === "Overdue";
  });

  return {
    total: leads.length,
    newThisMonth: thisMonth.length,
    followUpsDue: dueToday.length,
    counselling: leads.filter((l) => l.status === "Counselling").length,
    demo: leads.filter((l) => l.status === "Demo Class").length,
    admissions: leads.filter((l) => l.status === "Admission").length,
    lost: leads.filter((l) => l.status === "Lost" || l.status === "Not Interested").length,
  };
}

/** Today's call list: overdue first, then today, each by the time it is due. */
export function followUpQueue<T extends { followUpAt?: string }>(leads: T[], now = new Date()): T[] {
  const rank: Record<FollowUpBucket, number> = { Overdue: 0, Today: 1, Upcoming: 2, None: 3 };
  return leads
    .filter((lead) => {
      const bucket = followUpBucket(lead.followUpAt ?? "", now);
      return bucket === "Overdue" || bucket === "Today";
    })
    .sort((a, b) => {
      const byBucket =
        rank[followUpBucket(a.followUpAt ?? "", now)] - rank[followUpBucket(b.followUpAt ?? "", now)];
      return byBucket || new Date(a.followUpAt ?? 0).getTime() - new Date(b.followUpAt ?? 0).getTime();
    });
}

/** Why a lead cannot be saved, or null when it can. */
export function leadProblem(draft: { studentName: string; phone: string }): string | null {
  if (!draft.studentName.trim()) return "The student's name is required.";
  const digits = draft.phone.replace(/\D/g, "");
  if (digits.length < 10) return "Enter a mobile number of at least 10 digits.";
  return null;
}
