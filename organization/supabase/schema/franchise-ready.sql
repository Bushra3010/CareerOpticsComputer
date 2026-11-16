-- =====================================================================
-- Franchise ready: a centre can admit, make marksheets and issue
-- certificates from its first day.
--
-- 1. issue_certificate had two versions side by side: the current one
--    (student, issued by, issue date, exam date) and the older two-argument
--    one that certificate-wallet-charge.sql creates. A call naming only the
--    first two matched both, so issuing a certificate failed with "function
--    is not unique". The old one goes.
-- 2. A course with no subjects cannot have a marksheet (the result form has
--    no rows to fill). The old catalogue courses that never had subjects,
--    and that no student is enrolled on, are switched off and taken back
--    from the centres, so nobody is admitted to a course that dead-ends.
-- 3. Every centre runs the academy's courses: each one shown on the website
--    (active, with subjects) is offered to every centre that does not have
--    it yet, and a centre created from now on gets them on creation. The
--    head office can still take a course back from a centre; that choice
--    (isOffered = false) is never overwritten here.
--
-- Run once in the Supabase SQL editor. Safe to re-run.
-- =====================================================================

-- 1.
drop function if exists public.issue_certificate(text, text);

-- 2.
update public.courses c
   set "isActive" = false, "updatedAt" = now()
 where c."isActive"
   and coalesce(c."showOnWebsite", true) = false
   and not exists (select 1 from public.course_subjects s where s."courseId" = c.id and s."deletedAt" is null)
   and not exists (select 1 from public.students st where st."courseId" = c.id and st."deletedAt" is null);

update public.branch_courses bc
   set "isOffered" = false, "updatedAt" = now()
  from public.courses c
 where c.id = bc."courseId" and bc."isOffered" and not c."isActive";

-- 3.
create or replace function public.offer_academy_courses(p_branch_id text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_added integer;
begin
  insert into public.branch_courses ("branchId", "courseId", "isOffered")
  select b.id, c.id, true
    from public.branches b
    join public.courses c on c."organizationId" = b."organizationId"
   where b.id = p_branch_id
     and c."isActive"
     and coalesce(c."showOnWebsite", true)
     and exists (select 1 from public.course_subjects s where s."courseId" = c.id and s."deletedAt" is null)
  on conflict ("branchId", "courseId") do nothing;
  get diagnostics v_added = row_count;
  return v_added;
end;
$$;
revoke all on function public.offer_academy_courses(text) from public, anon, authenticated;

create or replace function public.branch_offer_courses()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.offer_academy_courses(new.id);
  return new;
end;
$$;

drop trigger if exists "branches_offer_courses" on public.branches;
create trigger "branches_offer_courses" after insert on public.branches
  for each row execute function public.branch_offer_courses();

select public.offer_academy_courses(b.id) from public.branches b where b."deletedAt" is null;

notify pgrst, 'reload schema';
