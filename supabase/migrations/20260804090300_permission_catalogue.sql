-- ============================================================================
-- 0004 — Permission catalogue and system roles
--
-- Reference data that the schema contract depends on, so it lives in a
-- migration rather than in seed.sql: role_permissions has a foreign key to
-- permissions, and every RLS policy names a code from this list.
--
-- The matrix these codes implement is docs/00-build-plan.md §4.
-- Adding a permission later is a new forward migration, never an edit here.
-- ============================================================================

insert into public.permissions (code, resource, action, description, requires_step_up)
values
  -- Organisation and platform ------------------------------------------------
  ('organization.read',      'organization', 'read',   'View organisation profile and settings', false),
  ('organization.update',    'organization', 'update', 'Change organisation profile and settings', false),
  ('settings.read',          'settings',     'read',   'View scoped configuration', false),
  ('settings.update',        'settings',     'update', 'Change scoped configuration', false),
  ('audit.read',             'audit',        'read',   'View audit history within scope', false),

  -- Centres -------------------------------------------------------------------
  ('centre.read',            'centre', 'read',    'View centre profile and documents', false),
  ('centre.create',          'centre', 'create',  'Create a centre', false),
  ('centre.update',          'centre', 'update',  'Edit centre profile', false),
  ('centre.approve',         'centre', 'approve', 'Approve or reject a centre application', true),
  ('centre.suspend',         'centre', 'suspend', 'Suspend or reinstate a centre', true),
  ('centre_application.read',   'centre_application', 'read',    'View centre applications', false),
  ('centre_application.review', 'centre_application', 'review',  'Comment on and request changes to applications', false),

  -- Users, roles and staff ----------------------------------------------------
  ('user.read',              'user', 'read',   'View staff accounts and memberships', false),
  ('user.invite',            'user', 'invite', 'Invite a staff member', false),
  ('user.update',            'user', 'update', 'Change another user''s membership or status', true),
  ('role.read',              'role', 'read',   'View roles and their permissions', false),
  ('role.update',            'role', 'update', 'Create or change roles and permission grants', true),

  -- CRM and students ----------------------------------------------------------
  ('lead.read',              'lead',    'read',   'View leads and enquiries', false),
  ('lead.create',            'lead',    'create', 'Create a lead', false),
  ('lead.update',            'lead',    'update', 'Update a lead and log activity', false),
  ('student.read',           'student', 'read',   'View student records', false),
  ('student.create',         'student', 'create', 'Register a student', false),
  ('student.update',         'student', 'update', 'Edit a student record', false),
  ('student.export',         'student', 'export', 'Export student data', true),
  ('student.archive',        'student', 'archive','Withdraw, archive or cancel a student', true),

  -- Academics -----------------------------------------------------------------
  ('course.read',            'course',   'read',    'View courses, versions and subjects', false),
  ('course.update',          'course',   'update',  'Create or edit courses and syllabus versions', false),
  ('offering.approve',       'offering', 'approve', 'Approve a centre to run a course', false),
  ('batch.read',             'batch',    'read',    'View batches and timetables', false),
  ('batch.update',           'batch',    'update',  'Create or edit batches and schedules', false),

  -- Attendance ----------------------------------------------------------------
  ('attendance.read',        'attendance', 'read',    'View attendance registers and reports', false),
  ('attendance.mark',        'attendance', 'mark',    'Record attendance for a session', false),
  ('attendance.correct',     'attendance', 'correct', 'Amend attendance after the lock period', true),

  -- Fees and money ------------------------------------------------------------
  ('fee_plan.read',          'fee_plan', 'read',    'View fee plans, instalments and dues', false),
  ('fee_plan.update',        'fee_plan', 'update',  'Create or reschedule a fee plan', false),
  ('fee_discount.approve',   'fee_discount', 'approve', 'Approve a discount above the threshold', true),
  ('payment.read',           'payment', 'read',    'View payments and receipts', false),
  ('payment.post',           'payment', 'post',    'Record a fee payment', false),
  ('payment.reverse',        'payment', 'reverse', 'Reverse a posted payment', true),
  ('refund.approve',         'refund',  'approve', 'Approve a refund', true),
  ('wallet.read',            'wallet',  'read',    'View wallet balance and statement', false),
  ('wallet.recharge_request','wallet',  'recharge_request', 'Request a wallet recharge', false),
  ('wallet.recharge_approve','wallet',  'recharge_approve', 'Approve a wallet recharge', true),
  ('wallet.adjust',          'wallet',  'adjust',  'Manually adjust a wallet balance', true),
  ('expense.read',           'expense', 'read',    'View income and expenses', false),
  ('expense.update',         'expense', 'update',  'Record income and expenses', false),
  ('finance.period_lock',    'finance', 'period_lock', 'Lock or unlock a financial period', true),

  -- Exams and credentials -----------------------------------------------------
  ('question.read',          'question', 'read',   'View question banks', false),
  ('question.update',        'question', 'update', 'Create or edit questions', false),
  ('exam.read',              'exam',     'read',   'View exams and schedules', false),
  ('exam.update',            'exam',     'update', 'Create or edit exams', false),
  ('exam.evaluate',          'exam',     'evaluate', 'Evaluate subjective answers', false),
  ('result.read',            'result',   'read',    'View results and performance', false),
  ('result.publish',         'result',   'publish', 'Publish a result set', true),
  ('result.unlock',          'result',   'unlock',  'Amend a published result', true),
  ('certificate.read',       'certificate', 'read',   'View certificates and mark sheets', false),
  ('certificate.issue',      'certificate', 'issue',  'Issue a certificate', true),
  ('certificate.revoke',     'certificate', 'revoke', 'Revoke a certificate', true),

  -- Inventory and orders ------------------------------------------------------
  ('product.read',           'product',   'read',     'View the product catalogue', false),
  ('product.update',         'product',   'update',   'Create or edit products', false),
  ('inventory.read',         'inventory', 'read',     'View stock levels and movement', false),
  ('inventory.adjust',       'inventory', 'adjust',   'Adjust stock', true),
  ('order.read',             'order',     'read',     'View orders', false),
  ('order.create',           'order',     'create',   'Place an order', false),
  ('order.dispatch',         'order',     'dispatch', 'Dispatch and track an order', false),

  -- Referrals -----------------------------------------------------------------
  ('referral.read',          'referral',   'read',   'View referrals and commission', false),
  ('commission.approve',     'commission', 'approve','Approve or pay out commission', true),

  -- Support and communication -------------------------------------------------
  ('ticket.read',            'ticket',       'read',   'View support tickets', false),
  ('ticket.create',          'ticket',       'create', 'Raise a support ticket', false),
  ('ticket.assign',          'ticket',       'assign', 'Assign and resolve tickets', false),
  ('ticket.internal_note',   'ticket',       'internal_note', 'Read and write internal notes', false),
  ('announcement.read',      'announcement', 'read',   'View announcements', false),
  ('announcement.publish',   'announcement', 'publish','Publish an announcement', false),

  -- Reporting -----------------------------------------------------------------
  ('report.read',            'report', 'read',   'View reports', false),
  ('report.export',          'report', 'export', 'Export report data', true);

