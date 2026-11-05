-- =====================================================================
-- A website for every franchise centre.
--
--   * Free link:   https://www.careeropticscomputer.in/c/<slug>
--   * Own domain:  the centre's domain, pointed at Vercel and added to the
--                  project by the head office (Edge Function manage-domain).
--
-- Both serve one static page, /site.html, which asks public_branch_site()
-- below for the centre by slug or by host. The function hands the anon key
-- only what a visitor may see: no wallet, licence, login or personal
-- document ever leaves it.
--
-- Who may change what:
--   * a centre's staff edit their own site's content and link (slug) --
--     branches-rls.sql already lets them write their own branch_settings row;
--   * only the head office switches a site on or off, or sets the custom
--     domain and its status. A centre asks for its domain through
--     request_branch_domain(), which files a support ticket for the head
--     office.
--
-- Needs branches-rls.sql (is_branch_staff, is_branch_org_admin),
-- website-gallery.sql and website-content.sql (gallery_items, the `website`
-- bucket). Safe to re-run.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. Columns.
--
--    The branding, contact and social columns come from
--    add-website-settings-fields.sql; they are repeated here (if not
--    exists) because the function below reads them, and a database that
--    skipped that file would otherwise fail to create it.
--
--    Hero copy reuses bannerTitle / bannerSubtitle, which the Website
--    Settings screen already edits.
-- ---------------------------------------------------------------------
alter table public.branch_settings
  add column if not exists "logo" text,
  add column if not exists "favicon" text,
  add column if not exists "banner" text,
  add column if not exists "bannerTitle" text,
  add column if not exists "bannerSubtitle" text,
  add column if not exists "email" text,
  add column if not exists "phone" text,
  add column if not exists "whatsapp" text,
  add column if not exists "facebook" text,
  add column if not exists "twitter" text,
  add column if not exists "instagram" text,
  add column if not exists "linkedin" text,
  add column if not exists "youtube" text,

  add column if not exists "slug" text,
  add column if not exists "customDomain" text,
  add column if not exists "siteEnabled" boolean not null default true,
  add column if not exists "domainStatus" text not null default 'NONE',
  -- What the last Vercel check said, for the head office's screen.
  add column if not exists "domainMessage" text,
  add column if not exists "domainCheckedAt" timestamptz,
  add column if not exists "aboutText" text,
  -- One point per line: "Fully air-conditioned lab", "Weekend batches" …
  add column if not exists "highlights" text;

alter table public.branch_addresses add column if not exists "mapLink" text;

-- The screen saves with an upsert that sends neither: without defaults a
-- centre's first save fails on the NOT NULL columns.
alter table public.branch_settings alter column "id" set default gen_random_uuid()::text;
alter table public.branch_settings alter column "updatedAt" set default now();


-- ---------------------------------------------------------------------
-- 2. Helpers.
-- ---------------------------------------------------------------------

-- Any text as a link-safe slug: lowercase a-z, 0-9 and single hyphens.
create or replace function public.branch_slugify(p_text text)
returns text
language sql
immutable
as $$
  select nullif(trim(both '-' from left(trim(both '-' from
           regexp_replace(lower(coalesce(p_text, '')), '[^a-z0-9]+', '-', 'g')), 40)), '');
$$;

-- A host as it is stored and compared: lowercase, no scheme, path, port,
-- trailing dot or leading www. (the www. variant is added on Vercel too).
create or replace function public.normalise_site_host(p_host text)
returns text
language sql
immutable
as $$
  select nullif(regexp_replace(regexp_replace(regexp_replace(regexp_replace(
           lower(trim(coalesce(p_host, ''))),
           '^[a-z]+://', ''), '[/?#].*$', ''), '(:\d+)?\.?$', ''), '^www\.', ''), '');
$$;

-- A free slug for a branch, built from its code (else its name); a number
-- is added when another centre already has it.
create or replace function public.unique_branch_slug(p_branch_id text)
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_base text;
  v_try  text;
  v_n    integer := 1;
