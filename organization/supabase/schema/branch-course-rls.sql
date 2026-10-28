-- =====================================================================
-- branch_courses: the organisation decides, the branch reads
-- =====================================================================
-- branch_courses says which of the organisation's courses a branch may
-- actually run. "Assign Course to Batch" writes it, and every branch-side
-- course list reads it -- the admission form, View Courses, exams, live
-- classes.
--
-- supabase-rls-fix.sql gave the table `FOR ALL TO authenticated USING (true)`
-- along with every other table. That is the wrong shape for this one: a branch
-- could hand itself any course in the organisation, which is the decision the
-- table exists to take away from it.
--
-- So:
--   * organisation admin -> full access
--   * branch account     -> reads its own rows, writes none
--
-- The decision is read from `app_metadata`, NOT `user_metadata`, which a user
-- can rewrite for themselves with supabase.auth.updateUser().
--
-- Depends on branch-scoped-wallet-rls.sql for is_org_admin() and
-- jwt_branch_id(). Run that first if you have not.
--
-- Idempotent - safe to re-run.
-- =====================================================================

alter table public.branch_courses enable row level security;

drop policy if exists "Authenticated full access" on public.branch_courses;
drop policy if exists "Branch courses readable by owner branch or admin" on public.branch_courses;
drop policy if exists "Branch courses written by admin" on public.branch_courses;

create policy "Branch courses readable by owner branch or admin" on public.branch_courses
  for select to authenticated
  using (public.is_org_admin() or "branchId" = public.jwt_branch_id());

create policy "Branch courses written by admin" on public.branch_courses
  for all to authenticated
  using (public.is_org_admin())
  with check (public.is_org_admin());


-- ---------------------------------------------------------------------
-- The client sends neither, and both are NOT NULL. supabase-rls-fix.sql
-- already adds these; repeated here so this file stands on its own.
-- ---------------------------------------------------------------------
alter table public.branch_courses alter column "id" set default gen_random_uuid()::text;
alter table public.branch_courses alter column "updatedAt" set default now();


-- ---------------------------------------------------------------------
-- Check what is in place now.
-- ---------------------------------------------------------------------
select policyname, cmd, roles
from pg_policies
where schemaname = 'public' and tablename = 'branch_courses'
order by policyname;
