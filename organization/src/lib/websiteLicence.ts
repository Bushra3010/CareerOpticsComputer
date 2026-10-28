/**
 * Where a branch's website stands against its expiry date.
 *
 * The register exists to catch a renewal before it lapses, so "expiring soon"
 * is a state of its own rather than something the reader has to work out by
 * comparing a column of dates against today's.
 */
export type LicenceState = "Active" | "Expiring soon" | "Expired" | "No date";

/** A month's notice: long enough to act on, short enough to still mean now. */
export const EXPIRY_WARNING_DAYS = 30;

const DAY = 86_400_000;

/** Whole days from `today` to `date`; negative once the date has passed. */
export function daysUntil(date: string, today = new Date()): number | null {
  if (!date) return null;
  const then = new Date(date);
  if (Number.isNaN(then.getTime())) return null;
  // Compared as days, not instants: a licence expiring later today has not
  // expired, and an hour of clock difference must not say otherwise.
  const startOfDay = (d: Date) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.round((startOfDay(then) - startOfDay(today)) / DAY);
}

export function licenceState(expiryDate: string, today = new Date()): LicenceState {
  const days = daysUntil(expiryDate, today);
  if (days === null) return "No date";
  if (days < 0) return "Expired";
  return days <= EXPIRY_WARNING_DAYS ? "Expiring soon" : "Active";
}

/** A day, as the register prints it: "18 Sep 2026". */
export function asDay(value: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
