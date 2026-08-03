-- ============================================================================
-- 0001 — Extensions, schemas and shared conventions
--
-- Establishes the scaffolding every later migration depends on:
--   * the `app` schema, which holds security helpers and privileged tables and
--     is deliberately NOT exposed through PostgREST
--   * shared enum types for statuses named in PRD §6
--   * the updated_at trigger and the generic audit trigger factory
--
-- Forward-only. Never edit an applied migration (PRD §15).
-- ============================================================================

create extension if not exists pgcrypto with schema extensions;
create extension if not exists citext with schema extensions;
create extension if not exists pg_trgm with schema extensions;

-- ---------------------------------------------------------------------------
-- Schemas
-- ---------------------------------------------------------------------------

-- `app` holds SECURITY DEFINER helpers and tables that must never be reachable
-- from a browser, even with a valid JWT. It is excluded from the PostgREST
-- exposed schemas in supabase/config.toml, so there is no REST surface at all.
create schema if not exists app;

revoke all on schema app from public;
grant usage on schema app to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Shared enums
--
-- Statuses are enums rather than free text so an invalid state cannot be
-- written by any path, including service-role code and manual SQL.
-- ---------------------------------------------------------------------------

create type app.profile_status as enum (
  'invited',
  'active',
  'suspended',
  'deactivated'
);

create type app.organization_status as enum ('active', 'suspended', 'closed');

-- PRD §6.1: "Centre remains active, suspended, expired or closed."
-- `pending` covers the window between application approval and first login.
create type app.centre_status as enum (
  'pending',
  'active',
  'suspended',
  'expired',
  'closed'
);

create type app.membership_status as enum (
  'invited',
  'active',
  'suspended',
  'revoked'
);

create type app.role_scope as enum ('platform', 'organization', 'centre');

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------

create or replace function app.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := timezone('utc', now());
  -- auth.uid() is null for service-role and migration contexts; keep whatever
  -- the caller supplied rather than nulling out an explicit actor.
  new.updated_by := coalesce(auth.uid(), new.updated_by);
  return new;
end;
$$;

comment on function app.set_updated_at() is
  'BEFORE UPDATE trigger: stamps updated_at (UTC) and updated_by from the session actor.';

-- ---------------------------------------------------------------------------
-- Timestamp conventions
--
-- Every mutable table gets these five columns via this helper so the shape is
-- identical everywhere and a later audit query can rely on it (PRD §10).
-- ---------------------------------------------------------------------------

create or replace function app.add_audit_columns(p_table regclass)
returns void
language plpgsql
as $$
declare
  v_name text := p_table::text;
begin
  execute format(
    'alter table %s
       add column if not exists created_at timestamptz not null default timezone(''utc'', now()),
       add column if not exists created_by uuid,
       add column if not exists updated_at timestamptz not null default timezone(''utc'', now()),
       add column if not exists updated_by uuid',
    v_name
  );

  execute format(
    'drop trigger if exists set_updated_at on %s', v_name
  );
  execute format(
    'create trigger set_updated_at before update on %s
       for each row execute function app.set_updated_at()',
    v_name
  );
end;
$$;

comment on function app.add_audit_columns(regclass) is
  'Adds created_at/created_by/updated_at/updated_by and the updated_at trigger to a table.';
