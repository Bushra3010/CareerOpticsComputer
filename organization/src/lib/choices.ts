/**
 * The shared vocabulary behind "Other (type your own)…".
 *
 * A choice list is a set of known values plus whatever a branch types instead.
 * Known values keep their stored form -- several of these columns are Postgres
 * enums, where `MALE` is the value and "Male" only the label -- while a typed
 * one is stored exactly as written.
 */

/** The sentinel a Select carries while a custom value is being typed. It is
 *  never stored: the typed text is. */
export const CUSTOM_CHOICE = "__custom__";

export interface ChoiceOption {
  value: string;
  label: string;
}

/** `MALE` -> "Male", `SKILL_DEVELOPMENT` -> "Skill development". Text that is
 *  not in enum case is already a label and is left alone. */
export function choiceLabel(value: string): string {
  if (!value) return "";
  if (!/^[A-Z0-9_]+$/.test(value)) return value;
  const [first, ...rest] = value.toLowerCase().split("_");
  return first.charAt(0).toUpperCase() + first.slice(1) + (rest.length ? ` ${rest.join(" ")}` : "");
}

export function normaliseChoices(
  options: Array<ChoiceOption | string>,
): ChoiceOption[] {
  return options
    .map((option) =>
      typeof option === "string" ? { value: option, label: choiceLabel(option) } : option,
    )
    .filter((option) => option.value);
}

/**
 * The known list plus anything already saved on a record, so a value typed last
 * week comes back as an ordinary option instead of having to be retyped.
 */
export function choicesWithUsed(
  known: readonly string[],
  used: Array<string | undefined | null>,
): string[] {
  const seen = new Set<string>(known);
  for (const value of used) {
    const trimmed = (value || "").trim();
    if (trimmed) seen.add(trimmed);
  }
  return [...seen];
}

/**
 * The value on its way to the column. A known option keeps the enum form the
 * database expects (`computer` -> `COMPUTER`); a typed one is stored exactly as
 * it was written, so "Coaching Centre" is not filed as "COACHING CENTRE".
 */
export function storedChoice(raw: string, known: readonly string[]): string {
  const trimmed = (raw || "").trim();
  if (!trimmed) return "";
  const match = known.find((value) => value.toLowerCase() === trimmed.toLowerCase());
  return match ? match.toUpperCase() : trimmed;
}

/**
 * Postgres rejects a value outside an enum with 22P02, and the message names
 * the type rather than the field it was written into. Say what was typed and
 * what to run so that it can be.
 */
export function describeEnumRejection(
  error: { code?: string; message?: string },
  fallback = "Could not save",
): string {
  const message = error.message || fallback;
  if (error.code !== "22P02" || !/invalid input value for enum/i.test(message)) {
    return message;
  }
  const typed = message.match(/: "([^"]*)"/)?.[1] ?? "";
  return `"${typed}" is not a value this database accepts yet. Run supabase/schema/free-text-choices.sql to allow typed choices, or pick one from the list.`;
}
