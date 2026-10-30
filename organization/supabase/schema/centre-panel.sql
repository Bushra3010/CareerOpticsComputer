-- =====================================================================
-- The centre panel's own records: expenses, marketing spend, support
-- tickets, awards, the question bank and certificate orders.
--
-- Every table belongs to a branch. A centre login reads and writes its own
-- branch's rows (jwt_branch_id()); an organisation admin reads and writes the
-- rows of every branch in its organisation. Safe to re-run.
-- =====================================================================

create or replace function public.can_touch_branch(target text)
returns boolean language sql stable as $$
  select target = public.jwt_branch_id()
      or (public.is_org_admin() and exists (
            select 1 from public.branches b
             where b.id = target and b."organizationId" = public.jwt_org_id()));
$$;

-- ---------------------------------------------------------------------
-- Expenses: money in and out of the centre's own till.
-- ---------------------------------------------------------------------
create table if not exists public.centre_expenses (
  id          text primary key default gen_random_uuid()::text,
  "branchId"  text not null references public.branches(id) on delete cascade,
  date        date not null default current_date,
  amount      numeric(12,2) not null check (amount > 0),
  mode        text not null default 'Cash',
  type        text not null default 'debit' check (type in ('debit', 'credit')),
  reference   text,
  "createdBy" text default auth.uid()::text,
  "createdAt" timestamptz not null default now()
);
create index if not exists centre_expenses_branch_idx on public.centre_expenses ("branchId", date desc);

-- ---------------------------------------------------------------------
-- Marketing spend, with a photo of the bill or the banner.
-- ---------------------------------------------------------------------
create table if not exists public.marketing_expenses (
  id          text primary key default gen_random_uuid()::text,
  "branchId"  text not null references public.branches(id) on delete cascade,
  amount      numeric(12,2) not null check (amount > 0),
  remarks     text,
  photo       text,
  "createdBy" text default auth.uid()::text,
  "createdAt" timestamptz not null default now()
);
create index if not exists marketing_expenses_branch_idx on public.marketing_expenses ("branchId", "createdAt" desc);

-- ---------------------------------------------------------------------
-- Help & support tickets from a centre to the head office.
-- ---------------------------------------------------------------------
create table if not exists public.support_tickets (
  id          text primary key default gen_random_uuid()::text,
  code        text not null default ('TKT-' || upper(substr(md5(random()::text), 1, 6))),
  "branchId"  text not null references public.branches(id) on delete cascade,
  category    text not null,
  subcategory text,
  subject     text not null,
  content     text,
  image       text,
  status      text not null default 'OPEN' check (status in ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')),
  reply       text,
  "createdBy" text default auth.uid()::text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
create index if not exists support_tickets_branch_idx on public.support_tickets ("branchId", "createdAt" desc);

-- ---------------------------------------------------------------------
-- Awards a centre has earned from the head office.
-- ---------------------------------------------------------------------
create table if not exists public.centre_awards (
  id          text primary key default gen_random_uuid()::text,
  "branchId"  text not null references public.branches(id) on delete cascade,
  name        text not null,
  description text,
  image       text,
  status      text not null default 'ACTIVE' check (status in ('ACTIVE', 'INACTIVE')),
  "awardedAt" date not null default current_date,
  "createdAt" timestamptz not null default now()
);
create index if not exists centre_awards_branch_idx on public.centre_awards ("branchId");

-- ---------------------------------------------------------------------
-- The question bank: one question per row, for a course and subject.
-- Online exams draw from it.
-- ---------------------------------------------------------------------
create table if not exists public.question_bank (
  id          text primary key default gen_random_uuid()::text,
  "branchId"  text not null references public.branches(id) on delete cascade,
  "courseId"  text references public.courses(id) on delete set null,
  subject     text,
  question    text not null,
  options     jsonb not null default '[]'::jsonb,
  answer      text not null,
  status      text not null default 'ACTIVE' check (status in ('ACTIVE', 'INACTIVE')),
  "createdAt" timestamptz not null default now()
);
create index if not exists question_bank_branch_idx on public.question_bank ("branchId", "courseId");

-- ---------------------------------------------------------------------
-- Certificate orders: a centre orders printed certificates for students
-- who have passed; the head office approves and dispatches them.
-- ---------------------------------------------------------------------
create table if not exists public.certificate_orders (
  id           text primary key default gen_random_uuid()::text,
  "orderNo"    text not null default ('ORD-' || to_char(now(), 'YYMMDD') || '-' || upper(substr(md5(random()::text), 1, 4))),
  "branchId"   text not null references public.branches(id) on delete cascade,
  "studentIds" text[] not null default '{}',
  amount       numeric(12,2) not null default 0,
  status       text not null default 'PENDING' check (status in ('PENDING', 'APPROVED', 'DISPATCHED', 'REJECTED')),
  note         text,
  "createdBy"  text default auth.uid()::text,
  "createdAt"  timestamptz not null default now(),
  "updatedAt"  timestamptz not null default now()
);
create index if not exists certificate_orders_branch_idx on public.certificate_orders ("branchId", "createdAt" desc);

-- ---------------------------------------------------------------------
-- One policy shape for all six: the centre's own rows, or the admin's org.
-- A centre may not change a ticket's reply, an award, or an order's status
-- after the fact; those columns are the head office's, enforced below.
-- ---------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['centre_expenses','marketing_expenses','support_tickets','centre_awards','question_bank','certificate_orders'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "Centre or admin reads" on public.%I', t);
    execute format('drop policy if exists "Centre or admin writes" on public.%I', t);
    execute format('create policy "Centre or admin reads" on public.%I for select to authenticated using (public.can_touch_branch("branchId"))', t);
    execute format('create policy "Centre or admin writes" on public.%I for all to authenticated using (public.can_touch_branch("branchId")) with check (public.can_touch_branch("branchId"))', t);
  end loop;
end $$;

-- Awards are given by the head office only.
drop policy if exists "Centre or admin writes" on public.centre_awards;
create policy "Admin writes awards" on public.centre_awards for all to authenticated
  using (public.is_org_admin() and public.can_touch_branch("branchId"))
  with check (public.is_org_admin() and public.can_touch_branch("branchId"));

-- A centre cannot answer its own ticket or approve its own order.
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
  new."updatedAt" := now();
  return new;
end $$;

drop trigger if exists support_tickets_guard on public.support_tickets;
create trigger support_tickets_guard before update on public.support_tickets
  for each row execute function public.guard_head_office_columns();
drop trigger if exists certificate_orders_guard on public.certificate_orders;
create trigger certificate_orders_guard before update on public.certificate_orders
  for each row execute function public.guard_head_office_columns();

-- A centre's order is priced by the head office, not by the centre.
create or replace function public.price_certificate_order()
returns trigger language plpgsql as $$
begin
  if not public.is_org_admin() then new.amount := 0; new.status := 'PENDING'; end if;
  return new;
end $$;
drop trigger if exists certificate_orders_price on public.certificate_orders;
create trigger certificate_orders_price before insert on public.certificate_orders
  for each row execute function public.price_certificate_order();

select tablename, policyname from pg_policies
 where schemaname = 'public'
   and tablename in ('centre_expenses','marketing_expenses','support_tickets','centre_awards','question_bank','certificate_orders')
 order by 1, 2;
