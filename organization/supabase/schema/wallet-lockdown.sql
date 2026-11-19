-- =====================================================================
-- Close the wallet to direct writes from a centre
-- =====================================================================
-- branch-scoped-wallet-rls.sql's "Branch scoped access" let a centre's
-- login update or delete its own wallet and transactions through the API:
-- set its own balance, or mark its own recharge request COMPLETED.
-- RUN-ALL.sql already drops it; this does only that, for a database that
-- still has it. What a centre needs stays:
--   * reading its wallet and history (the "readable by owner or admin" policies)
--   * filing a PENDING recharge request ("Branch files a pending request")
-- and fees are taken by the security-definer charge functions.
-- Organisation admins keep "Wallet written by admin" / "Transactions written
-- by admin", and may delete a history entry (Wallet Transactions / Requests).
-- Safe to re-run.
-- =====================================================================

drop policy if exists "Branch scoped access" on public.branch_wallets;
drop policy if exists "Branch scoped access" on public.branch_transactions;

drop policy if exists "Transactions deleted by admin" on public.branch_transactions;
create policy "Transactions deleted by admin" on public.branch_transactions
  for delete to authenticated
  using (public.is_org_admin());

notify pgrst, 'reload schema';

select tablename, policyname, cmd from pg_policies
 where tablename in ('branch_wallets', 'branch_transactions') order by tablename, policyname;
