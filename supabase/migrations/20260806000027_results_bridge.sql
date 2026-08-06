-- 0027: the results bridge — a graded attempt becomes a recorded result.
--
-- This closes C7 by DOCUMENTED ASSUMPTION, option A: migration 0015's shape
-- stands. A publication is scoped to (centre, course, term), results are keyed
-- to an enrolment, and an exam attempt FEEDS that pipeline rather than
-- replacing it. Three exams in a term contribute to one publication. The owner
-- approved proceeding on this basis; it is recorded in docs/02-open-conflicts.md
-- with the reasoning that A is the reversible choice — B (per-exam
-- publications) remains buildable later, whereas splitting the pipeline now
-- could not be unsplit.
--
-- Riders, decided with it:
--   * student_results gains attempt_id — nullable, because 0015-era rows and
--     manually recorded marks have no attempt. Traceability, not a new key.
--   * percentage, grade and rank stay out. Percentage is deliberately not
--     stored (0015 compares in integers); grade has no bands from the owner
--     (PRD §21.9); rank goes stale the moment any mark is corrected.

alter table public.student_results
  add column attempt_id uuid references public.exam_attempts (id);

-- ---------------------------------------------------------------------------
-- import_attempt_results: pull graded attempts into a draft publication.
--
-- SECURITY DEFINER, unlike record_student_result, because it must also flip
-- each attempt to 'evaluated' — and UPDATE on exam_attempts is revoked from
-- `authenticated` at the privilege level (migration 0024). The permission is
-- checked explicitly instead: result.manage at the publication's centre, the
-- same capability that gates manual mark entry, because importing marks IS
-- mark entry with a better source.
--
-- Which attempt counts when a student has several: the LATEST graded one.
-- A retake exists because somebody allowed it (exams.max_attempts), and a
-- sitting that was allowed supersedes the one before it. This is an
-- assumption in C8's territory; it is one UPDATE to change, and a correction
-- after publish is a new version by 0015's design either way.
--
-- Idempotent: re-running refreshes marks through the same upsert
-- record_student_result uses, so importing, letting a late attempt finish,
-- and importing again does what it looks like it does.
-- ---------------------------------------------------------------------------
create function public.import_attempt_results(p_publication_id uuid)
returns int
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_pub record;
  v_pass int;
  v_distinction int;
  r record;
  v_outcome public.result_outcome;
  n int := 0;
begin
  select p.*, c.pass_percent, c.distinction_percent
    into v_pub
  from public.result_publications p
  join public.courses c on c.id = p.course_id
  where p.id = p_publication_id;

  if v_pub.id is null then
    raise exception 'Publication not found' using errcode = 'no_data_found';
  end if;

  if not (app.is_platform_admin()
          or app.has_permission('result.manage', v_pub.organization_id, v_pub.centre_id)) then
    raise exception 'Not authorised to record results for this centre'
      using errcode = 'insufficient_privilege';
  end if;

  if v_pub.published_at is not null then
    raise exception 'This publication is already published — corrections are a new version'
      using errcode = 'invalid_parameter_value';
  end if;

  v_pass := v_pub.pass_percent;
  v_distinction := v_pub.distinction_percent;

  for r in
    -- The latest graded attempt per student, for exams on this publication's
    -- course, sat by students who hold an enrolment on that course at this
    -- centre. The enrolment join is what record_student_result would have
    -- checked; done here because the insert below is one statement per row.
    select distinct on (a.student_id)
           a.id as attempt_id,
           a.score_marks,
           a.max_marks,
           e.id as enrolment_id
    from public.exam_attempts a
    join public.exams x on x.id = a.exam_id
    join public.enrolments e
      on e.student_id = a.student_id
     and e.course_id = v_pub.course_id
     and e.centre_id = v_pub.centre_id
    where x.course_id = v_pub.course_id
      and a.centre_id = v_pub.centre_id
      and a.status in ('submitted', 'auto_submitted')
      and a.score_marks is not null
      and a.max_marks > 0
    order by a.student_id, a.submitted_at desc
  loop
    v_outcome := case
      when r.score_marks * 100 >= v_distinction * r.max_marks then 'distinction'
      when r.score_marks * 100 >= v_pass * r.max_marks then 'pass'
      else 'fail'
    end::public.result_outcome;

    insert into public.student_results
      (publication_id, enrolment_id, max_marks, obtained_marks, outcome, attempt_id)
    values
      (p_publication_id, r.enrolment_id, r.max_marks, r.score_marks, v_outcome, r.attempt_id)
    on conflict (publication_id, enrolment_id) do update
      set max_marks = excluded.max_marks,
          obtained_marks = excluded.obtained_marks,
          outcome = excluded.outcome,
          attempt_id = excluded.attempt_id;

    update public.exam_attempts
    set status = 'evaluated'
    where id = r.attempt_id and status in ('submitted', 'auto_submitted');

    n := n + 1;
  end loop;

  return n;
end;
$$;

revoke all on function public.import_attempt_results(uuid) from public, anon;
grant execute on function public.import_attempt_results(uuid) to authenticated;
