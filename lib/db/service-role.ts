import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.generated";
import { serverEnv } from "./env";
import { recordSystemAudit } from "@/lib/audit";

/**
 * Service-role Supabase client — **bypasses RLS entirely**.
 *
 * PRD §11.1: "Service operations still validate business rules and are audited."
 * The only legitimate callers are:
 *
 *   - payment provider webhooks (no user session exists)
 *   - cron/background jobs (no user session exists)
 *   - the invitation and account-activation flow (acting before a session exists)
 *   - server-side PDF rendering (needs to read across a tenant boundary)
 *
 * Anything reachable from a signed-in user's request should use
 * `createServerSupabase()` so RLS still applies. If you find yourself wanting
 * this client in a page or a form action, the RLS policy is probably wrong.
 *
 * Every call site must pass a `reason` and an `actor`, which are written to
 * audit_logs. "The system did it" must never be an untraceable answer.
 */
export type ServiceRoleReason =
  | "webhook"
  | "cron_job"
  | "invitation"
  | "activation"
  | "document_render"
  | "migration_backfill";

export interface ServiceRoleContext {
  reason: ServiceRoleReason;
  /** Free text describing the specific operation, e.g. "razorpay payment.captured". */
  detail: string;
  /** The profile id responsible, when one exists. Null for genuinely system-initiated work. */
  actorId?: string | null;
  organizationId?: string | null;
  centreId?: string | null;
}

export function createServiceRoleClient(context: ServiceRoleContext) {
  // Belt and braces alongside `server-only`: if this module is ever pulled into
  // a bundle that reaches a browser, fail loudly instead of leaking the key.
  if (typeof window !== "undefined") {
    throw new Error(
      "createServiceRoleClient was called in a browser context. This is a security bug.",
    );
  }

  const client = createClient<Database>(
    serverEnv.supabaseUrl,
    serverEnv.supabaseServiceRoleKey,
    {
      auth: {
        // No session handling: this client must never pick up or persist a
        // user's cookie, or a later request could inherit elevated access.
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: {
          "x-service-role-reason": context.reason,
        },
      },
    },
  );

  void recordSystemAudit({
    action: `service_role.${context.reason}`,
    detail: context.detail,
    actorId: context.actorId ?? null,
    organizationId: context.organizationId ?? null,
    centreId: context.centreId ?? null,
  });

  return client;
}
