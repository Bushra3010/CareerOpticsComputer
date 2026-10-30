-- Give the academic session somewhere to live.
--
-- Session Management looked like a working screen and was not one: both pages
-- held a hardcoded array in React state, so an add, an edit or a delete changed
-- the list on screen, toasted "success", and was gone on the next render. There
-- was no table behind it at all -- `session_years` did not exist, and neither
-- does any session model in the Prisma schema.
--
-- The session is not just a list to maintain. `students.academicYear` is the
-- column an admission writes, and an admission dated outside the session it
-- claims is the kind of wrong that only surfaces a year later when someone runs
-- a report. Storing the session's real start and end dates is what lets the
-- admission form check that.
--
-- Run once in the Supabase SQL editor. Safe to re-run.


-- ---------------------------------------------------------------------
-- 1. The table.
--
--    `startDate`/`endDate` are the single source of truth for the year: a
--    separate startYear/endYear pair, which is what the mock form collected,
--    can contradict the dates it sits beside. The years shown on screen are
--    derived from these two columns instead.
--
--    Unlike the tables generated from Prisma, `id` and `updatedAt` carry real
--    database defaults, so a PostgREST insert that omits them succeeds.
-- ---------------------------------------------------------------------
create table if not exists public.session_years (
  id               text primary key default gen_random_uuid()::text,
  "organizationId" text references public.organizations(id) on delete cascade,
  name             text not null,
  "startDate"      date not null,
  "endDate"        date not null,
  status           text not null default 'ACTIVE',
  -- Which session new admissions default to. Separate from `status`, because
  -- next year's session is ACTIVE and open for enrolment long before it
  -- becomes the one the office is working in.
  "isCurrent"      boolean not null default false,
  description      text,
  "createdAt"      timestamptz not null default now(),
  "updatedAt"      timestamptz not null default now(),
  "deletedAt"      timestamptz,
  constraint session_years_status_check
    check (status in ('ACTIVE', 'UPCOMING', 'CLOSED')),
  -- A session that ends before it starts would make every date check below
  -- vacuous, and the admission form reads this range to bound its date box.
  constraint session_years_dates_check check ("endDate" > "startDate")
);

create index if not exists "session_years_organizationId_idx"
  on public.session_years ("organizationId");

-- One current session per institute, enforced here rather than in the browser:
-- the admission form picks a default from this flag, and two rows claiming it
-- would make that default arbitrary. `setCurrentSessionYear` clears the old one
-- before setting the new one to stay inside this index.
create unique index if not exists "session_years_one_current_idx"
  on public.session_years ("organizationId")
  where "isCurrent" and "deletedAt" is null;


-- ---------------------------------------------------------------------
-- 2. Who may read and write a session.
--
--    The academic calendar belongs to the institute, so an org admin owns it
--    and every other signed-in account at that institute reads it -- a branch
--    admin filing an admission has to see the session that admission falls in,
--    but must not be able to move its dates underneath head office.
--
--    SUPER_ADMIN is listed separately for the same reason as in
--    user-management.sql: that account often carries no organizationId, and
--    `null = null` is NULL rather than true.
-- ---------------------------------------------------------------------
alter table public.session_years enable row level security;

drop policy if exists "Read own organisation sessions" on public.session_years;
drop policy if exists "Write own organisation sessions" on public.session_years;

create policy "Read own organisation sessions" on public.session_years
  for select to authenticated
  using (
    public.jwt_role() = 'SUPER_ADMIN'
    or "organizationId" = public.jwt_org_id()
  );

create policy "Write own organisation sessions" on public.session_years
  for all to authenticated
  using (
    public.jwt_role() = 'SUPER_ADMIN'
    or (public.is_org_admin() and "organizationId" = public.jwt_org_id())
  )
  with check (
    public.jwt_role() = 'SUPER_ADMIN'
    or (public.is_org_admin() and "organizationId" = public.jwt_org_id())
  );


-- ---------------------------------------------------------------------
-- 3. Seed the sessions the institute is actually in.
--
--    An empty table would leave the admission form with nothing to offer, and
--    it falls back to free text when there are no sessions -- which is the old
--    behaviour, not the fixed one. April-to-March, the Indian academic year.
--
--    Only runs when the table is empty, so re-running cannot duplicate or
--    resurrect a session somebody has since deleted.
-- ---------------------------------------------------------------------
insert into public.session_years ("organizationId", name, "startDate", "endDate", status, "isCurrent", description)
select o.id,
       'Session ' || y.start_year || '-' || (y.start_year + 1),
       make_date(y.start_year, 4, 1),
       make_date(y.start_year + 1, 3, 31),
       case when y.ahead = 0 then 'ACTIVE' else 'UPCOMING' end,
       y.ahead = 0,
       'Seeded by session-years.sql'
  from public.organizations o
 cross join (
        -- The session containing today, then the next one. Before April the
        -- current session is the one that started last calendar year.
        select 0 as ahead,
               case when extract(month from current_date) >= 4
                    then extract(year from current_date)::int
                    else extract(year from current_date)::int - 1
               end as start_year
         union all
        select 1,
               case when extract(month from current_date) >= 4
                    then extract(year from current_date)::int + 1
                    else extract(year from current_date)::int
               end
       ) y
 where not exists (select 1 from public.session_years);


-- ---------------------------------------------------------------------
-- 4. Check what is in place now.
-- ---------------------------------------------------------------------
select name, "startDate", "endDate", status, "isCurrent"
from public.session_years
order by "startDate" desc;

select policyname, cmd from pg_policies
where schemaname = 'public' and tablename = 'session_years';
