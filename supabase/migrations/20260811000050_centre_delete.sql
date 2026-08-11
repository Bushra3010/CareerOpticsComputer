-- ============================================================================
-- 0050 — Allow a platform admin to delete an empty centre
--
-- `centres` has RLS enabled and forced with no DELETE policy, so every delete
-- is currently denied — including to a platform super admin. That is a safe
-- default and mostly the right one: a centre with students, payments or issued
-- certificates must never be removable, because PRD §4 makes those ledgers
-- insert-only and §19.9 requires financial history to survive.
--
-- But it also left no way to remove a centre created by mistake, and "closed"
-- is not the same thing: a closed centre is a real centre that stopped
-- trading, and it stays in every list and report as one.
--
-- So the delete is permitted, and the guard is left where it already works.
-- Twenty-one of the twenty-two foreign keys pointing at `centres` are NO
-- ACTION, so Postgres itself refuses to delete a centre that has any dependent
-- row and raises 23503. The application turns that into a readable message
-- rather than trying to reimplement the check and drifting from it.
--
-- Platform admin only. A centre owner with `centre.update` can edit and close
-- their own centre; they cannot delete it.
-- ============================================================================

create policy centres_delete_platform on public.centres
  for delete to authenticated
  using (app.is_platform_admin());

comment on policy centres_delete_platform on public.centres is
  'Platform admins only. Dependent-row protection comes from the restricting foreign keys, which raise 23503.';
