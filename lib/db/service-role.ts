import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { supabaseServiceRoleKey, supabaseUrl } from "./env";
import type { Database } from "@/types/database.generated";

/**
 * Bypasses every RLS policy. Only for webhook handlers, cron jobs, the
 * invitation flow, and PDF generation — never a user-facing request path.
 * The `server-only` import fails the build if this ever reaches a Client
 * Component bundle. Every call site must pass an explicit actor id into
 * `recordAudit()` — "the system did it" is not an acceptable audit entry.
 */
export function createServiceRoleClient() {
  return createSupabaseClient<Database>(
    supabaseUrl(),
    supabaseServiceRoleKey(),
    {
      auth: { autoRefreshToken: false, persistSession: false },
    },
  );
}
