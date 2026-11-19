-- The website's blog, written in the ERP (Website -> Blog, /computercentre/website/blog).
--
-- blog.html and blog-post.html read the published rows here with the anon
-- key, so a post saved in the ERP shows on the live site without a deploy.
-- Cover pictures go to the public `website` bucket under blog/, which
-- website-content.sql already lets an org admin write.
--
-- The body is plain text: a blank line starts a new paragraph, "## " a
-- heading, "- " a bullet and "1. " a numbered point.
--
-- Needs is_org_admin() and jwt_org_id() from RUN-ALL.sql. Safe to re-run.

create table if not exists public.blog_posts (
  id               text primary key default gen_random_uuid()::text,
  "organizationId" text not null,
  slug             text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title            text not null,
  excerpt          text,
  category         text,
  "coverUrl"       text,
  body             text not null default '',
  "publishedOn"    date not null default current_date,
  "isPublished"    boolean not null default true,
  "createdAt"      timestamptz not null default now(),
  "updatedAt"      timestamptz not null default now()
);

create index if not exists "blog_posts_org_date_idx"
  on public.blog_posts ("organizationId", "publishedOn" desc);

alter table public.blog_posts enable row level security;

drop policy if exists "Anyone reads published blog posts" on public.blog_posts;
drop policy if exists "Organisation manages its blog posts" on public.blog_posts;

create policy "Anyone reads published blog posts" on public.blog_posts
  for select to anon, authenticated
  using ("isPublished" = true);

create policy "Organisation manages its blog posts" on public.blog_posts
  for all to authenticated
  using (public.is_org_admin() and "organizationId" = public.jwt_org_id())
  with check (public.is_org_admin() and "organizationId" = public.jwt_org_id());

grant select on public.blog_posts to anon;
grant select, insert, update, delete on public.blog_posts to authenticated;

notify pgrst, 'reload schema';

select tablename, policyname, cmd from pg_policies
 where schemaname = 'public' and tablename = 'blog_posts' order by policyname;