begin
  select coalesce(public.branch_slugify(b."code"), public.branch_slugify(b."name"))
    into v_base
    from public.branches b where b."id" = p_branch_id;
  v_base := coalesce(v_base, 'centre');
  if length(v_base) < 3 then v_base := 'centre-' || v_base; end if;
  v_try := v_base;
  while exists (select 1 from public.branch_settings s where s."slug" = v_try and s."branchId" <> p_branch_id) loop
    v_n := v_n + 1;
    v_try := trim(both '-' from left(v_base, 39 - length(v_n::text))) || '-' || v_n;
  end loop;
  return v_try;
end;
$$;
revoke all on function public.unique_branch_slug(text) from public, anon;
grant execute on function public.unique_branch_slug(text) to authenticated;

-- Is a slug or domain held by another centre? Security definer because a
-- centre's own reads stop at its own row, so the guard below could not see
-- the clash and the raw unique-index error would reach the screen instead.
create or replace function public.branch_site_taken(p_column text, p_value text, p_branch_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.branch_settings s
     where s."branchId" is distinct from p_branch_id
       and case p_column when 'slug' then s."slug" = p_value
                         when 'customDomain' then s."customDomain" = p_value
                         else false end);
$$;
revoke all on function public.branch_site_taken(text, text, text) from public, anon;
grant execute on function public.branch_site_taken(text, text, text) to authenticated;


-- ---------------------------------------------------------------------
-- 3. The guard: tidy what is written, and keep the head office's columns.
--
--    Only a client writing directly (the `authenticated` role) is held
--    back. The service role (the manage-domain function), the SQL editor
--    and the security-definer request_branch_domain() run as other roles
--    and pass, as does an org admin.
-- ---------------------------------------------------------------------
create or replace function public.guard_branch_site()
returns trigger
language plpgsql
as $$
declare
  v_privileged boolean := public.is_org_admin() or current_user not in ('authenticated', 'anon');
begin
  new."slug" := nullif(lower(trim(coalesce(new."slug", ''))), '');
  new."customDomain" := public.normalise_site_host(new."customDomain");

  if not v_privileged then
    if tg_op = 'INSERT' then
      new."customDomain"    := null;
      new."domainStatus"    := 'NONE';
      new."domainMessage"   := null;
      new."domainCheckedAt" := null;
      new."siteEnabled"     := true;
    else
      new."customDomain"    := old."customDomain";
      new."domainStatus"    := old."domainStatus";
      new."domainMessage"   := old."domainMessage";
      new."domainCheckedAt" := old."domainCheckedAt";
      new."siteEnabled"     := old."siteEnabled";
    end if;
  end if;

  -- A new or changed domain has to be connected and checked again.
  if tg_op = 'UPDATE' and new."customDomain" is distinct from old."customDomain"
     and new."domainStatus" is not distinct from old."domainStatus" then
    new."domainStatus" := case when new."customDomain" is null then 'NONE' else 'PENDING' end;
  end if;
  if new."customDomain" is null then new."domainStatus" := 'NONE'; end if;

  if new."slug" is null then
    new."slug" := public.unique_branch_slug(new."branchId");
  elsif new."slug" !~ '^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$' then
    raise exception 'INVALID: The website link may use only lowercase letters, numbers and hyphens, 3 to 40 characters, not starting or ending with a hyphen.'
      using errcode = '22023';
  end if;

  if public.branch_site_taken('slug', new."slug", new."branchId") then
    raise exception 'INVALID: The link "%" is already taken by another centre. Please choose another.', new."slug"
      using errcode = '23505';
  end if;
  if new."customDomain" is not null and public.branch_site_taken('customDomain', new."customDomain", new."branchId") then
    raise exception 'INVALID: The domain % is already connected to another centre.', new."customDomain"
      using errcode = '23505';
  end if;

  new."updatedAt" := now();
  return new;
end;
$$;

drop trigger if exists branch_settings_site_guard on public.branch_settings;
create trigger branch_settings_site_guard before insert or update on public.branch_settings
  for each row execute function public.guard_branch_site();


-- ---------------------------------------------------------------------
-- 4. Every centre gets a settings row and a slug -- the existing ones now,
--    a new one as it is created. Security definer so the branch insert is
--    never refused by branch_settings' own policies.
-- ---------------------------------------------------------------------
insert into public.branch_settings ("branchId")
select b."id" from public.branches b
 where b."deletedAt" is null
   and not exists (select 1 from public.branch_settings s where s."branchId" = b."id")
 order by b."createdAt";

