-- Live classes have no table of their own: the ViewLiveClasses / LiveClassSetup
-- screens treat one weekly `batch_timings` slot as one class. The columns below
-- are the parts of that UI the base table cannot store -- without them a class
-- cannot be titled, given a meeting link, or cancelled, and `getLiveClasses`
-- falls back to deriving everything from the slot's day and time.
--
-- Run this in the Supabase SQL editor. It is safe to re-run.

alter table public.batch_timings
  add column if not exists "title" text,
  add column if not exists "platform" text,
  add column if not exists "meetingLink" text,
  add column if not exists "meetingId" text,
  add column if not exists "description" text,
  add column if not exists "status" text not null default 'scheduled',
  add column if not exists "recorded" boolean not null default false;
