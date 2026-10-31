-- Give fee types and fee groups somewhere to live.
--
-- Both lists were kept in the browser's localStorage (`erp-fee-types`,
-- `erp-fee-groups`), so every computer had its own catalogue, a cleared browser
-- lost it, and a group allocated from one office machine was unknown on the
-- next one -- its invoices read as "Custom invoice" there.
--
-- `fee_invoices."feeGroupId"` already holds the ids those browsers made up.
-- The app's one-time import (`importLocalFeeStructures` in
-- src/lib/supabase/feeStructures.ts) inserts the browser's rows with the same
-- ids through `import_fee_structures` below, so those invoices stay linked.
--
-- Run once in the Supabase SQL editor, after user-management.sql and
-- branch-scoped-wallet-rls.sql (they define the claim helpers used here).
-- Safe to re-run.


-- ---------------------------------------------------------------------
-- 0. The claim helpers must already exist. They are not redefined here so
--    re-running this file cannot overwrite a later change to them.
-- ---------------------------------------------------------------------
do $$
begin
  if to_regprocedure('public.jwt_org_id()') is null
     or to_regprocedure('public.is_org_admin()') is null then
    raise exception 'public.jwt_org_id() / public.is_org_admin() are missing: run user-management.sql and branch-scoped-wallet-rls.sql first.';
  end if;
end $$;


-- ---------------------------------------------------------------------
-- 1. Fee types: the catalogue a group is built from.
--
--    `applicableTo` is an array because the page models it as one (it
--    currently only ever writes one course, or "All Courses").
-- ---------------------------------------------------------------------
create table if not exists public.fee_types (
  id               text primary key default gen_random_uuid()::text,
  "organizationId" text not null references public.organizations(id) on delete cascade,
  name             text not null,
  code             text not null default '',
  category         text not null default 'Academic',
  "defaultAmount"  numeric(12,2) not null default 0,
  frequency        text not null default 'Yearly',
  "applicableTo"   text[] not null default array['All Courses'],
  description      text not null default '',
  status           text not null default 'ACTIVE',
  "createdAt"      timestamptz not null default now(),
  "updatedAt"      timestamptz not null default now(),
  "deletedAt"      timestamptz,
  constraint fee_types_status_check check (status in ('ACTIVE', 'INACTIVE')),
  -- `>= 0` rather than `> 0`: the page now refuses a zero amount, but rows
  -- imported from older browsers may hold one and must not block the import.
  constraint fee_types_amount_check check ("defaultAmount" >= 0),
  constraint fee_types_name_check check (btrim(name) <> '')
);

create index if not exists "fee_types_organizationId_idx"
  on public.fee_types ("organizationId");

-- Case-insensitive, and only among live rows, so a deleted "Lab Fee" does not
-- stop a new one being added.
create unique index if not exists fee_types_org_name_key
  on public.fee_types ("organizationId", lower(btrim(name)))
  where "deletedAt" is null;

-- The page also refuses a duplicate code; an empty code is not a duplicate.
create unique index if not exists fee_types_org_code_key
  on public.fee_types ("organizationId", upper(btrim(code)))
  where "deletedAt" is null and btrim(code) <> '';


-- ---------------------------------------------------------------------
-- 2. Fee groups: the package an invoice is billed from.
--
--    `totalAmount` is the price Fee Allocation bills. The page writes it as
--    the sum of the group's items when the group is saved -- the same
--    snapshot the browser stored before -- so editing a fee type's amount
--    later does not silently reprice a package students are already on. It is
--    a column, not a sum computed on read, so an imported group keeps the
--    exact total it was billed at even when its fee types have since changed.
-- ---------------------------------------------------------------------
create table if not exists public.fee_groups (
  id               text primary key default gen_random_uuid()::text,
  "organizationId" text not null references public.organizations(id) on delete cascade,
  name             text not null,
  description      text not null default '',
  courses          text[] not null default array['All Courses'],
  "totalAmount"    numeric(12,2) not null default 0,
  status           text not null default 'ACTIVE',
  "createdAt"      timestamptz not null default now(),
  "updatedAt"      timestamptz not null default now(),
  "deletedAt"      timestamptz,
  constraint fee_groups_status_check check (status in ('ACTIVE', 'INACTIVE')),
  constraint fee_groups_amount_check check ("totalAmount" >= 0),
  constraint fee_groups_name_check check (btrim(name) <> '')
);

