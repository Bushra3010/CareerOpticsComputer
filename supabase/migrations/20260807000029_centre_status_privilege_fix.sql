-- 0029: closes a privilege-escalation hole in centres_update, and gives head
-- office the lifecycle control PRD §19.3 requires but nothing could reach.
--
-- `centres_update` let anyone holding `centre.update` AT a centre write ANY
-- column on that row — status included. `centre_owner` holds `centre.update`
-- so they can edit their own centre's profile. Combined, that meant a
-- suspended centre's own owner could clear the suspension themselves.
--
-- Reproduced live before writing this fix, not assumed: head office suspended
-- a seeded centre via the service role; its own owner then issued
--   PATCH /centres?id=eq.<id>  { "status": "active" }
-- and RLS raised no objection — the row updated, no error, no audit gap even
-- (the trigger logged it faithfully), just nothing had stopped it.
--
-- Fixed the way R19 fixed the answer key: split by privilege, not by policy.
-- `centre.update` keeps editing a centre's profile fields. `status` is
-- removed from that grant entirely — only `set_centre_status()`, gated on
-- head-office authority, can move it.

revoke update on public.centres from authenticated;
grant update (name, address, city, state, pincode) on public.centres to authenticated;

create function public.set_centre_status(
  p_centre_id uuid,
  p_status public.centre_status,
  p_reason text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_org uuid;
  v_current public.centre_status;
begin
  select organization_id, status into v_org, v_current
  from public.centres where id = p_centre_id;

  if v_org is null then
    raise exception 'Centre not found' using errcode = 'no_data_found';
  end if;

  -- Deliberately NOT centre.update. That permission is what a centre_owner
  -- holds to edit their own profile, and letting it also move status is
  -- exactly the hole this migration closes. Lifecycle changes are head
  -- office's alone, via the organisation-level centre.manage.
  if not (app.is_platform_admin() or app.has_permission('centre.manage', v_org)) then
    raise exception 'Not authorised to change a centre''s status'
      using errcode = 'insufficient_privilege';
  end if;

  if coalesce(btrim(p_reason), '') = '' then
    raise exception 'A reason is required' using errcode = 'invalid_parameter_value';
  end if;

  if p_status = v_current then
    raise exception 'The centre is already %', p_status
      using errcode = 'invalid_parameter_value';
  end if;

  update public.centres
  set status = p_status, updated_by = auth.uid()
  where id = p_centre_id;
end;
$$;

revoke all on function public.set_centre_status(uuid, public.centre_status, text)
  from public, anon;
grant execute on function public.set_centre_status(uuid, public.centre_status, text)
  to authenticated;

insert into public.permissions (code, description) values
  ('centre.manage', 'Suspend, reactivate or close a centre (head office)')
on conflict (code) do nothing;

-- ---------------------------------------------------------------------------
-- Certificate revocation. issued_documents has carried revoked_at/revoked_by/
-- revoked_reason columns since migration 0016 and nothing has ever written to
-- them — issue_certificate() exists, its mirror does not. Same shape, same
-- authority as issuing: platform admin, or certificate.revoke at the centre.
-- ---------------------------------------------------------------------------

create function public.revoke_certificate(
  p_document_number text,
  p_reason text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_org uuid;
  v_centre uuid;
  v_status public.document_status;
begin
  select organization_id, centre_id, status
    into v_org, v_centre, v_status
  from public.issued_documents
  where document_number = p_document_number;

  if v_org is null then
    raise exception 'Certificate not found' using errcode = 'no_data_found';
  end if;

  if not (app.is_platform_admin()
          or (app.has_permission('certificate.revoke', v_org, v_centre)
              and app.can_access_centre(v_centre))) then
    raise exception 'Not permitted to revoke certificates for this centre'
      using errcode = 'insufficient_privilege';
  end if;

  if v_status = 'revoked' then
    raise exception 'This certificate is already revoked'
      using errcode = 'invalid_parameter_value';
  end if;

  if coalesce(btrim(p_reason), '') = '' then
    raise exception 'A reason is required' using errcode = 'invalid_parameter_value';
  end if;

  update public.issued_documents
  set status = 'revoked',
      revoked_at = now(),
      revoked_by = auth.uid(),
      revoked_reason = p_reason
  where document_number = p_document_number;
end;
$$;

revoke all on function public.revoke_certificate(text, text) from public, anon;
grant execute on function public.revoke_certificate(text, text) to authenticated;

insert into public.permissions (code, description) values
  ('certificate.revoke', 'Revoke an issued certificate')
on conflict (code) do nothing;

-- ---------------------------------------------------------------------------
-- Leads and courses already have full RLS (courses_platform_write and
-- leads_platform_write both gate on app.is_platform_admin()), and no head-
-- office role beyond platform admin exists yet — the same posture migration
-- 0021 documented for question.manage. Nothing to add here; the UI built on
-- top of this migration talks to that RLS directly rather than through a
-- function, the same way the courses catalogue table always has.
-- ---------------------------------------------------------------------------
