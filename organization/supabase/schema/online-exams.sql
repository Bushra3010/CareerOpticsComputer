-- =====================================================================
-- Online exams: set by head office, assigned to centres and students,
-- sat by students in their portal, marked by the database.
-- =====================================================================
-- How it runs, in order:
--
--   1. online_exams              a multiple-choice paper: title, course and
--                                term, how many of its questions a student
--                                gets, marks and negative marks, pass %,
--                                duration, the window it may be sat in, and
--                                the questions themselves with their answers
--   2. online_exam_assignments   who may sit it: every student of a centre
--                                (optionally of one course), or one student
--   3. online_exam_attempts      a student's sitting: the questions they
--                                were given, their answers, and the marks
--                                worked out when they submit (or when the
--                                time runs out)
--
-- A student never reads online_exams directly -- the answers are in it.
-- They get their list, their paper and their marks through the functions at
-- the bottom, which hand over the questions without the answer and mark the
-- paper on the server, so nothing a browser can do reveals or changes a
-- result.
--
-- Needs exam-workflow.sql first (is_branch_staff, jwt_student_id). Run once
-- in the Supabase SQL editor. Safe to re-run.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. online_exams
--    questions: [{ "id", "text", "options": ["…","…","…","…"],
--                  "answer": <0-based index of the right option>, "marks"? }]
-- ---------------------------------------------------------------------
create table if not exists public.online_exams (
  "id"               text primary key default gen_random_uuid()::text,
  "organizationId"   text,
  "title"            text not null,
  "description"      text,
  "courseId"         text references public.courses("id") on delete set null,
  "term"             integer not null default 1 check ("term" >= 1),
  "totalQuestions"   integer not null default 0 check ("totalQuestions" >= 0),
  "marksPerQuestion" numeric not null default 1 check ("marksPerQuestion" > 0),
  "negativeMarks"    numeric not null default 0 check ("negativeMarks" >= 0),
  "passPercentage"   numeric not null default 40 check ("passPercentage" >= 0 and "passPercentage" <= 100),
  "durationMinutes"  integer not null default 60 check ("durationMinutes" > 0),
  "startAt"          timestamptz,
  "endAt"            timestamptz,
  "shuffleQuestions" boolean not null default true,
  "showResult"       boolean not null default true,
  "status"           text not null default 'PUBLISHED' check ("status" in ('DRAFT', 'PUBLISHED', 'CLOSED')),
  "questions"        jsonb not null default '[]'::jsonb,
  "createdBy"        text,
  "createdAt"        timestamptz not null default now(),
  "updatedAt"        timestamptz not null default now(),
  "deletedAt"        timestamptz
);

alter table public.online_exams enable row level security;

drop policy if exists "Online exams written by admin" on public.online_exams;
create policy "Online exams written by admin" on public.online_exams
  for all to authenticated
  using (public.is_org_admin()) with check (public.is_org_admin());


-- ---------------------------------------------------------------------
-- 2. online_exam_assignments: studentId null means every student of the
--    centre, narrowed to a course when courseId is set.
-- ---------------------------------------------------------------------
create table if not exists public.online_exam_assignments (
  "id"         text primary key default gen_random_uuid()::text,
  "examId"     text not null references public.online_exams("id") on delete cascade,
  "branchId"   text not null references public.branches("id") on delete cascade,
  "studentId"  text references public.students("id") on delete cascade,
  "courseId"   text references public.courses("id") on delete set null,
  "assignedBy" text,
  "assignedAt" timestamptz not null default now()
);

create unique index if not exists "online_exam_assignments_unique_idx"
  on public.online_exam_assignments ("examId", "branchId", coalesce("studentId", ''), coalesce("courseId", ''));
create index if not exists "online_exam_assignments_branch_idx" on public.online_exam_assignments ("branchId");

alter table public.online_exam_assignments enable row level security;

-- (Placed here because it reads the assignments table.)
-- The head office reads every exam; a centre's staff read the exams
-- assigned to their centre. Students read nothing here (see the functions).
drop policy if exists "Online exams readable by admin or an assigned centre" on public.online_exams;
create policy "Online exams readable by admin or an assigned centre" on public.online_exams
  for select to authenticated
  using (
    public.is_org_admin()
    or (public.jwt_role() <> 'STUDENT' and exists (
      select 1 from public.online_exam_assignments a
       where a."examId" = online_exams."id" and a."branchId" = public.jwt_branch_id()))
  );


