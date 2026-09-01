import "server-only";

import { randomBytes } from "node:crypto";

/**
 * A one-time password for an account created on someone else's behalf — a
 * centre owner at approval, a student given portal access.
 *
 * `crypto`, not `Math.random`: Math.random is fast and predictable by design
 * and is not meant to be unguessable. These are real sign-in credentials for a
 * real person, so they are generated the way a session token would be.
 *
 * The alphabet is 32 characters, which divides 256 exactly — so every
 * character is equally likely, with none of the modulo bias a 26- or 62-letter
 * alphabet would introduce. I, O, 0 and 1 are excluded because these are read
 * off a screen, written down, and typed back in by someone else.
 */
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateTemporaryPassword(): string {
  const bytes = randomBytes(12);
  let out = "";
  for (const byte of bytes) out += ALPHABET[byte % ALPHABET.length];
  return `CO-${out.slice(0, 4)}-${out.slice(4, 8)}-${out.slice(8, 12)}`;
}
