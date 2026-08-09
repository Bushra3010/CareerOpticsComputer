-- 0032: referrals/commission and support tickets — the rest of build plan's
-- `0011_inventory_referrals_support`. Migration 0031's own header already
-- named this as the deliberate next slice.
--
-- Two interpretive decisions carried across BOTH domains, recorded here
-- rather than left to be guessed from the code:
--
-- 1. NEITHER the qualifying event for a referral (centre approval, student
--    admission, a payment) NOR the initial capture of a referral code (on a
--    public enquiry form, at admission time) is wired into the existing,
--    already-tested `admit_student`, `post_payment` or centre-approval
--    functions in this pass. `record_referral` and `qualify_referral` below
--    are deliberately standalone, HO-triggered actions. Wiring them into
--    those pipelines is real, valuable follow-up work — but it means editing
--    shipped financial/admission code for a feature whose own qualifying
--    rules (§8 of docs/02-open-conflicts.md C10) are themselves still an
--    open decision, and that is the wrong moment to touch tested code.
--
-- 2. `referred entity` (PRD §10.6) and `referral_codes.owner` are genuinely
--    polymorphic in the PRD's own words ("authorised centres/**users**") and
--    neither document names a discriminator. Modelled here as an explicit
--    `_type` + `_id` pair — not a FK, because a FK cannot point at more than
--    one table. Referential integrity for these two columns is therefore an
--    application-level guarantee, not a database one; see C10.
--
-- Ticket priority has no enum values anywhere in either source document —
-- the one enum in the whole PRD/build plan pair that is left completely
-- open. `low` / `medium` / `high` / `urgent` is invented here on the same
-- "cheap now, easy to loosen" reasoning migration 0025's grading defaults
-- used, because leaving it free text would make status filtering and
-- reporting meaningless. Recorded as C11, not silently decided.

-- Referrals and commission ------------------------------------------------

create type public.referral_owner_type as enum ('centre', 'user');
create type public.referred_entity_type as enum ('lead', 'student', 'centre');
create type public.referral_status as enum ('pending', 'attributed', 'expired', 'rejected');
create type public.commission_event as enum ('centre_approval', 'student_admission', 'fee_payment');
create type public.commission_amount_type as enum ('flat', 'percentage');
-- Exact five states PRD §7.11 states.
create type public.commission_status as enum ('pending', 'approved', 'payable', 'paid', 'reversed');

create table public.referral_codes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  owner_type public.referral_owner_type not null,
  owner_id uuid not null,
  code text not null unique,
  valid_until date,
  status public.catalog_item_status not null default 'active',
  created_at timestamptz not null default now(),
  created_by uuid
);

create index referral_codes_owner_idx on public.referral_codes (owner_type, owner_id);

create table public.referrals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  referral_code_id uuid not null references public.referral_codes (id),
  referred_entity_type public.referred_entity_type not null,
  referred_entity_id uuid not null,
  qualifying_event public.commission_event,
  status public.referral_status not null default 'pending',
  attributed_at timestamptz,
  created_at timestamptz not null default now(),
  created_by uuid
);

-- Duplicate detection, PRD §7.11: the same code cannot be recorded twice
-- against the same referred entity.
create unique index referrals_no_duplicate_idx
  on public.referrals (referral_code_id, referred_entity_type, referred_entity_id);
create index referrals_referred_entity_idx on public.referrals (referred_entity_type, referred_entity_id);

create table public.commission_rules (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  event public.commission_event not null,
  amount_type public.commission_amount_type not null,
  flat_amount_paise public.money_paise,
  percentage numeric(5, 2) check (percentage >= 0 and percentage <= 100),
  -- Deliberately inert: PRD §10.6 names "conditions" with no stated grammar.
  -- Stored so a rule can carry a human-readable note today and a real
  -- condition engine later, without a column being added retroactively.
  conditions jsonb,
  effective_from date not null default current_date,
  effective_to date,
  status public.catalog_item_status not null default 'active',
  created_at timestamptz not null default now(),
  created_by uuid,
  constraint commission_rules_amount_matches_type check (
    (amount_type = 'flat' and flat_amount_paise is not null and percentage is null)
    or (amount_type = 'percentage' and percentage is not null and flat_amount_paise is null)
  ),
  constraint commission_rules_dates_ordered check (effective_to is null or effective_to >= effective_from)
);

create index commission_rules_event_idx on public.commission_rules (organization_id, event, status);

