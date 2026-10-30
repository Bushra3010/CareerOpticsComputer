-- =====================================================================
-- Centre charges: what a centre pays from its wallet, set by head office
-- =====================================================================
-- The head office decides, in one place, what each centre pays out of its
-- wallet for the work it does:
--
--   ADMISSION    a student admitted at the centre
--   ADMIT_CARD   an admit card issued (once per student per term)
--   MARKSHEET    a result / marksheet made (once per student per term)
--   CERTIFICATE  a completion certificate issued (once per student)
--
-- A rate is set for all centres (scope '*') and may be overridden for one
-- centre (scope = its branch id). Each thing is charged once: the ledger
-- below remembers what was charged for, so re-saving a marksheet or
-- re-printing a certificate is free. A wallet that cannot cover the charge
-- refuses the action itself, so nothing is issued unpaid. A rate of 0 (the
-- default) charges nothing, so running this changes nobody's work until the
-- head office sets a rate.
--
-- Replaces branch_certificate_fees, whose rates are carried over.
--
-- Needs certificate-wallet-charge.sql and exam-workflow.sql first. Run once
-- in the Supabase SQL editor. Safe to re-run.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. Rates.
-- ---------------------------------------------------------------------
create table if not exists public.centre_charge_rates (
  "scope"     text not null,   -- '*' for every centre, or a branch id
  "item"      text not null check ("item" in ('ADMISSION', 'ADMIT_CARD', 'MARKSHEET', 'CERTIFICATE')),
  "amount"    double precision not null default 0 check ("amount" >= 0),
  "updatedBy" text,
  "updatedAt" timestamptz not null default now(),
  primary key ("scope", "item")
);

alter table public.centre_charge_rates enable row level security;

drop policy if exists "Rates readable by admin or the centre" on public.centre_charge_rates;
create policy "Rates readable by admin or the centre" on public.centre_charge_rates
  for select to authenticated
  using (public.is_org_admin() or "scope" = '*' or "scope" = public.jwt_branch_id());

drop policy if exists "Rates set by admin" on public.centre_charge_rates;
create policy "Rates set by admin" on public.centre_charge_rates
  for all to authenticated
  using (public.is_org_admin()) with check (public.is_org_admin());

-- The certificate fees set before this page existed.
do $$
begin
  if to_regclass('public.branch_certificate_fees') is not null then
    insert into public.centre_charge_rates ("scope", "item", "amount", "updatedBy")
    select "branchId", 'CERTIFICATE', "amount", "updatedBy"
      from public.branch_certificate_fees
    on conflict ("scope", "item") do nothing;
  end if;
end $$;

-- What a centre pays for an item: its own rate, else the all-centres one.
create or replace function public.centre_rate(p_branch_id text, p_item text)
returns double precision
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select "amount" from public.centre_charge_rates where "scope" = p_branch_id and "item" = p_item),
    (select "amount" from public.centre_charge_rates where "scope" = '*' and "item" = p_item),
    0);
$$;
grant execute on function public.centre_rate(text, text) to authenticated;


-- ---------------------------------------------------------------------
-- 2. What has been charged, so nothing is charged twice.
-- ---------------------------------------------------------------------
create table if not exists public.centre_charges (
  "id"            text primary key default gen_random_uuid()::text,
  "branchId"      text not null,
  "item"          text not null,
  "refKey"        text not null,   -- what it was for: a student, or student:term
  "amount"        double precision not null,
  "transactionId" text,
  "chargedBy"     text,
  "chargedAt"     timestamptz not null default now(),
  unique ("item", "refKey")
);

create index if not exists "centre_charges_branch_idx" on public.centre_charges ("branchId", "chargedAt" desc);

alter table public.centre_charges enable row level security;

drop policy if exists "Charges readable by admin or the centre" on public.centre_charges;
create policy "Charges readable by admin or the centre" on public.centre_charges
  for select to authenticated
  using (public.is_org_admin() or public.is_branch_staff("branchId"));


