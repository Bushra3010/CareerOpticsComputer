-- Let the "Other" choices be typed, not only picked.
--
-- Every dropdown in the app that ended in a bare "Other" now ends in
-- "Other (type your own)…", so a branch can record *what* the thing was -- a
-- coaching centre, a neighbour standing as local guardian, a visitor who came
-- about something the seven purposes never anticipated.
--
-- Four of those columns are Postgres enums, and anything outside their members
-- is rejected with 22P02. Converting them to text keeps every existing value
-- exactly as it is -- the enum labels are read back as strings -- while letting
-- a typed value through.
--
-- Companion to course-category-free-text.sql, which did the same for
-- `courses.category`. Run once in the Supabase SQL editor. Safe to re-run.
do $$
declare
  target record;
begin
  for target in
    select *
    from (values
      ('branches',         'instituteType', 'COMPUTER'),
      ('students',         'gender',        null),
      ('branch_directors', 'gender',        null),
      ('visit_enquiries',  'purpose',       'OTHER')
    ) as t(table_name, column_name, default_value)
  loop
    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = target.table_name
        and column_name = target.column_name
        and data_type = 'USER-DEFINED'
    ) then
      -- The default is enum-typed too, so it has to come off before the cast.
      execute format('alter table public.%I alter column %I drop default', target.table_name, target.column_name);
      execute format('alter table public.%I alter column %I type text using %I::text', target.table_name, target.column_name, target.column_name);
      if target.default_value is not null then
        execute format('alter table public.%I alter column %I set default %L', target.table_name, target.column_name, target.default_value);
      end if;
    end if;
  end loop;
end $$;

-- The types themselves are left in place: dropping one would fail if anything
-- else still references it, and an unused type costs nothing.
