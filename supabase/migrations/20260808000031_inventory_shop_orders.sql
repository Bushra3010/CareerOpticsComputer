-- 0031: inventory, shop and orders — Phase 5 (PRD §17), build plan migration
-- `0011_inventory_referrals_support` minus referrals/support, which are a
-- separate slice.
--
-- WHAT THIS ACTUALLY MODELS (PRD §6.9, §7.10, §10.6): this is head-office to
-- CENTRE ordering of academy consumables (books, ID cards, certificate
-- stationery, uniforms, marketing material) — not a student storefront and
-- not the centre's own IT-hardware asset register. There is deliberately no
-- public or student route for it (build plan §2 names none), which is why
-- every table here carries `organization_id` and orders carry `centre_id`,
-- never a student.
--
-- Three interpretive gaps in the source documents, resolved here and recorded
-- so a later reader does not mistake a decision for an oversight:
--
--  1. PRD §10.6 lists a bare "payment" field on `orders` with no enum ever
--     defined, unlike order status which IS a stated sequence. Read literally,
--     the order-status enum (`pending_payment` -> ... ) already carries the
--     payment question — a separate payment_status column would just restate
--     `status = 'pending_payment'`. No such column is added.
--
--  2. No payment gateway exists yet (the same fact migration 0028 recorded
--     for the wallet). PRD §6.9 step 3 allows "payment/wallet authorisation"
--     as alternatives; only the wallet half is buildable today, so `pay_order`
--     below authorises via `debit_wallet` exclusively. Cash/gateway payment is
--     future work, not a silent limitation — noted in docs/02-open-conflicts.md.
--
--  3. The matrix's `product.*` / `inventory.*` notation is compressed the same
--     way `exam.*` was for exams: it is not a literal stored code. Concrete
--     codes are `product.read`, `product.manage`, `inventory.read`,
--     `inventory.manage`. `order.create` and `order.dispatch` ARE printed
--     verbatim in the build plan and are used as-is; `order.read` is minted
--     because nothing can be listed or dispatched without it, exactly the
--     reasoning migration 0023 used to grant `exam.read` to centre roles.
--
-- STOCK NEVER GOES NEGATIVE — the build plan says so explicitly ("mirrors the
-- wallet pattern: insert-only, `balance_after`, check `balance_after >= 0`")
-- and PRD §13.3 requires alerting on "negative-stock attempts", which only
-- makes sense if the attempt is rejected rather than allowed. Every stock
-- movement, whatever its cause, goes through `app.record_inventory_entry`,
-- the one place that check lives — the same DRY reasoning as
-- `app.ensure_wallet_account` in 0028.
--
-- SCOPE LEFT OUT ON PURPOSE, because neither source document describes a
-- workflow for it: supplier/vendor tracking (PRD never names a supplier
-- entity), a discount mechanic on orders (unlike fees, which has one), an
-- order-value approval gate (unlike fees and wallet, which have one), and
-- partial dispatch / back-order (the build-plan phrase exists, the mechanics
-- do not). A `returned` order status exists in the enum because the PRD
-- states the sequence that way, but no workflow drives a transition into it —
-- the same kind of accepted, documented gap as `returned`'s sibling states in
-- the exam and certificate domains this session found and left alone rather
-- than inventing unspecified rules.

create type public.catalog_item_status as enum ('draft', 'active', 'retired');

create type public.order_status as enum (
  'pending_payment', 'confirmed', 'processing', 'packed',
  'dispatched', 'delivered', 'cancelled', 'returned'
);

-- The closed set PRD §7.10 actually names: "opening stock, purchase receipt,
-- reservation, dispatch, return and adjustment". `dispatch` is kept even
-- though nothing inserts it yet (stock leaves the ledger at `reservation`,
-- not a second time at physical dispatch — modelling on-hand vs. reserved
-- stock separately is exactly the back-order/partial-dispatch machinery this
-- pass leaves out) so the category exists the day that distinction is built.
create type public.inventory_entry_reason as enum (
  'opening_stock', 'purchase_receipt', 'reservation', 'dispatch', 'return', 'adjustment'
);

-- Catalogue ------------------------------------------------------------------

create table public.product_categories (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  name text not null,
  code text not null,
  status public.catalog_item_status not null default 'active',
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid
);

create unique index product_categories_org_code_idx
  on public.product_categories (organization_id, code);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  category_id uuid references public.product_categories (id),
  sku text not null,
  name text not null,
  description text,
  image_url text,
  price_paise public.money_paise not null,
  tax_percent numeric(5, 2) not null default 0 check (tax_percent >= 0 and tax_percent <= 100),
  -- PRD §7.10 / §7.1 name this requirement twice ("low-stock threshold and
  -- reorder report", "low-stock products" on the dashboard) but the §10.6
  -- ERD row for `products` never lists the column — added here to close that
  -- gap rather than leave the functional requirement unbuildable.
  low_stock_threshold int not null default 0 check (low_stock_threshold >= 0),
  -- PRD §7.10's other undocumented-in-the-ERD requirement: "centre
  -- eligibility". Modelled the same way exam-to-centre assignment already is
  -- in this schema (migration 0022's `exam_assignments`): a product is
  -- eligible everywhere until this flag is turned off, at which point only
  -- rows in `product_centre_eligibility` are eligible.
  is_all_centres boolean not null default true,
  status public.catalog_item_status not null default 'draft',
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid
);

create unique index products_org_sku_idx on public.products (organization_id, sku);
create index products_status_idx on public.products (organization_id, status);
create index products_category_idx on public.products (category_id);

create table public.product_centre_eligibility (
  product_id uuid not null references public.products (id) on delete cascade,
  centre_id uuid not null references public.centres (id),
  created_at timestamptz not null default now(),
  primary key (product_id, centre_id)
);

-- Inventory --------------------------------------------------------------------

create table public.inventory_locations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  name text not null,
  type text not null default 'warehouse' check (type in ('warehouse', 'head_office', 'centre')),
  created_at timestamptz not null default now(),
  created_by uuid
);

create unique index inventory_locations_org_name_idx
  on public.inventory_locations (organization_id, name);

-- Insert-only, exactly like `wallet_entries` (migration 0028): the balance IS
-- the sum of the entries, never a stored mutable field, per CLAUDE.md rule 4.
create table public.inventory_entries (
  entry_seq bigint generated always as identity primary key,
  organization_id uuid not null,
  location_id uuid not null references public.inventory_locations (id),
  product_id uuid not null references public.products (id),
  quantity_delta int not null check (quantity_delta <> 0),
  balance_after int not null check (balance_after >= 0),
  reason public.inventory_entry_reason not null,
  reference text,
  notes text,
  created_at timestamptz not null default now(),
  created_by uuid,
  constraint inventory_entries_adjustment_needs_notes check (
    reason <> 'adjustment' or (notes is not null and length(btrim(notes)) > 0)
  )
);

create index inventory_entries_product_location_idx
  on public.inventory_entries (product_id, location_id, entry_seq desc);

revoke insert, update, delete on public.inventory_entries from authenticated;

-- Orders -------------------------------------------------------------------

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  centre_id uuid not null references public.centres (id),
  location_id uuid references public.inventory_locations (id),
  order_number text not null unique,
  status public.order_status not null default 'pending_payment',
  subtotal_paise public.money_paise not null default 0,
  tax_paise public.money_paise not null default 0,
  total_paise public.money_paise not null default 0,
  wallet_entry_seq bigint references public.wallet_entries (entry_seq),
  placed_at timestamptz not null default now(),
  confirmed_at timestamptz,
  dispatched_at timestamptz,
  delivered_at timestamptz,
  cancelled_at timestamptz,
  cancelled_reason text,
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid
);

