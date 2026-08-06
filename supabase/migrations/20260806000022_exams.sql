-- 0022: exams — the second Phase 4 slice.
--
-- An exam is a fixed, ordered paper drawn from one question bank, scheduled in
-- a window, and assigned to centres. No attempts yet: this slice is what a
-- student would sit, not the sitting of it.
--
-- Deliberately NOT blocked on C7. That conflict is about how a graded attempt
-- becomes a published result, which is two slices away — nothing here touches
-- result_publications. Worth saying because "exams are blocked on C7" was the
-- reading, and it was too broad.

-- ---------------------------------------------------------------------------
-- Status: editorial state only.
--
-- Not 'open' / 'closed'. Whether an exam is live right now is a question about
-- the clock, and it is already answered by opens_at and closes_at; a status
-- column that also claimed to answer it would be a second source of truth that
-- drifts the moment a scheduled job fails to run. So: draft is being written,
-- published is released to its centres, cancelled is called off. Live-ness is
-- `published and now() between opens_at and closes_at`, computed, never stored.
-- ---------------------------------------------------------------------------
create type public.exam_status as enum ('draft', 'published', 'cancelled');

create table public.exams (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  bank_id uuid not null,
  course_id uuid references public.courses (id),
  title text not null,
  instructions text,
  duration_minutes int not null check (duration_minutes between 1 and 600),
  opens_at timestamptz not null,
  closes_at timestamptz not null,
  -- One attempt unless stated otherwise. C8(d) — whether a student may retake
  -- an exam they have already passed — is still open; this column carries the
  -- count, not that rule.
  max_attempts int not null default 1 check (max_attempts between 1 and 10),
  pass_percent int not null default 40 check (pass_percent between 0 and 100),
  status public.exam_status not null default 'draft',
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  constraint exams_title_not_blank check (length(btrim(title)) > 0),
  constraint exams_window_ordered check (closes_at > opens_at),
  foreign key (bank_id, organization_id)
    references public.question_banks (id, organization_id),
  unique (id, organization_id)
);

create index exams_org_status_idx on public.exams (organization_id, status, opens_at);

-- The paper. Ordered, fixed, drawn from the exam's own bank.
--
-- `marks_override` exists because the same question can be worth two marks in a
-- unit test and five in a final; without it a bank could only ever be used at
-- one weight. Null means "use the question's own marks".
create table public.exam_questions (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null,
  question_id uuid not null,
  organization_id uuid not null,
  display_order int not null,
  marks_override int check (marks_override > 0),
  foreign key (exam_id, organization_id)
    references public.exams (id, organization_id) on delete cascade,
  foreign key (question_id, organization_id)
    references public.questions (id, organization_id),
  unique (exam_id, question_id)
);

create index exam_questions_exam_idx on public.exam_questions (exam_id, display_order);

-- Who sits it. Centre-level for now.
--
-- Build plan §2.4 ships /centre/exams/[id]/eligibility, implying centres decide
-- who sits an exam, while §4 gives centre roles read-only on exam.*. That
-- contradiction is C8's sixth item and is unresolved, so this is head-office
-- assigns, centre reads — the reversible half. Student-level eligibility is a
-- column away when the decision lands.
create table public.exam_assignments (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null,
  organization_id uuid not null,
  centre_id uuid not null references public.centres (id) on delete cascade,
  created_at timestamptz not null default now(),
  created_by uuid,
  foreign key (exam_id, organization_id)
    references public.exams (id, organization_id) on delete cascade,
  unique (exam_id, centre_id)
);

create index exam_assignments_centre_idx on public.exam_assignments (centre_id);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

-- Is this exam released and inside its window right now?
--
-- Times are stored UTC and compared against now(); the Asia/Kolkata business
-- day (build plan R13) matters for *presenting* a window, not for deciding
-- whether an instant falls inside one.
create function app.exam_is_open(p_exam_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.exams e
    where e.id = p_exam_id
      and e.status = 'published'
      and now() >= e.opens_at
      and now() < e.closes_at
  );
