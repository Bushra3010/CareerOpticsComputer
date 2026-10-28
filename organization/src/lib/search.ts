/**
 * One way to search text across the app: every word typed must appear, in
 * any order, whatever the case and spacing. Stored names often carry double
 * spaces ("Abhishek  Gupta"), and "gupta abhishek" or "abhishek 0012" should
 * find the same student as "Abhishek Gupta".
 */
export const searchWords = (query: string) => query.toLowerCase().split(/\s+/).filter(Boolean);

export function matchesSearch(haystack: unknown, query: string): boolean {
  const words = searchWords(query);
  if (!words.length) return true;
  const text = String(haystack ?? "").toLowerCase().replace(/\s+/g, " ");
  return words.every((word) => text.includes(word));
}
