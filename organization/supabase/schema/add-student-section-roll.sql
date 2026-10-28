-- Section and roll number on a student.
--
-- The admission form collects both on the Academic step, next to the batch.
-- `tenthRollNo` already exists but is the class 10 board roll number, which is
-- a different thing from the roll number the branch assigns on enrolment.
--
-- Run once in the Supabase SQL editor. Safe to re-run.
alter table public.students
  add column if not exists "section" text,
  add column if not exists "rollNo" text;
