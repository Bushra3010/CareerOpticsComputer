-- 0034: fixes `add_ticket_message` misclassifying a staff requester's own
-- reply as a support reply. Forward migration, per CLAUDE.md rule 5 — 0032
-- is already applied.
--
-- A ticket's `requester_type` can be `staff` (a centre owner/manager raising
-- a ticket with head office). That same person almost always ALSO holds
-- `ticket.read` at their own centre — it is on the matrix for every
-- operational role. The original function checked "is this sender staff
-- with ticket access" BEFORE checking "is this sender the ticket's own
-- requester", so a requester replying to their own ticket was classified as
-- if support had responded: the status flipped to `waiting_on_requester`
-- (should be `waiting_on_support`) and `first_response_at` got stamped from
-- the requester's own message. Found live: probing a centre owner's ticket
-- and replying as that same owner reproduced it immediately.
--
-- Fix: check "is this sender the requester" first. Only someone who is NOT
-- the requester and holds staff-side ticket access is treated as support.

create or replace function public.add_ticket_message(
  p_ticket_id uuid,
  p_body text,
  p_is_internal boolean default false
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
begin
  select * into v_ticket from public.tickets where id = p_ticket_id for update;
  if v_ticket.id is null then raise exception 'Ticket not found' using errcode = 'no_data_found'; end if;
  if coalesce(btrim(p_body), '') = '' then
    raise exception 'A message needs a body' using errcode = 'invalid_parameter_value';
  end if;

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

  insert into public.ticket_messages (ticket_id, sender_type, sender_id, body, is_internal)
  values (p_ticket_id, v_sender_type, v_sender_id, p_body, p_is_internal)
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

grant execute on function public.add_ticket_message(uuid, text, boolean) to authenticated;
revoke all on function public.add_ticket_message(uuid, text, boolean) from public, anon;
