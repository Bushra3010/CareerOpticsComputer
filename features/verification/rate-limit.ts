import "server-only";

import { headers } from "next/headers";

import { checkRateLimit } from "@/lib/rate-limit";

/**
 * The anti-enumeration budget for every public verification surface.
 *
 * PRD §19.12 requires public verification to be rate limited. It was — but
 * only on the two form actions, while `/verify/c/[number]` (the QR landing
 * target) read straight through with no budget at all. Certificate numbers
 * are sequential, so that route alone let an anonymous caller walk the whole
 * series and harvest student name, course, centre and result. Measured: 40
 * consecutive lookups, none refused.
 *
 * One key for all surfaces on purpose. Separate budgets per route would just
 * mean an attacker alternates between them and gets the sum, which is not a
 * limit at all.
 */
export async function allowVerificationLookup(): Promise<boolean> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  return checkRateLimit(`verify:${ip}`, 20, 10 * 60 * 1000).allowed;
}
