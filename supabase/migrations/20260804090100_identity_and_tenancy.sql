-- ============================================================================
-- 0002 — Identity and tenancy
--
-- The tables every RLS policy in the system keys on (PRD §9.4):
--   organizations -> centres -> memberships -> roles -> permissions
--
-- RLS is enabled here but no policies are created yet. That is deliberate and
-- safe: a table with RLS enabled and zero policies denies everything. Policies
-- arrive in 0003 once the security helpers they depend on exist.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- profiles — 1:1 with auth.users (PRD §10.1)
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null check (length(trim(full_name)) between 1 and 160),
  phone text check (phone ~ '^\+?[0-9]{8,15}$'),
  avatar_path text,
  locale text not null default 'en-IN',
  timezone text not null default 'Asia/Kolkata',
  status app.profile_status not null default 'invited',
  last_sign_in_at timestamptz,
  mfa_enrolled_at timestamptz
);

select app.add_audit_columns('public.profiles');

comment on table public.profiles is
  'Application profile for an auth user. Never stores credentials.';

-- ---------------------------------------------------------------------------
-- platform_admins — global staff, stored in `app` and unreachable via REST
--
-- PRD §9.4: "Global platform staff are stored separately from tenant roles and
-- audited heavily." Living in the `app` schema means no JWT can read or write
-- this table through the API at all; changes go through service-role code paths
-- that record an audit entry.
-- ---------------------------------------------------------------------------

create table app.platform_admins (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  granted_at timestamptz not null default timezone('utc', now()),
  granted_by uuid references public.profiles (id),
  granted_reason text not null,
  revoked_at timestamptz,
  revoked_by uuid references public.profiles (id),
  revoked_reason text,
  check (
    (revoked_at is null and revoked_by is null and revoked_reason is null)
    or (revoked_at is not null and revoked_reason is not null)
  )
);

comment on table app.platform_admins is
  'Platform super admins. In the app schema so it has no PostgREST surface.';

-- ---------------------------------------------------------------------------
-- organizations — the top-level tenant (PRD §9.4)
-- ---------------------------------------------------------------------------

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$'),
  legal_name text not null,
  display_name text not null,
  code text not null unique check (code ~ '^[A-Z0-9]{2,8}$'),
  logo_path text,
  default_currency char(3) not null default 'INR' check (default_currency = 'INR'),
  default_timezone text not null default 'Asia/Kolkata',
  default_locale text not null default 'en-IN',
  status app.organization_status not null default 'active',
  deleted_at timestamptz
);

select app.add_audit_columns('public.organizations');

comment on column public.organizations.code is
  'Short prefix used in generated document numbers, e.g. CO in CO-DL01-26-DCA-00042.';

-- ---------------------------------------------------------------------------
-- centres
-- ---------------------------------------------------------------------------

create table public.centres (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete restrict,
  code text not null check (code ~ '^[A-Z0-9-]{3,16}$'),
  display_name text not null,
  legal_name text,
  director_name text,
  contact_email extensions.citext,
  contact_phone text check (contact_phone ~ '^\+?[0-9]{8,15}$'),
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  postal_code text check (postal_code ~ '^[0-9]{6}$'),
  country char(2) not null default 'IN',
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  plan text,
  joined_on date,
  valid_until date,
  status app.centre_status not null default 'pending',
  suspended_reason text,
  deleted_at timestamptz,

  -- Centre codes are unique within an organisation, not globally, so two
  -- organisations can both have a "DL01".
  unique (organization_id, code),

  -- A suspended centre must say why. PRD §4.1 requires a reason on privileged
  -- state changes; the constraint makes it impossible to skip.
  check (status <> 'suspended' or suspended_reason is not null)
);

select app.add_audit_columns('public.centres');

create index centres_organization_status_idx
  on public.centres (organization_id, status);
create index centres_city_idx on public.centres (city) where deleted_at is null;

-- ---------------------------------------------------------------------------
-- permissions and roles
--
-- Permissions are data, not code. No role name is hard-coded in application
-- logic; every check goes through a permission code (build plan §4).
-- ---------------------------------------------------------------------------

create table public.permissions (
  code text primary key check (code ~ '^[a-z_]+\.[a-z_]+$'),
  resource text not null,
  action text not null,
  description text not null,
  -- Privileged actions require step-up re-authentication and a typed reason
  -- (PRD §4.1). Marking them here means the server layer cannot forget.
  requires_step_up boolean not null default false
);

