-- =====================================================================
-- RUN ALL — every schema change this application expects, in one file.
--
-- Supabase Dashboard -> SQL Editor, project etxhjiawkpinmardkjzv.
-- Paste the whole thing and run once. Safe to re-run: every statement is
-- `if not exists`, `or replace`, or preceded by a `drop ... if exists`.
--
-- Probed against the live database on 2026-09-22.
-- NONE of PART 1 is applied yet. Until it runs, five screens are inert:
--
--     students.parentage / maritalStatus            Admission form
--     batch_timings.classMode/breakStart/breakEnd/colour   Batch Timing
--     course_modules, course_chapters               Course Syllabus
--     admission_leads, admission_lead_activities    Admission Leads
--     franchise_leads, franchise_lead_activities    Branch Leads
--     practice_files                                Code Lab, Whiteboard
--
-- PART 2 and PART 3 were probed as already applied. They are here so this one
-- file is the whole story, and so a fresh database can be brought up with it.
-- =====================================================================


-- =====================================================================
-- PART 0 — THE CLAIM HELPERS
-- =====================================================================
--
-- Every policy below calls one of these, and Postgres resolves a function at
-- CREATE POLICY time -- so they go first. The migrations they come from
-- define them again identically further down; `create or replace` makes that
-- a no-op rather than a conflict.
--
-- They read `app_metadata`, never `user_metadata`: a user can rewrite their
-- own user_metadata with supabase.auth.updateUser(), so trusting it here
-- would let anyone grant themselves an admin role. Only the service role
-- writes app_metadata, which is what the create-branch-user edge function
-- does.

create or replace function public.jwt_role()
returns text language sql stable as $$
  select upper(coalesce(auth.jwt() -> 'app_metadata' ->> 'role', ''));
$$;

create or replace function public.jwt_org_id()
returns text language sql stable as $$
  select auth.jwt() -> 'app_metadata' ->> 'organizationId';
$$;

create or replace function public.jwt_branch_id()
returns text language sql stable as $$
  select auth.jwt() -> 'app_metadata' ->> 'branchId';
$$;

create or replace function public.is_org_admin()
returns boolean language sql stable as $$
  select public.jwt_role() in ('SUPER_ADMIN', 'ORGANIZATION_ADMIN');
$$;


-- =====================================================================
-- PART 1 — NOT APPLIED YET. This is the part that changes something.
-- =====================================================================


-- ---------- add-student-parentage.sql ----------
-- How a student is named on their own paperwork, and whether they are married.
--
-- Certificates and marksheets read "Krishna Singh, S/o Ram Singh", and a
-- married woman is named "W/o" rather than "D/o" — which the admission form
-- had no way to record, so every document had to assume one of them.
--
-- `guardianRelation` already exists and means something else: it is the local
-- guardian's relation to the student (Uncle, Aunt, …), not the student's own
-- parentage line.
--
-- Run once in the Supabase SQL editor. Safe to re-run.
alter table public.students
  add column if not exists "parentage" text,
  add column if not exists "maritalStatus" text;


-- ---------- certificate-wallet-charge.sql ----------
-- =====================================================================
-- Certificate fee, charged to the centre's wallet
-- =====================================================================
-- Each centre (branch) has its own price for a student's completion
-- certificate, set by the head office. Issuing a student's certificate takes
-- that price out of the centre's wallet, once: printing the same student's
-- certificate again is free. The student's own download from the portal
-- counts as generating it too, so the portal cannot be used to skip the fee.
--
-- The fee lives in its own table, not on `branches`: every login can write
-- `branches`, and a centre must not be able to set its own price to zero.
-- The charge is made by issue_certificate(), which locks the wallet so two
-- prints at once cannot both pass the balance check or both charge.
--
-- Run once in the Supabase SQL editor. Safe to re-run.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 0. The claim helpers (defined identically in the RLS migrations).
-- ---------------------------------------------------------------------
create or replace function public.jwt_role()
returns text language sql stable as $$
  select upper(coalesce(auth.jwt() -> 'app_metadata' ->> 'role', ''));
$$;

create or replace function public.jwt_branch_id()
returns text language sql stable as $$
  select auth.jwt() -> 'app_metadata' ->> 'branchId';
$$;

create or replace function public.jwt_student_id()
returns text language sql stable as $$
  select auth.jwt() -> 'app_metadata' ->> 'studentId';
$$;

create or replace function public.is_org_admin()
returns boolean language sql stable as $$
  select public.jwt_role() in ('SUPER_ADMIN', 'ORGANIZATION_ADMIN');
$$;


-- ---------------------------------------------------------------------
-- 1. A wallet debit is paid from the wallet, which the method list lacked.
-- ---------------------------------------------------------------------
do $$
begin
  if exists (select 1 from pg_type where typname = 'PaymentMethod') then
    alter type "PaymentMethod" add value if not exists 'WALLET';
  end if;
end $$;


-- ---------------------------------------------------------------------
-- 2. The price per centre. No row, or 0, means the centre is not charged.
-- ---------------------------------------------------------------------
create table if not exists public.branch_certificate_fees (
  "branchId"  text primary key references public.branches("id") on delete cascade,
  "amount"    double precision not null default 0 check ("amount" >= 0),
  "updatedBy" text,
  "updatedAt" timestamptz not null default now()
);

alter table public.branch_certificate_fees enable row level security;

drop policy if exists "Fee readable by its centre or admin" on public.branch_certificate_fees;
create policy "Fee readable by its centre or admin" on public.branch_certificate_fees
  for select to authenticated
  using (public.is_org_admin() or "branchId" = public.jwt_branch_id());

drop policy if exists "Fee set by admin" on public.branch_certificate_fees;
create policy "Fee set by admin" on public.branch_certificate_fees
  for all to authenticated
  using (public.is_org_admin())
  with check (public.is_org_admin());


-- ---------------------------------------------------------------------
-- 3. Which students' certificates have been issued, and what was charged.
--    Written only by issue_certificate(); there is no insert policy.
-- ---------------------------------------------------------------------
create table if not exists public.certificate_issues (
  "id"            text primary key default gen_random_uuid()::text,
  "studentId"     text not null unique references public.students("id") on delete cascade,
  "branchId"      text not null,
  "amount"        double precision not null default 0,
  "transactionId" text,
  "issuedBy"      text,
  "issuedAt"      timestamptz not null default now()
);

create index if not exists "certificate_issues_branchId_idx"
  on public.certificate_issues ("branchId");

alter table public.certificate_issues enable row level security;

drop policy if exists "Issue readable by centre, admin or the student" on public.certificate_issues;
create policy "Issue readable by centre, admin or the student" on public.certificate_issues
  for select to authenticated
  using (
    public.is_org_admin()
    or "branchId" = public.jwt_branch_id()
    or "studentId" = public.jwt_student_id()
  );


-- ---------------------------------------------------------------------
-- 4. issue_certificate: charge the centre once, then record the issue.
--
--    Returns { charged, alreadyIssued, amount, balance }. Raises
--    INSUFFICIENT_BALANCE when the wallet cannot cover the fee, so the
--    certificate is not printed and nothing is taken.
-- ---------------------------------------------------------------------
create or replace function public.issue_certificate(p_student_id text, p_issued_by text default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student record;
  v_issue   record;
  v_wallet  record;
  v_fee     double precision;
  v_balance double precision;
  v_tx_id   text;
  v_now     timestamp(3) := current_timestamp;
begin
  select "id", "branchId", "firstName", "lastName", "enrollmentNo", "applicationNo"
    into v_student
    from public.students
   where "id" = p_student_id and "deletedAt" is null;
  if not found then
    raise exception 'Student not found.';
  end if;

  -- The head office, the student's own centre, or the student downloading
  -- their own certificate from the portal. Whoever generates it first, the
  -- centre pays once. A student's login carries their centre's branchId
  -- too, so the centre path is closed to students: they issue their own
  -- certificate only. Coalesced: a login without a branch or student claim
  -- compares as NULL, and `not NULL` would let it through.
  if not coalesce(
    public.is_org_admin()
    or (public.jwt_role() <> 'STUDENT' and v_student."branchId" = public.jwt_branch_id())
    or (public.jwt_role() = 'STUDENT' and v_student."id" = public.jwt_student_id()),
    false
  ) then
    raise exception 'Not allowed to issue this student''s certificate.';
  end if;

  -- One issue per student; the lock makes a second print wait for the first.
  perform pg_advisory_xact_lock(hashtext('certificate:' || p_student_id));
  select * into v_issue from public.certificate_issues where "studentId" = p_student_id;
  if found then
    return jsonb_build_object('charged', false, 'alreadyIssued', true, 'amount', v_issue."amount");
  end if;

  select coalesce(max("amount"), 0) into v_fee
    from public.branch_certificate_fees
   where "branchId" = v_student."branchId";

  if v_fee > 0 then
    select * into v_wallet
      from public.branch_wallets
     where "branchId" = v_student."branchId"
     for update;

    -- A centre never recharged has no wallet row, which is a balance of 0.
    if not found then
      raise exception 'INSUFFICIENT_BALANCE: certificate fee is Rs %, wallet balance is Rs 0.', v_fee;
    end if;
    if coalesce(v_wallet."balance", 0) < v_fee then
      raise exception 'INSUFFICIENT_BALANCE: certificate fee is Rs %, wallet balance is Rs %.',
        v_fee, coalesce(v_wallet."balance", 0);
    end if;

    v_balance := v_wallet."balance" - v_fee;
    update public.branch_wallets
       set "balance" = v_balance, "updatedAt" = v_now
     where "id" = v_wallet."id";

    v_tx_id := gen_random_uuid()::text;
    insert into public.branch_transactions (
      "id", "branchId", "amount", "type", "category", "description", "reference",
      "status", "paymentMethod", "balanceAfter", "reviewedBy", "createdAt", "updatedAt"
    ) values (
      v_tx_id, v_student."branchId", v_fee, 'DEBIT', 'CERTIFICATE',
      'Certificate fee - ' || trim(v_student."firstName" || ' ' || v_student."lastName"),
      'CERT-' || coalesce(v_student."enrollmentNo", v_student."applicationNo", v_student."id"),
      'COMPLETED', 'WALLET', v_balance, p_issued_by, v_now, v_now
    );
  end if;

  insert into public.certificate_issues ("studentId", "branchId", "amount", "transactionId", "issuedBy")
  values (p_student_id, v_student."branchId", v_fee, v_tx_id, p_issued_by);

  return jsonb_build_object('charged', v_fee > 0, 'alreadyIssued', false, 'amount', v_fee, 'balance', v_balance);
end;
$$;

revoke all on function public.issue_certificate(text, text) from public, anon;
grant execute on function public.issue_certificate(text, text) to authenticated;


-- ---------- exam-workflow.sql ----------
-- =====================================================================
-- Exam workflow: subjects → exam centre → schedule → admit card →
-- marksheet → certificate, with public verification.
-- =====================================================================
-- What a vocational institute actually runs, in order:
--
--   1. course_subjects   each course's papers, term by term (1st Year,
--                        2nd Semester …), with theory and practical
--                        minimum and maximum marks
--   2. exam_centres      where the examination is held
--   3. exam_schedules    for a centre + course + term + session: the date
--                        and time of every paper, at one exam centre
--   4. admit_cards       a student's roll number for a term, issued from
--                        the schedule
--   5. marksheets        a student's theory and practical marks for a term,
--                        with the totals, grade and result worked out
--   6. certificate_issues (certificate-wallet-charge.sql) gains the issue and
--                        examination dates and a certificate number; a
--                        student with an issued certificate is a passout
--
-- The older per-paper `exams` / `exam_results` stay as they are, so nothing
-- recorded there is lost.
--
-- Public verification functions let the website look up an admit card,
-- a result (enrolment number + date of birth) and a certificate without a
-- login, returning only what those pages show.
--
-- Needs certificate-wallet-charge.sql first. Run once in the Supabase SQL
-- editor. Safe to re-run.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 0. Claim helpers (defined identically in the RLS migrations).
-- ---------------------------------------------------------------------
create or replace function public.jwt_role()
returns text language sql stable as $$
  select upper(coalesce(auth.jwt() -> 'app_metadata' ->> 'role', ''));
$$;

create or replace function public.jwt_branch_id()
returns text language sql stable as $$
  select auth.jwt() -> 'app_metadata' ->> 'branchId';
$$;

create or replace function public.jwt_student_id()
returns text language sql stable as $$
  select auth.jwt() -> 'app_metadata' ->> 'studentId';
$$;

create or replace function public.is_org_admin()
returns boolean language sql stable as $$
  select public.jwt_role() in ('SUPER_ADMIN', 'ORGANIZATION_ADMIN');
$$;

-- A centre's own staff: the branch claim, and not a student (whose login
-- carries their centre's branchId too).
create or replace function public.is_branch_staff(p_branch_id text)
returns boolean language sql stable as $$
  select coalesce(public.jwt_role() <> 'STUDENT' and p_branch_id = public.jwt_branch_id(), false);
$$;


-- ---------------------------------------------------------------------
-- 1. How a course is divided into terms. NULL means "work it out from the
--    duration": a course of more than a year runs in years, anything
--    shorter is one term.
-- ---------------------------------------------------------------------
alter table public.courses
  add column if not exists "termType"  text,
  add column if not exists "termCount" integer;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'courses_termType_check') then
    alter table public.courses
      add constraint "courses_termType_check"
      check ("termType" is null or "termType" in ('SINGLE', 'YEAR', 'SEMESTER'));
  end if;
end $$;


-- ---------------------------------------------------------------------
-- 2. course_subjects
-- ---------------------------------------------------------------------
create table if not exists public.course_subjects (
  "id"            text primary key default gen_random_uuid()::text,
  "courseId"      text not null references public.courses("id") on delete cascade,
  "term"          integer not null default 1 check ("term" >= 1),
  "code"          text,
  "name"          text not null,
  "subjectType"   text not null default 'THEORY' check ("subjectType" in ('THEORY', 'PRACTICAL', 'BOTH')),
  "theoryMax"     numeric not null default 0 check ("theoryMax" >= 0),
  "theoryMin"     numeric not null default 0 check ("theoryMin" >= 0),
  "practicalMax"  numeric not null default 0 check ("practicalMax" >= 0),
  "practicalMin"  numeric not null default 0 check ("practicalMin" >= 0),
  "sortOrder"     integer not null default 0,
  "createdAt"     timestamptz not null default now(),
  "updatedAt"     timestamptz not null default now(),
  "deletedAt"     timestamptz
);

create index if not exists "course_subjects_course_term_idx"
  on public.course_subjects ("courseId", "term", "sortOrder");

alter table public.course_subjects enable row level security;

drop policy if exists "Subjects readable by every login" on public.course_subjects;
create policy "Subjects readable by every login" on public.course_subjects
  for select to authenticated using (true);

drop policy if exists "Subjects written by admin" on public.course_subjects;
create policy "Subjects written by admin" on public.course_subjects
  for all to authenticated
  using (public.is_org_admin()) with check (public.is_org_admin());


