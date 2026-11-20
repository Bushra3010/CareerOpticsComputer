-- =====================================================================
-- Teacher referral program.
--
-- A teacher login is given a referral code. When someone joins as a teacher
-- on that code, the head office records the referral: who joined, the amount
-- the reward is worked out on (a joining fee, a first month's pay -- whatever
-- the institute pays referrals on), and the teacher's percentage at the time.
-- The reward then moves PENDING -> APPROVED -> PAID, or is REJECTED.
--
-- Who sees what:
--   * an organisation admin reads and writes both tables for its organisation;
--   * a teacher reads their own code and their own referrals, nothing else.
--
-- Safe to re-run.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. One code per teacher.
-- ---------------------------------------------------------------------
create table if not exists public.teacher_referral_codes (
  id                  text primary key default gen_random_uuid()::text,
  "organizationId"    text not null,
  -- The teacher's login (public.users.id = auth.users.id).
  "userId"            text not null references public.users(id) on delete cascade,
  code                text not null check (code ~ '^[A-Z0-9-]{4,20}$'),
  "commissionPercent" numeric(5,2) not null default 10
                        check ("commissionPercent" >= 0 and "commissionPercent" <= 100),
  "isActive"          boolean not null default true,
  "createdAt"         timestamptz not null default now(),
  "updatedAt"         timestamptz not null default now(),
  constraint teacher_referral_codes_user_key unique ("userId")
);

-- A code is quoted out loud; two teachers in one institute cannot share one.
create unique index if not exists teacher_referral_codes_org_code_idx
  on public.teacher_referral_codes ("organizationId", code);


-- ---------------------------------------------------------------------
-- 2. Each referral, and the reward it earns.
-- ---------------------------------------------------------------------
create table if not exists public.teacher_referrals (
  id                  text primary key default gen_random_uuid()::text,
  "organizationId"    text not null,
  -- The teacher who referred, and the code that was quoted.
  "referrerUserId"    text not null references public.users(id) on delete restrict,
  "codeUsed"          text not null,
  -- The person who joined. Linked to their login once they have one.
  "referredName"      text not null check (length(btrim("referredName")) > 0),
  "referredPhone"     text,
  "referredEmail"     text,
  "referredUserId"    text references public.users(id) on delete set null,
  "joinedOn"          date not null default current_date,
  -- The reward: a percentage of the base amount, frozen when recorded so a
  -- later change to the teacher's rate does not rewrite past rewards.
  "baseAmount"        numeric(12,2) not null default 0 check ("baseAmount" >= 0),
  "commissionPercent" numeric(5,2) not null
                        check ("commissionPercent" >= 0 and "commissionPercent" <= 100),
  "rewardAmount"      numeric(12,2) generated always as
                        (round("baseAmount" * "commissionPercent" / 100, 2)) stored,
  status              text not null default 'PENDING'
                        check (status in ('PENDING', 'APPROVED', 'PAID', 'REJECTED')),
  "paidOn"            date,
  "paymentReference"  text,
  note                text,
  "createdBy"         text default auth.uid()::text,
  "createdAt"         timestamptz not null default now(),
  "updatedAt"         timestamptz not null default now()
);

create index if not exists teacher_referrals_org_idx
  on public.teacher_referrals ("organizationId", "joinedOn" desc);
create index if not exists teacher_referrals_referrer_idx
  on public.teacher_referrals ("referrerUserId");


-- ---------------------------------------------------------------------
-- 3. updatedAt.
-- ---------------------------------------------------------------------
create or replace function public.teacher_referrals_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new."updatedAt" := now();
  return new;
end $$;

drop trigger if exists teacher_referral_codes_touch on public.teacher_referral_codes;
create trigger teacher_referral_codes_touch before update on public.teacher_referral_codes
  for each row execute function public.teacher_referrals_touch_updated_at();

drop trigger if exists teacher_referrals_touch on public.teacher_referrals;
create trigger teacher_referrals_touch before update on public.teacher_referrals
  for each row execute function public.teacher_referrals_touch_updated_at();


-- ---------------------------------------------------------------------
-- 4. Row-level security.
-- ---------------------------------------------------------------------
alter table public.teacher_referral_codes enable row level security;
alter table public.teacher_referrals enable row level security;

drop policy if exists "Teacher referral codes org admin" on public.teacher_referral_codes;
drop policy if exists "Teacher reads own referral code" on public.teacher_referral_codes;
drop policy if exists "Teacher referrals org admin" on public.teacher_referrals;
drop policy if exists "Teacher reads own referrals" on public.teacher_referrals;

create policy "Teacher referral codes org admin" on public.teacher_referral_codes
  for all to authenticated
  using (public.is_org_admin() and "organizationId" = public.jwt_org_id())
  with check (public.is_org_admin() and "organizationId" = public.jwt_org_id());

create policy "Teacher reads own referral code" on public.teacher_referral_codes
  for select to authenticated
  using ("userId" = auth.uid()::text);

create policy "Teacher referrals org admin" on public.teacher_referrals
  for all to authenticated
  using (public.is_org_admin() and "organizationId" = public.jwt_org_id())
  with check (public.is_org_admin() and "organizationId" = public.jwt_org_id());

create policy "Teacher reads own referrals" on public.teacher_referrals
  for select to authenticated
  using ("referrerUserId" = auth.uid()::text);


notify pgrst, 'reload schema';
