-- Columns the student + fee screens write but the live database never got.
-- Probed against the live PostgREST endpoint, not backend/prisma/schema.prisma
-- (which does not match the live database).
-- Run once in the Supabase SQL editor. Safe to re-run.

-- Students -------------------------------------------------------------------
-- The online-admission review screen records a decision note and a list of
-- documents it asked the applicant to re-upload. The admission form collects
-- guardian / emergency / previous-school details. None of these existed, so the
-- writes failed with PGRST204 and the reviewer's decision was lost on reload.
alter table public.students
  add column if not exists "decisionNote" text,
  add column if not exists "requestedDocuments" text,
  add column if not exists "documents" jsonb,
  add column if not exists "guardianName" text,
  add column if not exists "guardianPhone" text,
  add column if not exists "emergencyName" text,
  add column if not exists "emergencyPhone" text,
  add column if not exists "previousSchool" text,
  add column if not exists "previousClass" text,
  add column if not exists "alternatePhone" text,
  add column if not exists "rollNo" text,
  add column if not exists "feeGroupId" text;

-- Fee invoices ---------------------------------------------------------------
-- Discounts and late fees are shown and edited in Fee Allocation / Due Fee
-- Collection but had nowhere to be stored.
alter table public.fee_invoices
  add column if not exists "discount" numeric(12, 2) not null default 0,
  add column if not exists "lateFee" numeric(12, 2) not null default 0,
  add column if not exists "notes" text;

-- Fee payments ---------------------------------------------------------------
-- Fee Allocation attaches a free-text note to a payment (e.g. "Allocation
-- adjustment"); there was no column for it.
alter table public.fee_payments
  add column if not exists "note" text;

-- NOTE: the application code degrades gracefully if this migration has not been
-- run: every write that touches these columns retries without them on PGRST204.