create index orders_centre_status_idx on public.orders (centre_id, status);
create index orders_centre_placed_at_idx on public.orders (centre_id, placed_at desc);

-- All state transitions run through the functions below, the same shape
-- migration 0029 gave `centres.status` after the self-reactivation bug: no
-- direct UPDATE path means there is nothing to lock down twice.
revoke insert, update, delete on public.orders from authenticated;

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid not null references public.products (id),
  product_name_snapshot text not null,
  sku_snapshot text not null,
  unit_price_paise public.money_paise not null,
  tax_percent numeric(5, 2) not null default 0,
  quantity int not null check (quantity > 0),
  line_subtotal_paise public.money_paise not null,
  line_tax_paise public.money_paise not null,
  line_total_paise public.money_paise not null,
  created_at timestamptz not null default now()
);

create index order_items_order_idx on public.order_items (order_id);

revoke insert, update, delete on public.order_items from authenticated;

create table public.shipments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  order_id uuid not null references public.orders (id),
  courier text not null,
  tracking_number text,
  dispatched_at timestamptz not null default now(),
  delivered_at timestamptz,
  created_by uuid
);

create index shipments_order_idx on public.shipments (order_id);

revoke insert, update, delete on public.shipments from authenticated;

create table public.shipment_items (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments (id) on delete cascade,
  order_item_id uuid not null references public.order_items (id),
  quantity int not null check (quantity > 0)
);

