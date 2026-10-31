/**
 * Date conversions that cannot take a form down.
 *
 * `new Date("2026-09-16-01").toISOString()` throws `RangeError: Invalid time
 * value` rather than returning something falsy, so one malformed date anywhere
 * in a save payload aborts the whole submit. That surfaced as "Failed to update
 * branch — Invalid time value", with nothing to say which field was at fault.
 */

/** ISO timestamp for a date the browser can parse, `null` for anything else. */
export function isoOrNull(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  const date = new Date(value as string);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/** `YYYY-MM-DD` for an `<input type="date">`, empty string for anything else. */
export function dateInputValue(value: unknown): string {
  const iso = isoOrNull(value);
  return iso ? iso.split("T")[0] : "";
}

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * "31 Oct 2026" for a stored day.
 *
 * A `date` / `timestamp` column comes back as "2026-10-31" or
 * "2026-10-31T00:00:00" with no zone. That is a calendar day, not an instant,
 * so its digits are read as they are: going through `new Date()` and
 * `toISOString()` shifts it a day back east of UTC. Only a value that names
 * its zone is an instant, and that one is shown on the viewer's calendar.
 */
export function formatDay(value: unknown, fallback = "—"): string {
  if (value === null || value === undefined || value === "") return fallback;
  const raw = String(value).trim();
  const plain = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::\d{2}(?:\.\d+)?)?)?$/.exec(raw);
  if (plain) {
    const month = Number(plain[2]);
    const day = Number(plain[3]);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${day} ${MONTHS_SHORT[month - 1]} ${plain[1]}`;
    }
    return fallback;
  }
  const at = new Date(raw);
  if (Number.isNaN(at.getTime())) return fallback;
  return `${at.getDate()} ${MONTHS_SHORT[at.getMonth()]} ${at.getFullYear()}`;
}

/** "YYYY-MM-DD" for a date input, from the same stored values, with no shift. */
export function dayValue(value: unknown): string {
  const raw = String(value ?? "").trim();
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(raw);
  if (match) return match[1];
  const at = raw ? new Date(raw) : null;
  if (!at || Number.isNaN(at.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${at.getFullYear()}-${pad(at.getMonth() + 1)}-${pad(at.getDate())}`;
}
