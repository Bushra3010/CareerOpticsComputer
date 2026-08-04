-- 0010: attendance — session-based, scoped to centre + course + date.
-- Batches/timetables (build plan §3, 0007_attendance) are still deferred (see
-- migration 0009's note); a session groups all active enrolments in a course
-- at a centre for one date instead of a scheduled batch slot.

create table public.attendance_sessions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  centre_id uuid not null references public.centres (id),
  course_id uuid not null references public.courses (id),
  session_date date not null,
  created_at timestamptz not null default now(),
  created_by uuid
);

create unique index attendance_sessions_unique_idx
  on public.attendance_sessions (centre_id, course_id, session_date);

-- No default on `status` and no row means "unmarked" — the absence of a row
-- IS the unmarked state (PRD §6.4.3), not a status value.
create table public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.attendance_sessions (id) on delete cascade,
  enrolment_id uuid not null references public.enrolments (id),
  status public.attendance_status not null,
  marked_by uuid,
  marked_at timestamptz not null default now()
);

create unique index attendance_records_unique_idx
  on public.attendance_records (session_id, enrolment_id);

alter table public.attendance_sessions enable row level security;
alter table public.attendance_sessions force row level security;
alter table public.attendance_records enable row level security;
alter table public.attendance_records force row level security;

create policy attendance_sessions_select on public.attendance_sessions for select to authenticated
using (
  app.is_platform_admin()
  or (app.has_permission('attendance.read', organization_id, centre_id)
      and app.can_access_centre(centre_id))
);

create policy attendance_sessions_insert on public.attendance_sessions for insert to authenticated
with check (
  app.has_permission('attendance.create', organization_id, centre_id)
  and app.can_access_centre(centre_id)
  and app.centre_is_operational(centre_id)
);

-- attendance_records has no organization_id/centre_id of its own; scope
-- through its session the same way memberships-derived checks scope through
-- a parent row elsewhere in this schema.
create policy attendance_records_select on public.attendance_records for select to authenticated
using (
  exists (
    select 1 from public.attendance_sessions s
    where s.id = session_id
      and (app.is_platform_admin()
           or (app.has_permission('attendance.read', s.organization_id, s.centre_id)
               and app.can_access_centre(s.centre_id)))
  )
);

create policy attendance_records_insert on public.attendance_records for insert to authenticated
with check (
  exists (
    select 1 from public.attendance_sessions s
    where s.id = session_id
      and app.has_permission('attendance.create', s.organization_id, s.centre_id)
      and app.can_access_centre(s.centre_id)
      and app.centre_is_operational(s.centre_id)
  )
);

create policy attendance_records_update on public.attendance_records for update to authenticated
using (
  exists (
    select 1 from public.attendance_sessions s
    where s.id = session_id
      and app.has_permission('attendance.create', s.organization_id, s.centre_id)
      and app.can_access_centre(s.centre_id)
  )
)
with check (
  exists (
    select 1 from public.attendance_sessions s
    where s.id = session_id
      and app.has_permission('attendance.create', s.organization_id, s.centre_id)
      and app.can_access_centre(s.centre_id)
  )
);

-- Corrections (build plan R08/attendance.correct in the permission matrix)
-- are a later feature; for now the same role that can mark attendance can
-- also fix same-day mistakes via this update policy.
