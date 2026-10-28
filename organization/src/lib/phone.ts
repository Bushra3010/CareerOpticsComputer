// Dialable links for the numbers a branch types in by hand.
//
// The same student's number reaches the database as "9822041100",
// "+91 98220 41100", "098220 41100" or with a stray dash, because every
// admission route is a free-text box. Anything that offers to call or message
// a student runs the stored value through here first, so a badly typed record
// drops the action instead of producing a `tel:` with nothing behind it or a
// wa.me link that opens an empty chat.

/** India — the only country this deployment enrols from. */
const COUNTRY_CODE = "91";

/**
 * The ten-digit subscriber number, or null when the value cannot be dialled.
 * Anything shorter is a half-filled record rather than a number.
 */
export function normalisePhone(value?: string | null): string | null {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (digits.length < 10) return null;
  // A stored number may already carry the 91 country code, a trunk 0, or both.
  // The subscriber number is the last ten digits either way.
  return digits.slice(-10);
}

/** `tel:` href for the number, or null when there is nothing to dial. */
export function telHref(value?: string | null): string | null {
  const number = normalisePhone(value);
  return number ? `tel:+${COUNTRY_CODE}${number}` : null;
}

/**
 * wa.me href for the number, or null when there is nothing to message.
 * WhatsApp wants full international form with no `+` and no separators.
 */
export function whatsappHref(value?: string | null): string | null {
  const number = normalisePhone(value);
  return number ? `https://wa.me/${COUNTRY_CODE}${number}` : null;
}

/**
 * `+91 98220 41100` — grouped the way an Indian mobile number is read aloud.
 * A value too short to dial is shown as typed rather than mangled, so the
 * office can see what is actually on the record and correct it.
 */
export function formatPhone(value?: string | null): string {
  const number = normalisePhone(value);
  if (!number) return String(value ?? "").trim() || "—";
  return `+${COUNTRY_CODE} ${number.slice(0, 5)} ${number.slice(5)}`;
}
