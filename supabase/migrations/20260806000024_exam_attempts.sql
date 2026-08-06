-- 0024: attempts — the correctness-critical core of Phase 4.
--
-- Build plan R6, severity High: "clock tampering, duplicate attempts, lost
-- answers on flaky mobile networks." Everything unusual below is one of those
-- three.
--
-- The governing decision is that a student writes NOTHING directly. There is no
-- INSERT or UPDATE grant on exam_attempts or exam_answers for `authenticated`,
-- and no policy that would allow one. Every write goes through a SECURITY
-- DEFINER function that decides the values itself. A policy saying "you may
-- update your own attempt" would be a policy saying "you may write your own
-- deadline", and no `with check` can express "…but not that column, and only
-- to a value I computed".

create type public.exam_event_type as enum (
  'started',
  'resumed',
  'answer_saved',
  'heartbeat',
  'focus_lost',
  'focus_regained',
  'submitted',
  'auto_submitted'
);

create table public.exam_attempts (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null,
  student_id uuid not null references public.students (id) on delete cascade,
  organization_id uuid not null,
  centre_id uuid not null references public.centres (id),
  attempt_number int not null default 1 check (attempt_number > 0),
  started_at timestamptz not null default now(),
  -- Written once, at creation, by the server. PRD §19.6: "refreshing does not
  -- reset server time". The client's countdown is a rendering of this value,
  -- never an input to it.
  deadline_at timestamptz not null,
  submitted_at timestamptz,
  status public.exam_attempt_status not null default 'in_progress',
  score_marks int,
  max_marks int,
  foreign key (exam_id, organization_id)
    references public.exams (id, organization_id) on delete cascade,
  -- R6's duplicate-attempt mitigation, and the reason start is idempotent
  -- rather than merely careful.
  unique (exam_id, student_id, attempt_number),
  unique (id, organization_id)
);

-- The cron sweep's index. Partial, because the sweep only ever asks about
-- attempts still running, and that is a vanishing fraction of the table once
-- a few terms have passed.
create index exam_attempts_expiring_idx
  on public.exam_attempts (deadline_at)
  where status = 'in_progress';

create index exam_attempts_student_idx on public.exam_attempts (student_id, exam_id);

create table public.exam_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.exam_attempts (id) on delete cascade,
  question_id uuid not null,
  organization_id uuid not null,
  -- `{}` means "seen, nothing chosen". Distinct from no row at all, which
  -- means never opened. C8(c) turns on that distinction: a cleared answer is
  -- an empty object, and must be treated as unanswered rather than wrong.
  answer jsonb not null default '{}'::jsonb,
  -- R6's stale-write guard. The client counts its own saves; a reply that
  -- arrives out of order carries a lower number and is dropped. Without it,
  -- a retried request from thirty seconds ago silently overwrites the answer
  -- the student has since changed.
  client_seq int not null default 0,
  saved_at timestamptz not null default now(),
  awarded_marks int,
  -- The ON CONFLICT target for autosave. It is the mechanism, not a nicety.
  unique (attempt_id, question_id)
);

-- Insert-only ledger. CLAUDE.md rule 4: revoked at the privilege level, not
-- merely omitted from a policy. Unlike wallet_entries this carries no running
-- balance — it is evidence of what happened, not an account.
create table public.exam_events (
  id bigint generated always as identity primary key,
  attempt_id uuid not null references public.exam_attempts (id) on delete cascade,
  organization_id uuid not null,
  event_type public.exam_event_type not null,
  -- Server time, always. PRD §10.5 says so, and an event log whose timestamps
  -- come from the machine being invigilated is not evidence of anything.
  occurred_at timestamptz not null default now(),
  -- PRD §13.3 forbids logging answer content. Nothing here may carry it —
  -- question ids and counts are safe, chosen options are not.
  metadata jsonb not null default '{}'::jsonb
);

create index exam_events_attempt_idx on public.exam_events (attempt_id, occurred_at);

