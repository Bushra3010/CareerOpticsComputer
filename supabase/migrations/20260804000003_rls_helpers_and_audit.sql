-- 0003: RLS helper functions, audit framework, idempotency, settings, document sequences.
-- Every helper is STABLE SECURITY DEFINER with a locked search_path (Supabase footgun).

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
  select coalesce(
    (select p.is_platform_super_admin from public.profiles p where p.id = auth.uid()),
    false
  );
$$;

create or replace function app.is_org_member(org uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.memberships m
    where m.user_id = auth.uid()
      and m.organization_id = org
      and m.status = 'active'
  );
$$;

create or replace function app.can_access_centre(centre uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.memberships m
    join public.centres c on c.id = m.centre_id
    where m.user_id = auth.uid()
      and m.centre_id = centre
      and m.status = 'active'
      and c.status = 'active'
  );
$$;

create or replace function app.centre_is_operational(centre uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.centres c where c.id = centre and c.status = 'active'
  );
$$;

create or replace function app.has_permission(perm text, org uuid, centre uuid default null)
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
      and m.organization_id = org
      and m.status = 'active'
      and (centre is null or m.centre_id is null or m.centre_id = centre)
      and rp.permission_code = perm
  );
$$;

create or replace function app.is_current_student(student uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select student = auth.uid();
$$;

grant execute on all functions in schema app to authenticated;
revoke execute on all functions in schema app from anon, public;

-- Audit framework -----------------------------------------------------------

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid,
  actor_id uuid,
  action text not null,
  table_name text not null,
  row_id uuid,
  reason text,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);

revoke update, delete on public.audit_logs from authenticated, anon;

create or replace function app.audit_trigger()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.audit_logs (
    organization_id, actor_id, action, table_name, row_id, before_data, after_data
  )
  values (
    coalesce(
      case when tg_op = 'DELETE' then (to_jsonb(old) ->> 'organization_id') else (to_jsonb(new) ->> 'organization_id') end,
      null
    )::uuid,
    auth.uid(),
    tg_op,
    tg_table_name,
    case when tg_op = 'DELETE' then (to_jsonb(old) ->> 'id')::uuid else (to_jsonb(new) ->> 'id')::uuid end,
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end,
    case when tg_op in ('UPDATE', 'INSERT') then to_jsonb(new) else null end
  );
  return coalesce(new, old);
end;
$$;

-- Idempotency -----------------------------------------------------------------

create table public.idempotency_keys (
  key text primary key,
  organization_id uuid,
  actor_id uuid,
  request_hash text not null,
  response_body jsonb,
  status_code int,
  created_at timestamptz not null default now()
);

-- Settings ----------------------------------------------------------------------

create table public.system_settings (
  organization_id uuid not null references public.organizations (id),
  key text not null,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  primary key (organization_id, key)
);

create trigger set_updated_at
  before update on public.system_settings
  for each row execute function app.set_updated_at();

-- Document sequences -------------------------------------------------------------

create table public.document_sequences (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  centre_id uuid references public.centres (id),
  doc_type text not null,
  period text not null,
  last_value bigint not null default 0
);

create unique index document_sequences_unique_idx
  on public.document_sequences (
    organization_id,
    coalesce(centre_id, '00000000-0000-0000-0000-000000000000'::uuid),
    doc_type,
    period
  );

create or replace function app.next_document_number(
  p_organization_id uuid,
  p_centre_id uuid,
  p_doc_type text,
  p_period text
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_next bigint;
begin
  insert into public.document_sequences (organization_id, centre_id, doc_type, period, last_value)
  values (p_organization_id, p_centre_id, p_doc_type, p_period, 1)
  on conflict (
    organization_id,
    coalesce(centre_id, '00000000-0000-0000-0000-000000000000'::uuid),
    doc_type,
    period
  )
  do update set last_value = public.document_sequences.last_value + 1
  returning last_value into v_next;

  return v_next;
end;
$$;

grant execute on function app.next_document_number(uuid, uuid, text, text) to authenticated, service_role;

-- Row Level Security ---------------------------------------------------------------

alter table public.organizations enable row level security;
alter table public.organizations force row level security;
alter table public.profiles enable row level security;
alter table public.profiles force row level security;
alter table public.centres enable row level security;
alter table public.centres force row level security;
alter table public.roles enable row level security;
alter table public.roles force row level security;
alter table public.permissions enable row level security;
alter table public.permissions force row level security;
alter table public.role_permissions enable row level security;
alter table public.role_permissions force row level security;
alter table public.memberships enable row level security;
alter table public.memberships force row level security;
alter table public.audit_logs enable row level security;
alter table public.audit_logs force row level security;
alter table public.idempotency_keys enable row level security;
alter table public.idempotency_keys force row level security;
alter table public.system_settings enable row level security;
alter table public.system_settings force row level security;
alter table public.document_sequences enable row level security;
alter table public.document_sequences force row level security;

create policy profiles_select_self on public.profiles for select to authenticated
using (id = auth.uid() or app.is_platform_admin());

create policy profiles_update_self on public.profiles for update to authenticated
using (id = auth.uid() or app.is_platform_admin())
with check (id = auth.uid() or app.is_platform_admin());

create policy organizations_select on public.organizations for select to authenticated
using (app.is_platform_admin() or app.is_org_member(id));

create policy organizations_all_platform on public.organizations for all to authenticated
using (app.is_platform_admin())
with check (app.is_platform_admin());

create policy centres_select on public.centres for select to authenticated
using (app.is_platform_admin() or app.is_org_member(organization_id));

create policy centres_write_platform on public.centres for insert to authenticated
with check (app.is_platform_admin() or app.has_permission('centre.create', organization_id));

create policy centres_update on public.centres for update to authenticated
using (app.is_platform_admin() or app.has_permission('centre.update', organization_id, id))
with check (app.is_platform_admin() or app.has_permission('centre.update', organization_id, id));

create policy roles_select on public.roles for select to authenticated
using (app.is_platform_admin() or organization_id is null or app.is_org_member(organization_id));

create policy permissions_select on public.permissions for select to authenticated
using (true);

create policy role_permissions_select on public.role_permissions for select to authenticated
using (app.is_platform_admin() or exists (
  select 1 from public.roles r where r.id = role_id and (r.organization_id is null or app.is_org_member(r.organization_id))
));

create policy memberships_select on public.memberships for select to authenticated
using (
  user_id = auth.uid()
  or app.is_platform_admin()
  or app.has_permission('user.read', organization_id, centre_id)
);

create policy memberships_no_self_role_update on public.memberships for update to authenticated
using (app.is_platform_admin() or app.has_permission('role.update', organization_id, centre_id))
with check (app.is_platform_admin() or app.has_permission('role.update', organization_id, centre_id));

create policy audit_logs_select on public.audit_logs for select to authenticated
using (app.is_platform_admin() or app.has_permission('audit.read', organization_id));

create policy system_settings_select on public.system_settings for select to authenticated
using (app.is_platform_admin() or app.is_org_member(organization_id));

create policy system_settings_write on public.system_settings for all to authenticated
using (app.is_platform_admin() or app.has_permission('settings.update', organization_id))
with check (app.is_platform_admin() or app.has_permission('settings.update', organization_id));

create policy document_sequences_service on public.document_sequences for all to service_role
using (true) with check (true);

-- No SELECT/INSERT/UPDATE policy for authenticated on idempotency_keys or document_sequences:
-- both are written only through SECURITY DEFINER functions / the service role.
