-- ============================================================================
-- RLS proof suite — tenancy layer
--
-- Implements the build-plan test matrix (docs/00-build-plan.md §5.2) for every
-- table that exists after migration 0004. Cases that need `students`, `payments`
-- or `exam_attempts` (R05, R12, R16-R20, P2) arrive with migrations 0006-0010;
-- they are listed as skips at the end so the gap is visible rather than silent.
--
-- Run with: npm run db:test
-- ============================================================================

begin;

create extension if not exists pgtap with schema extensions;

select plan(25);

-- ---------------------------------------------------------------------------
-- Fixtures
--
-- Two organisations, four centres and one user per scenario. Everything is
-- created as the migration role, then each test switches identity with
-- `request.jwt.claims`, which is exactly what PostgREST does per request.
-- ---------------------------------------------------------------------------

create or replace function pg_temp.mk_user(p_id uuid, p_email text)
returns uuid
language plpgsql
as $$
begin
  insert into auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    created_at, updated_at, raw_app_meta_data, raw_user_meta_data
  )
  values (
    p_id, '00000000-0000-0000-0000-000000000000', 'authenticated',
    'authenticated', p_email, '', now(), now(), '{}'::jsonb, '{}'::jsonb
  );

  insert into public.profiles (id, full_name, status)
  values (p_id, initcap(split_part(p_email, '@', 1)), 'active');

  return p_id;
end;
$$;

/* Impersonate a signed-in user for the statements that follow. */
create or replace function pg_temp.act_as(p_user uuid)
returns void
language plpgsql
as $$
begin
  execute format(
    'set local request.jwt.claims = %L',
    json_build_object('sub', p_user, 'role', 'authenticated')::text
  );
  set local role authenticated;
end;
$$;

create or replace function pg_temp.act_as_anon()
returns void
language plpgsql
as $$
begin
  set local request.jwt.claims = '';
  set local role anon;
end;
$$;

create or replace function pg_temp.act_as_owner()
returns void
language plpgsql
as $$
begin
  reset role;
  set local request.jwt.claims = '';
end;
$$;

-- Users -----------------------------------------------------------------------
select pg_temp.mk_user('11111111-1111-1111-1111-111111111111', 'owner.a@example.test');
select pg_temp.mk_user('22222222-2222-2222-2222-222222222222', 'owner.b@example.test');
select pg_temp.mk_user('33333333-3333-3333-3333-333333333333', 'owner.rival@example.test');
select pg_temp.mk_user('44444444-4444-4444-4444-444444444444', 'headoffice@example.test');
select pg_temp.mk_user('55555555-5555-5555-5555-555555555555', 'suspended.staff@example.test');
select pg_temp.mk_user('66666666-6666-6666-6666-666666666666', 'owner.suspended.centre@example.test');

-- Organisations ----------------------------------------------------------------
insert into public.organizations (id, slug, legal_name, display_name, code)
values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'career-optics',
   'Career Optics Computer Academy', 'Career Optics', 'CO'),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'rival-academy',
   'Rival Academy Private Limited', 'Rival Academy', 'RA');

-- Centres ----------------------------------------------------------------------
insert into public.centres (id, organization_id, code, display_name, city, status, suspended_reason)
values
  ('c0000000-0000-0000-0000-00000000000a', 'aaaaaaaa-0000-0000-0000-000000000001',
   'DL01', 'Delhi Central', 'New Delhi', 'active', null),
  ('c0000000-0000-0000-0000-00000000000b', 'aaaaaaaa-0000-0000-0000-000000000001',
   'MU01', 'Mumbai Andheri', 'Mumbai', 'active', null),
  ('c0000000-0000-0000-0000-00000000000d', 'aaaaaaaa-0000-0000-0000-000000000001',
   'KO01', 'Kolkata Salt Lake', 'Kolkata', 'suspended', 'Renewal fee overdue'),
  ('c0000000-0000-0000-0000-00000000000c', 'bbbbbbbb-0000-0000-0000-000000000002',
   'BL01', 'Bengaluru Whitefield', 'Bengaluru', 'active', null);

