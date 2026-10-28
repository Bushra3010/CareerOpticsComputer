-- Give staff logins somewhere to belong.
--
-- The All Users page could only ever list two kinds of account, because those
-- are the only two the schema can place: an organisation names its admin
-- through `organizations.userId`, and a branch names its login through
-- `branches.userId`. A receptionist, an accountant or a teacher owns neither,
-- so there was no column anywhere that said which institute they work for --
-- and a login nobody can scope is a login nobody can safely list.
--
-- This adds that column. `organizationId` is the one that matters; `branchId`
-- is set as well when the person works out of a single branch, which is what
-- lets a branch admin see their own staff without seeing head office.
--
-- Both are nullable on purpose. Every row that exists today predates them, and
-- a NOT NULL would have to invent an answer for accounts whose organisation is
-- genuinely unknown. Step 2 backfills the ones that can be worked out from the
-- links that already exist.
--
-- Run once in the Supabase SQL editor. Safe to re-run.


-- ---------------------------------------------------------------------
-- 1. The columns.
--
--    `on delete set null`, not cascade: closing an organisation must not
--    silently delete the people who worked there. The audit trail on
--    `audit_events` points at these rows.
-- ---------------------------------------------------------------------
alter table public.users add column if not exists "organizationId" text;
alter table public.users add column if not exists "branchId" text;

do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_schema = 'public' and constraint_name = 'users_organizationId_fkey'
  ) then
    alter table public.users
      add constraint "users_organizationId_fkey"
      foreign key ("organizationId") references public.organizations(id) on delete set null;
  end if;

  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_schema = 'public' and constraint_name = 'users_branchId_fkey'
  ) then
    alter table public.users
      add constraint "users_branchId_fkey"
      foreign key ("branchId") references public.branches(id) on delete set null;
  end if;
end $$;

create index if not exists "users_organizationId_idx" on public.users ("organizationId");
create index if not exists "users_branchId_idx" on public.users ("branchId");


-- ---------------------------------------------------------------------
-- 2. Backfill from the links that already point the other way.
--
--    Only fills what is still null, so re-running this cannot overwrite a
--    posting somebody has since corrected by hand.
-- ---------------------------------------------------------------------
update public.users u
   set "organizationId" = o.id
  from public.organizations o
 where o."userId" = u.id
   and u."organizationId" is null;

update public.users u
   set "branchId"       = b.id,
       "organizationId" = coalesce(u."organizationId", b."organizationId")
  from public.branches b
 where b."userId" = u.id
   and u."branchId" is null;

-- A student's login belongs to the branch that enrolled them. They are not
-- listed on the All Users page, but leaving them unscoped would make the RLS
-- below invisible to the very branch that owns the record.
--
-- The organisation comes through the branch: `students` has a `branchId` and
-- no `organizationId`, so the branch is the only thing that knows which
-- institute the enrolment belongs to.
update public.users u
   set "branchId"       = s."branchId",
       "organizationId" = coalesce(u."organizationId", b."organizationId")
  from public.students s
  join public.branches b on b.id = s."branchId"
 where s."userId" = u.id
   and u."branchId" is null;


-- ---------------------------------------------------------------------
-- 3. The org-level counterpart to jwt_branch_id(), from
--    branch-scoped-wallet-rls.sql. Read from app_metadata, never
--    user_metadata -- a user can rewrite their own user_metadata with
--    supabase.auth.updateUser(), so a policy keyed on it would let any
--    account move itself into another organisation.
-- ---------------------------------------------------------------------
create or replace function public.jwt_org_id()
returns text
language sql
stable
as $$
  select auth.jwt() -> 'app_metadata' ->> 'organizationId';
$$;


-- ---------------------------------------------------------------------
-- 4. Who may read and write a user row.
--
--    An org admin gets their whole organisation. A branch admin gets their
--    own branch. Everyone else gets exactly themselves, so the app can still
--    read the signed-in person's own record.
--
--    SUPER_ADMIN is listed separately rather than folded into is_org_admin():
--    that account often carries no organizationId at all, and `null = null` is
--    NULL rather than true, so an organisation test would lock out the one
--    role that is supposed to see everything.
--
--    service_role is unaffected -- policies do not apply to it -- which is
--    what lets the create-staff-user edge function insert the row.
-- ---------------------------------------------------------------------
alter table public.users enable row level security;

drop policy if exists "Authenticated full access" on public.users;
drop policy if exists "Own organisation users" on public.users;

create policy "Own organisation users" on public.users
  for all to authenticated
  using (
    id = auth.uid()::text
    or public.jwt_role() = 'SUPER_ADMIN'
    or (public.is_org_admin() and "organizationId" = public.jwt_org_id())
    or (public.jwt_role() = 'BRANCH_ADMIN' and "branchId" = public.jwt_branch_id())
  )
  with check (
    public.jwt_role() = 'SUPER_ADMIN'
    or (public.is_org_admin() and "organizationId" = public.jwt_org_id())
    or (public.jwt_role() = 'BRANCH_ADMIN' and "branchId" = public.jwt_branch_id())
  );


-- ---------------------------------------------------------------------
-- 5. Check what is in place now.
-- ---------------------------------------------------------------------
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public' and table_name = 'users'
  and column_name in ('organizationId', 'branchId');

select policyname, roles from pg_policies
where schemaname = 'public' and tablename = 'users';

-- NOTE: app_metadata reaches the JWT only when a token is issued. Anyone signed
-- in right now must sign out and back in before these policies see their role.
