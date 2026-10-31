-- =====================================================================
-- Certificate orders move one way.
--
-- QA on the live site found an admin could approve an order at -50, and could
-- re-approve a rejected order while the same student had another standing,
-- giving that student two orders. The centre panel now only offers the next
-- step; this makes the database hold the same line.
--
--   PENDING   -> APPROVED | REJECTED
--   APPROVED  -> DISPATCHED | REJECTED
--   DISPATCHED, REJECTED: closed
--
-- Safe to re-run.
-- =====================================================================

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'certificate_orders_amount_check') then
    alter table public.certificate_orders
      add constraint certificate_orders_amount_check check (amount >= 0);
  end if;
end $$;

create or replace function public.guard_head_office_columns()
returns trigger language plpgsql as $$
begin
  if not public.is_org_admin() then
    if tg_table_name = 'support_tickets' then
      new.reply := old.reply;
      new.status := case when new.status = 'CLOSED' then 'CLOSED' else old.status end;
    elsif tg_table_name = 'certificate_orders' then
      new.status := old.status;
      new.amount := old.amount;
    end if;
  end if;

  if tg_table_name = 'certificate_orders' and new.status is distinct from old.status then
    if not (
      (old.status = 'PENDING'  and new.status in ('APPROVED', 'REJECTED')) or
      (old.status = 'APPROVED' and new.status in ('DISPATCHED', 'REJECTED'))
    ) then
      raise exception 'An order that is % cannot become %.', old.status, new.status
        using errcode = 'P0001';
    end if;
    if new.status = 'APPROVED' and coalesce(new.amount, 0) <= 0 then
      raise exception 'Set the order amount before approving it.' using errcode = 'P0001';
    end if;
  end if;

  new."updatedAt" := now();
  return new;
end $$;