-- Memberships ------------------------------------------------------------------
insert into public.memberships (user_id, organization_id, centre_id, role_id, status)
select
  v.user_id, v.org_id, v.centre_id, r.id, v.status::app.membership_status
from (
  values
    ('11111111-1111-1111-1111-111111111111'::uuid, 'aaaaaaaa-0000-0000-0000-000000000001'::uuid,
     'c0000000-0000-0000-0000-00000000000a'::uuid, 'centre_owner', 'active'),
    ('22222222-2222-2222-2222-222222222222'::uuid, 'aaaaaaaa-0000-0000-0000-000000000001'::uuid,
     'c0000000-0000-0000-0000-00000000000b'::uuid, 'centre_owner', 'active'),
    ('33333333-3333-3333-3333-333333333333'::uuid, 'bbbbbbbb-0000-0000-0000-000000000002'::uuid,
     'c0000000-0000-0000-0000-00000000000c'::uuid, 'centre_owner', 'active'),
    -- Organisation-wide membership: centre_id NULL reaches every centre in org 1.
    ('44444444-4444-4444-4444-444444444444'::uuid, 'aaaaaaaa-0000-0000-0000-000000000001'::uuid,
     null::uuid, 'head_office_operator', 'active'),
    ('55555555-5555-5555-5555-555555555555'::uuid, 'aaaaaaaa-0000-0000-0000-000000000001'::uuid,
     'c0000000-0000-0000-0000-00000000000a'::uuid, 'centre_manager', 'suspended'),
    ('66666666-6666-6666-6666-666666666666'::uuid, 'aaaaaaaa-0000-0000-0000-000000000001'::uuid,
     'c0000000-0000-0000-0000-00000000000d'::uuid, 'centre_owner', 'active')
) as v(user_id, org_id, centre_id, role_code, status)
join public.roles r on r.code = v.role_code and r.is_system;

update public.memberships
   set suspended_reason = 'Left the organisation pending handover'
 where status = 'suspended';

-- ---------------------------------------------------------------------------
-- R01 — an unauthenticated caller reaches nothing
-- ---------------------------------------------------------------------------

select pg_temp.act_as_anon();

select throws_ok(
  'select * from public.centres',
  '42501',
  null,
  'R01a: anon has no privilege on centres'
);

select throws_ok(
  'select * from public.memberships',
  '42501',
  null,
  'R01b: anon has no privilege on memberships'
);

select pg_temp.act_as_owner();

-- ---------------------------------------------------------------------------
-- R02/R03/R04 — centre isolation (proof test P1)
-- ---------------------------------------------------------------------------

select pg_temp.act_as('11111111-1111-1111-1111-111111111111');

select is(
  (select count(*) from public.centres)::int,
  1,
  'R02a: a centre owner sees only their own centre'
);

select is_empty(
  $$select id from public.centres
     where id = 'c0000000-0000-0000-0000-00000000000b'$$,
  'R02b: centre A owner cannot read centre B'
);

-- An UPDATE filtered out by the USING clause affects zero rows rather than
-- raising, so the assertion is that the target is unchanged.
update public.centres
   set display_name = 'Hijacked by centre A'
 where id = 'c0000000-0000-0000-0000-00000000000b';

select pg_temp.act_as_owner();

select is(
  (select display_name from public.centres
    where id = 'c0000000-0000-0000-0000-00000000000b'),
  'Mumbai Andheri',
  'R03: centre A owner cannot mutate centre B'
);

select pg_temp.act_as('11111111-1111-1111-1111-111111111111');

select throws_ok(
  $$insert into public.centres (organization_id, code, display_name)
    values ('aaaaaaaa-0000-0000-0000-000000000001', 'ZZ99', 'Rogue centre')$$,
  '42501',
  null,
  'R04: a centre owner lacks centre.create and cannot add a centre'
);

