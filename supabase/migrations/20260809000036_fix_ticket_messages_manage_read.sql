-- 0036: `ticket_messages_select` (migration 0032) omitted the
-- `ticket.manage` arm that every sibling policy has. Forward migration,
-- per CLAUDE.md rule 5 — 0032 is applied.
--
-- `tickets_select`, `support_files_read` and `support_files_write` all say
-- "…or app.has_permission('ticket.manage', organization_id)…" so a
-- head-office support agent can list tickets, read attachments, and (via
-- `add_ticket_message`'s own check) reply. The public-messages policy alone
-- forgot that arm — leaving a `ticket.manage` holder who is not a platform
-- admin able to see a ticket, its attachments and its INTERNAL notes
-- (`ticket_messages_select_internal` checks `ticket.internal_note`, which
-- support agents also hold) while the requester's actual messages came back
-- empty. Caught by the integration suite's R17 test on its first live run:
-- the head-office actor's thread contained one internal note and nothing
-- else.

drop policy ticket_messages_select on public.ticket_messages;
create policy ticket_messages_select on public.ticket_messages
  for select to authenticated
  using (
    not is_internal
    and exists (
      select 1 from public.tickets t
      where t.id = ticket_id
        and (
          app.is_platform_admin()
          or app.has_permission('ticket.manage', t.organization_id)
          or (app.has_permission('ticket.read', t.organization_id, t.centre_id) and app.can_access_centre(t.centre_id))
          or (t.requester_type = 'student' and t.requester_id = app.current_student_id())
          or t.assignee_id = auth.uid()
        )
    )
  );
