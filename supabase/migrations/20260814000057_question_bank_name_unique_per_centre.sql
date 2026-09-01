-- 0057: a question bank's name is unique within its owner, not its organisation.
--
-- 0021 made bank names unique per organisation, which was right while every
-- bank belonged to head office. 0056 gave banks a `centre_id` and did not
-- revisit the index, so the first centre to create a bank called "Basics" took
-- that name from head office and from every other centre in the network — and
-- the collision surfaced as a bare unique-violation on a form that had given
-- the user no reason to expect one.
--
-- The coalesce follows `memberships_unique_membership_idx` from 0002: a plain
-- `(organization_id, centre_id, name)` index would treat NULL centre_id rows as
-- distinct from one another, so head office would silently lose the uniqueness
-- it has today.
--
-- Strictly more permissive than what it replaces, so no existing row can
-- violate it.

drop index if exists public.question_banks_org_name_idx;

create unique index question_banks_owner_name_idx
  on public.question_banks (
    organization_id,
    coalesce(centre_id, '00000000-0000-0000-0000-000000000000'::uuid),
    lower(btrim(name))
  );
