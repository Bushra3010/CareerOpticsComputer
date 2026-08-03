import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.generated";

export type Portal = "admin" | "centre" | "student";

/**
 * Where a signed-in user lands. Platform admins go to /admin regardless of
 * the sign-in page used. Otherwise resolved from active memberships — a user
 * with more than one membership goes to /select-context (not built yet in
 * this slice; falls back to the first membership found).
 */
export async function resolvePostLoginPath(
  supabase: SupabaseClient<Database>,
  userId: string,
  fallbackPortal: Portal,
): Promise<string> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_platform_super_admin")
    .eq("id", userId)
    .maybeSingle();

  if (profile?.is_platform_super_admin) {
    return "/admin";
  }

  const { data: memberships } = await supabase
    .from("memberships")
    .select("centre_id")
    .eq("user_id", userId)
    .eq("status", "active");

  if (memberships && memberships.length > 0) {
    const hasCentreMembership = memberships.some((m) => m.centre_id !== null);
    return hasCentreMembership ? "/centre" : "/student";
  }

  return `/${fallbackPortal}`;
}
