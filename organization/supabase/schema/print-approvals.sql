-- =====================================================================
-- Print approvals: a centre's certificates and marksheets wait for the
-- head office.
--
-- A centre (branch login, or the office working as a centre) asks; the
-- head office approves or rejects. Until then:
--   * a certificate is not issued at all -- no number, no wallet charge --
--     so there is nothing to print. Approving issues it and charges the
--     centre's wallet, exactly as issuing did before.
--   * a marksheet a centre saves is held: the pages print it only once its
--     approval is APPROVED. Editing an approved marksheet sends it back.
-- What the head office issues or saves itself is approved as it is made.
-- Everything issued or saved before this file ran is approved, so no
-- existing certificate or marksheet stops printing.
--
-- Run after exam-workflow.sql and centre-charges.sql. Safe to re-run.
-- =====================================================================

create table if not exists public.print_approvals (
  "id"                text primary key default gen_random_uuid()::text,
  "kind"              text not null check ("kind" in ('CERTIFICATE', 'MARKSHEET')),
  "studentId"         text not null references public.students("id") on delete cascade,
  "branchId"          text not null,
  "marksheetId"       text references public.marksheets("id") on delete cascade,
  "issueDate"         date,
  "examConductedDate" date,
  "status"            text not null default 'PENDING' check ("status" in ('PENDING', 'APPROVED', 'REJECTED')),
  "note"              text,
  "requestedBy"       text,
  "requestedAt"       timestamptz not null default now(),
  "reviewedBy"        text,
  "reviewedAt"        timestamptz
);

-- One request per certificate and per marksheet; a rejected one is asked again in place.
create unique index if not exists "print_approvals_certificate_key" on public.print_approvals ("studentId") where "kind" = 'CERTIFICATE';
create unique index if not exists "print_approvals_marksheet_key" on public.print_approvals ("marksheetId") where "kind" = 'MARKSHEET';
create index if not exists "print_approvals_branch_idx" on public.print_approvals ("branchId", "status");

alter table public.print_approvals enable row level security;

-- Read by the head office and by the centre the request belongs to. Written
-- only through the functions below, which check who is asking.
drop policy if exists "Approvals readable by admin or the centre" on public.print_approvals;
create policy "Approvals readable by admin or the centre" on public.print_approvals
  for select to authenticated
  using (public.is_org_admin() or public.is_branch_staff("branchId"));

grant select on public.print_approvals to authenticated;


-- ---------------------------------------------------------------------
-- 1. Everything already issued or saved stays printable.
-- ---------------------------------------------------------------------
insert into public.print_approvals ("kind", "studentId", "branchId", "issueDate", "examConductedDate", "status", "requestedBy", "reviewedBy", "reviewedAt")
select 'CERTIFICATE', c."studentId", c."branchId", c."issueDate", c."examConductedDate", 'APPROVED', c."issuedBy", 'existing', now()
  from public.certificate_issues c
 where not exists (select 1 from public.print_approvals a where a."kind" = 'CERTIFICATE' and a."studentId" = c."studentId");

insert into public.print_approvals ("kind", "studentId", "branchId", "marksheetId", "status", "requestedBy", "reviewedBy", "reviewedAt")
select 'MARKSHEET', m."studentId", m."branchId", m."id", 'APPROVED', m."createdBy", 'existing', now()
  from public.marksheets m
 where not exists (select 1 from public.print_approvals a where a."kind" = 'MARKSHEET' and a."marksheetId" = m."id");