-- ---------------------------------------------------------------------
-- 3. exam_centres
-- ---------------------------------------------------------------------
create table if not exists public.exam_centres (
  "id"             text primary key default gen_random_uuid()::text,
  "organizationId" text,
  "name"           text not null,
  "code"           text,
  "address"        text,
  "createdAt"      timestamptz not null default now(),
  "updatedAt"      timestamptz not null default now(),
  "deletedAt"      timestamptz
);

alter table public.exam_centres enable row level security;

drop policy if exists "Exam centres readable by every login" on public.exam_centres;
create policy "Exam centres readable by every login" on public.exam_centres
  for select to authenticated using (true);

drop policy if exists "Exam centres written by admin" on public.exam_centres;
create policy "Exam centres written by admin" on public.exam_centres
  for all to authenticated
  using (public.is_org_admin()) with check (public.is_org_admin());


-- ---------------------------------------------------------------------
-- 4. exam_schedules: one per centre + course + term + session.
--    items: [{ "subjectId", "date": "yyyy-mm-dd", "time": "hh:mm" }]
-- ---------------------------------------------------------------------
create table if not exists public.exam_schedules (
  "id"           text primary key default gen_random_uuid()::text,
  "branchId"     text not null references public.branches("id") on delete cascade,
  "courseId"     text not null references public.courses("id") on delete cascade,
  "term"         integer not null default 1 check ("term" >= 1),
  "session"      text not null,
  "examCentreId" text references public.exam_centres("id") on delete set null,
  "items"        jsonb not null default '[]'::jsonb,
  "createdBy"    text,
  "createdAt"    timestamptz not null default now(),
  "updatedAt"    timestamptz not null default now(),
  unique ("branchId", "courseId", "term", "session")
);

alter table public.exam_schedules enable row level security;

drop policy if exists "Schedules readable by centre, admin or its students" on public.exam_schedules;
create policy "Schedules readable by centre, admin or its students" on public.exam_schedules
  for select to authenticated
  using (public.is_org_admin() or "branchId" = public.jwt_branch_id());

drop policy if exists "Schedules written by centre or admin" on public.exam_schedules;
create policy "Schedules written by centre or admin" on public.exam_schedules
  for all to authenticated
  using (public.is_org_admin() or public.is_branch_staff("branchId"))
  with check (public.is_org_admin() or public.is_branch_staff("branchId"));


-- ---------------------------------------------------------------------
-- 5. admit_cards: one per student per term.
-- ---------------------------------------------------------------------
create table if not exists public.admit_cards (
  "id"           text primary key default gen_random_uuid()::text,
  "studentId"    text not null references public.students("id") on delete cascade,
  "branchId"     text not null,
  "courseId"     text,
  "term"         integer not null default 1 check ("term" >= 1),
  "session"      text,
  "rollNo"       text not null,
  "examCentreId" text references public.exam_centres("id") on delete set null,
  "scheduleId"   text references public.exam_schedules("id") on delete set null,
  "isFinal"      boolean not null default false,
  "issuedBy"     text,
  "issuedAt"     timestamptz not null default now(),
  "updatedAt"    timestamptz not null default now(),
  unique ("studentId", "term")
);

create index if not exists "admit_cards_branch_idx" on public.admit_cards ("branchId");

alter table public.admit_cards enable row level security;

drop policy if exists "Admit cards readable by centre, admin or the student" on public.admit_cards;
create policy "Admit cards readable by centre, admin or the student" on public.admit_cards
  for select to authenticated
  using (
    public.is_org_admin()
    or public.is_branch_staff("branchId")
    or "studentId" = public.jwt_student_id()
  );

drop policy if exists "Admit cards written by centre or admin" on public.admit_cards;
create policy "Admit cards written by centre or admin" on public.admit_cards
  for all to authenticated
  using (public.is_org_admin() or public.is_branch_staff("branchId"))
  with check (public.is_org_admin() or public.is_branch_staff("branchId"));


-- ---------------------------------------------------------------------
-- 6. marksheets: one per student per term.
--    marks: [{ subjectId, code, name, subjectType, theoryMax, theoryMin,
--              theory, practicalMax, practicalMin, practical }]
-- ---------------------------------------------------------------------
create table if not exists public.marksheets (
  "id"            text primary key default gen_random_uuid()::text,
  "studentId"     text not null references public.students("id") on delete cascade,
  "branchId"      text not null,
  "courseId"      text,
  "term"          integer not null default 1 check ("term" >= 1),
  "session"       text,
  "issueDate"     date not null default current_date,
  "marks"         jsonb not null default '[]'::jsonb,
  "totalObtained" numeric not null default 0,
  "totalMax"      numeric not null default 0,
  "percentage"    numeric not null default 0,
  "grade"         text,
  "result"        text not null default 'PASS' check ("result" in ('PASS', 'FAIL')),
  "isFinal"       boolean not null default false,
  "marksheetNo"   text,
  "createdBy"     text,
  "createdAt"     timestamptz not null default now(),
  "updatedAt"     timestamptz not null default now(),
  unique ("studentId", "term")
);

create index if not exists "marksheets_branch_idx" on public.marksheets ("branchId");

alter table public.marksheets enable row level security;

drop policy if exists "Marksheets readable by centre, admin or the student" on public.marksheets;
create policy "Marksheets readable by centre, admin or the student" on public.marksheets
  for select to authenticated
  using (
    public.is_org_admin()
    or public.is_branch_staff("branchId")
    or "studentId" = public.jwt_student_id()
  );

drop policy if exists "Marksheets written by centre or admin" on public.marksheets;
create policy "Marksheets written by centre or admin" on public.marksheets
  for all to authenticated
  using (public.is_org_admin() or public.is_branch_staff("branchId"))
  with check (public.is_org_admin() or public.is_branch_staff("branchId"));


-- ---------------------------------------------------------------------
-- 7. Certificates: the dates printed on them and a number to verify by.
-- ---------------------------------------------------------------------
alter table public.certificate_issues
  add column if not exists "issueDate"         date,
  add column if not exists "examConductedDate" date,
  add column if not exists "certificateNo"     text;

-- issue_certificate gains the two dates. The two-argument form is dropped so
-- a call naming p_student_id and p_issued_by is not ambiguous between them.
drop function if exists public.issue_certificate(text, text);

