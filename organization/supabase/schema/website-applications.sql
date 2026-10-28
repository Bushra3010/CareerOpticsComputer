-- =====================================================================
-- Applications from the public website, straight into the ERP.
--
--   * A student applies for admission at a centre they choose. The
--     application lands in admission_leads (source 'Website') against that
--     centre, so the centre's own login sees it under Admission Leads and
--     can turn it into an admission.
--   * Someone applies for a franchise. The application lands in
--     franchise_leads for the head office's Branch Lead Management.
--
-- The website signs in as nobody (the anon key). It reaches the database
-- only through the three functions below -- no table is opened to it. They
-- take plain text, check it, and write one row; a visitor who submits twice
-- in a few minutes gets the first row back rather than a duplicate.
--
-- Run after admission-leads.sql and franchise-leads.sql. Safe to re-run.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. The centres a student can apply at: open, and taking online
--    admissions. Only what the picker shows -- no phone, e-mail or owner.
-- ---------------------------------------------------------------------
create or replace function public.public_centres()
returns table ("id" text, "name" text, "city" text, "district" text, "state" text)
language sql
stable
security definer
set search_path = public
as $$
  select b."id", b."name", a."city", a."district", a."state"
    from public.branches b
    left join public.branch_addresses a on a."branchId" = b."id"
   where b."deletedAt" is null
     and coalesce(b."isActive", true)
     and coalesce(b."onlineEnrollment", true)
   order by a."state" nulls last, a."district" nulls last, b."name";
$$;

revoke all on function public.public_centres() from public;
grant execute on function public.public_centres() to anon, authenticated;


-- The organisation the website belongs to: the one that runs the centres.
create or replace function public.website_organization()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select "organizationId" from public.branches
   where "deletedAt" is null
   group by "organizationId"
   order by count(*) desc
   limit 1;
$$;

revoke all on function public.website_organization() from public, anon, authenticated;


-- Text from a stranger: trimmed, empty as null, and cut to a sane length.
create or replace function public.clean_text(p_value text, p_max integer default 200)
returns text
language sql
immutable
as $$
  select nullif(left(regexp_replace(trim(coalesce(p_value, '')), '\s+', ' ', 'g'), p_max), '');
$$;


