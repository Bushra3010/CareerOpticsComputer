import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.generated";
import { serverEnv } from "@/lib/db/env";

/**
 * Application-layer audit writing.
 *
 * The database trigger `app.record_audit()` already captures every row diff on
 * the tables it is attached to. This module covers what a trigger structurally
 * cannot know: *why* the actor did something, and actions that are not a row
 * change at all (an export, a failed authorisation, a service-role escalation).
 *
 * PRD §19.10: "Every privileged action is attributable to an authenticated
 * actor with timestamp and reason where required."
 */

export interface AuditEntry {
  action: string;
  entityTable?: string;
  entityId?: string | null;
  actorId?: string | null;
  organizationId?: string | null;
  centreId?: string | null;
  /** Required for the privileged actions listed in PRD §4.1. */
  reason?: string | null;
  before?: unknown;
  after?: unknown;
  requestId?: string | null;
}

/**
 * Audit rows are inserted with the service-role key because `audit_logs` grants
 * no INSERT to `authenticated` — the table is append-only from the application's
 * point of view and unreachable for writes from a browser.
 *
 * Built inline rather than through `createServiceRoleClient` to avoid the two
 * modules importing each other.
 */
function auditClient() {
  return createClient<Database>(
    serverEnv.supabaseUrl,
    serverEnv.supabaseServiceRoleKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  );
}

export async function recordAudit(entry: AuditEntry): Promise<void> {
  try {
    await auditClient()
      .from("audit_logs")
      // The generated types are a placeholder until migrations are applied, so
      // this insert is loosely typed on purpose. Regenerating with
      // `npm run db:types` restores full checking without changing this call.
      .insert({
        action: entry.action,
        entity_table: entry.entityTable ?? "n/a",
        entity_id: entry.entityId ?? null,
        actor_id: entry.actorId ?? null,
        actor_kind: entry.actorId ? "user" : "system",
        organization_id: entry.organizationId ?? null,
        centre_id: entry.centreId ?? null,
        reason: entry.reason ?? null,
        before_data: entry.before ?? null,
        after_data: entry.after ?? null,
        request_id: entry.requestId ?? null,
      } as never);
  } catch (error) {
    // A failed audit write must never take down the user's action, but it must
    // be loud. Wired to the error monitor in Phase 6 (PRD §13.3).
    console.error("[audit] failed to record entry", {
      action: entry.action,
      error,
    });
  }
}

export async function recordSystemAudit(input: {
  action: string;
  detail: string;
  actorId?: string | null;
  organizationId?: string | null;
  centreId?: string | null;
}): Promise<void> {
  await recordAudit({
    action: input.action,
    entityTable: "system",
    reason: input.detail,
    actorId: input.actorId,
    organizationId: input.organizationId,
    centreId: input.centreId,
  });
}
