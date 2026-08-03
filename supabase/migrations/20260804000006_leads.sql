-- 0006: leads — the public admission enquiry form writes here (build plan §6, step 1.3).

create type public.lead_status as enum ('new', 'contacted', 'converted', 'closed');

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  full_name text not null,
  phone text not null,
  email text,
  city text,
  course_interest_id uuid references public.courses (id),
  message text,
  status public.lead_status not null default 'new',
  source text not null default 'public_site',
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid
);

create index leads_organization_id_status_idx on public.leads (organization_id, status, created_at desc);
create index leads_phone_trgm_idx on public.leads using gin (phone gin_trgm_ops);

create trigger set_updated_at
  before update on public.leads
  for each row execute function app.set_updated_at();

alter table public.leads enable row level security;
alter table public.leads force row level security;

-- No SELECT/INSERT policy for anon or authenticated: the public enquiry form
-- writes through a SECURITY DEFINER RPC (below) so a submitter can never list
-- other people's leads or enumerate phone numbers (PRD requires "no
-- enumeration"). Staff read access is added when the CRM UI lands.
create policy leads_platform_read on public.leads
  for select to authenticated
  using (app.is_platform_admin() or app.has_permission('lead.read', organization_id));

create policy leads_platform_write on public.leads
  for all to authenticated
  using (app.is_platform_admin() or app.has_permission('lead.create', organization_id))
  with check (app.is_platform_admin() or app.has_permission('lead.create', organization_id));

-- Takes the organization by slug, not id: anon can't read `organizations`
-- (RLS), and hard-coding a slug in client code is safer than trusting a
-- client-supplied organization_id for a public write.
create or replace function public.submit_public_enquiry(
  p_organization_slug text,
  p_full_name text,
  p_phone text,
  p_email text,
  p_city text,
  p_course_interest_id uuid,
  p_message text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_org_id uuid;
  v_id uuid;
begin
  select id into v_org_id from public.organizations where slug = p_organization_slug;
  if v_org_id is null then
    raise exception 'Unknown organization slug: %', p_organization_slug;
  end if;

  insert into public.leads (
    organization_id, full_name, phone, email, city, course_interest_id, message
  )
  values (
    v_org_id, p_full_name, p_phone, p_email, p_city, p_course_interest_id, p_message
  )
  returning id into v_id;

  return v_id;
end;
$$;

grant execute on function public.submit_public_enquiry(text, text, text, text, text, uuid, text)
  to anon, authenticated;
