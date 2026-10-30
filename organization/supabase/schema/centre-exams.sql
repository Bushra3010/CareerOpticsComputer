-- =====================================================================
-- Centre exams: a centre sets its own online exam from its question bank
-- and gives it to its own students.
-- =====================================================================
-- online-exams.sql lets only the head office write online_exams, and lets a
-- centre give an exam to its students only once the head office has given
-- that exam to the centre. A centre's own exam needs neither: it is the
-- centre's paper, for the centre's students.
--
-- What this adds, and nothing else:
--   1. online_exams."branchId"  the centre that owns the exam (null for the
--                               head office's exams, which keep working
--                               exactly as before)
--      online_exams."examType"  ONLINE or PRACTICE, as the centre chose it
--   2. a centre reads, adds and edits the exams it owns, inside its own
--      organisation; it still cannot touch the head office's exams
--   3. a centre gives the exams it owns to its own students
--
-- Policies are permissive, so these are OR'd with the existing ones: an
-- admin keeps what it had, and a centre gains only its own rows. Students
-- still never read online_exams directly.
--
-- Needs online-exams.sql, exam-workflow.sql (is_branch_staff) and
-- branch-scoped-wallet-rls.sql / user-management.sql (jwt_branch_id,
-- jwt_org_id). Safe to re-run.
-- =====================================================================

alter table public.online_exams
  add column if not exists "branchId" text references public.branches("id") on delete cascade,
  add column if not exists "examType" text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'online_exams_exam_type_check') then
    alter table public.online_exams
      add constraint online_exams_exam_type_check check ("examType" is null or "examType" in ('ONLINE', 'PRACTICE'));
  end if;
end $$;

create index if not exists "online_exams_branch_idx" on public.online_exams ("branchId", "createdAt" desc);


-- ---------------------------------------------------------------------
-- 2. A centre's own exams. is_branch_staff() already excludes students,
--    so the answers in "questions" stay out of a student's reach.
-- ---------------------------------------------------------------------
drop policy if exists "Online exams readable by the owning centre" on public.online_exams;
create policy "Online exams readable by the owning centre" on public.online_exams
  for select to authenticated
  using ("branchId" is not null and public.is_branch_staff("branchId"));

drop policy if exists "Online exams added by the owning centre" on public.online_exams;
create policy "Online exams added by the owning centre" on public.online_exams
  for insert to authenticated
  with check (
    "branchId" is not null
    and "branchId" = public.jwt_branch_id()
    and public.is_branch_staff("branchId")
    and "organizationId" = public.jwt_org_id()
  );

-- No delete policy: exams are retired by stamping "deletedAt", an update.
drop policy if exists "Online exams edited by the owning centre" on public.online_exams;
create policy "Online exams edited by the owning centre" on public.online_exams
  for update to authenticated
  using ("branchId" is not null and public.is_branch_staff("branchId"))
  with check (
    "branchId" = public.jwt_branch_id()
    and public.is_branch_staff("branchId")
    and "organizationId" = public.jwt_org_id()
  );


-- ---------------------------------------------------------------------
-- 3. Giving a centre's own exam to its students.
--    A function, not a subquery: online_exams' select policy reads
--    online_exam_assignments, so a policy here reading online_exams back
--    would be refused by Postgres as recursive.
-- ---------------------------------------------------------------------
create or replace function public.centre_owns_online_exam(p_exam_id text, p_branch_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.online_exams
     where "id" = p_exam_id and "branchId" = p_branch_id and "deletedAt" is null
  );
$$;
revoke all on function public.centre_owns_online_exam(text, text) from public, anon;
grant execute on function public.centre_owns_online_exam(text, text) to authenticated;

drop policy if exists "Assignments of a centre's own exam" on public.online_exam_assignments;
create policy "Assignments of a centre's own exam" on public.online_exam_assignments
  for insert to authenticated
  with check (
    public.is_branch_staff("branchId")
    and public.centre_owns_online_exam("examId", "branchId")
  );
