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

notify pgrst, 'reload schema';


-- ---------------------------------------------------------------------
-- 9. Check.
-- ---------------------------------------------------------------------
select 'course_subjects' as thing, to_regclass('public.course_subjects') is not null as present
union all select 'exam_centres',   to_regclass('public.exam_centres') is not null
union all select 'exam_schedules', to_regclass('public.exam_schedules') is not null
union all select 'admit_cards',    to_regclass('public.admit_cards') is not null
union all select 'marksheets',     to_regclass('public.marksheets') is not null
union all select 'verify_result()', exists (select 1 from pg_proc where proname = 'verify_result');
