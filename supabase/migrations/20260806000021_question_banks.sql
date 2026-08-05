-- 0021: question banks — the first slice of Phase 4.
--
-- Deliberately not the exam runner. The runner is what everyone wants to build
-- first and it is the wrong place to start, because this slice is where the one
-- piece of architecture that cannot be retrofitted has to be settled: the
-- answer key must be unreachable by `authenticated` at the privilege level
-- before anything reads it. Build plan §5.2's proof R19 — "a student reads
-- question_options.is_correct during an attempt → denied at COLUMN level" — is
-- the only column-level requirement in the whole permission matrix. Once the
-- runner exists, every read path has already been written the other way.
--
-- Scope: question banks, questions and options, managed by head office. No
-- exams, no attempts, no grading. See docs/04-exam-build-notes.md.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

-- All seven types PRD §6.7.2 lists, even though this slice's UI offers only the
-- three that grade themselves. The enum is the expensive thing to change later
-- (ALTER TYPE ... ADD VALUE cannot run inside a transaction with other DDL in
-- older Postgres, and the value ordering is fixed once rows exist); the UI
-- restriction is a line of validation.
create type public.question_type as enum (
  'single_choice',
  'multiple_choice',
  'true_false',
  'fill_in',
  'short_answer',
  'long_answer',
  'file_upload'
);

create type public.question_status as enum ('draft', 'active', 'retired');

create type public.question_difficulty as enum ('easy', 'medium', 'hard');

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

-- No centre_id, and that is the point. Build plan §4 gives every centre role
-- read-only on `question.*`; a bank belongs to the organisation. Combined with
-- migration 0020, `app.has_permission('question.manage', organization_id)` with
-- no centre now requires an organisation-level membership — so a centre-scoped
-- user cannot manage a bank even if somebody grants them the permission by
-- mistake. Before 0020 they could have.
create table public.question_banks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  course_id uuid references public.courses (id),
  name text not null,
  description text,
  status public.question_status not null default 'draft',
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  constraint question_banks_name_not_blank check (length(btrim(name)) > 0),
  -- The target of the composite foreign key below.
  unique (id, organization_id)
);

create unique index question_banks_org_name_idx
  on public.question_banks (organization_id, lower(btrim(name)));

-- organization_id is denormalised onto questions and options rather than
-- reached through a join in every policy. Build plan R3 is explicit that RLS
-- helpers run per row and must be a check rather than a scan, and an EXISTS
-- back to question_banks on every option row is exactly the scan it warns
-- about. The composite foreign key is what stops the denormalised copy from
-- ever disagreeing with its parent — it is enforced by Postgres, not by the
-- application remembering.
create table public.questions (
  id uuid primary key default gen_random_uuid(),
  bank_id uuid not null,
  organization_id uuid not null,
  type public.question_type not null,
  body text not null,
  marks int not null default 1 check (marks > 0),
  -- Stored positive, subtracted at grading. A negative negative-mark is the
  -- kind of sign error that silently rewards wrong answers.
  negative_marks int not null default 0 check (negative_marks >= 0),
  difficulty public.question_difficulty not null default 'medium',
  explanation text,
  status public.question_status not null default 'draft',
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  constraint questions_body_not_blank check (length(btrim(body)) > 0),
  foreign key (bank_id, organization_id)
    references public.question_banks (id, organization_id) on delete cascade,
  unique (id, organization_id)
);

create index questions_bank_idx on public.questions (bank_id, status);

create table public.question_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null,
  organization_id uuid not null,
  body text not null,
  is_correct boolean not null default false,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  constraint question_options_body_not_blank check (length(btrim(body)) > 0),
  foreign key (question_id, organization_id)
    references public.questions (id, organization_id) on delete cascade
);

create index question_options_question_idx
  on public.question_options (question_id, display_order);

-- ---------------------------------------------------------------------------
-- R19: the answer key is not a column anyone can select.
--
-- A row policy cannot express "this row, but not that column", so this is done
-- with privileges. `authenticated` is granted SELECT on the option columns a
-- paper needs and on nothing else — `is_correct` is simply absent from the
-- grant, so PostgREST cannot return it, cannot filter on it, and cannot leak it
-- through an error message. Writes go through a function for the same reason:
-- an INSERT grant would let a caller name `is_correct` in a RETURNING clause.
--
-- The consequence to remember: `select *` on question_options fails for
-- authenticated users. That is intended. Name the columns.
-- ---------------------------------------------------------------------------

revoke all on public.question_options from authenticated;
grant select (id, question_id, organization_id, body, display_order)
  on public.question_options to authenticated;

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------

alter table public.question_banks enable row level security;
alter table public.question_banks force row level security;
alter table public.questions enable row level security;
alter table public.questions force row level security;
alter table public.question_options enable row level security;
alter table public.question_options force row level security;

create policy question_banks_read on public.question_banks
  for select to authenticated
  using (
    app.is_platform_admin()
    or app.has_permission('question.read', organization_id)
  );

create policy question_banks_write on public.question_banks
  for all to authenticated
  using (
    app.is_platform_admin()
    or app.has_permission('question.manage', organization_id)
  )
  with check (
    app.is_platform_admin()
    or app.has_permission('question.manage', organization_id)
  );

create policy questions_read on public.questions
  for select to authenticated
  using (
    app.is_platform_admin()
    or app.has_permission('question.read', organization_id)
  );

create policy questions_write on public.questions
  for all to authenticated
  using (
    app.is_platform_admin()
    or app.has_permission('question.manage', organization_id)
  )
  with check (
    app.is_platform_admin()
    or app.has_permission('question.manage', organization_id)
  );

