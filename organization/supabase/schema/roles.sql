-- An institute's own roles, and what each of them may open.
--
-- The app had eight roles written into its code and three views to put them
-- in, so an accountant, a receptionist and a teacher were all handed the same
-- branch menu -- choosing between them at Add User changed nothing. The User
-- Roles page, meanwhile, listed four roles that existed nowhere but that file.
--
-- This gives an organisation real roles: its own names, and a list of the
-- pages each one may open.
--
-- What it deliberately does NOT do is let a role escape the database's own
-- rules. `users.role` stays the `SystemRole` enum, because every RLS policy in
-- this schema reads it through jwt_role() -- a made-up value there would be a
-- stranger to all of them. A custom role therefore carries a `baseRole`, which
-- is what the account is actually minted as, and its module list only narrows
-- what that base can already do. Permission granted here is UI; permission
-- refused by RLS is the wall.
--
-- Run once in the Supabase SQL editor. Safe to re-run.


-- ---------------------------------------------------------------------
-- 1. The table.
-- ---------------------------------------------------------------------
create table if not exists public.roles (
  id text primary key,
  "organizationId" text references public.organizations(id) on delete cascade,
  name text not null,
  description text,
  -- What the login is minted as, and therefore what RLS sees.
  "baseRole" "SystemRole" not null default 'STAFF',
  -- Navigation paths this role may open. Empty means "everything its base
  -- role could open anyway", which is how every account behaved before.
  modules text[] not null default '{}',
  -- The eight the app ships with. Their base cannot be changed and they
  -- cannot be deleted; their name and modules can.
  "isSystem" boolean not null default false,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

-- Two roles in one institute cannot share a name, however it is capitalised.
create unique index if not exists "roles_org_name_idx"
  on public.roles ("organizationId", lower(name));

create index if not exists "roles_org_idx" on public.roles ("organizationId");


-- ---------------------------------------------------------------------
-- 2. Which role a login holds.
--
--    `users.role` still holds the base -- this only says which of the
--    institute's roles it was given, and so which menu it gets.
-- ---------------------------------------------------------------------
alter table public.users add column if not exists "roleId" text;

do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_schema = 'public' and constraint_name = 'users_roleId_fkey'
  ) then
    alter table public.users
      add constraint "users_roleId_fkey"
      foreign key ("roleId") references public.roles(id) on delete set null;
  end if;
end $$;


-- ---------------------------------------------------------------------
-- 3. Who may read and write them.
--
--    Everyone in the institute reads: a receptionist's own login has to be
--    able to read the role it holds, or the app cannot build their menu.
--    Only an administrator writes.
-- ---------------------------------------------------------------------
alter table public.roles enable row level security;

drop policy if exists "Roles readable inside the organisation" on public.roles;
drop policy if exists "Roles written by an administrator" on public.roles;

create policy "Roles readable inside the organisation" on public.roles
  for select to authenticated
  using (
    public.jwt_role() = 'SUPER_ADMIN'
    or "organizationId" = public.jwt_org_id()
  );

create policy "Roles written by an administrator" on public.roles
  for all to authenticated
  using (
    public.jwt_role() = 'SUPER_ADMIN'
    or (public.is_org_admin() and "organizationId" = public.jwt_org_id())
  )
  with check (
    public.jwt_role() = 'SUPER_ADMIN'
    or (public.is_org_admin() and "organizationId" = public.jwt_org_id())
  );


-- ---------------------------------------------------------------------
-- 4. The eight the app ships with, for every organisation that exists.
--
--    Seeded with no modules, which reads as "everything this base could
--    already open" -- so running this migration changes nobody's access
--    until an administrator narrows a role on purpose.
-- ---------------------------------------------------------------------
insert into public.roles (id, "organizationId", name, description, "baseRole", "isSystem")
select
  o.id || ':' || r.base,
  o.id,
  r.label,
  r.description,
  r.base::"SystemRole",
  true
from public.organizations o
cross join (values
  ('ORGANIZATION_ADMIN', 'Organisation Admin', 'Every branch and every module, settings and users included.'),
  ('BRANCH_ADMIN',       'Branch Admin',       'Runs one branch: its admissions, fees, attendance and results.'),
  ('ACCOUNTANT',         'Accountant',         'Fees, payments and the branch wallet.'),
  ('RECEPTIONIST',       'Receptionist',       'The front desk: visitors, enquiries and admissions.'),
  ('TEACHER',            'Teacher',            'Classes, attendance, exams and marks.'),
  ('STAFF',              'Staff',              'General staff: whatever the institute grants them.')
) as r(base, label, description)
on conflict (id) do nothing;


notify pgrst, 'reload schema';


-- ---------------------------------------------------------------------
-- 5. Check.
-- ---------------------------------------------------------------------
select "organizationId", name, "baseRole", "isSystem", cardinality(modules) as modules
from public.roles
order by "organizationId", "isSystem" desc, name;
