-- 0007: public centre finder needs a second intentional public read (route
-- map §2.1 /centres, /centres/[code]). Migration 0002's centres_select policy
-- only allowed org members / platform admin, which blocks the public site.
-- Active centres have no sensitive columns (code, name, city, state, pincode,
-- address) so a plain row-level policy is enough — no view needed.

create policy centres_public_read on public.centres
  for select to anon, authenticated
  using (status = 'active');
