-- Run these in Supabase Dashboard → SQL Editor
-- Project: etxhjiawkpinmardkjzv

-- ============================================
-- Table: item_movements
-- ============================================
create table if not exists public.item_movements (
  id text primary key default gen_random_uuid()::text,
  direction text not null,
  item text not null,
  item_id text,
  category text,
  quantity integer default 0,
  party text,
  department text,
  status text,
  courier text,
  tracking text,
  notes text,
  dispatch_date date,
  receive_date date,
  branch_id text references public.branches(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- The table went live without a default on `id`, so every insert that did not
-- send one failed with "null value in column id ... violates not-null
-- constraint". `create table if not exists` above is a no-op on the live table,
-- so the default is set explicitly here. Safe to re-run.
alter table public.item_movements
  alter column id set default gen_random_uuid()::text;

alter table public.item_movements enable row level security;

create policy "Allow public read" on public.item_movements
  for select using (true);

create policy "Allow public insert" on public.item_movements
  for insert with check (true);

create policy "Allow public update" on public.item_movements
  for update using (true);

create policy "Allow public delete" on public.item_movements
  for delete using (true);

-- ============================================
-- Table: visit_enquiries (add new columns)
-- ============================================
alter table if exists public.visit_enquiries
  add column if not exists whatsapp_number text,
  add column if not exists source text,
  add column if not exists registration_date date,
  add column if not exists call_type text,
  add column if not exists check_in timestamp with time zone,
  add column if not exists check_out timestamp with time zone;
