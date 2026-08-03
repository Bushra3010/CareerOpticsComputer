-- ============================================================================
-- 0003 — Security helpers, audit framework and the first RLS policies
--
-- Every helper here is STABLE SECURITY DEFINER with `search_path = ''` and
-- fully-qualified identifiers. That combination is not stylistic: a
-- SECURITY DEFINER function with a mutable search_path is the classic Postgres
-- privilege-escalation hole, and these functions decide who can see what.
--
-- Claims are deliberately NOT read from the JWT. A token stays valid for its
-- lifetime, so a suspended user holding a cached token would keep their claims
-- — unacceptable against PRD §19.3, which requires suspension to take effect
-- immediately. Every helper reads `memberships` live, and STABLE lets Postgres
-- cache the result per statement.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Identity
-- ---------------------------------------------------------------------------

create or replace function app.current_user_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select auth.uid();
$$;

create or replace function app.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from app.platform_admins pa
    where pa.user_id = auth.uid()
      and pa.revoked_at is null
  );
$$;

comment on function app.is_platform_admin() is
  'True for an unrevoked platform super admin. Every use is audited by callers.';

-- ---------------------------------------------------------------------------
-- Tenant scope
-- ---------------------------------------------------------------------------

create or replace function app.is_org_member(p_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.memberships m
    where m.user_id = auth.uid()
      and m.organization_id = p_organization_id
      and m.status = 'active'
  );
$$;

/*
 * Can the current user see this centre at all?
 *
 * Deliberately does NOT consider the centre's own status. Head office must be
 * able to review a suspended centre's historical records (PRD §19.3);
 * `centre_is_operational` is the separate gate that blocks writes.
 */
create or replace function app.can_access_centre(p_centre_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.memberships m
    join public.centres c on c.organization_id = m.organization_id
    where m.user_id = auth.uid()
      and m.status = 'active'
      and c.id = p_centre_id
      -- An organisation-wide membership (centre_id IS NULL) reaches every
      -- centre in its organisation; a centre membership reaches only its own.
      and (m.centre_id is null or m.centre_id = p_centre_id)
  );
$$;

/*
 * Is this centre accepting operational writes?
 *
 * PRD §19.3: "Suspending a centre prevents new admissions, attendance,
 * financial posting and exams while authorised head office can still review
 * historical records." Every INSERT/UPDATE policy on centre-owned data carries
 * this check; no SELECT policy does.
 */
create or replace function app.centre_is_operational(p_centre_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.centres c
    join public.organizations o on o.id = c.organization_id
    where c.id = p_centre_id
      and c.status = 'active'
      and o.status = 'active'
      and c.deleted_at is null
      and (c.valid_until is null or c.valid_until >= current_date)
  );
$$;

-- ---------------------------------------------------------------------------
-- Permissions
-- ---------------------------------------------------------------------------

/*
 * Does the current user hold `p_permission` within the given scope?
 *
 * Pass p_centre_id NULL to ask about an organisation-level record. A user with
 * an organisation-wide membership satisfies both forms; a centre-scoped user
 * satisfies only their own centre.
 */
create or replace function app.has_permission(
  p_permission text,
  p_organization_id uuid,
  p_centre_id uuid default null
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.memberships m
    join public.role_permissions rp on rp.role_id = m.role_id
    where m.user_id = auth.uid()
      and m.status = 'active'
      and m.organization_id = p_organization_id
      and rp.permission_code = p_permission
      and (
        m.centre_id is null
        or p_centre_id is null
        or m.centre_id = p_centre_id
      )
  );
$$;

comment on function app.has_permission(text, uuid, uuid) is
  'Permission check scoped to an organisation and optionally a centre. Reads memberships live so suspension is immediate.';

-- Helpers are callable by signed-in users only. `anon` gets nothing.
revoke all on function app.current_user_id() from public;
revoke all on function app.is_platform_admin() from public;
revoke all on function app.is_org_member(uuid) from public;
revoke all on function app.can_access_centre(uuid) from public;
revoke all on function app.centre_is_operational(uuid) from public;
revoke all on function app.has_permission(text, uuid, uuid) from public;

