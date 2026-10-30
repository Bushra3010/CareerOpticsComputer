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
