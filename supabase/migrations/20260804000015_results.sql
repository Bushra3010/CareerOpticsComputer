-- 0015: results — enter marks against an enrolment, publish them as an
-- immutable version, and let the student see only what is published.
--
-- Deliberately simplified, and the simplification is stated so nobody assumes
-- otherwise: the build plan derives results from exams (question banks,
-- attempts, evaluation). None of that exists yet. Here a result is marks
-- recorded directly against an enrolment — the same shape the exam pipeline
-- will eventually feed, so student_results does not have to change when it
-- lands.
--
-- Marks are integers, for the same reason money is integer paise: a
-- percentage held as a float makes "did this student pass?" depend on binary
-- rounding. The outcome is decided with integer arithmetic
-- (obtained * 100 >= pass_percent * max) and never by comparing floats.

create type public.result_outcome as enum ('fail', 'pass', 'distinction');

-- Assumption A14: pass 40%, distinction 75%, overridable per course.
alter table public.courses
  add column pass_percent int not null default 40
    check (pass_percent between 0 and 100),
  add column distinction_percent int not null default 75
    check (distinction_percent between 0 and 100),
  add constraint courses_distinction_above_pass
    check (distinction_percent >= pass_percent);

-- A publication is a batch of results for one course at one centre for one
-- term. Publishing is one-way; a correction is a new version, never an edit,
-- so a result a student has already seen can never silently change.
create table public.result_publications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  centre_id uuid not null references public.centres (id),
  course_id uuid not null references public.courses (id),
  term_label text not null,
  version int not null default 1,
  published_at timestamptz,
  published_by uuid,
  created_at timestamptz not null default now(),
  created_by uuid
);

create unique index result_publications_unique_version_idx
  on public.result_publications (centre_id, course_id, term_label, version);

-- At most one draft per centre+course+term: without this, two staff members
-- each start a draft and half the marks land in each.
create unique index result_publications_single_draft_idx
  on public.result_publications (centre_id, course_id, term_label)
  where published_at is null;

create table public.student_results (
  id uuid primary key default gen_random_uuid(),
  publication_id uuid not null references public.result_publications (id) on delete cascade,
  enrolment_id uuid not null references public.enrolments (id),
  max_marks int not null check (max_marks > 0),
  obtained_marks int not null check (obtained_marks >= 0),
  outcome public.result_outcome not null,
  created_at timestamptz not null default now(),
  constraint student_results_marks_within_max check (obtained_marks <= max_marks)
);

create unique index student_results_unique_idx
  on public.student_results (publication_id, enrolment_id);

alter table public.result_publications enable row level security;
alter table public.result_publications force row level security;
alter table public.student_results enable row level security;
alter table public.student_results force row level security;

create policy result_publications_staff_select on public.result_publications
  for select to authenticated
  using (
    app.is_platform_admin()
    or (app.has_permission('result.read', organization_id, centre_id)
        and app.can_access_centre(centre_id))
  );

create policy result_publications_staff_write on public.result_publications
  for all to authenticated
  using (
    app.has_permission('result.manage', organization_id, centre_id)
    and app.can_access_centre(centre_id)
  )
  with check (
    app.has_permission('result.manage', organization_id, centre_id)
    and app.can_access_centre(centre_id)
    and app.centre_is_operational(centre_id)
  );

create policy student_results_staff_select on public.student_results
  for select to authenticated
  using (
    exists (
      select 1 from public.result_publications p
      where p.id = publication_id
        and (app.is_platform_admin()
             or (app.has_permission('result.read', p.organization_id, p.centre_id)
                 and app.can_access_centre(p.centre_id)))
    )
  );

-- Marks may only be written while the publication is still a draft. This is
-- the invariant that makes a published result trustworthy, and it is enforced
-- here rather than only in the RPC so a direct PostgREST write cannot dodge it.
create policy student_results_staff_write on public.student_results
  for all to authenticated
  using (
    exists (
      select 1 from public.result_publications p
      where p.id = publication_id
        and p.published_at is null
        and app.has_permission('result.manage', p.organization_id, p.centre_id)
        and app.can_access_centre(p.centre_id)
    )
  )
  with check (
    exists (
      select 1 from public.result_publications p
      where p.id = publication_id
        and p.published_at is null
        and app.has_permission('result.manage', p.organization_id, p.centre_id)
        and app.can_access_centre(p.centre_id)
    )
  );

