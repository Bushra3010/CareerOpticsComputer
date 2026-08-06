-- 0026: students can see their exams, and an attempt can fetch its paper.
--
-- Found by asking the obvious question before building the runner: can a
-- student actually read any of this? They could not. Every exam policy reaches
-- `app.can_access_centre`, which is built on memberships — and a student has
-- `students.user_id`, not a membership. The runner would have rendered an
-- empty shell for every student while all 74 integration tests stayed green,
-- because the suite's student assertions were all about writes and answers,
-- never about reading the exam row itself.

-- The centre a student belongs to now counts as "my centre". This makes the
-- exams list visible (via exams_read's published-and-assigned branch) and the
-- window-gated exam_questions policy consistent for students — R18's clock
-- logic applies to them identically.
create or replace function app.exam_is_assigned_to_my_centre(p_exam_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.exam_assignments a
    where a.exam_id = p_exam_id
      and (
        app.can_access_centre(a.centre_id)
        or a.centre_id = (
          select s.centre_id from public.students s
          where s.id = app.current_student_id()
        )
      )
  );
$$;

-- The paper for a running attempt, sanitised at source.
--
-- Question bodies and options stay behind their org-level policies — a student
-- has no `question.read` and never will. This function is the single door:
-- gated on "this attempt is yours and still running", and its SELECT list is
-- the sanitisation. `is_correct` is not merely filtered out; the row type has
-- no column for it, so no later edit to a WHERE clause can leak it. That is
-- the same posture as R19's column revoke, applied to the read path the
-- runner actually uses.
--
-- One round trip for the whole paper, options inlined as jsonb — this renders
-- on every attempt load including resume-after-disconnect, and a sixty-question
-- paper must not be sixty queries on a flaky phone connection.
create function public.get_attempt_paper(p_attempt_id uuid)
returns table (
  question_id uuid,
  display_order int,
  type public.question_type,
  body text,
  marks int,
  negative_marks int,
  options jsonb
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v public.exam_attempts%rowtype;
begin
  select * into v from public.exam_attempts where id = p_attempt_id;

  if v.id is null or v.student_id is distinct from app.current_student_id() then
    raise exception 'Attempt not found' using errcode = 'no_data_found';
  end if;

  if v.status <> 'in_progress' then
    raise exception 'This attempt has been submitted' using errcode = 'invalid_parameter_value';
  end if;

  return query
    select eq.question_id,
           eq.display_order,
           q.type,
           q.body,
           coalesce(eq.marks_override, q.marks),
           q.negative_marks,
           coalesce(
             (select jsonb_agg(
                jsonb_build_object('id', o.id, 'body', o.body)
                order by o.display_order
              )
              from public.question_options o
              where o.question_id = eq.question_id),
             '[]'::jsonb
           )
    from public.exam_questions eq
    join public.questions q on q.id = eq.question_id
    where eq.exam_id = v.exam_id
    order by eq.display_order;
end;
$$;

revoke all on function public.get_attempt_paper(uuid) from public, anon;
grant execute on function public.get_attempt_paper(uuid) to authenticated;
