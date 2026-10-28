-- Portal and payment feature columns on branches.
--
-- These shipped in the branch settings UI before this file was ever run, so
-- every Create Branch attempt failed with PGRST204 ("Could not find the
-- 'onlineFeePayment' column of 'branches' in the schema cache"). That left the
-- organisation with zero branches, which in turn emptied every branch dropdown
-- in the app and disabled every branch-gated form.
--
-- Run once in the Supabase SQL editor. Safe to re-run.
--
-- NOTE: createBranch/updateBranch now retry without these columns on PGRST204,
-- so branch creation works even before this is run - but the three toggles are
-- silently dropped until it is.
alter table public.branches
  add column if not exists "onlineFeePayment" boolean not null default false,
  add column if not exists "studentPortal" boolean not null default false,
  add column if not exists "parentPortal" boolean not null default false;