grant execute on function app.current_user_id() to authenticated;
grant execute on function app.is_platform_admin() to authenticated;
grant execute on function app.is_org_member(uuid) to authenticated;
grant execute on function app.can_access_centre(uuid) to authenticated;
grant execute on function app.centre_is_operational(uuid) to authenticated;
grant execute on function app.has_permission(text, uuid, uuid) to authenticated;

-- ============================================================================
-- Audit log
-- ============================================================================

create table public.audit_logs (
  id bigint generated always as identity primary key,
  occurred_at timestamptz not null default timezone('utc', now()),
  actor_id uuid references public.profiles (id),
  -- Set when the actor is a background job or webhook rather than a person.
  actor_kind text not null default 'user'
    check (actor_kind in ('user', 'system', 'webhook', 'migration')),
  organization_id uuid references public.organizations (id) on delete set null,
  centre_id uuid references public.centres (id) on delete set null,
  action text not null,
  entity_table text not null,
  entity_id text,
  before_data jsonb,
  after_data jsonb,
  -- Required for the privileged actions listed in PRD §4.1.
  reason text,
  request_id text,
  ip_hash text,
  user_agent text
);

comment on table public.audit_logs is
  'Append-only. UPDATE and DELETE are revoked and no policy grants them.';

create index audit_logs_entity_idx on public.audit_logs (entity_table, entity_id, occurred_at desc);
create index audit_logs_actor_idx on public.audit_logs (actor_id, occurred_at desc);
create index audit_logs_scope_idx on public.audit_logs (organization_id, centre_id, occurred_at desc);

/*
 * Generic audit trigger. Attach with:
 *   create trigger audit after insert or update or delete on public.<table>
 *     for each row execute function app.record_audit();
 *
 * Captures the row diff. Reason-carrying audit entries for privileged actions
 * are written explicitly by the server layer instead, because a trigger cannot
 * know why the user did something.
 */
create or replace function app.record_audit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_before jsonb;
  v_after jsonb;
  v_row jsonb;
  v_entity_id text;
begin
  if tg_op = 'DELETE' then
    v_before := to_jsonb(old);
    v_row := v_before;
  elsif tg_op = 'INSERT' then
    v_after := to_jsonb(new);
    v_row := v_after;
  else
    v_before := to_jsonb(old);
    v_after := to_jsonb(new);
    v_row := v_after;
    -- Skip no-op updates so the log is not padded with empty diffs.
    if v_before = v_after then
      return new;
    end if;
  end if;

  v_entity_id := coalesce(v_row ->> 'id', '');

  insert into public.audit_logs (
    actor_id, actor_kind, organization_id, centre_id,
    action, entity_table, entity_id, before_data, after_data
  )
  values (
    auth.uid(),
    case when auth.uid() is null then 'system' else 'user' end,
    nullif(v_row ->> 'organization_id', '')::uuid,
    nullif(v_row ->> 'centre_id', '')::uuid,
    lower(tg_op),
    tg_table_schema || '.' || tg_table_name,
    v_entity_id,
    v_before,
    v_after
  );

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

-- ============================================================================
-- Document numbering
--
-- Sequences live in a table, not in Postgres SEQUENCE objects. A SEQUENCE is
-- non-transactional: a rolled-back admission would still burn a registration
-- number and leave an unexplained gap for an auditor to query. Taking a row
-- lock inside the same transaction as the insert means numbers are gapless.
-- The UNIQUE constraint on the destination column remains the real guarantee.
-- ============================================================================

create table public.document_sequences (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  centre_id uuid references public.centres (id) on delete cascade,
  doc_type text not null check (doc_type ~ '^[a-z_]{3,32}$'),
  -- Financial year, calendar year or month, depending on the format.
  period text not null default '',
  next_value bigint not null default 1 check (next_value >= 1),

  unique (
    organization_id,
    coalesce(centre_id, '00000000-0000-0000-0000-000000000000'::uuid),
    doc_type,
    period
  )
);

select app.add_audit_columns('public.document_sequences');

