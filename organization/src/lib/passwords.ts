/**
 * Setting a password for someone else, who will usually be told it aloud or
 * over WhatsApp by the office.
 */

export const MIN_PASSWORD_LENGTH = 6;

/**
 * No 0/O, 1/l/I or 5/S: a password read out over the phone is typed back by
 * someone else, and those pairs are where it goes wrong.
 */
const ALPHABET = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRTUVWXYZ2346789";

/** A password that is strong enough and easy to read aloud: "k7Mw-p3Rx". */
export function generatePassword(): string {
  const bytes = new Uint32Array(8);
  crypto.getRandomValues(bytes);
  const chars = Array.from(bytes, (n) => ALPHABET[n % ALPHABET.length]);
  return `${chars.slice(0, 4).join("")}-${chars.slice(4).join("")}`;
}

/** Why this password would be refused or regretted, or null when it is fine. */
export function passwordIssue(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `It must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  // Almost always a paste accident, and invisible: the user then types the
  // password they were given and it is refused, with no way to see why.
  if (password !== password.trim()) {
    return "It starts or ends with a space. Remove it, or they will not be able to sign in.";
  }
  return null;
}
