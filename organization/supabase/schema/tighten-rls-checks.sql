-- =====================================================================
-- Persona checks for tighten-rls.sql.
--
-- Run AFTER tighten-rls.sql, in the Supabase SQL editor (as postgres), as
-- one script. Everything happens inside a single transaction that ends in
-- ROLLBACK: the fixture rows, the helper functions and every write made by
-- the personas disappear afterwards. Nothing is left behind.
--
-- The first wrong answer stops the script with
--   ERROR:  RLS check failed: <table> / <persona> / <what>: got X, want Y
-- and the transaction is aborted (so still nothing is kept). A clean run
-- ends with the notice "tighten-rls checks: all passed".
--
-- Personas (app_metadata as the edge functions write it):
--   admin1  ORGANIZATION_ADMIN of org O1 (no branchId -- also how an admin
--           "acting as" a centre looks to the database)
--   staffA  BRANCH_ADMIN of centre A (org O1)
--   studA   STUDENT of centre A (studentId zz_rls_sA)
--   staffB  FRANCHISE login of centre B (org O1)
--   admin2  ORGANIZATION_ADMIN of another org O2 (owns centre C)
--   norole  a login with empty app_metadata
--
-- Write results: n = rows affected, -1 = refused by a policy (42501),
-- 0 = the row was invisible to the writer (UPDATE/DELETE filtered out).
-- =====================================================================

begin;

-- ---------------------------------------------------------------------
-- Helpers (rolled back with everything else). Invoker rights, so the
-- statements they run are subject to RLS for the current role.
-- ---------------------------------------------------------------------
create or replace function public._rls_as(persona text)
returns void language plpgsql as $$
declare meta jsonb; sub text;
begin
  case persona
    when 'admin1' then sub := '00000000-0000-4000-8000-0000000000a1';
      meta := '{"role":"ORGANIZATION_ADMIN","organizationId":"zz_rls_o1"}';
    when 'staffA' then sub := '00000000-0000-4000-8000-0000000000a2';
      meta := '{"role":"BRANCH_ADMIN","organizationId":"zz_rls_o1","branchId":"zz_rls_bA"}';
    when 'studA'  then sub := '00000000-0000-4000-8000-0000000000a3';
      meta := '{"role":"STUDENT","organizationId":"zz_rls_o1","branchId":"zz_rls_bA","studentId":"zz_rls_sA"}';
    when 'staffB' then sub := '00000000-0000-4000-8000-0000000000a4';
      meta := '{"role":"FRANCHISE","organizationId":"zz_rls_o1","branchId":"zz_rls_bB"}';
    when 'admin2' then sub := '00000000-0000-4000-8000-0000000000a5';
      meta := '{"role":"ORGANIZATION_ADMIN","organizationId":"zz_rls_o2"}';
    when 'norole' then sub := '00000000-0000-4000-8000-0000000000a6';
      meta := '{}';
    else raise exception 'unknown persona %', persona;
  end case;
  perform set_config('request.jwt.claims',
    jsonb_build_object('sub', sub, 'role', 'authenticated', 'app_metadata', meta)::text, true);
  perform set_config('request.jwt.claim.sub', sub, true);
end $$;

create or replace function public._rls_count(q text)
returns bigint language plpgsql as $$
declare n bigint;
begin
  execute 'select count(*) from (' || q || ') _q' into n;
  return n;
end $$;

create or replace function public._rls_write(stmt text)
returns int language plpgsql as $$
declare n int;
begin
  execute stmt;
  get diagnostics n = row_count;
  return n;
exception when insufficient_privilege then
  return -1;
end $$;

create or replace function public._rls_expect(label text, got bigint, want bigint)
returns void language plpgsql as $$
begin
  if got is distinct from want then
    raise exception 'RLS check failed: %: got %, want %', label, got, want;
  end if;
end $$;

-- Reads: one persona, one table, one expected count of fixture rows.
create or replace function public._rls_read(tbl text, persona text, want bigint)
returns void language plpgsql as $$
begin
  perform public._rls_as(persona);
  perform public._rls_expect(tbl || ' / ' || persona || ' / read',
    public._rls_count(format('select 1 from public.%I where id like ''zz_rls_%%''', tbl)), want);
end $$;

-- Writes: one persona, one statement, one expected outcome.
create or replace function public._rls_w(label text, persona text, stmt text, want int)
returns void language plpgsql as $$
begin
  perform public._rls_as(persona);
  perform public._rls_expect(label || ' / ' || persona, public._rls_write(stmt), want);
end $$;

grant execute on function public._rls_as(text), public._rls_count(text), public._rls_write(text),
  public._rls_expect(text, bigint, bigint), public._rls_read(text, text, bigint),
  public._rls_w(text, text, text, int) to authenticated;