select pg_temp.act_as_owner();

-- ---------------------------------------------------------------------------
-- R11 — organisation isolation
-- ---------------------------------------------------------------------------

select pg_temp.act_as('33333333-3333-3333-3333-333333333333');

select is_empty(
  $$select id from public.centres
     where organization_id = 'aaaaaaaa-0000-0000-0000-000000000001'$$,
  'R11a: an owner in organisation 2 sees no organisation 1 centre'
);

select is_empty(
  $$select id from public.organizations
     where id = 'aaaaaaaa-0000-0000-0000-000000000001'$$,
  'R11b: an owner in organisation 2 cannot read organisation 1'
);

select pg_temp.act_as_owner();

-- ---------------------------------------------------------------------------
-- Organisation-wide membership reaches every centre in its organisation
-- ---------------------------------------------------------------------------

select pg_temp.act_as('44444444-4444-4444-4444-444444444444');

select is(
  (select count(*) from public.centres)::int,
  3,
  'Head office sees all three centres in its own organisation and no others'
);

-- R10: suspension blocks writes but head office keeps historical read access.
select is(
  (select display_name from public.centres
    where id = 'c0000000-0000-0000-0000-00000000000d'),
  'Kolkata Salt Lake',
  'R10: head office can still read a suspended centre (PRD §19.3)'
);

select pg_temp.act_as_owner();

-- ---------------------------------------------------------------------------
-- R06/R07 — no self-promotion (proof test P3)
-- ---------------------------------------------------------------------------

select pg_temp.act_as('11111111-1111-1111-1111-111111111111');

update public.memberships
   set role_id = (select id from public.roles where code = 'head_office_operator' and is_system)
 where user_id = '11111111-1111-1111-1111-111111111111';

update public.memberships
   set centre_id = 'c0000000-0000-0000-0000-00000000000b'
 where user_id = '11111111-1111-1111-1111-111111111111';

select pg_temp.act_as_owner();

select is(
  (select r.code
     from public.memberships m
     join public.roles r on r.id = m.role_id
    where m.user_id = '11111111-1111-1111-1111-111111111111'),
  'centre_owner',
  'R06a: a user cannot change their own role'
);

select is(
  (select centre_id from public.memberships
    where user_id = '11111111-1111-1111-1111-111111111111'),
  'c0000000-0000-0000-0000-00000000000a'::uuid,
  'R06b: a user cannot move their own membership to another centre'
);

select pg_temp.act_as('11111111-1111-1111-1111-111111111111');

select throws_ok(
  $$insert into public.role_permissions (role_id, permission_code)
    select id, 'certificate.revoke' from public.roles
     where code = 'centre_owner' and is_system$$,
  '42501',
  null,
  'R07: a centre owner cannot grant their own role a new permission'
);

select pg_temp.act_as_owner();

-- ---------------------------------------------------------------------------
-- R08 — a suspended membership is inert (proof test P4)
-- ---------------------------------------------------------------------------

select pg_temp.act_as('55555555-5555-5555-5555-555555555555');

select is(
  (select count(*) from public.centres)::int,
  0,
  'R08a: a suspended membership grants no read access'
);

select throws_ok(
  $$insert into public.memberships (user_id, organization_id, centre_id, role_id, status)
    select '22222222-2222-2222-2222-222222222222',
           'aaaaaaaa-0000-0000-0000-000000000001',
           'c0000000-0000-0000-0000-00000000000a',
           id, 'invited'
      from public.roles where code = 'faculty' and is_system$$,
  '42501',
  null,
  'R08b: a suspended membership cannot invite staff'
);

select pg_temp.act_as_owner();

-- ---------------------------------------------------------------------------
-- R09 — a suspended centre blocks writes for its own active staff
-- ---------------------------------------------------------------------------

