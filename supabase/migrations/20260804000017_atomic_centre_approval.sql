-- 0017: make centre approval atomic and idempotent.
--
-- approveCentreApplication was seven sequential Supabase calls, each its own
-- transaction, in this order: read application, count centres, INSERT CENTRE,
-- invite the owner, insert profile, insert membership, update the application,
-- insert the review row.
--
-- Three defects followed from that, and the first was observed in practice
-- during the original feature verification — the invite failed because the
-- test used a reserved domain, and the run left a live centre behind while the
-- application still read "submitted". At the time that was recorded as safe
-- partial-failure handling. It is not: it is an orphan.
--
--   1. The centre is created before the invite, so any later failure leaves an
--      active centre with no owner and an application that still looks
--      unreviewed. Approving again then creates a SECOND centre.
--   2. The profile and membership inserts discard their results, so approval
--      could report success having created a centre whose owner has no
--      membership and therefore cannot sign in to it.
--   3. The centre code came from count(*) + 1 — two approvals racing produce
--      the same code, and the unique index turns that into a failed approval
--      rather than a correct one.
--
-- Everything below happens in one function, so it is one transaction: either
-- the centre, the membership, the application status and the review row all
-- exist, or none of them do. Creating the owner's auth user cannot join that
-- transaction, so the caller does it first — see the action. An unused auth
-- user is harmless and reusable; an orphan centre is not.

create or replace function public.approve_centre_application(
  p_application_id uuid,
  p_owner_user_id uuid,
  p_reviewer_id uuid,
  p_comments text
)
returns table (centre_id uuid, centre_code text, already_approved boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_app public.centre_applications;
  v_code text;
  v_centre uuid;
  v_role uuid;
  v_state text;
begin
  -- Lock the application row: two reviewers clicking Approve at the same
  -- moment now serialise here, and the second sees status='approved'.
  select * into v_app
  from public.centre_applications
  where id = p_application_id
  for update;

  if not found then
    raise exception 'Application not found';
  end if;

  if auth.role() <> 'service_role' and not app.is_platform_admin() then
    raise exception 'Not permitted to approve centre applications';
  end if;

  -- Idempotent: a retry after a partial failure, or a double click, returns
  -- the centre that already exists instead of creating another one.
  if v_app.status = 'approved' then
    select c.id, c.code into v_centre, v_code
    from public.centres c where c.id = v_app.centre_id;
    return query select v_centre, v_code, true;
    return;
  end if;

  if v_app.status = 'rejected' then
    raise exception 'This application was rejected and cannot be approved';
  end if;

  select r.id into v_role
  from public.roles r
  where r.organization_id = v_app.organization_id and r.code = 'centre_owner';

  -- Checked before anything is written: without this role the owner would get
  -- a centre they cannot administer, which is worse than a failed approval.
  if v_role is null then
    raise exception 'The centre_owner role is not seeded for this organization';
  end if;

  -- Centre code from the same atomic sequence the rest of the system uses,
  -- not count(*) + 1. Keyed per state so codes stay CO-DL01, CO-DL02, …
  v_state := upper(substring(regexp_replace(v_app.state, '[^A-Za-z]', '', 'g') from 1 for 2));
  if length(v_state) < 2 then
    raise exception 'Application state is not a usable centre-code prefix';
  end if;

  v_code := 'CO-' || v_state || lpad(
    app.next_document_number(v_app.organization_id, null, 'centre_code', v_state)::text, 2, '0');

  insert into public.centres (
    organization_id, code, name, city, state, pincode, address, status
  )
  values (
    v_app.organization_id, v_code, v_app.proposed_centre_name,
    v_app.city, v_app.state, v_app.pincode, v_app.address, 'active'
  )
  returning id into v_centre;

  -- The auth user already exists (the caller created or found it). A profile
  -- may already exist if this is a retry.
  insert into public.profiles (id, full_name)
  values (p_owner_user_id, v_app.applicant_name)
  on conflict (id) do nothing;

  insert into public.memberships (
    user_id, organization_id, centre_id, role_id, status
  )
  values (p_owner_user_id, v_app.organization_id, v_centre, v_role, 'active');

  update public.centre_applications
  set status = 'approved',
      reviewed_by = p_reviewer_id,
      reviewed_at = now(),
      centre_id = v_centre
  where id = p_application_id;

  insert into public.centre_application_reviews (
    application_id, reviewer_id, action, comments
  )
  values (p_application_id, p_reviewer_id, 'approved', nullif(p_comments, ''));

  return query select v_centre, v_code, false;
end;
$$;

grant execute on function public.approve_centre_application(uuid, uuid, uuid, text)
  to authenticated, service_role;
revoke execute on function public.approve_centre_application(uuid, uuid, uuid, text)
  from anon, public;

-- Rejection had no status guard: an already-approved application could be
-- flipped to rejected while its centre stayed live and its owner kept access.
create or replace function public.reject_centre_application(
  p_application_id uuid,
  p_reviewer_id uuid,
  p_reason text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_status public.centre_application_status;
begin
  if coalesce(trim(p_reason), '') = '' then
    raise exception 'A reason is required to reject an application';
  end if;

  select status into v_status
  from public.centre_applications
  where id = p_application_id
  for update;

  if not found then
    raise exception 'Application not found';
  end if;

  if auth.role() <> 'service_role' and not app.is_platform_admin() then
    raise exception 'Not permitted to reject centre applications';
  end if;

  if v_status = 'approved' then
    raise exception 'This application is already approved; suspend the centre instead';
  end if;

  update public.centre_applications
  set status = 'rejected', reviewed_by = p_reviewer_id, reviewed_at = now()
  where id = p_application_id;

  insert into public.centre_application_reviews (
    application_id, reviewer_id, action, comments
  )
  values (p_application_id, p_reviewer_id, 'rejected', p_reason);
end;
$$;

grant execute on function public.reject_centre_application(uuid, uuid, text)
  to authenticated, service_role;
revoke execute on function public.reject_centre_application(uuid, uuid, text)
  from anon, public;
