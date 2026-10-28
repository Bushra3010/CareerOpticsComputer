-- Content of the public website, edited from the ERP ("Website Content").
--
-- The website itself is static HTML (organization/website). Every page loads
-- website/cms.js, which reads this table with the anon key and lays the saved
-- edits over the page. So a row here changes the live site without a deploy.
--
--   id = 'settings'      site-wide details: phone, WhatsApp, email, address,
--                        social links, the announcement bar.
--   id = 'page:<name>'   edits to one page (<name>.html): text, images, links
--                        and hidden blocks, keyed by the element's position.
--
-- Run once in the Supabase SQL editor. Safe to re-run.


-- ---------------------------------------------------------------------
-- 1. The content.
-- ---------------------------------------------------------------------
create table if not exists public.website_content (
  id           text primary key,
  data         jsonb not null default '{}'::jsonb,
  "updatedAt"  timestamptz not null default now(),
  "updatedBy"  text
);


-- ---------------------------------------------------------------------
-- 2. Who may read and write it.
--
--    Anyone may read: the website is public and reads it without signing in.
--    Only the organisation writes it -- a branch has its own mini-site under
--    "Website Settings", not a say over the main one.
--
--    is_org_admin() comes from branch-scoped-wallet-rls.sql (RUN-ALL.sql).
-- ---------------------------------------------------------------------
alter table public.website_content enable row level security;

drop policy if exists "Anyone reads website content"         on public.website_content;
drop policy if exists "Organisation writes website content"  on public.website_content;

create policy "Anyone reads website content" on public.website_content
  for select to anon, authenticated
  using (true);

create policy "Organisation writes website content" on public.website_content
  for all to authenticated
  using (public.is_org_admin())
  with check (public.is_org_admin());


-- ---------------------------------------------------------------------
-- 3. Images uploaded from the editor.
--
--    A public bucket, so the website can show them by plain URL.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('website', 'website', true)
on conflict (id) do update set public = true;

drop policy if exists "Anyone reads website images"        on storage.objects;
drop policy if exists "Organisation uploads website images" on storage.objects;
drop policy if exists "Organisation changes website images" on storage.objects;
drop policy if exists "Organisation removes website images" on storage.objects;

create policy "Anyone reads website images" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'website');

create policy "Organisation uploads website images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'website' and public.is_org_admin());

create policy "Organisation changes website images" on storage.objects
  for update to authenticated
  using (bucket_id = 'website' and public.is_org_admin());

create policy "Organisation removes website images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'website' and public.is_org_admin());


-- ---------------------------------------------------------------------
-- 4. Check what is in place now.
-- ---------------------------------------------------------------------
select tablename, policyname, cmd from pg_policies
 where schemaname = 'public' and tablename = 'website_content'
 order by policyname;