-- ---------------------------------------------------------------------
-- 2. A marksheet goes for approval as the centre saves it.
--    The head office's own saves are approved on the spot. A centre's save
--    -- new, or a change to marks already approved -- is PENDING again.
-- ---------------------------------------------------------------------
create or replace function public.marksheet_approval()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text := case when public.is_org_admin() then 'APPROVED' else 'PENDING' end;
begin
  -- Only what prints matters: re-saving the same marks keeps an approval.
  if tg_op = 'UPDATE'
     and new."marks" is not distinct from old."marks"
     and new."issueDate" is not distinct from old."issueDate"
     and new."session" is not distinct from old."session" then
    return new;
  end if;

  insert into public.print_approvals ("kind", "studentId", "branchId", "marksheetId", "status", "requestedBy", "requestedAt", "reviewedBy", "reviewedAt", "note")
  values ('MARKSHEET', new."studentId", new."branchId", new."id", v_status, new."createdBy", now(),
          case when v_status = 'APPROVED' then new."createdBy" end,
          case when v_status = 'APPROVED' then now() end, null)
  on conflict ("marksheetId") where "kind" = 'MARKSHEET' do update
     set "status" = excluded."status",
         "requestedBy" = excluded."requestedBy",
         "requestedAt" = excluded."requestedAt",
         "reviewedBy" = excluded."reviewedBy",
         "reviewedAt" = excluded."reviewedAt",
         "note" = null;
  return new;
end;
$$;

drop trigger if exists "marksheets_print_approval" on public.marksheets;
create trigger "marksheets_print_approval" after insert or update on public.marksheets
  for each row execute function public.marksheet_approval();


