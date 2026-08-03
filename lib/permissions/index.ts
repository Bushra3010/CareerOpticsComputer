import "server-only";

import { createServerSupabase, getCurrentUser } from "@/lib/db/server";
import { recordAudit } from "@/lib/audit";

/**
 * Application-layer authorisation.
 *
 * This is the *second* of the two independent checks described in the build
 * plan §5.1. RLS in Postgres is the one that actually stops a determined
 * attacker; this one produces the readable error, the audit trail and the
 * permission-denied UI state. Neither replaces the other:
 *
 *   - Skip this and users get raw empty results instead of an explanation.
 *   - Skip RLS and a crafted request gets the data.
 *
 * Every server action and route handler calls `authorize()` before doing work.
 */

export type PermissionCode = string;

export interface Scope {
  organizationId: string;
  /** Omit for organisation-level records. */
  centreId?: string | null;
}

export class AuthorizationError extends Error {
  readonly code = "forbidden";
  constructor(
    readonly permission: PermissionCode,
    readonly scope: Scope,
  ) {
    super(`Missing permission ${permission}`);
    this.name = "AuthorizationError";
  }
}

export class AuthenticationError extends Error {
  readonly code = "unauthenticated";
  constructor() {
    super("Not signed in");
    this.name = "AuthenticationError";
  }
}

/**
 * Asks Postgres the same question the RLS policies ask, through the same
 * helper function, so the two answers cannot drift apart. Deliberately not
 * reimplemented in TypeScript: a second implementation is a second thing to get
 * wrong.
 */
export async function hasPermission(
  permission: PermissionCode,
  scope: Scope,
): Promise<boolean> {
  const supabase = await createServerSupabase();

  const { data, error } = await supabase.rpc(
    "has_permission" as never,
    {
      p_permission: permission,
      p_organization_id: scope.organizationId,
      p_centre_id: scope.centreId ?? null,
    } as never,
  );

  if (error) {
    console.error("[permissions] has_permission failed", {
      permission,
      error: error.message,
    });
    // Default deny (PRD §4.1). A lookup failure must never read as "allowed".
    return false;
  }

  return data === true;
}

/**
 * Throws unless the current user holds `permission` in `scope`.
 *
 * Denials are audited: PRD §13.3 requires alerting on spikes in permission
 * errors, which needs the denials to actually be recorded.
 */
export async function authorize(
  permission: PermissionCode,
  scope: Scope,
): Promise<{ userId: string }> {
  const user = await getCurrentUser();
  if (!user) throw new AuthenticationError();

  const allowed = await hasPermission(permission, scope);

  if (!allowed) {
    await recordAudit({
      action: "authorization.denied",
      entityTable: "permissions",
      entityId: permission,
      actorId: user.id,
      organizationId: scope.organizationId,
      centreId: scope.centreId ?? null,
      reason: `Denied ${permission}`,
    });
    throw new AuthorizationError(permission, scope);
  }

  return { userId: user.id };
}

/**
 * Permissions that require step-up re-authentication and a typed reason
 * (PRD §4.1). The database is the source of truth via
 * `permissions.requires_step_up`; this list mirrors it for synchronous UI
 * decisions and is asserted against the table in tests.
 */
export const STEP_UP_PERMISSIONS = new Set<PermissionCode>([
  "centre.approve",
  "centre.suspend",
  "user.update",
  "role.update",
  "student.export",
  "student.archive",
  "attendance.correct",
  "fee_discount.approve",
  "payment.reverse",
  "refund.approve",
  "wallet.recharge_approve",
  "wallet.adjust",
  "finance.period_lock",
  "result.publish",
  "result.unlock",
  "certificate.issue",
  "certificate.revoke",
  "inventory.adjust",
  "commission.approve",
  "report.export",
]);

export function requiresStepUp(permission: PermissionCode): boolean {
  return STEP_UP_PERMISSIONS.has(permission);
}
