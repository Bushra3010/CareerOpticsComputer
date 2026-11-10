-- =====================================================================
-- The posters on the panel's dashboard (admin and every centre), set from
-- Website -> Dashboard Posters instead of the code.
--
-- A poster is either a text slide (badge, heading, line, colour) or an
-- uploaded poster image, with an optional link. Everyone signed in to the
-- organisation reads the active ones; only an organisation admin edits.
-- The three slides the dashboard had in code are seeded once.
-- Safe to re-run.
-- =====================================================================

create table if not exists public.dashboard_banners (
  id               text primary key default gen_random_uuid()::text,
  "organizationId" text not null,
  kicker           text,
  title            text,
  "text"           text,
  tone             text not null default 'blue',
  "imageUrl"       text,
  "linkUrl"        text,
  "sortOrder"      integer not null default 0,
  "isActive"       boolean not null default true,
  "createdAt"      timestamptz not null default now(),
  "updatedAt"      timestamptz not null default now(),
  constraint dashboard_banners_tone_check check (tone in ('blue','orange','teal','red','purple','green')),
  constraint dashboard_banners_image_check check ("imageUrl" is null or "imageUrl" ~ '^https://'),
  constraint dashboard_banners_link_check check ("linkUrl" is null or "linkUrl" ~ '^(https://|/)')
);
create index if not exists dashboard_banners_org_idx on public.dashboard_banners ("organizationId", "sortOrder");

alter table public.dashboard_banners enable row level security;
drop policy if exists "Organisation reads its dashboard posters" on public.dashboard_banners;
drop policy if exists "Admin manages dashboard posters" on public.dashboard_banners;
create policy "Organisation reads its dashboard posters" on public.dashboard_banners
  for select to authenticated
  using ("organizationId" = public.jwt_org_id());
create policy "Admin manages dashboard posters" on public.dashboard_banners
  for all to authenticated
  using (public.is_org_admin() and "organizationId" = public.jwt_org_id())
  with check (public.is_org_admin() and "organizationId" = public.jwt_org_id());
grant select, insert, update, delete on public.dashboard_banners to authenticated;

insert into public.dashboard_banners ("organizationId", kicker, title, "text", tone, "sortOrder")
select o.id, v.kicker, v.title, v.txt, v.tone, v.n
  from public.organizations o
 cross join (values
   (1, 'Wallet Recharge', 'Recharge your centre wallet', 'Certificates, marksheets and ID cards are issued from your wallet balance. Keep it topped up so nothing waits.', 'blue'),
   (2, 'Admission Open 2026–27', 'बिहार का भरोसेमंद कंप्यूटर संस्थान', 'Share your online admission link and approve applications straight from the panel.', 'orange'),
   (3, 'ISO 9001:2015 Certified', 'Govt. registered certificates with QR', 'Every certificate and marksheet carries a QR code that anyone can verify on the website.', 'teal')
 ) as v(n, kicker, title, txt, tone)
 where not exists (select 1 from public.dashboard_banners b where b."organizationId" = o.id);

select count(*) as posters from public.dashboard_banners;
