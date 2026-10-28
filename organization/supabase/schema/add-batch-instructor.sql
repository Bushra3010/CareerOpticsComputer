-- The teacher who takes a batch.
--
-- Instructor used to be picked per timing slot, which meant the same name had
-- to be re-entered for every day of the week and nothing tied a teacher to the
-- batch itself. It is now chosen once, when the course is assigned to the
-- batch, and lives here.
--
-- Run once in the Supabase SQL editor. Safe to re-run.
alter table public.batches
  add column if not exists "instructor" text;
