-- The subjects a batch is taught.
--
-- "Assign Course to Batch" chose subjects and teachers for a batch, but only
-- the teachers had a column (batches.instructor); the subjects were kept on
-- the screen alone and were gone on reload, so a student's portal could never
-- show what they study. They live on the batch now, beside its teacher.
--
-- Run once in the Supabase SQL editor. Safe to re-run.
alter table public.batches
  add column if not exists "subjects" text[] not null default '{}';
