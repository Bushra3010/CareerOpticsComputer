-- =====================================================================
-- Remove the Receptionist and Accountant roles.
--
-- They were seeded as built-in roles, but this CRM has no front-desk or
-- accounts job of its own: Reception, Fee and Expense are modules, and any
-- role can be given them under Access Control. The roles that stay match
-- what the app actually runs: Organisation Admin, Branch Admin, Teacher, Staff.
--
-- Nobody loses their login. Anyone holding one of the two roles moves to
-- Staff (same branch, same database reach, since no RLS policy treats
-- ACCOUNTANT or RECEPTIONIST differently from STAFF). Give them back the
-- pages they need by ticking modules on Staff, or on a custom role.
--
-- The enum values stay in "SystemRole": dropping enum values in Postgres
-- means rebuilding the type, and nothing gains from it.
--
-- Run once in the Supabase SQL editor. Safe to re-run.
-- =====================================================================

begin;

-- Every organisation has a Staff role to move people onto.
insert into public.roles (id, "organizationId", name, description, "baseRole", "isSystem")
select o.id || ':STAFF', o.id, 'Staff', 'General staff: whatever the institute grants them.', 'STAFF', true
from public.organizations o
on conflict (id) do nothing;

-- 1. The token RLS reads (app_metadata) and the name the UI reads (user_metadata).
update auth.users
set
  raw_app_meta_data  = jsonb_set(coalesce(raw_app_meta_data,  '{}'::jsonb), '{role}', '"STAFF"'),
  raw_user_meta_data = jsonb_set(coalesce(raw_user_meta_data, '{}'::jsonb), '{role}', '"STAFF"')
where upper(coalesce(raw_app_meta_data ->> 'role', '')) in ('ACCOUNTANT', 'RECEPTIONIST');

-- 2. The listed row: its base, and the role it was given if that was one of the two.
update public.users u
set
  "roleId" = case
    when u."roleId" in (u."organizationId" || ':ACCOUNTANT', u."organizationId" || ':RECEPTIONIST')
      then u."organizationId" || ':STAFF'
    else u."roleId"
  end,
  role = case when u.role::text in ('ACCOUNTANT', 'RECEPTIONIST') then 'STAFF'::"SystemRole" else u.role end
where u.role::text in ('ACCOUNTANT', 'RECEPTIONIST')
   or u."roleId" like '%:ACCOUNTANT'
   or u."roleId" like '%:RECEPTIONIST';

-- 3. Custom roles built on either base keep their name and modules, on Staff.
update public.roles
set "baseRole" = 'STAFF', "updatedAt" = now()
where "isSystem" = false and "baseRole"::text in ('ACCOUNTANT', 'RECEPTIONIST');

-- 4. The two built-in roles themselves.
delete from public.roles
where "isSystem" = true and "baseRole"::text in ('ACCOUNTANT', 'RECEPTIONIST');

commit;

notify pgrst, 'reload schema';

-- Check: should list only Organisation Admin, Branch Admin, Teacher, Staff
-- (plus any custom roles), and no user left on the two removed bases.
select "organizationId", name, "baseRole", "isSystem" from public.roles
order by "organizationId", "isSystem" desc, name;

select count(*) as users_still_on_removed_roles
from public.users where role::text in ('ACCOUNTANT', 'RECEPTIONIST');