-- ---------------------------------------------------------------------
-- Fixtures, as postgres. Triggers and FK checks are switched off while
-- they go in (organisation seeding triggers, numbering triggers, the
-- users FKs ...); RLS is unaffected. If your role may not set this,
-- delete the line and fill any extra NOT NULL columns your schema has.
-- ---------------------------------------------------------------------
set local session_replication_role = replica;

insert into public.users (id, "userType", name, email, username, password, "updatedAt") values
  ('00000000-0000-4000-8000-0000000000a3', 'STUDENT', 'RLS student', 'zz_rls_a3@test.invalid', 'zz_rls_a3', 'x', now());

insert into public.organizations (id, "userId", name, code, email, phone, "streetAddress", city, state, district, pincode, "updatedAt") values
  ('zz_rls_o1', 'zz_rls_u_o1', 'RLS Org 1', 'ZZRLSO1', 'zz_rls_o1@test.invalid', '0', 's', 'c', 'st', 'd', '000000', now()),
  ('zz_rls_o2', 'zz_rls_u_o2', 'RLS Org 2', 'ZZRLSO2', 'zz_rls_o2@test.invalid', '0', 's', 'c', 'st', 'd', '000000', now());

insert into public.branches (id, "organizationId", "userId", name, code, "academicYear", phone, email, "updatedAt") values
  ('zz_rls_bA', 'zz_rls_o1', 'zz_rls_u_bA', 'RLS Centre A', 'ZZRLSBA', '2026', '0', 'zz_rls_ba@test.invalid', now()),
  ('zz_rls_bB', 'zz_rls_o1', 'zz_rls_u_bB', 'RLS Centre B', 'ZZRLSBB', '2026', '0', 'zz_rls_bb@test.invalid', now()),
  ('zz_rls_bC', 'zz_rls_o2', 'zz_rls_u_bC', 'RLS Centre C', 'ZZRLSBC', '2026', '0', 'zz_rls_bc@test.invalid', now());

insert into public.courses (id, "organizationId", name, code, "durationValue", "updatedAt") values
  ('zz_rls_cA1', 'zz_rls_o1', 'RLS course enrolled',     'ZZRLSCA1', 6, now()),
  ('zz_rls_cA2', 'zz_rls_o1', 'RLS course not enrolled', 'ZZRLSCA2', 6, now()),
  ('zz_rls_cO2', 'zz_rls_o2', 'RLS course other org',    'ZZRLSCO2', 6, now());

insert into public.batches (id, "branchId", "courseId", name, code, "startDate", "updatedAt") values
  ('zz_rls_batA1', 'zz_rls_bA', 'zz_rls_cA1', 'A1 (student''s)', 'ZZA1', now(), now()),
  ('zz_rls_batA2', 'zz_rls_bA', 'zz_rls_cA2', 'A2',              'ZZA2', now(), now()),
  ('zz_rls_batB1', 'zz_rls_bB', 'zz_rls_cA1', 'B1',              'ZZB1', now(), now()),
  ('zz_rls_batC1', 'zz_rls_bC', 'zz_rls_cO2', 'C1',              'ZZC1', now(), now());

insert into public.batch_timings (id, "batchId", day, "startTime", "endTime") values
  ('zz_rls_tA1', 'zz_rls_batA1', 'MONDAY', '09:00', '10:00'),
  ('zz_rls_tA2', 'zz_rls_batA2', 'MONDAY', '10:00', '11:00'),
  ('zz_rls_tB1', 'zz_rls_batB1', 'MONDAY', '09:00', '10:00'),
  ('zz_rls_tC1', 'zz_rls_batC1', 'MONDAY', '09:00', '10:00');

insert into public.students (id, "branchId", "userId", "firstName", "lastName", "dateOfBirth", gender, phone,
                             "streetAddress", city, state, pincode, "fatherName", "motherName",
                             "courseId", "batchId", "updatedAt") values
  ('zz_rls_sA', 'zz_rls_bA', '00000000-0000-4000-8000-0000000000a3', 'RLS', 'Student', '2005-01-01', 'MALE', '0',
   's', 'c', 'st', '000000', 'f', 'm', 'zz_rls_cA1', 'zz_rls_batA1', now());

insert into public.exams (id, "branchId", "courseId", "batchId", name, subject, "examDate", "updatedAt") values
  ('zz_rls_eA1', 'zz_rls_bA', 'zz_rls_cA1', 'zz_rls_batA1', 'Has result', 'S', current_date, now()),
  ('zz_rls_eA2', 'zz_rls_bA', 'zz_rls_cA1', 'zz_rls_batA1', 'No result',  'S', current_date, now()),
  ('zz_rls_eB1', 'zz_rls_bB', 'zz_rls_cA1', null,           'Centre B',   'S', current_date, now()),
  ('zz_rls_eC1', 'zz_rls_bC', 'zz_rls_cO2', null,           'Other org',  'S', current_date, now());

