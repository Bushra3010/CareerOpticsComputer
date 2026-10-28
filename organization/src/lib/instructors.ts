/**
 * Teacher names as the batches store them.
 *
 * There is no staff table. A batch's teacher is text on `batches.instructor`,
 * and a timetable slot's on `batch_timings.instructor`, and either may hold
 * several names separated by commas. So a teacher is a name, and renaming one
 * means rewriting that name wherever it was typed.
 */

/** "Prabhat Sir, Vikram" -> ["Prabhat Sir", "Vikram"]. */
export const splitNames = (value: unknown): string[] =>
  String(value ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

/**
 * Rename one teacher inside a comma list, matching the whole name.
 *
 * Whole-name, not substring: renaming "Raj" must not turn "Rajesh" into
 * "Raj Kumaresh". Case-insensitive on the match, since the same person gets
 * typed as "vikram" and "Vikram", and the new spelling is written as given.
 * If the new name is already in the list the two collapse into one, rather
 * than the batch showing the same teacher twice.
 */
export function renameInList(value: unknown, from: string, to: string): string {
  const target = from.trim().toLowerCase();
  const next = to.trim();
  const seen = new Set<string>();
  const out: string[] = [];
  for (const name of splitNames(value)) {
    const written = name.toLowerCase() === target ? next : name;
    const key = written.toLowerCase();
    if (!written || seen.has(key)) continue;
    seen.add(key);
    out.push(written);
  }
  return out.join(", ");
}

/** Whether a comma list names this teacher, as a whole name. */
export const listNames = (value: unknown, name: string): boolean =>
  splitNames(value).some((part) => part.toLowerCase() === name.trim().toLowerCase());

/**
 * One list out of several, case-insensitively, keeping the first spelling met.
 *
 * The picker shows the organisation's own list and every name already on a
 * batch, and "vikram" and "Vikram" are one teacher, not two checkboxes.
 */
export function mergeNames(...lists: string[][]): string[] {
  const seen = new Map<string, string>();
  for (const list of lists) {
    for (const raw of list) {
      const name = raw.trim();
      if (name && !seen.has(name.toLowerCase())) seen.set(name.toLowerCase(), name);
    }
  }
  return [...seen.values()].sort((a, b) => a.localeCompare(b));
}
