-- 0023: centre roles can see the exams they are sitting.
--
-- Migration 0021 seeded `exam.read` as a code and granted it to nobody, with
-- the reasoning that read-only access to something a centre could not act on
-- was not worth granting yet. Migration 0022 built the thing: exams are
-- assigned to centres, and a centre needs to know what its students are
-- sitting and when.
--
-- Build plan §4 gives every centre role read-only on `exam.*`, which is what
-- this is. It is not the eligibility question — who *may* sit an exam is C8's
-- sixth item and is still head office's alone.
--
-- Worth being precise about what this does and does not open, because
-- "grant a read permission to five roles" is the shape of a mistake:
--
--   exams_read has three branches. The second, `has_permission('exam.read',
--   organization_id)`, asks the ORGANISATION-level question — and since
--   migration 0020 a centre-scoped membership cannot satisfy that, whatever
--   permissions it holds. So this grant does not let a centre see every exam
--   in the organisation. Centres still arrive through the third branch:
--   published, and assigned to a centre they can access.
--
--   exam_questions is untouched. Its read policy needs `exam.manage`, or the
--   window to be open. A centre with `exam.read` still cannot see tomorrow's
--   paper today — that is proof R18 and it stays.
--
-- The visible effect is therefore the navigation item and the list page, which
-- is exactly the intent.

insert into public.role_permissions (role_id, permission_code)
select r.id, 'exam.read'
from public.roles r
where r.code in ('centre_owner', 'centre_manager', 'counsellor', 'faculty', 'accountant')
on conflict do nothing;