insert into public.exam_results (id, "examId", "studentId", marks, "updatedAt") values
  ('zz_rls_r1', 'zz_rls_eA1', 'zz_rls_sA', 80, now());

insert into public.visit_enquiries (id, "branchId", "visitorName", phone, "visitDate", "visitTime", "personToMeet", "updatedAt") values
  ('zz_rls_vA', 'zz_rls_bA', 'V', '0', now(), '10:00', 'P', now()),
  ('zz_rls_vB', 'zz_rls_bB', 'V', '0', now(), '10:00', 'P', now()),
  ('zz_rls_vC', 'zz_rls_bC', 'V', '0', now(), '10:00', 'P', now());

insert into public.item_dispatches (id, "branchId", "itemName", quantity, "recipientName", "recipientPhone", "recipientAddress", "dispatchDate", "updatedAt") values
  ('zz_rls_dA', 'zz_rls_bA', 'I', 1, 'R', '0', 'A', now(), now()),
  ('zz_rls_dB', 'zz_rls_bB', 'I', 1, 'R', '0', 'A', now(), now()),
  ('zz_rls_dC', 'zz_rls_bC', 'I', 1, 'R', '0', 'A', now(), now());

insert into public.item_received (id, "branchId", "itemName", quantity, "senderName", "receivedDate", "receivedBy", "updatedAt") values
  ('zz_rls_iA', 'zz_rls_bA', 'I', 1, 'S', now(), 'R', now()),
  ('zz_rls_iB', 'zz_rls_bB', 'I', 1, 'S', now(), 'R', now()),
  ('zz_rls_iC', 'zz_rls_bC', 'I', 1, 'S', now(), 'R', now());

-- The trigger is off here, so organizationId is given explicitly.
insert into public.branch_notices (id, "branchId", "organizationId", title, content, "updatedAt") values
  ('zz_rls_nA',  'zz_rls_bA', 'zz_rls_o1', 'Centre A',      'c', now()),
  ('zz_rls_nB',  'zz_rls_bB', 'zz_rls_o1', 'Centre B',      'c', now()),
  ('zz_rls_nC',  'zz_rls_bC', 'zz_rls_o2', 'Centre C',      'c', now()),
  ('zz_rls_nO1', null,        'zz_rls_o1', 'All of org 1',  'c', now()),
  ('zz_rls_nO2', null,        'zz_rls_o2', 'All of org 2',  'c', now());

insert into public.branch_licenses (id, "branchId", "registrationDate", "expiryDate", "updatedAt") values
  ('zz_rls_lA', 'zz_rls_bA', now(), now() + interval '1 year', now()),
  ('zz_rls_lC', 'zz_rls_bC', now(), now() + interval '1 year', now());

insert into public.branch_renewal_history (id, "licenseId", "renewalDate", "previousExpiry", "newExpiry") values
  ('zz_rls_rhA', 'zz_rls_lA', now(), now(), now() + interval '1 year'),
  ('zz_rls_rhC', 'zz_rls_lC', now(), now(), now() + interval '1 year');

insert into public.audit_events (id, "actorId", "organizationId", "branchId", action, "entityType", "entityId") values
  ('zz_rls_auA',  null, 'zz_rls_o1', 'zz_rls_bA', 'RECHARGE_SUBMITTED', 'BranchTransaction', 'tx1'),
  ('zz_rls_auB',  null, null,        'zz_rls_bB', 'RECHARGE_APPROVED',  'BranchTransaction', 'tx2'),
  ('zz_rls_auC',  null, 'zz_rls_o2', 'zz_rls_bC', 'RECHARGE_SUBMITTED', 'BranchTransaction', 'tx3'),
  ('zz_rls_auO1', null, 'zz_rls_o1', null,        'ORG_EVENT',          'Organization',      'o1'),
  ('zz_rls_auPR', '00000000-0000-4000-8000-0000000000a3', 'zz_rls_o1', 'zz_rls_bA',
                  'Attendance correction', 'PortalRequest', 'pr1');

insert into public.refresh_sessions (id, "userId", "tokenHash", "expiresAt") values
  ('zz_rls_rs1', '00000000-0000-4000-8000-0000000000a3', 'h', now() + interval '1 day');

set local session_replication_role = origin;

-- From here on, every statement runs as the browser does.
set local role authenticated;


-- ---------------------------------------------------------------------
-- courses: org members read the org catalogue; a student only their
-- enrolled course; only an org admin writes, and only its own org.
-- ---------------------------------------------------------------------
select public._rls_read('courses', 'admin1', 2);
select public._rls_read('courses', 'staffA', 2);
select public._rls_read('courses', 'studA',  1);
select public._rls_read('courses', 'staffB', 2);
select public._rls_read('courses', 'admin2', 1);
select public._rls_read('courses', 'norole', 0);

