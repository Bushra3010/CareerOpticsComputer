-- Admission leads: the enquiries a centre works on until they become students.
--
-- `visit_enquiries` already records who walked in, and Reception runs on it.
-- This is a separate register on purpose: a lead is worked for weeks through
-- counselling and a demo class, carries a counsellor and an expected admission
-- date, and keeps a history of every call made about it. A visit is one event.
--
-- Run once in the Supabase SQL editor. Safe to re-run.


-- ---------------------------------------------------------------------
-- 1. The lead.
--
--    `status` is the pipeline stage. It is constrained rather than free text
--    because the board draws a column per stage, and one typo would create a
--    seventh column with one card in it.
--
--    Unlike the tables generated from Prisma, `id` and `updatedAt` carry real
--    database defaults, so a PostgREST insert that omits them succeeds.
-- ---------------------------------------------------------------------
create table if not exists public.admission_leads (
  id                    text primary key default gen_random_uuid()::text,
  "organizationId"      text references public.organizations(id) on delete cascade,
  -- Nullable: head office logs leads that no branch has picked up yet.
  "branchId"            text references public.branches(id) on delete set null,

  "studentName"         text not null,
  "parentName"          text,
  phone                 text not null,
  whatsapp              text,
  email                 text,
  qualification         text,
  address               text,
  city                  text,

  "courseInterested"    text,
  "preferredBatch"      text,
  source                text,
  counsellor            text,
  "expectedAdmissionAt" date,

  status                text not null default 'New',
  remarks               text,

  -- When the next call is due, and what kind of call it is. Both null until
  -- somebody schedules one, which is what "no follow-up set" means on screen.
  "followUpAt"          timestamptz,
  "followUpType"        text,

  -- Set when the lead becomes a student, so a converted lead can be traced to
  -- the admission it produced.
  "studentId"           text references public.students(id) on delete set null,

  "createdAt"           timestamptz not null default now(),
  "updatedAt"           timestamptz not null default now(),
  "deletedAt"           timestamptz,

  constraint admission_leads_status_check check (status in (
    'New', 'Contacted', 'Interested', 'Counselling', 'Demo Class',
    'Admission', 'Not Interested', 'Lost'
  ))
);

create index if not exists "admission_leads_branchId_idx"   on public.admission_leads ("branchId");
create index if not exists "admission_leads_status_idx"     on public.admission_leads (status);
-- The follow-up list is read by date every morning.
create index if not exists "admission_leads_followUpAt_idx" on public.admission_leads ("followUpAt");


-- ---------------------------------------------------------------------
-- 2. What has been done about it.
--
--    A lead's history is the reason anyone trusts its stage: "Interested" with
--    no call logged against it is a guess. Every stage change and every
--    follow-up writes a row here, and the row is never edited.
-- ---------------------------------------------------------------------
create table if not exists public.admission_lead_activities (
  id            text primary key default gen_random_uuid()::text,
  "leadId"      text not null references public.admission_leads(id) on delete cascade,
  kind          text not null,
  note          text,
  -- The stage the lead was moved to by this activity, when it moved one.
  status        text,
  "occurredAt"  timestamptz not null default now(),
  "actorId"     text,
  "createdAt"   timestamptz not null default now()
);

create index if not exists "admission_lead_activities_leadId_idx"
  on public.admission_lead_activities ("leadId");


-- ---------------------------------------------------------------------
-- 3. Who may read and write a lead.
--
--    A branch works its own leads; head office sees every branch's. A lead
--    with no branch yet is head office's until it is handed to one, which is
--    why the branch check allows null for an org admin only.
--
--    SUPER_ADMIN is listed separately for the reason user-management.sql
--    gives: that account often carries no organizationId, and `null = null` is
--    NULL rather than true.
-- ---------------------------------------------------------------------
alter table public.admission_leads           enable row level security;
alter table public.admission_lead_activities enable row level security;

drop policy if exists "Read own leads"  on public.admission_leads;
drop policy if exists "Write own leads" on public.admission_leads;

create policy "Read own leads" on public.admission_leads
  for select to authenticated
  using (
    public.jwt_role() = 'SUPER_ADMIN'
    or (public.is_org_admin() and "organizationId" = public.jwt_org_id())
    or "branchId" = public.jwt_branch_id()
  );

create policy "Write own leads" on public.admission_leads
  for all to authenticated
  using (
    public.jwt_role() = 'SUPER_ADMIN'
    or (public.is_org_admin() and "organizationId" = public.jwt_org_id())
    or "branchId" = public.jwt_branch_id()
  )
  with check (
    public.jwt_role() = 'SUPER_ADMIN'
    or (public.is_org_admin() and "organizationId" = public.jwt_org_id())
    or "branchId" = public.jwt_branch_id()
  );

drop policy if exists "Read own lead activities"  on public.admission_lead_activities;
drop policy if exists "Write own lead activities" on public.admission_lead_activities;

-- The activity has no branch of its own, so it inherits the lead's reach.
create policy "Read own lead activities" on public.admission_lead_activities
  for select to authenticated
  using (exists (select 1 from public.admission_leads l where l.id = "leadId"));

create policy "Write own lead activities" on public.admission_lead_activities
  for all to authenticated
  using (exists (select 1 from public.admission_leads l where l.id = "leadId"))
  with check (exists (select 1 from public.admission_leads l where l.id = "leadId"));


-- ---------------------------------------------------------------------
-- 4. Check what is in place now.
-- ---------------------------------------------------------------------
select tablename, policyname, cmd from pg_policies
 where schemaname = 'public'
   and tablename in ('admission_leads', 'admission_lead_activities')
 order by tablename, policyname;
