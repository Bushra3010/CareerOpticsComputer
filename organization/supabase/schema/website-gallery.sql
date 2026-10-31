-- The photo gallery of the public website, managed from the ERP
-- (Main Website -> Gallery, /computercentre/website/gallery).
--
-- The website's gallery.html and the home page read the published rows here
-- with the anon key, so a photo added in the ERP shows on the live site
-- without a deploy. The images themselves sit in the public `website` bucket
-- under gallery/, created by website-content.sql.
--
-- Needs website-content.sql (the bucket and its policies), and is_org_admin()
-- and jwt_org_id() from RUN-ALL.sql. Run once in the Supabase SQL editor.
-- Safe to re-run.


-- ---------------------------------------------------------------------
-- 1. The photos.
--
--    `sortOrder`, not `order`: `order` is reserved in SQL and would have to
--    be quoted in every PostgREST query the website sends.
--
--    `id` and `updatedAt` carry real defaults, so a PostgREST insert that
--    omits them succeeds.
-- ---------------------------------------------------------------------
create table if not exists public.gallery_items (
  id                text primary key default gen_random_uuid()::text,
  "organizationId"  text not null,
  title             text,
  category          text,
  "imageUrl"        text not null,
  "sortOrder"       integer not null default 0,
  "isPublished"     boolean not null default true,
  "createdAt"       timestamptz not null default now(),
  "updatedAt"       timestamptz not null default now()
);

-- The website asks for published rows in display order on every visit.
create index if not exists "gallery_items_org_sort_idx"
  on public.gallery_items ("organizationId", "sortOrder");


-- ---------------------------------------------------------------------
-- 2. Who may read and write it.
--
--    Anyone may read a published photo: the website is public and reads
--    without signing in. A hidden photo is seen only by the admins who hid
--    it -- the second policy covers select as well as the writes.
--
--    Writes stay inside the admin's own organisation. The organisation is
--    read from the token's app_metadata (jwt_org_id), never from the row the
--    browser sends, so an admin cannot file photos under someone else.
-- ---------------------------------------------------------------------
alter table public.gallery_items enable row level security;

drop policy if exists "Anyone reads published gallery photos"   on public.gallery_items;
drop policy if exists "Organisation manages its gallery photos" on public.gallery_items;

create policy "Anyone reads published gallery photos" on public.gallery_items
  for select to anon, authenticated
  using ("isPublished" = true);

create policy "Organisation manages its gallery photos" on public.gallery_items
  for all to authenticated
  using (public.is_org_admin() and "organizationId" = public.jwt_org_id())
  with check (public.is_org_admin() and "organizationId" = public.jwt_org_id());


-- ---------------------------------------------------------------------
-- 3. The images.
--
--    Nothing to add: website-content.sql already lets anyone read the
--    `website` bucket and lets an org admin upload, replace and remove any
--    object in it, gallery/ included.
-- ---------------------------------------------------------------------


-- ---------------------------------------------------------------------
-- 4. Check what is in place now.
-- ---------------------------------------------------------------------
select tablename, policyname, cmd, roles from pg_policies
 where schemaname = 'public' and tablename = 'gallery_items'
 order by policyname;