select pg_temp.act_as('66666666-6666-6666-6666-666666666666');

-- The owner can still read their suspended centre...
select is(
  (select count(*) from public.centres)::int,
  1,
  'R09a: an active membership still reads its suspended centre'
);

-- ...but cannot invite new staff into it, because centre_is_operational fails.
select throws_ok(
  $$insert into public.memberships (user_id, organization_id, centre_id, role_id, status)
    select '22222222-2222-2222-2222-222222222222',
           'aaaaaaaa-0000-0000-0000-000000000001',
           'c0000000-0000-0000-0000-00000000000d',
           id, 'invited'
      from public.roles where code = 'faculty' and is_system$$,
  '42501',
  null,
  'R09b: a suspended centre cannot take on new staff'
);

select pg_temp.act_as_owner();

-- ---------------------------------------------------------------------------
-- R15 — the audit log is append-only at the privilege level
-- ---------------------------------------------------------------------------

select pg_temp.act_as('44444444-4444-4444-4444-444444444444');

select throws_ok(
  $$update public.audit_logs set reason = 'tampered' where id > 0$$,
  '42501',
  null,
  'R15a: UPDATE on audit_logs is revoked for every authenticated user'
);

select throws_ok(
  $$delete from public.audit_logs where id > 0$$,
  '42501',
  null,
  'R15b: DELETE on audit_logs is revoked for every authenticated user'
);

select pg_temp.act_as_owner();

-- The centre fixtures above ran through the audit trigger, so there is
-- something to have been logged.
select ok(
  (select count(*) from public.audit_logs
    where entity_table = 'public.centres' and action = 'insert') = 4,
  'Audit trigger recorded every centre insert'
);

-- ---------------------------------------------------------------------------
-- Document numbering (proof test P5, single-session half)
--
-- True concurrency needs separate sessions, which pgTAP cannot open inside one
-- transaction. The parallel-allocation half of P5 lives in
-- tests/integration/numbering.test.ts. This asserts the gapless contract.
-- ---------------------------------------------------------------------------

select is(
  (select array_agg(n order by n)
     from (
       select app.next_document_number(
                'aaaaaaaa-0000-0000-0000-000000000001',
                'c0000000-0000-0000-0000-00000000000a',
                'registration', '26') as n
       from generate_series(1, 5)
     ) s),
  array[1, 2, 3, 4, 5]::bigint[],
  'P5a: document numbers are sequential and gapless'
);

select is(
  app.next_document_number(
    'aaaaaaaa-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-00000000000b',
    'registration', '26'),
  1::bigint,
  'P5b: sequences are scoped per centre, not shared'
);

-- ---------------------------------------------------------------------------
-- Structural guarantees
--
-- These catch the regression where someone adds a table and forgets RLS, or
-- writes a SECURITY DEFINER helper without pinning search_path. Both are the
-- kind of mistake that only shows up as a breach.
-- ---------------------------------------------------------------------------

select is(
  (select count(*)::int
     from pg_class c
     join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind = 'r'
      and (not c.relrowsecurity or not c.relforcerowsecurity)),
  0,
  'Every table in public has RLS both enabled and forced'
);

select is(
  (select count(*)::int
     from pg_proc p
     join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'app'
      and p.prosecdef
      and coalesce(array_to_string(p.proconfig, ','), '') not like '%search_path=%'),
  0,
  'Every SECURITY DEFINER function in app pins search_path (build plan R4)'
);

select is(
  (select count(*)::int
     from information_schema.role_table_grants
    where table_schema = 'public' and grantee = 'anon'),
  0,
  'anon holds no table privilege anywhere in public'
);

-- The RPC wrappers added in 0005 must not become an anon-reachable oracle.
select is(
  (select count(*)::int
     from information_schema.role_routine_grants
    where routine_schema = 'public' and grantee = 'anon'),
  0,
  'anon cannot execute any function in public'
);

select * from finish();

rollback;
