-- 0009: students and enrolments — the centre portal's core admission flow
-- (build plan §3, "0006_crm_students" subset). Batches/timetables and
-- document upload are deferred; an enrolment pins course_id directly here
-- since course_versions don't exist yet (plan's eventual course_version_id).

create table public.students (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  centre_id uuid not null references public.centres (id),
  registration_number text not null,
  full_name text not null,
  date_of_birth date,
  gender text,
  guardian_name text,
  phone text not null,
  email text,
  address text,
  gov_id_last4 text,
  gov_id_hmac text,
  status public.enrolment_status not null default 'active',
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid
);

create unique index students_org_registration_number_idx
  on public.students (organization_id, registration_number);

create index students_centre_id_status_idx on public.students (centre_id, status);
create index students_full_name_trgm_idx on public.students using gin (full_name gin_trgm_ops);

create trigger set_updated_at
  before update on public.students
  for each row execute function app.set_updated_at();

create table public.enrolments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  centre_id uuid not null references public.centres (id),
  student_id uuid not null references public.students (id),
  course_id uuid not null references public.courses (id),
  status public.enrolment_status not null default 'active',
  enrolled_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index enrolments_student_id_idx on public.enrolments (student_id);
create index enrolments_centre_id_status_idx on public.enrolments (centre_id, status);

create trigger set_updated_at
  before update on public.enrolments
  for each row execute function app.set_updated_at();

alter table public.students enable row level security;
alter table public.students force row level security;
alter table public.enrolments enable row level security;
alter table public.enrolments force row level security;

create policy students_select on public.students for select to authenticated
using (
  app.is_platform_admin()
  or (app.has_permission('student.read', organization_id, centre_id)
      and app.can_access_centre(centre_id))
);

create policy students_insert on public.students for insert to authenticated
with check (
  app.has_permission('student.create', organization_id, centre_id)
  and app.can_access_centre(centre_id)
  and app.centre_is_operational(centre_id)
);

create policy students_update on public.students for update to authenticated
using (
  app.has_permission('student.read', organization_id, centre_id)
  and app.can_access_centre(centre_id)
)
with check (
  app.has_permission('student.create', organization_id, centre_id)
  and app.can_access_centre(centre_id)
);

create policy enrolments_select on public.enrolments for select to authenticated
using (
  app.is_platform_admin()
  or (app.has_permission('student.read', organization_id, centre_id)
      and app.can_access_centre(centre_id))
);

create policy enrolments_insert on public.enrolments for insert to authenticated
with check (
  app.has_permission('student.create', organization_id, centre_id)
  and app.can_access_centre(centre_id)
  and app.centre_is_operational(centre_id)
);

-- Registration number generation + student+enrolment creation in one
-- transaction, so a half-created admission (student row with no enrolment,
-- or vice versa) can't happen. Authorisation is still checked twice: this
-- function runs as the caller's own privileges (not SECURITY DEFINER) so
-- the students_insert/enrolments_insert RLS policies apply normally, and
-- authorize() in the server action is the readable-error layer.
create or replace function public.admit_student(
  p_organization_id uuid,
  p_centre_id uuid,
  p_course_id uuid,
  p_full_name text,
  p_phone text,
  p_email text,
  p_date_of_birth date,
  p_gender text,
  p_guardian_name text,
  p_address text
)
returns table (student_id uuid, registration_number text)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_reg_number text;
  v_student_id uuid;
  v_year text := to_char(now(), 'YY');
  v_centre_code text;
begin
  select code into v_centre_code from public.centres where id = p_centre_id;

  v_reg_number := v_centre_code || '-' || v_year || '-' ||
    lpad(app.next_document_number(p_organization_id, p_centre_id, 'registration', v_year)::text, 5, '0');

  insert into public.students (
    organization_id, centre_id, registration_number, full_name, phone, email,
    date_of_birth, gender, guardian_name, address
  )
  values (
    p_organization_id, p_centre_id, v_reg_number, p_full_name, p_phone, p_email,
    p_date_of_birth, p_gender, p_guardian_name, p_address
  )
  returning id into v_student_id;

  insert into public.enrolments (organization_id, centre_id, student_id, course_id)
  values (p_organization_id, p_centre_id, v_student_id, p_course_id);

  return query select v_student_id, v_reg_number;
end;
$$;

grant execute on function public.admit_student(
  uuid, uuid, uuid, text, text, text, date, text, text, text
) to authenticated;