$$;

-- Is this exam assigned to a centre the caller can act for?
create function app.exam_is_assigned_to_my_centre(p_exam_id uuid)
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
      and app.can_access_centre(a.centre_id)
  );
$$;

revoke all on function app.exam_is_open(uuid) from public, anon;
revoke all on function app.exam_is_assigned_to_my_centre(uuid) from public, anon;
grant execute on function app.exam_is_open(uuid) to authenticated;
grant execute on function app.exam_is_assigned_to_my_centre(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------

alter table public.exams enable row level security;
alter table public.exams force row level security;
alter table public.exam_questions enable row level security;
alter table public.exam_questions force row level security;
alter table public.exam_assignments enable row level security;
alter table public.exam_assignments force row level security;

-- Head office sees every exam. A centre sees only exams assigned to it, and
-- only once published — an unpublished exam is a draft somebody is still
-- writing, and its existence is not a centre's business.
create policy exams_read on public.exams
  for select to authenticated
  using (
    app.is_platform_admin()
    or app.has_permission('exam.read', organization_id)
    or (status = 'published' and app.exam_is_assigned_to_my_centre(id))
  );

create policy exams_write on public.exams
  for all to authenticated
  using (
    app.is_platform_admin()
    or app.has_permission('exam.manage', organization_id)
  )
  with check (
    app.is_platform_admin()
    or app.has_permission('exam.manage', organization_id)
  );

-- R18: "a centre user reads exam_questions before the window opens → 0 rows".
--
-- This is the time-windowed policy that test is about. Authors see the paper
-- whenever they like — they are writing it. Everybody else sees it only while
-- the exam is actually open, so a centre cannot read the paper the morning
-- before and neither can anyone they hand it to.
create policy exam_questions_read on public.exam_questions
  for select to authenticated
  using (
    app.is_platform_admin()
    or app.has_permission('exam.manage', organization_id)
    or (app.exam_is_open(exam_id) and app.exam_is_assigned_to_my_centre(exam_id))
  );

create policy exam_questions_write on public.exam_questions
  for all to authenticated
  using (
    app.is_platform_admin()
    or app.has_permission('exam.manage', organization_id)
  )
  with check (
    app.is_platform_admin()
    or app.has_permission('exam.manage', organization_id)
  );

create policy exam_assignments_read on public.exam_assignments
  for select to authenticated
  using (
    app.is_platform_admin()
    or app.has_permission('exam.read', organization_id)
    or app.can_access_centre(centre_id)
  );

create policy exam_assignments_write on public.exam_assignments
  for all to authenticated
  using (
    app.is_platform_admin()
    or app.has_permission('exam.manage', organization_id)
  )
  with check (
    app.is_platform_admin()
    or app.has_permission('exam.manage', organization_id)
  );

-- ---------------------------------------------------------------------------
-- A published exam has to be sittable.
--
-- Enforced here rather than in the form, because "published" is a state a
-- crafted request can set directly and an empty paper is not a recoverable
-- mistake once students are looking at it.
-- ---------------------------------------------------------------------------
create function app.exams_publish_guard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'published' and (old.status is distinct from 'published') then
    if not exists (select 1 from public.exam_questions q where q.exam_id = new.id) then
      raise exception 'An exam cannot be published with no questions'
        using errcode = 'invalid_parameter_value';
    end if;
    if not exists (select 1 from public.exam_assignments a where a.exam_id = new.id) then
      raise exception 'An exam cannot be published before it is assigned to a centre'
        using errcode = 'invalid_parameter_value';
    end if;
  end if;
  return new;
end;
$$;

create trigger exams_publish_guard
  before insert or update on public.exams
  for each row execute function app.exams_publish_guard();

create trigger audit_changes
  after insert or update or delete on public.exams
  for each row execute function app.audit_trigger();

create trigger audit_changes
  after insert or update or delete on public.exam_assignments
  for each row execute function app.audit_trigger();