-- Read only. Everything that writes an option goes through
-- public.save_question_options, because the privilege grant above deliberately
-- withholds INSERT, UPDATE and DELETE.
create policy question_options_read on public.question_options
  for select to authenticated
  using (
    app.is_platform_admin()
    or app.has_permission('question.read', organization_id)
  );

-- ---------------------------------------------------------------------------
-- Functions
-- ---------------------------------------------------------------------------

-- Reading the answer key. SECURITY DEFINER because `authenticated` has no
-- SELECT on the column at all — the privilege revoke is the mechanism, and this
-- is the single authorised way around it. Gated on `question.manage`, not
-- `question.read`: seeing which option is correct is an authoring capability,
-- and the same function must not become the hole the runner leaks through.
create function public.question_answer_key(p_question_id uuid)
returns table (option_id uuid)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_org uuid;
begin
  select q.organization_id into v_org
  from public.questions q
  where q.id = p_question_id;

  if v_org is null then
    raise exception 'Question not found' using errcode = 'no_data_found';
  end if;

  if not (app.is_platform_admin() or app.has_permission('question.manage', v_org)) then
    raise exception 'Not authorised to read the answer key' using errcode = 'insufficient_privilege';
  end if;

  return query
    select o.id
    from public.question_options o
    where o.question_id = p_question_id and o.is_correct
    order by o.display_order;
end;
$$;

-- Replacing a question's options as one set.
--
-- A set rather than row-by-row edits because the validity rules are properties
-- of the whole set — a single-choice question with two correct answers, or a
-- choice question with none, are both broken papers, and there is no ordering
-- of individual row edits that never passes through one of those states.
create function public.save_question_options(p_question_id uuid, p_options jsonb)
returns int
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_org uuid;
  v_type public.question_type;
  v_correct int;
  v_total int;
begin
  select q.organization_id, q.type into v_org, v_type
  from public.questions q
  where q.id = p_question_id;

  if v_org is null then
    raise exception 'Question not found' using errcode = 'no_data_found';
  end if;

  if not (app.is_platform_admin() or app.has_permission('question.manage', v_org)) then
    raise exception 'Not authorised to edit this question' using errcode = 'insufficient_privilege';
  end if;

  if jsonb_typeof(p_options) <> 'array' then
    raise exception 'Options must be an array' using errcode = 'invalid_parameter_value';
  end if;

  select count(*), count(*) filter (where (e ->> 'is_correct')::boolean)
    into v_total, v_correct
  from jsonb_array_elements(p_options) e;

  if v_type in ('single_choice', 'multiple_choice', 'true_false') then
    if v_total < 2 then
      raise exception 'A choice question needs at least two options'
        using errcode = 'invalid_parameter_value';
    end if;
    if v_correct = 0 then
      raise exception 'At least one option must be correct'
        using errcode = 'invalid_parameter_value';
    end if;
    if v_type in ('single_choice', 'true_false') and v_correct > 1 then
      raise exception 'This question type allows only one correct option'
        using errcode = 'invalid_parameter_value';
    end if;
  elsif v_total > 0 then
    raise exception 'This question type does not take options'
      using errcode = 'invalid_parameter_value';
  end if;

  delete from public.question_options where question_id = p_question_id;

  insert into public.question_options (question_id, organization_id, body, is_correct, display_order)
  select
    p_question_id,
    v_org,
    e ->> 'body',
    coalesce((e ->> 'is_correct')::boolean, false),
    (row_number() over ())::int
  from jsonb_array_elements(p_options) e;

  return v_total;
end;
$$;

-- Functions default to PUBLIC EXECUTE, and the blanket revoke in migration 0003
-- only covered functions that existed then. Explicit grant and revoke per
-- function is the house pattern — see 0014.
revoke all on function public.question_answer_key(uuid) from public, anon;
revoke all on function public.save_question_options(uuid, jsonb) from public, anon;
grant execute on function public.question_answer_key(uuid) to authenticated;
grant execute on function public.save_question_options(uuid, jsonb) to authenticated;

-- ---------------------------------------------------------------------------
-- Audit
-- ---------------------------------------------------------------------------

-- Both carry organization_id, which is what app.audit_trigger() reads off the
-- row and what audit_logs_select filters on. Options are excluded on purpose:
-- they only ever change as a set through save_question_options, so the parent
-- question's audit row already records that something changed, and one row per
-- option would multiply the write cost for no extra evidence.
create trigger audit_changes
  after insert or update or delete on public.question_banks
  for each row execute function app.audit_trigger();

create trigger audit_changes
  after insert or update or delete on public.questions
  for each row execute function app.audit_trigger();

-- ---------------------------------------------------------------------------
-- Permissions
--
-- Seeded as codes, granted to no role. The five roles that exist are all
-- centre-scoped, and build plan §4 gives centre roles read-only on `question.*`
-- — read-only access to a bank they cannot act on is not worth granting before
-- there is an exam to attach it to. Head-office roles (Exam Controller in
-- particular) are not seeded at all yet; when they are, `question.manage` is
-- theirs. Until then the only user who can manage a bank is a platform super
-- admin, via app.is_platform_admin().
-- ---------------------------------------------------------------------------

insert into public.permissions (code, description) values
  ('question.read',  'View question banks and questions'),
  ('question.manage','Create and edit question banks, questions and answer keys'),
  ('exam.read',      'View exams'),
  ('exam.manage',    'Create and edit exams')
on conflict (code) do nothing;
