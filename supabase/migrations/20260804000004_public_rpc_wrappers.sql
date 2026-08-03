-- 0004: public-schema RPC wrappers. PostgREST only exposes `public` (and other
-- explicitly exposed schemas), so the `app.*` SECURITY DEFINER helpers need a
-- thin public wrapper to be callable via supabase.rpc(...) from the server layer.

create or replace function public.has_permission(perm text, org uuid, centre uuid default null)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select app.has_permission(perm, org, centre);
$$;

grant execute on function public.has_permission(text, uuid, uuid) to authenticated;
revoke execute on function public.has_permission(text, uuid, uuid) from anon, public;

create or replace function public.can_access_centre(centre uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select app.can_access_centre(centre);
$$;

grant execute on function public.can_access_centre(uuid) to authenticated;
revoke execute on function public.can_access_centre(uuid) from anon, public;

-- Reason-carrying audit entries (step-up confirmations, service-role actions).
-- audit_logs has no INSERT policy for `authenticated` on purpose: every write
-- goes through this function so the actor is always auth.uid(), never a
-- client-supplied value.
create or replace function public.record_audit_entry(
  p_organization_id uuid,
  p_action text,
  p_table_name text,
  p_row_id uuid default null,
  p_reason text default null,
  p_before jsonb default null,
  p_after jsonb default null,
  p_actor_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
  v_actor uuid;
begin
  -- Only the service role may assert an explicit actor (webhooks, cron, the
  -- invitation flow). Authenticated callers always get their own auth.uid(),
  -- so a client can never forge "who did it" in an audit entry.
  v_actor := case when auth.role() = 'service_role' then p_actor_id else auth.uid() end;

  insert into public.audit_logs (
    organization_id, actor_id, action, table_name, row_id, reason, before_data, after_data
  )
  values (
    p_organization_id, v_actor, p_action, p_table_name, p_row_id, p_reason, p_before, p_after
  )
  returning id into v_id;

  return v_id;
end;
$$;

grant execute on function public.record_audit_entry(uuid, text, text, uuid, text, jsonb, jsonb, uuid)
  to authenticated, service_role;
revoke execute on function public.record_audit_entry(uuid, text, text, uuid, text, jsonb, jsonb, uuid)
  from anon, public;

-- app.next_document_number is likewise unreachable via supabase.rpc() from the
-- `app` schema (PostgREST only exposes `public`); expose a matching wrapper.
create or replace function public.next_document_number(
  p_organization_id uuid,
  p_centre_id uuid,
  p_doc_type text,
  p_period text
)
returns bigint
language sql
security definer
set search_path = ''
as $$
  select app.next_document_number(p_organization_id, p_centre_id, p_doc_type, p_period);
$$;

grant execute on function public.next_document_number(uuid, uuid, text, text)
  to authenticated, service_role;
revoke execute on function public.next_document_number(uuid, uuid, text, text)
  from anon, public;
