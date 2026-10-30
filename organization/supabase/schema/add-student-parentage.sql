-- How a student is named on their own paperwork, and whether they are married.
--
-- Certificates and marksheets read "Krishna Singh, S/o Ram Singh", and a
-- married woman is named "W/o" rather than "D/o" — which the admission form
-- had no way to record, so every document had to assume one of them.
--
-- `guardianRelation` already exists and means something else: it is the local
-- guardian's relation to the student (Uncle, Aunt, …), not the student's own
-- parentage line.
--
-- Run once in the Supabase SQL editor. Safe to re-run.
alter table public.students
  add column if not exists "parentage" text,
  add column if not exists "maritalStatus" text;