-- ---------------------------------------------------------------------------
-- System roles
--
-- Platform-scoped and marked is_system, so the RLS policies in 0003 refuse to
-- let anyone edit them through the API. Organisations get copies of the tenant
-- roles at onboarding (Phase 1) which they may then customise.
-- ---------------------------------------------------------------------------

insert into public.roles (scope, organization_id, code, name, description, is_system)
values
  ('organization', null, 'head_office_operator', 'Head office operator',
   'Operational modules across the organisation; no security-owner actions.', true),
  ('organization', null, 'finance_admin', 'Finance admin',
   'Wallets, payments, invoices, commissions, refunds and accounting reports.', true),
  ('organization', null, 'exam_controller', 'Exam controller',
   'Question banks, exams, evaluation, results, mark sheets and certificates.', true),
  ('organization', null, 'inventory_manager', 'Inventory manager',
   'Products, stock, orders, dispatch and shipment tracking.', true),
  ('organization', null, 'support_agent', 'Support agent',
   'Ticket handling with restricted student access.', true),
  ('centre', null, 'centre_owner', 'Centre owner',
   'Full operation of assigned centres.', true),
  ('centre', null, 'centre_manager', 'Centre manager',
   'Centre operations excluding owner, security and settlement controls.', true),
  ('centre', null, 'counsellor', 'Counsellor',
   'Leads, applications, admissions, documents and follow-ups.', true),
  ('centre', null, 'faculty', 'Faculty',
   'Timetable, attendance, materials and assigned exams.', true),
  ('centre', null, 'accountant', 'Accountant',
   'Fees, receipts, dues, expenses and permitted reports.', true);