create or replace function public.issue_certificate(
  p_student_id  text,
  p_issued_by   text default null,
  p_issue_date  date default null,
  p_exam_date   date default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student record;
  v_issue   record;
  v_wallet  record;
  v_fee     double precision;
  v_balance double precision;
  v_tx_id   text;
  v_now     timestamp(3) := current_timestamp;
  v_no      text;
begin
  select "id", "branchId", "firstName", "lastName", "enrollmentNo", "applicationNo"
    into v_student
    from public.students
   where "id" = p_student_id and "deletedAt" is null;
  if not found then
    raise exception 'Student not found.';
  end if;

  -- The head office, the student's own centre, or the student downloading
  -- their own certificate from the portal. A student's login carries their
  -- centre's branchId too, so the centre path is closed to students.
  if not coalesce(
    public.is_org_admin()
    or public.is_branch_staff(v_student."branchId")
    or (public.jwt_role() = 'STUDENT' and v_student."id" = public.jwt_student_id()),
    false
  ) then
    raise exception 'Not allowed to issue this student''s certificate.';
  end if;

  perform pg_advisory_xact_lock(hashtext('certificate:' || p_student_id));
  select * into v_issue from public.certificate_issues where "studentId" = p_student_id;
  if found then
    -- Already issued: free to print again. The office may correct the dates.
    if (p_issue_date is not null or p_exam_date is not null) and public.jwt_role() <> 'STUDENT' then
      update public.certificate_issues
         set "issueDate" = coalesce(p_issue_date, "issueDate"),
             "examConductedDate" = coalesce(p_exam_date, "examConductedDate")
       where "id" = v_issue."id";
    end if;
    return jsonb_build_object('charged', false, 'alreadyIssued', true, 'amount', v_issue."amount",
                              'certificateNo', v_issue."certificateNo");
  end if;

  -- A student on the marksheet workflow needs a passed final marksheet.
  if exists (select 1 from public.marksheets where "studentId" = p_student_id)
     and not exists (select 1 from public.marksheets
                      where "studentId" = p_student_id and "isFinal" and "result" = 'PASS') then
    raise exception 'NOT_ELIGIBLE: the student has no passed final-term marksheet yet.';
  end if;

  select coalesce(max("amount"), 0) into v_fee
    from public.branch_certificate_fees
   where "branchId" = v_student."branchId";

  if v_fee > 0 then
    select * into v_wallet
      from public.branch_wallets
     where "branchId" = v_student."branchId"
     for update;

    -- A centre never recharged has no wallet row, which is a balance of 0.
    if not found then
      raise exception 'INSUFFICIENT_BALANCE: certificate fee is Rs %, wallet balance is Rs 0.', v_fee;
    end if;
    if coalesce(v_wallet."balance", 0) < v_fee then
      raise exception 'INSUFFICIENT_BALANCE: certificate fee is Rs %, wallet balance is Rs %.',
        v_fee, coalesce(v_wallet."balance", 0);
    end if;

    v_balance := v_wallet."balance" - v_fee;
    update public.branch_wallets
       set "balance" = v_balance, "updatedAt" = v_now
     where "id" = v_wallet."id";

    v_tx_id := gen_random_uuid()::text;
    insert into public.branch_transactions (
      "id", "branchId", "amount", "type", "category", "description", "reference",
      "status", "paymentMethod", "balanceAfter", "reviewedBy", "createdAt", "updatedAt"
    ) values (
      v_tx_id, v_student."branchId", v_fee, 'DEBIT', 'CERTIFICATE',
      'Certificate fee - ' || trim(v_student."firstName" || ' ' || v_student."lastName"),
      'CERT-' || coalesce(v_student."enrollmentNo", v_student."applicationNo", v_student."id"),
      'COMPLETED', 'WALLET', v_balance, p_issued_by, v_now, v_now
    );
  end if;

  v_no := 'CERT-' || coalesce(nullif(v_student."enrollmentNo", ''), nullif(v_student."applicationNo", ''), left(v_student."id", 8));

  insert into public.certificate_issues
    ("studentId", "branchId", "amount", "transactionId", "issuedBy", "issueDate", "examConductedDate", "certificateNo")
  values
    (p_student_id, v_student."branchId", v_fee, v_tx_id, p_issued_by,
     coalesce(p_issue_date, current_date), p_exam_date, v_no);

  return jsonb_build_object('charged', v_fee > 0, 'alreadyIssued', false, 'amount', v_fee,
                            'balance', v_balance, 'certificateNo', v_no);
end;
$$;

revoke all on function public.issue_certificate(text, text, date, date) from public, anon;
grant execute on function public.issue_certificate(text, text, date, date) to authenticated;


-- ---------------------------------------------------------------------
-- 8. Public verification. Each looks a student up by enrolment number
--    (case-insensitive, trimmed) and returns only what the page prints.
--    No phone, address or e-mail leaves the database through these.
-- ---------------------------------------------------------------------
create or replace function public.public_student_core(p_enrollment text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'id', s."id",
    'name', trim(concat_ws(' ', s."firstName", s."middleName", s."lastName")),
    'fatherName', s."fatherName",
    'enrollmentNo', coalesce(s."enrollmentNo", s."applicationNo"),
    'admissionDate', s."admissionDate",
    'course', c."name",
    'courseCode', c."code",
    'centre', b."name",
    'centreCode', b."code"
  )
  from public.students s
  left join public.courses c on c."id" = s."courseId"
  left join public.branches b on b."id" = s."branchId"
  where s."deletedAt" is null
    -- Enrolment number, or the application number a student has until one
    -- is issued: many records carry only the second.
    and (upper(trim(s."enrollmentNo")) = upper(trim(p_enrollment))
         or upper(trim(s."applicationNo")) = upper(trim(p_enrollment)))
  order by (upper(trim(s."enrollmentNo")) = upper(trim(p_enrollment))) desc nulls last
  limit 1;
$$;
revoke all on function public.public_student_core(text) from public, anon, authenticated;

-- How the student's course divides into terms, so a page can name "2nd Year".
create or replace function public.public_course_terms(p_course_id text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object('termType', c."termType", 'termCount', c."termCount",
                            'durationValue', c."durationValue", 'durationUnit', c."durationUnit")
  from public.courses c where c."id" = p_course_id;
$$;
revoke all on function public.public_course_terms(text) from public, anon, authenticated;

create or replace function public.verify_enrollment(p_enrollment text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare v jsonb;
begin
  v := public.public_student_core(p_enrollment);
  if v is null then return jsonb_build_object('found', false); end if;
  return jsonb_build_object('found', true, 'student', v - 'id');
end;
$$;

create or replace function public.verify_result(p_enrollment text, p_dob date)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v jsonb;
  v_dob date;
  v_sheets jsonb;
begin
  v := public.public_student_core(p_enrollment);
  if v is null then return jsonb_build_object('found', false); end if;
  select ("dateOfBirth")::date into v_dob from public.students where "id" = v ->> 'id';
  if v_dob is distinct from p_dob then
    return jsonb_build_object('found', false);
  end if;
  select coalesce(jsonb_agg(jsonb_build_object(
           'term', m."term", 'session', m."session", 'issueDate', m."issueDate",
           'marks', m."marks", 'totalObtained', m."totalObtained", 'totalMax', m."totalMax",
           'percentage', m."percentage", 'grade', m."grade", 'result', m."result",
           'isFinal', m."isFinal", 'marksheetNo', m."marksheetNo"
         ) order by m."term"), '[]'::jsonb)
    into v_sheets
    from public.marksheets m
   where m."studentId" = v ->> 'id';
  return jsonb_build_object('found', true, 'student', v - 'id', 'marksheets', v_sheets,
    'courseTerms', public.public_course_terms((select "courseId" from public.students where "id" = v ->> 'id')));
end;
$$;

create or replace function public.verify_certificate(p_enrollment text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v jsonb;
  v_cert record;
  v_final record;
begin
  v := public.public_student_core(p_enrollment);
  if v is null then return jsonb_build_object('found', false); end if;
  select * into v_cert from public.certificate_issues where "studentId" = v ->> 'id';
  if not found then return jsonb_build_object('found', true, 'issued', false, 'student', v - 'id'); end if;
  select "percentage", "grade" into v_final
    from public.marksheets where "studentId" = v ->> 'id' and "isFinal" order by "term" desc limit 1;
  return jsonb_build_object(
    'found', true, 'issued', true, 'student', v - 'id',
    'certificateNo', v_cert."certificateNo",
    'issueDate', coalesce(v_cert."issueDate", v_cert."issuedAt"::date),
    'examConductedDate', v_cert."examConductedDate",
    'percentage', v_final."percentage", 'grade', v_final."grade"
  );
end;
$$;

create or replace function public.public_admit_card(p_enrollment text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v jsonb;
  v_card record;
  v_centre record;
  v_items jsonb;
begin
  v := public.public_student_core(p_enrollment);
  if v is null then return jsonb_build_object('found', false); end if;
  select * into v_card from public.admit_cards
   where "studentId" = v ->> 'id' order by "term" desc, "issuedAt" desc limit 1;
  if not found then return jsonb_build_object('found', true, 'issued', false, 'student', v - 'id'); end if;
  select "name", "code", "address" into v_centre from public.exam_centres where "id" = v_card."examCentreId";
  select coalesce(jsonb_agg(jsonb_build_object(
           'subject', cs."name", 'code', cs."code", 'date', it ->> 'date', 'time', it ->> 'time'
         ) order by it ->> 'date', it ->> 'time'), '[]'::jsonb)
    into v_items
    from public.exam_schedules es
    cross join lateral jsonb_array_elements(es."items") it
    left join public.course_subjects cs on cs."id" = it ->> 'subjectId'
   where es."id" = v_card."scheduleId";
  return jsonb_build_object(
    'found', true, 'issued', true, 'student', v - 'id',
    'rollNo', v_card."rollNo", 'term', v_card."term", 'session', v_card."session",
    'courseTerms', public.public_course_terms(v_card."courseId"),
    'isFinal', v_card."isFinal",
    'examCentre', case when v_centre."name" is null then null
                       else jsonb_build_object('name', v_centre."name", 'code', v_centre."code", 'address', v_centre."address") end,
    'schedule', v_items
  );
end;
$$;

revoke all on function public.verify_enrollment(text) from public;
revoke all on function public.verify_result(text, date) from public;
revoke all on function public.verify_certificate(text) from public;
revoke all on function public.public_admit_card(text) from public;
grant execute on function public.verify_enrollment(text) to anon, authenticated;
grant execute on function public.verify_result(text, date) to anon, authenticated;
grant execute on function public.verify_certificate(text) to anon, authenticated;
grant execute on function public.public_admit_card(text) to anon, authenticated;


-- ---------- add-student-block.sql ----------
-- The block a student lives in.
--
-- The admission form now asks for the address state, district and block, each
-- a dropdown narrowed by the one before it, as the branch and enquiry forms
-- already do. Students had no column for the block.
--
-- Nullable: older admissions, and places outside the bundled block lists, have
-- none.
--
-- Run once in the Supabase SQL editor. Safe to re-run. The application degrades
-- gracefully until it is: the insert retries without this and saves the rest
-- of the admission rather than failing whole.
alter table public.students
  add column if not exists "block" text;


-- ---------- next-application-no.sql ----------
-- The next application number, counted across every branch. A branch account
-- reads only its own students, so counting from the client handed out numbers
-- another branch had already issued. SECURITY DEFINER reads past RLS and
-- returns one number, nothing else. Read numerically, so 10000 follows 9999.
create or replace function public.next_application_no()
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  prefix text := 'APP-' || extract(year from now())::int || '-';
  last_no integer;
begin
  select max(substring("applicationNo" from length(prefix) + 1)::integer)
    into last_no
    from public.students
   where "applicationNo" like prefix || '%'
     and substring("applicationNo" from length(prefix) + 1) ~ '^\d+$';
  return prefix || lpad((coalesce(last_no, 0) + 1)::text, 4, '0');
end;
$$;

revoke all on function public.next_application_no() from public;
grant execute on function public.next_application_no() to authenticated;


-- ---------- add-batch-timing-schedule.sql ----------
-- What a batch timing is, beyond a start and an end.
--
-- The timetable screen asks four things the table cannot answer: whether the
-- class runs in the room or online, when the break falls inside a long
-- session, and what colour to draw it on the weekly grid so one batch can be
-- picked out from another at a glance.
--
-- The column is `classMode`, not `mode`: PostgREST parses `mode` as the
-- ordered-set aggregate and answers a plain select on it with 42809.
--
-- Notes are deliberately absent: `description` already exists on this table
-- and is exactly that field.
--
-- Run once in the Supabase SQL editor. Safe to re-run. The screen degrades
-- gracefully until it is: timings still read, save and show on the grid,
-- without the mode, the break or the colour.
alter table public.batch_timings
  add column if not exists "classMode" text,
  add column if not exists "breakStart" text,
  add column if not exists "breakEnd" text,
  add column if not exists "colour" text;


-- ---------- course-syllabus.sql ----------
-- Give a course's syllabus somewhere to live.
--
-- A course carries a name, a duration and a fee, and nothing about what is
-- actually taught on it. `courses.syllabus` is a jsonb column that nothing
-- reads or writes -- a single blob cannot be ordered, filtered, or have one
-- chapter edited without rewriting the rest of it, which is why the Syllabus
-- screen needs rows rather than a document.
--
-- Two tables, because that is how a syllabus is read: modules are the sections
-- of the course, and chapters are what is taught inside a section.
--
-- Run once in the Supabase SQL editor. Safe to re-run.


-- ---------------------------------------------------------------------
-- 1. Modules -- the sections of a course.
--
--    `sortOrder`, not `order`: `order` is reserved in SQL and has to be
--    quoted everywhere it appears, including in every PostgREST query the
--    browser sends.
--
--    Unlike the tables generated from Prisma, `id` and `updatedAt` carry real
--    database defaults, so a PostgREST insert that omits them succeeds.
-- ---------------------------------------------------------------------
create table if not exists public.course_modules (
  id            text primary key default gen_random_uuid()::text,
  "courseId"    text not null references public.courses(id) on delete cascade,
  name          text not null,
  description   text,
  "sortOrder"   integer not null default 1,
  status        text not null default 'Active',
  "createdAt"   timestamptz not null default now(),
  "updatedAt"   timestamptz not null default now(),
  "deletedAt"   timestamptz,
  constraint course_modules_status_check check (status in ('Active', 'Inactive'))
);

create index if not exists "course_modules_courseId_idx"
  on public.course_modules ("courseId");


-- ---------------------------------------------------------------------
-- 2. Chapters -- what is taught inside a module.
--
--    `courseId` is carried here as well as on the module. It is redundant, and
--    it is what lets the screen count a course's chapters and search them
--    without walking every module first; the cascade below keeps the two from
--    drifting apart.
-- ---------------------------------------------------------------------
create table if not exists public.course_chapters (
  id            text primary key default gen_random_uuid()::text,
  "moduleId"    text not null references public.course_modules(id) on delete cascade,
  "courseId"    text not null references public.courses(id) on delete cascade,
  name          text not null,
  description   text,
  -- The practical assignment set against the chapter, kept apart from the
  -- description because it is what the student is asked to do, not read.
  practical     text,
  "pdfUrl"      text,
  "videoUrl"    text,
  "sortOrder"   integer not null default 1,
  status        text not null default 'Active',
  "createdAt"   timestamptz not null default now(),
  "updatedAt"   timestamptz not null default now(),
  "deletedAt"   timestamptz,
  constraint course_chapters_status_check check (status in ('Active', 'Inactive'))
);

create index if not exists "course_chapters_moduleId_idx"
  on public.course_chapters ("moduleId");
create index if not exists "course_chapters_courseId_idx"
  on public.course_chapters ("courseId");


-- ---------------------------------------------------------------------
-- 3. Who may read and write a syllabus.
--
--    The same line the catalogue itself draws: the organisation owns what is
--    taught, and every account at that institute reads it -- a branch has to
--    see the syllabus of a course it runs, and must not be able to rewrite it.
--
--    Neither table carries an organizationId of its own, so the check goes
--    through the course. SUPER_ADMIN is listed separately for the reason
--    user-management.sql gives: that account often carries no organizationId,
--    and `null = null` is NULL rather than true.
-- ---------------------------------------------------------------------
alter table public.course_modules  enable row level security;
alter table public.course_chapters enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array['course_modules', 'course_chapters'] loop
    execute format('drop policy if exists "Read own organisation syllabus" on public.%I', t);
    execute format('drop policy if exists "Write own organisation syllabus" on public.%I', t);

    execute format($f$
      create policy "Read own organisation syllabus" on public.%I
        for select to authenticated
        using (
          public.jwt_role() = 'SUPER_ADMIN'
          or exists (
               select 1 from public.courses c
                where c.id = "courseId"
                  and c."organizationId" = public.jwt_org_id()
             )
        )
    $f$, t);

    execute format($f$
      create policy "Write own organisation syllabus" on public.%I
        for all to authenticated
        using (
          public.jwt_role() = 'SUPER_ADMIN'
          or (public.is_org_admin() and exists (
                select 1 from public.courses c
                 where c.id = "courseId"
                   and c."organizationId" = public.jwt_org_id()
              ))
        )
        with check (
          public.jwt_role() = 'SUPER_ADMIN'
          or (public.is_org_admin() and exists (
                select 1 from public.courses c
                 where c.id = "courseId"
                   and c."organizationId" = public.jwt_org_id()
              ))
        )
    $f$, t);
  end loop;
end $$;


-- ---------------------------------------------------------------------
-- 4. Check what is in place now.
-- ---------------------------------------------------------------------
select tablename, policyname, cmd from pg_policies
 where schemaname = 'public'
   and tablename in ('course_modules', 'course_chapters')
 order by tablename, policyname;


-- ---------- admission-leads.sql ----------
-- Admission leads: the enquiries a centre works on until they become students.
--
-- `visit_enquiries` already records who walked in, and Reception runs on it.
-- This is a separate register on purpose: a lead is worked for weeks through
-- counselling and a demo class, carries a counsellor and an expected admission
-- date, and keeps a history of every call made about it. A visit is one event.
--
-- Run once in the Supabase SQL editor. Safe to re-run.


-- ---------------------------------------------------------------------
-- 1. The lead.
--
--    `status` is the pipeline stage. It is constrained rather than free text
--    because the board draws a column per stage, and one typo would create a
--    seventh column with one card in it.
--
--    Unlike the tables generated from Prisma, `id` and `updatedAt` carry real
--    database defaults, so a PostgREST insert that omits them succeeds.
-- ---------------------------------------------------------------------
create table if not exists public.admission_leads (
  id                    text primary key default gen_random_uuid()::text,
  "organizationId"      text references public.organizations(id) on delete cascade,
  -- Nullable: head office logs leads that no branch has picked up yet.
  "branchId"            text references public.branches(id) on delete set null,

  "studentName"         text not null,
  "parentName"          text,
  phone                 text not null,
  whatsapp              text,
  email                 text,
  qualification         text,
  address               text,
  city                  text,

  "courseInterested"    text,
  "preferredBatch"      text,
  source                text,
  counsellor            text,
  "expectedAdmissionAt" date,

  status                text not null default 'New',
  remarks               text,

  -- When the next call is due, and what kind of call it is. Both null until
  -- somebody schedules one, which is what "no follow-up set" means on screen.
  "followUpAt"          timestamptz,
  "followUpType"        text,

  -- Set when the lead becomes a student, so a converted lead can be traced to
  -- the admission it produced.
  "studentId"           text references public.students(id) on delete set null,

  "createdAt"           timestamptz not null default now(),
  "updatedAt"           timestamptz not null default now(),
  "deletedAt"           timestamptz,

  constraint admission_leads_status_check check (status in (
    'New', 'Contacted', 'Interested', 'Counselling', 'Demo Class',
    'Admission', 'Not Interested', 'Lost'
  ))
);

create index if not exists "admission_leads_branchId_idx"   on public.admission_leads ("branchId");
create index if not exists "admission_leads_status_idx"     on public.admission_leads (status);
-- The follow-up list is read by date every morning.
create index if not exists "admission_leads_followUpAt_idx" on public.admission_leads ("followUpAt");


-- ---------------------------------------------------------------------
-- 2. What has been done about it.
--
--    A lead's history is the reason anyone trusts its stage: "Interested" with
--    no call logged against it is a guess. Every stage change and every
--    follow-up writes a row here, and the row is never edited.
-- ---------------------------------------------------------------------
create table if not exists public.admission_lead_activities (
  id            text primary key default gen_random_uuid()::text,
  "leadId"      text not null references public.admission_leads(id) on delete cascade,
  kind          text not null,
  note          text,
  -- The stage the lead was moved to by this activity, when it moved one.
  status        text,
  "occurredAt"  timestamptz not null default now(),
  "actorId"     text,
  "createdAt"   timestamptz not null default now()
);

create index if not exists "admission_lead_activities_leadId_idx"
  on public.admission_lead_activities ("leadId");


-- ---------------------------------------------------------------------
-- 3. Who may read and write a lead.
--
--    A branch works its own leads; head office sees every branch's. A lead
--    with no branch yet is head office's until it is handed to one, which is
--    why the branch check allows null for an org admin only.
--
--    SUPER_ADMIN is listed separately for the reason user-management.sql
--    gives: that account often carries no organizationId, and `null = null` is
--    NULL rather than true.
-- ---------------------------------------------------------------------
alter table public.admission_leads           enable row level security;
alter table public.admission_lead_activities enable row level security;

drop policy if exists "Read own leads"  on public.admission_leads;
drop policy if exists "Write own leads" on public.admission_leads;

create policy "Read own leads" on public.admission_leads
  for select to authenticated
  using (
    public.jwt_role() = 'SUPER_ADMIN'
    or (public.is_org_admin() and "organizationId" = public.jwt_org_id())
    or "branchId" = public.jwt_branch_id()
  );

create policy "Write own leads" on public.admission_leads
  for all to authenticated
  using (
    public.jwt_role() = 'SUPER_ADMIN'
    or (public.is_org_admin() and "organizationId" = public.jwt_org_id())
    or "branchId" = public.jwt_branch_id()
  )
  with check (
    public.jwt_role() = 'SUPER_ADMIN'
    or (public.is_org_admin() and "organizationId" = public.jwt_org_id())
    or "branchId" = public.jwt_branch_id()
  );

drop policy if exists "Read own lead activities"  on public.admission_lead_activities;
drop policy if exists "Write own lead activities" on public.admission_lead_activities;

-- The activity has no branch of its own, so it inherits the lead's reach.
create policy "Read own lead activities" on public.admission_lead_activities
  for select to authenticated
  using (exists (select 1 from public.admission_leads l where l.id = "leadId"));

create policy "Write own lead activities" on public.admission_lead_activities
  for all to authenticated
  using (exists (select 1 from public.admission_leads l where l.id = "leadId"))
  with check (exists (select 1 from public.admission_leads l where l.id = "leadId"));


-- ---------------------------------------------------------------------
-- 4. Check what is in place now.
-- ---------------------------------------------------------------------
select tablename, policyname, cmd from pg_policies
 where schemaname = 'public'
   and tablename in ('admission_leads', 'admission_lead_activities')
 order by tablename, policyname;


-- ---------- franchise-leads.sql ----------
-- Franchise leads: people who want to open a branch.
--
-- Nothing in the schema models this. `admission_leads` is a student enquiry --
-- a course, a batch preference, a counsellor -- and a franchise applicant is a
-- different thing entirely: an investment budget, a proposed location, a
-- centre to be inspected, an agreement to be signed. Forcing the two into one
-- table would leave most of every row empty.
--
-- Run once in the Supabase SQL editor. Safe to re-run.


-- ---------------------------------------------------------------------
-- 1. The applicant, the place, and the money.
--
--    `status` is the pipeline stage, constrained because the board draws a
--    column per stage and one typo would create a stage of its own.
--
--    Unlike the tables generated from Prisma, `id` and `updatedAt` carry real
--    database defaults, so a PostgREST insert that omits them succeeds.
-- ---------------------------------------------------------------------
create table if not exists public.franchise_leads (
  id                    text primary key default gen_random_uuid()::text,
  "organizationId"      text references public.organizations(id) on delete cascade,
  -- Human-facing reference, printed on the card and quoted on the phone.
  "leadNo"              text,

  -- Applicant
  "directorName"        text not null,
  "ownerName"           text,
  phone                 text not null,
  whatsapp              text,
  email                 text,
  qualification         text,

  -- Proposed branch location
  state                 text,
  district              text,
  block                 text,
  city                  text,
  pincode               text,
  landmark              text,
  "wardNo"              text,
  address               text,

  -- Investment and infrastructure
  "investmentBudget"    text,
  "centreAreaSqFt"      integer,
  computers             integer,
  "expectedOpeningAt"   date,
  -- The four yes/no facilities the intake form asks about. One jsonb column
  -- rather than four booleans: the list is the form's, and it changes.
  facilities            jsonb,

  -- Business
  "businessExperience"  text,
  "franchiseType"       text,
  executive             text,
  remarks               text,

  status                text not null default 'New Lead',
  "followUpAt"          timestamptz,
  "followUpType"        text,
  -- Set once the lead becomes a branch, so a conversion can be traced.
  "branchId"            text references public.branches(id) on delete set null,

  "createdAt"           timestamptz not null default now(),
  "updatedAt"           timestamptz not null default now(),
  "deletedAt"           timestamptz,

  constraint franchise_leads_status_check check (status in (
    'New Lead', 'Contacted', 'Interested', 'Site Visit',
    'Verification', 'Agreement', 'Converted', 'Lost'
  ))
);

create index if not exists "franchise_leads_status_idx"     on public.franchise_leads (status);
create index if not exists "franchise_leads_followUpAt_idx" on public.franchise_leads ("followUpAt");
create index if not exists "franchise_leads_state_idx"      on public.franchise_leads (state);


-- ---------------------------------------------------------------------
-- 2. What has been done about it.
--
--    A site visit that nobody recorded is a site visit nobody can prove
--    happened, and this pipeline runs on exactly that kind of evidence.
-- ---------------------------------------------------------------------
create table if not exists public.franchise_lead_activities (
  id            text primary key default gen_random_uuid()::text,
  "leadId"      text not null references public.franchise_leads(id) on delete cascade,
  kind          text not null,
  note          text,
  status        text,
  "occurredAt"  timestamptz not null default now(),
  "actorId"     text,
  "createdAt"   timestamptz not null default now()
);

create index if not exists "franchise_lead_activities_leadId_idx"
  on public.franchise_lead_activities ("leadId");


-- ---------------------------------------------------------------------
-- 3. Who may read and write one.
--
--    Franchise applications are head office's work -- a branch does not
--    recruit the branch next door -- so this is org admins only, unlike the
--    admission leads a branch works itself.
--
--    SUPER_ADMIN is listed separately for the reason user-management.sql
--    gives: that account often carries no organizationId, and `null = null` is
--    NULL rather than true.
-- ---------------------------------------------------------------------
alter table public.franchise_leads           enable row level security;
alter table public.franchise_lead_activities enable row level security;

drop policy if exists "Read own franchise leads"  on public.franchise_leads;
drop policy if exists "Write own franchise leads" on public.franchise_leads;

create policy "Read own franchise leads" on public.franchise_leads
  for select to authenticated
  using (
    public.jwt_role() = 'SUPER_ADMIN'
    or (public.is_org_admin() and "organizationId" = public.jwt_org_id())
  );

create policy "Write own franchise leads" on public.franchise_leads
  for all to authenticated
  using (
    public.jwt_role() = 'SUPER_ADMIN'
    or (public.is_org_admin() and "organizationId" = public.jwt_org_id())
  )
  with check (
    public.jwt_role() = 'SUPER_ADMIN'
    or (public.is_org_admin() and "organizationId" = public.jwt_org_id())
  );

drop policy if exists "Read own franchise lead activities"  on public.franchise_lead_activities;
drop policy if exists "Write own franchise lead activities" on public.franchise_lead_activities;

-- The activity has no organisation of its own, so it inherits the lead's reach.
create policy "Read own franchise lead activities" on public.franchise_lead_activities
  for select to authenticated
  using (exists (select 1 from public.franchise_leads l where l.id = "leadId"));

create policy "Write own franchise lead activities" on public.franchise_lead_activities
  for all to authenticated
  using (exists (select 1 from public.franchise_leads l where l.id = "leadId"))
  with check (exists (select 1 from public.franchise_leads l where l.id = "leadId"));


-- ---------------------------------------------------------------------
-- 4. Check what is in place now.
-- ---------------------------------------------------------------------
select tablename, policyname, cmd from pg_policies
 where schemaname = 'public'
   and tablename in ('franchise_leads', 'franchise_lead_activities')
 order by tablename, policyname;


-- ---------- practice-files.sql ----------
-- Somewhere to keep what is made in the Code Lab and on the Whiteboard.
--
-- Both tools run in the browser — LiveCodes compiles in an iframe, draw.io
-- draws in one — and neither keeps anything once the tab is closed. A student
-- who writes a program in class, or a teacher who draws a flowchart for one,
-- wants it back next time, on whichever machine they sit at.
--
-- One table for both: a file is a title, a kind, and a body. `content` is text
-- because both bodies already are — a code project serialises to JSON, and a
-- draw.io diagram is XML.
--
-- Run once in the Supabase SQL editor. Safe to re-run. Until it is, both tools
-- keep their files in the browser they were made in, and say so.
create table if not exists public.practice_files (
  id               text primary key default gen_random_uuid()::text,
  "ownerId"        text not null,
  "organizationId" text references public.organizations(id) on delete cascade,
  "branchId"       text references public.branches(id) on delete set null,
  kind             text not null,
  title            text not null default 'Untitled',
  -- The language of a code file ("web", "python", "c"...); null on a board.
  language         text,
  content          text not null default '',
  "createdAt"      timestamptz not null default now(),
  "updatedAt"      timestamptz not null default now(),
  "deletedAt"      timestamptz,
  constraint practice_files_kind_check check (kind in ('code', 'board'))
);

create index if not exists "practice_files_owner_idx"
  on public.practice_files ("ownerId", kind);


-- ---------------------------------------------------------------------
-- A file is its owner's.
--
-- Keyed on auth.uid() itself rather than on the role claims, because this is
-- private work: a student's practice code is not the branch's to read, and a
-- teacher's rough board is not the student's. Sharing, when it comes, is a
-- column and a policy of its own — not a widening of this one.
-- ---------------------------------------------------------------------
alter table public.practice_files enable row level security;

drop policy if exists "Owner reads own practice files"  on public.practice_files;
drop policy if exists "Owner writes own practice files" on public.practice_files;

create policy "Owner reads own practice files" on public.practice_files
  for select to authenticated
  using ("ownerId" = auth.uid()::text);

create policy "Owner writes own practice files" on public.practice_files
  for all to authenticated
  using ("ownerId" = auth.uid()::text)
  with check ("ownerId" = auth.uid()::text);


select policyname, cmd from pg_policies
 where schemaname = 'public' and tablename = 'practice_files';


-- =====================================================================
-- PART 2 — COLUMNS (already applied; re-runnable)
-- =====================================================================


-- ---------- add-student-section-roll.sql ----------
-- Section and roll number on a student.
--
-- The admission form collects both on the Academic step, next to the batch.
-- `tenthRollNo` already exists but is the class 10 board roll number, which is
-- a different thing from the roll number the branch assigns on enrolment.
--
-- Run once in the Supabase SQL editor. Safe to re-run.
alter table public.students
  add column if not exists "section" text,
  add column if not exists "rollNo" text;


-- ---------- add-student-fee-fields.sql ----------
-- Columns the student + fee screens write but the live database never got.
-- Probed against the live PostgREST endpoint, not backend/prisma/schema.prisma
-- (which does not match the live database).
-- Run once in the Supabase SQL editor. Safe to re-run.

-- Students -------------------------------------------------------------------
-- The online-admission review screen records a decision note and a list of
-- documents it asked the applicant to re-upload. The admission form collects
-- guardian / emergency / previous-school details. None of these existed, so the
-- writes failed with PGRST204 and the reviewer's decision was lost on reload.
alter table public.students
  add column if not exists "decisionNote" text,
  add column if not exists "requestedDocuments" text,
  add column if not exists "documents" jsonb,
  add column if not exists "guardianName" text,
  add column if not exists "guardianPhone" text,
  add column if not exists "emergencyName" text,
  add column if not exists "emergencyPhone" text,
  add column if not exists "previousSchool" text,
  add column if not exists "previousClass" text,
  add column if not exists "alternatePhone" text,
  add column if not exists "rollNo" text,
  add column if not exists "feeGroupId" text;

-- Fee invoices ---------------------------------------------------------------
-- Discounts and late fees are shown and edited in Fee Allocation / Due Fee
-- Collection but had nowhere to be stored.
alter table public.fee_invoices
  add column if not exists "discount" numeric(12, 2) not null default 0,
  add column if not exists "lateFee" numeric(12, 2) not null default 0,
  add column if not exists "notes" text;

-- Fee payments ---------------------------------------------------------------
-- Fee Allocation attaches a free-text note to a payment (e.g. "Allocation
-- adjustment"); there was no column for it.
alter table public.fee_payments
  add column if not exists "note" text;

-- NOTE: the application code degrades gracefully if this migration has not been
-- run: every write that touches these columns retries without them on PGRST204.


-- ---------- add-student-referral.sql ----------
-- Who brought an admission in.
--
-- The admission form asks for it on its own step -- a name, the referral code
-- that was quoted, and what that person is to the institute (partner, staff,
-- an old student) -- and none of the three had a column to land in.
--
-- All nullable: most admissions are walk-ins and have no referrer at all.
--
-- Run once in the Supabase SQL editor. Safe to re-run. The application degrades
-- gracefully until it is: the insert retries without these and saves the rest
-- of the admission rather than failing whole.
alter table public.students
  add column if not exists "referralName" text,
  add column if not exists "referralCode" text,
  add column if not exists "referralPosition" text;

-- Referral codes are quoted and chased, so they are worth finding by.
create index if not exists "students_referralCode_idx"
  on public.students ("referralCode")
  where "referralCode" is not null;

notify pgrst, 'reload schema';


-- ---------- add-batch-fee-fields.sql ----------
-- Fee discount and remark on a batch.
-- Run once in the Supabase SQL editor. Safe to re-run.
alter table public.batches
  add column if not exists "feeDiscount" double precision not null default 0,
  add column if not exists "remark" text;


-- ---------- add-batch-instructor.sql ----------
-- The teacher who takes a batch.
--
-- Instructor used to be picked per timing slot, which meant the same name had
-- to be re-entered for every day of the week and nothing tied a teacher to the
-- batch itself. It is now chosen once, when the course is assigned to the
-- batch, and lives here.
--
-- Run once in the Supabase SQL editor. Safe to re-run.
alter table public.batches
  add column if not exists "instructor" text;


-- ---------- add-batch-timing-class-fields.sql ----------
-- Live classes have no table of their own: the ViewLiveClasses / LiveClassSetup
-- screens treat one weekly `batch_timings` slot as one class. The columns below
-- are the parts of that UI the base table cannot store -- without them a class
-- cannot be titled, given a meeting link, or cancelled, and `getLiveClasses`
-- falls back to deriving everything from the slot's day and time.
--
-- Run this in the Supabase SQL editor. It is safe to re-run.

alter table public.batch_timings
  add column if not exists "title" text,
  add column if not exists "platform" text,
  add column if not exists "meetingLink" text,
  add column if not exists "meetingId" text,
  add column if not exists "description" text,
  add column if not exists "status" text not null default 'scheduled',
  add column if not exists "recorded" boolean not null default false;


-- ---------- add-branch-map-link.sql ----------
-- A branch's address, as a link.
--
-- `branch_addresses` held a written address and a pair of coordinates, and the
-- office had neither to hand: a lane with no name is found by the Google Maps
-- link someone shared and by nothing else. The Create Branch form takes that
-- link; this is the column it goes in.
--
-- Run once in the Supabase SQL editor. Safe to re-run. The application degrades
-- gracefully until it is: the address write retries without the column.
alter table public.branch_addresses
  add column if not exists "mapLink" text;

notify pgrst, 'reload schema';


-- ---------- add-notice-meeting-fields.sql ----------
-- Meeting details on a branch notice.
-- Run once in the Supabase SQL editor. Safe to re-run.
alter table public.branch_notices
  add column if not exists "meetingTime" timestamptz,
  add column if not exists "meetingLink" text;


-- ---------- add-online-exam-fields.sql ----------
-- The Create Online Exam screen collects a description, an end time, a duration,
-- a question count, negative marking and the proctoring toggles. None of those
-- columns exist on `exams`, so every one of those inputs was silently discarded
-- on save. `createExam`/`updateExam` retry without them until this has been run.
--
-- Run this in the Supabase SQL editor. It is safe to re-run.

alter table public.exams
  add column if not exists "description" text,
  add column if not exists "endDate" timestamptz,
  add column if not exists "duration" integer,
  add column if not exists "totalQuestions" integer,
  add column if not exists "negativeMarking" numeric,
  add column if not exists "shuffleQuestions" boolean not null default true,
  add column if not exists "shuffleOptions" boolean not null default true,
  add column if not exists "preventTabSwitch" boolean not null default false,
  add column if not exists "fullScreen" boolean not null default false,
  add column if not exists "webcam" boolean not null default false,
  add column if not exists "showResult" boolean not null default true,
  add column if not exists "showAnswers" boolean not null default false,
  add column if not exists "allowReview" boolean not null default true,
  add column if not exists "autoSubmit" boolean not null default true;


-- ---------- add-portal-settings.sql ----------
-- Portal and payment feature columns on branches.
--
-- These shipped in the branch settings UI before this file was ever run, so
-- every Create Branch attempt failed with PGRST204 ("Could not find the
-- 'onlineFeePayment' column of 'branches' in the schema cache"). That left the
-- organisation with zero branches, which in turn emptied every branch dropdown
-- in the app and disabled every branch-gated form.
--
-- Run once in the Supabase SQL editor. Safe to re-run.
--
-- NOTE: createBranch/updateBranch now retry without these columns on PGRST204,
-- so branch creation works even before this is run - but the three toggles are
-- silently dropped until it is.
alter table public.branches
  add column if not exists "onlineFeePayment" boolean not null default false,
  add column if not exists "studentPortal" boolean not null default false,
  add column if not exists "parentPortal" boolean not null default false;


-- ---------- add-recharge-approval.sql ----------
-- =====================================================================
-- Wallet recharge goes through admin approval
-- =====================================================================
-- A branch used to top its own wallet up on the spot. Now it pays the
-- organisation's UPI account, files the UTR and a screenshot, and the balance
-- moves only once an admin approves.
--
-- Depends on branch-scoped-wallet-rls.sql, which defines is_org_admin() and
-- jwt_branch_id(). Run that first if you have not.
--
-- Idempotent - safe to re-run.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. Where the branch is told to pay. One UPI account per organisation.
-- ---------------------------------------------------------------------
alter table public.organizations
  add column if not exists "rechargeUpiId" text,
  add column if not exists "rechargeUpiName" text;


-- ---------------------------------------------------------------------
-- 2. What the branch files with the request, and what the admin decides.
--    The UTR goes in the existing `reference` column.
-- ---------------------------------------------------------------------
alter table public.branch_transactions
  add column if not exists "proofUrl" text,
  add column if not exists "reviewedAt" timestamptz,
  add column if not exists "reviewedBy" uuid,
  add column if not exists "reviewNote" text;


-- ---------------------------------------------------------------------
-- 3. Approval has to be worth something.
--
--    branch-scoped-wallet-rls.sql gave a branch FOR ALL on its own rows,
--    which lets it flip its own request to COMPLETED or simply write its
--    own wallet balance -- and then the approval step is decoration. The
--    branch keeps SELECT, and INSERT of a PENDING request only. Every
--    UPDATE, and every write to a wallet, is an admin's.
-- ---------------------------------------------------------------------

-- branch_wallets: a branch may look at its own, nothing more.
drop policy if exists "Branch scoped access" on public.branch_wallets;
drop policy if exists "Wallet readable by owner or admin" on public.branch_wallets;
drop policy if exists "Wallet written by admin" on public.branch_wallets;

create policy "Wallet readable by owner or admin" on public.branch_wallets
  for select to authenticated
  using (public.is_org_admin() or "branchId" = public.jwt_branch_id());

create policy "Wallet written by admin" on public.branch_wallets
  for all to authenticated
  using (public.is_org_admin())
  with check (public.is_org_admin());

-- branch_transactions: a branch reads its own and files PENDING requests.
drop policy if exists "Branch scoped access" on public.branch_transactions;
drop policy if exists "Transactions readable by owner or admin" on public.branch_transactions;
drop policy if exists "Branch files a pending request" on public.branch_transactions;
drop policy if exists "Transactions written by admin" on public.branch_transactions;

create policy "Transactions readable by owner or admin" on public.branch_transactions
  for select to authenticated
  using (public.is_org_admin() or "branchId" = public.jwt_branch_id());

create policy "Branch files a pending request" on public.branch_transactions
  for insert to authenticated
  with check (
    public.is_org_admin()
    or ("branchId" = public.jwt_branch_id() and status = 'PENDING' and "balanceAfter" = 0)
  );

create policy "Transactions written by admin" on public.branch_transactions
  for update to authenticated
  using (public.is_org_admin())
  with check (public.is_org_admin());


-- ---------------------------------------------------------------------
-- 4. Somewhere to put the payment screenshot.
--    Private bucket: proofs carry payment details and are read through a
--    signed URL, never straight off a public path.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('recharge-proofs', 'recharge-proofs', false)
on conflict (id) do nothing;

-- Objects live at <branchId>/<file>, so the first path segment is the owner.
drop policy if exists "Proof uploaded by its own branch" on storage.objects;
drop policy if exists "Proof readable by owner or admin" on storage.objects;

create policy "Proof uploaded by its own branch" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'recharge-proofs'
    and (public.is_org_admin() or (storage.foldername(name))[1] = public.jwt_branch_id())
  );

create policy "Proof readable by owner or admin" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'recharge-proofs'
    and (public.is_org_admin() or (storage.foldername(name))[1] = public.jwt_branch_id())
  );


notify pgrst, 'reload schema';


-- ---------------------------------------------------------------------
-- 5. Check.
-- ---------------------------------------------------------------------
select tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
  and tablename in ('branch_wallets', 'branch_transactions')
order by tablename, policyname;


-- ---------- fix-wallet-recharge-review.sql ----------
-- =====================================================================
-- Wallet recharge: make an approval able to land
-- =====================================================================
-- add-recharge-approval.sql declared `reviewedBy` as uuid. Both the approval
-- code and supabase-wallet-recharge-functions.sql write the reviewer's *name*
-- into it, and Postgres rejects that outright:
--
--   invalid input syntax for type uuid: "Administrator"
--
-- On a database carrying the uuid form, every Approve failed on that error --
-- the wallet was never credited, so the branch never saw the balance move.
-- The column is a reviewer label, not a foreign key, so text is what it should
-- have been. Existing uuid values survive the conversion as their text form.
--
-- Idempotent - safe to re-run.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. reviewedBy -> text
-- ---------------------------------------------------------------------
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'branch_transactions'
      and column_name = 'reviewedBy'
      and data_type = 'uuid'
  ) then
    alter table public.branch_transactions
      alter column "reviewedBy" type text using "reviewedBy"::text;
  end if;
end $$;


-- ---------------------------------------------------------------------
-- 2. The columns the approval screen reads back.
-- ---------------------------------------------------------------------
alter table public.branch_transactions
  add column if not exists "proofUrl" text,
  add column if not exists "reviewedAt" timestamptz,
  add column if not exists "reviewNote" text;


-- ---------------------------------------------------------------------
-- 3. A wallet row is created on the branch's first approved recharge, and
--    `id` is TEXT NOT NULL. Without a default that insert fails, which is
--    the same "approved but no balance" outcome by a different route.
-- ---------------------------------------------------------------------
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'branch_wallets'
      and column_name = 'id'
      and column_default is null
  ) then
    alter table public.branch_wallets alter column "id" set default gen_random_uuid()::text;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'branch_wallets'
      and column_name = 'updatedAt'
      and column_default is null
  ) then
    alter table public.branch_wallets alter column "updatedAt" set default now();
  end if;
end $$;


notify pgrst, 'reload schema';


-- ---------------------------------------------------------------------
-- 4. Check.
-- ---------------------------------------------------------------------
select table_name, column_name, data_type, column_default
from information_schema.columns
where table_schema = 'public'
  and (
    (table_name = 'branch_transactions' and column_name in ('reviewedBy', 'reviewedAt', 'proofUrl', 'reviewNote'))
    or (table_name = 'branch_wallets' and column_name in ('id', 'updatedAt'))
  )
order by table_name, column_name;


-- ---------- add-website-settings-fields.sql ----------
-- The Branch > Website Settings screen edits branding, contact details, social
-- links, the public-portal toggles and the domain lifecycle dates. `branch_settings`
-- only had columns for the seven SEO/domain fields, so everything else was typed
-- in and thrown away on save. `updateBranchSettings` drops whatever is still
-- missing and tells the user, so the screen works before and after this runs.
--
-- Run this in the Supabase SQL editor. It is safe to re-run.

alter table public.branch_settings
  -- Branding. Images are stored as data URLs by the uploader.
  add column if not exists "logo" text,
  add column if not exists "favicon" text,
  add column if not exists "banner" text,
  add column if not exists "bannerTitle" text,
  add column if not exists "bannerSubtitle" text,

  -- Domain
  add column if not exists "wwwRedirect" boolean not null default true,
  add column if not exists "registrationDate" date,
  add column if not exists "expiryDate" date,
  add column if not exists "renewalDate" date,

  -- Public contact details
  add column if not exists "email" text,
  add column if not exists "phone" text,
  add column if not exists "address" text,

  -- Public feature toggles
  add column if not exists "onlineAdmissions" boolean not null default true,
  add column if not exists "onlineFees" boolean not null default true,
  add column if not exists "studentPortal" boolean not null default true,
  add column if not exists "parentPortal" boolean not null default false,

  -- Social links
  add column if not exists "facebook" text,
  add column if not exists "twitter" text,
  add column if not exists "instagram" text,
  add column if not exists "linkedin" text,
  add column if not exists "youtube" text,
  add column if not exists "whatsapp" text;


-- ---------- course-category-free-text.sql ----------
-- Let a course category be typed, not only picked.
--
-- `courses.category` is the enum `CourseCategory`, so anything outside its
-- seven members is rejected by Postgres with 22P02. Converting the column to
-- text keeps every existing value exactly as it is - the enum labels are just
-- read back as strings - while letting a branch name a category the enum never
-- anticipated.
--
-- Run once in the Supabase SQL editor. Safe to re-run.
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'courses'
      and column_name = 'category' and data_type = 'USER-DEFINED'
  ) then
    -- The default is enum-typed too, so it has to come off before the cast.
    alter table public.courses alter column "category" drop default;
    alter table public.courses alter column "category" type text using "category"::text;
    alter table public.courses alter column "category" set default 'COMPUTER';
  end if;
end $$;

-- The type itself is left in place: dropping it would fail if anything else
-- still references it, and an unused type costs nothing.


-- ---------- drop-stale-student-user-fk.sql ----------
-- =====================================================================
-- Let students.userId hold the Supabase auth id it is now meant to hold
-- =====================================================================
-- students.userId came from the original Prisma schema, where public.users
-- was the app's own account table -- it still carries a `password` column
-- from that design -- and the column was constrained to it:
--
--   students_userId_fkey FOREIGN KEY ("userId") REFERENCES "users"("id")
--     ON DELETE SET NULL ON UPDATE CASCADE
--
-- The organization app has since moved to Supabase auth and touches
-- public.users nowhere at all. The portal resolves a signed-in student
-- through students.userId -> auth.uid(), and create-student-user writes the
-- auth account's id there. That id will never appear in public.users, so the
-- constraint fails every attempt to issue a student login with:
--
--   insert or update on table "students" violates foreign key constraint
--   "students_userId_fkey"
--
-- The constraint cannot simply be repointed at auth.users: students."userId"
-- is TEXT and auth.users.id is uuid, and Postgres will not build a foreign
-- key across incompatible types. So it is dropped rather than replaced.
--
-- What is given up: nothing the app relies on. Postgres will no longer refuse
-- a userId that matches no account. create-student-user already undoes the
-- account it minted if the link fails, and deleting an auth user by hand now
-- leaves a stale id on the student instead of nulling it -- clear it manually
-- if you ever do that.
--
-- What is kept: students_userId_key, the unique index, so two students still
-- cannot share one login.
--
-- public.users itself is left alone. The older backend/ and api-server/
-- services still read it.
--
-- Idempotent - safe to re-run.
-- =====================================================================

alter table public.students drop constraint if exists "students_userId_fkey";


-- ---------------------------------------------------------------------
-- Verify: this should come back with no rows.
-- ---------------------------------------------------------------------
-- select conname, pg_get_constraintdef(oid) as definition
--   from pg_constraint
--  where conrelid = 'public.students'::regclass
--    and contype = 'f'
--    and conname = 'students_userId_fkey';


-- ---------- user-management.sql ----------
-- Give staff logins somewhere to belong.
--
-- The All Users page could only ever list two kinds of account, because those
-- are the only two the schema can place: an organisation names its admin
-- through `organizations.userId`, and a branch names its login through
-- `branches.userId`. A receptionist, an accountant or a teacher owns neither,
-- so there was no column anywhere that said which institute they work for --
-- and a login nobody can scope is a login nobody can safely list.
--
-- This adds that column. `organizationId` is the one that matters; `branchId`
-- is set as well when the person works out of a single branch, which is what
-- lets a branch admin see their own staff without seeing head office.
--
-- Both are nullable on purpose. Every row that exists today predates them, and
-- a NOT NULL would have to invent an answer for accounts whose organisation is
-- genuinely unknown. Step 2 backfills the ones that can be worked out from the
-- links that already exist.
--
-- Run once in the Supabase SQL editor. Safe to re-run.


-- ---------------------------------------------------------------------
-- 1. The columns.
--
--    `on delete set null`, not cascade: closing an organisation must not
--    silently delete the people who worked there. The audit trail on
--    `audit_events` points at these rows.
-- ---------------------------------------------------------------------
alter table public.users add column if not exists "organizationId" text;
alter table public.users add column if not exists "branchId" text;

do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_schema = 'public' and constraint_name = 'users_organizationId_fkey'
  ) then
    alter table public.users
      add constraint "users_organizationId_fkey"
      foreign key ("organizationId") references public.organizations(id) on delete set null;
  end if;

  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_schema = 'public' and constraint_name = 'users_branchId_fkey'
  ) then
    alter table public.users
      add constraint "users_branchId_fkey"
      foreign key ("branchId") references public.branches(id) on delete set null;
  end if;
