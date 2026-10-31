-- =====================================================================
-- FIX: "No organization assigned" (and every other org/branch-scoped page)
-- =====================================================================
-- The app reads organizationId and branchId from the Supabase Auth user's
-- user_metadata. A freshly created admin login has empty metadata, so the
-- UI has no organization to attach new branches, courses or enquiries to.
--
-- This script creates the organization row (if missing) and writes the
-- ids into the admin's metadata. Idempotent - safe to run again.
-- Run it in: Supabase Dashboard -> SQL Editor.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0. Who is signed in? Run this first and copy your admin's email.
-- ---------------------------------------------------------------------
-- SELECT email, raw_user_meta_data FROM auth.users ORDER BY created_at;

-- ---------------------------------------------------------------------
-- 1. userId is legacy
--    organizations.userId / branches.userId point at the old public.users
--    table from the Prisma/API-server days. Auth now lives in Supabase
--    Auth, and branches.userId is UNIQUE, so it cannot be filled from the
--    browser at all. Make both nullable.
-- ---------------------------------------------------------------------
ALTER TABLE public.organizations ALTER COLUMN "userId" DROP NOT NULL;
ALTER TABLE public.branches ALTER COLUMN "userId" DROP NOT NULL;

-- ---------------------------------------------------------------------
-- 2. Create the organization + link it to the admin login
-- ---------------------------------------------------------------------
DO $$
DECLARE
  admin_email text := 'admin@careeroptics.in';   -- the login email
  org_name    text := 'Career Optics Computer Academy';     -- the institute name
  admin_id    uuid;
  org_id      text;
BEGIN
  SELECT id INTO admin_id FROM auth.users WHERE email = admin_email;
  IF admin_id IS NULL THEN
    RAISE EXCEPTION 'No auth user with email %. Run the SELECT in step 0.', admin_email;
  END IF;

  -- reuse an existing organization rather than creating a second one
  SELECT id INTO org_id FROM public.organizations WHERE "deletedAt" IS NULL ORDER BY "createdAt" LIMIT 1;

  IF org_id IS NULL THEN
    INSERT INTO public.organizations (
      name, code, email, phone, "streetAddress", city, state, district, pincode, "updatedAt"
    ) VALUES (
      org_name,
      upper(left(regexp_replace(org_name, '[^a-zA-Z]', '', 'g'), 6)),
      admin_email,
      '0000000000',
      'Update from Settings',
      'Update',
      'Update',
      'Update',
      '000000',
      now()
    )
    RETURNING id INTO org_id;
  END IF;

  -- the app reads these keys on every page; an existing role is kept as is
  UPDATE auth.users
  SET raw_user_meta_data =
        coalesce(raw_user_meta_data, '{}'::jsonb)
        || jsonb_build_object('organizationId', org_id)
        || jsonb_build_object('role', coalesce(raw_user_meta_data ->> 'role', 'ORGANIZATION_ADMIN'))
        || jsonb_build_object('userType', coalesce(raw_user_meta_data ->> 'userType', 'ORGANIZATION'))
  WHERE id = admin_id;

  RAISE NOTICE 'Organization % linked to %', org_id, admin_email;
END $$;

-- ---------------------------------------------------------------------
-- 3. Verify - organizationId should now be present
-- ---------------------------------------------------------------------
-- SELECT email, raw_user_meta_data FROM auth.users ORDER BY created_at;
-- SELECT id, name, code FROM public.organizations;

-- ---------------------------------------------------------------------
-- Linking a branch login to its branch (run per branch account, later)
-- ---------------------------------------------------------------------
-- UPDATE auth.users
-- SET raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb)
--   || jsonb_build_object('branchId', '<branch id>', 'role', 'BRANCH_ADMIN', 'userType', 'BRANCH')
-- WHERE email = '<branch login email>';
