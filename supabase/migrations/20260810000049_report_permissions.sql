-- 0049: the `report.read` / `report.export` codes both navigation trees
-- have referenced since Phase 1 and that nothing ever created — the same
-- shape as `user.read` in migration 0040: a permission gate keyed to a
-- code no row could hold, so the item could never appear for anyone.
--
-- Reports need no policies of their own. Every figure is an aggregate over
-- tables that already carry RLS, so a centre's report counts exactly the
-- rows that centre can read and head office's counts every row it can —
-- the same query, scoped by the same policies. The permission decides who
-- is offered the page, not what the page may see.

insert into public.permissions (code, description) values
  ('report.read',   'View operational and financial reports'),
  ('report.export', 'Export a report''s underlying rows')
on conflict (code) do nothing;

-- Matrix row `report.read / report.export`. "limited" for Counsellor and
-- Faculty is read without export; the narrowing of what they see is RLS's
-- job, not a second code's.
insert into public.role_permissions (role_id, permission_code)
select r.id, v.code
from (values
  ('ho_operator',    'report.read'),
  ('ho_operator',    'report.export'),
  ('finance_admin',  'report.read'),
  ('finance_admin',  'report.export'),
  ('support_agent',  'report.read'),
  ('centre_owner',   'report.read'),
  ('centre_owner',   'report.export'),
  ('centre_manager', 'report.read'),
  ('centre_manager', 'report.export'),
  ('accountant',     'report.read'),
  ('accountant',     'report.export'),
  ('counsellor',     'report.read'),
  ('faculty',        'report.read')
) as v(role_code, code)
join public.roles r on r.code = v.role_code
on conflict do nothing;
