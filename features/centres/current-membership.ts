import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.generated";

export interface CurrentCentreContext {
  organizationId: string;
  centreId: string;
}

/**
 * Which centre the portal is currently showing, for a user who belongs to more
 * than one.
 *
 * Deliberately not httpOnly-sensitive: it holds a centre id, and it is
 * re-validated against the user's own memberships on every read, so editing it
 * by hand selects nothing the user could not already select. RLS remains the
 * backstop underneath that.
 */
export const ACTIVE_CENTRE_COOKIE = "co_active_centre";

export interface CentreMembershipOption {
  centreId: string;
  organizationId: string;
  name: string;
  code: string;
}

/**
 * Every active centre membership the user holds, oldest first.
 *
 * The ordering is load-bearing rather than cosmetic. This query previously ran
 * with `.limit(1)` and no `order by`, and Postgres is free to return rows in
 * any order it likes — so a user belonging to two centres got whichever one
 * the planner happened to hand back, and the portal silently changed centre
 * between requests. That is how a centre's own students appeared to vanish.
 */
export async function listCentreMemberships(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<CentreMembershipOption[]> {
  const { data, error } = await supabase
    .from("memberships")
    .select("organization_id, centre_id, created_at")
    .eq("user_id", userId)
    .eq("status", "active")
    .not("centre_id", "is", null)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Could not resolve centre membership: ${error.message}`);
  }

  // One centre per entry, in membership order. Two roles at the same centre is
  // two membership rows and one centre, and a picker listing it twice looks
  // broken.
  const seen = new Set<string>();
  const ordered: { centreId: string; organizationId: string }[] = [];

  for (const row of data ?? []) {
    if (!row.centre_id || seen.has(row.centre_id)) continue;
    seen.add(row.centre_id);
    ordered.push({
      centreId: row.centre_id,
      organizationId: row.organization_id,
    });
  }

  if (ordered.length === 0) return [];

  // Names come from a second read rather than an embed: the generated types
  // carry no memberships→centres relation, so `centres(name, code)` resolves
  // to a SelectQueryError and will not compile.
  const { data: centres, error: centresError } = await supabase
    .from("centres")
    .select("id, name, code")
    .in(
      "id",
      ordered.map((o) => o.centreId),
    );

  if (centresError) {
    throw new Error(`Could not load centres: ${centresError.message}`);
  }

  const byId = new Map((centres ?? []).map((c) => [c.id, c]));

  return ordered.map((o) => ({
    ...o,
    name: byId.get(o.centreId)?.name ?? "Centre",
    code: byId.get(o.centreId)?.code ?? "",
  }));
}

/**
 * The centre the signed-in user is currently working in.
 *
 * Honours an explicit choice held in {@link ACTIVE_CENTRE_COOKIE}, but only
 * after checking it against the memberships actually held — a stale cookie
 * from a membership since revoked, or one typed in by hand, falls back rather
 * than granting anything.
 */
export async function getCurrentCentreContext(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<CurrentCentreContext | null> {
  // Null means "no membership", and twenty-six pages turn that into a
  // permission-denied screen. A failed query is a different thing entirely,
  // and telling someone they lack access they hold sends them to fix the
  // wrong problem — so listCentreMemberships throws to the error boundary.
  const memberships = await listCentreMemberships(supabase, userId);
  if (memberships.length === 0) return null;

  const selectedId = (await cookies()).get(ACTIVE_CENTRE_COOKIE)?.value;
  const selected = selectedId
    ? memberships.find((m) => m.centreId === selectedId)
    : undefined;

  const active = selected ?? memberships[0]!;

  return { organizationId: active.organizationId, centreId: active.centreId };
}
