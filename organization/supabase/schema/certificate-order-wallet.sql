-- =====================================================================
-- Approving a certificate order charges the centre's wallet
-- =====================================================================
-- Until now the head office could approve an order at any amount and the
-- centre's wallet never moved. This makes the approval the charge:
--
--   PENDING  -> APPROVED    take `amount` from the centre's wallet, or refuse
--                           the approval with INSUFFICIENT_BALANCE
--   APPROVED -> REJECTED    give back exactly what the approval took
--   APPROVED -> DISPATCHED  no money moves
--   PENDING  -> REJECTED    no money moves (nothing was taken)
--
-- Both ledger lines are COMPLETED rows in branch_transactions with
-- category 'CERTIFICATE_ORDER' and reference = the order number, written
-- the same way charge_centre() and issue_certificate() write theirs
-- (type DEBIT/CREDIT, paymentMethod WALLET, balanceAfter stored).
--
-- Trigger order. Postgres fires BEFORE UPDATE triggers of a table in name
-- order. `certificate_orders_guard` (centre-panel.sql, rules in
-- certificate-orders-rules.sql) sorts before `certificate_orders_wallet`,
-- so by the time this runs the guard has already put a centre login's
-- status/amount back to the old values, refused any illegal transition and
-- refused an approval with no amount. This trigger only ever sees a change
-- the guard let through. It still checks old/new status itself rather than
-- trusting the guard, and the check at the bottom lists the firing order.
--
-- No double charge, three ways:
--   1. The UPDATE holds the order row's lock, so two approvals of the same
--      order run one after the other; the second sees status already
--      APPROVED and is not a transition at all.
--   2. Before charging (or refunding) it looks for an existing ledger line
--      with this order's reference, category and type, and skips if found.
--   3. A unique index on (reference, type) for this category makes a second
--      line impossible even if 1 and 2 were somehow bypassed.
--
-- Needs centre-panel.sql, certificate-orders-rules.sql and
-- certificate-wallet-charge.sql (for the WALLET payment method) first.
-- Run once in the Supabase SQL editor. Safe to re-run.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. One debit and at most one refund per order, enforced by the database.
--    Partial: no other category's references are constrained.
-- ---------------------------------------------------------------------
create unique index if not exists branch_transactions_certificate_order_uidx
  on public.branch_transactions ("reference", "type")
  where "category" = 'CERTIFICATE_ORDER';


-- ---------------------------------------------------------------------
-- 2. The charge / refund.
--
--    security definer: branch-scoped-wallet-rls.sql narrows the wallet
--    tables, and the money must move whoever's login made the approval.
--    Only the guard-approved status change reaches the money code, and the
--    guard only lets an org admin change status.
-- ---------------------------------------------------------------------
create or replace function public.certificate_order_wallet()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_wallet  record;
  v_have    double precision;
  v_amount  double precision;
  v_balance double precision;
  v_count   integer := coalesce(cardinality(new."studentIds"), 0);
  v_by      text := auth.uid()::text;
  v_now     timestamp(3) := current_timestamp;
