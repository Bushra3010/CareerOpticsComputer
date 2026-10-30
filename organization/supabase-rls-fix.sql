-- =====================================================================
-- FIX: "new row violates row-level security policy for table ..."
-- =====================================================================
-- The app talks to Supabase directly from the browser with the anon key
-- and a logged-in Supabase Auth session, so every request arrives with
-- role = "authenticated". The schema only ever created policies for
-- role = "service_role", so RLS rejects every insert/update/delete and
-- returns zero rows on every select.
--
-- This script is idempotent - safe to run more than once.
-- Run it in: Supabase Dashboard -> SQL Editor -> New query -> Run.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Column defaults
--    The client never sends "id" or "updatedAt" (Prisma used to generate
--    them). Without defaults an insert fails with
--    'null value in column "id" violates not-null constraint'
--    as soon as RLS stops blocking it.
-- ---------------------------------------------------------------------
DO $$
DECLARE
  t text;
  app_tables text[] := ARRAY[
    'organizations','branches','users','students','courses','branch_courses',
    'batches','batch_timings','exams','exam_results','fee_invoices','fee_payments',
    'attendance_records','visit_enquiries','branch_wallets','branch_transactions',
    'branch_notices','branch_settings','branch_directors','branch_addresses',
    'branch_licenses','branch_renewal_history','item_dispatches','item_received',
    'refresh_sessions','audit_events'
  ];
BEGIN
  FOREACH t IN ARRAY app_tables LOOP
    -- skip tables that do not exist in this project
    CONTINUE WHEN to_regclass('public.' || quote_ident(t)) IS NULL;

    -- id TEXT NOT NULL (no default) -> generate one
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = t
        AND column_name = 'id' AND data_type = 'text' AND column_default IS NULL
    ) THEN
      EXECUTE format('ALTER TABLE public.%I ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text', t);
    END IF;

    -- updatedAt NOT NULL (no default) -> stamp on insert
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = t
        AND column_name = 'updatedAt' AND column_default IS NULL
    ) THEN
      EXECUTE format('ALTER TABLE public.%I ALTER COLUMN "updatedAt" SET DEFAULT now()', t);
    END IF;
  END LOOP;
END $$;

-- ---------------------------------------------------------------------
-- 2. RLS policies for logged-in (authenticated) users
--    Signed-out visitors (anon) still get nothing.
-- ---------------------------------------------------------------------
DO $$
DECLARE
  t text;
  app_tables text[] := ARRAY[
    'organizations','branches','users','students','courses','branch_courses',
    'batches','batch_timings','exams','exam_results','fee_invoices','fee_payments',
    'attendance_records','visit_enquiries','branch_wallets','branch_transactions',
    'branch_notices','branch_settings','branch_directors','branch_addresses',
    'branch_licenses','branch_renewal_history','item_dispatches','item_received',
    'refresh_sessions','audit_events'
  ];
BEGIN
  FOREACH t IN ARRAY app_tables LOOP
    CONTINUE WHEN to_regclass('public.' || quote_ident(t)) IS NULL;

    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);

    -- service_role policy: recreate with WITH CHECK so server-side inserts pass too
    EXECUTE format('DROP POLICY IF EXISTS "Service role full access" ON public.%I', t);
    EXECUTE format(
      'CREATE POLICY "Service role full access" ON public.%I FOR ALL TO service_role USING (true) WITH CHECK (true)', t);

    EXECUTE format('DROP POLICY IF EXISTS "Authenticated full access" ON public.%I', t);
    EXECUTE format(
      'CREATE POLICY "Authenticated full access" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)', t);
  END LOOP;
END $$;

-- ---------------------------------------------------------------------
-- 3. Verify (optional) - should list both policies per table
-- ---------------------------------------------------------------------
-- SELECT tablename, policyname, roles, cmd
-- FROM pg_policies
-- WHERE schemaname = 'public' AND tablename = 'visit_enquiries';

-- ---------------------------------------------------------------------
-- OPTIONAL: branch-scoped access instead of "any logged-in user sees all"
-- ---------------------------------------------------------------------
-- Step 2 gives every authenticated user access to every branch's rows;
-- branch filtering currently happens only in the client query. To enforce
-- it in the database, replace the visit_enquiries policy with this - it
-- reads branchId from the Supabase Auth user_metadata the app already sets,
-- and lets org-level users (no branchId in metadata) see everything:
--
-- DROP POLICY IF EXISTS "Authenticated full access" ON public.visit_enquiries;
-- CREATE POLICY "Branch scoped access" ON public.visit_enquiries
--   FOR ALL TO authenticated
--   USING (
--     coalesce(auth.jwt() -> 'user_metadata' ->> 'branchId', '') IN ('', "branchId")
--   )
--   WITH CHECK (
--     coalesce(auth.jwt() -> 'user_metadata' ->> 'branchId', '') IN ('', "branchId")
--   );