-- The student sees a publication only once it is published, and only their own
-- result inside it. An unpublished mark is invisible, which is the whole point
-- of having a draft state.
create policy result_publications_select_self on public.result_publications
  for select to authenticated
  using (
    published_at is not null
    and exists (
      select 1 from public.enrolments e
      where e.student_id = app.current_student_id()
        and e.centre_id = result_publications.centre_id
        and e.course_id = result_publications.course_id
    )
  );

create policy student_results_select_self on public.student_results
  for select to authenticated
  using (
    exists (
      select 1
      from public.result_publications p
      join public.enrolments e on e.id = student_results.enrolment_id
      where p.id = student_results.publication_id
        and p.published_at is not null
        and e.student_id = app.current_student_id()
    )
  );

-- Records or corrects one student's marks in a draft publication. Computes the
-- outcome from the course's own thresholds with integer arithmetic. SECURITY
-- INVOKER, so the draft-only policy above applies to this path too.
create or replace function public.record_student_result(
  p_publication_id uuid,
  p_enrolment_id uuid,
  p_max_marks int,
  p_obtained_marks int
)
returns public.result_outcome
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_pass int;
  v_distinction int;
  v_outcome public.result_outcome;
begin
  if p_max_marks <= 0 then
    raise exception 'Maximum marks must be greater than zero';
  end if;
  if p_obtained_marks < 0 or p_obtained_marks > p_max_marks then
    raise exception 'Obtained marks must be between 0 and the maximum';
  end if;

  -- The enrolment must belong to the same centre and course as the
  -- publication; the ids are two independent caller-supplied arguments.
  select c.pass_percent, c.distinction_percent
    into v_pass, v_distinction
  from public.result_publications p
  join public.courses c on c.id = p.course_id
  join public.enrolments e
    on e.id = p_enrolment_id
   and e.centre_id = p.centre_id
   and e.course_id = p.course_id
  where p.id = p_publication_id;

  if v_pass is null then
    raise exception 'Enrolment does not belong to this publication';
  end if;

  -- Integer comparison: never percentage-as-float.
  v_outcome := case
    when p_obtained_marks * 100 >= v_distinction * p_max_marks then 'distinction'
    when p_obtained_marks * 100 >= v_pass * p_max_marks then 'pass'
    else 'fail'
  end::public.result_outcome;

  insert into public.student_results (
    publication_id, enrolment_id, max_marks, obtained_marks, outcome
  )
  values (p_publication_id, p_enrolment_id, p_max_marks, p_obtained_marks, v_outcome)
  on conflict (publication_id, enrolment_id) do update
    set max_marks = excluded.max_marks,
        obtained_marks = excluded.obtained_marks,
        outcome = excluded.outcome;

  return v_outcome;
end;
$$;

grant execute on function public.record_student_result(uuid, uuid, int, int) to authenticated;
revoke execute on function public.record_student_result(uuid, uuid, int, int) from anon, public;

-- Publishing is one-way and refuses an empty publication — publishing nothing
-- would leave students staring at a result page with no result in it.
create or replace function public.publish_results(p_publication_id uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_published timestamptz;
  v_count int;
begin
  select published_at into v_published
  from public.result_publications where id = p_publication_id;

  if not found then
    raise exception 'Publication not found';
  end if;
  if v_published is not null then
    raise exception 'These results are already published';
  end if;

  select count(*) into v_count
  from public.student_results where publication_id = p_publication_id;

  if v_count = 0 then
    raise exception 'Cannot publish a result set with no marks in it';
  end if;

  update public.result_publications
  set published_at = now(), published_by = auth.uid()
  where id = p_publication_id;
end;
$$;

grant execute on function public.publish_results(uuid) to authenticated;
revoke execute on function public.publish_results(uuid) from anon, public;
