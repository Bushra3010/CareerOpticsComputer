-- 0020: an organisation-level permission check could be satisfied by a
-- centre-scoped grant.
--
-- `app.has_permission(perm, org, centre)` decides every RLS policy in the
-- system and every `authorize()` call in the server layer. Its membership
-- predicate, written in 0003 and unchanged since, was:
--
--   and (centre is null or m.centre_id is null or m.centre_id = centre)
--
-- Read the first disjunct carefully. When a caller asks the ORGANISATION-level
-- question — `has_permission('centre.create', org)` with no centre — `centre
-- is null` is true, the whole predicate short-circuits, and **every membership
-- row matches regardless of which centre it belongs to**. A user scoped to one
-- centre therefore answers "yes" to a question about authority across the whole
-- organisation.
--
-- Five applied policies ask that question:
--   centres_write_platform      centre.create
--   audit_logs_select           audit.read
--   system_settings_write       settings.update   (twice)
--   leads_select / leads_insert lead.read, lead.create
--
-- It has never been exploitable, and that is luck rather than design: none of
-- those five permission codes is granted to any role in `seed.sql` or in
-- migration 0018's centre-staff seeds — verified against the live database, the
-- `role_permissions` join returns nothing for all five. The bug is armed the
-- first time somebody does the obvious thing and grants `lead.read` to
-- counsellors, at which point every counsellor at every centre reads every
-- lead in the organisation and the policy still looks correct.
--
-- The fix distinguishes the two questions the one function is being asked:
--
--   centre IS NULL  -> "has this user org-wide authority?"  Requires a
--                      membership that is itself org-wide (centre_id is null).
--   centre GIVEN    -> "has this user authority at that centre?"  Satisfied by
--                      an org-wide membership (head office reaches every
--                      centre — that behaviour is deliberate and kept) or by a
--                      membership at exactly that centre.
--
-- Nothing in the application depends on the old behaviour: every `authorize()`
-- call site in `features/*/actions.ts` passes a real `context.centreId`, and
-- the five org-level policies above are unreachable without the ungranted
-- permissions. Found by an automated review of the exam designs that read the
-- repository rather than the prose; recorded as a confirmed finding in
-- docs/03-audit-findings.md.

create or replace function app.has_permission(perm text, org uuid, centre uuid default null)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.memberships m
    join public.role_permissions rp on rp.role_id = m.role_id
    where m.user_id = auth.uid()
      and m.organization_id = org
      and m.status = 'active'
      and rp.permission_code = perm
      and case
            when centre is null then m.centre_id is null
            else m.centre_id is null or m.centre_id = centre
          end
  );
$$;

-- The public wrapper from 0004 calls the app-schema function, so it inherits
-- the fix. Re-granted here only because `create or replace` on the inner
-- function does not touch the wrapper's grants, and being explicit is cheaper
-- than someone later wondering whether it needed re-granting.
grant execute on function app.has_permission(text, uuid, uuid) to authenticated;
