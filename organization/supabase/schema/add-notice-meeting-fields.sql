-- Meeting details on a branch notice.
-- Run once in the Supabase SQL editor. Safe to re-run.
alter table public.branch_notices
  add column if not exists "meetingTime" timestamptz,
  add column if not exists "meetingLink" text;
