-- 0008: centre lifecycle — public franchise application + head-office review
-- (build plan §6, step 1.4/1.5). Document upload (centre_documents / storage)
-- is deliberately deferred to keep this migration's scope reviewable; the
-- application form works with the fields captured here.

create table public.centre_applications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  application_number text not null unique,
  applicant_name text not null,
  applicant_email text not null,
  applicant_phone text not null,
  proposed_centre_name text not null,
  city text not null,
  state text not null,
  pincode text not null,
  address text not null,
  message text,
  status public.centre_application_status not null default 'submitted',
  reviewed_by uuid,
  reviewed_at timestamptz,
  centre_id uuid references public.centres (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index centre_applications_org_status_idx
  on public.centre_applications (organization_id, status, created_at desc);

create trigger set_updated_at
  before update on public.centre_applications
  for each row execute function app.set_updated_at();

create table public.centre_application_reviews (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.centre_applications (id) on delete cascade,
  reviewer_id uuid not null,
  action public.centre_application_status not null,
  comments text,
  created_at timestamptz not null default now()
);

alter table public.centre_applications enable row level security;
alter table public.centre_applications force row level security;
alter table public.centre_application_reviews enable row level security;
alter table public.centre_application_reviews force row level security;

-- No SELECT/INSERT for anon or authenticated on centre_applications: the
-- public form writes through a SECURITY DEFINER RPC (like leads), and only
-- platform admins can read applications in this slice — a centre-scoped
-- "my application status" read can follow once the applicant has an account.
create policy centre_applications_platform_read on public.centre_applications
  for select to authenticated
  using (app.is_platform_admin());

create policy centre_applications_platform_write on public.centre_applications
  for update to authenticated
  using (app.is_platform_admin())
  with check (app.is_platform_admin());

create policy centre_application_reviews_platform_read on public.centre_application_reviews
  for select to authenticated
  using (app.is_platform_admin());

create policy centre_application_reviews_platform_write on public.centre_application_reviews
  for insert to authenticated
  with check (app.is_platform_admin());

create or replace function public.submit_centre_application(
  p_organization_slug text,
  p_applicant_name text,
  p_applicant_email text,
  p_applicant_phone text,
  p_proposed_centre_name text,
  p_city text,
  p_state text,
  p_pincode text,
  p_address text,
  p_message text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_org_id uuid;
  v_number text;
begin
  select id into v_org_id from public.organizations where slug = p_organization_slug;
  if v_org_id is null then
    raise exception 'Unknown organization slug: %', p_organization_slug;
  end if;

  v_number := 'APP-' || to_char(now(), 'YY') || '-' ||
    lpad(app.next_document_number(v_org_id, null, 'centre_application', to_char(now(), 'YY'))::text, 5, '0');

  insert into public.centre_applications (
    organization_id, application_number, applicant_name, applicant_email, applicant_phone,
    proposed_centre_name, city, state, pincode, address, message
  )
  values (
    v_org_id, v_number, p_applicant_name, p_applicant_email, p_applicant_phone,
    p_proposed_centre_name, p_city, p_state, p_pincode, p_address, p_message
  );

  return v_number;
end;
$$;

grant execute on function public.submit_centre_application(
  text, text, text, text, text, text, text, text, text, text
) to anon, authenticated;
