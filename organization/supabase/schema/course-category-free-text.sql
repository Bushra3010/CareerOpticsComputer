-- Let a course category be typed, not only picked.
--
-- `courses.category` is the enum `CourseCategory`, so anything outside its
-- seven members is rejected by Postgres with 22P02. Converting the column to
-- text keeps every existing value exactly as it is - the enum labels are just
-- read back as strings - while letting a branch name a category the enum never
-- anticipated.
--
-- Run once in the Supabase SQL editor. Safe to re-run.
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'courses'
      and column_name = 'category' and data_type = 'USER-DEFINED'
  ) then
    -- The default is enum-typed too, so it has to come off before the cast.
    alter table public.courses alter column "category" drop default;
    alter table public.courses alter column "category" type text using "category"::text;
    alter table public.courses alter column "category" set default 'COMPUTER';
  end if;
end $$;

-- The type itself is left in place: dropping it would fail if anything else
-- still references it, and an unused type costs nothing.
