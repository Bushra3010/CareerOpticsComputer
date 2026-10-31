-- =====================================================================
-- Organisation-wide General Settings.
--
-- System Settings > General kept everything in the browser's localStorage, so
-- each admin saw their own copy and a second computer started blank. The
-- institute's name and contact details now go to the real columns on
-- `organizations` (name, email, phone, streetAddress, city, state, country);
-- everything else on that page (academic year, timezone, notification and
-- security toggles, accent colour, ...) lives in this one jsonb column, so a
-- new toggle does not need a migration of its own.
--
-- Safe to re-run.
-- =====================================================================

alter table public.organizations
  add column if not exists "settings" jsonb not null default '{}'::jsonb;


-- ---------------------------------------------------------------------
-- Who may read and write it.
--
-- As of this migration `organizations` still carries the blanket
-- "Authenticated full access" policy (supabase-schema.sql), which already lets
-- every signed-in member read the row and an admin update it. Nothing is added
-- while that policy exists: a second permissive policy would change nothing,
-- and tightening the blanket one is a separate decision (the bootstrap and
-- branch-creation flows write this table).
--
-- Once that blanket policy is dropped, re-running this file installs the
-- narrow pair the settings page relies on:
--   * read:   members of the organisation -- the admin by its organizationId
--             claim, centre staff through their own branch;
--   * update: an organisation admin, on its own organisation only.
-- ---------------------------------------------------------------------
-- "Authenticated full access" let any signed-in account -- a student's
-- included -- read and rewrite every organisation. Its replacements below:
-- members read their own organisation; its admins update it. Organisations
-- are created by the service role, so there is no insert or delete policy.
drop policy if exists "Authenticated full access" on public.organizations;

do $$
begin
  if not exists (
    select 1 from pg_policies
     where schemaname = 'public' and tablename = 'organizations'
       and policyname = 'Authenticated full access'
  ) then
    drop policy if exists "Organization member read" on public.organizations;
    create policy "Organization member read" on public.organizations
      for select to authenticated
      using (
        id::text = public.jwt_org_id()
        or id::text = (select b."organizationId"::text from public.branches b
                        where b.id = public.jwt_branch_id())
      );

    drop policy if exists "Organization admin update own" on public.organizations;
    create policy "Organization admin update own" on public.organizations
      for update to authenticated
      using (public.is_org_admin() and id::text = public.jwt_org_id())
      with check (public.is_org_admin() and id::text = public.jwt_org_id());
  end if;
end $$;