-- Rows that existed before: the trigger fills the slug on this no-op update.
update public.branch_settings set "slug" = null where "slug" is null;

create or replace function public.create_branch_site()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.branch_settings ("branchId") values (new."id")
  on conflict ("branchId") do nothing;
  return new;
end;
$$;

drop trigger if exists branches_create_site on public.branches;
create trigger branches_create_site after insert on public.branches
  for each row execute function public.create_branch_site();


-- ---------------------------------------------------------------------
-- 5. Constraints. The trigger already words the errors for people; these
--    hold even for a write that somehow skips it.
-- ---------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'branch_settings_slug_format') then
    alter table public.branch_settings add constraint branch_settings_slug_format
      check ("slug" is null or "slug" ~ '^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$');
  end if;
  if not exists (select 1 from pg_constraint where conname = 'branch_settings_custom_domain_format') then
    alter table public.branch_settings add constraint branch_settings_custom_domain_format
      check ("customDomain" is null or (length("customDomain") <= 253
        and "customDomain" ~ '^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+([a-z]{2,63}|xn--[a-z0-9-]{1,59})$'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'branch_settings_domain_status_check') then
    alter table public.branch_settings add constraint branch_settings_domain_status_check
      check ("domainStatus" in ('NONE', 'PENDING', 'LIVE', 'ERROR'));
  end if;
end $$;

create unique index if not exists branch_settings_slug_key
  on public.branch_settings ("slug") where "slug" is not null;
create unique index if not exists branch_settings_custom_domain_key
  on public.branch_settings ("customDomain") where "customDomain" is not null;


-- ---------------------------------------------------------------------
-- 6. Is a link free? A centre cannot read other centres' rows, so the
--    slug editor asks here.
-- ---------------------------------------------------------------------
create or replace function public.branch_slug_available(p_slug text, p_branch_id text default null)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not public.branch_site_taken('slug', lower(trim(coalesce(p_slug, ''))), p_branch_id);
$$;
revoke all on function public.branch_slug_available(text, text) from public, anon;
grant execute on function public.branch_slug_available(text, text) to authenticated;


-- ---------------------------------------------------------------------
-- 7. A centre asks for its own domain (or withdraws it with null). The
--    domain is stored as PENDING and the head office gets a support ticket
--    to connect it on Vercel.
-- ---------------------------------------------------------------------
create or replace function public.request_branch_domain(p_branch_id text, p_domain text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_domain text := public.normalise_site_host(p_domain);
  v_old_domain text;
  v_old_status text;
  v_status     text;
begin
  if not (public.is_branch_staff(p_branch_id) or public.is_branch_org_admin(p_branch_id)) then
    raise exception 'INVALID: You can only change your own centre''s website.' using errcode = '42501';
  end if;

  if v_domain is not null then
    if length(v_domain) > 253
       or v_domain !~ '^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+([a-z]{2,63}|xn--[a-z0-9-]{1,59})$' then
      raise exception 'INVALID: "%" is not a valid domain. Enter it like mycentre.com, without https://.', p_domain;
    end if;
    if v_domain ~ '(^|\.)(vercel\.app|vercel\.com|supabase\.co)$' then
      raise exception 'INVALID: Please enter a domain you own, like mycentre.com.';
    end if;
  end if;

  select "customDomain", "domainStatus" into v_old_domain, v_old_status
    from public.branch_settings where "branchId" = p_branch_id;

  -- Asking again for the domain already live changes nothing.
  v_status := case
    when v_domain is null then 'NONE'
    when v_old_domain = v_domain and v_old_status = 'LIVE' then 'LIVE'
    else 'PENDING' end;

  insert into public.branch_settings as cur ("branchId", "customDomain", "domainStatus", "domainMessage")
  values (p_branch_id, v_domain, v_status, null)
  on conflict ("branchId") do update
    set "customDomain" = excluded."customDomain",
        "domainStatus" = excluded."domainStatus",
        "domainMessage" = case when excluded."domainStatus" = 'LIVE'
                               then cur."domainMessage" end;

  if v_status = 'PENDING' and to_regclass('public.support_tickets') is not null then
    execute $q$
      insert into public.support_tickets ("branchId", category, subcategory, subject, content)
      select $1, 'Franchise', 'Website domain', 'Connect website domain: ' || $2,
             'Please connect ' || $2 || ' (and www.' || $2 || ') to our centre website. '
             || 'DNS: A record @ -> 76.76.21.21, CNAME www -> cname.vercel-dns.com.'
       where not exists (select 1 from public.support_tickets t
                          where t."branchId" = $1 and t.subject = 'Connect website domain: ' || $2
                            and t.status in ('OPEN', 'IN_PROGRESS'))
    $q$ using p_branch_id, v_domain;
  end if;

  return jsonb_build_object('customDomain', v_domain, 'domainStatus', v_status);
end;
$$;
revoke all on function public.request_branch_domain(text, text) from public, anon;
grant execute on function public.request_branch_domain(text, text) to authenticated;


-- ---------------------------------------------------------------------
-- 8. Branch photos in the gallery. A null branchId is the organisation's
--    own photo (the head-office website); a centre's photos carry its id.
-- ---------------------------------------------------------------------
alter table public.gallery_items
  add column if not exists "branchId" text references public.branches(id) on delete cascade;
create index if not exists gallery_items_branch_sort_idx
  on public.gallery_items ("branchId", "sortOrder") where "branchId" is not null;

drop policy if exists "Centre manages its gallery photos" on public.gallery_items;
create policy "Centre manages its gallery photos" on public.gallery_items
  for all to authenticated
  using ("branchId" is not null and public.is_branch_staff("branchId"))
  with check (
    "branchId" is not null and public.is_branch_staff("branchId")
    and "organizationId" = (select b."organizationId" from public.branches b where b."id" = gallery_items."branchId"));

-- A centre's uploads go under gallery/branches/<its id>/ in the public
-- `website` bucket; the org admin's own policies already cover the rest.
drop policy if exists "Centre uploads its gallery images" on storage.objects;
drop policy if exists "Centre removes its gallery images" on storage.objects;
create policy "Centre uploads its gallery images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'website'
    and (storage.foldername(name))[1] = 'gallery'
    and (storage.foldername(name))[2] = 'branches'
    and public.is_branch_staff((storage.foldername(name))[3]));
create policy "Centre removes its gallery images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'website'
    and (storage.foldername(name))[1] = 'gallery'
    and (storage.foldername(name))[2] = 'branches'
    and public.is_branch_staff((storage.foldername(name))[3]));


