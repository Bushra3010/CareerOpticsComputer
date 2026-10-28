-- The next application number, counted across every branch.
--
-- `students.applicationNo` carries a global unique index, but a branch account
-- reads only its own branch's students (student-portal-rls.sql). Counting from
-- the client therefore saw only that branch's highest number and handed out one
-- another branch had already issued: "duplicate key value violates unique
-- constraint students_applicationNo_key", on every retry.
--
-- SECURITY DEFINER lets this one function read past RLS. It returns a single
-- number and nothing else about another branch's students.
--
-- The counter is read numerically, so APP-2026-10000 sorts after APP-2026-9999.
--
-- Run once in the Supabase SQL editor. Safe to re-run.
create or replace function public.next_application_no()
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  prefix text := 'APP-' || extract(year from now())::int || '-';
  last_no integer;
begin
  select max(substring("applicationNo" from length(prefix) + 1)::integer)
    into last_no
    from public.students
   where "applicationNo" like prefix || '%'
     and substring("applicationNo" from length(prefix) + 1) ~ '^\d+$';
  return prefix || lpad((coalesce(last_no, 0) + 1)::text, 4, '0');
end;
$$;

revoke all on function public.next_application_no() from public;
grant execute on function public.next_application_no() to authenticated;
