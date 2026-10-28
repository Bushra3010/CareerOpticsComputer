-- Somewhere to keep what is made in the Code Lab and on the Whiteboard.
--
-- Both tools run in the browser — LiveCodes compiles in an iframe, draw.io
-- draws in one — and neither keeps anything once the tab is closed. A student
-- who writes a program in class, or a teacher who draws a flowchart for one,
-- wants it back next time, on whichever machine they sit at.
--
-- One table for both: a file is a title, a kind, and a body. `content` is text
-- because both bodies already are — a code project serialises to JSON, and a
-- draw.io diagram is XML.
--
-- Run once in the Supabase SQL editor. Safe to re-run. Until it is, both tools
-- keep their files in the browser they were made in, and say so.
create table if not exists public.practice_files (
  id               text primary key default gen_random_uuid()::text,
  "ownerId"        text not null,
  "organizationId" text references public.organizations(id) on delete cascade,
  "branchId"       text references public.branches(id) on delete set null,
  kind             text not null,
  title            text not null default 'Untitled',
  -- The language of a code file ("web", "python", "c"...); null on a board.
  language         text,
  content          text not null default '',
  "createdAt"      timestamptz not null default now(),
  "updatedAt"      timestamptz not null default now(),
  "deletedAt"      timestamptz,
  constraint practice_files_kind_check check (kind in ('code', 'board'))
);

create index if not exists "practice_files_owner_idx"
  on public.practice_files ("ownerId", kind);


-- ---------------------------------------------------------------------
-- A file is its owner's.
--
-- Keyed on auth.uid() itself rather than on the role claims, because this is
-- private work: a student's practice code is not the branch's to read, and a
-- teacher's rough board is not the student's. Sharing, when it comes, is a
-- column and a policy of its own — not a widening of this one.
-- ---------------------------------------------------------------------
alter table public.practice_files enable row level security;

drop policy if exists "Owner reads own practice files"  on public.practice_files;
drop policy if exists "Owner writes own practice files" on public.practice_files;

create policy "Owner reads own practice files" on public.practice_files
  for select to authenticated
  using ("ownerId" = auth.uid()::text);

create policy "Owner writes own practice files" on public.practice_files
  for all to authenticated
  using ("ownerId" = auth.uid()::text)
  with check ("ownerId" = auth.uid()::text);


select policyname, cmd from pg_policies
 where schemaname = 'public' and tablename = 'practice_files';
