-- 0002: identity and tenancy — profiles, organizations, centres, memberships, roles/permissions.

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug citext not null unique,
  currency_code text not null default 'INR' check (currency_code = 'INR'),
  timezone text not null default 'Asia/Kolkata',
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  phone text,
  is_platform_super_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.centres (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  code text not null,
  name text not null,
  status public.centre_status not null default 'active',
  state text,
  city text,
  pincode text,
  address text,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  unique (organization_id, code)
);

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations (id),
  code text not null,
  name text not null,
  is_system_role boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, code)
);

create table public.permissions (
  code text primary key,
  description text not null
);

create table public.role_permissions (
  role_id uuid not null references public.roles (id) on delete cascade,
  permission_code text not null references public.permissions (code) on delete cascade,
  primary key (role_id, permission_code)
);

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  organization_id uuid not null references public.organizations (id),
  centre_id uuid references public.centres (id),
  role_id uuid not null references public.roles (id),
  status public.membership_status not null default 'active',
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid
);

create unique index memberships_unique_membership_idx
  on public.memberships (
    user_id,
    organization_id,
    coalesce(centre_id, '00000000-0000-0000-0000-000000000000'::uuid),
    role_id
  );

create index memberships_user_id_status_idx
  on public.memberships (user_id, status)
  include (organization_id, centre_id, role_id);

create index centres_organization_id_status_idx on public.centres (organization_id, status);

do $$
declare
  t text;
begin
  foreach t in array array['organizations', 'profiles', 'centres', 'roles', 'memberships']
  loop
    execute format(
      'create trigger set_updated_at before update on public.%I for each row execute function app.set_updated_at()',
      t
    );
  end loop;
end;
$$;
