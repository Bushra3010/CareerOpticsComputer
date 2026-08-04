import type { SupabaseClient } from "@supabase/supabase-js";

import { callRpc } from "@/lib/db/rpc";
import { PermissionDeniedError } from "@/lib/errors";
import type { Database } from "@/types/database.generated";

/**
 * Server-layer authorisation check. This is the second, independent check —
 * RLS in Postgres is the backstop, this call is what produces the readable
 * error and (via the caller) the audit event. Never trust JWT claims for
 * authorisation; this always reads current membership state.
 */
export async function authorize(
  supabase: SupabaseClient<Database>,
  permission: string,
  organizationId: string,
  centreId?: string | null,
): Promise<void> {
  const { data, error } = await callRpc(supabase, "has_permission", {
    perm: permission,
    org: organizationId,
    centre: centreId ?? null,
  });

  if (error) {
    throw new PermissionDeniedError(permission);
  }

  if (!data) {
    throw new PermissionDeniedError(permission);
  }
}

export async function can(
  supabase: SupabaseClient<Database>,
  permission: string,
  organizationId: string,
  centreId?: string | null,
): Promise<boolean> {
  const { data, error } = await callRpc(supabase, "has_permission", {
    perm: permission,
    org: organizationId,
    centre: centreId ?? null,
  });

  return !error && Boolean(data);
}
