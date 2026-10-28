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
