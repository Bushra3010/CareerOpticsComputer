-- Run in Supabase Dashboard -> SQL Editor. Project: etxhjiawkpinmardkjzv.
-- Safe to re-run.

-- ============================================
-- students.courseIds - enrol a student on more than one course
-- ============================================
-- `students.courseId` stays the primary course, because every existing screen,
-- invoice and certificate reads it. `courseIds` carries the full set, primary
-- included, so a student on three courses no longer loses two of them.
--
-- NOTE: the admission and edit forms retry without this column on PGRST204, so
-- they keep working before this is run - only the extra courses are dropped.
alter table public.students
  add column if not exists "courseIds" text[] not null default '{}';

-- Backfill the array from the single course already on file.
update public.students
   set "courseIds" = array["courseId"]::text[]
 where "courseId" is not null
   and coalesce(array_length("courseIds", 1), 0) = 0;

-- ============================================
-- dropdown_options - user-editable option lists
-- ============================================
-- The picker lists (gender, blood group, board, stream, ...) were hard-coded
-- arrays, so an institute that uses a category the code never heard of had no
-- way to add it. One row per list per organisation; a missing row means "use
-- the built-in defaults".
create table if not exists public.dropdown_options (
  id text primary key default gen_random_uuid()::text,
  -- Deliberately not a foreign key: `organizations.id` is text on this database
  -- and uuid on others, and a type mismatch would abort the whole script.
  "organizationId" text,
  "key" text not null,
  "values" text[] not null default '{}',
  "updatedAt" timestamp with time zone default timezone('utc'::text, now()) not null
);

create unique index if not exists dropdown_options_org_key
  on public.dropdown_options ("organizationId", "key");

alter table public.dropdown_options enable row level security;

drop policy if exists "Allow public read" on public.dropdown_options;
create policy "Allow public read" on public.dropdown_options
  for select using (true);

drop policy if exists "Allow public insert" on public.dropdown_options;
create policy "Allow public insert" on public.dropdown_options
  for insert with check (true);

drop policy if exists "Allow public update" on public.dropdown_options;
create policy "Allow public update" on public.dropdown_options
  for update using (true);

drop policy if exists "Allow public delete" on public.dropdown_options;
create policy "Allow public delete" on public.dropdown_options
  for delete using (true);

notify pgrst, 'reload schema';