end $$;

create index if not exists "users_organizationId_idx" on public.users ("organizationId");
create index if not exists "users_branchId_idx" on public.users ("branchId");


-- ---------------------------------------------------------------------
-- 2. Backfill from the links that already point the other way.
--
--    Only fills what is still null, so re-running this cannot overwrite a
--    posting somebody has since corrected by hand.
-- ---------------------------------------------------------------------
update public.users u
   set "organizationId" = o.id
  from public.organizations o
 where o."userId" = u.id
   and u."organizationId" is null;

update public.users u
   set "branchId"       = b.id,
       "organizationId" = coalesce(u."organizationId", b."organizationId")
  from public.branches b
 where b."userId" = u.id
   and u."branchId" is null;

-- A student's login belongs to the branch that enrolled them. They are not
-- listed on the All Users page, but leaving them unscoped would make the RLS
-- below invisible to the very branch that owns the record.
--
-- The organisation comes through the branch: `students` has a `branchId` and
-- no `organizationId`, so the branch is the only thing that knows which
-- institute the enrolment belongs to.
update public.users u
   set "branchId"       = s."branchId",
       "organizationId" = coalesce(u."organizationId", b."organizationId")
  from public.students s
  join public.branches b on b.id = s."branchId"
 where s."userId" = u.id
   and u."branchId" is null;