drop policy if exists "Assignments readable by admin or the centre" on public.online_exam_assignments;
create policy "Assignments readable by admin or the centre" on public.online_exam_assignments
  for select to authenticated
  using (public.is_org_admin() or public.is_branch_staff("branchId"));

-- Whether the head office has given an exam to a centre as a whole. A
-- function, not a subquery in the policy below: a policy that reads its own
-- table is refused by Postgres as recursive.
create or replace function public.centre_has_online_exam(p_exam_id text, p_branch_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.online_exam_assignments
     where "examId" = p_exam_id and "branchId" = p_branch_id and "studentId" is null
  );
$$;
revoke all on function public.centre_has_online_exam(text, text) from public, anon;
grant execute on function public.centre_has_online_exam(text, text) to authenticated;

-- A centre may put its own students on an exam the head office has already
-- given it; only the head office gives an exam to a centre in the first place.
drop policy if exists "Assignments written by admin or the centre" on public.online_exam_assignments;
create policy "Assignments written by admin or the centre" on public.online_exam_assignments
  for all to authenticated
  using (public.is_org_admin() or public.is_branch_staff("branchId"))
  with check (
    public.is_org_admin()
    or (public.is_branch_staff("branchId") and "studentId" is not null
        and public.centre_has_online_exam("examId", "branchId"))
  );


-- ---------------------------------------------------------------------
-- 3. online_exam_attempts: one sitting per student per exam.
--    questionIds: the questions given, in the order shown
--    answers:     { "<questionId>": <0-based option index> }
-- ---------------------------------------------------------------------
create table if not exists public.online_exam_attempts (
  "id"             text primary key default gen_random_uuid()::text,
  "examId"         text not null references public.online_exams("id") on delete cascade,
  "studentId"      text not null references public.students("id") on delete cascade,
  "branchId"       text not null,
  "startedAt"      timestamptz not null default now(),
  "expiresAt"      timestamptz not null,
  "submittedAt"    timestamptz,
  "questionIds"    jsonb not null default '[]'::jsonb,
  "answers"        jsonb not null default '{}'::jsonb,
  "totalQuestions" integer not null default 0,
  "attempted"      integer not null default 0,
  "correct"        integer not null default 0,
  "wrong"          integer not null default 0,
  "score"          numeric not null default 0,
  "maxScore"       numeric not null default 0,
  "percentage"     numeric not null default 0,
  "result"         text check ("result" is null or "result" in ('PASS', 'FAIL')),
  "updatedAt"      timestamptz not null default now(),
  unique ("examId", "studentId")
);

create index if not exists "online_exam_attempts_branch_idx" on public.online_exam_attempts ("branchId", "startedAt" desc);

alter table public.online_exam_attempts enable row level security;

drop policy if exists "Attempts readable by admin, the centre or the student" on public.online_exam_attempts;
create policy "Attempts readable by admin, the centre or the student" on public.online_exam_attempts
  for select to authenticated
  using (
    public.is_org_admin()
    or public.is_branch_staff("branchId")
    or "studentId" = public.jwt_student_id()
  );

-- Deleting a sitting lets the student sit again. Nothing else is written
-- directly: starting, saving and submitting go through the functions below.
drop policy if exists "Attempts deleted by admin or the centre" on public.online_exam_attempts;
create policy "Attempts deleted by admin or the centre" on public.online_exam_attempts
  for delete to authenticated
  using (public.is_org_admin() or public.is_branch_staff("branchId"));


-- ---------------------------------------------------------------------
-- 4. Whether a student is on an exam's list.
-- ---------------------------------------------------------------------
create or replace function public.online_exam_assigned(p_exam_id text, p_student_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
      from public.students s
      join public.online_exam_assignments a on a."examId" = p_exam_id and a."branchId" = s."branchId"
     where s."id" = p_student_id and s."deletedAt" is null
       and (a."studentId" = s."id"
            or (a."studentId" is null and (a."courseId" is null or a."courseId" = s."courseId")))
  );
$$;
revoke all on function public.online_exam_assigned(text, text) from public, anon, authenticated;


