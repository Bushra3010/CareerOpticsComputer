-- =====================================================================
-- Branch records, scoped.
--
-- branches, branch_directors, branch_addresses, branch_licenses and
-- branch_settings each carried "Authenticated full access" (USING true): any
-- signed-in account -- a student's included -- could read and rewrite every
-- centre. This replaces that with:
--
--   * an organisation admin: every branch of its own organisation;
--   * a centre's staff (is_branch_staff): read its own branch; update its own
--     contact details, address, director and website settings -- never its
--     organisation, code, status, owner or licence;
--   * a student: read its own branch (the portal and its documents show the
--     centre's name, address and logo), nothing more.
--
-- The edge functions use the service role, and the public website reads
-- centres through security-definer functions (public_centres,
-- public_branch_courses), so neither depends on these policies.
-- Safe to re-run.
-- =====================================================================

-- A student must not reach the centre panel's own tables either.
create or replace function public.can_touch_branch(target text)
returns boolean language sql stable as $$
  select public.is_branch_staff(target)
      or (public.is_org_admin() and exists (
            select 1 from public.branches b
             where b.id = target and b."organizationId" = public.jwt_org_id()));
$$;

-- Admin of the branch's organisation. Security definer so the policies on
-- branches can ask it without the check recursing into those same policies.
create or replace function public.is_branch_org_admin(target text)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_org_admin() and exists (
    select 1 from public.branches b
     where b.id = target and b."organizationId" = public.jwt_org_id());
$$;
revoke all on function public.is_branch_org_admin(text) from public, anon;
grant execute on function public.is_branch_org_admin(text) to authenticated;

-- ---------------------------------------------------------------------
-- branches
-- ---------------------------------------------------------------------
alter table public.branches enable row level security;
drop policy if exists "Authenticated full access" on public.branches;
drop policy if exists "Branch read" on public.branches;
drop policy if exists "Branch admin write" on public.branches;
drop policy if exists "Branch staff update own" on public.branches;

create policy "Branch read" on public.branches for select to authenticated
  using (
    (public.is_org_admin() and "organizationId" = public.jwt_org_id())
    or id = public.jwt_branch_id()
  );

create policy "Branch admin write" on public.branches for all to authenticated
  using (public.is_org_admin() and "organizationId" = public.jwt_org_id())
  with check (public.is_org_admin() and "organizationId" = public.jwt_org_id());

create policy "Branch staff update own" on public.branches for update to authenticated
  using (public.is_branch_staff(id))
  with check (public.is_branch_staff(id));

-- A centre editing its own row keeps the head office's columns as they were.
create or replace function public.guard_branch_columns()
returns trigger language plpgsql as $$
begin
  if not public.is_org_admin() then
    new."organizationId" := old."organizationId";
    new.code             := old.code;
    new."isActive"       := old."isActive";
    new."branchType"     := old."branchType";
    new."userId"         := old."userId";
    new."deletedAt"      := old."deletedAt";
  end if;
  return new;
end $$;
drop trigger if exists branches_guard on public.branches;
create trigger branches_guard before update on public.branches
  for each row execute function public.guard_branch_columns();

-- ---------------------------------------------------------------------
-- The branch's satellite rows. Read: the admin, the centre, its students.
-- Write: the admin; the centre may update (not create or delete) its own
-- director and address, and fully manage its own website settings.
-- Licences are the head office's alone.
-- ---------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['branch_directors','branch_addresses','branch_licenses','branch_settings'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "Authenticated full access" on public.%I', t);
    execute format('drop policy if exists "Branch row read" on public.%I', t);
    execute format('drop policy if exists "Branch row admin write" on public.%I', t);
    execute format('drop policy if exists "Branch row staff update" on public.%I', t);
    execute format('drop policy if exists "Branch row staff write" on public.%I', t);
    execute format($p$create policy "Branch row read" on public.%I for select to authenticated
      using (public.is_branch_org_admin("branchId") or "branchId" = public.jwt_branch_id())$p$, t);
    execute format($p$create policy "Branch row admin write" on public.%I for all to authenticated
      using (public.is_branch_org_admin("branchId")) with check (public.is_branch_org_admin("branchId"))$p$, t);
  end loop;

  foreach t in array array['branch_directors','branch_addresses'] loop
    execute format($p$create policy "Branch row staff update" on public.%I for update to authenticated
      using (public.is_branch_staff("branchId")) with check (public.is_branch_staff("branchId"))$p$, t);
  end loop;

  execute $p$create policy "Branch row staff write" on public.branch_settings for all to authenticated
    using (public.is_branch_staff("branchId")) with check (public.is_branch_staff("branchId"))$p$;
end $$;

select tablename, policyname, cmd from pg_policies
 where schemaname = 'public'
   and tablename in ('branches','branch_directors','branch_addresses','branch_licenses','branch_settings')
 order by 1, 2;