select public._rls_w('courses insert own org',   'admin1', $$insert into public.courses (id, "organizationId", name, code, "durationValue", "updatedAt") values ('zz_rls_cN1', 'zz_rls_o1', 'n', 'ZZRLSCN1', 1, now())$$, 1);
select public._rls_w('courses insert other org', 'admin1', $$insert into public.courses (id, "organizationId", name, code, "durationValue", "updatedAt") values ('zz_rls_cN2', 'zz_rls_o2', 'n', 'ZZRLSCN2', 1, now())$$, -1);
select public._rls_w('courses insert',           'staffA', $$insert into public.courses (id, "organizationId", name, code, "durationValue", "updatedAt") values ('zz_rls_cN3', 'zz_rls_o1', 'n', 'ZZRLSCN3', 1, now())$$, -1);
select public._rls_w('courses insert',           'studA',  $$insert into public.courses (id, "organizationId", name, code, "durationValue", "updatedAt") values ('zz_rls_cN4', 'zz_rls_o1', 'n', 'ZZRLSCN4', 1, now())$$, -1);
select public._rls_w('courses insert',           'norole', $$insert into public.courses (id, "organizationId", name, code, "durationValue", "updatedAt") values ('zz_rls_cN5', 'zz_rls_o1', 'n', 'ZZRLSCN5', 1, now())$$, -1);
select public._rls_w('courses update',           'admin1', $$update public.courses set name = 'x' where id = 'zz_rls_cA1'$$, 1);
select public._rls_w('courses update',           'staffA', $$update public.courses set name = 'x' where id = 'zz_rls_cA1'$$, 0);
select public._rls_w('courses update',           'studA',  $$update public.courses set name = 'x' where id = 'zz_rls_cA1'$$, 0);
select public._rls_w('courses update other org', 'admin2', $$update public.courses set name = 'x' where id = 'zz_rls_cA1'$$, 0);
select public._rls_w('courses move to other org','admin1', $$update public.courses set "organizationId" = 'zz_rls_o2' where id = 'zz_rls_cA2'$$, -1);


-- ---------------------------------------------------------------------
-- batches: by branch; a student reads only their own batch.
-- ---------------------------------------------------------------------
select public._rls_read('batches', 'admin1', 3);
select public._rls_read('batches', 'staffA', 2);
select public._rls_read('batches', 'studA',  1);
select public._rls_read('batches', 'staffB', 1);
select public._rls_read('batches', 'admin2', 1);
select public._rls_read('batches', 'norole', 0);

select public._rls_w('batches insert own centre',   'staffA', $$insert into public.batches (id, "branchId", "courseId", name, code, "startDate", "updatedAt") values ('zz_rls_batN1', 'zz_rls_bA', 'zz_rls_cA1', 'n', 'ZZN1', now(), now())$$, 1);
select public._rls_w('batches insert other centre', 'staffA', $$insert into public.batches (id, "branchId", "courseId", name, code, "startDate", "updatedAt") values ('zz_rls_batN2', 'zz_rls_bB', 'zz_rls_cA1', 'n', 'ZZN2', now(), now())$$, -1);
select public._rls_w('batches insert',              'studA',  $$insert into public.batches (id, "branchId", "courseId", name, code, "startDate", "updatedAt") values ('zz_rls_batN3', 'zz_rls_bA', 'zz_rls_cA1', 'n', 'ZZN3', now(), now())$$, -1);
select public._rls_w('batches insert any centre',   'admin1', $$insert into public.batches (id, "branchId", "courseId", name, code, "startDate", "updatedAt") values ('zz_rls_batN4', 'zz_rls_bB', 'zz_rls_cA1', 'n', 'ZZN4', now(), now())$$, 1);
select public._rls_w('batches insert other org',    'admin2', $$insert into public.batches (id, "branchId", "courseId", name, code, "startDate", "updatedAt") values ('zz_rls_batN5', 'zz_rls_bA', 'zz_rls_cA1', 'n', 'ZZN5', now(), now())$$, -1);
select public._rls_w('batches insert',              'norole', $$insert into public.batches (id, "branchId", "courseId", name, code, "startDate", "updatedAt") values ('zz_rls_batN6', 'zz_rls_bA', 'zz_rls_cA1', 'n', 'ZZN6', now(), now())$$, -1);
select public._rls_w('batches update own',          'staffA', $$update public.batches set name = 'x' where id = 'zz_rls_batA1'$$, 1);
select public._rls_w('batches move to other centre','staffA', $$update public.batches set "branchId" = 'zz_rls_bB' where id = 'zz_rls_batA2'$$, -1);
select public._rls_w('batches update own batch',    'studA',  $$update public.batches set name = 'x' where id = 'zz_rls_batA1'$$, 0);
select public._rls_w('batches update centre A',     'staffB', $$update public.batches set name = 'x' where id = 'zz_rls_batA1'$$, 0);
select public._rls_w('batches delete centre A',     'admin2', $$delete from public.batches where id = 'zz_rls_batA2'$$, 0);


