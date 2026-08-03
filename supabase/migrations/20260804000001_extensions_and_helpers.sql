-- 0001: extensions, app schema, shared domains, generic helper functions.

create extension if not exists pgcrypto;
create extension if not exists citext;
create extension if not exists pg_trgm;

create schema if not exists app;
revoke all on schema app from public;
grant usage on schema app to authenticated, anon, service_role;

-- Money is always integer paise. Never a rupee float.
create domain public.money_paise as bigint check (value >= 0);

-- Generic updated_at / updated_by maintenance trigger.
create or replace function app.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  if to_jsonb(new) ? 'updated_by' then
    new.updated_by := coalesce(auth.uid(), new.updated_by);
  end if;
  return new;
end;
$$;

-- Enum types for status sets referenced across later migrations.
create type public.membership_status as enum ('active', 'suspended', 'revoked');
create type public.centre_status as enum ('active', 'suspended', 'closed');
create type public.centre_application_status as enum (
  'draft', 'submitted', 'under_review', 'changes_requested', 'approved', 'rejected'
);
create type public.enrolment_status as enum (
  'active', 'completed', 'withdrawn', 'transferred', 'on_hold'
);
create type public.attendance_status as enum ('present', 'absent', 'late', 'excused');
create type public.invoice_status as enum ('draft', 'issued', 'partially_paid', 'paid', 'void');
create type public.payment_method as enum ('cash', 'upi', 'bank_transfer', 'cheque', 'card', 'wallet');
create type public.exam_attempt_status as enum (
  'not_started', 'in_progress', 'submitted', 'auto_submitted', 'evaluated'
);
create type public.document_status as enum ('pending', 'issued', 'revoked');
