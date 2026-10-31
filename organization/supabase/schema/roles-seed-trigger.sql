-- =====================================================================
-- Every organisation gets the app's built-in roles.
--
-- roles.sql seeded them only for organisations that already existed when it
-- ran. An organisation created afterwards (as this one was, by
-- supabase-bootstrap-org.sql) had none, and the Roles page read the empty list
-- as "roles are not set up" and disabled "New role". Safe to re-run.
-- =====================================================================

create or replace function public.seed_system_roles(p_org text)
returns void language sql security definer set search_path = public as $$
  insert into public.roles (id, "organizationId", name, description, "baseRole", "isSystem")
  select p_org || ':' || r.base, p_org, r.label, r.description, r.base::"SystemRole", true
  from (values
    ('ORGANIZATION_ADMIN', 'Organisation Admin', 'Every branch and every module, settings and users included.'),
    ('BRANCH_ADMIN',       'Branch Admin',       'Runs one branch: its admissions, fees, attendance and results.'),
    ('ACCOUNTANT',         'Accountant',         'Fees, payments and the branch wallet.'),
    ('RECEPTIONIST',       'Receptionist',       'The front desk: visitors, enquiries and admissions.'),
    ('TEACHER',            'Teacher',            'Classes, attendance, exams and marks.'),
    ('STAFF',              'Staff',              'General staff: whatever the institute grants them.')
  ) as r(base, label, description)
  on conflict (id) do nothing;
$$;
revoke all on function public.seed_system_roles(text) from public, anon, authenticated;

create or replace function public.seed_roles_for_new_organization()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.seed_system_roles(new.id);
  return new;
end $$;

drop trigger if exists organizations_seed_roles on public.organizations;
create trigger organizations_seed_roles after insert on public.organizations
  for each row execute function public.seed_roles_for_new_organization();

-- The organisations that already exist.
select public.seed_system_roles(id) from public.organizations;
