import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.generated";

/**
 * The permission codes the signed-in user actually holds at this centre.
 *
 * Read once per page load and used to filter navigation. This is a *display*
 * filter only — hiding a link is not access control. Every destination it
 * points at enforces its own permission in the server action and again in RLS,
 * so a user who types the URL still gets nothing.
 */
export async function getPermissionCodes(
  supabase: SupabaseClient<Database>,
  userId: string,
  centreId: string,
): Promise<Set<string>> {
  const { data } = await supabase
    .from("memberships")
    .select("role_permissions:roles(role_permissions(permission_code))")
    .eq("user_id", userId)
    .eq("centre_id", centreId)
    .eq("status", "active");

  return collectCodes(data);
}

/**
 * The organisation-level variant: codes from memberships with no centre —
 * head-office roles (migration 0039). Same display-filter caveat as above.
 */
export async function getOrgPermissionCodes(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<Set<string>> {
  const { data } = await supabase
    .from("memberships")
    .select("role_permissions:roles(role_permissions(permission_code))")
    .eq("user_id", userId)
    .is("centre_id", null)
    .eq("status", "active");

  return collectCodes(data);
}

function collectCodes(data: unknown): Set<string> {
  const codes = new Set<string>();
  for (const row of ((data as object[] | null) ?? []) as unknown as {
    role_permissions: {
      role_permissions: { permission_code: string }[];
    } | null;
  }[]) {
    for (const rp of row.role_permissions?.role_permissions ?? []) {
      codes.add(rp.permission_code);
    }
  }
  return codes;
}
