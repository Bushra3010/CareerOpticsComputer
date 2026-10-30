/**
 * A stored timestamp as a Date. Many columns are `timestamp without time zone`
 * and hold UTC -- the app writes toISOString() and the database's own now() is
 * UTC -- so a value that comes back with no zone is read as UTC. Read as local
 * time it puts a 10:27 pm entry at 4:57 pm. Null for an empty or bad value.
 */
const NAIVE = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/;

export function storedTime(value: unknown): Date | null {
  if (value === null || value === undefined || value === "") return null;
  const text = typeof value === "string" && NAIVE.test(value) ? `${value.replace(" ", "T")}Z` : (value as string);
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date;
}