create or replace function app.next_document_number(
  p_organization_id uuid,
  p_centre_id uuid,
  p_doc_type text,
  p_period text default ''
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_value bigint;
begin
  -- Upsert then lock: the ON CONFLICT arm serialises concurrent first-callers,
  -- and the UPDATE ... RETURNING takes the row lock for everyone after that.
  insert into public.document_sequences (
    organization_id, centre_id, doc_type, period, next_value
  )
  values (p_organization_id, p_centre_id, p_doc_type, p_period, 1)
  on conflict (
    organization_id,
    coalesce(centre_id, '00000000-0000-0000-0000-000000000000'::uuid),
    doc_type,
    period
  ) do nothing;

  update public.document_sequences
     set next_value = next_value + 1
   where organization_id = p_organization_id
     and coalesce(centre_id, '00000000-0000-0000-0000-000000000000'::uuid)
         = coalesce(p_centre_id, '00000000-0000-0000-0000-000000000000'::uuid)
     and doc_type = p_doc_type
     and period = p_period
  returning next_value - 1 into v_value;

  if v_value is null then
    raise exception 'Could not allocate a % number', p_doc_type
      using errcode = 'internal_error';
  end if;

  return v_value;
end;
$$;

comment on function app.next_document_number(uuid, uuid, text, text) is
  'Allocates the next number in a sequence, gapless within a committed transaction.';

revoke all on function app.next_document_number(uuid, uuid, text, text) from public;

-- ============================================================================
-- Idempotency
--
-- PRD §9.5: "All create/payment/webhook endpoints support idempotency keys."
-- ============================================================================

create table public.idempotency_keys (
  id uuid primary key default gen_random_uuid(),
  scope text not null,
  idempotency_key text not null,
  -- Hash of the request body. A replay with the same key but a different body
  -- is a client bug and must be rejected, not silently served the old response.
  request_hash text not null,
  status text not null default 'in_progress'
    check (status in ('in_progress', 'succeeded', 'failed')),
  response_ref text,
  response_body jsonb,
  actor_id uuid references public.profiles (id),
  organization_id uuid references public.organizations (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  completed_at timestamptz,
  expires_at timestamptz not null
    default timezone('utc', now()) + interval '7 days',

  unique (scope, idempotency_key)
);

create index idempotency_keys_expiry_idx on public.idempotency_keys (expires_at);

-- ============================================================================
-- System settings
-- ============================================================================

create table public.system_settings (
  id uuid primary key default gen_random_uuid(),
  scope_type text not null check (scope_type in ('platform', 'organization', 'centre')),
  scope_id uuid,
  key text not null check (key ~ '^[a-z0-9_.]{3,64}$'),
  value jsonb not null,
  version integer not null default 1,

  check (
    (scope_type = 'platform' and scope_id is null)
    or (scope_type <> 'platform' and scope_id is not null)
  ),
  unique (scope_type, scope_id, key)
);

select app.add_audit_columns('public.system_settings');

-- ============================================================================
-- Row level security
-- ============================================================================

alter table public.audit_logs         enable row level security;
alter table public.audit_logs         force  row level security;
alter table public.document_sequences enable row level security;
alter table public.document_sequences force  row level security;
alter table public.idempotency_keys   enable row level security;
alter table public.idempotency_keys   force  row level security;
alter table public.system_settings    enable row level security;
alter table public.system_settings    force  row level security;

-- --- profiles --------------------------------------------------------------

create policy profiles_select_self on public.profiles
  for select to authenticated
  using (id = auth.uid());

-- Colleagues in a shared organisation are visible so staff lists and
-- "assigned to" fields can render a name. This is the only cross-user read.
create policy profiles_select_org_colleagues on public.profiles
  for select to authenticated
  using (
    app.is_platform_admin()
    or exists (
      select 1
      from public.memberships mine
      join public.memberships theirs
        on theirs.organization_id = mine.organization_id
      where mine.user_id = auth.uid()
        and mine.status = 'active'
        and theirs.user_id = public.profiles.id
        and theirs.status <> 'revoked'
    )
  );

create policy profiles_update_self on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- --- organizations ---------------------------------------------------------

create policy organizations_select on public.organizations
  for select to authenticated
  using (app.is_platform_admin() or app.is_org_member(id));

create policy organizations_update on public.organizations
  for update to authenticated
  using (app.is_platform_admin() or app.has_permission('organization.update', id))
  with check (app.is_platform_admin() or app.has_permission('organization.update', id));

-- --- centres ---------------------------------------------------------------

create policy centres_select on public.centres
  for select to authenticated
  using (app.is_platform_admin() or app.can_access_centre(id));

create policy centres_insert on public.centres
  for insert to authenticated
  with check (
    app.is_platform_admin()
    or app.has_permission('centre.create', organization_id)
  );

-- USING and WITH CHECK both carry the organisation test so a centre cannot be
-- moved between tenants by an UPDATE.
create policy centres_update on public.centres
  for update to authenticated
  using (
    app.is_platform_admin()
    or (app.has_permission('centre.update', organization_id, id)
        and app.can_access_centre(id))
  )
  with check (
    app.is_platform_admin()
    or (app.has_permission('centre.update', organization_id, id)
        and app.can_access_centre(id))
  );

-- --- permissions and roles -------------------------------------------------

-- The permission catalogue is readable by any signed-in user; the UI needs it
-- to render a role editor. It carries no tenant data.
create policy permissions_select on public.permissions
  for select to authenticated
  using (true);

create policy roles_select on public.roles
  for select to authenticated
  using (
    app.is_platform_admin()
    or organization_id is null
    or app.is_org_member(organization_id)
  );

create policy roles_write on public.roles
  for all to authenticated
  using (
    app.is_platform_admin()
    or (organization_id is not null
        and app.has_permission('role.update', organization_id)
        and not is_system)
  )
  with check (
    app.is_platform_admin()
    or (organization_id is not null
        and app.has_permission('role.update', organization_id)
        and not is_system)
  );

create policy role_permissions_select on public.role_permissions
  for select to authenticated
  using (
    exists (
      select 1 from public.roles r
      where r.id = role_permissions.role_id
        and (app.is_platform_admin()
             or r.organization_id is null
             or app.is_org_member(r.organization_id))
    )
  );

/*
 * Only a platform admin or a holder of role.update may change what a role
 * grants — and a system role can never be edited through the API at all.
 *
 * This is the policy that stops privilege escalation by editing permissions
 * rather than by editing your own membership (RLS test R07).
 */
create policy role_permissions_write on public.role_permissions
  for all to authenticated
  using (
    exists (
      select 1 from public.roles r
      where r.id = role_permissions.role_id
        and not r.is_system
        and (app.is_platform_admin()
             or (r.organization_id is not null
                 and app.has_permission('role.update', r.organization_id)))
    )
  )
  with check (
    exists (
      select 1 from public.roles r
      where r.id = role_permissions.role_id
        and not r.is_system
        and (app.is_platform_admin()
             or (r.organization_id is not null
                 and app.has_permission('role.update', r.organization_id)))
    )
  );

-- --- memberships -----------------------------------------------------------

create policy memberships_select on public.memberships
  for select to authenticated
  using (
    app.is_platform_admin()
    or user_id = auth.uid()
    or (centre_id is null and app.has_permission('user.read', organization_id))
    or (centre_id is not null
        and app.has_permission('user.read', organization_id, centre_id)
        and app.can_access_centre(centre_id))
  );

create policy memberships_insert on public.memberships
  for insert to authenticated
  with check (
    app.is_platform_admin()
    or (
      app.has_permission('user.invite', organization_id, centre_id)
      and (centre_id is null or app.can_access_centre(centre_id))
      and (centre_id is null or app.centre_is_operational(centre_id))
      -- You cannot invite yourself into a new role.
      and user_id <> auth.uid()
    )
  );

/*
 * Self-promotion guard (RLS tests R06 and P3).
 *
 * `user_id <> auth.uid()` in both USING and WITH CHECK means no user can touch
 * their own membership row through the API, whatever permissions they hold —
 * not their role, not their status, not their centre. Changing your own access
 * always requires another person or a platform admin.
 */
create policy memberships_update on public.memberships
  for update to authenticated
  using (
    app.is_platform_admin()
    or (
      user_id <> auth.uid()
      and app.has_permission('user.update', organization_id, centre_id)
      and (centre_id is null or app.can_access_centre(centre_id))
    )
  )
  with check (
    app.is_platform_admin()
    or (
      user_id <> auth.uid()
      and app.has_permission('user.update', organization_id, centre_id)
      and (centre_id is null or app.can_access_centre(centre_id))
    )
  );

-- --- audit logs ------------------------------------------------------------

/*
 * Read-only, and only within your own scope. There is deliberately no INSERT
 * policy: rows arrive through the SECURITY DEFINER trigger or through
 * service-role server code, never from a browser. There is no UPDATE or DELETE
 * policy at all, and the grants below make that structural.
 */
create policy audit_logs_select on public.audit_logs
  for select to authenticated
  using (
    app.is_platform_admin()
    or (organization_id is not null
        and centre_id is null
        and app.has_permission('audit.read', organization_id))
    or (centre_id is not null
        and app.has_permission('audit.read', organization_id, centre_id)
        and app.can_access_centre(centre_id))
  );

-- --- document sequences, idempotency, settings -----------------------------

-- Sequences are allocated by SECURITY DEFINER functions only. No policy for
-- authenticated users means no direct read or write.
create policy document_sequences_select_admin on public.document_sequences
  for select to authenticated
  using (app.is_platform_admin());

create policy idempotency_keys_select_own on public.idempotency_keys
  for select to authenticated
  using (actor_id = auth.uid() or app.is_platform_admin());

create policy system_settings_select on public.system_settings
  for select to authenticated
  using (
    app.is_platform_admin()
    or (scope_type = 'platform')
    or (scope_type = 'organization' and app.is_org_member(scope_id))
    or (scope_type = 'centre' and app.can_access_centre(scope_id))
  );

create policy system_settings_write on public.system_settings
  for all to authenticated
  using (
    app.is_platform_admin()
    or (scope_type = 'organization' and app.has_permission('settings.update', scope_id))
    or (scope_type = 'centre' and app.can_access_centre(scope_id))
  )
  with check (
    app.is_platform_admin()
    or (scope_type = 'organization' and app.has_permission('settings.update', scope_id))
    or (scope_type = 'centre' and app.can_access_centre(scope_id))
  );

-- ---------------------------------------------------------------------------
-- Grants
--
-- Explicit per table. RLS decides which rows; these decide which verbs.
-- ---------------------------------------------------------------------------

grant select, update on public.profiles to authenticated;
grant select, update on public.organizations to authenticated;
grant select, insert, update on public.centres to authenticated;
grant select on public.permissions to authenticated;
grant select, insert, update, delete on public.roles to authenticated;
grant select, insert, delete on public.role_permissions to authenticated;
grant select, insert, update on public.memberships to authenticated;
grant select on public.audit_logs to authenticated;
grant select on public.document_sequences to authenticated;
grant select on public.idempotency_keys to authenticated;
grant select, insert, update, delete on public.system_settings to authenticated;

-- Ledger-shaped tables are append-only at the privilege level, not just the
-- policy level. Even a future policy mistake cannot make these mutable.
revoke update, delete on public.audit_logs from authenticated;
revoke insert, update, delete on public.document_sequences from authenticated;

/*
 * Supabase ships ALTER DEFAULT PRIVILEGES granting anon, authenticated and
 * service_role on every new table in `public`. The revoke in 0002 only covered
 * tables that existed then, so anything created in this migration picked those
 * defaults back up. Strip anon completely — no unauthenticated request should
 * reach a table directly. Public reads (the course catalogue, verification)
 * go through explicit SECURITY DEFINER functions instead.
 */
revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;
revoke all on all functions in schema public from anon;

alter default privileges in schema public revoke all on tables from anon;
alter default privileges in schema public revoke all on sequences from anon;

-- --- audit triggers on the tenancy tables ----------------------------------

create trigger audit after insert or update or delete on public.centres
  for each row execute function app.record_audit();
create trigger audit after insert or update or delete on public.memberships
  for each row execute function app.record_audit();
create trigger audit after insert or update or delete on public.roles
  for each row execute function app.record_audit();
create trigger audit after insert or update or delete on public.role_permissions
  for each row execute function app.record_audit();
create trigger audit after insert or update or delete on public.organizations
  for each row execute function app.record_audit();
