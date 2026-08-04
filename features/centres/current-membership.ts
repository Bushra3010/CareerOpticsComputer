import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.generated";

export interface CurrentCentreContext {
  organizationId: string;
  centreId: string;
}

/**
 * First active centre membership for the signed-in user. A user with more
 * than one centre membership should pick via /select-context — not built in
 * this slice, so this takes the first one found.
 */
export async function getCurrentCentreContext(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<CurrentCentreContext | null> {
  const { data } = await supabase
    .from("memberships")
    .select("organization_id, centre_id")
    .eq("user_id", userId)
    .eq("status", "active")
    .not("centre_id", "is", null)
    .limit(1)
    .maybeSingle();

  if (!data || !data.centre_id) return null;

  return { organizationId: data.organization_id, centreId: data.centre_id };
}
