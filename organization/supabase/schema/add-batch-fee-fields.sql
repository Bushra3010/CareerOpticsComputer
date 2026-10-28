-- Fee discount and remark on a batch.
-- Run once in the Supabase SQL editor. Safe to re-run.
alter table public.batches
  add column if not exists "feeDiscount" double precision not null default 0,
  add column if not exists "remark" text;
