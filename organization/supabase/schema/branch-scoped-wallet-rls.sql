-- =====================================================================
-- Branch-scoped RLS for branch_wallets and branch_transactions
-- =====================================================================
-- supabase-rls-fix.sql gave every signed-in account `FOR ALL TO
-- authenticated USING (true)` on these tables, so a franchise login could
-- read -- and top up -- any branch's wallet. This narrows both tables to the
-- branch the account belongs to, while organisation admins keep full access.
--
-- The decision is read from `app_metadata`, NOT `user_metadata`. A user can
-- rewrite their own user_metadata with supabase.auth.updateUser(), so a policy
-- keyed on it would let a branch account promote itself to admin. app_metadata
-- is writable only by the service role.
--
-- RUN THIS BEFORE redeploying create-branch-user: step 1 backfills the claim
-- the function and these policies both rely on.
--
-- Idempotent - safe to re-run.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. Backfill app_metadata from the user_metadata already on each account.
--    Existing logins only carry user_metadata, so without this every
--    account -- admins included -- would fail the policies below.
-- ---------------------------------------------------------------------
update auth.users
set raw_app_meta_data =
  coalesce(raw_app_meta_data, '{}'::jsonb)
  || jsonb_strip_nulls(jsonb_build_object(
       'role', raw_user_meta_data ->> 'role',
       'branchId', raw_user_meta_data ->> 'branchId',
       'organizationId', raw_user_meta_data ->> 'organizationId'
     ))
where raw_user_meta_data ->> 'role' is not null
   or raw_user_meta_data ->> 'branchId' is not null;


-- ---------------------------------------------------------------------
-- 2. Claim readers. Kept as functions so the two policies below stay
--    readable and there is one place to change if the claim shape moves.
-- ---------------------------------------------------------------------
create or replace function public.jwt_role()
returns text
language sql
stable
as $$
  select upper(coalesce(auth.jwt() -> 'app_metadata' ->> 'role', ''));
$$;

create or replace function public.jwt_branch_id()
returns text
language sql
stable
as $$
  select auth.jwt() -> 'app_metadata' ->> 'branchId';
$$;

create or replace function public.is_org_admin()
returns boolean
language sql
stable
as $$
  select public.jwt_role() in ('SUPER_ADMIN', 'ORGANIZATION_ADMIN');
$$;


-- ---------------------------------------------------------------------
-- 3. The policies. The blanket one goes; service_role is left alone,
--    because the edge functions run under it.
-- ---------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array['branch_wallets', 'branch_transactions'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "Authenticated full access" on public.%I', t);
    execute format('drop policy if exists "Branch scoped access" on public.%I', t);
    execute format($f$
      create policy "Branch scoped access" on public.%I
        for all to authenticated
        using (public.is_org_admin() or "branchId" = public.jwt_branch_id())
        with check (public.is_org_admin() or "branchId" = public.jwt_branch_id())
    $f$, t);
  end loop;
end $$;


-- ---------------------------------------------------------------------
-- 4. Check what is in place now.
-- ---------------------------------------------------------------------
select tablename, policyname, roles
from pg_policies
where schemaname = 'public'
  and tablename in ('branch_wallets', 'branch_transactions')
order by tablename, policyname;

-- NOTE: app_metadata reaches the JWT only when a token is issued, so everyone
-- who is signed in right now must sign out and sign back in before these
-- policies will let them through.