-- The role check constraint in 0002 requires a non-null organization_id for
-- non-platform scopes. System roles are templates with no organisation, so the
-- constraint is relaxed to allow exactly that case and nothing else.
alter table public.roles drop constraint roles_check;

alter table public.roles
  add constraint roles_scope_org_check check (
    (scope = 'platform' and organization_id is null)
    -- Template rows: system roles cloned per organisation at onboarding.
    or (scope <> 'platform' and organization_id is null and is_system)
    or (scope <> 'platform' and organization_id is not null)
  );

-- ---------------------------------------------------------------------------
-- Grants for the system role templates
-- ---------------------------------------------------------------------------

-- Centre owner: everything operational at their own centre, excluding
-- reversals, revocations and result publishing, which stay with head office.
insert into public.role_permissions (role_id, permission_code)
select r.id, p.code
from public.roles r
cross join public.permissions p
where r.code = 'centre_owner' and r.is_system
  and p.code in (
    'centre.read', 'centre.update',
    'user.read', 'user.invite', 'user.update',
    'lead.read', 'lead.create', 'lead.update',
    'student.read', 'student.create', 'student.update', 'student.export', 'student.archive',
    'course.read', 'batch.read', 'batch.update',
    'attendance.read', 'attendance.mark', 'attendance.correct',
    'fee_plan.read', 'fee_plan.update', 'fee_discount.approve',
    'payment.read', 'payment.post',
    'wallet.read', 'wallet.recharge_request',
    'expense.read', 'expense.update',
    'exam.read', 'result.read', 'certificate.read',
    'product.read', 'order.read', 'order.create',
    'referral.read',
    'ticket.read', 'ticket.create',
    'announcement.read', 'announcement.publish',
    'report.read', 'report.export',
    'audit.read', 'settings.read', 'settings.update'
  );

insert into public.role_permissions (role_id, permission_code)
select r.id, p.code
from public.roles r
cross join public.permissions p
where r.code = 'centre_manager' and r.is_system
  and p.code in (
    'centre.read', 'user.read',
    'lead.read', 'lead.create', 'lead.update',
    'student.read', 'student.create', 'student.update',
    'course.read', 'batch.read', 'batch.update',
    'attendance.read', 'attendance.mark', 'attendance.correct',
    'fee_plan.read', 'fee_plan.update',
    'payment.read', 'payment.post',
    'wallet.read', 'wallet.recharge_request',
    'expense.read', 'expense.update',
    'exam.read', 'result.read', 'certificate.read',
    'product.read', 'order.read', 'order.create',
    'ticket.read', 'ticket.create', 'announcement.read',
    'report.read'
  );

insert into public.role_permissions (role_id, permission_code)
select r.id, p.code
from public.roles r
cross join public.permissions p
where r.code = 'counsellor' and r.is_system
  and p.code in (
    'centre.read',
    'lead.read', 'lead.create', 'lead.update',
    'student.read', 'student.create', 'student.update',
    'course.read', 'batch.read',
    'attendance.read', 'fee_plan.read',
    'ticket.read', 'ticket.create', 'announcement.read'
  );

