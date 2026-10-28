-- A branch's address, as a link.
--
-- `branch_addresses` held a written address and a pair of coordinates, and the
-- office had neither to hand: a lane with no name is found by the Google Maps
-- link someone shared and by nothing else. The Create Branch form takes that
-- link; this is the column it goes in.
--
-- Run once in the Supabase SQL editor. Safe to re-run. The application degrades
-- gracefully until it is: the address write retries without the column.
alter table public.branch_addresses
  add column if not exists "mapLink" text;

notify pgrst, 'reload schema';
