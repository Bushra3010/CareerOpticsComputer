-- =====================================================================
-- A ticket's conversation, one message per row.
--
-- support_tickets has a single `reply` column, so every answer from the head
-- office overwrote the one before it and a centre had no way to answer back.
-- Messages now live here, oldest first, and are never edited: there is no
-- update or delete policy, so the history is what was said. Deleting the
-- ticket still takes its messages with it.
--
-- `support_tickets.reply` is kept as the latest head-office message so that
-- anything still reading it (older builds, reports) keeps working.
--
-- Depends on centre-panel.sql (support_tickets, can_touch_branch) and on
-- is_org_admin() / is_branch_staff(). Safe to re-run.
-- =====================================================================

create table if not exists public.support_ticket_replies (
  id          text primary key default gen_random_uuid()::text,
  "ticketId"  text not null references public.support_tickets(id) on delete cascade,
  "branchId"  text not null references public.branches(id) on delete cascade,
  author      text not null check (author in ('HEAD_OFFICE', 'CENTRE')),
  message     text not null check (length(btrim(message)) > 0),
  "createdBy" text default auth.uid()::text,
  "createdAt" timestamptz not null default now()
);
create index if not exists support_ticket_replies_ticket_idx
  on public.support_ticket_replies ("ticketId", "createdAt");

-- ---------------------------------------------------------------------
-- Who wrote it is decided here, not by the client. The branch comes from the
-- ticket so a message cannot be filed against a branch it was not raised by,
-- and the author comes from the caller's role so a centre cannot sign itself
-- as the head office. The insert policy below checks the result again.
--
-- A caller with no auth.uid() (the SQL editor, the service role) is trusted
-- as-is, which is what lets the backfill at the bottom keep its authors.
-- ---------------------------------------------------------------------
create or replace function public.stamp_support_ticket_reply()
returns trigger language plpgsql as $$
declare
  v_branch text;
  v_status text;
begin
  select t."branchId", t.status into v_branch, v_status
    from public.support_tickets t where t.id = new."ticketId";
  if v_branch is null then
    raise exception 'Ticket % not found', new."ticketId" using errcode = '23503';
  end if;
  new."branchId" := v_branch;

  if auth.uid() is not null then
    new."createdBy" := auth.uid()::text;
    new."createdAt" := now();
    new.author := case when public.is_org_admin() then 'HEAD_OFFICE' else 'CENTRE' end;
    -- A closed ticket is finished from the centre's side; it raises a new one.
    if new.author = 'CENTRE' and v_status = 'CLOSED' then
      raise exception 'This ticket is closed. Raise a new ticket instead.' using errcode = '42501';
    end if;
  end if;
  return new;
end $$;

drop trigger if exists support_ticket_replies_stamp on public.support_ticket_replies;
create trigger support_ticket_replies_stamp before insert on public.support_ticket_replies
  for each row execute function public.stamp_support_ticket_reply();

-- Mirror the newest head-office message onto the ticket. Runs as the caller:
-- only an org admin can post HEAD_OFFICE, and guard_head_office_columns lets
-- exactly that caller write `reply`. Skipped for callers with no auth.uid() so
-- the backfill does not touch the tickets it copies from.
create or replace function public.mirror_support_ticket_reply()
returns trigger language plpgsql as $$
begin
  if new.author = 'HEAD_OFFICE' and auth.uid() is not null then
    update public.support_tickets set reply = new.message where id = new."ticketId";
  end if;
  return new;
end $$;

drop trigger if exists support_ticket_replies_mirror on public.support_ticket_replies;
create trigger support_ticket_replies_mirror after insert on public.support_ticket_replies
  for each row execute function public.mirror_support_ticket_reply();

-- ---------------------------------------------------------------------
-- Access mirrors support_tickets for reading. Writing is insert-only, and
-- each side may only post as itself.
-- ---------------------------------------------------------------------
alter table public.support_ticket_replies enable row level security;

drop policy if exists "Centre or admin reads replies" on public.support_ticket_replies;
create policy "Centre or admin reads replies" on public.support_ticket_replies
  for select to authenticated
  using (public.can_touch_branch("branchId"));

drop policy if exists "Head office or centre posts replies" on public.support_ticket_replies;
create policy "Head office or centre posts replies" on public.support_ticket_replies
  for insert to authenticated
  with check (
    (author = 'HEAD_OFFICE' and public.is_org_admin() and public.can_touch_branch("branchId"))
    or (author = 'CENTRE' and public.is_branch_staff("branchId"))
  );

-- ---------------------------------------------------------------------
-- Backfill: the one reply each ticket could hold becomes the first message
-- of its thread, dated when the ticket was last touched. Only tickets that
-- have no thread yet, so re-running adds nothing.
-- ---------------------------------------------------------------------
insert into public.support_ticket_replies ("ticketId", "branchId", author, message, "createdBy", "createdAt")
select t.id, t."branchId", 'HEAD_OFFICE', t.reply, null, t."updatedAt"
  from public.support_tickets t
 where t.reply is not null
   and length(btrim(t.reply)) > 0
   and not exists (select 1 from public.support_ticket_replies r where r."ticketId" = t.id);

select policyname, cmd from pg_policies
 where schemaname = 'public' and tablename = 'support_ticket_replies'
 order by 1;