insert into public.role_permissions (role_id, permission_code)
select r.id, p.code
from public.roles r
cross join public.permissions p
where r.code = 'faculty' and r.is_system
  and p.code in (
    'centre.read', 'course.read', 'batch.read',
    'attendance.read', 'attendance.mark',
    'student.read',
    'exam.read', 'exam.evaluate', 'result.read',
    'ticket.read', 'ticket.create', 'announcement.read'
  );

insert into public.role_permissions (role_id, permission_code)
select r.id, p.code
from public.roles r
cross join public.permissions p
where r.code = 'accountant' and r.is_system
  and p.code in (
    'centre.read', 'student.read',
    'fee_plan.read', 'fee_plan.update',
    'payment.read', 'payment.post',
    'wallet.read', 'wallet.recharge_request',
    'expense.read', 'expense.update',
    'order.read', 'order.create',
    'ticket.read', 'ticket.create', 'announcement.read',
    'report.read'
  );

insert into public.role_permissions (role_id, permission_code)
select r.id, p.code
from public.roles r
cross join public.permissions p
where r.code = 'head_office_operator' and r.is_system
  and p.code in (
    'organization.read',
    'centre.read', 'centre.create', 'centre.update', 'centre.approve',
    'centre_application.read', 'centre_application.review',
    'user.read',
    'lead.read', 'lead.create', 'lead.update',
    'student.read', 'student.create', 'student.update', 'student.export',
    'course.read', 'course.update', 'offering.approve',
    'batch.read', 'batch.update',
    'attendance.read', 'attendance.correct',
    'fee_plan.read', 'exam.read', 'result.read', 'certificate.read',
    'product.read', 'inventory.read', 'order.read', 'order.dispatch',
    'referral.read', 'expense.read',
    'ticket.read', 'ticket.internal_note',
    'announcement.read', 'announcement.publish',
    'report.read', 'report.export', 'settings.read'
  );

insert into public.role_permissions (role_id, permission_code)
select r.id, p.code
from public.roles r
cross join public.permissions p
where r.code = 'finance_admin' and r.is_system
  and p.code in (
    'organization.read', 'centre.read', 'student.read',
    'fee_plan.read', 'fee_plan.update', 'fee_discount.approve',
    'payment.read', 'payment.post', 'payment.reverse', 'refund.approve',
    'wallet.read', 'wallet.recharge_approve', 'wallet.adjust',
    'expense.read', 'expense.update', 'finance.period_lock',
    'referral.read', 'commission.approve',
    'report.read', 'report.export', 'audit.read',
    'settings.read', 'settings.update'
  );

insert into public.role_permissions (role_id, permission_code)
select r.id, p.code
from public.roles r
cross join public.permissions p
where r.code = 'exam_controller' and r.is_system
  and p.code in (
    'organization.read', 'centre.read', 'student.read', 'course.read', 'batch.read',
    'question.read', 'question.update',
    'exam.read', 'exam.update', 'exam.evaluate',
    'result.read', 'result.publish', 'result.unlock',
    'certificate.read', 'certificate.issue', 'certificate.revoke',
    'report.read', 'report.export', 'settings.read', 'settings.update'
  );

insert into public.role_permissions (role_id, permission_code)
select r.id, p.code
from public.roles r
cross join public.permissions p
where r.code = 'inventory_manager' and r.is_system
  and p.code in (
    'organization.read', 'centre.read',
    'product.read', 'product.update',
    'inventory.read', 'inventory.adjust',
    'order.read', 'order.dispatch',
    'report.read', 'report.export'
  );

insert into public.role_permissions (role_id, permission_code)
select r.id, p.code
from public.roles r
cross join public.permissions p
where r.code = 'support_agent' and r.is_system
  and p.code in (
    'organization.read', 'centre.read',
    'ticket.read', 'ticket.create', 'ticket.assign', 'ticket.internal_note',
    'announcement.read', 'report.read'
  );
