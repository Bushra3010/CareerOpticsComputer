-- =====================================================================
-- The centre panel's New Student Registration asks for the applicant's
-- education (Matriculation / Intermediate / Graduate / Post Graduate /
-- Other), as the classic franchise form does. `students` had nowhere to keep
-- it. Until this is run the form still saves the student, without the
-- education. Safe to re-run.
-- =====================================================================

alter table public.students add column if not exists "education" text;

notify pgrst, 'reload schema';
