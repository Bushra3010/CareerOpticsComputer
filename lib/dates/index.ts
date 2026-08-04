/**
 * Business dates in the organisation's timezone.
 *
 * Build plan R13: "Asia/Kolkata is UTC+5:30; a naive date boundary puts
 * attendance and receipts on the wrong day for evening batches. Store UTC, but
 * compute every business date in the organisation's timezone explicitly."
 *
 * `new Date().toISOString().slice(0, 10)` is the specific mistake this module
 * exists to prevent: between 00:00 and 05:30 IST it yields *yesterday*, so a
 * centre marking attendance just after midnight would file it against the
 * wrong day.
 *
 * Timestamps stay UTC in the database. Only the *business date* — which day an
 * attendance session or a receipt belongs to — is computed here.
 */
import { TZDate } from "@date-fns/tz";
import { endOfMonth, format, startOfMonth } from "date-fns";

import { DEFAULT_TIMEZONE } from "@/lib/brand";

/** The organisation's business date for an instant, as `yyyy-MM-dd`. */
export function businessDate(
  instant: Date = new Date(),
  timeZone: string = DEFAULT_TIMEZONE,
): string {
  return format(new TZDate(instant, timeZone), "yyyy-MM-dd");
}

/**
 * UTC instants bounding the calendar month that `instant` falls in *locally*.
 * Use for `posted_at >= startUtc and posted_at < endUtc` on a timestamptz
 * column, so "this month" means the month the centre is actually living in.
 *
 * `endUtc` is exclusive — the first instant of the next month — so a payment
 * posted in the final second of the month is not silently dropped.
 */
export function monthRangeUtc(
  instant: Date = new Date(),
  timeZone: string = DEFAULT_TIMEZONE,
): { startUtc: string; endUtc: string } {
  const local = new TZDate(instant, timeZone);
  // Round-trip through plain Date: a TZDate serialises to its own offset
  // (`…+05:30`), and this function promises UTC instants.
  const start = new Date(startOfMonth(local).getTime());
  // endOfMonth lands on 23:59:59.999; +1ms is the first instant of next month.
  const endExclusive = new Date(endOfMonth(local).getTime() + 1);

  return { startUtc: start.toISOString(), endUtc: endExclusive.toISOString() };
}

/**
 * Indian financial year label for numbering, e.g. `2627` for 2026-04-01
 * through 2027-03-31 (build plan assumption A4). April–March, evaluated in
 * the organisation's timezone — 1 April 00:30 IST is the new FY even though
 * it is still 31 March in UTC.
 */
export function financialYear(
  instant: Date = new Date(),
  timeZone: string = DEFAULT_TIMEZONE,
): string {
  const local = new TZDate(instant, timeZone);
  const year = local.getFullYear();
  const startYear = local.getMonth() >= 3 ? year : year - 1;
  const two = (y: number) => String(y % 100).padStart(2, "0");

  return `${two(startYear)}${two(startYear + 1)}`;
}