-- ---------------------------------------------------------------------
-- batch_timings: through the batch's branch; a student reads their batch's.
-- ---------------------------------------------------------------------
select public._rls_read('batch_timings', 'admin1', 3);
select public._rls_read('batch_timings', 'staffA', 2);
select public._rls_read('batch_timings', 'studA',  1);
select public._rls_read('batch_timings', 'staffB', 1);
select public._rls_read('batch_timings', 'admin2', 1);
select public._rls_read('batch_timings', 'norole', 0);

select public._rls_w('timings insert own batch',      'staffA', $$insert into public.batch_timings (id, "batchId", day, "startTime", "endTime") values ('zz_rls_tN1', 'zz_rls_batA1', 'TUESDAY', '09:00', '10:00')$$, 1);
select public._rls_w('timings insert centre B batch', 'staffA', $$insert into public.batch_timings (id, "batchId", day, "startTime", "endTime") values ('zz_rls_tN2', 'zz_rls_batB1', 'TUESDAY', '09:00', '10:00')$$, -1);
select public._rls_w('timings insert',                'studA',  $$insert into public.batch_timings (id, "batchId", day, "startTime", "endTime") values ('zz_rls_tN3', 'zz_rls_batA1', 'TUESDAY', '09:00', '10:00')$$, -1);
select public._rls_w('timings insert other org',      'admin2', $$insert into public.batch_timings (id, "batchId", day, "startTime", "endTime") values ('zz_rls_tN4', 'zz_rls_batA1', 'TUESDAY', '09:00', '10:00')$$, -1);
select public._rls_w('timings update',                'admin1', $$update public.batch_timings set "roomNo" = '1' where id = 'zz_rls_tB1'$$, 1);
select public._rls_w('timings update own batch',      'studA',  $$update public.batch_timings set "roomNo" = '1' where id = 'zz_rls_tA1'$$, 0);
select public._rls_w('timings update centre A',       'staffB', $$update public.batch_timings set "roomNo" = '1' where id = 'zz_rls_tA1'$$, 0);
select public._rls_w('timings move to centre B batch','staffA', $$update public.batch_timings set "batchId" = 'zz_rls_batB1' where id = 'zz_rls_tA2'$$, -1);


-- ---------------------------------------------------------------------
-- exams: by branch; a student reads only exams they hold a result for.
-- ---------------------------------------------------------------------
select public._rls_read('exams', 'admin1', 3);
select public._rls_read('exams', 'staffA', 2);
select public._rls_read('exams', 'studA',  1);
select public._rls_read('exams', 'staffB', 1);
select public._rls_read('exams', 'admin2', 1);
select public._rls_read('exams', 'norole', 0);

select public._rls_w('exams insert own centre',   'staffA', $$insert into public.exams (id, "branchId", "courseId", name, subject, "examDate", "updatedAt") values ('zz_rls_eN1', 'zz_rls_bA', 'zz_rls_cA1', 'n', 's', current_date, now())$$, 1);
select public._rls_w('exams insert other centre', 'staffA', $$insert into public.exams (id, "branchId", "courseId", name, subject, "examDate", "updatedAt") values ('zz_rls_eN2', 'zz_rls_bB', 'zz_rls_cA1', 'n', 's', current_date, now())$$, -1);
select public._rls_w('exams insert',              'studA',  $$insert into public.exams (id, "branchId", "courseId", name, subject, "examDate", "updatedAt") values ('zz_rls_eN3', 'zz_rls_bA', 'zz_rls_cA1', 'n', 's', current_date, now())$$, -1);
select public._rls_w('exams publish',             'admin1', $$update public.exams set status = 'PUBLISHED' where id = 'zz_rls_eB1'$$, 1);
select public._rls_w('exams update own result',   'studA',  $$update public.exams set "maxMarks" = 1 where id = 'zz_rls_eA1'$$, 0);
select public._rls_w('exams update centre A',     'staffB', $$update public.exams set "maxMarks" = 1 where id = 'zz_rls_eA1'$$, 0);
select public._rls_w('exams delete other org',    'admin2', $$delete from public.exams where id = 'zz_rls_eA2'$$, 0);
select public._rls_w('exams delete own',          'staffA', $$delete from public.exams where id = 'zz_rls_eA2'$$, 1);
-- the student's result-gated read must not have recursed into exam_results' policy
select public._rls_as('studA');
select public._rls_expect('exam_results / studA / read own', public._rls_count($$select 1 from public.exam_results where id like 'zz_rls_%'$$), 1);


