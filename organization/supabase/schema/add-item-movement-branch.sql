-- Which branch an item went to, or came from.
--
-- `item_movements.branch_id` says whose register the row is in -- who recorded
-- the movement -- and there was nothing at all for the branch at the other end.
-- A dispatch to the Kothrud centre and a dispatch to a courier looked the same
-- once filed, and the register could not be filtered by branch because no
-- column named one.
--
-- Nullable on purpose: plenty of movements are to and from people who are not
-- branches -- a vendor, a courier, a student -- and those stay in `party`.
--
-- Run once in the Supabase SQL editor. Safe to re-run. The application degrades
-- gracefully until it is: the register still reads and still saves, without the
-- branch.
alter table public.item_movements
  add column if not exists counterparty_branch_id text
  references public.branches(id) on delete set null;

create index if not exists "item_movements_counterparty_idx"
  on public.item_movements (counterparty_branch_id)
  where counterparty_branch_id is not null;

notify pgrst, 'reload schema';
