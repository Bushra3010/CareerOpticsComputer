-- =====================================================================
-- Partners: referral partners the head office pays commission to, and the
-- ledger of what each has earned and been paid.
--
-- The Partners pages were sample records that saved nothing. These two
-- tables back them. Only an organisation admin of the partner's own
-- organisation can read or write either table -- centre staff and students
-- have no business seeing commission rates or payouts.
--
-- Safe to re-run.
-- =====================================================================

-- ---------------------------------------------------------------------
-- partners
-- ---------------------------------------------------------------------
create table if not exists public.partners (
  id                  text primary key default gen_random_uuid()::text,
  -- Deliberately not a foreign key: `organizations.id` is text on this
  -- database and uuid on others, and a type mismatch would abort the script.
  "organizationId"    text not null,
  name                text not null check (length(btrim(name)) > 0),
  "partnerType"       text not null default 'individual'
                        check ("partnerType" in ('individual', 'organization', 'institution')),
  "contactPerson"     text,
  phone               text,
  email               text,
  address             text,
  city                text,
  state               text,
  "commissionPercent" numeric(5,2) not null default 0
                        check ("commissionPercent" >= 0 and "commissionPercent" <= 100),
  status              text not null default 'ACTIVE' check (status in ('ACTIVE', 'INACTIVE')),
  notes               text,
  "createdAt"         timestamptz not null default now(),
  "updatedAt"         timestamptz not null default now(),
  "deletedAt"         timestamptz,
  -- Lets a transaction's foreign key carry the organisation too, so a ledger
  -- row can never point at another organisation's partner.
  constraint partners_id_org_key unique (id, "organizationId")
);

create index if not exists partners_org_idx
  on public.partners ("organizationId", name) where "deletedAt" is null;

create or replace function public.partners_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new."updatedAt" := now();
  return new;
end $$;

drop trigger if exists partners_touch_updated_at on public.partners;
create trigger partners_touch_updated_at before update on public.partners
  for each row execute function public.partners_touch_updated_at();

alter table public.partners enable row level security;

drop policy if exists "Partners org admin" on public.partners;
create policy "Partners org admin" on public.partners
  for all to authenticated
  using (public.is_org_admin() and "organizationId" = public.jwt_org_id())
  with check (public.is_org_admin() and "organizationId" = public.jwt_org_id());


-- ---------------------------------------------------------------------
-- partner_transactions
--
-- Amounts are always positive; the type says which way the money moves.
-- COMMISSION is owed to the partner, PAYOUT is paid to them. An ADJUSTMENT
-- can go either way, so it alone carries a direction (CREDIT adds to what is
-- owed, DEBIT takes from it). Balance = commission - payouts +/- adjustments.
-- ---------------------------------------------------------------------
create table if not exists public.partner_transactions (
  id               text primary key default gen_random_uuid()::text,
  "organizationId" text not null,
  "partnerId"      text not null,
  type             text not null check (type in ('COMMISSION', 'PAYOUT', 'ADJUSTMENT')),
  direction        text check (direction in ('CREDIT', 'DEBIT')),
  amount           numeric(12,2) not null check (amount > 0),
  reference        text,
  note             text,
  date             date not null default current_date,
  "createdBy"      text default auth.uid()::text,
  "createdAt"      timestamptz not null default now(),
  constraint partner_transactions_direction_chk
    check ((type = 'ADJUSTMENT') = (direction is not null)),
  -- Partners are soft-deleted, so their ledger stays; a hard delete of a
  -- partner with history is refused rather than silently erasing payouts.
  constraint partner_transactions_partner_fk
    foreign key ("partnerId", "organizationId")
    references public.partners (id, "organizationId") on delete restrict
);

create index if not exists partner_transactions_org_idx
  on public.partner_transactions ("organizationId", date desc);
create index if not exists partner_transactions_partner_idx
  on public.partner_transactions ("partnerId");

alter table public.partner_transactions enable row level security;

drop policy if exists "Partner transactions org admin" on public.partner_transactions;
create policy "Partner transactions org admin" on public.partner_transactions
  for all to authenticated
  using (public.is_org_admin() and "organizationId" = public.jwt_org_id())
  with check (public.is_org_admin() and "organizationId" = public.jwt_org_id());