-- ---------------------------------------------------------------------------
-- Privileges. These are the load-bearing lines.
-- ---------------------------------------------------------------------------

revoke insert, update, delete on public.exam_attempts from authenticated;
revoke insert, update, delete on public.exam_answers from authenticated;
revoke update, delete on public.exam_events from authenticated;

alter table public.exam_attempts enable row level security;
alter table public.exam_attempts force row level security;
alter table public.exam_answers enable row level security;
alter table public.exam_answers force row level security;
alter table public.exam_events enable row level security;
alter table public.exam_events force row level security;

create policy exam_attempts_read on public.exam_attempts
  for select to authenticated
  using (
    student_id = app.current_student_id()
    or app.is_platform_admin()
    or app.has_permission('exam.read', organization_id)
    or (app.has_permission('exam.read', organization_id, centre_id)
        and app.can_access_centre(centre_id))
  );

create policy exam_answers_read on public.exam_answers
  for select to authenticated
  using (
    exists (
      select 1 from public.exam_attempts a
      where a.id = attempt_id
        and (a.student_id = app.current_student_id() or app.is_platform_admin())
    )
  );

-- R05: "Student A selects Student B's exam_answers → 0 rows". The policy above
-- is what makes that true; there is deliberately no centre-staff branch, because
-- reading another person's answers is an evaluation capability and evaluation
-- is not built.

create policy exam_events_read on public.exam_events
  for select to authenticated
  using (
    app.is_platform_admin()
    or app.has_permission('exam.read', organization_id)
  );

-- ---------------------------------------------------------------------------
-- Start: idempotent by construction.
-- ---------------------------------------------------------------------------

