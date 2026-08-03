import type { SupabaseClient } from "@supabase/supabase-js";

import { callRpc } from "@/lib/db/rpc";
import type { Database, Json } from "@/types/database.generated";

interface RecordAuditInput {
  organizationId: string | null;
  actorId: string | null;
  action: string;
  tableName: string;
  rowId?: string | null;
  reason?: string | null;
  before?: Json | null;
  after?: Json | null;
}

/**
 * App-layer audit entry for reason-carrying actions (step-up confirmations,
 * service-role operations) that the generic DB trigger cannot capture because
 * it has no `reason` to attach. Row-level triggers cover ordinary CRUD.
 */
export async function recordAudit(
  supabase: SupabaseClient<Database>,
  input: RecordAuditInput,
): Promise<void> {
  const { error } = await callRpc(supabase, "record_audit_entry", {
    p_organization_id: input.organizationId,
    p_action: input.action,
    p_table_name: input.tableName,
    p_row_id: input.rowId ?? null,
    p_reason: input.reason ?? null,
    p_before: input.before ?? null,
    p_after: input.after ?? null,
    p_actor_id: input.actorId,
  });

  if (error) {
    throw new Error(`Failed to record audit entry: ${error.message}`);
  }
}