-- ---------------------------------------------------------------------
-- visit_enquiries, item_dispatches, item_received: centre staff only.
-- ---------------------------------------------------------------------
select public._rls_read('visit_enquiries', 'admin1', 2);
select public._rls_read('visit_enquiries', 'staffA', 1);
select public._rls_read('visit_enquiries', 'studA',  0);
select public._rls_read('visit_enquiries', 'staffB', 1);
select public._rls_read('visit_enquiries', 'admin2', 1);
select public._rls_read('visit_enquiries', 'norole', 0);
select public._rls_w('enquiry insert own centre',   'staffA', $$insert into public.visit_enquiries (id, "branchId", "visitorName", phone, "visitDate", "visitTime", "personToMeet", "updatedAt") values ('zz_rls_vN1', 'zz_rls_bA', 'v', '0', now(), '10:00', 'p', now())$$, 1);
select public._rls_w('enquiry insert other centre', 'staffA', $$insert into public.visit_enquiries (id, "branchId", "visitorName", phone, "visitDate", "visitTime", "personToMeet", "updatedAt") values ('zz_rls_vN2', 'zz_rls_bB', 'v', '0', now(), '10:00', 'p', now())$$, -1);
select public._rls_w('enquiry insert',              'studA',  $$insert into public.visit_enquiries (id, "branchId", "visitorName", phone, "visitDate", "visitTime", "personToMeet", "updatedAt") values ('zz_rls_vN3', 'zz_rls_bA', 'v', '0', now(), '10:00', 'p', now())$$, -1);
select public._rls_w('enquiry update',              'admin1', $$update public.visit_enquiries set remarks = 'x' where id = 'zz_rls_vB'$$, 1);
select public._rls_w('enquiry update other org',    'admin2', $$update public.visit_enquiries set remarks = 'x' where id = 'zz_rls_vA'$$, 0);
select public._rls_w('enquiry delete centre A',     'staffB', $$delete from public.visit_enquiries where id = 'zz_rls_vA'$$, 0);
select public._rls_w('enquiry delete',              'norole', $$delete from public.visit_enquiries where id = 'zz_rls_vA'$$, 0);

select public._rls_read('item_dispatches', 'admin1', 2);
select public._rls_read('item_dispatches', 'staffA', 1);
select public._rls_read('item_dispatches', 'studA',  0);
select public._rls_read('item_dispatches', 'staffB', 1);
select public._rls_read('item_dispatches', 'admin2', 1);
select public._rls_read('item_dispatches', 'norole', 0);
select public._rls_w('dispatch insert own centre',   'staffA', $$insert into public.item_dispatches (id, "branchId", "itemName", quantity, "recipientName", "recipientPhone", "recipientAddress", "dispatchDate", "updatedAt") values ('zz_rls_dN1', 'zz_rls_bA', 'i', 1, 'r', '0', 'a', now(), now())$$, 1);
select public._rls_w('dispatch insert other centre', 'staffA', $$insert into public.item_dispatches (id, "branchId", "itemName", quantity, "recipientName", "recipientPhone", "recipientAddress", "dispatchDate", "updatedAt") values ('zz_rls_dN2', 'zz_rls_bB', 'i', 1, 'r', '0', 'a', now(), now())$$, -1);
select public._rls_w('dispatch update',              'studA',  $$update public.item_dispatches set remarks = 'x' where id = 'zz_rls_dA'$$, 0);

select public._rls_read('item_received', 'admin1', 2);
select public._rls_read('item_received', 'staffA', 1);
select public._rls_read('item_received', 'studA',  0);
select public._rls_read('item_received', 'staffB', 1);
select public._rls_read('item_received', 'admin2', 1);
select public._rls_read('item_received', 'norole', 0);
select public._rls_w('received insert own centre',   'staffB', $$insert into public.item_received (id, "branchId", "itemName", quantity, "senderName", "receivedDate", "receivedBy", "updatedAt") values ('zz_rls_iN1', 'zz_rls_bB', 'i', 1, 's', now(), 'r', now())$$, 1);
select public._rls_w('received insert other org',    'admin2', $$insert into public.item_received (id, "branchId", "itemName", quantity, "senderName", "receivedDate", "receivedBy", "updatedAt") values ('zz_rls_iN2', 'zz_rls_bA', 'i', 1, 's', now(), 'r', now())$$, -1);
select public._rls_w('received update',              'staffA', $$update public.item_received set remarks = 'x' where id = 'zz_rls_iB'$$, 0);


