-- Franchise leads: people who want to open a branch.
--
-- Nothing in the schema models this. `admission_leads` is a student enquiry --
-- a course, a batch preference, a counsellor -- and a franchise applicant is a
-- different thing entirely: an investment budget, a proposed location, a
-- centre to be inspected, an agreement to be signed. Forcing the two into one
-- table would leave most of every row empty.
--
-- Run once in the Supabase SQL editor. Safe to re-run.


-- ---------------------------------------------------------------------
-- 1. The applicant, the place, and the money.
--
--    `status` is the pipeline stage, constrained because the board draws a
--    column per stage and one typo would create a stage of its own.
--
--    Unlike the tables generated from Prisma, `id` and `updatedAt` carry real
--    database defaults, so a PostgREST insert that omits them succeeds.
-- ---------------------------------------------------------------------
create table if not exists public.franchise_leads (
  id                    text primary key default gen_random_uuid()::text,
  "organizationId"      text references public.organizations(id) on delete cascade,
  -- Human-facing reference, printed on the card and quoted on the phone.
  "leadNo"              text,

  -- Applicant
  "directorName"        text not null,
  "ownerName"           text,
  phone                 text not null,
  whatsapp              text,
  email                 text,
  qualification         text,

  -- Proposed branch location
  state                 text,
  district              text,
  block                 text,
  city                  text,
  pincode               text,
  landmark              text,
  "wardNo"              text,
  address               text,

  -- Investment and infrastructure
  "investmentBudget"    text,
  "centreAreaSqFt"      integer,
  computers             integer,
  "expectedOpeningAt"   date,
  -- The four yes/no facilities the intake form asks about. One jsonb column
  -- rather than four booleans: the list is the form's, and it changes.
  facilities            jsonb,

  -- Business
  "businessExperience"  text,
  "franchiseType"       text,
  executive             text,
  remarks               text,

  status                text not null default 'New Lead',
  "followUpAt"          timestamptz,
  "followUpType"        text,
  -- Set once the lead becomes a branch, so a conversion can be traced.
  "branchId"            text references public.branches(id) on delete set null,

  "createdAt"           timestamptz not null default now(),
  "updatedAt"           timestamptz not null default now(),
  "deletedAt"           timestamptz,

  constraint franchise_leads_status_check check (status in (
    'New Lead', 'Contacted', 'Interested', 'Site Visit',
    'Verification', 'Agreement', 'Converted', 'Lost'
  ))
);

create index if not exists "franchise_leads_status_idx"     on public.franchise_leads (status);
create index if not exists "franchise_leads_followUpAt_idx" on public.franchise_leads ("followUpAt");
create index if not exists "franchise_leads_state_idx"      on public.franchise_leads (state);


-- ---------------------------------------------------------------------
-- 2. What has been done about it.
--
--    A site visit that nobody recorded is a site visit nobody can prove
--    happened, and this pipeline runs on exactly that kind of evidence.
-- ---------------------------------------------------------------------
create table if not exists public.franchise_lead_activities (
  id            text primary key default gen_random_uuid()::text,
  "leadId"      text not null references public.franchise_leads(id) on delete cascade,
  kind          text not null,
  note          text,
  status        text,
  "occurredAt"  timestamptz not null default now(),
  "actorId"     text,
  "createdAt"   timestamptz not null default now()
);

create index if not exists "franchise_lead_activities_leadId_idx"
  on public.franchise_lead_activities ("leadId");


-- ---------------------------------------------------------------------
-- 3. Who may read and write one.
--
--    Franchise applications are head office's work -- a branch does not
--    recruit the branch next door -- so this is org admins only, unlike the
--    admission leads a branch works itself.
--
--    SUPER_ADMIN is listed separately for the reason user-management.sql
--    gives: that account often carries no organizationId, and `null = null` is
--    NULL rather than true.
-- ---------------------------------------------------------------------
alter table public.franchise_leads           enable row level security;
alter table public.franchise_lead_activities enable row level security;

drop policy if exists "Read own franchise leads"  on public.franchise_leads;
drop policy if exists "Write own franchise leads" on public.franchise_leads;

create policy "Read own franchise leads" on public.franchise_leads
  for select to authenticated
  using (
    public.jwt_role() = 'SUPER_ADMIN'
    or (public.is_org_admin() and "organizationId" = public.jwt_org_id())
  );

create policy "Write own franchise leads" on public.franchise_leads
  for all to authenticated
  using (
    public.jwt_role() = 'SUPER_ADMIN'
    or (public.is_org_admin() and "organizationId" = public.jwt_org_id())
  )
  with check (
    public.jwt_role() = 'SUPER_ADMIN'
    or (public.is_org_admin() and "organizationId" = public.jwt_org_id())
  );

drop policy if exists "Read own franchise lead activities"  on public.franchise_lead_activities;
drop policy if exists "Write own franchise lead activities" on public.franchise_lead_activities;

-- The activity has no organisation of its own, so it inherits the lead's reach.
create policy "Read own franchise lead activities" on public.franchise_lead_activities
  for select to authenticated
  using (exists (select 1 from public.franchise_leads l where l.id = "leadId"));

create policy "Write own franchise lead activities" on public.franchise_lead_activities
  for all to authenticated
  using (exists (select 1 from public.franchise_leads l where l.id = "leadId"))
  with check (exists (select 1 from public.franchise_leads l where l.id = "leadId"));


-- ---------------------------------------------------------------------
-- 4. Check what is in place now.
-- ---------------------------------------------------------------------
select tablename, policyname, cmd from pg_policies
 where schemaname = 'public'
   and tablename in ('franchise_leads', 'franchise_lead_activities')
 order by tablename, policyname;