create index shipment_items_shipment_idx on public.shipment_items (shipment_id);

revoke insert, update, delete on public.shipment_items from authenticated;

-- Triggers -----------------------------------------------------------------

create trigger set_updated_at
  before update on public.product_categories
  for each row execute function app.set_updated_at();

create trigger set_updated_at
  before update on public.products
  for each row execute function app.set_updated_at();

create trigger audit_changes
  after insert or update or delete on public.product_categories
  for each row execute function app.audit_trigger();

create trigger audit_changes
  after insert or update or delete on public.products
  for each row execute function app.audit_trigger();

create trigger audit_changes
  after insert or update or delete on public.inventory_locations
  for each row execute function app.audit_trigger();

create trigger audit_changes
  after insert or update or delete on public.orders
  for each row execute function app.audit_trigger();

-- Row Level Security ---------------------------------------------------------

alter table public.product_categories enable row level security;
alter table public.product_categories force row level security;
alter table public.products enable row level security;
alter table public.products force row level security;
alter table public.product_centre_eligibility enable row level security;
alter table public.product_centre_eligibility force row level security;
alter table public.inventory_locations enable row level security;
alter table public.inventory_locations force row level security;
alter table public.inventory_entries enable row level security;
alter table public.inventory_entries force row level security;
alter table public.orders enable row level security;
alter table public.orders force row level security;
alter table public.order_items enable row level security;
alter table public.order_items force row level security;
alter table public.shipments enable row level security;
alter table public.shipments force row level security;
alter table public.shipment_items enable row level security;
alter table public.shipment_items force row level security;

-- The catalogue and the ledger are organisation-wide, not centre-owned, so
-- `app.has_permission(perm, org, centre)` is the wrong tool: its org-level
-- branch (migration 0020) demands an org-WIDE membership, which centre_owner
-- and centre_manager are not, even though the matrix grants them read here.
-- What is actually being asked is "does this user hold the permission through
-- ANY membership in this org, centre-scoped or not" — so it is asked directly,
-- the same way `memberships_select` and `role_permissions_select` (migration
-- 0003) already do rather than forcing it through `has_permission`.
create function app.has_org_permission(perm text, org uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.memberships m
    join public.role_permissions rp on rp.role_id = m.role_id
    where m.user_id = auth.uid()
      and m.organization_id = org
      and m.status = 'active'
      and rp.permission_code = perm
  );
$$;

grant execute on function app.has_org_permission(text, uuid) to authenticated;

create policy product_categories_select on public.product_categories
  for select to authenticated
  using (app.is_platform_admin() or app.has_org_permission('product.read', organization_id));

create policy product_categories_manage on public.product_categories
  for all to authenticated
  using (app.is_platform_admin() or app.has_permission('product.manage', organization_id))
  with check (app.is_platform_admin() or app.has_permission('product.manage', organization_id));

create policy products_select on public.products
  for select to authenticated
  using (app.is_platform_admin() or app.has_org_permission('product.read', organization_id));

create policy products_manage on public.products
  for all to authenticated
  using (app.is_platform_admin() or app.has_permission('product.manage', organization_id))
  with check (app.is_platform_admin() or app.has_permission('product.manage', organization_id));

create policy product_centre_eligibility_select on public.product_centre_eligibility
  for select to authenticated
  using (
    exists (
      select 1 from public.products p
      where p.id = product_id
        and (app.is_platform_admin() or app.has_org_permission('product.read', p.organization_id))
    )
  );

