/**
 * Course categories.
 *
 * `courses.category` is the Postgres enum `CourseCategory`, whose seven members
 * are confirmed against the live database: COMPUTER, VOCATIONAL, ACADEMIC,
 * LANGUAGE, PROFESSIONAL, SKILL_DEVELOPMENT, OTHER. The create form offered
 * only the first, second and sixth of those, so four perfectly valid categories
 * were unreachable from the UI.
 *
 * Anything outside the enum is rejected by Postgres with 22P02, so a typed
 * category only reaches the database once `course-category-free-text.sql` has
 * converted the column to text. Until then `describeCategoryRejection` in
 * data.ts explains that rather than passing on the raw Postgres text.
 */

/** Every member of the enum. OTHER is still a value the column accepts and is
 *  still offered on a course already filed under it, but it is no longer in the
 *  picker: "Other (type your own)…" is there instead, and a named category is
 *  worth more than a bin. */
export const KNOWN_COURSE_CATEGORIES = [
  "COMPUTER",
  "VOCATIONAL",
  "ACADEMIC",
  "LANGUAGE",
  "PROFESSIONAL",
  "SKILL_DEVELOPMENT",
  "OTHER",
] as const;

/** What the picker offers, before anything already saved is added to it. */
export const OFFERED_COURSE_CATEGORIES = KNOWN_COURSE_CATEGORIES.filter(
  (category) => category !== "OTHER",
);

/** COMPUTER -> "Computer", SKILL_DEVELOPMENT -> "Skill development". */
export function courseCategoryLabel(value: string): string {
  if (!value) return "";
  if (!/^[A-Z0-9_]+$/.test(value)) return value; // already a typed label
  const words = value.toLowerCase().split("_");
  return words[0].charAt(0).toUpperCase() + words[0].slice(1) + (words.length > 1 ? ` ${words.slice(1).join(" ")}` : "");
}

/**
 * The known members plus any category already saved on a course, so a custom
 * one typed last week comes back as a normal option rather than having to be
 * retyped from memory.
 */
export function courseCategoryOptions(used: Array<string | undefined>): string[] {
  const seen = new Set<string>(OFFERED_COURSE_CATEGORIES);
  for (const value of used) {
    const trimmed = (value || "").trim();
    if (trimmed) seen.add(trimmed);
  }
  return [...seen];
}
