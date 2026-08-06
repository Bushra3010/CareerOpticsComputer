-- 0025: a JSON-null answer is a blank answer, not a wrong one.
--
-- Found by planting an expired attempt and running the sweep end to end, not
-- by a test — the tests all sent `{}` for "cleared", which is handled. A client
-- that clears an answer by sending `{"option_id": null}` is doing something
-- just as natural, and the grader treated it as an *attempted wrong answer*,
-- because in jsonb a JSON null is not SQL NULL:
--
--   ('{"option_id": null}'::jsonb -> 'option_id') IS NULL   → false
--
-- so the blank check fell through, `->>` then produced a real SQL NULL,
-- v_chosen became array[NULL], the equality with the correct set returned
-- NULL, and the answer took the negative mark. C8(c) — "a cleared answer
-- counts as blank" — inverted for exactly one input shape.
--
-- Fixed in both places, deliberately:
--   * save normalises the shape at the door, so stored rows are canonical and
--     `{}` is the only representation of "nothing chosen";
--   * the grader still defends itself, because rows written before this
--     migration exist and a defence that relies on every writer being fixed
--     is not a defence.

create or replace function public.save_exam_answer(
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
  v_answer jsonb;
  v_applied boolean := false;
begin
  select * into v_attempt from public.exam_attempts where id = p_attempt_id;

  if v_attempt.id is null or v_attempt.student_id is distinct from app.current_student_id() then
    raise exception 'Attempt not found' using errcode = 'no_data_found';
  end if;

  if v_attempt.status <> 'in_progress' then
    raise exception 'This attempt has already been submitted' using errcode = 'invalid_parameter_value';
  end if;

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

  -- Normalisation. A JSON-null option_id, an empty option_ids array, or an
  -- option_ids array of nulls are all ways a client says "nothing chosen",
  -- and they all become `{}` so that downstream code has one blank to check.
  v_answer := coalesce(p_answer, '{}'::jsonb);
  if jsonb_typeof(v_answer -> 'option_id') = 'null' then
    v_answer := v_answer - 'option_id';
  end if;
  if v_answer ? 'option_ids' then
    v_answer := jsonb_set(
      v_answer,
      '{option_ids}',
      coalesce(
        (select jsonb_agg(e) from jsonb_array_elements(v_answer -> 'option_ids') e
         where jsonb_typeof(e) <> 'null'),
        '[]'::jsonb
      )
    );
    if v_answer -> 'option_ids' = '[]'::jsonb then
      v_answer := v_answer - 'option_ids';
    end if;
  end if;

  insert into public.exam_answers
    (attempt_id, question_id, organization_id, answer, client_seq, saved_at)
  values
    (p_attempt_id, p_question_id, v_attempt.organization_id, v_answer, p_client_seq, now())
  on conflict (attempt_id, question_id) do update
    set answer = excluded.answer,
        client_seq = excluded.client_seq,
        saved_at = excluded.saved_at
    where public.exam_answers.client_seq < excluded.client_seq;

  get diagnostics v_applied = row_count;

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

create or replace function app.grade_attempt(p_attempt_id uuid)
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

    -- Blank means: no row, no object, or nothing actually chosen once JSON
    -- nulls are discounted. jsonb_typeof, not IS NULL — a JSON null is a value.
    if r.answer_id is null
       or r.answer is null
       or r.answer = '{}'::jsonb
       or (
         (r.answer -> 'option_id' is null or jsonb_typeof(r.answer -> 'option_id') = 'null')
         and coalesce((
           select count(*) from jsonb_array_elements(
             case when jsonb_typeof(r.answer -> 'option_ids') = 'array'
                  then r.answer -> 'option_ids' else '[]'::jsonb end
           ) e where jsonb_typeof(e) <> 'null'
         ), 0) = 0
       )
    then
      continue;
    end if;

    select array_agg(o.id order by o.id) into v_correct
    from public.question_options o
    where o.question_id = r.question_id and o.is_correct;

    if jsonb_typeof(r.answer -> 'option_ids') = 'array' then
      select array_agg((e #>> '{}')::uuid order by (e #>> '{}')::uuid) into v_chosen
      from jsonb_array_elements(r.answer -> 'option_ids') e
      where jsonb_typeof(e) <> 'null';
    else
      v_chosen := array[(r.answer ->> 'option_id')::uuid];
    end if;

    if v_chosen = v_correct then
      v_marks := r.marks;
    else
      v_marks := -r.negative_marks;
    end if;

    v_total := v_total + v_marks;

    update public.exam_answers set awarded_marks = v_marks where id = r.answer_id;
  end loop;

  update public.exam_attempts
  set score_marks = greatest(0, v_total),
      max_marks = v_max
  where id = p_attempt_id;
end;
$$;
