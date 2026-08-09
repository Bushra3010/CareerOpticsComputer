-- 0037: in-app notifications — PRD §3 scopes V1 to in-app only (no email,
-- no SMS), and the centre shell's bell has linked to /notifications since
-- Phase 1 without anything behind it.
--
-- The PRD never enumerates WHICH events notify. The V1 set below is chosen
-- and recorded as C12 in docs/02-open-conflicts.md rather than silently
-- decided: ticket replies (each side hears the other), ticket assignment
-- (the assignee hears), order despatch/delivery/cancellation (the person
-- who placed the order hears), and result publication (the student hears).
-- Everything else — exam scheduling, fee due dates, wallet movements — is
-- additive later: one more `app.notify(...)` call from a trigger or
-- function, no schema change.
--
-- A recipient is a signed-in identity, which this system has two of: a
-- staff `auth.users` id, or a `students` row (students may exist before
-- they ever get a login, and their notifications should be waiting when
-- the login arrives — so the student id, not the user id, is the key).
-- Exactly one of the two is set, enforced by a check.

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  recipient_user_id uuid,
  recipient_student_id uuid references public.students (id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  href text,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  constraint notifications_exactly_one_recipient check (
    (recipient_user_id is not null)::int + (recipient_student_id is not null)::int = 1
  )
);

create index notifications_user_idx
  on public.notifications (recipient_user_id, created_at desc)
  where recipient_user_id is not null;
create index notifications_student_idx
  on public.notifications (recipient_student_id, created_at desc)
  where recipient_student_id is not null;

alter table public.notifications enable row level security;
alter table public.notifications force row level security;

-- Own rows only. There is deliberately no admin/manage read: a notification
-- is a private inbox item, not organisational data, and nothing in the PRD
-- asks for staff to read each other's.
create policy notifications_select on public.notifications
  for select to authenticated
  using (
    recipient_user_id = auth.uid()
    or (recipient_student_id is not null
        and recipient_student_id = app.current_student_id())
  );

-- Writes only through the functions below — marking read is the single
-- mutation a recipient may make, and creation is the system's job.
revoke insert, update, delete on public.notifications from authenticated;

-- Internal writer. No permission check on purpose: callable only from
-- triggers and SECURITY DEFINER functions that have already decided the
-- event is real, the same trust shape as app.credit_wallet_for_commission.
create function app.notify(
  p_organization_id uuid,
  p_recipient_user_id uuid,
  p_recipient_student_id uuid,
  p_type text,
  p_title text,
  p_body text default null,
  p_href text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- A missing recipient is a caller bug, but one that must never break the
  -- business action that triggered it (a reply must not fail because the
  -- ticket has no assignee yet), so it is a silent no-op, not an error.
  if p_recipient_user_id is null and p_recipient_student_id is null then
    return;
  end if;
  insert into public.notifications
    (organization_id, recipient_user_id, recipient_student_id, type, title, body, href)
  values
    (p_organization_id, p_recipient_user_id, p_recipient_student_id, p_type, p_title, p_body, p_href);
end;
$$;

revoke all on function app.notify(uuid, uuid, uuid, text, text, text, text)
  from public, anon, authenticated;

create function public.mark_notification_read(p_notification_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.notifications
  set read_at = coalesce(read_at, now())
  where id = p_notification_id
    and (recipient_user_id = auth.uid()
         or (recipient_student_id is not null
             and recipient_student_id = app.current_student_id()));
  -- Someone else's id simply matches zero rows — no error, no information.
end;
$$;

create function public.mark_all_notifications_read()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.notifications
  set read_at = now()
  where read_at is null
    and (recipient_user_id = auth.uid()
         or (recipient_student_id is not null
             and recipient_student_id = app.current_student_id()));
end;
$$;

grant execute on function public.mark_notification_read(uuid) to authenticated;
grant execute on function public.mark_all_notifications_read() to authenticated;
revoke all on function public.mark_notification_read(uuid) from public, anon;
revoke all on function public.mark_all_notifications_read() from public, anon;

-- Event wiring -----------------------------------------------------------

-- A public ticket reply notifies the side that did NOT write it. The
-- requester may be a staff user or a student; the "support side" recipient
-- is the assignee if one exists (head office browsing /admin/tickets is
-- its own inbox, so an unassigned ticket notifies nobody on that side).
create function app.notify_ticket_reply()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_ticket public.tickets%rowtype;
  v_is_requester boolean;
begin
  if new.is_internal then
    return new;
  end if;

  select * into v_ticket from public.tickets where id = new.ticket_id;

  v_is_requester := (new.sender_type = v_ticket.requester_type
                     and new.sender_id = v_ticket.requester_id);

  if v_is_requester then
    perform app.notify(
      v_ticket.organization_id, v_ticket.assignee_id, null,
      'ticket_reply',
      'New reply on ' || v_ticket.number,
      left(new.body, 140),
      '/admin/tickets/' || v_ticket.id
    );
  elsif v_ticket.requester_type = 'student' then
    perform app.notify(
      v_ticket.organization_id, null, v_ticket.requester_id,
      'ticket_reply',
      'Support replied on ' || v_ticket.number,
      left(new.body, 140),
      '/student/support/' || v_ticket.id
    );
  else
    perform app.notify(
      v_ticket.organization_id, v_ticket.requester_id, null,
      'ticket_reply',
      'Support replied on ' || v_ticket.number,
      left(new.body, 140),
      '/centre/support/' || v_ticket.id
    );
  end if;

  return new;
end;
$$;

create trigger notify_ticket_reply
  after insert on public.ticket_messages
  for each row execute function app.notify_ticket_reply();

create function app.notify_ticket_assigned()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.assignee_id is not null
     and new.assignee_id is distinct from old.assignee_id then
    perform app.notify(
      new.organization_id, new.assignee_id, null,
      'ticket_assigned',
      new.number || ' assigned to you',
      new.subject,
      '/admin/tickets/' || new.id
    );
  end if;
  return new;
end;
$$;

create trigger notify_ticket_assigned
  after update on public.tickets
  for each row execute function app.notify_ticket_assigned();

-- The order's creator hears about fulfilment movements. `created_by` is the
-- signed-in staff member who checked out — the natural recipient, since a
-- centre has no single inbox of its own.
create function app.notify_order_movement()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status is distinct from old.status
     and new.status in ('dispatched', 'delivered', 'cancelled') then
    perform app.notify(
      new.organization_id, new.created_by, null,
      'order_' || new.status,
      'Order ' || new.order_number || ' ' || new.status,
      null,
      '/centre/orders'
    );
  end if;
  return new;
end;
$$;

create trigger notify_order_movement
  after update on public.orders
  for each row execute function app.notify_order_movement();

-- Result rows are inserted exactly once, at publication (0015's
-- immutability makes the insert the publication event). The student is
-- reached through the enrolment. Links to the dashboard, which already
-- shows results — /student/results arrives with the student-portal slice.
create function app.notify_result_published()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
  v_org uuid;
begin
  select e.student_id, e.organization_id into v_student_id, v_org
  from public.enrolments e
  where e.id = new.enrolment_id;

  perform app.notify(
    v_org, null, v_student_id,
    'result_published',
    'Your result has been published',
    null,
    '/student'
  );
  return new;
end;
$$;

create trigger notify_result_published
  after insert on public.student_results
  for each row execute function app.notify_result_published();
