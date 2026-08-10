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
  const { data, error } = await supabase
    .from("memberships")
    .select("organization_id, centre_id")
    .eq("user_id", userId)
    .eq("status", "active")
    .not("centre_id", "is", null)
    .limit(1)
    .maybeSingle();

  // Null means "no membership", and twenty-six pages turn that into a
  // permission-denied screen. A failed query is a different thing entirely,
  // and telling someone they lack access they hold sends them to fix the
  // wrong problem — so it throws to the error boundary instead.
  if (error) {
    throw new Error(`Could not resolve centre membership: ${error.message}`);
  }

  if (!data || !data.centre_id) return null;

  return { organizationId: data.organization_id, centreId: data.centre_id };
}
