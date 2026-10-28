-- Let every login read the role that decides its menu.
--
-- roles.sql let a login read roles only where the token's app_metadata carried
-- the institute's id. Logins minted before that claim existed (or by a path
-- that never set it) could read no role at all, so the app fell back to the
-- view's whole menu and the ticks on Access Control never reached them.
--
-- This also matches on the login's own `public.users` row -- which every login
-- may read -- so the role it holds and its institute's roles are always
-- readable.
--
-- Run once in the Supabase SQL editor after roles.sql. Safe to re-run.

drop policy if exists "Roles readable inside the organisation" on public.roles;

create policy "Roles readable inside the organisation" on public.roles
  for select to authenticated
  using (
    public.jwt_role() = 'SUPER_ADMIN'
    or "organizationId" = public.jwt_org_id()
    or id in (select u."roleId" from public.users u where u.id = auth.uid()::text)
    or "organizationId" in (select u."organizationId" from public.users u where u.id = auth.uid()::text)
  );

notify pgrst, 'reload schema';
