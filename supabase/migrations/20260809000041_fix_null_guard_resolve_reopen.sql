-- 0041: two authorisation guards defeated by SQL's three-valued logic.
-- Forward migration, per CLAUDE.md rule 5 — found by the seeded-role
-- integration suite, whose HO Operator (deliberately WITHOUT
-- `ticket.manage`) resolved a ticket and the test failed on the wrong
-- side.
--
-- The pattern: `if not (a or b or x = nullable) then raise`. When the
-- nullable side is NULL — an unassigned ticket's `assignee_id`, or
-- `current_student_id()` for a caller who is not a student — the equality
-- is NULL, the OR-chain is NULL, `not NULL` is NULL, and `if NULL` takes
-- the same branch as `if false`: the exception never raises.
--
-- Concretely, before this migration ANY authenticated user could:
--   - resolve any UNASSIGNED ticket (`resolve_ticket`, assignee arm), and
--   - reopen any resolved/closed STUDENT-raised ticket (`reopen_ticket`,
--     student arm — NULL only when the caller is not a student, i.e. for
--     exactly the callers the arm was meant to exclude).
--
-- RLS was not a backstop here: both functions are SECURITY DEFINER, which
-- is precisely why their own guards must never be null. Every other
-- `= auth.uid()` in the migrations is either inside an RLS policy (where
-- NULL simply fails to grant — safe) or assigned to a boolean variable
-- used as `elsif v_is_staff` (NULL skips the branch — safe); these two
-- `if not (...)` guards were audited as the only sites of the pattern.

create or replace function public.resolve_ticket(p_ticket_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_org uuid;
  v_assignee uuid;
begin
  select organization_id, assignee_id into v_org, v_assignee from public.tickets where id = p_ticket_id;
  if v_org is null then raise exception 'Ticket not found' using errcode = 'no_data_found'; end if;
  if not (
    app.is_platform_admin()
    or app.has_permission('ticket.manage', v_org)
    or (v_assignee is not null and v_assignee = auth.uid())
  ) then
    raise exception 'Not authorised to resolve this ticket' using errcode = 'insufficient_privilege';
  end if;
  update public.tickets set status = 'resolved', resolved_at = now() where id = p_ticket_id;
end;
$$;

create or replace function public.reopen_ticket(p_ticket_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_ticket public.tickets%rowtype;
  v_student uuid;
begin
  select * into v_ticket from public.tickets where id = p_ticket_id;
  if v_ticket.id is null then raise exception 'Ticket not found' using errcode = 'no_data_found'; end if;
  if v_ticket.status not in ('resolved', 'closed') then
    raise exception 'Only a resolved or closed ticket can be reopened' using errcode = 'invalid_parameter_value';
  end if;

  v_student := app.current_student_id();
  if not (
    app.is_platform_admin()
    or app.has_permission('ticket.manage', v_ticket.organization_id)
    or (app.has_permission('ticket.read', v_ticket.organization_id, v_ticket.centre_id) and app.can_access_centre(v_ticket.centre_id))
    or (v_ticket.requester_type = 'student' and v_student is not null and v_ticket.requester_id = v_student)
  ) then
    raise exception 'Not authorised to reopen this ticket' using errcode = 'insufficient_privilege';
  end if;

  update public.tickets set status = 'reopened' where id = p_ticket_id;
end;
$$;

grant execute on function public.resolve_ticket(uuid) to authenticated;
grant execute on function public.reopen_ticket(uuid) to authenticated;
revoke all on function public.resolve_ticket(uuid) from public, anon;
revoke all on function public.reopen_ticket(uuid) from public, anon;
