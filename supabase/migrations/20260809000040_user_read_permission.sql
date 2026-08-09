-- 0040: the `user.read` permission code that `memberships_select` has
-- referenced since Phase 1 — and that nothing ever created. The policy arm
-- `app.has_permission('user.read', organization_id, centre_id)` could not
-- possibly pass for anyone, so org-level membership rows were readable by
-- platform admins alone, and `profiles` (self-or-admin only) hid staff
-- names even where memberships were visible.
--
-- Surfaced by the assign-ticket picker: an HO Operator (matrix: `user.*`
-- read) could assign a ticket but not list anyone to assign it to.
--
-- The profiles arm is deliberately membership-scoped: "you may read the
-- profile of anyone who is a member of an organisation where you hold
-- user.read" — profiles itself has no organization_id to scope by, and an
-- unscoped grant would leak names across tenants the day there are two.

insert into public.permissions (code, description) values
  ('user.read', 'List an organisation''s user accounts and read their names')
on conflict (code) do nothing;

-- Matrix row `user.* / role.*`: HO Operator "read". Support Agent and
-- Finance Admin get "—" and are NOT granted; the assign picker degrades to
-- assign-to-self for them, which is what a support agent does anyway.
insert into public.role_permissions (role_id, permission_code)
select r.id, 'user.read'
from public.roles r
where r.code = 'ho_operator'
  and r.organization_id in (select id from public.organizations where slug = 'career-optics')
on conflict do nothing;

drop policy profiles_select_self on public.profiles;
create policy profiles_select_self on public.profiles
  for select to authenticated
  using (
    id = auth.uid()
    or app.is_platform_admin()
    or exists (
      select 1
      from public.memberships m
      where m.user_id = public.profiles.id
        and app.has_permission('user.read', m.organization_id)
    )
  );
