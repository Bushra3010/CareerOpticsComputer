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
