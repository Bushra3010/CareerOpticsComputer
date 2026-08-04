-- 0018: centre staff — the other four centre roles, and inviting people into
-- them.
--
-- Until now a centre had exactly one login, its owner. A real centre has a
-- counsellor taking admissions, faculty marking attendance, and an accountant
-- collecting fees, and none of them should be able to do each other's jobs.
--
-- The permission sets below are the centre-side columns of the build plan's
-- role matrix (§4), narrowed to the permissions that exist today. They are
-- deliberately restrictive rather than aspirational: a role gets a permission
-- when the feature it gates is built, so nobody holds a code that grants
-- nothing. Two of them encode explicit rules from the plan —
--   * a counsellor cannot post payments (proof test R13),
--   * faculty cannot see fees at all.
--
-- Permissions are seeded here, in the same migration as the feature that needs
-- them, rather than in a separate block that can be forgotten.

insert into public.permissions (code, description) values
  ('staff.read', 'See the people who work at this centre'),
  ('staff.invite', 'Invite a person into a role at this centre')
on conflict (code) do nothing;

insert into public.roles (organization_id, code, name, is_system_role)
select o.id, v.code, v.name, true
from public.organizations o
cross join (values
  ('centre_manager', 'Centre Manager'),
  ('counsellor',     'Counsellor'),
  ('faculty',        'Faculty'),
  ('accountant',     'Accountant')
) as v(code, name)
where o.slug = 'career-optics'
on conflict (organization_id, code) do nothing;

-- Owner also gains the staff permissions; the other roles never get them, so
-- only an owner can change who works at the centre.
insert into public.role_permissions (role_id, permission_code)
select r.id, v.code
from public.roles r
join public.organizations o
  on o.id = r.organization_id and o.slug = 'career-optics'
join (values
  ('centre_owner',   'staff.read'),
  ('centre_owner',   'staff.invite'),

  ('centre_manager', 'centre.read'),
  ('centre_manager', 'staff.read'),
  ('centre_manager', 'student.create'),
  ('centre_manager', 'student.read'),
  ('centre_manager', 'attendance.read'),
  ('centre_manager', 'attendance.create'),
  ('centre_manager', 'fee.read'),
  ('centre_manager', 'fee.manage'),
  ('centre_manager', 'payment.post'),
  ('centre_manager', 'result.read'),
  ('centre_manager', 'certificate.read'),

  -- Admissions-facing. No payment.post: build plan proof test R13 requires a
  -- counsellor posting a payment to be denied.
  ('counsellor',     'centre.read'),
  ('counsellor',     'student.create'),
  ('counsellor',     'student.read'),
  ('counsellor',     'attendance.read'),
  ('counsellor',     'fee.read'),

  -- Teaching only. No fee or certificate access of any kind.
  ('faculty',        'student.read'),
  ('faculty',        'attendance.read'),
  ('faculty',        'attendance.create'),
  ('faculty',        'result.read'),

  -- Money only. Cannot admit students or mark attendance.
  ('accountant',     'centre.read'),
  ('accountant',     'student.read'),
  ('accountant',     'fee.read'),
  ('accountant',     'fee.manage'),
  ('accountant',     'payment.post')
) as v(role_code, code) on v.role_code = r.code
on conflict do nothing;

-- Staff may see who else works at their centre. Migration 0002's
-- memberships_select already covers user.read holders and the row's own owner;
-- this adds the centre-scoped view the staff page needs.
create policy memberships_select_centre_staff on public.memberships
  for select to authenticated
  using (
    centre_id is not null
    and app.has_permission('staff.read', organization_id, centre_id)
    and app.can_access_centre(centre_id)
  );

create policy roles_select_all on public.roles
  for select to authenticated
  using (true);

/**
 * Links an invited person to a role at a centre.
 *
 * The auth account is created by the caller through the Auth Admin API, which
 * cannot join this transaction — the same split as centre approval and student
 * invitations. Everything the database can do atomically happens here.
 */
create or replace function public.invite_centre_staff(
  p_centre_id uuid,
  p_user_id uuid,
  p_role_code text,
  p_full_name text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_org uuid;
  v_role uuid;
  v_membership uuid;
begin
  select organization_id into v_org from public.centres where id = p_centre_id;
  if v_org is null then
    raise exception 'Centre not found';
  end if;

  if auth.role() <> 'service_role'
     and not (app.is_platform_admin()
              or (app.has_permission('staff.invite', v_org, p_centre_id)
                  and app.can_access_centre(p_centre_id))) then
    raise exception 'Not permitted to invite staff to this centre';
  end if;

  -- A centre owner must not be able to mint another owner, or an arbitrary
  -- head-office role, by passing a different code. Platform admins may.
  if p_role_code = 'centre_owner' and not app.is_platform_admin()
     and auth.role() <> 'service_role' then
    raise exception 'Only head office can appoint a centre owner';
  end if;

  select id into v_role
  from public.roles
  where organization_id = v_org and code = p_role_code and is_system_role;

  if v_role is null then
    raise exception 'Unknown role: %', p_role_code;
  end if;

  insert into public.profiles (id, full_name)
  values (p_user_id, p_full_name)
  on conflict (id) do nothing;

  -- Re-inviting someone who already holds this role at this centre reactivates
  -- them rather than failing, so an invite can be safely retried.
  insert into public.memberships (
    user_id, organization_id, centre_id, role_id, status
  )
  values (p_user_id, v_org, p_centre_id, v_role, 'active')
  on conflict (user_id, organization_id, coalesce(centre_id, '00000000-0000-0000-0000-000000000000'::uuid), role_id)
  do update set status = 'active'
  returning id into v_membership;

  return v_membership;
end;
$$;

grant execute on function public.invite_centre_staff(uuid, uuid, text, text)
  to authenticated, service_role;
revoke execute on function public.invite_centre_staff(uuid, uuid, text, text)
  from anon, public;

/**
 * Suspends or restores a colleague. Suspension is what actually removes
 * access — every RLS helper checks `status = 'active'` — so this is deletion
 * in effect while keeping the audit trail of who once had access.
 */
create or replace function public.set_membership_status(
  p_membership_id uuid,
  p_status public.membership_status
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_org uuid;
  v_centre uuid;
  v_user uuid;
begin
  select organization_id, centre_id, user_id
    into v_org, v_centre, v_user
  from public.memberships where id = p_membership_id;

  if v_org is null then
    raise exception 'Membership not found';
  end if;

  if auth.role() <> 'service_role'
     and not (app.is_platform_admin()
              or (app.has_permission('staff.invite', v_org, v_centre)
                  and app.can_access_centre(v_centre))) then
    raise exception 'Not permitted to change staff access at this centre';
  end if;

  -- Suspending yourself would lock the centre's only owner out of its own
  -- staff page, with no one able to restore them.
  if v_user = auth.uid() then
    raise exception 'You cannot change your own access';
  end if;

  update public.memberships set status = p_status where id = p_membership_id;
end;
$$;

grant execute on function public.set_membership_status(uuid, public.membership_status)
  to authenticated, service_role;
revoke execute on function public.set_membership_status(uuid, public.membership_status)
  from anon, public;
