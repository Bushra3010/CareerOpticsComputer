import { randomBytes } from "node:crypto";

/**
 * Collision-resistant document number, e.g. documentNo("RCT") -> "RCT-M2K9XQ1-4F7A2B9C".
 * A bare `Date.now()` collides whenever two writes land in the same millisecond,
 * which surfaces to the caller as a 409 on the unique constraint
 * (receiptNo / invoiceNo / applicationNo).
 */
export const documentNo = (prefix: string) =>
  `${prefix}-${Date.now().toString(36).toUpperCase()}-${randomBytes(4).toString("hex").toUpperCase()}`;