-- ---------------------------------------------------------------------
-- branch_notices: the centre's logins + its admin; all-centre notices
-- within the organisation; all-centre writes by org admins only.
-- ---------------------------------------------------------------------
select public._rls_read('branch_notices', 'admin1', 3);  -- nA, nB, nO1
select public._rls_read('branch_notices', 'staffA', 2);  -- nA, nO1
select public._rls_read('branch_notices', 'studA',  2);  -- nA, nO1
select public._rls_read('branch_notices', 'staffB', 2);  -- nB, nO1
select public._rls_read('branch_notices', 'admin2', 2);  -- nC, nO2
select public._rls_read('branch_notices', 'norole', 0);

select public._rls_w('notice insert own centre',      'staffA', $$insert into public.branch_notices (id, "branchId", title, content, "updatedAt") values ('zz_rls_nN1', 'zz_rls_bA', 't', 'c', now())$$, 1);
select public._rls_w('notice insert all centres',     'staffA', $$insert into public.branch_notices (id, "branchId", title, content, "updatedAt") values ('zz_rls_nN2', null, 't', 'c', now())$$, -1);
select public._rls_w('notice insert other centre',    'staffA', $$insert into public.branch_notices (id, "branchId", title, content, "updatedAt") values ('zz_rls_nN3', 'zz_rls_bB', 't', 'c', now())$$, -1);
select public._rls_w('notice insert all centres',     'admin1', $$insert into public.branch_notices (id, "branchId", title, content, "updatedAt") values ('zz_rls_nN4', null, 't', 'c', now())$$, 1);
select public._rls_w('notice insert',                 'studA',  $$insert into public.branch_notices (id, "branchId", title, content, "updatedAt") values ('zz_rls_nN5', 'zz_rls_bA', 't', 'c', now())$$, -1);
select public._rls_w('notice insert',                 'norole', $$insert into public.branch_notices (id, "branchId", title, content, "updatedAt") values ('zz_rls_nN6', null, 't', 'c', now())$$, -1);
select public._rls_w('notice update own',             'studA',  $$update public.branch_notices set title = 'x' where id = 'zz_rls_nA'$$, 0);
select public._rls_w('notice update all centres',     'staffB', $$update public.branch_notices set title = 'x' where id = 'zz_rls_nO1'$$, 0);
select public._rls_w('notice update other org',       'admin2', $$update public.branch_notices set title = 'x' where id = 'zz_rls_nO1'$$, 0);
select public._rls_w('notice widen to all centres',   'staffA', $$update public.branch_notices set "branchId" = null where id = 'zz_rls_nA'$$, -1);
select public._rls_w('notice update all centres',     'admin1', $$update public.branch_notices set title = 'x' where id = 'zz_rls_nO1'$$, 1);
-- the trigger filled the organisation the app never sends
select public._rls_as('admin1');
select public._rls_expect('branch_notices / trigger org (centre notice)',
  public._rls_count($$select 1 from public.branch_notices where id = 'zz_rls_nN1' and "organizationId" = 'zz_rls_o1'$$), 1);
select public._rls_expect('branch_notices / trigger org (all-centre notice)',
  public._rls_count($$select 1 from public.branch_notices where id = 'zz_rls_nN4' and "organizationId" = 'zz_rls_o1'$$), 1);
-- org 2 never sees org 1's all-centre notice
select public._rls_as('admin2');
select public._rls_expect('branch_notices / admin2 / new org-1 notice hidden',
  public._rls_count($$select 1 from public.branch_notices where id = 'zz_rls_nN4'$$), 0);


-- ---------------------------------------------------------------------
-- branch_renewal_history: admin writes; admin + centre staff read.
-- ---------------------------------------------------------------------
select public._rls_read('branch_renewal_history', 'admin1', 1);
select public._rls_read('branch_renewal_history', 'staffA', 1);
select public._rls_read('branch_renewal_history', 'studA',  0);
select public._rls_read('branch_renewal_history', 'staffB', 0);
select public._rls_read('branch_renewal_history', 'admin2', 1);
select public._rls_read('branch_renewal_history', 'norole', 0);
select public._rls_w('renewal insert',           'admin1', $$insert into public.branch_renewal_history (id, "licenseId", "renewalDate", "previousExpiry", "newExpiry") values ('zz_rls_rhN1', 'zz_rls_lA', now(), now(), now())$$, 1);
select public._rls_w('renewal insert',           'staffA', $$insert into public.branch_renewal_history (id, "licenseId", "renewalDate", "previousExpiry", "newExpiry") values ('zz_rls_rhN2', 'zz_rls_lA', now(), now(), now())$$, -1);
select public._rls_w('renewal insert other org', 'admin2', $$insert into public.branch_renewal_history (id, "licenseId", "renewalDate", "previousExpiry", "newExpiry") values ('zz_rls_rhN3', 'zz_rls_lA', now(), now(), now())$$, -1);
select public._rls_w('renewal update',           'staffA', $$update public.branch_renewal_history set remarks = 'x' where id = 'zz_rls_rhA'$$, 0);


