-- 0028: the wallet — Phase 5's foundation, and the ledger CLAUDE.md rule 4
-- names. One account per centre; the balance IS the sum of the entries, never
-- a stored column, because a stored balance and its ledger can disagree and
-- the ledger is the one that is true.
--
-- No payment gateway exists yet (build plan assumption: none before Phase 5's
-- gateway work), so credit is a head-office act recorded after an offline
-- payment — which is how the academy already operates. Debits are what the
-- system takes for admissions and exam fees when those integrations land;
-- the function ships now because P6 (idempotent debit) is a build-plan proof
-- that has been waiting on this table since Phase 0.

create table public.wallet_accounts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  centre_id uuid not null references public.centres (id) unique,
  created_at timestamptz not null default now()
);

create table public.wallet_entries (
  -- Identity, not uuid: a ledger wants an order that cannot be argued with.
  entry_seq bigint generated always as identity primary key,
  account_id uuid not null references public.wallet_accounts (id),
  organization_id uuid not null,
  -- Signed paise: positive credits, negative debits. The sum is the balance.
  amount_paise bigint not null check (amount_paise <> 0),
  entry_type text not null check (entry_type in ('recharge', 'debit', 'reversal')),
  reason text not null,
  reference text,
  -- The idempotency guard P6 is about. Partial-unique so rows without a key
  -- (recharges, reversals) do not collide on null.
  idempotency_key text,
  created_at timestamptz not null default now(),
  created_by uuid,
  constraint wallet_entries_reason_not_blank check (length(btrim(reason)) > 0)
);

create unique index wallet_entries_idempotency_idx
  on public.wallet_entries (account_id, idempotency_key)
  where idempotency_key is not null;

create index wallet_entries_account_idx
  on public.wallet_entries (account_id, entry_seq desc);

-- Insert-only at the privilege level. Corrections are reversal rows.
revoke insert, update, delete on public.wallet_accounts from authenticated;
revoke insert, update, delete on public.wallet_entries from authenticated;

alter table public.wallet_accounts enable row level security;
alter table public.wallet_accounts force row level security;
alter table public.wallet_entries enable row level security;
alter table public.wallet_entries force row level security;

create policy wallet_accounts_read on public.wallet_accounts
  for select to authenticated
  using (
    app.is_platform_admin()
    or app.has_permission('wallet.read', organization_id)
    or (app.has_permission('wallet.read', organization_id, centre_id)
        and app.can_access_centre(centre_id))
  );

create policy wallet_entries_read on public.wallet_entries
  for select to authenticated
  using (
    exists (
      select 1 from public.wallet_accounts a
      where a.id = account_id
        and (app.is_platform_admin()
             or app.has_permission('wallet.read', a.organization_id)
             or (app.has_permission('wallet.read', a.organization_id, a.centre_id)
                 and app.can_access_centre(a.centre_id)))
    )
  );

