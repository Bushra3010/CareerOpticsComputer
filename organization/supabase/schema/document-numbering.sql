-- Document numbering: the academy's registration, certificate and serial numbers.
--
--   Registration no.  COCA/<year>/<00101>      one series for every centre, never reset;
--                                             given when a student is APPROVED (a staff
--                                             admission is approved as it is saved).
--   Certificate no.   COCA/CERT/<year>/<00201> one series, a new number for every
--                                             certificate issued.
--   Serial no.        <YY><MM><0001>           e.g. 26110001: the year and month of
--                                             issue, then a count that restarts monthly.
--
-- The counters live in the database so two centres saving at the same moment can
-- never get the same number. Safe to run more than once.

create sequence if not exists public.registration_no_seq start with 101 minvalue 1;
create sequence if not exists public.certificate_no_seq start with 201 minvalue 1;

-- One row per month: the last serial handed out in it.
create table if not exists public.document_serials (
  "period" text primary key,
  "last"   integer not null default 0
);
-- Only the definer functions below touch it; no policy means no direct access.
alter table public.document_serials enable row level security;

alter table public.certificate_issues add column if not exists "serialNo" text;

-- A counter in at least five digits, more once it outgrows them (lpad alone would cut it).
create or replace function public.pad_counter(n bigint, width int default 5)
returns text language sql immutable as $$
  select lpad(n::text, greatest(width, length(n::text)), '0')
$$;

create or replace function public.next_registration_no()
returns text language sql volatile security definer set search_path = public as $$
  select 'COCA/' || to_char(now() at time zone 'Asia/Kolkata', 'YYYY') || '/'
         || public.pad_counter(nextval('public.registration_no_seq'))
$$;

create or replace function public.next_certificate_no()
returns text language sql volatile security definer set search_path = public as $$
  select 'COCA/CERT/' || to_char(now() at time zone 'Asia/Kolkata', 'YYYY') || '/'
         || public.pad_counter(nextval('public.certificate_no_seq'))
$$;

create or replace function public.next_document_serial()
returns text language plpgsql volatile security definer set search_path = public as $$
declare
  v_period text := to_char(now() at time zone 'Asia/Kolkata', 'YYMM');
  v_last   int;
begin
  insert into public.document_serials ("period", "last") values (v_period, 1)
  on conflict ("period") do update set "last" = public.document_serials."last" + 1
  returning "last" into v_last;
  return v_period || public.pad_counter(v_last, 4);
end;
$$;

-- Nobody burns numbers by calling these directly; the triggers and
-- allocate_certificate_numbers() below are the only ways in.
revoke all on function public.next_registration_no() from public, anon, authenticated;
revoke all on function public.next_certificate_no() from public, anon, authenticated;
revoke all on function public.next_document_serial() from public, anon, authenticated;

-- Registration number: given once, when the student is approved.
create or replace function public.assign_registration_no()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if coalesce(trim(new."enrollmentNo"), '') = '' and new."admissionStatus"::text = 'APPROVED' then
    new."enrollmentNo" := public.next_registration_no();
  end if;
  return new;
end;
$$;
drop trigger if exists students_registration_no on public.students;
create trigger students_registration_no
  before insert or update of "admissionStatus", "enrollmentNo" on public.students
  for each row execute function public.assign_registration_no();

-- Certificate and serial numbers on every issue, whichever function writes it.
create or replace function public.assign_certificate_numbers()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if coalesce(trim(new."certificateNo"), '') = '' or new."certificateNo" like 'CERT-%' then
    new."certificateNo" := public.next_certificate_no();
  end if;
  if coalesce(trim(new."serialNo"), '') = '' then
    new."serialNo" := public.next_document_serial();
  end if;
  return new;
end;
$$;
drop trigger if exists certificate_issues_numbers on public.certificate_issues;
create trigger certificate_issues_numbers
  before insert on public.certificate_issues
  for each row execute function public.assign_certificate_numbers();

-- A certificate printed outside certificate_issues (the typing certificate) takes
-- its numbers from the same series. Staff only.
create or replace function public.allocate_certificate_numbers()
returns jsonb language plpgsql volatile security definer set search_path = public as $$
begin
  if not coalesce(public.is_org_admin() or (public.jwt_role() <> 'STUDENT' and public.jwt_branch_id() is not null), false) then
    raise exception 'Not allowed to allocate certificate numbers.';
  end if;
  return jsonb_build_object('certificateNo', public.next_certificate_no(), 'serialNo', public.next_document_serial());
end;
$$;
revoke all on function public.allocate_certificate_numbers() from public, anon;
grant execute on function public.allocate_certificate_numbers() to authenticated;

-- Approved students admitted before this file ran get their numbers now, oldest first.
do $$
declare r record;
begin
  for r in
    select "id" from public.students
     where "deletedAt" is null and coalesce(trim("enrollmentNo"), '') = '' and "admissionStatus"::text = 'APPROVED'
     order by "createdAt"
  loop
    update public.students set "enrollmentNo" = public.next_registration_no() where "id" = r."id";
  end loop;
end $$;