-- ---------------------------------------------------------------------
-- 3. The org-level counterpart to jwt_branch_id(), from
--    branch-scoped-wallet-rls.sql. Read from app_metadata, never
--    user_metadata -- a user can rewrite their own user_metadata with
--    supabase.auth.updateUser(), so a policy keyed on it would let any
--    account move itself into another organisation.
-- ---------------------------------------------------------------------
create or replace function public.jwt_org_id()
returns text
language sql
stable
as $$
  select auth.jwt() -> 'app_metadata' ->> 'organizationId';
$$;


-- ---------------------------------------------------------------------
-- 4. Who may read and write a user row.
--
--    An org admin gets their whole organisation. A branch admin gets their
--    own branch. Everyone else gets exactly themselves, so the app can still
--    read the signed-in person's own record.
--
--    SUPER_ADMIN is listed separately rather than folded into is_org_admin():
--    that account often carries no organizationId at all, and `null = null` is
--    NULL rather than true, so an organisation test would lock out the one
--    role that is supposed to see everything.
--
--    service_role is unaffected -- policies do not apply to it -- which is
--    what lets the create-staff-user edge function insert the row.
-- ---------------------------------------------------------------------
alter table public.users enable row level security;

drop policy if exists "Authenticated full access" on public.users;
drop policy if exists "Own organisation users" on public.users;

