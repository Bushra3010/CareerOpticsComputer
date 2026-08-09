-- 0046: batches and timetable — PRD §10.6's `batches` (centre, offering,
-- code, faculty, capacity, dates, status) and `batch_schedules` (batch,
-- weekday/date rule, start/end time, room, faculty), plus the `batch`
-- column its `enrolments` row has always specified. Named in both nav
-- trees since Phase 1 with nothing behind them.
--
-- `offering` in the ERD has no table: course offerings were never built,
-- and `enrolments` has referenced `course_id` directly since 0007. A batch
-- follows that precedent rather than inventing the missing layer.
--
-- Faculty deliberately hold NO batch permission code. The matrix gives them
-- "read (own)", and a centre-scoped grant would mean "read all", so their
-- access is the explicit `faculty_id = auth.uid()` arm on the policies
-- below. That arm is live now; the faculty-facing timetable screen that
-- uses it is the next slice.
--
-- Attendance is NOT retrofitted onto batches. The ERD scopes
-- `attendance_sessions` to a batch, but 0011 shipped it as
-- (centre, course, date) and it is exercised by the integration suite;
-- rewriting that is a data migration for every existing session, and PRD
-- §6.4's flow ("faculty chooses date, batch and scheduled session") is a
-- product decision about what happens to sessions with no batch. Recorded
-- as C15 rather than half-done here.

create table public.batches (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  centre_id uuid not null references public.centres (id),
  course_id uuid not null references public.courses (id),
  code text not null,
  name text not null,
  -- The assigned teacher: an auth user with a membership at this centre.
  -- Not an FK to memberships, because a membership can be replaced (role
  -- change) without the teaching assignment changing.
  faculty_id uuid,
  capacity int check (capacity is null or capacity > 0),
  room text,
  start_date date not null,
  end_date date,
  status public.catalog_item_status not null default 'draft',
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  constraint batches_dates_ordered check (end_date is null or end_date >= start_date)
);

create unique index batches_centre_code_idx on public.batches (centre_id, code);
create index batches_centre_status_idx on public.batches (centre_id, status);
create index batches_faculty_idx on public.batches (faculty_id) where faculty_id is not null;

create table public.batch_schedules (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.batches (id) on delete cascade,
  -- 0 = Sunday, matching Postgres `extract(dow ...)` and JS getDay(), so a
  -- weekday never needs translating between the two.
  weekday int not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null,
  room text,
  -- Overrides the batch's faculty for this slot only; null means "the
  -- batch's own faculty", so a substitution is one row, not a second batch.
  faculty_id uuid,
  created_at timestamptz not null default now(),
  constraint batch_schedules_times_ordered check (end_time > start_time)
);

create index batch_schedules_batch_idx on public.batch_schedules (batch_id, weekday);
-- The same batch cannot be timetabled twice at the same moment. Overlapping
-- (rather than identical) slots are left to the UI: an exclusion constraint
-- over timeranges is possible but would also forbid a legitimate
-- back-to-back slot recorded as 10:00-11:00 and 11:00-12:00 if either time
-- were ever stored inclusively.
create unique index batch_schedules_no_duplicate_idx
  on public.batch_schedules (batch_id, weekday, start_time);

alter table public.enrolments
  add column batch_id uuid references public.batches (id);

create index enrolments_batch_idx on public.enrolments (batch_id) where batch_id is not null;

create trigger set_updated_at
  before update on public.batches
  for each row execute function app.set_updated_at();

create trigger audit_changes
  after insert or update or delete on public.batches
  for each row execute function app.audit_trigger();

-- Capacity is an invariant across rows, so it cannot live in a CHECK.
-- SECURITY DEFINER is not needed: this runs as the caller, and the count
-- is over rows the caller has already been allowed to write.
create function app.enforce_batch_capacity()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_capacity int;
  v_taken int;
  v_batch_centre uuid;
