-- ============================================================================
-- 0005 — Public RPC surface for the security helpers
--
-- The `app` schema is deliberately excluded from `api.schemas` in
-- supabase/config.toml, so nothing in it is reachable over PostgREST. That is
-- the right default — app.platform_admins must have no REST surface at all —
-- but the application layer does need to ask the *same* permission question the
-- RLS policies ask, rather than reimplementing the rules in TypeScript and
-- letting the two answers drift.
--
-- These are thin, read-only wrappers in `public`. They expose the questions,
-- never the tables behind them.
-- ============================================================================

create or replace function public.has_permission(
  p_permission text,
  p_organization_id uuid,
  p_centre_id uuid default null
)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select app.has_permission(p_permission, p_organization_id, p_centre_id);
$$;

comment on function public.has_permission(text, uuid, uuid) is
  'RPC wrapper over app.has_permission for the server authorisation layer.';

create or replace function public.can_access_centre(p_centre_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select app.can_access_centre(p_centre_id);
$$;

create or replace function public.centre_is_operational(p_centre_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select app.centre_is_operational(p_centre_id);
$$;

/*
 * Exposed so the UI can hide platform-only navigation. Hiding a control is a
 * courtesy, not a security boundary — every privileged action is still checked
 * by RLS and by authorize() on the server.
 */
create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select app.is_platform_admin();
$$;

-- Signed-in callers only. anon gets nothing, consistent with 0003.
revoke all on function public.has_permission(text, uuid, uuid) from public, anon;
revoke all on function public.can_access_centre(uuid) from public, anon;
revoke all on function public.centre_is_operational(uuid) from public, anon;
revoke all on function public.is_platform_admin() from public, anon;

grant execute on function public.has_permission(text, uuid, uuid) to authenticated;
grant execute on function public.can_access_centre(uuid) to authenticated;
grant execute on function public.centre_is_operational(uuid) to authenticated;
grant execute on function public.is_platform_admin() to authenticated;

/*
 * app.next_document_number is deliberately NOT wrapped. Numbers must only ever
 * be allocated inside the same transaction as the record they identify, which
 * is a server-side concern. An RPC that hands out registration numbers on
 * request would burn sequence values and produce gaps an auditor would query.
 */
