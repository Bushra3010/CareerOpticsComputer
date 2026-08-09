-- 0038: `add_ticket_message` learns to carry attachments. Migration 0032
-- built the whole storage side — the `support-private` bucket, both RLS
-- policies keyed on the ticket id in the path, and the
-- `ticket_messages.attachments` column — and then no function ever wrote
-- to the column. Forward migration, per CLAUDE.md rule 5.
--
-- Attachments ride replies, not the opening message, on purpose: a file's
-- storage path starts with the ticket id (that is what the RLS policies
-- key on), so nothing can be uploaded before the ticket exists. The raise
-- form says so instead of pretending otherwise.
--
-- The old 3-argument overload is DROPPED rather than kept alongside —
-- PostgREST refuses to call a function whose name has ambiguous
-- overloads, so the default on the new parameter is what preserves every
-- existing caller.

drop function public.add_ticket_message(uuid, text, boolean);

create function public.add_ticket_message(
  p_ticket_id uuid,
  p_body text,
  p_is_internal boolean default false,
  p_attachments text[] default '{}'
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_ticket public.tickets%rowtype;
  v_student uuid;
  v_sender_type public.ticket_requester_type;
  v_sender_id uuid;
  v_message_id uuid;
  v_is_requester boolean;
  v_is_staff boolean;
  v_path text;
begin
  select * into v_ticket from public.tickets where id = p_ticket_id for update;
  if v_ticket.id is null then raise exception 'Ticket not found' using errcode = 'no_data_found'; end if;
  if coalesce(btrim(p_body), '') = '' then
    raise exception 'A message needs a body' using errcode = 'invalid_parameter_value';
  end if;

  -- Every attachment must live under THIS ticket's prefix. The storage
  -- policies already stop a cross-ticket upload; this stops a message row
  -- from *referencing* a file the reader's storage policy would then refuse
  -- to sign, or a file on someone else's ticket the sender happens to know
  -- the path of.
  foreach v_path in array p_attachments loop
    if v_path not like p_ticket_id::text || '/%' then
      raise exception 'Attachment path does not belong to this ticket' using errcode = 'invalid_parameter_value';
    end if;
  end loop;

  v_student := app.current_student_id();
  v_is_requester := (v_ticket.requester_type = 'staff' and v_ticket.requester_id = auth.uid())
    or (v_ticket.requester_type = 'student' and v_student is not null and v_ticket.requester_id = v_student);
  v_is_staff := app.is_platform_admin()
    or app.has_permission('ticket.manage', v_ticket.organization_id)
    or (app.has_permission('ticket.read', v_ticket.organization_id, v_ticket.centre_id) and app.can_access_centre(v_ticket.centre_id))
    or v_ticket.assignee_id = auth.uid();

  if p_is_internal then
    if not (app.is_platform_admin() or app.has_permission('ticket.internal_note', v_ticket.organization_id)) then
      raise exception 'Not authorised to add an internal note' using errcode = 'insufficient_privilege';
    end if;
    v_sender_type := 'staff';
    v_sender_id := auth.uid();
  elsif v_is_requester then
    v_sender_type := v_ticket.requester_type;
    v_sender_id := v_ticket.requester_id;
  elsif v_is_staff then
    v_sender_type := 'staff';
    v_sender_id := auth.uid();
  else
    raise exception 'Not authorised to reply on this ticket' using errcode = 'insufficient_privilege';
  end if;

  insert into public.ticket_messages (ticket_id, sender_type, sender_id, body, is_internal, attachments)
  values (p_ticket_id, v_sender_type, v_sender_id, p_body, p_is_internal, p_attachments)
  returning id into v_message_id;

  if not p_is_internal then
    if not v_is_requester and v_ticket.status in ('open', 'assigned', 'waiting_on_support') then
      update public.tickets
      set status = 'waiting_on_requester',
          first_response_at = coalesce(first_response_at, now())
      where id = p_ticket_id;
    elsif v_is_requester and v_ticket.status = 'waiting_on_requester' then
      update public.tickets set status = 'waiting_on_support' where id = p_ticket_id;
    end if;
  end if;

  return v_message_id;
end;
$$;

grant execute on function public.add_ticket_message(uuid, text, boolean, text[]) to authenticated;
revoke all on function public.add_ticket_message(uuid, text, boolean, text[]) from public, anon;
