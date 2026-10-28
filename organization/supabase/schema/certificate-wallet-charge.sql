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

notify pgrst, 'reload schema';


-- ---------------------------------------------------------------------
-- 5. Check.
-- ---------------------------------------------------------------------
select 'branch_certificate_fees' as thing, to_regclass('public.branch_certificate_fees') is not null as present
union all select 'certificate_issues', to_regclass('public.certificate_issues') is not null
union all select 'issue_certificate()', exists (select 1 from pg_proc where proname = 'issue_certificate');