-- ---------------------------------------------------------------------
-- 5. Marking. Right answer: the question's marks (else the exam's marks per
--    question). Wrong answer: minus the negative marks. Unanswered: nothing.
--    The total never goes below zero.
-- ---------------------------------------------------------------------
create or replace function public.mark_online_attempt(p_attempt_id text, p_answers jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_attempt  record;
  v_exam     record;
  v_q        jsonb;
  v_qid      text;
  v_given    text;
  v_marks    numeric;
  v_max      numeric := 0;
  v_score    numeric := 0;
  v_attempted integer := 0;
  v_correct  integer := 0;
  v_wrong    integer := 0;
  v_pct      numeric;
  v_result   text;
  v_answers  jsonb := coalesce(p_answers, '{}'::jsonb);
begin
  select * into v_attempt from public.online_exam_attempts where "id" = p_attempt_id for update;
  if not found then raise exception 'Attempt not found.'; end if;
  select * into v_exam from public.online_exams where "id" = v_attempt."examId";

  for v_qid in select value #>> '{}' from jsonb_array_elements(v_attempt."questionIds") loop
    select q into v_q from jsonb_array_elements(v_exam."questions") q where q ->> 'id' = v_qid limit 1;
    if v_q is null then continue; end if;
    v_marks := coalesce(nullif(v_q ->> 'marks', '')::numeric, v_exam."marksPerQuestion");
    v_max := v_max + v_marks;
    v_given := nullif(trim(v_answers ->> v_qid), '');
    if v_given is null then continue; end if;
    v_attempted := v_attempted + 1;
    if v_given = (v_q ->> 'answer') then
      v_correct := v_correct + 1;
      v_score := v_score + v_marks;
    else
      v_wrong := v_wrong + 1;
      v_score := v_score - v_exam."negativeMarks";
    end if;
  end loop;

  v_score := greatest(v_score, 0);
  v_pct := case when v_max > 0 then round(v_score / v_max * 100, 2) else 0 end;
  v_result := case when v_pct >= v_exam."passPercentage" then 'PASS' else 'FAIL' end;

  update public.online_exam_attempts
     set "answers" = v_answers, "submittedAt" = coalesce("submittedAt", now()),
         "attempted" = v_attempted, "correct" = v_correct, "wrong" = v_wrong,
         "score" = v_score, "maxScore" = v_max, "percentage" = v_pct, "result" = v_result,
         "updatedAt" = now()
   where "id" = p_attempt_id;

  return jsonb_build_object(
    'attemptId', p_attempt_id, 'submitted', true,
    'totalQuestions', v_attempt."totalQuestions", 'attempted', v_attempted,
    'correct', v_correct, 'wrong', v_wrong, 'score', v_score, 'maxScore', v_max,
    'percentage', v_pct, 'result', v_result, 'showResult', v_exam."showResult"
  );
end;
$$;
revoke all on function public.mark_online_attempt(text, jsonb) from public, anon, authenticated;


-- ---------------------------------------------------------------------
-- 6. A student's exams: the ones assigned to them, each with their sitting
--    if they have one. Staff may ask for a student of their own (the office
--    opening a student's portal); a student always gets their own.
-- ---------------------------------------------------------------------
create or replace function public.my_online_exams(p_student_id text default null)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_sid     text;
  v_student record;
begin
  v_sid := case when public.jwt_role() = 'STUDENT' then public.jwt_student_id() else p_student_id end;
  if v_sid is null then return '[]'::jsonb; end if;
  select "id", "branchId", "courseId" into v_student from public.students where "id" = v_sid and "deletedAt" is null;
  if not found then return '[]'::jsonb; end if;
  if public.jwt_role() <> 'STUDENT'
     and not coalesce(public.is_org_admin() or public.is_branch_staff(v_student."branchId"), false) then
    raise exception 'Not allowed to read this student''s exams.';
  end if;

  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', e."id", 'title', e."title", 'description', e."description",
      'courseId', e."courseId", 'course', c."name", 'term', e."term",
      'questionCount', case when e."totalQuestions" > 0
                            then least(e."totalQuestions", jsonb_array_length(e."questions"))
                            else jsonb_array_length(e."questions") end,
      'marksPerQuestion', e."marksPerQuestion", 'negativeMarks', e."negativeMarks",
      'passPercentage', e."passPercentage", 'durationMinutes', e."durationMinutes",
      'startAt', e."startAt", 'endAt', e."endAt", 'showResult', e."showResult", 'status', e."status",
      'attempt', (select jsonb_build_object(
                    'id', a."id", 'startedAt', a."startedAt", 'expiresAt', a."expiresAt",
                    'submittedAt', a."submittedAt", 'totalQuestions', a."totalQuestions",
                    'attempted', a."attempted", 'correct', a."correct", 'wrong', a."wrong",
                    'score', a."score", 'maxScore', a."maxScore", 'percentage', a."percentage", 'result', a."result")
                    from public.online_exam_attempts a
                   where a."examId" = e."id" and a."studentId" = v_sid)
    ) order by e."startAt" desc nulls last, e."createdAt" desc)
      from public.online_exams e
      left join public.courses c on c."id" = e."courseId"
     where e."deletedAt" is null and e."status" <> 'DRAFT'
       and public.online_exam_assigned(e."id", v_sid)
  ), '[]'::jsonb);