-- The account row is created lazily by the first credit rather than by centre
-- approval, so existing centres need no backfill and new ones need no hook.
create function app.ensure_wallet_account(p_centre_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
  v_org uuid;
begin
  select id into v_id from public.wallet_accounts where centre_id = p_centre_id;
  if v_id is not null then return v_id; end if;

  select organization_id into v_org from public.centres where id = p_centre_id;
  if v_org is null then
    raise exception 'Centre not found' using errcode = 'no_data_found';
  end if;

  insert into public.wallet_accounts (organization_id, centre_id)
  values (v_org, p_centre_id)
  on conflict (centre_id) do nothing;

  select id into v_id from public.wallet_accounts where centre_id = p_centre_id;
  return v_id;
end;
$$;

-- Head office records money received from a centre. wallet.manage is
-- organisation-level, which after migration 0020 a centre-scoped membership
-- cannot satisfy — a centre cannot top up its own wallet.
create function public.credit_wallet(
  p_centre_id uuid,
  p_amount_paise bigint,
  p_reason text,
  p_reference text default null
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_account uuid;
  v_org uuid;
begin
  if p_amount_paise <= 0 then
    raise exception 'A recharge must be a positive amount' using errcode = 'invalid_parameter_value';
  end if;

  select organization_id into v_org from public.centres where id = p_centre_id;
  if v_org is null then
    raise exception 'Centre not found' using errcode = 'no_data_found';
  end if;

  if not (app.is_platform_admin() or app.has_permission('wallet.manage', v_org)) then
    raise exception 'Not authorised to recharge wallets' using errcode = 'insufficient_privilege';
  end if;

  v_account := app.ensure_wallet_account(p_centre_id);

  insert into public.wallet_entries
    (account_id, organization_id, amount_paise, entry_type, reason, reference, created_by)
  values
    (v_account, v_org, p_amount_paise, 'recharge', p_reason, p_reference, auth.uid());

  return (select coalesce(sum(amount_paise), 0) from public.wallet_entries
          where account_id = v_account);
end;
$$;

-- P6, finally against the real ledger: the same idempotency key can hit this
-- any number of times and the money moves once.
create function public.debit_wallet(
  p_centre_id uuid,
  p_amount_paise bigint,
  p_reason text,
  p_idempotency_key text
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_account uuid;
  v_org uuid;
  v_balance bigint;
begin
  if p_amount_paise <= 0 then
    raise exception 'A debit must be a positive amount' using errcode = 'invalid_parameter_value';
  end if;
  if p_idempotency_key is null or length(btrim(p_idempotency_key)) = 0 then
    raise exception 'A debit needs an idempotency key' using errcode = 'invalid_parameter_value';
  end if;

  select organization_id into v_org from public.centres where id = p_centre_id;
  if v_org is null then
    raise exception 'Centre not found' using errcode = 'no_data_found';
  end if;

  -- Spending needs centre standing, unlike crediting: wallet.manage at the
  -- organisation, or wallet.debit held at this centre.
  if not (app.is_platform_admin()
          or app.has_permission('wallet.manage', v_org)
          or (app.has_permission('wallet.debit', v_org, p_centre_id)
              and app.can_access_centre(p_centre_id))) then
    raise exception 'Not authorised to debit this wallet' using errcode = 'insufficient_privilege';
  end if;

  v_account := app.ensure_wallet_account(p_centre_id);

  -- Serialise on the account row: two concurrent debits must not both read the
  -- same balance and both pass the sufficiency check.
  perform 1 from public.wallet_accounts where id = v_account for update;

  -- Replay? Return the current balance and move nothing.
  if exists (
    select 1 from public.wallet_entries
    where account_id = v_account and idempotency_key = p_idempotency_key
  ) then
    return (select coalesce(sum(amount_paise), 0) from public.wallet_entries
            where account_id = v_account);
  end if;

  select coalesce(sum(amount_paise), 0) into v_balance
  from public.wallet_entries where account_id = v_account;

  if v_balance < p_amount_paise then
    raise exception 'Insufficient wallet balance' using errcode = 'invalid_parameter_value';
  end if;

  insert into public.wallet_entries
    (account_id, organization_id, amount_paise, entry_type, reason, idempotency_key, created_by)
  values
    (v_account, v_org, -p_amount_paise, 'debit', p_reason, p_idempotency_key, auth.uid());

  return v_balance - p_amount_paise;
end;
$$;

revoke all on function app.ensure_wallet_account(uuid) from public, anon, authenticated;
revoke all on function public.credit_wallet(uuid, bigint, text, text) from public, anon;
revoke all on function public.debit_wallet(uuid, bigint, text, text) from public, anon;
grant execute on function public.credit_wallet(uuid, bigint, text, text) to authenticated;
grant execute on function public.debit_wallet(uuid, bigint, text, text) to authenticated;

insert into public.permissions (code, description) values
  ('wallet.read',   'View a centre wallet and its ledger'),
  ('wallet.manage', 'Recharge wallets and correct entries (head office)'),
  ('wallet.debit',  'Spend from the centre wallet')
on conflict (code) do nothing;

-- Owner and accountant see the wallet; owner spends. Nobody at a centre
-- recharges — that is head office's, per the PRD's franchise model.
insert into public.role_permissions (role_id, permission_code)
select r.id, p.code
from public.roles r
cross join (values ('wallet.read'), ('wallet.debit')) as p(code)
where r.code = 'centre_owner'
on conflict do nothing;

insert into public.role_permissions (role_id, permission_code)
select r.id, 'wallet.read'
from public.roles r
where r.code in ('centre_manager', 'accountant')
on conflict do nothing;