create index if not exists "fee_groups_organizationId_idx"
  on public.fee_groups ("organizationId");

create unique index if not exists fee_groups_org_name_key
  on public.fee_groups ("organizationId", lower(btrim(name)))
  where "deletedAt" is null;


-- ---------------------------------------------------------------------
-- 3. Which fee types make up a group, and at what amount.
--
--    A table rather than a jsonb column on fee_groups: the link can then be a
--    real foreign key to fee_types, "which groups use this fee type" is an
--    indexed lookup instead of a scan through json, and RLS can refuse an item
--    pointing at another organisation's fee type.
--
--    `name` is kept on the item because the browser linked types to groups by
--    name. An imported group can name a fee type that was deleted from that
--    browser long ago; it has no `feeTypeId` but must still say what it was.
--    `feeTypeId` is set null rather than cascading if a type is ever hard
--    deleted, for the same reason.
-- ---------------------------------------------------------------------
create table if not exists public.fee_group_items (
  id           text primary key default gen_random_uuid()::text,
  "feeGroupId" text not null references public.fee_groups(id) on delete cascade,
  "feeTypeId"  text references public.fee_types(id) on delete set null,
  name         text not null,
  amount       numeric(12,2) not null default 0,
  "sortOrder"  integer not null default 0,
  "createdAt"  timestamptz not null default now(),
  constraint fee_group_items_amount_check check (amount >= 0)
);

create index if not exists "fee_group_items_feeGroupId_idx"
  on public.fee_group_items ("feeGroupId");
create index if not exists "fee_group_items_feeTypeId_idx"
  on public.fee_group_items ("feeTypeId");