-- ---------------------------------------------------------------------
-- 9. The public site's data. Returns null when no live, enabled centre
--    matches. Every field is chosen one by one -- nothing is `select *`,
--    so a column added to these tables later never leaks by accident.
-- ---------------------------------------------------------------------
create or replace function public.public_branch_site(p_slug text default null, p_host text default null)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_slug    text := nullif(lower(trim(coalesce(p_slug, ''))), '');
  v_host    text := public.normalise_site_host(p_host);
  s         public.branch_settings%rowtype;
  b         public.branches%rowtype;
  v_addr    jsonb;
  v_courses jsonb;
  v_photos  jsonb;
  v_org     text;
  v_own     boolean := true;
  v_logo    text;
begin
  if v_slug is null and v_host is null then return null; end if;

  select st.* into s
    from public.branch_settings st
    join public.branches br on br."id" = st."branchId"
   where (case when v_slug is not null then st."slug" = v_slug else st."customDomain" = v_host end)
     and br."deletedAt" is null and coalesce(br."isActive", true)
     and coalesce(st."siteEnabled", true)
   limit 1;
  if not found then return null; end if;

  select * into b from public.branches where "id" = s."branchId";
  select "name" into v_org from public.organizations where "id" = b."organizationId";

  select jsonb_build_object(
           'street', a."streetAddress", 'city', a."city", 'district', a."district",
           'state', a."state", 'pincode', a."pincode", 'mapLink', a."mapLink")
    into v_addr
    from public.branch_addresses a where a."branchId" = b."id" limit 1;

  -- The courses the centre runs, at its own fee where it set one -- the
  -- same join public_branch_courses() makes for the admission form.
  select coalesce(jsonb_agg(jsonb_build_object(
           'id', c."id", 'name', c."name", 'code', c."code",
           'durationValue', c."durationValue", 'durationUnit', c."durationUnit"::text,
           'fee', coalesce(bc."branchFee", c."baseFee")) order by c."name"), '[]'::jsonb)
    into v_courses
    from public.branch_courses bc
    join public.courses c on c."id" = bc."courseId"
   where bc."branchId" = b."id" and coalesce(bc."isOffered", true)
     and c."deletedAt" is null and coalesce(c."isActive", true);

  select coalesce(jsonb_agg(jsonb_build_object('title', g.title, 'category', g.category, 'imageUrl', g."imageUrl")
           order by g."sortOrder", g."createdAt" desc), '[]'::jsonb)
    into v_photos
    from (select * from public.gallery_items
           where "branchId" = b."id" and "isPublished"
           order by "sortOrder", "createdAt" desc limit 24) g;
  if jsonb_array_length(v_photos) = 0 then
    v_own := false;
    select coalesce(jsonb_agg(jsonb_build_object('title', g.title, 'category', g.category, 'imageUrl', g."imageUrl")
             order by g."sortOrder", g."createdAt" desc), '[]'::jsonb)
      into v_photos
      from (select * from public.gallery_items
             where "branchId" is null and "organizationId" = b."organizationId" and "isPublished"
             order by "sortOrder", "createdAt" desc limit 12) g;
  end if;

  v_logo := coalesce(nullif(s."logo", ''), case jsonb_typeof(b."branchLogo")
    when 'string' then b."branchLogo" #>> '{}'
    when 'object' then coalesce(b."branchLogo" ->> 'url', b."branchLogo" ->> 'dataUrl', b."branchLogo" ->> 'src')
  end);

  return jsonb_build_object(
    'id', b."id",
    'name', coalesce(nullif(trim(s."siteName"), ''), b."name"),
    'branchName', b."name",
    'code', b."code",
    'slug', s."slug",
    'customDomain', case when s."domainStatus" = 'LIVE' then s."customDomain" end,
    'logo', v_logo,
    'favicon', nullif(s."favicon", ''),
    'banner', nullif(s."banner", ''),
    'tagline', nullif(s."tagline", ''),
    'description', nullif(s."seoDescription", ''),
    'heroTitle', nullif(s."bannerTitle", ''),
    'heroSubtitle', nullif(s."bannerSubtitle", ''),
    'aboutText', coalesce(nullif(s."aboutText", ''), nullif(b."description", '')),
    'highlights', coalesce((select jsonb_agg(trim(line)) from regexp_split_to_table(coalesce(s."highlights", ''), '\n') line
                             where trim(line) <> ''), '[]'::jsonb),
    'phone', coalesce(nullif(s."phone", ''), nullif(b."phone", '')),
    'whatsapp', coalesce(nullif(s."whatsapp", ''), nullif(b."whatsappNumber", ''), nullif(b."phone", '')),
    'email', coalesce(nullif(s."email", ''), nullif(b."email", '')),
    'address', v_addr,
    'social', jsonb_strip_nulls(jsonb_build_object(
      'facebook', nullif(s."facebook", ''), 'instagram', nullif(s."instagram", ''),
      'youtube', nullif(s."youtube", ''), 'twitter', nullif(s."twitter", ''),
      'linkedin', nullif(s."linkedin", ''))),
    'director', (select d."name" from public.branch_directors d where d."branchId" = b."id" limit 1),
    'establishedYear', b."establishedYear",
    'onlineAdmission', coalesce(b."onlineEnrollment", true),
    'courses', v_courses,
    'gallery', v_photos,
    'galleryIsOwn', v_own,
    'organisation', coalesce(v_org, 'Career Optics Computer Academy')
  );
end;
$$;

revoke all on function public.public_branch_site(text, text) from public;
grant execute on function public.public_branch_site(text, text) to anon, authenticated;

notify pgrst, 'reload schema';

-- Check: every centre's free link.
select b."name", s."slug", s."customDomain", s."domainStatus", s."siteEnabled"
  from public.branch_settings s join public.branches b on b."id" = s."branchId"
 order by b."name";
