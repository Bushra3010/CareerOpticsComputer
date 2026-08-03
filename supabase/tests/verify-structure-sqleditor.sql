-- ============================================================================
-- Career Optics CCMS — Phase 0 structural verification
--
-- Paste into the Supabase SQL editor AFTER running apply-phase-0.sql.
-- Read-only: creates nothing, changes nothing, returns one result table.
--
-- Every row should read PASS. A FAIL means a security guarantee the rest of
-- the system assumes is not actually in place.
--
-- SCOPE: this checks the guarantees that can be verified without impersonating
-- users. The tenant-isolation proofs (P1 "Centre A cannot read Centre B",
-- P3 "staff cannot self-promote", P4 "suspended membership is inert") need to
-- switch roles across sessions and live in supabase/tests/00_tenancy_rls.sql,
-- which needs a database connection string or CLI access token to run.
-- ============================================================================

with checks as (

  -- Every table in public must have RLS enabled AND forced. A table without it
  -- is readable by anyone holding the anon key.
  select
    1 as id,
    'RLS enabled and forced on every public table' as check_name,
    '0 tables missing it' as expected,
    (
      select count(*)::text || ' tables missing it'
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public'
        and c.relkind = 'r'
        and (not c.relrowsecurity or not c.relforcerowsecurity)
    ) as actual

  union all

  -- A SECURITY DEFINER function with a mutable search_path is the classic
  -- Postgres privilege-escalation hole, and these functions decide who sees what.
  select
    2,
    'Every SECURITY DEFINER function in app pins search_path',
    '0 unpinned',
    (
      select count(*)::text || ' unpinned'
      from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'app'
        and p.prosecdef
        and coalesce(array_to_string(p.proconfig, ','), '') not like '%search_path=%'
    )

  union all

  -- anon must hold no table privilege anywhere. Public reads (course catalogue,
  -- certificate verification) will go through explicit functions instead.
  select
    3,
    'anon holds no table privilege in public',
    '0 grants',
    (
      select count(*)::text || ' grants'
      from information_schema.role_table_grants
      where table_schema = 'public' and grantee = 'anon'
    )

  union all

  select
    4,
    'anon can execute no function in public',
    '0 grants',
    (
      select count(*)::text || ' grants'
      from information_schema.role_routine_grants
      where routine_schema = 'public' and grantee = 'anon'
    )

  union all

  -- The app schema must have no PostgREST surface at all: app.platform_admins
  -- decides who is a super admin.
  select
    5,
    'app schema is not exposed to anon or authenticated',
    '0 grants',
    (
      select count(*)::text || ' grants'
      from information_schema.role_table_grants
      where table_schema = 'app' and grantee in ('anon', 'authenticated')
    )

  union all

  -- audit_logs must be append-only at the privilege level, not merely by policy.
  select
    6,
    'audit_logs UPDATE/DELETE revoked from authenticated',
    '0 grants',
    (
      select count(*)::text || ' grants'
      from information_schema.role_table_grants
      where table_schema = 'public'
        and table_name = 'audit_logs'
        and grantee = 'authenticated'
        and privilege_type in ('UPDATE', 'DELETE')
    )

  union all

  select
    7,
    'Permission catalogue loaded',
    '75 permissions',
    (select count(*)::text || ' permissions' from public.permissions)

  union all

  select
    8,
    'System role templates loaded',
    '10 roles',
    (select count(*)::text || ' roles' from public.roles where is_system)

  union all

  -- If a role template has no permissions, everyone assigned to it is locked
  -- out and the cause is very hard to see from the UI.
  select
    9,
    'Every system role has at least one permission',
    '0 empty roles',
    (
      select count(*)::text || ' empty roles'
      from public.roles r
      where r.is_system
        and not exists (
          select 1 from public.role_permissions rp where rp.role_id = r.id
        )
    )

  union all

  -- Step-up permissions must match lib/permissions/index.ts STEP_UP_PERMISSIONS.
  select
    10,
    'Step-up permissions flagged in the catalogue',
    '20 flagged',
    (select count(*)::text || ' flagged' from public.permissions where requires_step_up)

  union all

  select
    11,
    'RPC wrappers present for the authorisation layer',
    '4 functions',
    (
      select count(*)::text || ' functions'
      from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public'
        and p.proname in ('has_permission', 'can_access_centre',
                          'centre_is_operational', 'is_platform_admin')
    )

  union all

  -- Gapless numbering is what stops two students being issued the same
  -- registration number under concurrent admission (proof test P5).
  select
    12,
    'Document numbering function present',
    '1 function',
    (
      select count(*)::text || ' function'
      from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'app' and p.proname = 'next_document_number'
    )

  union all

  select
    13,
    'Audit triggers attached to the tenancy tables',
    '5 triggers',
    (
      select count(*)::text || ' triggers'
      from pg_trigger t
      join pg_class c on c.oid = t.tgrelid
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public'
        and t.tgname = 'audit'
        and not t.tgisinternal
    )

  union all

  -- Every table carrying tenant data needs at least one policy, or RLS denies
  -- everything and the feature simply does not work.
  select
    14,
    'Every RLS-enabled table has at least one policy',
    '0 without policies',
    (
      select count(*)::text || ' without policies'
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public'
        and c.relkind = 'r'
        and c.relrowsecurity
        and not exists (
          select 1 from pg_policy p where p.polrelid = c.oid
        )
    )
)

select
  id,
  check_name,
  expected,
  actual,
  case when expected = actual then 'PASS' else 'FAIL' end as result
from checks
order by
  case when expected = actual then 1 else 0 end,  -- failures first
  id;
