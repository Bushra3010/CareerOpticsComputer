-- =====================================================================
-- Student portal: a student sees their own record and nothing else
-- =====================================================================
-- supabase-rls-fix.sql gave every signed-in account `FOR ALL TO authenticated
-- USING (true)` on students, fee_invoices, fee_payments, attendance_records
-- and exam_results. That was survivable while only staff could sign in. The
-- moment a student has a login it is not: from devtools, one student could read
-- every student's phone number, address, fees and marks in the organisation.
--
-- This narrows those five tables to:
--   * organisation admin  -> everything in their organisation
--   * branch account      -> everything in their branch
--   * student             -> their own row only, and read-only
--
-- The decision is read from `app_metadata`, NOT `user_metadata`. A user can
-- rewrite their own user_metadata with supabase.auth.updateUser(), so a policy
-- keyed on it would let a student promote themselves. app_metadata is writable
-- only by the service role, which is why create-student-user sets it there.
--
-- RUN THIS BEFORE issuing the first student login.
-- Depends on branch-scoped-wallet-rls.sql for is_org_admin() and
-- jwt_branch_id(). Run that first if you have not.
--
-- Idempotent - safe to re-run.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. The claim create-student-user writes, read back as a policy input.
-- ---------------------------------------------------------------------
create or replace function public.jwt_student_id()
returns text
language sql
stable
as $$
  select auth.jwt() -> 'app_metadata' ->> 'studentId';
$$;

create or replace function public.is_student()
returns boolean
language sql
stable
as $$
  select upper(coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')) = 'STUDENT';
$$;


-- ---------------------------------------------------------------------
-- 2. students
--
--    A student reads one row: their own. Everything that writes a student
--    record -- admissions, edits, the soft delete -- stays with the branch
--    and the organisation, so a student cannot edit their own marks-bearing
--    record or resurrect a deleted one.
-- ---------------------------------------------------------------------
alter table public.students enable row level security;

drop policy if exists "Authenticated full access" on public.students;
drop policy if exists "Students readable by owner branch or admin" on public.students;
drop policy if exists "Students written by branch or admin" on public.students;

create policy "Students readable by owner branch or admin" on public.students
  for select to authenticated
  using (
    public.is_org_admin()
    or (public.is_student() and "id" = public.jwt_student_id())
    or (not public.is_student() and "branchId" = public.jwt_branch_id())
  );

create policy "Students written by branch or admin" on public.students
  for all to authenticated
  using (public.is_org_admin() or (not public.is_student() and "branchId" = public.jwt_branch_id()))
  with check (public.is_org_admin() or (not public.is_student() and "branchId" = public.jwt_branch_id()));


-- ---------------------------------------------------------------------
-- 3. The two tables that carry both studentId and branchId, so the same
--    policy shape fits each and is written once: a student is admitted only to
--    rows whose studentId is their own.
--
--    exam_results and fee_payments are scoped differently -- neither carries a
--    branchId -- and are handled separately below.
-- ---------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array['fee_invoices', 'attendance_records'] loop
    continue when to_regclass('public.' || quote_ident(t)) is null;

    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "Authenticated full access" on public.%I', t);
    execute format('drop policy if exists "Readable by student branch or admin" on public.%I', t);
    execute format('drop policy if exists "Written by branch or admin" on public.%I', t);

    execute format($f$
      create policy "Readable by student branch or admin" on public.%I
        for select to authenticated
        using (
          public.is_org_admin()
          or (public.is_student() and "studentId" = public.jwt_student_id())
          or (not public.is_student() and "branchId" = public.jwt_branch_id())
        )
    $f$, t);

    -- A student never writes a fee, an attendance mark or a result.
    execute format($f$
      create policy "Written by branch or admin" on public.%I
        for all to authenticated
        using (public.is_org_admin() or (not public.is_student() and "branchId" = public.jwt_branch_id()))
        with check (public.is_org_admin() or (not public.is_student() and "branchId" = public.jwt_branch_id()))
    $f$, t);
  end loop;
end $$;


-- ---------------------------------------------------------------------
-- 4. exam_results — carries studentId but no branchId, so staff scoping goes
--    through the exam the result belongs to.
-- ---------------------------------------------------------------------
alter table public.exam_results enable row level security;

drop policy if exists "Authenticated full access" on public.exam_results;
drop policy if exists "Results readable by student branch or admin" on public.exam_results;
drop policy if exists "Results written by branch or admin" on public.exam_results;

create policy "Results readable by student branch or admin" on public.exam_results
  for select to authenticated
  using (
    public.is_org_admin()
    or (public.is_student() and "studentId" = public.jwt_student_id())
    or (
      not public.is_student()
      and exists (
        select 1 from public.exams e
        where e."id" = public.exam_results."examId"
          and e."branchId" = public.jwt_branch_id()
      )
    )
  );

-- A student never writes their own result.
create policy "Results written by branch or admin" on public.exam_results
  for all to authenticated
  using (public.is_org_admin() or not public.is_student())
  with check (public.is_org_admin() or not public.is_student());


-- ---------------------------------------------------------------------
-- 5. fee_payments — reached through the invoice it settles.
-- ---------------------------------------------------------------------
alter table public.fee_payments enable row level security;

drop policy if exists "Authenticated full access" on public.fee_payments;
drop policy if exists "Payments readable by student branch or admin" on public.fee_payments;
drop policy if exists "Payments written by branch or admin" on public.fee_payments;

create policy "Payments readable by student branch or admin" on public.fee_payments
  for select to authenticated
  using (
    public.is_org_admin()
    or exists (
      select 1 from public.fee_invoices i
      where i."id" = public.fee_payments."invoiceId"
        and (
          (public.is_student() and i."studentId" = public.jwt_student_id())
          or (not public.is_student() and i."branchId" = public.jwt_branch_id())
        )
    )
  );

create policy "Payments written by branch or admin" on public.fee_payments
  for all to authenticated
  using (public.is_org_admin() or not public.is_student())
  with check (public.is_org_admin() or not public.is_student());


notify pgrst, 'reload schema';


-- ---------------------------------------------------------------------
-- 6. Check what is in place now.
-- ---------------------------------------------------------------------
select tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
  and tablename in ('students', 'fee_invoices', 'fee_payments', 'attendance_records', 'exam_results')
order by tablename, policyname;

-- NOTE: app_metadata reaches the JWT only when a token is issued, so anyone
-- signed in right now must sign out and back in before these policies pass them.
