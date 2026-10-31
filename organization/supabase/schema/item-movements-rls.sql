-- =====================================================================
-- item_movements was open to everyone, signed in or not: add-item-movement.sql
-- created "Allow public read/insert/update/delete" with no role, so a
-- logged-out visitor could read and rewrite every centre's dispatch log.
--
-- Now: the centre that owns a movement (branch_id) and its organisation's
-- admins read and write it; the centre on the other end (counterparty) may
-- read it. A movement with no branch belongs to the head office. Safe to re-run.
-- =====================================================================

alter table public.item_movements enable row level security;

drop policy if exists "Allow public read"   on public.item_movements;
drop policy if exists "Allow public insert" on public.item_movements;
drop policy if exists "Allow public update" on public.item_movements;
drop policy if exists "Allow public delete" on public.item_movements;
drop policy if exists "Item movements read"  on public.item_movements;
drop policy if exists "Item movements write" on public.item_movements;

create policy "Item movements read" on public.item_movements for select to authenticated
  using (
    (branch_id is not null and public.can_touch_branch(branch_id))
    or (counterparty_branch_id is not null and public.can_touch_branch(counterparty_branch_id))
    or (branch_id is null and public.is_org_admin())
  );

create policy "Item movements write" on public.item_movements for all to authenticated
  using (
    (branch_id is not null and public.can_touch_branch(branch_id))
    or (branch_id is null and public.is_org_admin())
  )
  with check (
    (branch_id is not null and public.can_touch_branch(branch_id))
    or (branch_id is null and public.is_org_admin())
  );

select policyname, roles, cmd from pg_policies
 where schemaname = 'public' and tablename = 'item_movements' order by 1;
