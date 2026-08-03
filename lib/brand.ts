/**
 * Brand constants — Career Optics Computer Academy.
 * Source: Career_Optics_UI_UX_Style_Guide.docx §2 Brand Identity, §15 manifest values.
 *
 * These strings are brand-owned. Do not paraphrase the tagline or supporting
 * phrase in UI copy; reference them from here.
 */
export const BRAND = {
  name: "Career Optics Computer Academy",
  shortName: "Career Optics",
  initials: "CO",
  supportingPhrase: "Learn • Grow • Succeed",
  tagline: "Skill Today, Success Tomorrow",
  themeColor: "#061867",
  backgroundColor: "#F7F9FC",
} as const;

/**
 * Default organisation locale settings (build plan assumption A3).
 * Per-organisation overrides live in `organizations` once migration 0002 lands;
 * these are the fallbacks used before a tenant context is resolved.
 */
export const DEFAULT_LOCALE = "en-IN";
export const DEFAULT_TIMEZONE = "Asia/Kolkata";
export const DEFAULT_CURRENCY = "INR";