-- ---------------------------------------------------------------------
-- 4. fee_invoices."feeGroupId" is deliberately NOT a foreign key.
--
--    Existing invoices hold ids invented in browsers. The import brings most
--    of them in, but not all: a group deleted from one browser, or living only
--    on a machine nobody opens any more, leaves invoices pointing at an id no
--    row will ever have, and a foreign key would refuse to be created over
--    them. Groups are also only ever soft-deleted, so an invoice's group row
--    stays readable. The app falls back to the invoice's own `description`
--    (the group's name when it was billed) for an id it cannot resolve.
-- ---------------------------------------------------------------------


-- ---------------------------------------------------------------------
-- 5. Who may read and write.
--
--    The fee catalogue belongs to the institute: every signed-in account in
--    the organisation reads it (a branch allocating fees has to see the
--    groups), and only an organisation admin changes it. Branch staff must not
--    be able to reprice a package other branches bill from.
-- ---------------------------------------------------------------------
alter table public.fee_types       enable row level security;
alter table public.fee_groups      enable row level security;
alter table public.fee_group_items enable row level security;

drop policy if exists "Read own organisation fee types"  on public.fee_types;
drop policy if exists "Write own organisation fee types" on public.fee_types;
drop policy if exists "Read own organisation fee groups"  on public.fee_groups;
drop policy if exists "Write own organisation fee groups" on public.fee_groups;
drop policy if exists "Read own organisation fee group items"  on public.fee_group_items;
drop policy if exists "Write own organisation fee group items" on public.fee_group_items;

create policy "Read own organisation fee types" on public.fee_types
  for select to authenticated
  using ("organizationId" = public.jwt_org_id());

create policy "Write own organisation fee types" on public.fee_types
  for all to authenticated
  using (public.is_org_admin() and "organizationId" = public.jwt_org_id())
  with check (public.is_org_admin() and "organizationId" = public.jwt_org_id());

create policy "Read own organisation fee groups" on public.fee_groups
  for select to authenticated
  using ("organizationId" = public.jwt_org_id());

create policy "Write own organisation fee groups" on public.fee_groups
  for all to authenticated
  using (public.is_org_admin() and "organizationId" = public.jwt_org_id())
  with check (public.is_org_admin() and "organizationId" = public.jwt_org_id());

-- An item has no organisation of its own; it takes its group's.
create policy "Read own organisation fee group items" on public.fee_group_items
  for select to authenticated
  using (exists (
    select 1 from public.fee_groups g
     where g.id = "feeGroupId" and g."organizationId" = public.jwt_org_id()
  ));

create policy "Write own organisation fee group items" on public.fee_group_items
  for all to authenticated
  using (
    public.is_org_admin()
    and exists (
      select 1 from public.fee_groups g
       where g.id = "feeGroupId" and g."organizationId" = public.jwt_org_id()
    )
  )
  with check (
    public.is_org_admin()
    and exists (
      select 1 from public.fee_groups g
       where g.id = "feeGroupId" and g."organizationId" = public.jwt_org_id()
    )
    -- Otherwise a group could be assembled from another institute's fee types.
    and (
      "feeTypeId" is null
      or exists (
        select 1 from public.fee_types t
         where t.id = "feeTypeId" and t."organizationId" = public.jwt_org_id()
      )
    )
  );


-- ---------------------------------------------------------------------
-- 6. The one-time import from a browser's localStorage.
--
--    One function so the types, groups and items land in one transaction: done
--    as three separate requests, a failure halfway would leave the
--    organisation "not empty", so the import would never run again and the
--    rest of the browser's catalogue would be stranded.
--
--    SECURITY INVOKER: the policies above still decide what may be written.
--    The organisation is the caller's claim, never a parameter.
--
--    It does nothing, and says so, if the organisation already has any fee
--    type or group -- deleted ones included, so a catalogue an admin cleared
--    on purpose is not refilled by the next stale browser that opens the page.
--
--    p_types:  [{id, name, code, category, defaultAmount, frequency,
--               applicableTo: [text], description, status}]
--    p_groups: [{id, name, description, courses: [text], totalAmount, status,
--               items: [{feeTypeId, name, amount}]}]
-- ---------------------------------------------------------------------
create or replace function public.import_fee_structures(p_types jsonb, p_groups jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_org    text := public.jwt_org_id();
  v_types  integer := 0;
  v_groups integer := 0;
begin
  if v_org is null or not public.is_org_admin() then
    raise exception 'Only an organisation admin can import fee types and groups.'
      using errcode = '42501';
  end if;

  if exists (select 1 from public.fee_types  where "organizationId" = v_org)
     or exists (select 1 from public.fee_groups where "organizationId" = v_org) then
    return jsonb_build_object('imported', false, 'types', 0, 'groups', 0);
  end if;

  insert into public.fee_types
    (id, "organizationId", name, code, category, "defaultAmount", frequency,
     "applicableTo", description, status)
  select t.id, v_org, btrim(t.name), coalesce(t.code, ''),
         coalesce(t.category, 'Academic'), coalesce(t."defaultAmount", 0),
         coalesce(t.frequency, 'Yearly'),
         coalesce(t."applicableTo", array['All Courses']),
         coalesce(t.description, ''), coalesce(t.status, 'ACTIVE')
    from jsonb_to_recordset(coalesce(p_types, '[]'::jsonb)) as t(
           id text, name text, code text, category text, "defaultAmount" numeric,
           frequency text, "applicableTo" text[], description text, status text);
  get diagnostics v_types = row_count;

  insert into public.fee_groups
    (id, "organizationId", name, description, courses, "totalAmount", status)
  select g.id, v_org, btrim(g.name), coalesce(g.description, ''),
         coalesce(g.courses, array['All Courses']), coalesce(g."totalAmount", 0),
         coalesce(g.status, 'ACTIVE')
    from jsonb_to_recordset(coalesce(p_groups, '[]'::jsonb)) as g(
           id text, name text, description text, courses text[],
           "totalAmount" numeric, status text);
  get diagnostics v_groups = row_count;

  insert into public.fee_group_items ("feeGroupId", "feeTypeId", name, amount, "sortOrder")
  select g.value ->> 'id',
         nullif(i.value ->> 'feeTypeId', ''),
         i.value ->> 'name',
         coalesce((i.value ->> 'amount')::numeric, 0),
         i.ordinality - 1
    from jsonb_array_elements(coalesce(p_groups, '[]'::jsonb)) as g
   cross join lateral jsonb_array_elements(coalesce(g.value -> 'items', '[]'::jsonb))
         with ordinality as i(value, ordinality);

  return jsonb_build_object('imported', true, 'types', v_types, 'groups', v_groups);
end;
$$;

revoke all on function public.import_fee_structures(jsonb, jsonb) from public;
grant execute on function public.import_fee_structures(jsonb, jsonb) to authenticated;


-- ---------------------------------------------------------------------
-- 7. Check what is in place now.
-- ---------------------------------------------------------------------
select tablename, policyname, cmd from pg_policies
 where schemaname = 'public'
   and tablename in ('fee_types', 'fee_groups', 'fee_group_items')
 order by tablename, policyname;
