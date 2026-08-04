-- 0011: fees — a fee plan per enrolment, instalments, and insert-only payments
-- with receipt numbers (build plan §3, 0008_fees_ledger subset). Invoices, the
-- double-entry journal, refunds and reversals are deferred; what lands here is
-- the collection path a centre actually needs on day one.
--
-- Every amount is `money_paise` (bigint) — never a rupee numeric. lib/money's
-- branded Paise type is the application-side half of the same rule.

create type public.fee_instalment_status as enum ('pending', 'partially_paid', 'paid', 'waived');

create table public.fee_plans (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  centre_id uuid not null references public.centres (id),
  enrolment_id uuid not null references public.enrolments (id),
  total_paise public.money_paise not null,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid
);

create unique index fee_plans_enrolment_idx on public.fee_plans (enrolment_id);

create table public.fee_instalments (
  id uuid primary key default gen_random_uuid(),
  fee_plan_id uuid not null references public.fee_plans (id) on delete cascade,
  sequence int not null,
  due_date date not null,
  amount_paise public.money_paise not null,
  status public.fee_instalment_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index fee_instalments_plan_sequence_idx
  on public.fee_instalments (fee_plan_id, sequence);
create index fee_instalments_due_date_idx on public.fee_instalments (due_date, status);

-- Insert-only: a posted payment is never edited or deleted. A mistake is
-- corrected by a reversal entry (deferred with refunds), not by mutation.
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  centre_id uuid not null references public.centres (id),
  student_id uuid not null references public.students (id),
  fee_plan_id uuid not null references public.fee_plans (id),
  receipt_number text not null unique,
  amount_paise public.money_paise not null check (amount_paise > 0),
  method public.payment_method not null,
  reference text,
  posted_at timestamptz not null default now(),
  posted_by uuid
);

create index payments_centre_posted_at_idx on public.payments (centre_id, posted_at desc);
create index payments_student_idx on public.payments (student_id);

revoke update, delete on public.payments from authenticated, anon;

-- Which instalment each rupee of a payment settled. Also insert-only: this is
-- the record that makes "how much is this instalment still short?" answerable
-- without recomputing from payment order, and it's what a reversal will later
-- offset rather than delete.
create table public.payment_allocations (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.payments (id),
  fee_instalment_id uuid not null references public.fee_instalments (id),
  amount_paise public.money_paise not null check (amount_paise > 0),
  created_at timestamptz not null default now()
);

create index payment_allocations_payment_idx on public.payment_allocations (payment_id);
create index payment_allocations_instalment_idx on public.payment_allocations (fee_instalment_id);

revoke update, delete on public.payment_allocations from authenticated, anon;

create trigger set_updated_at
  before update on public.fee_plans
  for each row execute function app.set_updated_at();

create trigger set_updated_at
  before update on public.fee_instalments
  for each row execute function app.set_updated_at();

alter table public.fee_plans enable row level security;
alter table public.fee_plans force row level security;
alter table public.fee_instalments enable row level security;
alter table public.fee_instalments force row level security;
alter table public.payments enable row level security;
alter table public.payments force row level security;
alter table public.payment_allocations enable row level security;
alter table public.payment_allocations force row level security;

create policy fee_plans_select on public.fee_plans for select to authenticated
using (
  app.is_platform_admin()
  or (app.has_permission('fee.read', organization_id, centre_id)
      and app.can_access_centre(centre_id))
);

create policy fee_plans_insert on public.fee_plans for insert to authenticated
with check (
  app.has_permission('fee.manage', organization_id, centre_id)
  and app.can_access_centre(centre_id)
  and app.centre_is_operational(centre_id)
);

-- fee_instalments has no centre_id of its own; scope through its plan, the
-- same shape attendance_records uses for its session.
create policy fee_instalments_select on public.fee_instalments for select to authenticated
using (
  exists (
    select 1 from public.fee_plans p
    where p.id = fee_plan_id
      and (app.is_platform_admin()
           or (app.has_permission('fee.read', p.organization_id, p.centre_id)
               and app.can_access_centre(p.centre_id)))
  )
);

create policy fee_instalments_insert on public.fee_instalments for insert to authenticated
with check (
  exists (
    select 1 from public.fee_plans p
    where p.id = fee_plan_id
      and app.has_permission('fee.manage', p.organization_id, p.centre_id)
      and app.can_access_centre(p.centre_id)
  )
);

create policy fee_instalments_update on public.fee_instalments for update to authenticated
using (
  exists (
    select 1 from public.fee_plans p
    where p.id = fee_plan_id
      and app.has_permission('fee.manage', p.organization_id, p.centre_id)
      and app.can_access_centre(p.centre_id)
  )
)
with check (
  exists (
    select 1 from public.fee_plans p
    where p.id = fee_plan_id
      and app.has_permission('fee.manage', p.organization_id, p.centre_id)
      and app.can_access_centre(p.centre_id)
  )
);

-- No UPDATE or DELETE policy for payments at all — the REVOKE above is the
-- grant-level backstop, the absent policy is the RLS-level one.
create policy payments_select on public.payments for select to authenticated
using (
  app.is_platform_admin()
  or (app.has_permission('fee.read', organization_id, centre_id)
      and app.can_access_centre(centre_id))
);

create policy payments_insert on public.payments for insert to authenticated
with check (
  app.has_permission('payment.post', organization_id, centre_id)
  and app.can_access_centre(centre_id)
  and app.centre_is_operational(centre_id)
);