-- ---------------------------------------------------------------------
-- 2. A student's admission application.
-- ---------------------------------------------------------------------
create or replace function public.submit_admission_application(
  p_branch_id     text,
  p_student_name  text,
  p_phone         text,
  p_email         text default null,
  p_course        text default null,
  p_qualification text default null,
  p_city          text default null,
  p_parent_name   text default null,
  p_message       text default null,
  p_page          text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_branch record;
  v_phone  text := right(regexp_replace(coalesce(p_phone, ''), '\D', '', 'g'), 10);
  v_name   text := public.clean_text(p_student_name, 120);
  v_id     text;
begin
  if v_name is null then
    raise exception 'INVALID: Please enter your name.';
  end if;
  if length(v_phone) <> 10 or v_phone !~ '^[6-9]' then
    raise exception 'INVALID: Please enter a valid 10-digit mobile number.';
  end if;

  select "id", "organizationId", "name" into v_branch
    from public.branches
   where "id" = p_branch_id and "deletedAt" is null
     and coalesce("isActive", true) and coalesce("onlineEnrollment", true);
  if not found then
    raise exception 'INVALID: Please choose a centre from the list.';
  end if;

  -- The same person at the same centre a moment ago: the first application stands.
  select "id" into v_id
    from public.admission_leads
   where "branchId" = v_branch."id" and "phone" = v_phone and "source" = 'Website'
     and "createdAt" > now() - interval '10 minutes'
   order by "createdAt" desc
   limit 1;
  if v_id is not null then
    return jsonb_build_object('id', v_id, 'centre', v_branch."name", 'duplicate', true);
  end if;

  insert into public.admission_leads (
    "organizationId", "branchId", "studentName", "parentName", "phone", "whatsapp", "email",
    "qualification", "city", "courseInterested", "source", "status", "remarks"
  ) values (
    v_branch."organizationId", v_branch."id", v_name, public.clean_text(p_parent_name, 120), v_phone, v_phone,
    public.clean_text(p_email, 120), public.clean_text(p_qualification, 120), public.clean_text(p_city, 120),
    public.clean_text(p_course, 160), 'Website', 'New',
    public.clean_text(concat_ws(' | ', 'Applied online' || coalesce(' from ' || public.clean_text(p_page, 120), ''), public.clean_text(p_message, 800)), 1000)
  )
  returning "id" into v_id;

  return jsonb_build_object('id', v_id, 'centre', v_branch."name", 'duplicate', false);
end;
$$;

revoke all on function public.submit_admission_application(text, text, text, text, text, text, text, text, text, text) from public;
grant execute on function public.submit_admission_application(text, text, text, text, text, text, text, text, text, text) to anon, authenticated;


-- ---------------------------------------------------------------------
-- 3. A franchise application.
-- ---------------------------------------------------------------------
create or replace function public.submit_franchise_application(
  p_name        text,
  p_phone       text,
  p_email       text default null,
  p_institute   text default null,
  p_address     text default null,
  p_state       text default null,
  p_district    text default null,
  p_block       text default null,
  p_city        text default null,
  p_pincode     text default null,
  p_computers   text default null,
  p_staff       text default null,
  p_investment  text default null,
  p_model       text default null,
  p_message     text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_phone text := right(regexp_replace(coalesce(p_phone, ''), '\D', '', 'g'), 10);
  v_name  text := public.clean_text(p_name, 120);
  v_org   text := public.website_organization();
  v_pcs   integer := nullif(regexp_replace(coalesce(p_computers, ''), '\D', '', 'g'), '')::integer;
  v_id    text;
  v_no    text;
begin
  if v_name is null then
    raise exception 'INVALID: Please enter your name.';
  end if;
  if length(v_phone) <> 10 or v_phone !~ '^[6-9]' then
    raise exception 'INVALID: Please enter a valid 10-digit mobile number.';
  end if;

  select "id", "leadNo" into v_id, v_no
    from public.franchise_leads
   where "phone" = v_phone and "createdAt" > now() - interval '10 minutes'
   order by "createdAt" desc
   limit 1;
  if v_id is not null then
    return jsonb_build_object('id', v_id, 'leadNo', v_no, 'duplicate', true);
  end if;

  v_no := 'FRL-' || to_char(now(), 'YYMMDD') || '-' || upper(substr(md5(random()::text), 1, 4));
  insert into public.franchise_leads (
    "organizationId", "leadNo", "directorName", "phone", "whatsapp", "email", "state", "district", "block",
    "city", "pincode", "address", "computers", "investmentBudget", "franchiseType", "status", "remarks"
  ) values (
    v_org, v_no, v_name, v_phone, v_phone, public.clean_text(p_email, 120), public.clean_text(p_state, 80),
    public.clean_text(p_district, 80), public.clean_text(p_block, 80), public.clean_text(p_city, 80),
    public.clean_text(p_pincode, 10), public.clean_text(p_address, 300), least(v_pcs, 10000),
    public.clean_text(p_investment, 80), public.clean_text(p_model, 80), 'New Lead',
    public.clean_text(concat_ws(' | ', 'Applied on the website',
      'Institute: ' || public.clean_text(p_institute, 160),
      'Staff: ' || public.clean_text(p_staff, 20),
      public.clean_text(p_message, 800)), 1200)
  )
  returning "id" into v_id;

  return jsonb_build_object('id', v_id, 'leadNo', v_no, 'duplicate', false);
end;
$$;

revoke all on function public.submit_franchise_application(text, text, text, text, text, text, text, text, text, text, text, text, text, text, text) from public;
grant execute on function public.submit_franchise_application(text, text, text, text, text, text, text, text, text, text, text, text, text, text, text) to anon, authenticated;

notify pgrst, 'reload schema';

-- Check: the centres the website will offer.
select "name", "city", "district", "state" from public.public_centres();
