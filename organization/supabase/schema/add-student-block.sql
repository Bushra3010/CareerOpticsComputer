-- The block a student lives in.
--
-- The admission form now asks for the address state, district and block, each
-- a dropdown narrowed by the one before it, as the branch and enquiry forms
-- already do. Students had no column for the block.
--
-- Nullable: older admissions, and places outside the bundled block lists, have
-- none.
--
-- Run once in the Supabase SQL editor. Safe to re-run. The application degrades
-- gracefully until it is: the insert retries without this and saves the rest
-- of the admission rather than failing whole.
alter table public.students
  add column if not exists "block" text;

notify pgrst, 'reload schema';