create policy payment_allocations_select on public.payment_allocations for select to authenticated
using (
  exists (
    select 1 from public.payments p
    where p.id = payment_id
      and (app.is_platform_admin()
           or (app.has_permission('fee.read', p.organization_id, p.centre_id)
               and app.can_access_centre(p.centre_id)))
  )
);

create policy payment_allocations_insert on public.payment_allocations for insert to authenticated
with check (
  exists (
    select 1 from public.payments p
    where p.id = payment_id
      and app.has_permission('payment.post', p.organization_id, p.centre_id)
      and app.can_access_centre(p.centre_id)
  )
);

-- Creates the plan and its instalments in one transaction so a plan can never
-- exist with no schedule. SECURITY INVOKER so the RLS policies above apply.
create or replace function public.create_fee_plan(
  p_organization_id uuid,
  p_centre_id uuid,
  p_enrolment_id uuid,
  p_total_paise bigint,
  p_instalment_count int,
  p_first_due_date date
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_plan_id uuid;
  v_base bigint;
  v_remainder bigint;
  v_amount bigint;
  i int;
begin
  if p_instalment_count < 1 then
    raise exception 'Instalment count must be at least 1';
  end if;

  insert into public.fee_plans (organization_id, centre_id, enrolment_id, total_paise)
  values (p_organization_id, p_centre_id, p_enrolment_id, p_total_paise)
  returning id into v_plan_id;

  -- Integer split: the remainder paise go onto the first instalment so the
  -- instalments always sum to exactly the total (never off by a paisa).
  v_base := p_total_paise / p_instalment_count;
  v_remainder := p_total_paise - (v_base * p_instalment_count);

  for i in 1..p_instalment_count loop
    v_amount := v_base + case when i = 1 then v_remainder else 0 end;
    insert into public.fee_instalments (fee_plan_id, sequence, due_date, amount_paise)
    values (
      v_plan_id, i,
      (p_first_due_date + ((i - 1) * interval '1 month'))::date,
      v_amount
    );
  end loop;

  return v_plan_id;
end;
$$;

grant execute on function public.create_fee_plan(uuid, uuid, uuid, bigint, int, date)
  to authenticated;

-- Posts a payment and allocates it across pending instalments oldest-first,
-- updating each instalment's status. One transaction: a receipt can never
-- exist without its allocation, and the allocation can never double-apply.
create or replace function public.post_payment(
  p_organization_id uuid,
  p_centre_id uuid,
  p_student_id uuid,
  p_fee_plan_id uuid,
  p_amount_paise bigint,
  p_method public.payment_method,
  p_reference text
)
returns table (payment_id uuid, receipt_number text)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_receipt text;
  v_payment_id uuid;
  v_centre_code text;
  v_fy text;
  v_remaining bigint := p_amount_paise;
  v_instalment record;
  v_already_allocated bigint;
  v_outstanding bigint;
  v_applied bigint;
begin
  if p_amount_paise <= 0 then
    raise exception 'Payment amount must be positive';
  end if;

  select code into v_centre_code from public.centres where id = p_centre_id;

  -- Indian financial year runs April-March (build plan assumption A4).
  v_fy := case
    when extract(month from now()) >= 4
      then to_char(now(), 'YY') || to_char(now() + interval '1 year', 'YY')
      else to_char(now() - interval '1 year', 'YY') || to_char(now(), 'YY')
  end;

  v_receipt := 'RCP-' || v_centre_code || '-' || v_fy || '-' ||
    lpad(app.next_document_number(p_organization_id, p_centre_id, 'receipt', v_fy)::text, 6, '0');

  insert into public.payments (
    organization_id, centre_id, student_id, fee_plan_id, receipt_number,
    amount_paise, method, reference, posted_by
  )
  values (
    p_organization_id, p_centre_id, p_student_id, p_fee_plan_id, v_receipt,
    p_amount_paise, p_method, p_reference, auth.uid()
  )
  returning id into v_payment_id;

  -- Allocate oldest unpaid instalment first. Each instalment's outstanding
  -- amount comes from its own prior allocations, not from payment ordering,
  -- so a partial payment followed by another lands correctly.
  for v_instalment in
    select id, amount_paise
    from public.fee_instalments
    where fee_plan_id = p_fee_plan_id and status in ('pending', 'partially_paid')
    order by sequence
  loop
    exit when v_remaining <= 0;

    select coalesce(sum(a.amount_paise), 0) into v_already_allocated
    from public.payment_allocations a
    where a.fee_instalment_id = v_instalment.id;

    v_outstanding := v_instalment.amount_paise - v_already_allocated;
    continue when v_outstanding <= 0;

    v_applied := least(v_remaining, v_outstanding);
    v_remaining := v_remaining - v_applied;

    insert into public.payment_allocations (payment_id, fee_instalment_id, amount_paise)
    values (v_payment_id, v_instalment.id, v_applied);

    -- The cast is required: a bare CASE yields text, and `status` is an enum.
    update public.fee_instalments
    set status = (
      case when v_applied >= v_outstanding then 'paid' else 'partially_paid' end
    )::public.fee_instalment_status
    where id = v_instalment.id;
  end loop;

  -- Overpayment is rejected rather than silently kept as a credit: student
  -- wallets/credit balances are a later feature, and quietly swallowing money
  -- with nothing pointing at it is worse than making the cashier fix the
  -- amount. The raise rolls back the payment row too.
  if v_remaining > 0 then
    raise exception 'Payment exceeds the outstanding balance by % paise', v_remaining;
  end if;

  return query select v_payment_id, v_receipt;
end;
$$;

grant execute on function public.post_payment(uuid, uuid, uuid, uuid, bigint, public.payment_method, text)
  to authenticated;