-- ---------------------------------------------------------------------
-- audit_events: append-only; scoped reads; students only PortalRequests.
-- ---------------------------------------------------------------------
select public._rls_read('audit_events', 'admin1', 4);  -- auA, auB, auO1, auPR
select public._rls_read('audit_events', 'staffA', 2);  -- auA, auPR
select public._rls_read('audit_events', 'studA',  1);  -- auPR
select public._rls_read('audit_events', 'staffB', 1);  -- auB
select public._rls_read('audit_events', 'admin2', 1);  -- auC
select public._rls_read('audit_events', 'norole', 0);

select public._rls_w('audit insert own centre',          'staffA', $$insert into public.audit_events (id, "organizationId", "branchId", action, "entityType") values ('zz_rls_auN1', 'zz_rls_o1', 'zz_rls_bA', 'RECHARGE_SUBMITTED', 'BranchTransaction')$$, 1);
select public._rls_w('audit insert forged org',          'staffA', $$insert into public.audit_events (id, "organizationId", "branchId", action, "entityType") values ('zz_rls_auN2', 'zz_rls_o2', 'zz_rls_bA', 'RECHARGE_SUBMITTED', 'BranchTransaction')$$, -1);
select public._rls_w('audit insert other centre',        'staffA', $$insert into public.audit_events (id, "branchId", action, "entityType") values ('zz_rls_auN3', 'zz_rls_bB', 'X', 'BranchTransaction')$$, -1);
select public._rls_w('audit insert reviewer',            'admin1', $$insert into public.audit_events (id, "branchId", action, "entityType") values ('zz_rls_auN4', 'zz_rls_bB', 'RECHARGE_APPROVED', 'BranchTransaction')$$, 1);
select public._rls_w('audit insert other org',           'admin2', $$insert into public.audit_events (id, "branchId", action, "entityType") values ('zz_rls_auN5', 'zz_rls_bA', 'X', 'BranchTransaction')$$, -1);
select public._rls_w('audit insert portal request',      'studA',  $$insert into public.audit_events (id, "actorId", "organizationId", "branchId", action, "entityType", "entityId") values ('zz_rls_auN6', '00000000-0000-4000-8000-0000000000a3', 'zz_rls_o1', 'zz_rls_bA', 'Certificate', 'PortalRequest', 'pr2')$$, 1);
select public._rls_w('audit insert as someone else',     'studA',  $$insert into public.audit_events (id, "actorId", "branchId", action, "entityType") values ('zz_rls_auN7', '00000000-0000-4000-8000-0000000000a1', 'zz_rls_bA', 'X', 'PortalRequest')$$, -1);
select public._rls_w('audit insert non-request',         'studA',  $$insert into public.audit_events (id, "actorId", "branchId", action, "entityType") values ('zz_rls_auN8', '00000000-0000-4000-8000-0000000000a3', 'zz_rls_bA', 'X', 'BranchTransaction')$$, -1);
select public._rls_w('audit insert request other centre','studA',  $$insert into public.audit_events (id, "actorId", "branchId", action, "entityType") values ('zz_rls_auN9', '00000000-0000-4000-8000-0000000000a3', 'zz_rls_bB', 'X', 'PortalRequest')$$, -1);
select public._rls_w('audit insert',                     'norole', $$insert into public.audit_events (id, action, "entityType") values ('zz_rls_auNA', 'X', 'X')$$, -1);
select public._rls_w('audit update own request',         'studA',  $$update public.audit_events set action = 'x' where id = 'zz_rls_auPR'$$, 0);
select public._rls_w('audit update',                     'admin1', $$update public.audit_events set action = 'x' where id = 'zz_rls_auA'$$, 0);
select public._rls_w('audit delete',                     'staffA', $$delete from public.audit_events where id = 'zz_rls_auA'$$, 0);


-- ---------------------------------------------------------------------
-- refresh_sessions: nobody but the service role.
-- ---------------------------------------------------------------------
select public._rls_read('refresh_sessions', 'admin1', 0);
select public._rls_read('refresh_sessions', 'staffA', 0);
select public._rls_read('refresh_sessions', 'studA',  0);
select public._rls_read('refresh_sessions', 'staffB', 0);
select public._rls_read('refresh_sessions', 'admin2', 0);
select public._rls_read('refresh_sessions', 'norole', 0);
select public._rls_w('refresh insert', 'admin1', $$insert into public.refresh_sessions (id, "userId", "tokenHash", "expiresAt") values ('zz_rls_rsN', '00000000-0000-4000-8000-0000000000a3', 'h', now())$$, -1);
select public._rls_w('refresh delete', 'studA',  $$delete from public.refresh_sessions where id = 'zz_rls_rs1'$$, 0);


do $$ begin raise notice 'tighten-rls checks: all passed'; end $$;

rollback;