-- ---------------------------------------------------------------------
-- 3. charge_centre: take an item's rate from the centre's wallet, once.
--    Returns { amount, balance, transactionId, alreadyCharged }. Raises
--    INSUFFICIENT_BALANCE when the wallet cannot cover it. Internal: only
--    the functions and triggers below call it.
-- ---------------------------------------------------------------------
create or replace function public.charge_centre(
  p_branch_id   text,
  p_item        text,
  p_ref_key     text,
  p_description text,
  p_reference   text default null,
  p_by          text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_fee     double precision;
  v_wallet  record;
  v_balance double precision;
  v_tx_id   text;
  v_now     timestamp(3) := current_timestamp;
begin
  if p_branch_id is null then
    return jsonb_build_object('amount', 0, 'alreadyCharged', false);
  end if;
  perform pg_advisory_xact_lock(hashtext('charge:' || p_item || ':' || p_ref_key));
  if exists (select 1 from public.centre_charges where "item" = p_item and "refKey" = p_ref_key) then
    return jsonb_build_object('amount', 0, 'alreadyCharged', true);
  end if;

  v_fee := public.centre_rate(p_branch_id, p_item);
  if v_fee <= 0 then
    return jsonb_build_object('amount', 0, 'alreadyCharged', false);
  end if;

  select * into v_wallet from public.branch_wallets where "branchId" = p_branch_id for update;
  if not found then
    raise exception 'INSUFFICIENT_BALANCE: % fee is Rs %, wallet balance is Rs 0.', initcap(replace(p_item, '_', ' ')), v_fee;
  end if;
  if coalesce(v_wallet."balance", 0) < v_fee then
    raise exception 'INSUFFICIENT_BALANCE: % fee is Rs %, wallet balance is Rs %.',
      initcap(replace(p_item, '_', ' ')), v_fee, coalesce(v_wallet."balance", 0);
  end if;

  v_balance := v_wallet."balance" - v_fee;
  update public.branch_wallets set "balance" = v_balance, "updatedAt" = v_now where "id" = v_wallet."id";

  v_tx_id := gen_random_uuid()::text;
  insert into public.branch_transactions (
    "id", "branchId", "amount", "type", "category", "description", "reference",
    "status", "paymentMethod", "balanceAfter", "reviewedBy", "createdAt", "updatedAt"
  ) values (
    v_tx_id, p_branch_id, v_fee, 'DEBIT', p_item, p_description, coalesce(p_reference, p_ref_key),
    'COMPLETED', 'WALLET', v_balance, p_by, v_now, v_now
  );

  insert into public.centre_charges ("branchId", "item", "refKey", "amount", "transactionId", "chargedBy")
  values (p_branch_id, p_item, p_ref_key, v_fee, v_tx_id, p_by);

  return jsonb_build_object('amount', v_fee, 'balance', v_balance, 'transactionId', v_tx_id, 'alreadyCharged', false);
end;
$$;
revoke all on function public.charge_centre(text, text, text, text, text, text) from public, anon, authenticated;

-- A student's name and number, for the ledger line.
create or replace function public.student_label(p_student_id text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select trim(concat_ws(' ', "firstName", "lastName")) || ' (' ||
         coalesce(nullif("enrollmentNo", ''), nullif("applicationNo", ''), left("id", 8)) || ')'
  from public.students where "id" = p_student_id;
$$;
revoke all on function public.student_label(text) from public, anon, authenticated;


-- ---------------------------------------------------------------------
-- 4. Charging as the work is done. AFTER INSERT: an upsert that only
--    updates an existing marksheet or admit card is not charged again, and
--    a refused charge rolls the insert back with it.
-- ---------------------------------------------------------------------
create or replace function public.charge_marksheet()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.charge_centre(new."branchId", 'MARKSHEET', new."studentId" || ':' || new."term",
    'Marksheet fee - ' || coalesce(public.student_label(new."studentId"), new."studentId") || ' term ' || new."term",
    'MS-' || new."studentId" || '-' || new."term", new."createdBy");
  return new;
end;
$$;

drop trigger if exists "marksheets_charge_centre" on public.marksheets;
create trigger "marksheets_charge_centre" after insert on public.marksheets
  for each row execute function public.charge_marksheet();

create or replace function public.charge_admit_card()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.charge_centre(new."branchId", 'ADMIT_CARD', new."studentId" || ':' || new."term",
    'Admit card fee - ' || coalesce(public.student_label(new."studentId"), new."studentId") || ' term ' || new."term",
    new."rollNo", new."issuedBy");
  return new;
end;
$$;

drop trigger if exists "admit_cards_charge_centre" on public.admit_cards;
create trigger "admit_cards_charge_centre" after insert on public.admit_cards
  for each row execute function public.charge_admit_card();

-- Admissions made by a signed-in office or centre login. A public online
-- application (no login) is not charged until the office admits it.
create or replace function public.charge_admission()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.jwt_role() <> '' and public.jwt_role() <> 'STUDENT' then
    perform public.charge_centre(new."branchId", 'ADMISSION', new."id",
      'Admission fee - ' || trim(concat_ws(' ', new."firstName", new."lastName")),
      coalesce(new."applicationNo", new."enrollmentNo"), null);
  end if;
  return new;
end;
$$;

drop trigger if exists "students_charge_centre" on public.students;
create trigger "students_charge_centre" after insert on public.students
  for each row execute function public.charge_admission();


-- ---------------------------------------------------------------------
-- 5. issue_certificate charges through the same ledger and rates.
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
    if (p_issue_date is not null or p_exam_date is not null) and public.jwt_role() <> 'STUDENT' then
      update public.certificate_issues
         set "issueDate" = coalesce(p_issue_date, "issueDate"),
             "examConductedDate" = coalesce(p_exam_date, "examConductedDate")
       where "id" = v_issue."id";
    end if;
    return jsonb_build_object('charged', false, 'alreadyIssued', true, 'amount', v_issue."amount",
                              'certificateNo', v_issue."certificateNo");
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
select "scope", "item", "amount" from public.centre_charge_rates order by "scope", "item";
