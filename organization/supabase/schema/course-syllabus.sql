-- Give a course's syllabus somewhere to live.
--
-- A course carries a name, a duration and a fee, and nothing about what is
-- actually taught on it. `courses.syllabus` is a jsonb column that nothing
-- reads or writes -- a single blob cannot be ordered, filtered, or have one
-- chapter edited without rewriting the rest of it, which is why the Syllabus
-- screen needs rows rather than a document.
--
-- Two tables, because that is how a syllabus is read: modules are the sections
-- of the course, and chapters are what is taught inside a section.
--
-- Run once in the Supabase SQL editor. Safe to re-run.


-- ---------------------------------------------------------------------
-- 1. Modules -- the sections of a course.
--
--    `sortOrder`, not `order`: `order` is reserved in SQL and has to be
--    quoted everywhere it appears, including in every PostgREST query the
--    browser sends.
--
--    Unlike the tables generated from Prisma, `id` and `updatedAt` carry real
--    database defaults, so a PostgREST insert that omits them succeeds.
-- ---------------------------------------------------------------------
create table if not exists public.course_modules (
  id            text primary key default gen_random_uuid()::text,
  "courseId"    text not null references public.courses(id) on delete cascade,
  name          text not null,
  description   text,
  "sortOrder"   integer not null default 1,
  status        text not null default 'Active',
  "createdAt"   timestamptz not null default now(),
  "updatedAt"   timestamptz not null default now(),
  "deletedAt"   timestamptz,
  constraint course_modules_status_check check (status in ('Active', 'Inactive'))
);

create index if not exists "course_modules_courseId_idx"
  on public.course_modules ("courseId");


-- ---------------------------------------------------------------------
-- 2. Chapters -- what is taught inside a module.
--
--    `courseId` is carried here as well as on the module. It is redundant, and
--    it is what lets the screen count a course's chapters and search them
--    without walking every module first; the cascade below keeps the two from
--    drifting apart.
-- ---------------------------------------------------------------------
create table if not exists public.course_chapters (
  id            text primary key default gen_random_uuid()::text,
  "moduleId"    text not null references public.course_modules(id) on delete cascade,
  "courseId"    text not null references public.courses(id) on delete cascade,
  name          text not null,
  description   text,
  -- The practical assignment set against the chapter, kept apart from the
  -- description because it is what the student is asked to do, not read.
  practical     text,
  "pdfUrl"      text,
  "videoUrl"    text,
  "sortOrder"   integer not null default 1,
  status        text not null default 'Active',
  "createdAt"   timestamptz not null default now(),
  "updatedAt"   timestamptz not null default now(),
  "deletedAt"   timestamptz,
  constraint course_chapters_status_check check (status in ('Active', 'Inactive'))
);

create index if not exists "course_chapters_moduleId_idx"
  on public.course_chapters ("moduleId");
create index if not exists "course_chapters_courseId_idx"
  on public.course_chapters ("courseId");


-- ---------------------------------------------------------------------
-- 3. Who may read and write a syllabus.
--
--    The same line the catalogue itself draws: the organisation owns what is
--    taught, and every account at that institute reads it -- a branch has to
--    see the syllabus of a course it runs, and must not be able to rewrite it.
--
--    Neither table carries an organizationId of its own, so the check goes
--    through the course. SUPER_ADMIN is listed separately for the reason
--    user-management.sql gives: that account often carries no organizationId,
--    and `null = null` is NULL rather than true.
-- ---------------------------------------------------------------------
alter table public.course_modules  enable row level security;
alter table public.course_chapters enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array['course_modules', 'course_chapters'] loop
    execute format('drop policy if exists "Read own organisation syllabus" on public.%I', t);
    execute format('drop policy if exists "Write own organisation syllabus" on public.%I', t);

    execute format($f$
      create policy "Read own organisation syllabus" on public.%I
        for select to authenticated
        using (
          public.jwt_role() = 'SUPER_ADMIN'
          or exists (
               select 1 from public.courses c
                where c.id = "courseId"
                  and c."organizationId" = public.jwt_org_id()
             )
        )
    $f$, t);

    execute format($f$
      create policy "Write own organisation syllabus" on public.%I
        for all to authenticated
        using (
          public.jwt_role() = 'SUPER_ADMIN'
          or (public.is_org_admin() and exists (
                select 1 from public.courses c
                 where c.id = "courseId"
                   and c."organizationId" = public.jwt_org_id()
              ))
        )
        with check (
          public.jwt_role() = 'SUPER_ADMIN'
          or (public.is_org_admin() and exists (
                select 1 from public.courses c
                 where c.id = "courseId"
                   and c."organizationId" = public.jwt_org_id()
              ))
        )
    $f$, t);
  end loop;
end $$;


-- ---------------------------------------------------------------------
-- 4. Check what is in place now.
-- ---------------------------------------------------------------------
select tablename, policyname, cmd from pg_policies
 where schemaname = 'public'
   and tablename in ('course_modules', 'course_chapters')
 order by tablename, policyname;
