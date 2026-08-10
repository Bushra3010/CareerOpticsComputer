import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { authorize } from "@/lib/permissions";
import type { Database } from "@/types/database.generated";

export interface HeadOfficeContext {
  userId: string;
  organizationId: string;
  isPlatformAdmin: boolean;
}

/**
 * The head-office equivalent of `getCurrentCentreContext`.
 *
 * Question banks belong to the organisation, not to a centre, so there is no
 * centre to resolve. What matters is whether the caller has organisation-level
 * standing at all: a platform super admin, or a membership with `centre_id`
 * null. Since migration 0020 a centre-scoped membership no longer satisfies an
 * organisation-level permission check, so this and the RLS policies agree
 * without either having to know about the other.
 *
 * Returns null rather than throwing, so a page can render the
 * permission-denied state instead of a 500.
 */
export async function getHeadOfficeContext(
  supabase: SupabaseClient<Database>,
): Promise<HeadOfficeContext | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_platform_super_admin")
    .eq("id", user.id)
    .maybeSingle();

  const { data: membership, error: membershipError } = await supabase
    .from("memberships")
    .select("organization_id")
    .eq("user_id", user.id)
    .is("centre_id", null)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  // Callers read null as "no head-office standing" and render the denied
  // state. A query that failed is not that, and saying so to a platform
  // admin is a lie they cannot act on — throw to the error boundary.
  if (profileError || membershipError) {
    throw new Error(
      `Could not resolve head-office access: ${(profileError ?? membershipError)!.message}`,
    );
  }

  // A platform admin with no membership row still needs an organisation to
  // scope writes to. There is exactly one organisation today; when there are
  // several this becomes an explicit picker rather than a silent first().
  let organizationId = membership?.organization_id ?? null;
  if (!organizationId && profile?.is_platform_super_admin) {
    const { data: org } = await supabase
      .from("organizations")
      .select("id")
      .limit(1)
      .maybeSingle();
    organizationId = org?.id ?? null;
  }

  if (!organizationId) return null;

  return {
    userId: user.id,
    organizationId,
    isPlatformAdmin: Boolean(profile?.is_platform_super_admin),
  };
}

/**
 * The second of the two checks CLAUDE.md requires. RLS is the backstop; this
 * produces the readable error. Platform admins short-circuit it for the same
 * reason the policies do — the flag is the grant.
 */
export async function authorizeHeadOffice(
  supabase: SupabaseClient<Database>,
  context: HeadOfficeContext,
  permission: string,
): Promise<void> {
  if (context.isPlatformAdmin) return;
  await authorize(supabase, permission, context.organizationId, null);
}
