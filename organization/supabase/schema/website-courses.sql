-- =====================================================================
-- The website's course pages, read from the ERP's own courses.
--
-- computer-course.html lists every active course the head office marks
-- "Show on website"; course.html?c=<code> shows one of them with its
-- syllabus. A course added, re-priced or switched off in Academics is
-- what the website shows on the next page load -- no rebuild.
--
-- The anon key reaches courses only through the two functions below,
-- which hand out the public fields one by one. Nothing about branches,
-- students or fees beyond the advertised course fee leaves them.
--
-- Needs website-applications.sql (website_organization) and
-- course-syllabus.sql (course_modules, course_chapters). Safe to re-run.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. What the website needs that a course did not have.
-- ---------------------------------------------------------------------
alter table public.courses
  -- A photo for the course card, uploaded from Academics into the public
  -- `website` bucket (courses/...), or any https address.
  add column if not exists "image" text,
  -- Off keeps a course in the ERP (old batches, internal courses) but
  -- off the website.
  add column if not exists "showOnWebsite" boolean not null default true,
  -- A hand-written page about the course (e.g. tally-prime.html). Without
  -- one, the card opens the generic course.html?c=<code>.
  add column if not exists "websitePage" text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'courses_image_url_check') then
    alter table public.courses add constraint courses_image_url_check
      check ("image" is null or "image" ~ '^https://' or "image" ~ '^/[A-Za-z0-9_./-]+$');
  end if;
  if not exists (select 1 from pg_constraint where conname = 'courses_website_page_check') then
    alter table public.courses add constraint courses_website_page_check
      check ("websitePage" is null or "websitePage" ~ '^[a-z0-9_-]+\.html$');
  end if;
end $$;


-- ---------------------------------------------------------------------
-- 2. One course, as the website shows it. Shared by both functions so
--    the card and the detail page never disagree.
-- ---------------------------------------------------------------------
create or replace function public.website_course_json(c public.courses)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'id', c."id",
    'name', c."name",
    'code', c."code",
    'category', c."category"::text,
    'description', nullif(trim(coalesce(c."description", '')), ''),
    'durationValue', c."durationValue",
    'durationUnit', c."durationUnit"::text,
    'fee', c."baseFee",
    'image', nullif(trim(coalesce(c."image", '')), ''),
    'page', nullif(trim(coalesce(c."websitePage", '')), ''),
    'eligibility', nullif(trim(coalesce(c."eligibility", '')), ''),
    'certification', nullif(trim(coalesce(c."certification", '')), '')
  );
$$;
revoke all on function public.website_course_json(public.courses) from public, anon, authenticated;


-- ---------------------------------------------------------------------
-- 3. Every course on the website, for the course list.
-- ---------------------------------------------------------------------
create or replace function public.public_courses()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(public.website_course_json(c) order by c."category"::text, c."name"), '[]'::jsonb)
    from public.courses c
   where c."organizationId" = public.website_organization()
     and c."deletedAt" is null
     and coalesce(c."isActive", true)
     and coalesce(c."showOnWebsite", true);
$$;

revoke all on function public.public_courses() from public;
grant execute on function public.public_courses() to anon, authenticated;


-- ---------------------------------------------------------------------
-- 4. One course with its syllabus, for course.html?c=<code>. Looked up
--    by code (what the link carries), else by id. Null when no course on
--    the website matches.
-- ---------------------------------------------------------------------
create or replace function public.public_course(p_key text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_key     text := nullif(trim(coalesce(p_key, '')), '');
  c         public.courses%rowtype;
  v_modules jsonb := '[]'::jsonb;
begin
  if v_key is null then return null; end if;

  select * into c
    from public.courses x
   where x."organizationId" = public.website_organization()
     and (upper(x."code") = upper(v_key) or x."id" = v_key)
     and x."deletedAt" is null
     and coalesce(x."isActive", true)
     and coalesce(x."showOnWebsite", true)
   order by (upper(x."code") = upper(v_key)) desc
   limit 1;
  if not found then return null; end if;

  -- The syllabus tables arrive with course-syllabus.sql; a course page
  -- still opens without them.
  if to_regclass('public.course_modules') is not null and to_regclass('public.course_chapters') is not null then
    execute $q$
      select coalesce(jsonb_agg(jsonb_build_object(
               'name', m.name,
               'description', nullif(trim(coalesce(m.description, '')), ''),
               'chapters', coalesce((
                 select jsonb_agg(ch.name order by ch."sortOrder", ch."createdAt")
                   from public.course_chapters ch
                  where ch."moduleId" = m.id and ch."deletedAt" is null and ch.status = 'Active'), '[]'::jsonb))
             order by m."sortOrder", m."createdAt"), '[]'::jsonb)
        from public.course_modules m
       where m."courseId" = $1 and m."deletedAt" is null and m.status = 'Active'
    $q$ into v_modules using c."id";
  end if;

  return public.website_course_json(c) || jsonb_build_object('modules', v_modules);
end;
$$;

revoke all on function public.public_course(text) from public;
grant execute on function public.public_course(text) to anon, authenticated;

notify pgrst, 'reload schema';

-- Check: what the website will list.
select jsonb_array_length(public.public_courses()) as courses_on_website;