-- issue_certificate (exam-workflow.sql), taking the new numbers before it charges
-- the centre, so the wallet entry and the certificate carry the same number.
CREATE OR REPLACE FUNCTION public.issue_certificate(p_student_id text, p_issued_by text DEFAULT NULL::text, p_issue_date date DEFAULT NULL::date, p_exam_date date DEFAULT NULL::date)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_student record;
  v_issue   record;
  v_charge  jsonb;
  v_fee     double precision;
  v_no      text;
  v_serial  text;
begin
  select "id", "branchId", "firstName", "lastName", "enrollmentNo", "applicationNo"
    into v_student
    from public.students
   where "id" = p_student_id and "deletedAt" is null;
  if not found then
    raise exception 'Student not found.';
  end if;

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
    if (p_issue_date is not null or p_exam_date is not null) and public.is_org_admin() then
      update public.certificate_issues
         set "issueDate" = coalesce(p_issue_date, "issueDate"),
             "examConductedDate" = coalesce(p_exam_date, "examConductedDate")
       where "id" = v_issue."id";
    end if;
    return jsonb_build_object('charged', false, 'alreadyIssued', true, 'amount', v_issue."amount",
                              'certificateNo', v_issue."certificateNo", 'serialNo', v_issue."serialNo");
  end if;

  if not public.is_org_admin() then
    raise exception 'APPROVAL_REQUIRED: the head office has not approved this certificate yet.';
  end if;

  if exists (select 1 from public.marksheets where "studentId" = p_student_id)
     and not exists (select 1 from public.marksheets
                      where "studentId" = p_student_id and "isFinal" and "result" = 'PASS') then
    raise exception 'NOT_ELIGIBLE: the student has no passed final-term marksheet yet.';
  end if;

  v_no := public.next_certificate_no();
  v_serial := public.next_document_serial();
  v_charge := public.charge_centre(v_student."branchId", 'CERTIFICATE', p_student_id,
    'Certificate fee - ' || trim(v_student."firstName" || ' ' || v_student."lastName"), v_no, p_issued_by);
  v_fee := coalesce((v_charge ->> 'amount')::double precision, 0);

  insert into public.certificate_issues
    ("studentId", "branchId", "amount", "transactionId", "issuedBy", "issueDate", "examConductedDate", "certificateNo", "serialNo")
  values
    (p_student_id, v_student."branchId", v_fee, v_charge ->> 'transactionId', p_issued_by,
     coalesce(p_issue_date, current_date), p_exam_date, v_no, v_serial);

  -- Issued by the office directly: on the record as approved.
  insert into public.print_approvals ("kind", "studentId", "branchId", "issueDate", "examConductedDate", "status", "requestedBy", "reviewedBy", "reviewedAt")
  values ('CERTIFICATE', p_student_id, v_student."branchId", coalesce(p_issue_date, current_date), p_exam_date, 'APPROVED', p_issued_by, p_issued_by, now())
  on conflict ("studentId") where "kind" = 'CERTIFICATE' do update
     set "status" = 'APPROVED', "reviewedBy" = coalesce(print_approvals."reviewedBy", excluded."reviewedBy"),
         "reviewedAt" = coalesce(print_approvals."reviewedAt", excluded."reviewedAt");

  return jsonb_build_object('charged', v_fee > 0, 'alreadyIssued', false, 'amount', v_fee,
                            'balance', (v_charge ->> 'balance')::double precision, 'certificateNo', v_no, 'serialNo', v_serial);
end;
$function$;

-- The certificate's QR carries its certificate number, so verification takes that,
-- the serial number, or the student's enrolment / application number.
create or replace function public.verify_certificate(p_enrollment text)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  v        jsonb;
  v_cert   record;
  v_final  record;
  v_key    text := upper(trim(coalesce(p_enrollment, '')));
  v_ref    text;
begin
  if v_key = '' then return jsonb_build_object('found', false); end if;
  select ci.*, coalesce(nullif(s."enrollmentNo", ''), s."applicationNo") as "studentRef"
    into v_cert
    from public.certificate_issues ci
    join public.students s on s."id" = ci."studentId"
   where upper(trim(ci."certificateNo")) = v_key or upper(trim(ci."serialNo")) = v_key
   limit 1;
  v_ref := case when found then v_cert."studentRef" else p_enrollment end;
  v := public.public_student_core(v_ref);
  if v is null then return jsonb_build_object('found', false); end if;
  if v_cert."id" is null then
    select ci.*, null::text as "studentRef" into v_cert from public.certificate_issues ci where ci."studentId" = v ->> 'id';
    if not found then return jsonb_build_object('found', true, 'issued', false, 'student', v - 'id'); end if;
  end if;
  select "percentage", "grade" into v_final
    from public.marksheets where "studentId" = v ->> 'id' and "isFinal" order by "term" desc limit 1;
  return jsonb_build_object(
    'found', true, 'issued', true, 'student', v - 'id',
    'certificateNo', v_cert."certificateNo",
    'serialNo', v_cert."serialNo",
    'issueDate', coalesce(v_cert."issueDate", v_cert."issuedAt"::date),
    'examConductedDate', v_cert."examConductedDate",
    'percentage', v_final."percentage", 'grade', v_final."grade"
  );
end;
$$;
grant execute on function public.verify_certificate(text) to anon, authenticated;
