-- Who brought an admission in.
--
-- The admission form asks for it on its own step -- a name, the referral code
-- that was quoted, and what that person is to the institute (partner, staff,
-- an old student) -- and none of the three had a column to land in.
--
-- All nullable: most admissions are walk-ins and have no referrer at all.
--
-- Run once in the Supabase SQL editor. Safe to re-run. The application degrades
-- gracefully until it is: the insert retries without these and saves the rest
-- of the admission rather than failing whole.
alter table public.students
  add column if not exists "referralName" text,
  add column if not exists "referralCode" text,
  add column if not exists "referralPosition" text;

-- Referral codes are quoted and chased, so they are worth finding by.
create index if not exists "students_referralCode_idx"
  on public.students ("referralCode")
  where "referralCode" is not null;

notify pgrst, 'reload schema';
