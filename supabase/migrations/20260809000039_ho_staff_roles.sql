-- 0039: the organisation-wide staff roles the PRD names (§4) and nothing
-- ever seeded — the standing gap first recorded in migration 0031's header
-- for `product.manage`/`inventory.manage`, repeated in 0032 for
-- `referral.manage`/`commission.manage`/`ticket.manage`, and now closed.
-- Until this migration, every one of those permissions was reachable only
-- by a platform super admin.
--
-- Three of the PRD's six head-office roles are seeded; the other three are
-- not, on purpose:
--   Exam Controller  — exam.manage/question.manage exist and are already
--                      exercised by super admins; seeding the role is
--                      trivially this same shape when someone is hired.
--   Inventory Manager— same reasoning, product/inventory/order.dispatch.
--   (Super Admin)    — not a role at all: `profiles.is_platform_super_admin`.
-- Seeding roles nobody holds costs nothing, but every unused grant is a
-- thing an auditor must reason about, so the set is kept to the roles the
-- newly-built verticals (wallet, referrals, tickets) actually need staffed.
--
-- The build-plan matrix is finer-grained than the permission codes the
-- system actually defines (e.g. `wallet.recharge.approve` vs the real
-- `wallet.manage`), so each grant below is the closest EXISTING code, and
-- two matrix cells are deliberately NOT granted:
--   - Support Agent's `student.* read (masked)`: masking does not exist,
--     and granting unmasked student.read would exceed the matrix.
--   - Finance Admin's `expense.*`: the expense vertical does not exist yet;
--     its migration grants this when it creates the codes.

insert into public.roles (organization_id, code, name, is_system_role)
select o.id, v.code, v.name, true
from public.organizations o
cross join (values
  ('ho_operator',   'HO Operator'),
  ('finance_admin', 'Finance Admin'),
  ('support_agent', 'Support Agent')
) as v(code, name)
where o.slug = 'career-optics'
on conflict (organization_id, code) do nothing;

insert into public.role_permissions (role_id, permission_code)
select r.id, v.code
from (values
  -- Matrix: centre r/u (approve = applications, which have no permission
  -- code yet and remain platform-admin); students all (existing codes are
  -- read/create); catalogue, exams, results, certificates, supplies read;
  -- order.dispatch is the one write the matrix gives this role outside
  -- centres/students; tickets read + internal notes; wallets read.
  ('ho_operator', 'centre.read'),
  ('ho_operator', 'centre.update'),
  ('ho_operator', 'student.read'),
  ('ho_operator', 'student.create'),
  ('ho_operator', 'staff.read'),
  ('ho_operator', 'attendance.read'),
  ('ho_operator', 'fee.read'),
  ('ho_operator', 'wallet.read'),
  ('ho_operator', 'exam.read'),
  ('ho_operator', 'question.read'),
  ('ho_operator', 'result.read'),
  ('ho_operator', 'certificate.read'),
  ('ho_operator', 'product.read'),
  ('ho_operator', 'inventory.read'),
  ('ho_operator', 'order.read'),
  ('ho_operator', 'order.dispatch'),
  ('ho_operator', 'referral.read'),
  ('ho_operator', 'ticket.read'),
  ('ho_operator', 'ticket.internal_note'),
  -- Matrix: fees all, payments, wallet approval/adjustment (wallet.manage),
  -- referrals/commission all, plus read context for centres and students.
  ('finance_admin', 'centre.read'),
  ('finance_admin', 'student.read'),
  ('finance_admin', 'fee.read'),
  ('finance_admin', 'fee.manage'),
  ('finance_admin', 'payment.post'),
  ('finance_admin', 'wallet.read'),
  ('finance_admin', 'wallet.manage'),
  ('finance_admin', 'referral.read'),
  ('finance_admin', 'referral.manage'),
  ('finance_admin', 'commission.manage'),
  -- Matrix: tickets all (assigned) + internal notes, with centre context.
  ('support_agent', 'centre.read'),
  ('support_agent', 'ticket.read'),
  ('support_agent', 'ticket.create'),
  ('support_agent', 'ticket.manage'),
  ('support_agent', 'ticket.internal_note')
) as v(role_code, code)
join public.roles r
  on r.code = v.role_code
  and r.organization_id in (select id from public.organizations where slug = 'career-optics')
on conflict do nothing;