-- ---------------------------------------------------------------------
-- 3. A centre asks for a certificate.
--    Returns { status }. The head office gets APPROVED straight away (the
--    page then issues as before); a centre gets PENDING, or the decision
--    already made.
-- ---------------------------------------------------------------------
create or replace function public.request_certificate_approval(
  p_student_id   text,
  p_requested_by text default null,
  p_issue_date   date default null,
  p_exam_date    date default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student record;
  v_row     record;
begin
  select "id", "branchId" into v_student from public.students where "id" = p_student_id and "deletedAt" is null;
  if not found then
    raise exception 'Student not found.';
  end if;
  if not coalesce(public.is_org_admin() or public.is_branch_staff(v_student."branchId"), false) then
    raise exception 'Not allowed to request this student''s certificate.';
  end if;
  if public.is_org_admin() then
    return jsonb_build_object('status', 'APPROVED');
  end if;

  -- The same rule issuing applies, so a request the office could never
  -- approve is not sent.
  if exists (select 1 from public.marksheets where "studentId" = p_student_id)
     and not exists (select 1 from public.marksheets
                      where "studentId" = p_student_id and "isFinal" and "result" = 'PASS') then
    raise exception 'NOT_ELIGIBLE: the student has no passed final-term marksheet yet.';
  end if;

  select * into v_row from public.print_approvals where "kind" = 'CERTIFICATE' and "studentId" = p_student_id;
  if found and v_row."status" = 'APPROVED' then
    return jsonb_build_object('status', 'APPROVED');
  end if;

  insert into public.print_approvals ("kind", "studentId", "branchId", "issueDate", "examConductedDate", "status", "requestedBy", "requestedAt")
  values ('CERTIFICATE', p_student_id, v_student."branchId", p_issue_date, p_exam_date, 'PENDING', p_requested_by, now())
  on conflict ("studentId") where "kind" = 'CERTIFICATE' do update
     set "status" = 'PENDING',
         "issueDate" = excluded."issueDate",
         "examConductedDate" = excluded."examConductedDate",
         "requestedBy" = excluded."requestedBy",
         "requestedAt" = excluded."requestedAt",
         "reviewedBy" = null,
         "reviewedAt" = null,
         "note" = null;
  return jsonb_build_object('status', 'PENDING');
end;
$$;

revoke all on function public.request_certificate_approval(text, text, date, date) from public, anon;
grant execute on function public.request_certificate_approval(text, text, date, date) to authenticated;


-- ---------------------------------------------------------------------
-- 4. The head office decides. Approving a certificate issues it -- number
--    and wallet charge -- through issue_certificate, so a centre that
--    cannot pay keeps its request pending and the office sees why.
-- ---------------------------------------------------------------------
create or replace function public.review_print_approval(
  p_id          text,
  p_approve     boolean,
  p_note        text default null,
  p_reviewed_by text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row   record;
  v_issue jsonb;
begin
  if not public.is_org_admin() then
    raise exception 'Only the head office approves prints.';
  end if;
  select * into v_row from public.print_approvals where "id" = p_id for update;
  if not found then
    raise exception 'Request not found.';
  end if;

  if p_approve and v_row."kind" = 'CERTIFICATE' then
    v_issue := public.issue_certificate(v_row."studentId", p_reviewed_by, v_row."issueDate", v_row."examConductedDate");
  end if;

  update public.print_approvals
     set "status" = case when p_approve then 'APPROVED' else 'REJECTED' end,
         "note" = nullif(trim(coalesce(p_note, '')), ''),
         "reviewedBy" = p_reviewed_by,
         "reviewedAt" = now()
   where "id" = p_id;

  return jsonb_build_object('status', case when p_approve then 'APPROVED' else 'REJECTED' end, 'issue', v_issue);
end;
$$;

revoke all on function public.review_print_approval(text, boolean, text, text) from public, anon;
grant execute on function public.review_print_approval(text, boolean, text, text) to authenticated;


-- ---------------------------------------------------------------------
-- 5. issue_certificate issues a new certificate for the head office only.
--    A centre or a student gets one by approval; once issued, anyone who
--    could before may print it again, free.
-- ---------------------------------------------------------------------
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
  v_charge  jsonb;
  v_fee     double precision;
  v_no      text;
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
                              'certificateNo', v_issue."certificateNo");
  end if;

  if not public.is_org_admin() then
    raise exception 'APPROVAL_REQUIRED: the head office has not approved this certificate yet.';
  end if;

  if exists (select 1 from public.marksheets where "studentId" = p_student_id)
     and not exists (select 1 from public.marksheets
                      where "studentId" = p_student_id and "isFinal" and "result" = 'PASS') then
    raise exception 'NOT_ELIGIBLE: the student has no passed final-term marksheet yet.';
  end if;

  v_no := 'CERT-' || coalesce(nullif(v_student."enrollmentNo", ''), nullif(v_student."applicationNo", ''), left(v_student."id", 8));
  v_charge := public.charge_centre(v_student."branchId", 'CERTIFICATE', p_student_id,
    'Certificate fee - ' || trim(v_student."firstName" || ' ' || v_student."lastName"), v_no, p_issued_by);
  v_fee := coalesce((v_charge ->> 'amount')::double precision, 0);

  insert into public.certificate_issues
    ("studentId", "branchId", "amount", "transactionId", "issuedBy", "issueDate", "examConductedDate", "certificateNo")
  values
    (p_student_id, v_student."branchId", v_fee, v_charge ->> 'transactionId', p_issued_by,
     coalesce(p_issue_date, current_date), p_exam_date, v_no);

  -- Issued by the office directly: on the record as approved.
  insert into public.print_approvals ("kind", "studentId", "branchId", "issueDate", "examConductedDate", "status", "requestedBy", "reviewedBy", "reviewedAt")
  values ('CERTIFICATE', p_student_id, v_student."branchId", coalesce(p_issue_date, current_date), p_exam_date, 'APPROVED', p_issued_by, p_issued_by, now())
  on conflict ("studentId") where "kind" = 'CERTIFICATE' do update
     set "status" = 'APPROVED', "reviewedBy" = coalesce(print_approvals."reviewedBy", excluded."reviewedBy"),
         "reviewedAt" = coalesce(print_approvals."reviewedAt", excluded."reviewedAt");

  return jsonb_build_object('charged', v_fee > 0, 'alreadyIssued', false, 'amount', v_fee,
                            'balance', (v_charge ->> 'balance')::double precision, 'certificateNo', v_no);
end;
$$;

revoke all on function public.issue_certificate(text, text, date, date) from public, anon;
grant execute on function public.issue_certificate(text, text, date, date) to authenticated;

notify pgrst, 'reload schema';


-- ---------------------------------------------------------------------
-- 6. Check.
-- ---------------------------------------------------------------------
select "kind", "status", count(*) from public.print_approvals group by 1, 2 order by 1, 2;