comment on table public.permissions is
  'Stable permission catalogue. Codes are resource.action, e.g. student.create.';

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  scope app.role_scope not null,
  organization_id uuid references public.organizations (id) on delete cascade,
  code text not null check (code ~ '^[a-z_]{2,48}$'),
  name text not null,
  description text,
  -- System roles ship with the product and cannot be deleted or renamed.
  is_system boolean not null default false,
  deleted_at timestamptz,

  -- Platform roles have no organisation; tenant roles must have one.
  check (
    (scope = 'platform' and organization_id is null)
    or (scope <> 'platform' and organization_id is not null)
  )
);

select app.add_audit_columns('public.roles');

-- Two partial indexes rather than one, because NULL organization_id would not
-- collide under a plain unique constraint.
create unique index roles_platform_code_key
  on public.roles (code) where organization_id is null;
create unique index roles_org_code_key
  on public.roles (organization_id, code) where organization_id is not null;

create table public.role_permissions (
  role_id uuid not null references public.roles (id) on delete cascade,
  permission_code text not null references public.permissions (code) on delete cascade,
  granted_at timestamptz not null default timezone('utc', now()),
  granted_by uuid references public.profiles (id),
  primary key (role_id, permission_code)
);

-- ---------------------------------------------------------------------------
-- memberships — the join every RLS policy resolves through
-- ---------------------------------------------------------------------------

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  -- NULL means organisation-wide (head office); a value scopes to one centre.
  centre_id uuid references public.centres (id) on delete cascade,
  role_id uuid not null references public.roles (id) on delete restrict,
  status app.membership_status not null default 'invited',
  invited_at timestamptz,
  invited_by uuid references public.profiles (id),
  accepted_at timestamptz,
  suspended_at timestamptz,
  suspended_reason text,

  check (status <> 'suspended' or suspended_reason is not null)
);

select app.add_audit_columns('public.memberships');

-- One membership per user/scope/role. COALESCE to the nil UUID so two
-- organisation-wide memberships with the same role cannot both exist.
create unique index memberships_unique_scope_key
  on public.memberships (
    user_id,
    organization_id,
    coalesce(centre_id, '00000000-0000-0000-0000-000000000000'::uuid),
    role_id
  );

-- The covering index that makes the RLS helpers cheap. Every policy in the
-- system hits this table once per statement, so the lookup must never touch
-- the heap (build plan risk R3).
create index memberships_user_active_idx
  on public.memberships (user_id, status)
  include (organization_id, centre_id, role_id);

create index memberships_centre_idx on public.memberships (centre_id)
  where centre_id is not null;
create index memberships_organization_idx
  on public.memberships (organization_id, status);

-- A centre membership must belong to a centre in the same organisation as the
-- membership. A composite foreign key is the only way to enforce this without
-- a trigger, so centres carries a matching unique key.
alter table public.centres
  add constraint centres_org_id_unique unique (organization_id, id);

alter table public.memberships
  add constraint memberships_centre_in_org_fkey
  foreign key (organization_id, centre_id)
  references public.centres (organization_id, id)
  on delete cascade;

-- ---------------------------------------------------------------------------
-- Row level security
--
-- Enabled with no policies: everything is denied until 0003 adds them.
-- FORCE also applies RLS to the table owner. Roles with BYPASSRLS
-- (service_role) still bypass, which is intended — those paths are audited.
-- ---------------------------------------------------------------------------

alter table public.profiles         enable row level security;
alter table public.profiles         force  row level security;
alter table public.organizations    enable row level security;
alter table public.organizations    force  row level security;
alter table public.centres          enable row level security;
alter table public.centres          force  row level security;
alter table public.permissions      enable row level security;
alter table public.permissions      force  row level security;
alter table public.roles            enable row level security;
alter table public.roles            force  row level security;
alter table public.role_permissions enable row level security;
alter table public.role_permissions force  row level security;
alter table public.memberships      enable row level security;
alter table public.memberships      force  row level security;

alter table app.platform_admins enable row level security;
alter table app.platform_admins force  row level security;

-- No blanket grants. `authenticated` gets column-level rights only where a
-- policy also allows the row.
revoke all on all tables in schema public from anon, authenticated;