-- Insert-only for the money-bearing transitions, the same shape as
-- `wallet_entries`/`inventory_entries`: a correction is a new `reversed`
-- entry, never an edit to a `paid` one. Status DOES change in place here
-- (pending -> approved -> payable -> paid), which the ledger tables never
-- allow — the distinction is that this row IS the approval workflow record,
-- not a movement log; the movement itself lands in `wallet_entries` at the
-- `paid` step via `credit_wallet`.
create table public.commission_entries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  referral_id uuid not null references public.referrals (id),
  commission_rule_id uuid not null references public.commission_rules (id),
  beneficiary_type public.referral_owner_type not null,
  beneficiary_id uuid not null,
  base_amount_paise public.money_paise,
  amount_paise public.money_paise not null check (amount_paise > 0),
  status public.commission_status not null default 'pending',
  -- Populated only when beneficiary_type = 'centre' and status reaches paid —
  -- the wallet ledger row that actually moved the money, for traceability,
  -- the same pattern `orders.wallet_entry_seq` uses.
  wallet_entry_seq bigint references public.wallet_entries (entry_seq),
  -- Populated when beneficiary_type = 'user': the only record of payout for
  -- a beneficiary with no wallet account (migration 0028's `wallet_accounts`
  -- is centre-scoped only — see C10).
  payout_reference text,
  reversed_reason text,
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  approved_by uuid,
  paid_at timestamptz,
  paid_by uuid,
  reversed_at timestamptz,
  reversed_by uuid
);

create index commission_entries_beneficiary_idx on public.commission_entries (beneficiary_type, beneficiary_id, status);

-- Support tickets -----------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'support-private',
  'support-private',
  false,
  10 * 1024 * 1024,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'text/plain']
)
on conflict (id) do nothing;

-- Exact seven states PRD §6.10 step 5 states.
create type public.ticket_status as enum (
  'open', 'assigned', 'waiting_on_support', 'waiting_on_requester',
  'resolved', 'closed', 'reopened'
);
-- Invented default set — see this migration's header and C11.
create type public.ticket_priority as enum ('low', 'medium', 'high', 'urgent');
create type public.ticket_requester_type as enum ('staff', 'student');

create table public.tickets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  centre_id uuid not null references public.centres (id),
  number text not null unique,
  requester_type public.ticket_requester_type not null,
  requester_id uuid not null,
  category text not null,
  priority public.ticket_priority not null default 'medium',
  subject text not null,
  status public.ticket_status not null default 'open',
  assignee_id uuid,
  first_response_at timestamptz,
  resolved_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tickets_centre_status_idx on public.tickets (centre_id, status);
create index tickets_requester_idx on public.tickets (requester_type, requester_id);
create index tickets_assignee_idx on public.tickets (assignee_id) where assignee_id is not null;

create table public.ticket_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets (id) on delete cascade,
  sender_type public.ticket_requester_type not null,
  sender_id uuid not null,
  body text not null,
  -- Exact column name build plan proof R17 already commits to.
  is_internal boolean not null default false,
  attachments text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index ticket_messages_ticket_idx on public.ticket_messages (ticket_id, created_at);

create trigger set_updated_at
  before update on public.tickets
  for each row execute function app.set_updated_at();

create trigger audit_changes
  after insert or update or delete on public.tickets
  for each row execute function app.audit_trigger();

-- Row Level Security ---------------------------------------------------------

alter table public.referral_codes enable row level security;
alter table public.referral_codes force row level security;
alter table public.referrals enable row level security;
alter table public.referrals force row level security;
alter table public.commission_rules enable row level security;
alter table public.commission_rules force row level security;
alter table public.commission_entries enable row level security;
alter table public.commission_entries force row level security;
alter table public.tickets enable row level security;
alter table public.tickets force row level security;
alter table public.ticket_messages enable row level security;
alter table public.ticket_messages force row level security;

