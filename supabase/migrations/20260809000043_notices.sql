-- 0043: public notices/news — PRD §7.12 ("Public CMS for pages, courses,
-- news/notices, gallery, contact details and SEO metadata") and build plan
-- risk A15 ("Public site content is CMS-driven from the database... from
-- Phase 1"), which never landed: `/notices` and `/notices/[slug]` are named
-- in the build plan's public route map (§2.1) and the PRD's public-site
-- bullet list (§2), and nothing has ever backed them.
--
-- Neither source document gives this table a single column beyond the
-- bullet's own words — no §10.6 ERD row exists for `notices`, `gallery`,
-- `testimonials` or a `pages`/SEO table the way every other domain built
-- this session had one. That is a real gap, not an oversight to paper over
-- with an invented schema for all four at once: this migration ships only
-- `notices`, the one named consistently across both documents (PRD §2 line
-- 25, §7.12; build plan route map and nav) and the simplest, most
-- conventional shape a "news/notices" table can take. Gallery, testimonials,
-- a CMS-backed about/contact/legal, and SEO metadata remain unbuilt —
-- recorded as C13 in docs/02-open-conflicts.md rather than silently
-- expanded into a full CMS nobody asked for the shape of.
--
-- Modelled directly on `courses` (migration 0005), the one other
-- publish-status public-content table already in this schema: same
-- `citext` slug, same "no permission code exists yet, platform-admin only"
-- gap `courses_platform_write`'s own comment already recorded — nothing new
-- is invented here, the precedent is followed exactly.

create table public.notices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  title text not null,
  slug citext not null,
  body text not null,
  status public.catalog_item_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid
);

create unique index notices_org_slug_idx on public.notices (organization_id, slug);
create index notices_status_idx on public.notices (organization_id, status, published_at desc);

create trigger set_updated_at
  before update on public.notices
  for each row execute function app.set_updated_at();

create trigger audit_changes
  after insert or update or delete on public.notices
  for each row execute function app.audit_trigger();

alter table public.notices enable row level security;
alter table public.notices force row level security;

-- The one intentional public read this table has, the same shape
-- `courses_public_read` already established (R22): anyone, signed in or
-- not, reads a published notice once its publish time has arrived.
create policy notices_public_read on public.notices
  for select to anon, authenticated
  using (status = 'active' and (published_at is null or published_at <= now()));

-- Platform-admin only, on purpose: no head-office sub-role exists yet to
-- hold a content-management permission, the exact gap `courses_platform_write`
-- already documents for the course catalogue.
create policy notices_platform_read_all on public.notices
  for select to authenticated
  using (app.is_platform_admin());

create policy notices_platform_write on public.notices
  for all to authenticated
  using (app.is_platform_admin())
  with check (app.is_platform_admin());
