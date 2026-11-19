-- =====================================================================
-- A franchise registers a new centre
-- =====================================================================
-- A centre's own login may add a new centre, the same form the head office
-- uses. The new centre stands under the head office like any other; it only
-- remembers who brought it in ("createdByBranchId"), which the head office
-- sees as "Created by" on All Franchises.
--
-- The centre does not get to write `branches` and its detail tables: it calls
-- create_sub_centre(), which checks who is asking, files the centre in the
-- caller's own organisation, numbers its code and records the creator. The
-- login is then made by the create-branch-user function, which lets a centre
-- make the first login of a centre it created and nothing more.
--
-- Safe to re-run.
-- =====================================================================

alter table public.branches add column if not exists "createdByBranchId" text references public.branches("id") on delete set null;
create index if not exists "branches_createdByBranchId_idx" on public.branches ("createdByBranchId");


-- ---------------------------------------------------------------------
-- 1. Insert a row from json, sending only the keys given, so every column
--    left out keeps its own default. Internal: no one may call it directly.
-- ---------------------------------------------------------------------
create or replace function public.insert_json_row(p_table regclass, p_row jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cols text;
begin
  select string_agg(quote_ident(a.attname), ', ' order by a.attnum)
    into v_cols
    from pg_attribute a
   where a.attrelid = p_table and a.attnum > 0 and not a.attisdropped
     and p_row ? a.attname;
  if v_cols is null then return; end if;
  execute format('insert into %s (%s) select %s from jsonb_populate_record(null::%s, $1)',
                 p_table, v_cols, v_cols, p_table)
    using p_row;
end;
$$;

revoke all on function public.insert_json_row(regclass, jsonb) from public, anon, authenticated;


-- ---------------------------------------------------------------------
-- 2. The next code in a prefix's series: COCA/BR/AR/ → COCA/BR/AR/002,
--    numbered after the highest number any centre of the organisation has.
-- ---------------------------------------------------------------------
create or replace function public.next_centre_code(p_org text, p_prefix text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select p_prefix || lpad((coalesce(max((regexp_match(b."code", '(\d+)\s*$'))[1]::int), 0) + 1)::text, 3, '0')
    from public.branches b
   where b."organizationId" = p_org;
$$;

revoke all on function public.next_centre_code(text, text) from public, anon, authenticated;


-- ---------------------------------------------------------------------
-- 3. create_sub_centre: a centre's login adds a new centre.
--
--    p_prefix is the code's start the form worked out from the state and
--    city ("COCA/BR/AR/"); the number is added here, where every centre's
--    code can be seen. Returns { id, code }.
-- ---------------------------------------------------------------------
create or replace function public.create_sub_centre(
  p_branch   jsonb,
  p_address  jsonb,
  p_director jsonb,
  p_license  jsonb default null,
  p_prefix   text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller  text := public.jwt_branch_id();
  v_org     text;
  v_id      text := gen_random_uuid()::text;
  v_code    text;
  v_now     timestamp(3) := current_timestamp;
begin
  if public.jwt_role() not in ('BRANCH_ADMIN') or v_caller is null then
    raise exception 'Only a centre''s own login can add a centre here.';
  end if;
  select "organizationId" into v_org from public.branches where "id" = v_caller and "deletedAt" is null;
  if v_org is null then raise exception 'Your centre was not found.'; end if;

  if p_prefix is null or p_prefix !~ '^COCA/[A-Z]{2}/[A-Z]{2}/$' then
    raise exception 'The centre code could not be made: choose the state and city.';
  end if;
  perform pg_advisory_xact_lock(hashtext('centre-code:' || v_org));
  v_code := public.next_centre_code(v_org, p_prefix);

  -- What the caller may not choose is set here, over whatever was sent.
  perform public.insert_json_row('public.branches',
    (p_branch - 'id' - 'organizationId' - 'code' - 'createdByBranchId' - 'deletedAt')
    || jsonb_build_object('id', v_id, 'organizationId', v_org, 'code', v_code,
                          'createdByBranchId', v_caller, 'createdAt', v_now, 'updatedAt', v_now));
  perform public.insert_json_row('public.branch_addresses',
    (p_address - 'id' - 'branchId') || jsonb_build_object('id', gen_random_uuid()::text, 'branchId', v_id, 'createdAt', v_now, 'updatedAt', v_now));
  perform public.insert_json_row('public.branch_directors',
    (p_director - 'id' - 'branchId') || jsonb_build_object('id', gen_random_uuid()::text, 'branchId', v_id, 'createdAt', v_now, 'updatedAt', v_now));
  if p_license is not null then
    perform public.insert_json_row('public.branch_licenses',
      (p_license - 'id' - 'branchId') || jsonb_build_object('id', gen_random_uuid()::text, 'branchId', v_id, 'createdAt', v_now, 'updatedAt', v_now));
  end if;

  return jsonb_build_object('id', v_id, 'code', v_code);
end;
$$;

revoke all on function public.create_sub_centre(jsonb, jsonb, jsonb, jsonb, text) from public, anon;
grant execute on function public.create_sub_centre(jsonb, jsonb, jsonb, jsonb, text) to authenticated;

notify pgrst, 'reload schema';

select 'createdByBranchId' as thing,
       exists (select 1 from information_schema.columns where table_name = 'branches' and column_name = 'createdByBranchId') as present
union all select 'create_sub_centre()', exists (select 1 from pg_proc where proname = 'create_sub_centre');