create policy "Own organisation users" on public.users
  for all to authenticated
  using (
    id = auth.uid()::text
    or public.jwt_role() = 'SUPER_ADMIN'
    or (public.is_org_admin() and "organizationId" = public.jwt_org_id())
    or (public.jwt_role() = 'BRANCH_ADMIN' and "branchId" = public.jwt_branch_id())
  )
  with check (
    public.jwt_role() = 'SUPER_ADMIN'
    or (public.is_org_admin() and "organizationId" = public.jwt_org_id())
    or (public.jwt_role() = 'BRANCH_ADMIN' and "branchId" = public.jwt_branch_id())
  );


-- ---------------------------------------------------------------------
-- 5. Check what is in place now.
-- ---------------------------------------------------------------------
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public' and table_name = 'users'
  and column_name in ('organizationId', 'branchId');

select policyname, roles from pg_policies
where schemaname = 'public' and tablename = 'users';

-- NOTE: app_metadata reaches the JWT only when a token is issued. Anyone signed
-- in right now must sign out and back in before these policies see their role.


-- =====================================================================
-- PART 3 — TABLES, POLICIES AND FUNCTIONS (already applied; re-runnable)
-- =====================================================================


-- ---------- add-item-movement.sql ----------
-- Run these in Supabase Dashboard → SQL Editor
-- Project: etxhjiawkpinmardkjzv

