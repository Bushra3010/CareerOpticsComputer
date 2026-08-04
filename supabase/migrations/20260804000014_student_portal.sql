-- 0014: student portal — link a student record to a login, and let that login
-- read its own data.
--
-- Until now `students` had no connection to auth.users at all: the system could
-- admit a student, take their attendance and collect their fees, but the
-- student could never sign in and see any of it.
--
-- app.is_current_student() has been wrong since migration 0003. It reads
--   select student = auth.uid();
-- which assumes a student's primary key IS their auth user id. students.id is
-- gen_random_uuid() and unrelated to auth.users, so the helper could never
-- return true. It was dead code — no policy referenced it — so nothing broke,
-- but anything wired to it would have silently denied every student. It is
-- redefined below to go through the new column.

alter table public.students
  add column user_id uuid unique references auth.users (id) on delete set null;

comment on column public.students.user_id is
  'Portal login for this student. Null until invited — a student record is '
  'valid without one, and deleting the auth user must not delete the student.';

create index students_user_id_idx on public.students (user_id) where user_id is not null;

-- The signed-in user's student record, or null if they are staff.
create or replace function app.current_student_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select s.id from public.students s where s.user_id = auth.uid();
$$;

create or replace function app.is_current_student(student uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.students s
    where s.id = student and s.user_id = auth.uid()
  );
$$;

grant execute on function app.current_student_id() to authenticated;
revoke execute on function app.current_student_id() from anon, public;

-- ---------------------------------------------------------------------------
-- Student read access.
--
-- These are additional PERMISSIVE policies, so they widen access for the
-- student without changing what staff can see. A student has no membership
-- row, so every existing staff policy already evaluates false for them.
--
-- Read-only throughout: a student never writes their own attendance, fees or
-- enrolment. There is deliberately no student UPDATE policy anywhere.
-- ---------------------------------------------------------------------------

create policy students_select_self on public.students
  for select to authenticated
  using (user_id = auth.uid());

create policy enrolments_select_self on public.enrolments
  for select to authenticated
  using (student_id = app.current_student_id());

-- A student sees a session only if they are enrolled in that centre+course.
create policy attendance_sessions_select_self on public.attendance_sessions
  for select to authenticated
  using (
    exists (
      select 1 from public.enrolments e
      where e.student_id = app.current_student_id()
        and e.centre_id = attendance_sessions.centre_id
        and e.course_id = attendance_sessions.course_id
    )
  );

create policy attendance_records_select_self on public.attendance_records
  for select to authenticated
  using (
    exists (
      select 1 from public.enrolments e
      where e.id = attendance_records.enrolment_id
        and e.student_id = app.current_student_id()
    )
  );

create policy fee_plans_select_self on public.fee_plans
  for select to authenticated
  using (
    exists (
      select 1 from public.enrolments e
      where e.id = fee_plans.enrolment_id
        and e.student_id = app.current_student_id()
    )
  );

create policy fee_instalments_select_self on public.fee_instalments
  for select to authenticated
  using (
    exists (
      select 1 from public.fee_plans p
      join public.enrolments e on e.id = p.enrolment_id
      where p.id = fee_instalments.fee_plan_id
        and e.student_id = app.current_student_id()
    )
  );

create policy payments_select_self on public.payments
  for select to authenticated
  using (student_id = app.current_student_id());

create policy payment_allocations_select_self on public.payment_allocations
  for select to authenticated
  using (
    exists (
      select 1 from public.payments p
      where p.id = payment_allocations.payment_id
        and p.student_id = app.current_student_id()
    )
  );

-- ---------------------------------------------------------------------------
-- Linking an invited login to its student record.
--
-- The invitation itself goes through the Auth Admin API on the service-role
-- client (as centre approval does). This function performs only the link, and
-- refuses to move a login onto a student that already has one, so an invite
-- replayed twice cannot silently reassign a portal account.
-- ---------------------------------------------------------------------------
create or replace function public.link_student_login(
  p_student_id uuid,
  p_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_existing uuid;
  v_org uuid;
  v_centre uuid;
begin
  select user_id, organization_id, centre_id
    into v_existing, v_org, v_centre
  from public.students where id = p_student_id;

  if v_org is null then
    raise exception 'Student not found';
  end if;

  if auth.role() <> 'service_role'
     and not (app.is_platform_admin()
              or (app.has_permission('student.create', v_org, v_centre)
                  and app.can_access_centre(v_centre))) then
    raise exception 'Not permitted to invite this student';
  end if;

  if v_existing is not null and v_existing <> p_user_id then
    raise exception 'This student already has a portal login';
  end if;

  update public.students set user_id = p_user_id where id = p_student_id;
end;
$$;

grant execute on function public.link_student_login(uuid, uuid) to authenticated, service_role;
revoke execute on function public.link_student_login(uuid, uuid) from anon, public;
