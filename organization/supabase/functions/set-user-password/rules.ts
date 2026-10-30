/**
 * Who may set whose password — the whole decision, with no I/O, so it can be
 * tested on its own. index.ts fetches the two accounts and asks this.
 *
 * Kept free of imports: Deno loads it beside index.ts, and the app's test
 * runner loads it directly.
 */

/**
 * Whose password each admin may set: anyone they could have created, plus
 * students in their reach, whose portal logins they already reset from View
 * Students. Nobody reaches above their own rank — a branch admin who could
 * reset an organisation admin's password could sign in as them.
 */
export const RESETTABLE: Record<string, string[]> = {
  SUPER_ADMIN: ["SUPER_ADMIN", "ORGANIZATION_ADMIN", "BRANCH_ADMIN", "ACCOUNTANT", "RECEPTIONIST", "TEACHER", "STAFF", "STUDENT"],
  ORGANIZATION_ADMIN: ["ORGANIZATION_ADMIN", "BRANCH_ADMIN", "ACCOUNTANT", "RECEPTIONIST", "TEACHER", "STAFF", "STUDENT"],
  BRANCH_ADMIN: ["ACCOUNTANT", "RECEPTIONIST", "TEACHER", "STAFF", "STUDENT"],
};

export const MIN_PASSWORD_LENGTH = 6;

export interface Claims {
  id: string;
  role?: unknown;
  organizationId?: unknown;
  branchId?: unknown;
}

const label = (role: string) => role.replace(/_/g, " ").toLowerCase();

/** Whether this role may set passwords at all — asked before any lookup. */
export const mayResetPasswords = (role: unknown) => Boolean(RESETTABLE[String(role ?? "").toUpperCase()]);

/** Null when the caller may set the target's password; otherwise why not. */
export function resetRefusal(caller: Claims, target: Claims): string | null {
  const callerRole = String(caller.role ?? "").toUpperCase();
  if (!RESETTABLE[callerRole]) return "Only an admin can set another user's password.";

  // Your own password is yours to change.
  if (target.id === caller.id) return null;

  // No role claim means an account made outside this app — in the Supabase
  // dashboard, say. It is not assumed to be the lowest rank: nobody can tell
  // what it really is, so only a super admin may touch one.
  const targetRole = String(target.role ?? "").toUpperCase();
  if (!targetRole) {
    return callerRole === "SUPER_ADMIN"
      ? null
      : "That login has no role recorded, so only a super admin can set its password.";
  }
  if (!RESETTABLE[callerRole].includes(targetRole)) {
    return `A ${label(callerRole)} cannot set the password of a ${label(targetRole)}.`;
  }

  // A super admin sits above any one organisation.
  if (callerRole === "SUPER_ADMIN") return null;

  // The caller's own claim has to be there before it is compared. Two accounts
  // that both lack an organisation would otherwise match on
  // `undefined === undefined`, and an admin whose token is missing the claim
  // could reset every login that is missing it too.
  if (!caller.organizationId) {
    return "Your account is not attached to an organisation. Sign out and back in, then try again.";
  }
  if (target.organizationId !== caller.organizationId) return "That login belongs to another organisation.";

  if (callerRole === "BRANCH_ADMIN") {
    if (!caller.branchId) {
      return "Your account is not attached to a branch. Sign out and back in, then try again.";
    }
    if (target.branchId !== caller.branchId) return "That login belongs to another branch.";
  }
  return null;
}