begin
  -- The charge was made at the approved amount; letting the amount change
  -- afterwards would make the order disagree with what the wallet paid.
  if old.status in ('APPROVED', 'DISPATCHED') and new.amount is distinct from old.amount then
    raise exception 'The amount of an approved order cannot change.' using errcode = 'P0001';
  end if;

  if new.status is not distinct from old.status then
    return new;
  end if;

  perform pg_advisory_xact_lock(hashtext('certificate_order:' || new.id));

  if new.status = 'APPROVED' then
    v_amount := coalesce(new.amount, 0)::double precision;
    if v_amount <= 0 then
      return new;
    end if;
    if exists (
      select 1 from public.branch_transactions
       where "reference" = new."orderNo" and "category" = 'CERTIFICATE_ORDER' and "type" = 'DEBIT'
    ) then
      return new;
    end if;

    select * into v_wallet from public.branch_wallets where "branchId" = new."branchId" for update;
    -- A centre never recharged has no wallet row: a balance of 0.
    v_have := case when found then coalesce(v_wallet."balance", 0) else 0 end;
    if v_have < v_amount then
      raise exception 'INSUFFICIENT_BALANCE: certificate order % needs Rs %, wallet balance is Rs %.',
        new."orderNo", round(v_amount::numeric, 2), round(v_have::numeric, 2)
        using errcode = 'P0001';
    end if;

    v_balance := v_have - v_amount;
    update public.branch_wallets set "balance" = v_balance, "updatedAt" = v_now where "id" = v_wallet."id";

    insert into public.branch_transactions (
      "id", "branchId", "amount", "type", "category", "description", "reference",
      "status", "paymentMethod", "balanceAfter", "reviewedBy", "createdAt", "updatedAt"
    ) values (
      gen_random_uuid()::text, new."branchId", v_amount, 'DEBIT', 'CERTIFICATE_ORDER',
      'Certificate order ' || new."orderNo" || ' (' || v_count || case when v_count = 1 then ' student)' else ' students)' end,
      new."orderNo", 'COMPLETED', 'WALLET', v_balance, v_by, v_now, v_now
    );

  elsif new.status = 'REJECTED' and old.status = 'APPROVED' then
    -- Refund what was actually taken, not the order's amount: an order
    -- approved before this migration was never charged and gets nothing back.
    select "amount" into v_amount
      from public.branch_transactions
     where "reference" = old."orderNo" and "category" = 'CERTIFICATE_ORDER' and "type" = 'DEBIT'
       and "branchId" = old."branchId" and "status" = 'COMPLETED'
     limit 1;
    if coalesce(v_amount, 0) <= 0 then
      return new;
    end if;
    if exists (
      select 1 from public.branch_transactions
       where "reference" = old."orderNo" and "category" = 'CERTIFICATE_ORDER' and "type" = 'CREDIT'
    ) then
      return new;
    end if;

    select * into v_wallet from public.branch_wallets where "branchId" = old."branchId" for update;
    if found then
      v_balance := coalesce(v_wallet."balance", 0) + v_amount;
      update public.branch_wallets set "balance" = v_balance, "updatedAt" = v_now where "id" = v_wallet."id";
    else
      v_balance := v_amount;
      insert into public.branch_wallets ("id", "branchId", "balance", "isActive", "createdAt", "updatedAt")
      values (gen_random_uuid()::text, old."branchId", v_balance, true, v_now, v_now);
    end if;

    insert into public.branch_transactions (
      "id", "branchId", "amount", "type", "category", "description", "reference",
      "status", "paymentMethod", "balanceAfter", "reviewedBy", "createdAt", "updatedAt"
    ) values (
      gen_random_uuid()::text, old."branchId", v_amount, 'CREDIT', 'CERTIFICATE_ORDER',
      'Refund: certificate order ' || old."orderNo" || ' rejected (' || v_count || case when v_count = 1 then ' student)' else ' students)' end,
      old."orderNo", 'COMPLETED', 'WALLET', v_balance, v_by, v_now, v_now
    );
  end if;

  return new;
end;
$$;
revoke all on function public.certificate_order_wallet() from public, anon, authenticated;


-- ---------------------------------------------------------------------
-- 3. The trigger. Its name must sort after certificate_orders_guard.
-- ---------------------------------------------------------------------
drop trigger if exists certificate_orders_wallet on public.certificate_orders;
create trigger certificate_orders_wallet before update on public.certificate_orders
  for each row execute function public.certificate_order_wallet();

notify pgrst, 'reload schema';


-- ---------------------------------------------------------------------
-- 4. Check: BEFORE UPDATE triggers in firing order. Expect
--    certificate_orders_guard first, then certificate_orders_wallet.
-- ---------------------------------------------------------------------
select t.tgname as trigger_name, p.proname as function_name
  from pg_trigger t
  join pg_proc p on p.oid = t.tgfoid
 where t.tgrelid = 'public.certificate_orders'::regclass
   and not t.tgisinternal
 order by t.tgname;