create policy product_centre_eligibility_manage on public.product_centre_eligibility
  for all to authenticated
  using (
    exists (
      select 1 from public.products p
      where p.id = product_id
        and (app.is_platform_admin() or app.has_permission('product.manage', p.organization_id))
    )
  )
  with check (
    exists (
      select 1 from public.products p
      where p.id = product_id
        and (app.is_platform_admin() or app.has_permission('product.manage', p.organization_id))
    )
  );

create policy inventory_locations_select on public.inventory_locations
  for select to authenticated
  using (app.is_platform_admin() or app.has_org_permission('inventory.read', organization_id));

create policy inventory_locations_manage on public.inventory_locations
  for all to authenticated
  using (app.is_platform_admin() or app.has_permission('inventory.manage', organization_id))
  with check (app.is_platform_admin() or app.has_permission('inventory.manage', organization_id));

create policy inventory_entries_select on public.inventory_entries
  for select to authenticated
  using (app.is_platform_admin() or app.has_org_permission('inventory.read', organization_id));

-- No insert/update/delete policy on inventory_entries: the REVOKE above is
-- the grant-level backstop, the absent policy is the RLS-level one, same
-- shape as `payments` in the fees migration.

create policy orders_select on public.orders
  for select to authenticated
  using (
    app.is_platform_admin()
    or (app.has_permission('order.read', organization_id, centre_id)
        and app.can_access_centre(centre_id))
  );

create policy order_items_select on public.order_items
  for select to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and (app.is_platform_admin()
             or (app.has_permission('order.read', o.organization_id, o.centre_id)
                 and app.can_access_centre(o.centre_id)))
    )
  );

create policy shipments_select on public.shipments
  for select to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and (app.is_platform_admin()
             or (app.has_permission('order.read', o.organization_id, o.centre_id)
                 and app.can_access_centre(o.centre_id)))
    )
  );

create policy shipment_items_select on public.shipment_items
  for select to authenticated
  using (
    exists (
      select 1 from public.shipments s
      join public.orders o on o.id = s.order_id
      where s.id = shipment_id
        and (app.is_platform_admin()
             or (app.has_permission('order.read', o.organization_id, o.centre_id)
                 and app.can_access_centre(o.centre_id)))
    )
  );

-- Functions ------------------------------------------------------------------

-- The one place stock ever moves. Locks the location row so two concurrent
-- movements against the same location cannot both read the same balance and
-- both pass — the same `for update` shape `debit_wallet` (migration 0028)
-- takes on `wallet_accounts`. Trusted internal helper: it does not check a
-- permission itself, exactly like `app.grade_attempt` — every caller below is
-- already a SECURITY DEFINER function that has done its own check first.
create function app.record_inventory_entry(
  p_organization_id uuid,
  p_location_id uuid,
  p_product_id uuid,
  p_quantity_delta int,
  p_reason public.inventory_entry_reason,
  p_reference text default null,
  p_notes text default null
)
returns int
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_balance int;
begin
  perform 1 from public.inventory_locations where id = p_location_id for update;

  select coalesce(sum(quantity_delta), 0) into v_balance
  from public.inventory_entries
  where location_id = p_location_id and product_id = p_product_id;

  v_balance := v_balance + p_quantity_delta;
  if v_balance < 0 then
    raise exception 'That would take stock below zero' using errcode = 'invalid_parameter_value';
  end if;

  insert into public.inventory_entries
    (organization_id, location_id, product_id, quantity_delta, balance_after, reason, reference, notes, created_by)
  values
    (p_organization_id, p_location_id, p_product_id, p_quantity_delta, v_balance, p_reason, p_reference, p_notes, auth.uid());

  return v_balance;
end;
$$;

revoke all on function app.record_inventory_entry(uuid, uuid, uuid, int, public.inventory_entry_reason, text, text)
  from public, anon, authenticated;

