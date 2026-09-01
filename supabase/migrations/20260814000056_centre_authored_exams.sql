-- 0056: a centre writes its own exams.
--
-- Until now exams and question banks were organisation-level objects that only
-- head office could write, and centres held `exam.read` so they could see what
-- their students were sitting (0023). This gives a centre its own exams,
-- decided by head office as a product change, and it is written to keep the
-- one guarantee that made the old arrangement safe.
--
-- ---------------------------------------------------------------------------
-- Why not simply grant `exam.manage` to centre roles
-- ---------------------------------------------------------------------------
--
-- Two reasons, either of which is fatal on its own.
--
-- 1. It would not work. Every exam write policy asks the ORGANISATION-level
--    question, `has_permission('exam.manage', organization_id)` with no
--    centre, and since 0020 that requires a membership which is itself
--    org-wide. A centre-scoped membership can never satisfy it, whatever
--    permissions the role holds. The grant would be inert.
--
-- 2. It would break R18. `exam_questions_read` lets `exam.manage` read the
--    paper at any time — authors are writing it. Handing that code to centres
--    would let every centre read every paper the morning before, which is the
--    single thing that policy exists to prevent.
--
-- So authorship gets its own codes, `exam.author` and `question.author`, which
-- say "may write my centre's own material" and grant nothing across the
-- organisation. `exam.manage` keeps its meaning and stays head office's.
--
-- ---------------------------------------------------------------------------
-- The pool-leak, closed here
-- ---------------------------------------------------------------------------
--
-- 0022 called exam_questions "drawn from the exam's own bank", but nothing
-- enforced it: the foreign key ties a question to the organisation, not to the
-- exam's bank. Harmless while only head office could write exams, and a leak
-- the moment a centre can. A centre would otherwise create its own exam, add
-- head office's questions to it, and read them at will because it owns the
-- exam — the whole question pool, through the front door.
--
-- `app.enforce_exam_question_bank()` below closes it for every exam, not only
-- centre-owned ones, because the rule was always the intent.

-- ---------------------------------------------------------------------------
-- Ownership
-- ---------------------------------------------------------------------------

-- Null means head office, which is every row that exists today. A centre's own
-- material carries its centre id.
alter table public.exams
  add column centre_id uuid references public.centres (id) on delete cascade;

alter table public.question_banks
  add column centre_id uuid references public.centres (id) on delete cascade;

create index exams_centre_idx
  on public.exams (centre_id) where centre_id is not null;

create index question_banks_centre_idx
  on public.question_banks (centre_id) where centre_id is not null;

-- A centre-owned exam must draw from a bank owned by the same centre. Head
-- office exams (centre_id is null) must draw from head office banks. Enforced
-- as a trigger rather than a CHECK because it spans two rows.
create function app.enforce_exam_bank_ownership()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_bank_centre uuid;
begin
  select centre_id into v_bank_centre
  from public.question_banks where id = new.bank_id;

  if new.centre_id is distinct from v_bank_centre then
    raise exception
      'An exam must draw from a question bank belonging to the same centre'
      using errcode = 'invalid_parameter_value';
  end if;

  return new;
end;
$$;

create trigger enforce_exam_bank_ownership
  before insert or update of bank_id, centre_id on public.exams
  for each row execute function app.enforce_exam_bank_ownership();

-- The paper may only contain questions from the exam's own bank. This is what
-- 0022's comment always said and never enforced; see the header.
create function app.enforce_exam_question_bank()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_exam_bank uuid;
  v_question_bank uuid;
begin
  select bank_id into v_exam_bank from public.exams where id = new.exam_id;
  select bank_id into v_question_bank
  from public.questions where id = new.question_id;

  if v_exam_bank is distinct from v_question_bank then
    raise exception
      'A question must come from the exam''s own bank'
      using errcode = 'invalid_parameter_value';
  end if;

  return new;
end;
$$;

create trigger enforce_exam_question_bank
  before insert or update on public.exam_questions
  for each row execute function app.enforce_exam_question_bank();

-- ---------------------------------------------------------------------------
-- Permissions
-- ---------------------------------------------------------------------------

insert into public.permissions (code, description) values
  ('exam.author',     'Create and edit the centre''s own exams'),
  ('question.author', 'Create and edit the centre''s own question banks')
on conflict (code) do nothing;

-- Owner and manager only. A counsellor, a faculty member and an accountant
-- keep the read-only view 0023 gave them: writing a paper is not their job,
-- and every role added here is another person who can read it early.
insert into public.role_permissions (role_id, permission_code)
select r.id, v.code
from (values
  ('centre_owner',   'exam.author'),
  ('centre_owner',   'question.author'),
  ('centre_manager', 'exam.author'),
  ('centre_manager', 'question.author')
) as v(role_code, code)
join public.roles r on r.code = v.role_code
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Policies
-- ---------------------------------------------------------------------------
--
-- Each keeps its existing branches untouched and adds one centre-scoped
-- branch. `can_access_centre` is included alongside `has_permission(..., centre)`
-- deliberately: the permission check alone is satisfied by an org-wide
-- membership, and the intent here is a centre acting on its own material.

drop policy question_banks_write on public.question_banks;
create policy question_banks_write on public.question_banks
  for all to authenticated
  using (
    app.is_platform_admin()
    or app.has_permission('question.manage', organization_id)
    or (centre_id is not null
        and app.has_permission('question.author', organization_id, centre_id)
        and app.can_access_centre(centre_id))
  )
  with check (
    app.is_platform_admin()
    or app.has_permission('question.manage', organization_id)
    or (centre_id is not null
        and app.has_permission('question.author', organization_id, centre_id)
        and app.can_access_centre(centre_id))
  );