begin
  if new.batch_id is null then
    return new;
  end if;
  if tg_op = 'UPDATE' and new.batch_id is not distinct from old.batch_id then
    return new;
  end if;

  select capacity, centre_id into v_capacity, v_batch_centre
  from public.batches where id = new.batch_id;

  if v_batch_centre is null then
    raise exception 'Batch not found' using errcode = 'no_data_found';
  end if;
  if v_batch_centre <> new.centre_id then
    raise exception 'A student cannot join a batch at another centre'
      using errcode = 'invalid_parameter_value';
  end if;

  if v_capacity is not null then
    select count(*) into v_taken
    from public.enrolments
    where batch_id = new.batch_id and status = 'active' and id <> new.id;

    if v_taken >= v_capacity then
      raise exception 'This batch is full (% of % places taken)', v_taken, v_capacity
        using errcode = 'check_violation';
    end if;
  end if;

  return new;
end;
$$;

create trigger enforce_batch_capacity
  before insert or update on public.enrolments
  for each row execute function app.enforce_batch_capacity();

alter table public.batches enable row level security;
alter table public.batches force row level security;
alter table public.batch_schedules enable row level security;
alter table public.batch_schedules force row level security;

insert into public.permissions (code, description) values
  ('batch.read',   'View a centre''s batches and their timetable'),
  ('batch.manage', 'Create and edit batches, timetable slots and batch placement')
on conflict (code) do nothing;

-- Matrix `batch.* / timetable.*`: Centre Owner and Manager "all (own)",
-- Counsellor "read", HO Operator "all" (org-wide). Faculty and Student are
-- served by the explicit arms in the policies, not by a grant.
insert into public.role_permissions (role_id, permission_code)
select r.id, v.code
from (values
  ('centre_owner',   'batch.read'),
  ('centre_owner',   'batch.manage'),
  ('centre_manager', 'batch.read'),
  ('centre_manager', 'batch.manage'),
  ('counsellor',     'batch.read'),
  ('ho_operator',    'batch.read'),
  ('ho_operator',    'batch.manage')
) as v(role_code, code)
join public.roles r on r.code = v.role_code
on conflict do nothing;

create policy batches_select on public.batches
  for select to authenticated
  using (
    app.is_platform_admin()
    or app.has_permission('batch.read', organization_id)
    or (app.has_permission('batch.read', organization_id, centre_id)
        and app.can_access_centre(centre_id))
    or faculty_id = auth.uid()
    or exists (
      select 1 from public.enrolments e
      where e.batch_id = public.batches.id
        and e.student_id = app.current_student_id()
    )
  );

create policy batches_manage on public.batches
  for all to authenticated
  using (
    app.is_platform_admin()
    or app.has_permission('batch.manage', organization_id)
    or (app.has_permission('batch.manage', organization_id, centre_id)
        and app.can_access_centre(centre_id))
  )
  with check (
    app.is_platform_admin()
    or app.has_permission('batch.manage', organization_id)
    or (app.has_permission('batch.manage', organization_id, centre_id)
        and app.can_access_centre(centre_id))
  );

-- Schedules inherit their batch's visibility exactly — one place decides
-- who may see a batch, and the timetable follows it.
create policy batch_schedules_select on public.batch_schedules
  for select to authenticated
  using (
    exists (select 1 from public.batches b where b.id = batch_id)
  );

create policy batch_schedules_manage on public.batch_schedules
  for all to authenticated
  using (
    exists (
      select 1 from public.batches b
      where b.id = batch_id
        and (
          app.is_platform_admin()
          or app.has_permission('batch.manage', b.organization_id)
          or (app.has_permission('batch.manage', b.organization_id, b.centre_id)
              and app.can_access_centre(b.centre_id))
        )
    )
  )
  with check (
    exists (
      select 1 from public.batches b
      where b.id = batch_id
        and (
          app.is_platform_admin()
          or app.has_permission('batch.manage', b.organization_id)
          or (app.has_permission('batch.manage', b.organization_id, b.centre_id)
              and app.can_access_centre(b.centre_id))
        )
    )
  );
