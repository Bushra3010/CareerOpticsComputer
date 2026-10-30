-- The Create Online Exam screen collects a description, an end time, a duration,
-- a question count, negative marking and the proctoring toggles. None of those
-- columns exist on `exams`, so every one of those inputs was silently discarded
-- on save. `createExam`/`updateExam` retry without them until this has been run.
--
-- Run this in the Supabase SQL editor. It is safe to re-run.

alter table public.exams
  add column if not exists "description" text,
  add column if not exists "endDate" timestamptz,
  add column if not exists "duration" integer,
  add column if not exists "totalQuestions" integer,
  add column if not exists "negativeMarking" numeric,
  add column if not exists "shuffleQuestions" boolean not null default true,
  add column if not exists "shuffleOptions" boolean not null default true,
  add column if not exists "preventTabSwitch" boolean not null default false,
  add column if not exists "fullScreen" boolean not null default false,
  add column if not exists "webcam" boolean not null default false,
  add column if not exists "showResult" boolean not null default true,
  add column if not exists "showAnswers" boolean not null default false,
  add column if not exists "allowReview" boolean not null default true,
  add column if not exists "autoSubmit" boolean not null default true;
