-- The Branch > Website Settings screen edits branding, contact details, social
-- links, the public-portal toggles and the domain lifecycle dates. `branch_settings`
-- only had columns for the seven SEO/domain fields, so everything else was typed
-- in and thrown away on save. `updateBranchSettings` drops whatever is still
-- missing and tells the user, so the screen works before and after this runs.
--
-- Run this in the Supabase SQL editor. It is safe to re-run.

alter table public.branch_settings
  -- Branding. Images are stored as data URLs by the uploader.
  add column if not exists "logo" text,
  add column if not exists "favicon" text,
  add column if not exists "banner" text,
  add column if not exists "bannerTitle" text,
  add column if not exists "bannerSubtitle" text,

  -- Domain
  add column if not exists "wwwRedirect" boolean not null default true,
  add column if not exists "registrationDate" date,
  add column if not exists "expiryDate" date,
  add column if not exists "renewalDate" date,

  -- Public contact details
  add column if not exists "email" text,
  add column if not exists "phone" text,
  add column if not exists "address" text,

  -- Public feature toggles
  add column if not exists "onlineAdmissions" boolean not null default true,
  add column if not exists "onlineFees" boolean not null default true,
  add column if not exists "studentPortal" boolean not null default true,
  add column if not exists "parentPortal" boolean not null default false,

  -- Social links
  add column if not exists "facebook" text,
  add column if not exists "twitter" text,
  add column if not exists "instagram" text,
  add column if not exists "linkedin" text,
  add column if not exists "youtube" text,
  add column if not exists "whatsapp" text;