-- ============================================
-- Table: item_movements
-- ============================================
create table if not exists public.item_movements (
  id text primary key default gen_random_uuid()::text,
  direction text not null,
  item text not null,
  item_id text,
  category text,
  quantity integer default 0,
  party text,
  department text,
  status text,
  courier text,
  tracking text,
  notes text,
  dispatch_date date,
  receive_date date,
  branch_id text references public.branches(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- The table went live without a default on `id`, so every insert that did not
-- send one failed with "null value in column id ... violates not-null
-- constraint". `create table if not exists` above is a no-op on the live table,
-- so the default is set explicitly here. Safe to re-run.
alter table public.item_movements
  alter column id set default gen_random_uuid()::text;

alter table public.item_movements enable row level security;

-- Added here so this whole file can be re-run; the original creates
-- these without dropping them first.
drop policy if exists "Allow public read" on public.item_movements;
drop policy if exists "Allow public insert" on public.item_movements;
drop policy if exists "Allow public update" on public.item_movements;
drop policy if exists "Allow public delete" on public.item_movements;

create policy "Allow public read" on public.item_movements
  for select using (true);

create policy "Allow public insert" on public.item_movements
  for insert with check (true);

create policy "Allow public update" on public.item_movements
  for update using (true);

create policy "Allow public delete" on public.item_movements
  for delete using (true);

-- ============================================
-- Table: visit_enquiries (add new columns)
-- ============================================
alter table if exists public.visit_enquiries
  add column if not exists whatsapp_number text,
  add column if not exists source text,
  add column if not exists registration_date date,
  add column if not exists call_type text,
  add column if not exists check_in timestamp with time zone,
  add column if not exists check_out timestamp with time zone;


-- ---------- add-item-movement-branch.sql ----------
-- Which branch an item went to, or came from.
--
-- `item_movements.branch_id` says whose register the row is in -- who recorded
-- the movement -- and there was nothing at all for the branch at the other end.
-- A dispatch to the Kothrud centre and a dispatch to a courier looked the same
-- once filed, and the register could not be filtered by branch because no
-- column named one.
--
-- Nullable on purpose: plenty of movements are to and from people who are not
-- branches -- a vendor, a courier, a student -- and those stay in `party`.
--
-- Run once in the Supabase SQL editor. Safe to re-run. The application degrades
-- gracefully until it is: the register still reads and still saves, without the
-- branch.
alter table public.item_movements
  add column if not exists counterparty_branch_id text
  references public.branches(id) on delete set null;

create index if not exists "item_movements_counterparty_idx"
  on public.item_movements (counterparty_branch_id)
  where counterparty_branch_id is not null;

notify pgrst, 'reload schema';


-- ---------- add-multi-course-and-dropdowns.sql ----------
-- Run in Supabase Dashboard -> SQL Editor. Project: etxhjiawkpinmardkjzv.
-- Safe to re-run.

-- ============================================
-- students.courseIds - enrol a student on more than one course
-- ============================================
-- `students.courseId` stays the primary course, because every existing screen,
-- invoice and certificate reads it. `courseIds` carries the full set, primary
-- included, so a student on three courses no longer loses two of them.
--
-- NOTE: the admission and edit forms retry without this column on PGRST204, so
-- they keep working before this is run - only the extra courses are dropped.
alter table public.students
  add column if not exists "courseIds" text[] not null default '{}';

-- Backfill the array from the single course already on file.
update public.students
   set "courseIds" = array["courseId"]::text[]
 where "courseId" is not null
   and coalesce(array_length("courseIds", 1), 0) = 0;

-- ============================================
-- dropdown_options - user-editable option lists
-- ============================================
-- The picker lists (gender, blood group, board, stream, ...) were hard-coded
-- arrays, so an institute that uses a category the code never heard of had no
-- way to add it. One row per list per organisation; a missing row means "use
-- the built-in defaults".
create table if not exists public.dropdown_options (
  id text primary key default gen_random_uuid()::text,
  -- Deliberately not a foreign key: `organizations.id` is text on this database
  -- and uuid on others, and a type mismatch would abort the whole script.
  "organizationId" text,
  "key" text not null,
  "values" text[] not null default '{}',
  "updatedAt" timestamp with time zone default timezone('utc'::text, now()) not null
);

create unique index if not exists dropdown_options_org_key
  on public.dropdown_options ("organizationId", "key");

alter table public.dropdown_options enable row level security;

drop policy if exists "Allow public read" on public.dropdown_options;
create policy "Allow public read" on public.dropdown_options
  for select using (true);

drop policy if exists "Allow public insert" on public.dropdown_options;
create policy "Allow public insert" on public.dropdown_options
  for insert with check (true);

drop policy if exists "Allow public update" on public.dropdown_options;
create policy "Allow public update" on public.dropdown_options
  for update using (true);

drop policy if exists "Allow public delete" on public.dropdown_options;
create policy "Allow public delete" on public.dropdown_options
  for delete using (true);

notify pgrst, 'reload schema';


-- ---------- document-templates.sql ----------
-- Templates the institute designs once, and the branch each one belongs to.
--
-- The Document Designer saved its work in `localStorage`. That is one browser:
-- a template an administrator drew was invisible to every other machine, to
-- every branch, and to the pages that actually print a student's documents --
-- which carried their own hardcoded layouts and ignored the designer entirely.
--
-- Two tables. `document_templates` is the organisation's library, and
-- `branch_document_templates` says which of them a branch prints from. A branch
-- with no assignment falls back to the organisation's default for that kind, so
-- nobody is left unable to print.
--
-- Run once in the Supabase SQL editor. Safe to re-run.


-- ---------------------------------------------------------------------
-- 1. The library.
-- ---------------------------------------------------------------------
create table if not exists public.document_templates (
  id text primary key,
  "organizationId" text references public.organizations(id) on delete cascade,
  -- `DocumentKind`: certificate, marksheet, student-id, staff-id, admit-card,
  -- student-award, branch-award, centre-certificate. Text rather than an enum:
  -- the app adds kinds, and a migration per kind is a poor trade.
  kind text not null,
  name text not null,
  -- The whole design: elements, background, background image.
  design jsonb not null,
  -- What a branch prints when nothing was assigned to it.
  "isDefault" boolean not null default false,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create index if not exists "document_templates_org_kind_idx"
  on public.document_templates ("organizationId", kind);

-- One default per kind, per organisation. A partial unique index rather than a
-- constraint, because every non-default row would otherwise collide on false.
create unique index if not exists "document_templates_default_idx"
  on public.document_templates ("organizationId", kind)
  where "isDefault";


-- ---------------------------------------------------------------------
-- 2. Which template a branch prints from.
-- ---------------------------------------------------------------------
create table if not exists public.branch_document_templates (
  id text primary key,
  "branchId" text not null references public.branches(id) on delete cascade,
  kind text not null,
  "templateId" text not null references public.document_templates(id) on delete cascade,
  "updatedAt" timestamptz not null default now()
);

-- A branch prints one template per kind.
create unique index if not exists "branch_document_templates_idx"
  on public.branch_document_templates ("branchId", kind);


-- ---------------------------------------------------------------------
-- 3. Who may read and write them.
--
--    Everyone in the institute reads: a branch has to load the template it
--    prints from. Only an administrator writes -- designing and assigning are
--    the organisation's, which is the same line the courses catalogue draws.
-- ---------------------------------------------------------------------
alter table public.document_templates enable row level security;
alter table public.branch_document_templates enable row level security;

drop policy if exists "Templates readable inside the organisation" on public.document_templates;
drop policy if exists "Templates written by an administrator" on public.document_templates;

create policy "Templates readable inside the organisation" on public.document_templates
  for select to authenticated
  using (public.jwt_role() = 'SUPER_ADMIN' or "organizationId" = public.jwt_org_id());

create policy "Templates written by an administrator" on public.document_templates
  for all to authenticated
  using (
    public.jwt_role() = 'SUPER_ADMIN'
    or (public.is_org_admin() and "organizationId" = public.jwt_org_id())
  )
  with check (
    public.jwt_role() = 'SUPER_ADMIN'
    or (public.is_org_admin() and "organizationId" = public.jwt_org_id())
  );

drop policy if exists "Assignments readable inside the organisation" on public.branch_document_templates;
drop policy if exists "Assignments written by an administrator" on public.branch_document_templates;

create policy "Assignments readable inside the organisation" on public.branch_document_templates
  for select to authenticated
  using (
    public.jwt_role() = 'SUPER_ADMIN'
    or exists (
      select 1 from public.branches b
      where b.id = "branchId" and b."organizationId" = public.jwt_org_id()
    )
  );

create policy "Assignments written by an administrator" on public.branch_document_templates
  for all to authenticated
  using (public.jwt_role() = 'SUPER_ADMIN' or public.is_org_admin())
  with check (public.jwt_role() = 'SUPER_ADMIN' or public.is_org_admin());


notify pgrst, 'reload schema';


-- ---------------------------------------------------------------------
-- 4. Check.
-- ---------------------------------------------------------------------
select t.kind, t.name, t."isDefault", count(a.id) as branches
from public.document_templates t
left join public.branch_document_templates a on a."templateId" = t.id
group by t.id, t.kind, t.name, t."isDefault"
order by t.kind, t.name;


-- ---------- roles.sql ----------
-- An institute's own roles, and what each of them may open.
--
-- The app had eight roles written into its code and three views to put them
-- in, so an accountant, a receptionist and a teacher were all handed the same
-- branch menu -- choosing between them at Add User changed nothing. The User
-- Roles page, meanwhile, listed four roles that existed nowhere but that file.
--
-- This gives an organisation real roles: its own names, and a list of the
-- pages each one may open.
--
-- What it deliberately does NOT do is let a role escape the database's own
-- rules. `users.role` stays the `SystemRole` enum, because every RLS policy in
-- this schema reads it through jwt_role() -- a made-up value there would be a
-- stranger to all of them. A custom role therefore carries a `baseRole`, which
-- is what the account is actually minted as, and its module list only narrows
-- what that base can already do. Permission granted here is UI; permission
-- refused by RLS is the wall.
--
-- Run once in the Supabase SQL editor. Safe to re-run.


-- ---------------------------------------------------------------------
-- 1. The table.
-- ---------------------------------------------------------------------
create table if not exists public.roles (
  id text primary key,
  "organizationId" text references public.organizations(id) on delete cascade,
  name text not null,
  description text,
  -- What the login is minted as, and therefore what RLS sees.
  "baseRole" "SystemRole" not null default 'STAFF',
  -- Navigation paths this role may open. Empty means "everything its base
  -- role could open anyway", which is how every account behaved before.
  modules text[] not null default '{}',
  -- The eight the app ships with. Their base cannot be changed and they
  -- cannot be deleted; their name and modules can.
  "isSystem" boolean not null default false,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

-- Two roles in one institute cannot share a name, however it is capitalised.
create unique index if not exists "roles_org_name_idx"
  on public.roles ("organizationId", lower(name));

create index if not exists "roles_org_idx" on public.roles ("organizationId");


-- ---------------------------------------------------------------------
-- 2. Which role a login holds.
--
--    `users.role` still holds the base -- this only says which of the
--    institute's roles it was given, and so which menu it gets.
-- ---------------------------------------------------------------------
alter table public.users add column if not exists "roleId" text;

do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_schema = 'public' and constraint_name = 'users_roleId_fkey'
  ) then
    alter table public.users
      add constraint "users_roleId_fkey"
      foreign key ("roleId") references public.roles(id) on delete set null;
  end if;
end $$;


-- ---------------------------------------------------------------------
-- 3. Who may read and write them.
--
--    Everyone in the institute reads: a receptionist's own login has to be
--    able to read the role it holds, or the app cannot build their menu.
--    Only an administrator writes.
-- ---------------------------------------------------------------------
alter table public.roles enable row level security;

drop policy if exists "Roles readable inside the organisation" on public.roles;
drop policy if exists "Roles written by an administrator" on public.roles;

create policy "Roles readable inside the organisation" on public.roles
  for select to authenticated
  using (
    public.jwt_role() = 'SUPER_ADMIN'
    or "organizationId" = public.jwt_org_id()
  );

create policy "Roles written by an administrator" on public.roles
  for all to authenticated
  using (
    public.jwt_role() = 'SUPER_ADMIN'
    or (public.is_org_admin() and "organizationId" = public.jwt_org_id())
  )
  with check (
    public.jwt_role() = 'SUPER_ADMIN'
    or (public.is_org_admin() and "organizationId" = public.jwt_org_id())
  );


-- ---------------------------------------------------------------------
-- 4. The eight the app ships with, for every organisation that exists.
--
--    Seeded with no modules, which reads as "everything this base could
--    already open" -- so running this migration changes nobody's access
--    until an administrator narrows a role on purpose.
-- ---------------------------------------------------------------------
insert into public.roles (id, "organizationId", name, description, "baseRole", "isSystem")
select
  o.id || ':' || r.base,
  o.id,
  r.label,
  r.description,
  r.base::"SystemRole",
  true
from public.organizations o
cross join (values
  ('ORGANIZATION_ADMIN', 'Organisation Admin', 'Every branch and every module, settings and users included.'),
  ('BRANCH_ADMIN',       'Branch Admin',       'Runs one branch: its admissions, fees, attendance and results.'),
  ('ACCOUNTANT',         'Accountant',         'Fees, payments and the branch wallet.'),
  ('RECEPTIONIST',       'Receptionist',       'The front desk: visitors, enquiries and admissions.'),
  ('TEACHER',            'Teacher',            'Classes, attendance, exams and marks.'),
  ('STAFF',              'Staff',              'General staff: whatever the institute grants them.')
) as r(base, label, description)
on conflict (id) do nothing;


notify pgrst, 'reload schema';


-- ---------------------------------------------------------------------
-- 5. Check.
-- ---------------------------------------------------------------------
select "organizationId", name, "baseRole", "isSystem", cardinality(modules) as modules
from public.roles
order by "organizationId", "isSystem" desc, name;


-- ---------- role-permissions.sql ----------
-- What a role may do on each page, beyond opening it.
--
-- roles.modules decides which pages a role may open. This adds
-- roles.permissions: { "<page path>": ["create","edit","delete","print",
-- "export","approve"] }. A page with no entry keeps every action, so running
-- this changes nobody's access until an administrator narrows a role on the
-- Access Control page.
--
-- Like modules, this is enforced by the app (buttons, menus and row actions
-- the role lacks are hidden or refused); the database's own row-level rules
-- still decide which centre's records anyone can touch at all.
--
-- Needs roles.sql first. Run once in the Supabase SQL editor. Safe to re-run.

do $$
begin
  if to_regclass('public.roles') is null then
    raise notice 'Run roles.sql first: there is no roles table to add permissions to.';
  else
    alter table public.roles
      add column if not exists permissions jsonb not null default '{}'::jsonb;
  end if;
end $$;


-- ---------- session-years.sql ----------
-- Give the academic session somewhere to live.
--
-- Session Management looked like a working screen and was not one: both pages
-- held a hardcoded array in React state, so an add, an edit or a delete changed
-- the list on screen, toasted "success", and was gone on the next render. There
-- was no table behind it at all -- `session_years` did not exist, and neither
-- does any session model in the Prisma schema.
--
-- The session is not just a list to maintain. `students.academicYear` is the
-- column an admission writes, and an admission dated outside the session it
-- claims is the kind of wrong that only surfaces a year later when someone runs
-- a report. Storing the session's real start and end dates is what lets the
-- admission form check that.
--
-- Run once in the Supabase SQL editor. Safe to re-run.


-- ---------------------------------------------------------------------
-- 1. The table.
--
--    `startDate`/`endDate` are the single source of truth for the year: a
--    separate startYear/endYear pair, which is what the mock form collected,
--    can contradict the dates it sits beside. The years shown on screen are
--    derived from these two columns instead.
--
--    Unlike the tables generated from Prisma, `id` and `updatedAt` carry real
--    database defaults, so a PostgREST insert that omits them succeeds.
-- ---------------------------------------------------------------------
create table if not exists public.session_years (
  id               text primary key default gen_random_uuid()::text,
  "organizationId" text references public.organizations(id) on delete cascade,
  name             text not null,
  "startDate"      date not null,
  "endDate"        date not null,
  status           text not null default 'ACTIVE',
  -- Which session new admissions default to. Separate from `status`, because
  -- next year's session is ACTIVE and open for enrolment long before it
  -- becomes the one the office is working in.
  "isCurrent"      boolean not null default false,
  description      text,
  "createdAt"      timestamptz not null default now(),
  "updatedAt"      timestamptz not null default now(),
  "deletedAt"      timestamptz,
  constraint session_years_status_check
    check (status in ('ACTIVE', 'UPCOMING', 'CLOSED')),
  -- A session that ends before it starts would make every date check below
  -- vacuous, and the admission form reads this range to bound its date box.
  constraint session_years_dates_check check ("endDate" > "startDate")
);

create index if not exists "session_years_organizationId_idx"
  on public.session_years ("organizationId");

-- One current session per institute, enforced here rather than in the browser:
-- the admission form picks a default from this flag, and two rows claiming it
-- would make that default arbitrary. `setCurrentSessionYear` clears the old one
-- before setting the new one to stay inside this index.
create unique index if not exists "session_years_one_current_idx"
  on public.session_years ("organizationId")
  where "isCurrent" and "deletedAt" is null;


-- ---------------------------------------------------------------------
-- 2. Who may read and write a session.
--
--    The academic calendar belongs to the institute, so an org admin owns it
--    and every other signed-in account at that institute reads it -- a branch
--    admin filing an admission has to see the session that admission falls in,
--    but must not be able to move its dates underneath head office.
--
--    SUPER_ADMIN is listed separately for the same reason as in
--    user-management.sql: that account often carries no organizationId, and
--    `null = null` is NULL rather than true.
-- ---------------------------------------------------------------------
alter table public.session_years enable row level security;

drop policy if exists "Read own organisation sessions" on public.session_years;
drop policy if exists "Write own organisation sessions" on public.session_years;

create policy "Read own organisation sessions" on public.session_years
  for select to authenticated
  using (
    public.jwt_role() = 'SUPER_ADMIN'
    or "organizationId" = public.jwt_org_id()
  );

create policy "Write own organisation sessions" on public.session_years
  for all to authenticated
  using (
    public.jwt_role() = 'SUPER_ADMIN'
    or (public.is_org_admin() and "organizationId" = public.jwt_org_id())
  )
  with check (
    public.jwt_role() = 'SUPER_ADMIN'
    or (public.is_org_admin() and "organizationId" = public.jwt_org_id())
  );


-- ---------------------------------------------------------------------
-- 3. Seed the sessions the institute is actually in.
--
--    An empty table would leave the admission form with nothing to offer, and
--    it falls back to free text when there are no sessions -- which is the old
--    behaviour, not the fixed one. April-to-March, the Indian academic year.
--
--    Only runs when the table is empty, so re-running cannot duplicate or
--    resurrect a session somebody has since deleted.
-- ---------------------------------------------------------------------
insert into public.session_years ("organizationId", name, "startDate", "endDate", status, "isCurrent", description)
select o.id,
       'Session ' || y.start_year || '-' || (y.start_year + 1),
       make_date(y.start_year, 4, 1),
       make_date(y.start_year + 1, 3, 31),
       case when y.ahead = 0 then 'ACTIVE' else 'UPCOMING' end,
       y.ahead = 0,
       'Seeded by session-years.sql'
  from public.organizations o
 cross join (
        -- The session containing today, then the next one. Before April the
        -- current session is the one that started last calendar year.
        select 0 as ahead,
               case when extract(month from current_date) >= 4
                    then extract(year from current_date)::int
                    else extract(year from current_date)::int - 1
               end as start_year
         union all
        select 1,
               case when extract(month from current_date) >= 4
                    then extract(year from current_date)::int + 1
                    else extract(year from current_date)::int
               end
       ) y
 where not exists (select 1 from public.session_years);


-- ---------------------------------------------------------------------
-- 4. Check what is in place now.
-- ---------------------------------------------------------------------
select name, "startDate", "endDate", status, "isCurrent"
from public.session_years
order by "startDate" desc;

select policyname, cmd from pg_policies
where schemaname = 'public' and tablename = 'session_years';


-- ---------- free-text-choices.sql ----------
-- Let the "Other" choices be typed, not only picked.
--
-- Every dropdown in the app that ended in a bare "Other" now ends in
-- "Other (type your own)…", so a branch can record *what* the thing was -- a
-- coaching centre, a neighbour standing as local guardian, a visitor who came
-- about something the seven purposes never anticipated.
--
-- Four of those columns are Postgres enums, and anything outside their members
-- is rejected with 22P02. Converting them to text keeps every existing value
-- exactly as it is -- the enum labels are read back as strings -- while letting
-- a typed value through.
--
-- Companion to course-category-free-text.sql, which did the same for
-- `courses.category`. Run once in the Supabase SQL editor. Safe to re-run.
do $$
declare
  target record;
begin
  for target in
    select *
    from (values
      ('branches',         'instituteType', 'COMPUTER'),
      ('students',         'gender',        null),
      ('branch_directors', 'gender',        null),
      ('visit_enquiries',  'purpose',       'OTHER')
    ) as t(table_name, column_name, default_value)
  loop
    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = target.table_name
        and column_name = target.column_name
        and data_type = 'USER-DEFINED'
    ) then
      -- The default is enum-typed too, so it has to come off before the cast.
      execute format('alter table public.%I alter column %I drop default', target.table_name, target.column_name);
      execute format('alter table public.%I alter column %I type text using %I::text', target.table_name, target.column_name, target.column_name);
      if target.default_value is not null then
        execute format('alter table public.%I alter column %I set default %L', target.table_name, target.column_name, target.default_value);
      end if;
    end if;
  end loop;
end $$;

-- The types themselves are left in place: dropping one would fail if anything
-- else still references it, and an unused type costs nothing.


-- ---------- branch-course-rls.sql ----------
-- =====================================================================
-- branch_courses: the organisation decides, the branch reads
-- =====================================================================
-- branch_courses says which of the organisation's courses a branch may
-- actually run. "Assign Course to Batch" writes it, and every branch-side
-- course list reads it -- the admission form, View Courses, exams, live
-- classes.
--
-- supabase-rls-fix.sql gave the table `FOR ALL TO authenticated USING (true)`
-- along with every other table. That is the wrong shape for this one: a branch
-- could hand itself any course in the organisation, which is the decision the
-- table exists to take away from it.
--
-- So:
--   * organisation admin -> full access
--   * branch account     -> reads its own rows, writes none
--
-- The decision is read from `app_metadata`, NOT `user_metadata`, which a user
-- can rewrite for themselves with supabase.auth.updateUser().
--
-- Depends on branch-scoped-wallet-rls.sql for is_org_admin() and
-- jwt_branch_id(). Run that first if you have not.
--
-- Idempotent - safe to re-run.
-- =====================================================================

alter table public.branch_courses enable row level security;

drop policy if exists "Authenticated full access" on public.branch_courses;
drop policy if exists "Branch courses readable by owner branch or admin" on public.branch_courses;
drop policy if exists "Branch courses written by admin" on public.branch_courses;

create policy "Branch courses readable by owner branch or admin" on public.branch_courses
  for select to authenticated
  using (public.is_org_admin() or "branchId" = public.jwt_branch_id());

create policy "Branch courses written by admin" on public.branch_courses
  for all to authenticated
  using (public.is_org_admin())
  with check (public.is_org_admin());


-- ---------------------------------------------------------------------
-- The client sends neither, and both are NOT NULL. supabase-rls-fix.sql
-- already adds these; repeated here so this file stands on its own.
-- ---------------------------------------------------------------------
alter table public.branch_courses alter column "id" set default gen_random_uuid()::text;
alter table public.branch_courses alter column "updatedAt" set default now();


-- ---------------------------------------------------------------------
-- Check what is in place now.
-- ---------------------------------------------------------------------
select policyname, cmd, roles
from pg_policies
where schemaname = 'public' and tablename = 'branch_courses'
order by policyname;


-- ---------- branch-scoped-wallet-rls.sql ----------
-- =====================================================================
-- Branch-scoped RLS for branch_wallets and branch_transactions
-- =====================================================================
-- supabase-rls-fix.sql gave every signed-in account `FOR ALL TO
-- authenticated USING (true)` on these tables, so a franchise login could
-- read -- and top up -- any branch's wallet. This narrows both tables to the
-- branch the account belongs to, while organisation admins keep full access.
--
-- The decision is read from `app_metadata`, NOT `user_metadata`. A user can
-- rewrite their own user_metadata with supabase.auth.updateUser(), so a policy
-- keyed on it would let a branch account promote itself to admin. app_metadata
-- is writable only by the service role.
--
-- RUN THIS BEFORE redeploying create-branch-user: step 1 backfills the claim
-- the function and these policies both rely on.
--
-- Idempotent - safe to re-run.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. Backfill app_metadata from the user_metadata already on each account.
--    Existing logins only carry user_metadata, so without this every
--    account -- admins included -- would fail the policies below.
-- ---------------------------------------------------------------------
update auth.users
set raw_app_meta_data =
  coalesce(raw_app_meta_data, '{}'::jsonb)
  || jsonb_strip_nulls(jsonb_build_object(
       'role', raw_user_meta_data ->> 'role',
       'branchId', raw_user_meta_data ->> 'branchId',
       'organizationId', raw_user_meta_data ->> 'organizationId'
     ))
where raw_user_meta_data ->> 'role' is not null
   or raw_user_meta_data ->> 'branchId' is not null;


-- ---------------------------------------------------------------------
-- 2. Claim readers. Kept as functions so the two policies below stay
--    readable and there is one place to change if the claim shape moves.
-- ---------------------------------------------------------------------
create or replace function public.jwt_role()
returns text
language sql
stable
as $$
  select upper(coalesce(auth.jwt() -> 'app_metadata' ->> 'role', ''));
$$;

create or replace function public.jwt_branch_id()
returns text
language sql
stable
as $$
  select auth.jwt() -> 'app_metadata' ->> 'branchId';
$$;

create or replace function public.is_org_admin()
returns boolean
language sql
stable
as $$
  select public.jwt_role() in ('SUPER_ADMIN', 'ORGANIZATION_ADMIN');
$$;


-- ---------------------------------------------------------------------
-- 3. The policies. The blanket one goes; service_role is left alone,
--    because the edge functions run under it.
-- ---------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array['branch_wallets', 'branch_transactions'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "Authenticated full access" on public.%I', t);
    execute format('drop policy if exists "Branch scoped access" on public.%I', t);
    execute format($f$
      create policy "Branch scoped access" on public.%I
        for all to authenticated
        using (public.is_org_admin() or "branchId" = public.jwt_branch_id())
        with check (public.is_org_admin() or "branchId" = public.jwt_branch_id())
    $f$, t);
  end loop;
end $$;


-- ---------------------------------------------------------------------
-- 4. Check what is in place now.
-- ---------------------------------------------------------------------
select tablename, policyname, roles
from pg_policies
where schemaname = 'public'
  and tablename in ('branch_wallets', 'branch_transactions')
order by tablename, policyname;

-- NOTE: app_metadata reaches the JWT only when a token is issued, so everyone
-- who is signed in right now must sign out and sign back in before these
-- policies will let them through.


-- ---------- student-portal-rls.sql ----------
-- =====================================================================
-- Student portal: a student sees their own record and nothing else
-- =====================================================================
-- supabase-rls-fix.sql gave every signed-in account `FOR ALL TO authenticated
-- USING (true)` on students, fee_invoices, fee_payments, attendance_records
-- and exam_results. That was survivable while only staff could sign in. The
-- moment a student has a login it is not: from devtools, one student could read
-- every student's phone number, address, fees and marks in the organisation.
--
-- This narrows those five tables to:
--   * organisation admin  -> everything in their organisation
--   * branch account      -> everything in their branch
--   * student             -> their own row only, and read-only
--
-- The decision is read from `app_metadata`, NOT `user_metadata`. A user can
-- rewrite their own user_metadata with supabase.auth.updateUser(), so a policy
-- keyed on it would let a student promote themselves. app_metadata is writable
-- only by the service role, which is why create-student-user sets it there.
--
-- RUN THIS BEFORE issuing the first student login.
-- Depends on branch-scoped-wallet-rls.sql for is_org_admin() and
-- jwt_branch_id(). Run that first if you have not.
--
-- Idempotent - safe to re-run.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. The claim create-student-user writes, read back as a policy input.
-- ---------------------------------------------------------------------
create or replace function public.jwt_student_id()
returns text
language sql
stable
as $$
  select auth.jwt() -> 'app_metadata' ->> 'studentId';
$$;

create or replace function public.is_student()
returns boolean
language sql
stable
as $$
  select upper(coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')) = 'STUDENT';
$$;


-- ---------------------------------------------------------------------
-- 2. students
--
--    A student reads one row: their own. Everything that writes a student
--    record -- admissions, edits, the soft delete -- stays with the branch
--    and the organisation, so a student cannot edit their own marks-bearing
--    record or resurrect a deleted one.
-- ---------------------------------------------------------------------
alter table public.students enable row level security;

drop policy if exists "Authenticated full access" on public.students;
drop policy if exists "Students readable by owner branch or admin" on public.students;
drop policy if exists "Students written by branch or admin" on public.students;

create policy "Students readable by owner branch or admin" on public.students
  for select to authenticated
  using (
    public.is_org_admin()
    or (public.is_student() and "id" = public.jwt_student_id())
    or (not public.is_student() and "branchId" = public.jwt_branch_id())
  );

create policy "Students written by branch or admin" on public.students
  for all to authenticated
  using (public.is_org_admin() or (not public.is_student() and "branchId" = public.jwt_branch_id()))
  with check (public.is_org_admin() or (not public.is_student() and "branchId" = public.jwt_branch_id()));


-- ---------------------------------------------------------------------
-- 3. The two tables that carry both studentId and branchId, so the same
--    policy shape fits each and is written once: a student is admitted only to
--    rows whose studentId is their own.
--
--    exam_results and fee_payments are scoped differently -- neither carries a
--    branchId -- and are handled separately below.
-- ---------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array['fee_invoices', 'attendance_records'] loop
    continue when to_regclass('public.' || quote_ident(t)) is null;

    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "Authenticated full access" on public.%I', t);
    execute format('drop policy if exists "Readable by student branch or admin" on public.%I', t);
    execute format('drop policy if exists "Written by branch or admin" on public.%I', t);

    execute format($f$
      create policy "Readable by student branch or admin" on public.%I
        for select to authenticated
        using (
          public.is_org_admin()
          or (public.is_student() and "studentId" = public.jwt_student_id())
          or (not public.is_student() and "branchId" = public.jwt_branch_id())
        )
    $f$, t);

    -- A student never writes a fee, an attendance mark or a result.
    execute format($f$
      create policy "Written by branch or admin" on public.%I
        for all to authenticated
        using (public.is_org_admin() or (not public.is_student() and "branchId" = public.jwt_branch_id()))
        with check (public.is_org_admin() or (not public.is_student() and "branchId" = public.jwt_branch_id()))
    $f$, t);
  end loop;
end $$;


-- ---------------------------------------------------------------------
-- 4. exam_results — carries studentId but no branchId, so staff scoping goes
--    through the exam the result belongs to.
-- ---------------------------------------------------------------------
alter table public.exam_results enable row level security;

drop policy if exists "Authenticated full access" on public.exam_results;
drop policy if exists "Results readable by student branch or admin" on public.exam_results;
drop policy if exists "Results written by branch or admin" on public.exam_results;

create policy "Results readable by student branch or admin" on public.exam_results
  for select to authenticated
  using (
    public.is_org_admin()
    or (public.is_student() and "studentId" = public.jwt_student_id())
    or (
      not public.is_student()
      and exists (
        select 1 from public.exams e
        where e."id" = public.exam_results."examId"
          and e."branchId" = public.jwt_branch_id()
      )
    )
  );

-- A student never writes their own result.
create policy "Results written by branch or admin" on public.exam_results
  for all to authenticated
  using (public.is_org_admin() or not public.is_student())
  with check (public.is_org_admin() or not public.is_student());


-- ---------------------------------------------------------------------
-- 5. fee_payments — reached through the invoice it settles.
-- ---------------------------------------------------------------------
alter table public.fee_payments enable row level security;

drop policy if exists "Authenticated full access" on public.fee_payments;
drop policy if exists "Payments readable by student branch or admin" on public.fee_payments;
drop policy if exists "Payments written by branch or admin" on public.fee_payments;

create policy "Payments readable by student branch or admin" on public.fee_payments
  for select to authenticated
  using (
    public.is_org_admin()
    or exists (
      select 1 from public.fee_invoices i
      where i."id" = public.fee_payments."invoiceId"
        and (
          (public.is_student() and i."studentId" = public.jwt_student_id())
          or (not public.is_student() and i."branchId" = public.jwt_branch_id())
        )
    )
  );

create policy "Payments written by branch or admin" on public.fee_payments
  for all to authenticated
  using (public.is_org_admin() or not public.is_student())
  with check (public.is_org_admin() or not public.is_student());


notify pgrst, 'reload schema';


-- ---------------------------------------------------------------------
-- 6. Check what is in place now.
-- ---------------------------------------------------------------------
select tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
  and tablename in ('students', 'fee_invoices', 'fee_payments', 'attendance_records', 'exam_results')
order by tablename, policyname;

-- NOTE: app_metadata reaches the JWT only when a token is issued, so anyone
-- signed in right now must sign out and back in before these policies pass them.


-- ---------- create-student-login.sql ----------
-- =====================================================================
-- Issue a student portal login from the SQL editor
-- =====================================================================
-- A stand-in for the create-student-user edge function, for the case where
-- that function has not been deployed to the project. It mints exactly what
-- the function mints -- an auth account at <loginId>@careeroptics.local, the
-- app_metadata claims the portal RLS reads, and the students.userId link --
-- so a login made here and a login made by the function are the same thing to
-- the rest of the app.
--
-- Two things this deliberately does NOT do, and the edge function does:
--
--   * It does not check who is asking. The SQL editor already runs as the
--     database owner, so there is no caller to confine to a branch. Anyone
--     with SQL editor access can already read and write every table; this
--     function hands them nothing they did not have.
--   * It does not make the "Create login" button in View Students work. That
--     button calls the edge function. Until the function is deployed, every
--     login has to be issued by running this.
--
-- Writing into auth.users by hand is not something Supabase supports, so treat
-- this as the temporary path it is and deploy the function when you can:
--   supabase functions deploy create-student-user --project-ref <ref> --workdir organization
--
-- RUN student-portal-rls.sql FIRST. Without it every signed-in account -- a
-- student included -- can read every student's phone, fees and marks.
--
-- Idempotent: re-running against the same student resets their password
-- instead of creating a second account.
-- =====================================================================

create extension if not exists pgcrypto with schema extensions;


-- ---------------------------------------------------------------------
-- p_student may be the student's id, enrolment number or application
-- number, so you can issue a login straight from what is on screen
-- without going to look up a UUID.
--
-- p_login_id is what the student types to sign in. Left null it falls
-- back to the enrolment number, the way the edge function does. The
-- login page appends @careeroptics.local, so the account is stored there.
-- ---------------------------------------------------------------------
create or replace function public.create_student_login(
  p_student  text,
  p_login_id text default null,
  p_password text default null
)
returns table (student_id text, user_id uuid, login_email text, created boolean)
language plpgsql
security invoker
set search_path = public, extensions, auth
as $$
declare
  v_student  record;
  v_org      text;
  v_name     text;
  v_login    text;
  v_email    text;
  v_user     uuid;
  v_other    uuid;
  v_created  boolean := false;
  v_app      jsonb;
  v_meta     jsonb;
  v_identity jsonb;
begin
  if length(coalesce(p_password, '')) < 6 then
    raise exception 'Password must be at least 6 characters';
  end if;

  -- The id column may be uuid or text depending on how the table was
  -- built, so every comparison here goes through ::text.
  select s."id"::text                  as id,
         s."firstName"                 as first_name,
         s."lastName"                  as last_name,
         s."branchId"::text            as branch_id,
         s."userId"::text              as user_id,
         s."enrollmentNo"::text        as enrollment_no,
         s."applicationNo"::text       as application_no,
         s."email"::text               as email,
         s."phone"::text               as phone
    into v_student
    from public.students s
   where s."deletedAt" is null
     and (    s."id"::text                          = p_student
          or lower(coalesce(s."enrollmentNo"::text, '')) = lower(p_student)
          or lower(coalesce(s."applicationNo"::text, '')) = lower(p_student))
   limit 1;

  if v_student.id is null then
    raise exception 'No student matches "%" by id, enrolment number or application number', p_student;
  end if;

  select b."organizationId"::text
    into v_org
    from public.branches b
   where b."id"::text = v_student.branch_id;

  if v_org is null then
    raise exception 'The student''s branch (%) no longer exists', v_student.branch_id;
  end if;

  v_name := nullif(btrim(concat_ws(' ', v_student.first_name, v_student.last_name)), '');
  v_name := coalesce(v_name, 'Student');

  v_login := nullif(btrim(coalesce(p_login_id, '')), '');
  v_login := coalesce(v_login,
                      nullif(btrim(coalesce(v_student.enrollment_no, '')), ''),
                      nullif(btrim(coalesce(v_student.application_no, '')), ''));
  if v_login is null then
    raise exception 'This student has no enrolment number yet, so pass a login ID';
  end if;

  v_email := lower(v_login);
  if position('@' in v_email) = 0 then
    v_email := v_email || '@careeroptics.local';
  end if;

  -- students.userId is the link the portal reads, so an existing account is
  -- found through it rather than by matching on the address.
  if v_student.user_id is not null then
    select u.id into v_user from auth.users u where u.id::text = v_student.user_id;
  end if;

  -- Refuse to move an address off someone else's account: that would sign
  -- this student in as them.
  select u.id
    into v_other
    from auth.users u
   where lower(u.email) = v_email
     and (v_user is null or u.id <> v_user);
  if v_other is not null then
    raise exception 'Login ID "%" is already taken by another account', v_login;
  end if;

  -- Only the service role can write app_metadata through the API, which is
  -- why the portal's RLS policies read the claims from there and not from
  -- user_metadata, which a student can rewrite themselves.
  v_app := jsonb_build_object(
    'role',           'STUDENT',
    'branchId',       v_student.branch_id,
    'organizationId', v_org,
    'studentId',      v_student.id
  );

  v_meta := jsonb_build_object(
    'name',           v_name,
    'role',           'STUDENT',
    'userType',       'STUDENT',
    'branchId',       v_student.branch_id,
    'organizationId', v_org,
    'studentId',      v_student.id,
    'contactEmail',   v_student.email,
    'phone',          v_student.phone
  );

  if v_user is null then
    v_user := gen_random_uuid();

    -- The token columns are set to '' rather than left null on purpose:
    -- GoTrue reads them as strings and a null makes later auth calls for
    -- this account fail with a conversion error.
    insert into auth.users (
      instance_id, id, aud, role,
      email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change,
      email_change_token_current, reauthentication_token, phone_change, phone_change_token
    ) values (
      '00000000-0000-0000-0000-000000000000', v_user, 'authenticated', 'authenticated',
      v_email, crypt(p_password, gen_salt('bf')), now(),
      jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')) || v_app,
      v_meta,
      now(), now(),
      '', '', '', '', '', '', '', ''
    );
    v_created := true;
  else
    update auth.users
       set email              = v_email,
           encrypted_password = crypt(p_password, gen_salt('bf')),
           email_confirmed_at = coalesce(email_confirmed_at, now()),
           raw_app_meta_data  = coalesce(raw_app_meta_data,  '{}'::jsonb) || v_app,
           raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || v_meta,
           updated_at         = now()
     where id = v_user;
  end if;

  -- Password sign-in resolves the account through auth.identities, so an
  -- account without this row exists but cannot sign in.
  v_identity := jsonb_build_object(
    'sub',            v_user::text,
    'email',          v_email,
    'email_verified', true,
    'phone_verified', false
  );

  if exists (
    select 1 from information_schema.columns
     where table_schema = 'auth' and table_name = 'identities' and column_name = 'provider_id'
  ) then
    insert into auth.identities (
      id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(), v_user, v_user::text, v_identity, 'email', now(), now(), now()
    )
    on conflict (provider, provider_id)
      do update set identity_data = excluded.identity_data, updated_at = now();
  else
    -- Older projects key identities on (provider, id) and have no provider_id.
    insert into auth.identities (
      id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
    ) values (
      v_user::text, v_user, v_identity, 'email', now(), now(), now()
    )
    on conflict (provider, id)
      do update set identity_data = excluded.identity_data, updated_at = now();
  end if;

  -- Without this link every portal query resolves to no student and they
  -- sign in to an empty workspace. The id is passed as a literal so it fits
  -- whether the column is uuid or text.
  execute format(
    'update public.students set "userId" = %L, "updatedAt" = now() where "id"::text = %L',
    v_user::text, v_student.id
  );

  return query select v_student.id, v_user, v_email, v_created;
end;
$$;


-- ---------------------------------------------------------------------
-- Anything in `public` is reachable over PostgREST as /rest/v1/rpc/<name>,
-- so leaving the default EXECUTE in place would let any visitor with the
-- anon key reset any student's password. Only the SQL editor and the
-- service role should be able to call this.
-- ---------------------------------------------------------------------
revoke all on function public.create_student_login(text, text, text) from public;
revoke all on function public.create_student_login(text, text, text) from anon, authenticated;


-- =====================================================================
-- PART 4 — OPTIONAL: lock the catalogue down in the database too
-- =====================================================================
--
-- Hiding "New course" from a branch is the UI, not a boundary: `courses`
-- still carries a blanket "Authenticated full access" policy, so any
-- signed-in user could insert a course through the API.
--
-- Left commented out on purpose. It is a real behaviour change, and the same
-- blanket policy sits on `branches`, `users` and `students` too -- so
-- tightening one table is a decision about four, not a tidy-up. Uncomment
-- deliberately, and check the app still works for a branch account after.
--
-- drop policy if exists "Authenticated full access" on public.courses;
--
-- create policy "Anyone signed in reads the catalogue"
--   on public.courses for select to authenticated using (true);
--
-- create policy "Only the organisation writes the catalogue"
--   on public.courses for all to authenticated
--   using (public.is_org_admin())
--   with check (public.is_org_admin());


-- =====================================================================
-- PART 5 — What is in place now.
-- =====================================================================
select 'students.parentage'      as thing,
       to_regclass('public.students') is not null
       and exists (select 1 from information_schema.columns
                    where table_name = 'students' and column_name = 'parentage') as present
union all select 'branch_certificate_fees', to_regclass('public.branch_certificate_fees') is not null
union all select 'certificate_issues', to_regclass('public.certificate_issues') is not null
union all select 'course_subjects',  to_regclass('public.course_subjects') is not null
union all select 'exam_schedules',   to_regclass('public.exam_schedules') is not null
union all select 'admit_cards',      to_regclass('public.admit_cards') is not null
union all select 'marksheets',       to_regclass('public.marksheets') is not null
union all select 'students.block',
       exists (select 1 from information_schema.columns
                where table_name = 'students' and column_name = 'block')
union all select 'batch_timings.classMode',
       exists (select 1 from information_schema.columns
                where table_name = 'batch_timings' and column_name = 'classMode')
union all select 'course_modules',   to_regclass('public.course_modules')   is not null
union all select 'course_chapters',  to_regclass('public.course_chapters')  is not null
union all select 'admission_leads',  to_regclass('public.admission_leads')  is not null
union all select 'franchise_leads',  to_regclass('public.franchise_leads')  is not null
union all select 'practice_files',   to_regclass('public.practice_files')   is not null;