-- Referral codes: a centre reads codes it owns; commission.manage (org-wide,
-- currently platform-admin only — see this migration's own gap, mirroring
-- 0031's `product.manage`) reads and writes everything. Matrix gives Centre
-- Owner only "read (own)" — no self-service creation — so there is no
-- centre-scoped write policy at all here, on purpose.
create policy referral_codes_select on public.referral_codes
  for select to authenticated
  using (
    app.is_platform_admin()
    or app.has_permission('referral.manage', organization_id)
    or (owner_type = 'centre'
        and app.has_permission('referral.read', organization_id, owner_id)
        and app.can_access_centre(owner_id))
  );

create policy referral_codes_manage on public.referral_codes
  for all to authenticated
  using (app.is_platform_admin() or app.has_permission('referral.manage', organization_id))
  with check (app.is_platform_admin() or app.has_permission('referral.manage', organization_id));

create policy referrals_select on public.referrals
  for select to authenticated
  using (
    app.is_platform_admin()
    or app.has_permission('referral.manage', organization_id)
    or exists (
      select 1 from public.referral_codes c
      where c.id = referral_code_id
        and c.owner_type = 'centre'
        and app.has_permission('referral.read', c.organization_id, c.owner_id)
        and app.can_access_centre(c.owner_id)
    )
  );

-- No insert/update policy for `referrals`/`commission_rules`/`commission_entries`:
-- every write runs through a SECURITY DEFINER function, the same shape
-- migration 0031 gave `orders`.
create policy commission_rules_select on public.commission_rules
  for select to authenticated
  using (app.is_platform_admin() or app.has_permission('commission.manage', organization_id));

create policy commission_rules_manage on public.commission_rules
  for all to authenticated
  using (app.is_platform_admin() or app.has_permission('commission.manage', organization_id))
  with check (app.is_platform_admin() or app.has_permission('commission.manage', organization_id));

create policy commission_entries_select on public.commission_entries
  for select to authenticated
  using (
    app.is_platform_admin()
    or app.has_permission('commission.manage', organization_id)
    or (beneficiary_type = 'centre'
        and app.has_permission('referral.read', organization_id, beneficiary_id)
        and app.can_access_centre(beneficiary_id))
  );

revoke insert, update, delete on public.referrals from authenticated;
revoke insert, update, delete on public.commission_rules from authenticated;
revoke insert, update, delete on public.commission_entries from authenticated;

-- Tickets: centre staff and the ticket's own student requester see it;
-- everyone with ticket.read at the centre, or an assigned support agent, or
-- head office. All writes to `tickets` itself run through functions.
create policy tickets_select on public.tickets
  for select to authenticated
  using (
    app.is_platform_admin()
    or app.has_permission('ticket.manage', organization_id)
    or (app.has_permission('ticket.read', organization_id, centre_id) and app.can_access_centre(centre_id))
    or (requester_type = 'student' and requester_id = app.current_student_id())
    or assignee_id = auth.uid()
  );

revoke insert, update, delete on public.tickets from authenticated;

create policy ticket_messages_select on public.ticket_messages
  for select to authenticated
  using (
    not is_internal
    and exists (
      select 1 from public.tickets t
      where t.id = ticket_id
        and (
          app.is_platform_admin()
          or (app.has_permission('ticket.read', t.organization_id, t.centre_id) and app.can_access_centre(t.centre_id))
          or (t.requester_type = 'student' and t.requester_id = app.current_student_id())
          or t.assignee_id = auth.uid()
        )
    )
  );

-- The internal-note half of R17's proof: a second, separate policy for
-- internal messages, visible only to the roles the matrix's
-- `ticket.internal_note` row actually names.
create policy ticket_messages_select_internal on public.ticket_messages
  for select to authenticated
  using (
    is_internal
    and exists (
      select 1 from public.tickets t
      where t.id = ticket_id
        and (app.is_platform_admin() or app.has_permission('ticket.internal_note', t.organization_id))
    )
  );

revoke insert, update, delete on public.ticket_messages from authenticated;

-- Functions ------------------------------------------------------------------

create function app.random_referral_code()
returns text
language sql
volatile
set search_path = ''
as $$
  select upper(substr(md5(gen_random_uuid()::text || clock_timestamp()::text), 1, 8));
$$;

-- Issuing a code is a head-office act (matrix: Centre Owner has read-own,
-- never create) — see this migration's header.
create function public.create_referral_code(
  p_organization_id uuid,
  p_owner_type public.referral_owner_type,
  p_owner_id uuid,
  p_valid_until date default null
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_code text;
  v_attempt int := 0;
begin
  if not (app.is_platform_admin() or app.has_permission('referral.manage', p_organization_id)) then
    raise exception 'Not authorised to issue referral codes' using errcode = 'insufficient_privilege';
  end if;

  loop
    v_code := app.random_referral_code();
    begin
      insert into public.referral_codes (organization_id, owner_type, owner_id, code, valid_until, created_by)
      values (p_organization_id, p_owner_type, p_owner_id, v_code, p_valid_until, auth.uid());
      return v_code;
    exception when unique_violation then
      v_attempt := v_attempt + 1;
      if v_attempt > 5 then
        raise exception 'Could not generate a unique referral code' using errcode = 'internal_error';
      end if;
    end;
  end loop;
end;
$$;

-- Records that a code was used against a referred entity. Self-referral is
-- checked for the two cases the schema can actually resolve to one identity
-- (a centre referring itself; a user referring the student they themselves
-- are) — see this migration's header on why `referred entity` is otherwise
-- opaque to the database.
create function public.record_referral(
  p_code text,
  p_referred_entity_type public.referred_entity_type,
  p_referred_entity_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_referral_code public.referral_codes%rowtype;
  v_referral_id uuid;
  v_student_user_id uuid;
begin
  select * into v_referral_code from public.referral_codes where code = upper(btrim(p_code));
  if v_referral_code.id is null then
    raise exception 'Referral code not found' using errcode = 'no_data_found';
  end if;
  if not (app.is_platform_admin() or app.has_permission('referral.manage', v_referral_code.organization_id)) then
    raise exception 'Not authorised to record a referral' using errcode = 'insufficient_privilege';
  end if;
  if v_referral_code.status <> 'active' then
    raise exception 'Referral code is not active' using errcode = 'invalid_parameter_value';
  end if;
  if v_referral_code.valid_until is not null and v_referral_code.valid_until < current_date then
    raise exception 'Referral code has expired' using errcode = 'invalid_parameter_value';
  end if;

  if v_referral_code.owner_type = 'centre' and p_referred_entity_type = 'centre'
     and v_referral_code.owner_id = p_referred_entity_id then
    raise exception 'A centre cannot refer itself' using errcode = 'invalid_parameter_value';
  end if;
  if v_referral_code.owner_type = 'user' and p_referred_entity_type = 'student' then
    select user_id into v_student_user_id from public.students where id = p_referred_entity_id;
    if v_student_user_id = v_referral_code.owner_id then
      raise exception 'A student cannot be referred by themselves' using errcode = 'invalid_parameter_value';
    end if;
  end if;

  insert into public.referrals (organization_id, referral_code_id, referred_entity_type, referred_entity_id, created_by)
  values (v_referral_code.organization_id, v_referral_code.id, p_referred_entity_type, p_referred_entity_id, auth.uid())
  returning id into v_referral_id;

  return v_referral_id;
exception
  when unique_violation then
    raise exception 'This code has already been recorded for this referred entity' using errcode = 'unique_violation';
end;
$$;

-- The qualifying event has happened (a head-office user has confirmed it —
-- see this migration's header on why this is not wired into
-- admit_student/post_payment/centre-approval automatically). Picks the
-- active rule for the event effective today and computes the commission.
create function public.qualify_referral(
  p_referral_id uuid,
  p_event public.commission_event,
  p_base_amount_paise bigint default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_referral public.referrals%rowtype;
  v_code public.referral_codes%rowtype;
  v_rule public.commission_rules%rowtype;
  v_amount bigint;
  v_entry_id uuid;
begin
  select * into v_referral from public.referrals where id = p_referral_id for update;
  if v_referral.id is null then
    raise exception 'Referral not found' using errcode = 'no_data_found';
  end if;
  if not (app.is_platform_admin() or app.has_permission('referral.manage', v_referral.organization_id)) then
    raise exception 'Not authorised to qualify a referral' using errcode = 'insufficient_privilege';
  end if;
  if v_referral.status <> 'pending' then
    raise exception 'Referral is not pending' using errcode = 'invalid_parameter_value';
  end if;

  select * into v_code from public.referral_codes where id = v_referral.referral_code_id;

  select * into v_rule from public.commission_rules
  where organization_id = v_referral.organization_id
    and event = p_event
    and status = 'active'
    and effective_from <= current_date
    and (effective_to is null or effective_to >= current_date)
  order by effective_from desc
  limit 1;
  if v_rule.id is null then
    raise exception 'No active commission rule for this event' using errcode = 'no_data_found';
  end if;

  if v_rule.amount_type = 'percentage' then
    if p_base_amount_paise is null or p_base_amount_paise <= 0 then
      raise exception 'A percentage rule needs a base amount' using errcode = 'invalid_parameter_value';
    end if;
    v_amount := round(p_base_amount_paise * v_rule.percentage / 100.0);
  else
    v_amount := v_rule.flat_amount_paise;
  end if;

  update public.referrals
  set status = 'attributed', qualifying_event = p_event, attributed_at = now()
  where id = p_referral_id;

  insert into public.commission_entries (
    organization_id, referral_id, commission_rule_id,
    beneficiary_type, beneficiary_id, base_amount_paise, amount_paise
  ) values (
    v_referral.organization_id, p_referral_id, v_rule.id,
    v_code.owner_type, v_code.owner_id, p_base_amount_paise, v_amount
  )
  returning id into v_entry_id;

  return v_entry_id;
end;
$$;

create function public.approve_commission(p_commission_entry_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_org uuid;
  v_status public.commission_status;
begin
  select organization_id, status into v_org, v_status from public.commission_entries where id = p_commission_entry_id;
  if v_org is null then raise exception 'Commission entry not found' using errcode = 'no_data_found'; end if;
  if not (app.is_platform_admin() or app.has_permission('commission.manage', v_org)) then
    raise exception 'Not authorised to approve commissions' using errcode = 'insufficient_privilege';
  end if;
  if v_status <> 'pending' then
    raise exception 'Commission is not pending' using errcode = 'invalid_parameter_value';
  end if;
  update public.commission_entries set status = 'approved', approved_at = now(), approved_by = auth.uid()
  where id = p_commission_entry_id;
end;
$$;

create function public.mark_commission_payable(p_commission_entry_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_org uuid;
  v_status public.commission_status;
begin
  select organization_id, status into v_org, v_status from public.commission_entries where id = p_commission_entry_id;
  if v_org is null then raise exception 'Commission entry not found' using errcode = 'no_data_found'; end if;
  if not (app.is_platform_admin() or app.has_permission('commission.manage', v_org)) then
    raise exception 'Not authorised to manage commissions' using errcode = 'insufficient_privilege';
  end if;
  if v_status <> 'approved' then
    raise exception 'Commission is not approved' using errcode = 'invalid_parameter_value';
  end if;
  update public.commission_entries set status = 'payable' where id = p_commission_entry_id;
end;
$$;

-- Pays a payable commission. A centre beneficiary is credited through the
-- existing wallet ledger (migration 0028) — reusing `credit_wallet` rather
-- than inserting a `wallet_entries` row directly, so this never becomes a
-- second implementation of "how does money enter a wallet." A user
-- beneficiary has no wallet account at all (C10) and is settled externally;
-- `p_payout_reference` is mandatory there because it is the only record.
create function public.pay_commission(
  p_commission_entry_id uuid,
  p_payout_reference text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_entry public.commission_entries%rowtype;
  v_wallet_seq bigint;
begin
  select * into v_entry from public.commission_entries where id = p_commission_entry_id for update;
  if v_entry.id is null then raise exception 'Commission entry not found' using errcode = 'no_data_found'; end if;
  if not (app.is_platform_admin() or app.has_permission('commission.manage', v_entry.organization_id)) then
    raise exception 'Not authorised to pay commissions' using errcode = 'insufficient_privilege';
  end if;
  if v_entry.status <> 'payable' then
    raise exception 'Commission is not payable' using errcode = 'invalid_parameter_value';
  end if;

  if v_entry.beneficiary_type = 'centre' then
    -- A fixed, traceable reference rather than the caller-supplied
    -- `p_payout_reference` (which is optional and meaningful only for the
    -- external, no-wallet path below) — this is what lets the wallet row
    -- just written be found precisely afterwards instead of guessing it is
    -- "whatever is now latest", which a concurrent credit to the same
    -- wallet could race.
    perform public.credit_wallet(
      v_entry.beneficiary_id, v_entry.amount_paise,
      'Referral commission', 'commission:' || p_commission_entry_id::text
    );
    select entry_seq into v_wallet_seq
    from public.wallet_entries we
    join public.wallet_accounts wa on wa.id = we.account_id
    where wa.centre_id = v_entry.beneficiary_id
      and we.reference = 'commission:' || p_commission_entry_id::text;
  else
    if coalesce(btrim(p_payout_reference), '') = '' then
      raise exception 'A payout reference is required to settle a user beneficiary' using errcode = 'invalid_parameter_value';
    end if;
  end if;

  update public.commission_entries
  set status = 'paid', paid_at = now(), paid_by = auth.uid(),
      wallet_entry_seq = v_wallet_seq, payout_reference = p_payout_reference
  where id = p_commission_entry_id;
end;
$$;

-- A clawback. If the commission had already been paid into a centre's
-- wallet, the credit is reversed the same way an order cancellation reverses
-- a debit (migration 0031's `app.reverse_wallet_debit`) — except here it is
-- money LEAVING the centre after the fact, which can legitimately take the
-- wallet negative if it has since been spent. That is accepted deliberately:
-- a negative balance is what "the centre now owes head office" means, the
-- same way a real ledger would show it, and no document describes a
-- different resolution.
create function public.reverse_commission(p_commission_entry_id uuid, p_reason text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_entry public.commission_entries%rowtype;
begin
  if coalesce(btrim(p_reason), '') = '' then
    raise exception 'A reason is required to reverse a commission' using errcode = 'invalid_parameter_value';
  end if;

  select * into v_entry from public.commission_entries where id = p_commission_entry_id for update;
  if v_entry.id is null then raise exception 'Commission entry not found' using errcode = 'no_data_found'; end if;
  if not (app.is_platform_admin() or app.has_permission('commission.manage', v_entry.organization_id)) then
    raise exception 'Not authorised to reverse commissions' using errcode = 'insufficient_privilege';
  end if;
  if v_entry.status = 'reversed' then
    raise exception 'Commission is already reversed' using errcode = 'invalid_parameter_value';
  end if;

  if v_entry.status = 'paid' and v_entry.beneficiary_type = 'centre' then
    perform app.reverse_wallet_debit(
      v_entry.beneficiary_id, -v_entry.amount_paise,
      'Reversed commission: ' || p_reason, p_commission_entry_id::text
    );
  end if;

  update public.commission_entries
  set status = 'reversed', reversed_at = now(), reversed_by = auth.uid(), reversed_reason = p_reason
  where id = p_commission_entry_id;
end;
$$;

grant execute on function public.create_referral_code(uuid, public.referral_owner_type, uuid, date) to authenticated;
grant execute on function public.record_referral(text, public.referred_entity_type, uuid) to authenticated;
grant execute on function public.qualify_referral(uuid, public.commission_event, bigint) to authenticated;
grant execute on function public.approve_commission(uuid) to authenticated;
grant execute on function public.mark_commission_payable(uuid) to authenticated;
grant execute on function public.pay_commission(uuid, text) to authenticated;
grant execute on function public.reverse_commission(uuid, text) to authenticated;
revoke all on function public.create_referral_code(uuid, public.referral_owner_type, uuid, date) from public, anon;
revoke all on function public.record_referral(text, public.referred_entity_type, uuid) from public, anon;
revoke all on function public.qualify_referral(uuid, public.commission_event, bigint) from public, anon;
revoke all on function public.approve_commission(uuid) from public, anon;
revoke all on function public.mark_commission_payable(uuid) from public, anon;
revoke all on function public.pay_commission(uuid, text) from public, anon;
revoke all on function public.reverse_commission(uuid, text) from public, anon;

-- Tickets ---------------------------------------------------------------

-- A student or a member of centre staff may raise a ticket for their own
-- centre. Matrix gives every operational role "c/r (own)" and the student
-- "c/r (self)" — broad by design (support access should never be the thing
-- that is hard to reach).
create function public.create_ticket(
  p_centre_id uuid,
  p_category text,
  p_priority public.ticket_priority,
  p_subject text,
  p_body text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_org uuid;
  v_student uuid;
  v_requester_type public.ticket_requester_type;
  v_requester_id uuid;
  v_ticket_id uuid;
  v_number text;
  v_seq bigint;
begin
  select organization_id into v_org from public.centres where id = p_centre_id;
  if v_org is null then raise exception 'Centre not found' using errcode = 'no_data_found'; end if;

  v_student := app.current_student_id();
  if v_student is not null then
    if not exists (select 1 from public.students where id = v_student and centre_id = p_centre_id) then
      raise exception 'Not authorised to raise a ticket for this centre' using errcode = 'insufficient_privilege';
    end if;
    v_requester_type := 'student';
    v_requester_id := v_student;
  elsif app.has_permission('ticket.create', v_org, p_centre_id) and app.can_access_centre(p_centre_id) then
    v_requester_type := 'staff';
    v_requester_id := auth.uid();
  else
    raise exception 'Not authorised to raise a ticket for this centre' using errcode = 'insufficient_privilege';
  end if;

  if coalesce(btrim(p_subject), '') = '' or coalesce(btrim(p_body), '') = '' then
    raise exception 'A ticket needs a subject and a message' using errcode = 'invalid_parameter_value';
  end if;

  v_seq := app.next_document_number(v_org, null, 'ticket', 'all');
  v_number := 'TKT-' || lpad(v_seq::text, 7, '0');

  insert into public.tickets (organization_id, centre_id, number, requester_type, requester_id, category, priority, subject)
  values (v_org, p_centre_id, v_number, v_requester_type, v_requester_id, p_category, p_priority, p_subject)
  returning id into v_ticket_id;

  insert into public.ticket_messages (ticket_id, sender_type, sender_id, body, is_internal)
  values (v_ticket_id, v_requester_type, v_requester_id, p_body, false);

  return v_ticket_id;
end;
$$;

-- A reply (public, notifies the other side) or an internal note (staff-only,
-- PRD §6.10 step 4: "never visible to centre/student users" — enforced
-- above by `ticket_messages_select_internal`, not by this function, since a
-- function's own check is the readable error and RLS is still the backstop).
create function public.add_ticket_message(
  p_ticket_id uuid,
  p_body text,
  p_is_internal boolean default false
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_ticket public.tickets%rowtype;
  v_student uuid;
  v_sender_type public.ticket_requester_type;
  v_sender_id uuid;
  v_message_id uuid;
  v_is_staff boolean;
begin
  select * into v_ticket from public.tickets where id = p_ticket_id for update;
  if v_ticket.id is null then raise exception 'Ticket not found' using errcode = 'no_data_found'; end if;
  if coalesce(btrim(p_body), '') = '' then
    raise exception 'A message needs a body' using errcode = 'invalid_parameter_value';
  end if;

  v_student := app.current_student_id();
  v_is_staff := app.is_platform_admin()
    or app.has_permission('ticket.manage', v_ticket.organization_id)
    or (app.has_permission('ticket.read', v_ticket.organization_id, v_ticket.centre_id) and app.can_access_centre(v_ticket.centre_id))
    or v_ticket.assignee_id = auth.uid();

  if p_is_internal then
    if not (app.is_platform_admin() or app.has_permission('ticket.internal_note', v_ticket.organization_id)) then
      raise exception 'Not authorised to add an internal note' using errcode = 'insufficient_privilege';
    end if;
    v_sender_type := 'staff';
    v_sender_id := auth.uid();
  elsif v_is_staff then
    v_sender_type := 'staff';
    v_sender_id := auth.uid();
  elsif v_ticket.requester_type = 'student' and v_ticket.requester_id = v_student then
    v_sender_type := 'student';
    v_sender_id := v_student;
  else
    raise exception 'Not authorised to reply on this ticket' using errcode = 'insufficient_privilege';
  end if;

  insert into public.ticket_messages (ticket_id, sender_type, sender_id, body, is_internal)
  values (p_ticket_id, v_sender_type, v_sender_id, p_body, p_is_internal)
  returning id into v_message_id;

  if not p_is_internal then
    if v_sender_type = 'staff' and v_ticket.status in ('open', 'assigned', 'waiting_on_support') then
      update public.tickets
      set status = 'waiting_on_requester',
          first_response_at = coalesce(first_response_at, now())
      where id = p_ticket_id;
    elsif v_sender_type = 'student' and v_ticket.status = 'waiting_on_requester' then
      update public.tickets set status = 'waiting_on_support' where id = p_ticket_id;
    end if;
  end if;

  return v_message_id;
end;
$$;

create function public.assign_ticket(p_ticket_id uuid, p_assignee_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_org uuid;
  v_status public.ticket_status;
begin
  select organization_id, status into v_org, v_status from public.tickets where id = p_ticket_id;
  if v_org is null then raise exception 'Ticket not found' using errcode = 'no_data_found'; end if;
  if not (app.is_platform_admin() or app.has_permission('ticket.manage', v_org)) then
    raise exception 'Not authorised to assign tickets' using errcode = 'insufficient_privilege';
  end if;
  if v_status in ('resolved', 'closed') then
    raise exception 'Cannot assign a resolved or closed ticket' using errcode = 'invalid_parameter_value';
  end if;
  update public.tickets set assignee_id = p_assignee_id, status = 'assigned' where id = p_ticket_id;
end;
$$;

create function public.resolve_ticket(p_ticket_id uuid)
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
  if not (app.is_platform_admin() or app.has_permission('ticket.manage', v_org) or v_assignee = auth.uid()) then
    raise exception 'Not authorised to resolve this ticket' using errcode = 'insufficient_privilege';
  end if;
  update public.tickets set status = 'resolved', resolved_at = now() where id = p_ticket_id;
end;
$$;

create function public.close_ticket(p_ticket_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_org uuid;
begin
  select organization_id into v_org from public.tickets where id = p_ticket_id;
  if v_org is null then raise exception 'Ticket not found' using errcode = 'no_data_found'; end if;
  if not (app.is_platform_admin() or app.has_permission('ticket.manage', v_org)) then
    raise exception 'Not authorised to close tickets' using errcode = 'insufficient_privilege';
  end if;
  update public.tickets set status = 'closed', closed_at = now() where id = p_ticket_id;
end;
$$;

-- The requester's own escape hatch — PRD's seventh state exists for exactly
-- this: a resolution the requester disagrees with.
create function public.reopen_ticket(p_ticket_id uuid)
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
    or (v_ticket.requester_type = 'student' and v_ticket.requester_id = v_student)
  ) then
    raise exception 'Not authorised to reopen this ticket' using errcode = 'insufficient_privilege';
  end if;

  update public.tickets set status = 'reopened' where id = p_ticket_id;
end;
$$;

grant execute on function public.create_ticket(uuid, text, public.ticket_priority, text, text) to authenticated;
grant execute on function public.add_ticket_message(uuid, text, boolean) to authenticated;
grant execute on function public.assign_ticket(uuid, uuid) to authenticated;
grant execute on function public.resolve_ticket(uuid) to authenticated;
grant execute on function public.close_ticket(uuid) to authenticated;
grant execute on function public.reopen_ticket(uuid) to authenticated;
revoke all on function public.create_ticket(uuid, text, public.ticket_priority, text, text) from public, anon;
revoke all on function public.add_ticket_message(uuid, text, boolean) from public, anon;
revoke all on function public.assign_ticket(uuid, uuid) from public, anon;
revoke all on function public.resolve_ticket(uuid) from public, anon;
revoke all on function public.close_ticket(uuid) from public, anon;
revoke all on function public.reopen_ticket(uuid) from public, anon;

-- Storage: attachments live at {ticket_id}/{filename}. Access mirrors
-- `ticket_messages_select` — anyone who could read the ticket's messages can
-- read its attachments; anyone who could post to it can attach a file.
create policy support_files_read on storage.objects
  for select to authenticated
  using (
    bucket_id = 'support-private'
    and exists (
      select 1 from public.tickets t
      where t.id = app.path_uuid(name, 1)
        and (
          app.is_platform_admin()
          or app.has_permission('ticket.manage', t.organization_id)
          or (app.has_permission('ticket.read', t.organization_id, t.centre_id) and app.can_access_centre(t.centre_id))
          or (t.requester_type = 'student' and t.requester_id = app.current_student_id())
          or t.assignee_id = auth.uid()
        )
    )
  );

create policy support_files_write on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'support-private'
    and exists (
      select 1 from public.tickets t
      where t.id = app.path_uuid(name, 1)
        and (
          app.is_platform_admin()
          or app.has_permission('ticket.manage', t.organization_id)
          or (app.has_permission('ticket.read', t.organization_id, t.centre_id) and app.can_access_centre(t.centre_id))
          or (t.requester_type = 'student' and t.requester_id = app.current_student_id())
          or t.assignee_id = auth.uid()
        )
    )
  );

-- Permissions ----------------------------------------------------------------

insert into public.permissions (code, description) values
  ('referral.read',    'View referral codes and referrals attributed to a centre'),
  ('referral.manage',  'Issue referral codes, record and qualify referrals'),
  ('commission.manage','Approve, pay and reverse commission entries'),
  ('ticket.read',      'View a centre''s support tickets'),
  ('ticket.create',    'Raise a support ticket for a centre'),
  ('ticket.manage',    'Assign, resolve and close support tickets'),
  ('ticket.internal_note', 'Add or read staff-only internal notes on a ticket')
on conflict (code) do nothing;

-- Matrix: every operational role gets referral.read "own"/"self" is not
-- listed for anyone but Centre Owner — kept literal rather than extended.
insert into public.role_permissions (role_id, permission_code)
select r.id, 'referral.read'
from public.roles r
where r.code = 'centre_owner'
on conflict do nothing;

-- Matrix: ticket.* is "c/r (own)" for every operational centre role.
insert into public.role_permissions (role_id, permission_code)
select r.id, p.code
from public.roles r
cross join (values ('ticket.read'), ('ticket.create')) as p(code)
where r.code in ('centre_owner', 'centre_manager', 'counsellor', 'faculty', 'accountant')
on conflict do nothing;

-- `referral.manage`, `commission.manage`, `ticket.manage` and
-- `ticket.internal_note` are granted to no role here. The matrix gives them
-- to Finance Admin / HO Operator / Support Agent — organisation-wide staff
-- roles the PRD names (§4) but this codebase has never seeded, the same gap
-- migration 0031's header recorded for `product.manage`/`inventory.manage`.
-- A student's `ticket.create`/`ticket.read` (self) is enforced inside
-- `create_ticket`/the RLS policies via `app.current_student_id()`, not
-- through `role_permissions` — students are not members of an
-- organisation's role system the way staff are.
