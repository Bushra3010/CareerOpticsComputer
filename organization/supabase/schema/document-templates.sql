-- Templates the institute designs once, and the branch each one belongs to.
--
-- The Document Designer saved its work in `localStorage`. That is one browser:
-- a template an administrator drew was invisible to every other machine, to
-- every branch, and to the pages that actually print a student's documents --
-- which carried their own hardcoded layouts and ignored the designer entirely.
--
-- Two tables. `document_templates` is the organisation's library, and
-- `branch_document_templates` says which of them a branch prints from. A branch
-- with no assignment falls back to the organisation's default for that kind, so
-- nobody is left unable to print.
--
-- Run once in the Supabase SQL editor. Safe to re-run.


-- ---------------------------------------------------------------------
-- 1. The library.
-- ---------------------------------------------------------------------
create table if not exists public.document_templates (
  id text primary key,
  "organizationId" text references public.organizations(id) on delete cascade,
  -- `DocumentKind`: certificate, marksheet, student-id, staff-id, admit-card,
  -- student-award, branch-award, centre-certificate. Text rather than an enum:
  -- the app adds kinds, and a migration per kind is a poor trade.
  kind text not null,
  name text not null,
  -- The whole design: elements, background, background image.
  design jsonb not null,
  -- What a branch prints when nothing was assigned to it.
  "isDefault" boolean not null default false,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create index if not exists "document_templates_org_kind_idx"
  on public.document_templates ("organizationId", kind);

-- One default per kind, per organisation. A partial unique index rather than a
-- constraint, because every non-default row would otherwise collide on false.
create unique index if not exists "document_templates_default_idx"
  on public.document_templates ("organizationId", kind)
  where "isDefault";


-- ---------------------------------------------------------------------
-- 2. Which template a branch prints from.
-- ---------------------------------------------------------------------
create table if not exists public.branch_document_templates (
  id text primary key,
  "branchId" text not null references public.branches(id) on delete cascade,
  kind text not null,
  "templateId" text not null references public.document_templates(id) on delete cascade,
  "updatedAt" timestamptz not null default now()
);

-- A branch prints one template per kind.
create unique index if not exists "branch_document_templates_idx"
  on public.branch_document_templates ("branchId", kind);


-- ---------------------------------------------------------------------
-- 3. Who may read and write them.
--
--    Everyone in the institute reads: a branch has to load the template it
--    prints from. Only an administrator writes -- designing and assigning are
--    the organisation's, which is the same line the courses catalogue draws.
-- ---------------------------------------------------------------------
alter table public.document_templates enable row level security;
alter table public.branch_document_templates enable row level security;

drop policy if exists "Templates readable inside the organisation" on public.document_templates;
drop policy if exists "Templates written by an administrator" on public.document_templates;

create policy "Templates readable inside the organisation" on public.document_templates
  for select to authenticated
  using (public.jwt_role() = 'SUPER_ADMIN' or "organizationId" = public.jwt_org_id());

create policy "Templates written by an administrator" on public.document_templates
  for all to authenticated
  using (
    public.jwt_role() = 'SUPER_ADMIN'
    or (public.is_org_admin() and "organizationId" = public.jwt_org_id())
  )
  with check (
    public.jwt_role() = 'SUPER_ADMIN'
    or (public.is_org_admin() and "organizationId" = public.jwt_org_id())
  );

drop policy if exists "Assignments readable inside the organisation" on public.branch_document_templates;
drop policy if exists "Assignments written by an administrator" on public.branch_document_templates;

create policy "Assignments readable inside the organisation" on public.branch_document_templates
  for select to authenticated
  using (
    public.jwt_role() = 'SUPER_ADMIN'
    or exists (
      select 1 from public.branches b
      where b.id = "branchId" and b."organizationId" = public.jwt_org_id()
    )
  );

create policy "Assignments written by an administrator" on public.branch_document_templates
  for all to authenticated
  using (public.jwt_role() = 'SUPER_ADMIN' or public.is_org_admin())
  with check (public.jwt_role() = 'SUPER_ADMIN' or public.is_org_admin());


notify pgrst, 'reload schema';


-- ---------------------------------------------------------------------
-- 4. Check.
-- ---------------------------------------------------------------------
select t.kind, t.name, t."isDefault", count(a.id) as branches
from public.document_templates t
left join public.branch_document_templates a on a."templateId" = t.id
group by t.id, t.kind, t.name, t."isDefault"
order by t.kind, t.name;