end;
$$;


-- ---------------------------------------------------------------------
-- 7. Sitting the exam. start_online_exam hands the student their paper --
--    the questions without the answers -- and begins the clock; opening it
--    again gives the same paper with the answers saved so far. Only a
--    student's own login may start one.
-- ---------------------------------------------------------------------
create or replace function public.start_online_exam(p_exam_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sid     text := public.jwt_student_id();
  v_student record;
  v_exam    record;
  v_attempt record;
  v_count   integer;
  v_ids     jsonb;
  v_now     timestamptz := now();
begin
  if public.jwt_role() <> 'STUDENT' or v_sid is null then
    raise exception 'Only a student''s own login can sit an exam.';
  end if;
  select "id", "branchId", "courseId" into v_student from public.students where "id" = v_sid and "deletedAt" is null;
  if not found then raise exception 'Student not found.'; end if;
  select * into v_exam from public.online_exams where "id" = p_exam_id and "deletedAt" is null;
  if not found then raise exception 'Exam not found.'; end if;
  if not public.online_exam_assigned(p_exam_id, v_sid) then
    raise exception 'NOT_ASSIGNED: This exam has not been assigned to you.';
  end if;

  perform pg_advisory_xact_lock(hashtext('online-exam:' || p_exam_id || ':' || v_sid));
  select * into v_attempt from public.online_exam_attempts where "examId" = p_exam_id and "studentId" = v_sid;

  if found then
    if v_attempt."submittedAt" is not null then
      raise exception 'ALREADY_SUBMITTED: You have already submitted this exam.';
    end if;
    if v_now > v_attempt."expiresAt" + interval '2 minutes' then
      -- Time ran out while the student was away: marked on what was saved.
      perform public.mark_online_attempt(v_attempt."id", v_attempt."answers");
      raise exception 'TIME_OVER: The time for this exam is over; it has been submitted with the answers saved.';
    end if;
  else
    if v_exam."status" <> 'PUBLISHED' then raise exception 'NOT_OPEN: This exam is not open.'; end if;
    if v_exam."startAt" is not null and v_now < v_exam."startAt" then
      raise exception 'NOT_STARTED: This exam opens on %.', to_char(v_exam."startAt" at time zone 'Asia/Kolkata', 'DD Mon YYYY HH24:MI');
    end if;
    if v_exam."endAt" is not null and v_now > v_exam."endAt" then
      raise exception 'ENDED: The window for this exam has closed.';
    end if;
    if jsonb_array_length(v_exam."questions") = 0 then raise exception 'This exam has no questions yet.'; end if;

    v_count := case when v_exam."totalQuestions" > 0
                    then least(v_exam."totalQuestions", jsonb_array_length(v_exam."questions"))
                    else jsonb_array_length(v_exam."questions") end;
    select coalesce(jsonb_agg(q ->> 'id' order by pick), '[]'::jsonb) into v_ids
      from (select q, case when v_exam."shuffleQuestions" then random() else ord::double precision end as pick
              from jsonb_array_elements(v_exam."questions") with ordinality as t(q, ord)
             order by pick limit v_count) s;

    insert into public.online_exam_attempts
      ("examId", "studentId", "branchId", "expiresAt", "questionIds", "totalQuestions")
    values
      (p_exam_id, v_sid, v_student."branchId",
       least(v_now + make_interval(mins => v_exam."durationMinutes"), coalesce(v_exam."endAt", 'infinity'::timestamptz)),
       v_ids, v_count)
    returning * into v_attempt;
  end if;

  return jsonb_build_object(
    'attemptId', v_attempt."id", 'examId', v_exam."id", 'title', v_exam."title",
    'durationMinutes', v_exam."durationMinutes", 'marksPerQuestion', v_exam."marksPerQuestion",
    'negativeMarks', v_exam."negativeMarks", 'passPercentage', v_exam."passPercentage",
    'showResult', v_exam."showResult",
    'startedAt', v_attempt."startedAt", 'expiresAt', v_attempt."expiresAt",
    'answers', v_attempt."answers",
    'questions', (
      select coalesce(jsonb_agg((q - 'answer') order by ids.ord), '[]'::jsonb)
        from jsonb_array_elements_text(v_attempt."questionIds") with ordinality as ids(qid, ord)
        join jsonb_array_elements(v_exam."questions") q on q ->> 'id' = ids.qid)
  );
end;
$$;

-- Progress, saved as the student answers, so a dropped connection loses nothing.
create or replace function public.save_online_answers(p_attempt_id text, p_answers jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare v_attempt record;
begin
  select * into v_attempt from public.online_exam_attempts where "id" = p_attempt_id;
  if not found or v_attempt."studentId" is distinct from public.jwt_student_id() then
    raise exception 'Attempt not found.';
  end if;
  if v_attempt."submittedAt" is not null then
    return jsonb_build_object('saved', false, 'submitted', true);
  end if;
  if now() > v_attempt."expiresAt" + interval '2 minutes' then
    return public.mark_online_attempt(p_attempt_id, v_attempt."answers");
  end if;
  update public.online_exam_attempts
     set "answers" = coalesce(p_answers, '{}'::jsonb), "updatedAt" = now()
   where "id" = p_attempt_id;
  return jsonb_build_object('saved', true, 'submitted', false);
end;
$$;

-- Submitting, by the student (their answers) -- or by the office or centre
-- for a sitting whose time has run out, marked on the answers saved.
create or replace function public.submit_online_exam(p_attempt_id text, p_answers jsonb default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_attempt record;
  v_exam    record;
  v_own     boolean;
  v_staff   boolean;
begin
  select * into v_attempt from public.online_exam_attempts where "id" = p_attempt_id;
  if not found then raise exception 'Attempt not found.'; end if;
  v_own := public.jwt_role() = 'STUDENT' and v_attempt."studentId" = public.jwt_student_id();
  v_staff := public.jwt_role() <> 'STUDENT' and (public.is_org_admin() or public.is_branch_staff(v_attempt."branchId"));
  if not coalesce(v_own or v_staff, false) then raise exception 'Not allowed to submit this attempt.'; end if;

  if v_attempt."submittedAt" is not null then
    select "showResult" into v_exam from public.online_exams where "id" = v_attempt."examId";
    return jsonb_build_object(
      'attemptId', p_attempt_id, 'submitted', true, 'alreadySubmitted', true,
      'totalQuestions', v_attempt."totalQuestions", 'attempted', v_attempt."attempted",
      'correct', v_attempt."correct", 'wrong', v_attempt."wrong", 'score', v_attempt."score",
      'maxScore', v_attempt."maxScore", 'percentage', v_attempt."percentage", 'result', v_attempt."result",
      'showResult', v_exam."showResult");
  end if;

  if v_staff and not v_own then
    if now() <= v_attempt."expiresAt" then
      raise exception 'The student is still sitting this exam; it can be closed once the time is over.';
    end if;
    return public.mark_online_attempt(p_attempt_id, v_attempt."answers");
  end if;

  -- The student's answers count while the clock -- plus a little slack for
  -- a slow connection -- allows; after that, what was saved as they went.
  if now() > v_attempt."expiresAt" + interval '2 minutes' then
    return public.mark_online_attempt(p_attempt_id, v_attempt."answers");
  end if;
  return public.mark_online_attempt(p_attempt_id, coalesce(p_answers, v_attempt."answers"));
end;
$$;

revoke all on function public.my_online_exams(text) from public, anon;
revoke all on function public.start_online_exam(text) from public, anon;
revoke all on function public.save_online_answers(text, jsonb) from public, anon;
revoke all on function public.submit_online_exam(text, jsonb) from public, anon;
grant execute on function public.my_online_exams(text) to authenticated;
grant execute on function public.start_online_exam(text) to authenticated;
grant execute on function public.save_online_answers(text, jsonb) to authenticated;
grant execute on function public.submit_online_exam(text, jsonb) to authenticated;

notify pgrst, 'reload schema';


-- ---------------------------------------------------------------------
-- 8. Check.
-- ---------------------------------------------------------------------
select 'online_exams' as thing, to_regclass('public.online_exams') is not null as present
union all select 'online_exam_assignments', to_regclass('public.online_exam_assignments') is not null
union all select 'online_exam_attempts',    to_regclass('public.online_exam_attempts') is not null
union all select 'start_online_exam()',     exists (select 1 from pg_proc where proname = 'start_online_exam');