-- Stock arriving from outside the system (a purchase, or the first count
-- taken for a newly stocked product). `inventory.manage` is organisation-wide
-- by design (PRD §4: Inventory Manager's scope is "Entire organisation"),
-- which today only a platform admin holds — see the migration header.
create function public.receive_stock(
  p_location_id uuid,
  p_product_id uuid,
  p_quantity int,
  p_reason public.inventory_entry_reason default 'purchase_receipt',
  p_reference text default null
)
returns int
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_org uuid;
begin
  if p_quantity <= 0 then
    raise exception 'Enter a quantity greater than zero' using errcode = 'invalid_parameter_value';
  end if;
  if p_reason not in ('opening_stock', 'purchase_receipt') then
    raise exception 'Use adjust_stock for a correction' using errcode = 'invalid_parameter_value';
  end if;

  select organization_id into v_org from public.inventory_locations where id = p_location_id;
  if v_org is null then
    raise exception 'Location not found' using errcode = 'no_data_found';
  end if;

  if not (app.is_platform_admin() or app.has_permission('inventory.manage', v_org)) then
    raise exception 'Not authorised to receive stock' using errcode = 'insufficient_privilege';
  end if;

  return app.record_inventory_entry(v_org, p_location_id, p_product_id, p_quantity, p_reason, p_reference, null);
end;
$$;

-- A manual correction — shrinkage, a miscount, damage found on shelf. Signed,
-- and always carries a human reason, the same shape as `credit_wallet`'s
-- manual-adjustment sibling and CLAUDE.md's "corrections are reversals, never
-- silent edits" rule.
create function public.adjust_stock(
  p_location_id uuid,
  p_product_id uuid,
  p_quantity_delta int,
  p_notes text,
  p_reference text default null
)
returns int
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_org uuid;
begin
  if p_quantity_delta = 0 then
    raise exception 'An adjustment must change the quantity' using errcode = 'invalid_parameter_value';
  end if;
  if coalesce(btrim(p_notes), '') = '' then
    raise exception 'An adjustment needs a reason' using errcode = 'invalid_parameter_value';
  end if;

  select organization_id into v_org from public.inventory_locations where id = p_location_id;
  if v_org is null then
    raise exception 'Location not found' using errcode = 'no_data_found';
  end if;

  if not (app.is_platform_admin() or app.has_permission('inventory.manage', v_org)) then
    raise exception 'Not authorised to adjust stock' using errcode = 'insufficient_privilege';
  end if;

  return app.record_inventory_entry(v_org, p_location_id, p_product_id, p_quantity_delta, 'adjustment', p_reference, p_notes);
end;
$$;

-- Cart -> order. Validates every line against the live catalogue and snapshots
-- price/tax at that moment (an order must never re-price itself when a
-- product's price changes later — the same reasoning `order_items` carries a
-- `product_name_snapshot`/`sku_snapshot` rather than joining `products` live).
-- No stock is touched here: PRD §6.9 step 3 is explicit that reservation
-- happens only after payment, which is `pay_order`'s job, not this one's.
create function public.create_order(
  p_centre_id uuid,
  p_items jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_org uuid;
  v_order_id uuid;
  v_order_number text;
  v_seq bigint;
  v_item jsonb;
  v_product public.products%rowtype;
  v_quantity int;
  v_line_subtotal bigint;
  v_line_tax bigint;
  v_subtotal bigint := 0;
  v_tax bigint := 0;
begin
  select organization_id into v_org from public.centres where id = p_centre_id;
  if v_org is null then
    raise exception 'Centre not found' using errcode = 'no_data_found';
  end if;

  if not (
    app.is_platform_admin()
    or (app.has_permission('order.create', v_org, p_centre_id) and app.can_access_centre(p_centre_id))
  ) then
    raise exception 'Not authorised to place an order for this centre' using errcode = 'insufficient_privilege';
  end if;
  if not app.centre_is_operational(p_centre_id) then
    raise exception 'This centre is not currently operational' using errcode = 'invalid_parameter_value';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'An order needs at least one item' using errcode = 'invalid_parameter_value';
  end if;

  v_seq := app.next_document_number(v_org, null, 'order', to_char(now(), 'YYMM'));
  v_order_number := 'ORD-' || to_char(now(), 'YYMM') || '-' || lpad(v_seq::text, 6, '0');

  insert into public.orders (organization_id, centre_id, order_number, status, created_by, updated_by)
  values (v_org, p_centre_id, v_order_number, 'pending_payment', auth.uid(), auth.uid())
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select * into v_product from public.products where id = (v_item ->> 'product_id')::uuid;
    if v_product.id is null then
      raise exception 'Product not found' using errcode = 'no_data_found';
    end if;
    if v_product.organization_id <> v_org then
      raise exception 'Product does not belong to this organisation' using errcode = 'invalid_parameter_value';
    end if;
    if v_product.status <> 'active' then
      raise exception 'Product "%" is not available', v_product.name using errcode = 'invalid_parameter_value';
    end if;
    if not v_product.is_all_centres and not exists (
      select 1 from public.product_centre_eligibility e
      where e.product_id = v_product.id and e.centre_id = p_centre_id
    ) then
      raise exception 'Product "%" is not available to your centre', v_product.name using errcode = 'invalid_parameter_value';
    end if;

    v_quantity := (v_item ->> 'quantity')::int;
    if v_quantity is null or v_quantity <= 0 then
      raise exception 'Enter a quantity greater than zero for "%"', v_product.name using errcode = 'invalid_parameter_value';
    end if;

    v_line_subtotal := v_product.price_paise * v_quantity;
    v_line_tax := round(v_line_subtotal * v_product.tax_percent / 100.0);

    insert into public.order_items (
      order_id, product_id, product_name_snapshot, sku_snapshot,
      unit_price_paise, tax_percent, quantity,
      line_subtotal_paise, line_tax_paise, line_total_paise
    ) values (
      v_order_id, v_product.id, v_product.name, v_product.sku,
      v_product.price_paise, v_product.tax_percent, v_quantity,
      v_line_subtotal, v_line_tax, v_line_subtotal + v_line_tax
    );

    v_subtotal := v_subtotal + v_line_subtotal;
    v_tax := v_tax + v_line_tax;
  end loop;

  update public.orders
  set subtotal_paise = v_subtotal, tax_paise = v_tax, total_paise = v_subtotal + v_tax
  where id = v_order_id;

  return v_order_id;
end;
$$;

-- Pay -> reserve stock. Both happen or neither does: if stock is short, the
-- exception raised below aborts before `debit_wallet` is ever called: if the
-- wallet debit itself fails (insufficient balance), the exception it raises
-- propagates uncaught and rolls back the stock entries already made in THIS
-- transaction — the same all-or-nothing shape PRD §9.5 requires for
-- "wallet debit, inventory reservation" and the reason no explicit BEGIN/
-- EXCEPTION block appears here: letting the error escape is what makes the
-- rollback automatic.
create function public.pay_order(
  p_order_id uuid,
  p_location_id uuid,
  p_idempotency_key text
)
returns public.order_status
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
  v_item record;
  v_account uuid;
  v_entry_seq bigint;
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if v_order.id is null then
    raise exception 'Order not found' using errcode = 'no_data_found';
  end if;

  if not (
    app.is_platform_admin()
    or (app.has_permission('order.create', v_order.organization_id, v_order.centre_id)
        and app.can_access_centre(v_order.centre_id))
  ) then
    raise exception 'Not authorised to pay for this order' using errcode = 'insufficient_privilege';
  end if;

  -- Replay: the order has already moved on, nothing left to do.
  if v_order.status <> 'pending_payment' then
    return v_order.status;
  end if;

  for v_item in select * from public.order_items where order_id = p_order_id
  loop
    perform app.record_inventory_entry(
      v_order.organization_id, p_location_id, v_item.product_id,
      -v_item.quantity, 'reservation', v_order.order_number, null
    );
  end loop;

  -- A zero-total order (free marketing material, say) has nothing to debit —
  -- `debit_wallet` requires a positive amount and would reject it otherwise.
  if v_order.total_paise > 0 then
    perform public.debit_wallet(
      v_order.centre_id, v_order.total_paise,
      'Order ' || v_order.order_number, p_idempotency_key
    );

    -- debit_wallet returns the resulting balance, not the row it wrote, so the
    -- exact entry is looked up by the idempotency key that must be unique on
    -- this account (migration 0028's partial unique index) to link the order
    -- to the ledger row that paid it.
    v_account := app.ensure_wallet_account(v_order.centre_id);
    select entry_seq into v_entry_seq
    from public.wallet_entries
    where account_id = v_account and idempotency_key = p_idempotency_key;
  end if;

  update public.orders
  set status = 'confirmed', confirmed_at = now(), location_id = p_location_id,
      wallet_entry_seq = v_entry_seq, updated_by = auth.uid()
  where id = p_order_id;

  return 'confirmed';
end;
$$;

-- HO/inventory side: the goods have physically left the building. Requires
-- `order.dispatch`, printed verbatim in the build plan matrix.
create function public.dispatch_order(
  p_order_id uuid,
  p_courier text,
  p_tracking_number text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
  v_shipment_id uuid;
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if v_order.id is null then
    raise exception 'Order not found' using errcode = 'no_data_found';
  end if;

  if not (app.is_platform_admin() or app.has_permission('order.dispatch', v_order.organization_id)) then
    raise exception 'Not authorised to dispatch orders' using errcode = 'insufficient_privilege';
  end if;
  if v_order.status not in ('confirmed', 'processing', 'packed') then
    raise exception 'Order must be paid and not yet dispatched' using errcode = 'invalid_parameter_value';
  end if;
  if coalesce(btrim(p_courier), '') = '' then
    raise exception 'Name the courier' using errcode = 'invalid_parameter_value';
  end if;

  insert into public.shipments (organization_id, order_id, courier, tracking_number, created_by)
  values (v_order.organization_id, p_order_id, p_courier, p_tracking_number, auth.uid())
  returning id into v_shipment_id;

  insert into public.shipment_items (shipment_id, order_item_id, quantity)
  select v_shipment_id, oi.id, oi.quantity from public.order_items oi where oi.order_id = p_order_id;

  update public.orders
  set status = 'dispatched', dispatched_at = now(), updated_by = auth.uid()
  where id = p_order_id;

  return v_shipment_id;
end;
$$;

-- Centre side: PRD §6.9 step 6, "Centre acknowledges delivery." Reuses
-- `order.create` as the umbrella "this centre acts on its own orders"
-- permission — the matrix names no separate `order.acknowledge` code, and a
-- centre that may place an order is the same centre that receives it.
create function public.mark_order_delivered(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if v_order.id is null then
    raise exception 'Order not found' using errcode = 'no_data_found';
  end if;

  if not (
    app.is_platform_admin()
    or (app.has_permission('order.create', v_order.organization_id, v_order.centre_id)
        and app.can_access_centre(v_order.centre_id))
  ) then
    raise exception 'Not authorised to acknowledge this order' using errcode = 'insufficient_privilege';
  end if;
  if v_order.status <> 'dispatched' then
    raise exception 'Order has not been dispatched yet' using errcode = 'invalid_parameter_value';
  end if;

  update public.orders set status = 'delivered', delivered_at = now(), updated_by = auth.uid()
  where id = p_order_id;
  update public.shipments set delivered_at = now() where order_id = p_order_id;
end;
$$;

-- Cancel before dispatch. Unpaid orders cost a status change; paid ones must
-- be unwound exactly — the wallet debit reversed and the reserved stock
-- returned — which is why `wallet_entries.entry_type` has carried 'reversal'
-- since migration 0028 with nothing using it until now.
create function app.reverse_wallet_debit(
  p_centre_id uuid,
  p_amount_paise bigint,
  p_reason text,
  p_reference text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_account uuid;
  v_org uuid;
begin
  select organization_id into v_org from public.centres where id = p_centre_id;
  v_account := app.ensure_wallet_account(p_centre_id);

  insert into public.wallet_entries
    (account_id, organization_id, amount_paise, entry_type, reason, reference, created_by)
  values
    (v_account, v_org, p_amount_paise, 'reversal', p_reason, p_reference, auth.uid());
end;
$$;

revoke all on function app.reverse_wallet_debit(uuid, bigint, text, text) from public, anon, authenticated;

create function public.cancel_order(p_order_id uuid, p_reason text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
  v_item record;
begin
  if coalesce(btrim(p_reason), '') = '' then
    raise exception 'A reason is required to cancel an order' using errcode = 'invalid_parameter_value';
  end if;

  select * into v_order from public.orders where id = p_order_id for update;
  if v_order.id is null then
    raise exception 'Order not found' using errcode = 'no_data_found';
  end if;

  if not (
    app.is_platform_admin()
    or app.has_permission('order.dispatch', v_order.organization_id)
    or (app.has_permission('order.create', v_order.organization_id, v_order.centre_id)
        and app.can_access_centre(v_order.centre_id))
  ) then
    raise exception 'Not authorised to cancel this order' using errcode = 'insufficient_privilege';
  end if;
  if v_order.status not in ('pending_payment', 'confirmed', 'processing', 'packed') then
    raise exception 'An order already dispatched cannot be cancelled, only returned' using errcode = 'invalid_parameter_value';
  end if;

  if v_order.status <> 'pending_payment' then
    for v_item in select * from public.order_items where order_id = p_order_id
    loop
      perform app.record_inventory_entry(
        v_order.organization_id, v_order.location_id, v_item.product_id,
        v_item.quantity, 'return', v_order.order_number, null
      );
    end loop;

    -- Symmetric with `pay_order`'s own guard: a zero-total order never
    -- touched the wallet, so there is nothing to reverse, and
    -- `wallet_entries.amount_paise` rejects a zero-amount row outright.
    if v_order.total_paise > 0 then
      perform app.reverse_wallet_debit(
        v_order.centre_id, v_order.total_paise,
        'Cancelled order ' || v_order.order_number, v_order.order_number
      );
    end if;
  end if;

  update public.orders
  set status = 'cancelled', cancelled_at = now(), cancelled_reason = p_reason, updated_by = auth.uid()
  where id = p_order_id;
end;
$$;

grant execute on function public.receive_stock(uuid, uuid, int, public.inventory_entry_reason, text) to authenticated;
grant execute on function public.adjust_stock(uuid, uuid, int, text, text) to authenticated;
grant execute on function public.create_order(uuid, jsonb) to authenticated;
grant execute on function public.pay_order(uuid, uuid, text) to authenticated;
grant execute on function public.dispatch_order(uuid, text, text) to authenticated;
grant execute on function public.mark_order_delivered(uuid) to authenticated;
grant execute on function public.cancel_order(uuid, text) to authenticated;

revoke all on function public.receive_stock(uuid, uuid, int, public.inventory_entry_reason, text) from public, anon;
revoke all on function public.adjust_stock(uuid, uuid, int, text, text) from public, anon;
revoke all on function public.create_order(uuid, jsonb) from public, anon;
revoke all on function public.pay_order(uuid, uuid, text) from public, anon;
revoke all on function public.dispatch_order(uuid, text, text) from public, anon;
revoke all on function public.mark_order_delivered(uuid) from public, anon;
revoke all on function public.cancel_order(uuid, text) from public, anon;

-- Permissions ----------------------------------------------------------------

insert into public.permissions (code, description) values
  ('product.read',      'View the products catalogue'),
  ('product.manage',    'Create and edit products and categories'),
  ('inventory.read',    'View stock locations and the stock ledger'),
  ('inventory.manage',  'Receive stock and record stock adjustments'),
  ('order.create',      'Place an order for a centre'),
  ('order.read',        'View a centre''s orders'),
  ('order.dispatch',    'Dispatch a paid order')
on conflict (code) do nothing;

-- Centre Owner, Centre Manager: `read` on product.*/inventory.* and
-- `order.create` per the matrix, plus `order.read` — the matrix lists no
-- separate read code and a centre that cannot see its own order cannot use
-- `order.create`'s result at all.
insert into public.role_permissions (role_id, permission_code)
select r.id, p.code
from public.roles r
cross join (values
  ('product.read'), ('inventory.read'), ('order.create'), ('order.read')
) as p(code)
where r.code in ('centre_owner', 'centre_manager')
on conflict do nothing;

-- Accountant: `order.create` is printed verbatim in the matrix. `product.read`
-- is minted alongside it for the same reason `order.read` was above — an
-- accountant who cannot browse the catalogue cannot build the cart the
-- permission is meant to let them submit.
insert into public.role_permissions (role_id, permission_code)
select r.id, p.code
from public.roles r
cross join (values ('product.read'), ('order.create'), ('order.read')) as p(code)
where r.code = 'accountant'
on conflict do nothing;

-- `product.manage`, `inventory.manage` and `order.dispatch` are granted to no
-- role here. The matrix gives them to "Inventory Mgr" and "HO Operator" —
-- organisation-wide staff roles the PRD names (§4) but that this codebase has
-- never seeded, the same gap migration 0005's `courses_platform_write`
-- comment already recorded for the academics catalogue. Until a head-office
-- staffing feature creates those roles, only `app.is_platform_admin()`
-- exercises these three, which is what every function above falls back to.
