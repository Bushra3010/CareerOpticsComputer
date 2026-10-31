-- =====================================================================
-- Tighten the last "Authenticated full access" tables.
--
-- audit_events, batch_timings, batches, branch_notices,
-- branch_renewal_history, courses, exams, item_dispatches, item_received,
-- refresh_sessions and visit_enquiries each carried
--   "Authenticated full access" FOR ALL TO authenticated USING (true)
-- so any signed-in account -- a student portal login included -- could read
-- and rewrite every row of every centre of every organisation.
--
-- The replacement, table by table (who-reads-what was taken from src/):
--
--   courses        org catalogue. Read: non-student members of the
--                  organisation; a student only the courses they are
--                  enrolled on. Write: organisation admins only.
--   batches        centre-owned. Read/write: can_touch_branch("branchId").
--                  A student reads only their own batch.
--   batch_timings  hangs off batchId. Read/write: whoever can touch the
--                  batch's branch. A student reads only their batch's slots.
--   exams          centre-owned. Read/write: can_touch_branch("branchId").
--                  A student reads only the exams they hold a result for
--                  (the portal reaches exams only through exam_results).
--   branch_notices branchId NULL means "every centre". Gains an
--                  "organizationId" column (filled by trigger) so an
--                  all-centres notice belongs to one organisation instead of
--                  being visible to every tenant. Read: the centre's own
--                  logins (staff and students) and the org admin; all-centre
--                  notices by members of that organisation. Write: the centre
--                  for its own branch; all-centre notices by org admins only.
--   visit_enquiries, item_dispatches, item_received
--                  centre-owned, staff only: can_touch_branch("branchId").
--   branch_renewal_history
--                  hangs off a licence. Read: org admin + the centre's staff.
--                  Write: org admin (licences are the head office's alone).
--   audit_events   append-only. Insert: staff/admin for a branch they can
--                  touch; a student only their own "PortalRequest" row.
--                  Read: org admin for its organisation, staff for their
--                  branch, a student their own PortalRequest rows.
--                  No update / delete for anyone but the service role.
--   refresh_sessions
--                  unused by the browser app (legacy Prisma API table):
--                  service role only.
--
-- "Service role full access" policies are left as they are. Edge functions
-- and security-definer RPCs (public_centres, public_branch_courses,
-- my_online_exams, approve_recharge_atomic, ...) do not depend on these.
--
-- An organisation admin "acting as" a centre keeps its admin JWT
-- (branchId null), so admin access is always decided by organisation.
--
-- Needs: branch-scoped-wallet-rls.sql / exam-workflow.sql (jwt_role,
-- jwt_branch_id, is_org_admin, is_branch_staff), student-portal-rls.sql
-- (jwt_student_id), user-management.sql (jwt_org_id) and branches-rls.sql
-- (can_touch_branch, is_branch_org_admin).
--
-- Safe to re-run. Does not touch data except backfilling
-- branch_notices."organizationId".
-- =====================================================================


-- ---------------------------------------------------------------------
-- 0. Helpers
-- ---------------------------------------------------------------------

-- exams <-> exam_results reference each other in their policies (the
-- exam_results read policy looks up the exam's branch), so a student's
-- "exam I have a result for" check has to bypass RLS or the planner reports
-- infinite recursion. Returns true only for the caller's own studentId.
create or replace function public.student_has_result_for(p_exam_id text)
returns boolean language sql stable security definer set search_path = public as $$
  select public.jwt_role() = 'STUDENT'
     and public.jwt_student_id() is not null
     and exists (
       select 1 from public.exam_results r
        where r."examId" = p_exam_id
          and r."studentId" = public.jwt_student_id());
$$;
revoke all on function public.student_has_result_for(text) from public, anon;
grant execute on function public.student_has_result_for(text) to authenticated;


-- ---------------------------------------------------------------------
-- 1. courses -- the organisation's catalogue (no branchId)
--
--    Readers: admin catalogue (AcademicsWorkspace, ViewCourses,
--    CourseSubjects), every centre screen that lists or embeds a course
--    (getCourses filters by branch_courses client-side), and the student
--    portal (getStudentProfile embed, getStudentPortalCourses,
--    getStudentResults). Writers: createCourse/updateCourse/deleteCourse,
--    setCourseTerms -- all gated to the admin view in the UI.
-- ---------------------------------------------------------------------
alter table public.courses enable row level security;
drop policy if exists "Authenticated full access" on public.courses;
drop policy if exists "Courses read by organisation" on public.courses;
drop policy if exists "Courses read by enrolled student" on public.courses;
drop policy if exists "Courses admin write" on public.courses;

create policy "Courses read by organisation" on public.courses
  for select to authenticated
  using (
    public.jwt_role() not in ('', 'STUDENT')
    and "organizationId" = public.jwt_org_id()
  );

-- students.courseIds arrives with add-multi-course-and-dropdowns.sql; until
-- then the primary courseId is the whole enrolment. Re-run this file after
-- that migration to pick up the extra courses.
do $$
begin
  if exists (select 1 from information_schema.columns
              where table_schema = 'public' and table_name = 'students' and column_name = 'courseIds') then
    execute $p$
      create policy "Courses read by enrolled student" on public.courses
        for select to authenticated
        using (
          public.jwt_role() = 'STUDENT'
          and exists (
            select 1 from public.students s
             where s.id = public.jwt_student_id()
               and s."deletedAt" is null
               and (s."courseId" = public.courses.id
                    or public.courses.id = any (coalesce(s."courseIds", '{}'::text[])))
          )
        )
    $p$;
  else
    execute $p$
      create policy "Courses read by enrolled student" on public.courses
        for select to authenticated
        using (
          public.jwt_role() = 'STUDENT'
          and exists (
            select 1 from public.students s
             where s.id = public.jwt_student_id()
               and s."deletedAt" is null
               and s."courseId" = public.courses.id
          )
        )
    $p$;
  end if;
end $$;

create policy "Courses admin write" on public.courses
  for all to authenticated
  using (public.is_org_admin() and "organizationId" = public.jwt_org_id())
  with check (public.is_org_admin() and "organizationId" = public.jwt_org_id());


-- ---------------------------------------------------------------------
-- 2. batches -- centre-owned
--
--    Staff/admin: getBatches, getBatchesByOrg, create/update/deleteBatch,
--    renameInstructor, listBatches, CentreBatchStudents, getStudentDocument.
--    Student: getStudentProfile (batch:batches(name) embed) and
--    getStudentPortalCourses (their own batchId only).
-- ---------------------------------------------------------------------
alter table public.batches enable row level security;
drop policy if exists "Authenticated full access" on public.batches;
drop policy if exists "Batches by branch" on public.batches;
drop policy if exists "Batches read by own student" on public.batches;

create policy "Batches by branch" on public.batches
  for all to authenticated
  using (public.can_touch_branch("branchId"))
  with check (public.can_touch_branch("branchId"));

create policy "Batches read by own student" on public.batches
  for select to authenticated
  using (
    public.jwt_role() = 'STUDENT'
    and exists (
      select 1 from public.students s
       where s.id = public.jwt_student_id()
         and s."deletedAt" is null
         and s."batchId" = public.batches.id
    )
  );


-- ---------------------------------------------------------------------
-- 3. batch_timings -- no branchId; belongs to a batch
--
--    Staff/admin: getBatchTimings, live classes (create/update/delete),
--    getInstructorUsage, renameInstructor, listBatchTimingsForBranch.
--    Student: getStudentPortalClasses, getStudentPortalCourses (own batch).
-- ---------------------------------------------------------------------
alter table public.batch_timings enable row level security;
drop policy if exists "Authenticated full access" on public.batch_timings;
drop policy if exists "Batch timings by branch" on public.batch_timings;
drop policy if exists "Batch timings read by own student" on public.batch_timings;

create policy "Batch timings by branch" on public.batch_timings
  for all to authenticated
  using (exists (
    select 1 from public.batches b
     where b.id = public.batch_timings."batchId"
       and public.can_touch_branch(b."branchId")))
  with check (exists (
    select 1 from public.batches b
     where b.id = public.batch_timings."batchId"
       and public.can_touch_branch(b."branchId")));

create policy "Batch timings read by own student" on public.batch_timings
  for select to authenticated
  using (
    public.jwt_role() = 'STUDENT'
    and exists (
      select 1 from public.students s
       where s.id = public.jwt_student_id()
         and s."deletedAt" is null
         and s."batchId" = public.batch_timings."batchId"
    )
  );


-- ---------------------------------------------------------------------
-- 4. exams -- centre-owned
--
--    Staff/admin: getExams, create/updateExam, publish, listExams,
--    create/update/deleteExamRow, centre dashboard count,
--    getStudentDocument. Student: getStudentResults only -- exams whose ids
--    come from the student's own exam_results.
-- ---------------------------------------------------------------------
alter table public.exams enable row level security;
drop policy if exists "Authenticated full access" on public.exams;
drop policy if exists "Exams by branch" on public.exams;
drop policy if exists "Exams read by student with a result" on public.exams;

create policy "Exams by branch" on public.exams
  for all to authenticated
  using (public.can_touch_branch("branchId"))
  with check (public.can_touch_branch("branchId"));

create policy "Exams read by student with a result" on public.exams
  for select to authenticated
  using (
    public.jwt_role() = 'STUDENT'
    and "branchId" = public.jwt_branch_id()
    and public.student_has_result_for(id)
  );


-- ---------------------------------------------------------------------
-- 5. visit_enquiries, item_dispatches, item_received -- centre staff only
--
--    visit_enquiries: reception / enquiry screens, CentreEnquiry, dashboard
--    counts. item_dispatches / item_received: no reader in the app today
--    (the register uses item_movements).
-- ---------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['visit_enquiries', 'item_dispatches', 'item_received'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "Authenticated full access" on public.%I', t);
    execute format('drop policy if exists "Centre rows by branch" on public.%I', t);
    execute format($p$create policy "Centre rows by branch" on public.%I for all to authenticated
      using (public.can_touch_branch("branchId")) with check (public.can_touch_branch("branchId"))$p$, t);
  end loop;
end $$;


-- ---------------------------------------------------------------------
-- 6. branch_notices -- branchId NULL = every centre of the organisation
--
--    getNotices (AppHeader for every login, StudentDashboard, the notice
--    board), create/update/deleteNotice (notice board: admin and centre).
--
--    The table had no organisation of its own, so an all-centres notice
--    could only be "visible to everyone in every organisation". It gets an
--    "organizationId", kept by a trigger: from the branch for a centre's
--    notice, from the writer's claim for an all-centres one. The app does
--    not send it.
-- ---------------------------------------------------------------------
alter table public.branch_notices add column if not exists "organizationId" text;
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'branch_notices_organizationId_fkey') then
    alter table public.branch_notices
      add constraint "branch_notices_organizationId_fkey"
      foreign key ("organizationId") references public.organizations(id) on delete cascade;
  end if;
end $$;
create index if not exists "branch_notices_organizationId_idx" on public.branch_notices ("organizationId");

-- The trigger below would rewrite the backfill on a re-run; drop it first.
drop trigger if exists branch_notices_set_org on public.branch_notices;

-- Backfill: a centre's notice from its branch; an all-centres notice only
-- when there is exactly one organisation to give it to. Otherwise it stays
-- NULL and is readable by the service role alone -- reassign it by hand.
update public.branch_notices n
   set "organizationId" = b."organizationId"
  from public.branches b
 where b.id = n."branchId" and n."organizationId" is distinct from b."organizationId";
update public.branch_notices
   set "organizationId" = (select id from public.organizations limit 1)
 where "branchId" is null and "organizationId" is null
   and (select count(*) from public.organizations) = 1;

create or replace function public.set_notice_organization()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new."branchId" is not null then
    select b."organizationId" into new."organizationId"
      from public.branches b where b.id = new."branchId";
  elsif tg_op = 'UPDATE' and old."branchId" is null then
    new."organizationId" := old."organizationId";
  else
    new."organizationId" := coalesce(public.jwt_org_id(), new."organizationId");
  end if;
  return new;
end $$;
revoke all on function public.set_notice_organization() from public, anon;
create trigger branch_notices_set_org before insert or update on public.branch_notices
  for each row execute function public.set_notice_organization();

alter table public.branch_notices enable row level security;
drop policy if exists "Authenticated full access" on public.branch_notices;
drop policy if exists "Notices read" on public.branch_notices;
drop policy if exists "Notices written by branch" on public.branch_notices;
drop policy if exists "Org-wide notices written by admin" on public.branch_notices;

create policy "Notices read" on public.branch_notices
  for select to authenticated
  using (
    ("branchId" is not null and (
        "branchId" = public.jwt_branch_id()           -- the centre's staff and its students
        or public.is_branch_org_admin("branchId")))
    or ("branchId" is null
        and public.jwt_role() <> ''
        and "organizationId" = public.jwt_org_id())
  );

create policy "Notices written by branch" on public.branch_notices
  for all to authenticated
  using ("branchId" is not null and public.can_touch_branch("branchId"))
  with check ("branchId" is not null and public.can_touch_branch("branchId"));

create policy "Org-wide notices written by admin" on public.branch_notices
  for all to authenticated
  using ("branchId" is null and public.is_org_admin() and "organizationId" = public.jwt_org_id())
  with check ("branchId" is null and public.is_org_admin() and "organizationId" = public.jwt_org_id());


-- ---------------------------------------------------------------------
-- 7. branch_renewal_history -- keyed by licenseId -> branch_licenses
--
--    No reader or writer in the app today. Mirrors branch_licenses: the
--    head office writes, the centre's staff may read its own.
-- ---------------------------------------------------------------------
alter table public.branch_renewal_history enable row level security;
drop policy if exists "Authenticated full access" on public.branch_renewal_history;
drop policy if exists "Renewals read" on public.branch_renewal_history;
drop policy if exists "Renewals admin write" on public.branch_renewal_history;

create policy "Renewals read" on public.branch_renewal_history
  for select to authenticated
  using (exists (
    select 1 from public.branch_licenses l
     where l.id = public.branch_renewal_history."licenseId"
       and (public.is_branch_org_admin(l."branchId") or public.is_branch_staff(l."branchId"))));

create policy "Renewals admin write" on public.branch_renewal_history
  for all to authenticated
  using (exists (
    select 1 from public.branch_licenses l
     where l.id = public.branch_renewal_history."licenseId"
       and public.is_branch_org_admin(l."branchId")))
  with check (exists (
    select 1 from public.branch_licenses l
     where l.id = public.branch_renewal_history."licenseId"
       and public.is_branch_org_admin(l."branchId")));


-- ---------------------------------------------------------------------
-- 8. audit_events -- append-only
--
--    Writers: wallet recharge submit (centre), approve / reject (admin),
--    submitPortalRequest (student, or an admin/centre "viewing as" one).
--    Readers: getTransactionAuditTrail (TransactionAuditDrawer, admin and
--    centre), getPortalRequests (portal: actorId = the login's auth id).
--    approve_recharge_atomic is security definer and unaffected.
-- ---------------------------------------------------------------------
alter table public.audit_events enable row level security;
drop policy if exists "Authenticated full access" on public.audit_events;
drop policy if exists "Audit read" on public.audit_events;
drop policy if exists "Audit insert by branch or admin" on public.audit_events;
drop policy if exists "Audit insert portal request" on public.audit_events;

create policy "Audit read" on public.audit_events
  for select to authenticated
  using (
    ("branchId" is not null and public.can_touch_branch("branchId"))
    or (public.is_org_admin() and "organizationId" = public.jwt_org_id())
    or (public.jwt_role() = 'STUDENT'
        and "entityType" = 'PortalRequest'
        and "actorId" = auth.uid()::text)
  );

-- Staff and admins log against a branch they can touch; an organisationId,
-- when given, must be that branch's. An admin may also log an org-level
-- event with no branch.
create policy "Audit insert by branch or admin" on public.audit_events
  for insert to authenticated
  with check (
    ("branchId" is not null
      and public.can_touch_branch("branchId")
      and ("organizationId" is null
           or exists (select 1 from public.branches b
                       where b.id = public.audit_events."branchId"
                         and b."organizationId" = public.audit_events."organizationId")))
    or ("branchId" is null
        and public.is_org_admin()
        and "organizationId" = public.jwt_org_id())
  );

-- A student raises a request from the portal: their own auth id as the
-- actor, their own centre, nothing else.
create policy "Audit insert portal request" on public.audit_events
  for insert to authenticated
  with check (
    public.jwt_role() = 'STUDENT'
    and "entityType" = 'PortalRequest'
    and "actorId" = auth.uid()::text
    and "branchId" = public.jwt_branch_id()
    and ("organizationId" is null or "organizationId" = public.jwt_org_id())
  );
-- No update or delete policy: the trail is immutable outside the service role.


-- ---------------------------------------------------------------------
-- 9. refresh_sessions -- legacy API-server table, no browser access
-- ---------------------------------------------------------------------
alter table public.refresh_sessions enable row level security;
drop policy if exists "Authenticated full access" on public.refresh_sessions;


notify pgrst, 'reload schema';


-- ---------------------------------------------------------------------
-- 10. What is in place now. No row for these tables should still say
--     "Authenticated full access" or qual = 'true' for authenticated.
-- ---------------------------------------------------------------------
select tablename, policyname, cmd, roles, qual, with_check
  from pg_policies
 where schemaname = 'public'
   and tablename in ('audit_events','batch_timings','batches','branch_notices',
                     'branch_renewal_history','courses','exams','item_dispatches',
                     'item_received','refresh_sessions','visit_enquiries')
 order by tablename, policyname;