drop policy question_banks_read on public.question_banks;
create policy question_banks_read on public.question_banks
  for select to authenticated
  using (
    app.is_platform_admin()
    or app.has_permission('question.read', organization_id)
    or (centre_id is not null and app.can_access_centre(centre_id))
  );

-- Without this a centre could write a question into its own bank and then not
-- be able to read it back: `questions_read` asks only the organisation-level
-- question, which a centre-scoped membership can never satisfy.
drop policy questions_read on public.questions;
create policy questions_read on public.questions
  for select to authenticated
  using (
    app.is_platform_admin()
    or app.has_permission('question.read', organization_id)
    or exists (
      select 1 from public.question_banks b
      where b.id = questions.bank_id
        and b.centre_id is not null
        and app.can_access_centre(b.centre_id)
    )
  );

drop policy questions_write on public.questions;
create policy questions_write on public.questions
  for all to authenticated
  using (
    app.is_platform_admin()
    or app.has_permission('question.manage', organization_id)
    or exists (
      select 1 from public.question_banks b
      where b.id = questions.bank_id
        and b.centre_id is not null
        and app.has_permission('question.author', b.organization_id, b.centre_id)
        and app.can_access_centre(b.centre_id)
    )
  )
  with check (
    app.is_platform_admin()
    or app.has_permission('question.manage', organization_id)
    or exists (
      select 1 from public.question_banks b
      where b.id = questions.bank_id
        and b.centre_id is not null
        and app.has_permission('question.author', b.organization_id, b.centre_id)
        and app.can_access_centre(b.centre_id)
    )
  );

drop policy exams_write on public.exams;
create policy exams_write on public.exams
  for all to authenticated
  using (
    app.is_platform_admin()
    or app.has_permission('exam.manage', organization_id)
    or (centre_id is not null
        and app.has_permission('exam.author', organization_id, centre_id)
        and app.can_access_centre(centre_id))
  )
  with check (
    app.is_platform_admin()
    or app.has_permission('exam.manage', organization_id)
    or (centre_id is not null
        and app.has_permission('exam.author', organization_id, centre_id)
        and app.can_access_centre(centre_id))
  );

-- A centre also sees its own drafts, which the published-and-assigned branch
-- would not show it.
drop policy exams_read on public.exams;
create policy exams_read on public.exams
  for select to authenticated
  using (
    app.is_platform_admin()
    or app.has_permission('exam.read', organization_id)
    or (status = 'published' and app.exam_is_assigned_to_my_centre(id))
    or (centre_id is not null and app.can_access_centre(centre_id))
  );

-- R18, restated precisely.
--
-- The new branch is scoped to exams the centre OWNS. A centre still cannot
-- read a head office paper before its window opens — that is the third branch
-- and it is unchanged. A centre reading its own paper early is not a leak; it
-- wrote it.
drop policy exam_questions_read on public.exam_questions;
create policy exam_questions_read on public.exam_questions
  for select to authenticated
  using (
    app.is_platform_admin()
    or app.has_permission('exam.manage', organization_id)
    or (app.exam_is_open(exam_id) and app.exam_is_assigned_to_my_centre(exam_id))
    or exists (
      select 1 from public.exams e
      where e.id = exam_questions.exam_id
        and e.centre_id is not null
        and app.has_permission('exam.author', e.organization_id, e.centre_id)
        and app.can_access_centre(e.centre_id)
    )
  );

drop policy exam_questions_write on public.exam_questions;
create policy exam_questions_write on public.exam_questions
  for all to authenticated
  using (
    app.is_platform_admin()
    or app.has_permission('exam.manage', organization_id)
    or exists (
      select 1 from public.exams e
      where e.id = exam_questions.exam_id
        and e.centre_id is not null
        and app.has_permission('exam.author', e.organization_id, e.centre_id)
        and app.can_access_centre(e.centre_id)
    )
  )
  with check (
    app.is_platform_admin()
    or app.has_permission('exam.manage', organization_id)
    or exists (
      select 1 from public.exams e
      where e.id = exam_questions.exam_id
        and e.centre_id is not null
        and app.has_permission('exam.author', e.organization_id, e.centre_id)
        and app.can_access_centre(e.centre_id)
    )
  );

-- A centre may assign its own exam, and only to itself. The `e.centre_id =
-- exam_assignments.centre_id` equality is what stops a centre pushing its
-- paper onto another centre's students.
drop policy exam_assignments_write on public.exam_assignments;
create policy exam_assignments_write on public.exam_assignments
  for all to authenticated
  using (
    app.is_platform_admin()
    or app.has_permission('exam.manage', organization_id)
    or exists (
      select 1 from public.exams e
      where e.id = exam_assignments.exam_id
        and e.centre_id = exam_assignments.centre_id
        and app.has_permission('exam.author', e.organization_id, e.centre_id)
        and app.can_access_centre(e.centre_id)
    )
  )
  with check (
    app.is_platform_admin()
    or app.has_permission('exam.manage', organization_id)
    or exists (
      select 1 from public.exams e
      where e.id = exam_assignments.exam_id
        and e.centre_id = exam_assignments.centre_id
        and app.has_permission('exam.author', e.organization_id, e.centre_id)
        and app.can_access_centre(e.centre_id)
    )
  );