create function public.start_exam_attempt(p_exam_id uuid)
returns table (
  attempt_id uuid,
  deadline_at timestamptz,
  attempt_number int,
  resumed boolean
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student uuid;
  v_exam public.exams%rowtype;
  v_centre uuid;
  v_existing public.exam_attempts%rowtype;
  v_used int;
  v_deadline timestamptz;
  v_number int;
  v_id uuid;
begin
  v_student := app.current_student_id();
  if v_student is null then
    raise exception 'Only a student can sit an exam' using errcode = 'insufficient_privilege';
  end if;

  select * into v_exam from public.exams where id = p_exam_id;
  if v_exam.id is null then
    raise exception 'Exam not found' using errcode = 'no_data_found';
  end if;

  select s.centre_id into v_centre from public.students s where s.id = v_student;

  -- Ordered so the message is useful and nothing leaks. "Not assigned" is
  -- checked before the window, because a student at an unassigned centre
  -- should not learn the schedule of an exam that was never theirs.
  if not exists (
    select 1 from public.exam_assignments a
    where a.exam_id = p_exam_id and a.centre_id = v_centre
  ) then
    raise exception 'This exam is not available at your centre' using errcode = 'insufficient_privilege';
  end if;

  if not app.centre_is_operational(v_centre) then
    raise exception 'Your centre is not currently active' using errcode = 'insufficient_privilege';
  end if;

  if v_exam.status <> 'published' then
    raise exception 'This exam has not been released' using errcode = 'insufficient_privilege';
  end if;

  -- Resume before the window check. C8(e) and PRD §6.7.7: an attempt already
  -- running finishes, and a student who lost their connection at 16:29 can
  -- come back at 16:31 if their own deadline has not passed. Refusing them
  -- because the exam's window closed would punish the network.
  select * into v_existing
  from public.exam_attempts
  where exam_id = p_exam_id and student_id = v_student and status = 'in_progress'
  order by attempt_number desc
  limit 1;

  if v_existing.id is not null then
    if now() >= v_existing.deadline_at then
      raise exception 'Your time for this attempt has run out' using errcode = 'invalid_parameter_value';
    end if;
    insert into public.exam_events (attempt_id, organization_id, event_type)
    values (v_existing.id, v_existing.organization_id, 'resumed');
    return query select v_existing.id, v_existing.deadline_at, v_existing.attempt_number, true;
    return;
  end if;

  if now() < v_exam.opens_at then
    raise exception 'This exam has not opened yet' using errcode = 'invalid_parameter_value';
  end if;
  if now() >= v_exam.closes_at then
    raise exception 'This exam has closed' using errcode = 'invalid_parameter_value';
  end if;

  select count(*) into v_used
  from public.exam_attempts
  where exam_id = p_exam_id and student_id = v_student;

  if v_used >= v_exam.max_attempts then
    raise exception 'You have used all % attempts for this exam', v_exam.max_attempts
      using errcode = 'invalid_parameter_value';
  end if;

  v_number := v_used + 1;
  -- The deadline is the earlier of "duration from now" and the exam's own
  -- close. Starting five minutes before the window shuts buys five minutes,
  -- not the full duration.
  v_deadline := least(now() + make_interval(mins => v_exam.duration_minutes), v_exam.closes_at);

  -- The unique constraint is the real guard, not this insert. Two concurrent
  -- calls both reach here; one wins, the other gets 23505 and re-reads. That
  -- is why the exception handler returns the winner's row rather than failing:
  -- a double-submitted form must not show the student an error.
  begin
    insert into public.exam_attempts
      (exam_id, student_id, organization_id, centre_id, attempt_number, deadline_at)
    values
      (p_exam_id, v_student, v_exam.organization_id, v_centre, v_number, v_deadline)
    returning id into v_id;
  exception when unique_violation then
    select * into v_existing
    from public.exam_attempts
    where exam_id = p_exam_id and student_id = v_student and attempt_number = v_number;
    return query select v_existing.id, v_existing.deadline_at, v_existing.attempt_number, true;
    return;
  end;

  insert into public.exam_events (attempt_id, organization_id, event_type)
  values (v_id, v_exam.organization_id, 'started');

  return query select v_id, v_deadline, v_number, false;
end;
$$;

-- ---------------------------------------------------------------------------
-- Autosave.
-- ---------------------------------------------------------------------------

create function public.save_exam_answer(
  p_attempt_id uuid,
  p_question_id uuid,
  p_answer jsonb,
  p_client_seq int
)
returns table (saved boolean, server_time timestamptz, remaining_seconds int)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_attempt public.exam_attempts%rowtype;
  v_applied boolean := false;
begin
  select * into v_attempt from public.exam_attempts where id = p_attempt_id;

  if v_attempt.id is null or v_attempt.student_id is distinct from app.current_student_id() then
    raise exception 'Attempt not found' using errcode = 'no_data_found';
  end if;

  if v_attempt.status <> 'in_progress' then
    raise exception 'This attempt has already been submitted' using errcode = 'invalid_parameter_value';
  end if;

  -- Past the deadline the answer is simply not taken. Not an error the client
  -- has to interpret — the response says saved = false and carries the server
  -- clock, which is the client's cue to stop and show the submitted screen.
  if now() >= v_attempt.deadline_at then
    return query select false, now(), 0;
    return;
  end if;

  if not exists (
    select 1 from public.exam_questions q
    where q.exam_id = v_attempt.exam_id and q.question_id = p_question_id
  ) then
    raise exception 'That question is not on this paper' using errcode = 'invalid_parameter_value';
  end if;

  insert into public.exam_answers
    (attempt_id, question_id, organization_id, answer, client_seq, saved_at)
  values
    (p_attempt_id, p_question_id, v_attempt.organization_id, coalesce(p_answer, '{}'::jsonb),
     p_client_seq, now())
  on conflict (attempt_id, question_id) do update
    set answer = excluded.answer,
        client_seq = excluded.client_seq,
        saved_at = excluded.saved_at
    -- R6: a reply that overtook a newer one carries a lower sequence number
    -- and is discarded. Strictly less-than, so a retry of the same save is a
    -- no-op rather than a rewrite.
    where public.exam_answers.client_seq < excluded.client_seq;

  get diagnostics v_applied = row_count;

  -- Not one event per save. A sixty-question paper autosaving every fifteen
  -- seconds would bury the log in noise; the answer row's saved_at already
  -- records the last write, and the event exists to mark the first time a
  -- question was touched.
  if v_applied and not exists (
    select 1 from public.exam_events e
    where e.attempt_id = p_attempt_id
      and e.event_type = 'answer_saved'
      and e.metadata ->> 'question_id' = p_question_id::text
  ) then
    insert into public.exam_events (attempt_id, organization_id, event_type, metadata)
    values (p_attempt_id, v_attempt.organization_id, 'answer_saved',
            jsonb_build_object('question_id', p_question_id));
  end if;

  return query
    select v_applied, now(),
           greatest(0, extract(epoch from (v_attempt.deadline_at - now()))::int);
end;
$$;

-- The client's clock is never trusted, so it has to be able to ask.
create function public.exam_attempt_heartbeat(p_attempt_id uuid)
returns table (server_time timestamptz, remaining_seconds int, status public.exam_attempt_status)
language plpgsql
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

  return query
    select now(),
           greatest(0, extract(epoch from (v.deadline_at - now()))::int),
           v.status;
end;
$$;

-- Focus changes. PRD §7.7: "a signal only, not automatic proof of misconduct."
-- So it is recorded and nothing else happens — no penalty, no auto-submit.
create function public.record_exam_event(p_attempt_id uuid, p_event public.exam_event_type)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v public.exam_attempts%rowtype;
begin
  if p_event not in ('focus_lost', 'focus_regained', 'heartbeat') then
    raise exception 'That event is not client-reportable' using errcode = 'insufficient_privilege';
  end if;

  select * into v from public.exam_attempts where id = p_attempt_id;
  if v.id is null or v.student_id is distinct from app.current_student_id() then
    raise exception 'Attempt not found' using errcode = 'no_data_found';
  end if;

  insert into public.exam_events (attempt_id, organization_id, event_type)
  values (p_attempt_id, v.organization_id, p_event);
end;
$$;

-- ---------------------------------------------------------------------------
-- Grading, and submission.
--
-- The C8 defaults are implemented here and each one is marked, because they
-- are assumptions rather than specified rules and whoever answers C8 needs to
-- find them in one place.
-- ---------------------------------------------------------------------------

create function app.grade_attempt(p_attempt_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  r record;
  v_total int := 0;
  v_max int := 0;
  v_marks int;
  v_chosen uuid[];
  v_correct uuid[];
begin
  for r in
    select eq.question_id,
           coalesce(eq.marks_override, q.marks) as marks,
           q.negative_marks,
           q.type,
           a.id as answer_id,
           a.answer
    from public.exam_questions eq
    join public.questions q on q.id = eq.question_id
    left join public.exam_answers a
      on a.attempt_id = p_attempt_id and a.question_id = eq.question_id
    join public.exam_attempts at on at.id = p_attempt_id
    where eq.exam_id = at.exam_id
  loop
    v_max := v_max + r.marks;

    -- C8(b) and C8(c): a blank takes no penalty, and a *cleared* answer counts
    -- as blank. Both are decided here, by treating a missing row and an empty
    -- object identically. The column is `not null default '{}'`, so a test for
    -- null alone would never fire and a cleared answer would take the full
    -- negative mark — the exact inverse of the intent.
    if r.answer_id is null
       or r.answer is null
       or r.answer = '{}'::jsonb
       or coalesce(jsonb_array_length(r.answer -> 'option_ids'), 0) = 0
          and (r.answer -> 'option_id') is null
    then
      continue;
    end if;

    select array_agg(o.id order by o.id) into v_correct
    from public.question_options o
    where o.question_id = r.question_id and o.is_correct;

    -- Both answer shapes the client may send. A grader that understood only
    -- one would score every question of the other type as wrong.
    if r.answer ? 'option_ids' then
      select array_agg(value::uuid order by value::uuid) into v_chosen
      from jsonb_array_elements_text(r.answer -> 'option_ids');
    else
      v_chosen := array[(r.answer ->> 'option_id')::uuid];
    end if;

    -- C8(a): all or nothing. A partially correct multiple-choice answer scores
    -- zero, not a fraction. The stricter reading, and the easier one to loosen.
    if v_chosen = v_correct then
      v_marks := r.marks;
    else
      v_marks := -r.negative_marks;
    end if;

    v_total := v_total + v_marks;

    update public.exam_answers set awarded_marks = v_marks where id = r.answer_id;
  end loop;

  -- A negative total is reported as zero. Marks are what goes on a mark sheet,
  -- and no institution issues one below zero.
  update public.exam_attempts
  set score_marks = greatest(0, v_total),
      max_marks = v_max
  where id = p_attempt_id;
end;
$$;

create function public.submit_exam_attempt(p_attempt_id uuid)
returns table (score_marks int, max_marks int)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v public.exam_attempts%rowtype;
begin
  select * into v from public.exam_attempts where id = p_attempt_id for update;

  if v.id is null or v.student_id is distinct from app.current_student_id() then
    raise exception 'Attempt not found' using errcode = 'no_data_found';
  end if;

  -- Idempotent. A manual submit racing the deadline sweep must not produce an
  -- error for whichever arrives second — the attempt is submitted either way,
  -- and that is the answer to give.
  if v.status <> 'in_progress' then
    return query select v.score_marks, v.max_marks;
    return;
  end if;

  perform app.grade_attempt(p_attempt_id);

  update public.exam_attempts
  set status = 'submitted', submitted_at = now()
  where id = p_attempt_id;

  insert into public.exam_events (attempt_id, organization_id, event_type)
  values (p_attempt_id, v.organization_id, 'submitted');

  return query
    select a.score_marks, a.max_marks from public.exam_attempts a where a.id = p_attempt_id;
end;
$$;

-- The deadline sweep. Without it an abandoned attempt stays in_progress for
-- ever and its unique (exam, student, attempt_number) row blocks that student
-- from ever starting again.
create function public.sweep_expired_exam_attempts(p_limit int default 200)
returns int
language plpgsql
security definer
set search_path = ''
as $$
declare
  r record;
  n int := 0;
begin
  for r in
    select id, organization_id
    from public.exam_attempts
    where status = 'in_progress' and deadline_at <= now()
    order by deadline_at
    limit p_limit
    -- Two sweeps overlapping must not grade the same attempt twice.
    for update skip locked
  loop
    perform app.grade_attempt(r.id);
    update public.exam_attempts
    set status = 'auto_submitted', submitted_at = now()
    where id = r.id;
    insert into public.exam_events (attempt_id, organization_id, event_type)
    values (r.id, r.organization_id, 'auto_submitted');
    n := n + 1;
  end loop;
  return n;
end;
$$;

-- ---------------------------------------------------------------------------
-- Grants. New functions default to PUBLIC EXECUTE; 0003's blanket revoke only
-- covered what existed then.
-- ---------------------------------------------------------------------------

revoke all on function public.start_exam_attempt(uuid) from public, anon;
revoke all on function public.save_exam_answer(uuid, uuid, jsonb, int) from public, anon;
revoke all on function public.exam_attempt_heartbeat(uuid) from public, anon;
revoke all on function public.record_exam_event(uuid, public.exam_event_type) from public, anon;
revoke all on function public.submit_exam_attempt(uuid) from public, anon;
revoke all on function app.grade_attempt(uuid) from public, anon, authenticated;
-- The sweep is the cron's, not a user's. Only the service role reaches it.
revoke all on function public.sweep_expired_exam_attempts(int) from public, anon, authenticated;

grant execute on function public.start_exam_attempt(uuid) to authenticated;
grant execute on function public.save_exam_answer(uuid, uuid, jsonb, int) to authenticated;
grant execute on function public.exam_attempt_heartbeat(uuid) to authenticated;
grant execute on function public.record_exam_event(uuid, public.exam_event_type) to authenticated;
grant execute on function public.submit_exam_attempt(uuid) to authenticated;
