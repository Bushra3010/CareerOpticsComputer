-- 0048: study materials — PRD §10.6's `study_materials` (course/subject/
-- batch scope, title, type, storage/URL, visibility), the student portal's
-- §5.4 "Study materials" bullet, and the "learning resources" the matrix
-- gives Faculty. Named in the student nav since Phase 1 with nothing
-- behind it.
--
-- Scope is the whole design. A material carries three optional narrowings —
-- centre, course, batch — and null means "not narrowed by this". So:
--   centre null, course null            → everything the organisation runs
--   centre set,  course null            → that centre's students
--   centre set,  course set             → that course at that centre
--   batch set                           → exactly that batch
-- A student sees a material when every narrowing that IS set matches an
-- active enrolment of theirs. That is one policy expression rather than a
-- visibility enum, because an enum would still need this join to mean
-- anything.
--
-- `subject` from the ERD has no table — subjects were never built (0005
-- shipped courses only), so the scope stops at course, exactly as
-- `enrolments` does.
--
-- Two kinds: an uploaded file in the private bucket below, or a link. Both
-- are the same row so a reading list and a PDF sit in one list, and the
-- check keeps a row from being neither or both.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'materials-private',
  'materials-private',
  false,
  50 * 1024 * 1024,
  array[
    'application/pdf',
    'image/jpeg', 'image/png', 'image/webp',
    'text/plain', 'text/csv',
    'application/zip',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'video/mp4'
  ]
)
on conflict (id) do nothing;

create type public.material_kind as enum ('file', 'link');

create table public.study_materials (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  centre_id uuid references public.centres (id),
  course_id uuid references public.courses (id),
  batch_id uuid references public.batches (id) on delete cascade,
  title text not null check (length(btrim(title)) between 2 and 160),
  description text,
  kind public.material_kind not null,
  -- {material_id}/{filename}; the storage policies key on the first segment,
  -- the same shape migration 0032 gave ticket attachments.
  storage_path text,
  url text,
  status public.catalog_item_status not null default 'active',
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  constraint study_materials_kind_matches_target check (
    (kind = 'file' and storage_path is not null and url is null)
    or (kind = 'link' and url is not null and storage_path is null)
  ),
  -- A batch already implies its centre and course, so accepting a batch
  -- with a contradicting centre would create a row no reader can resolve.
  constraint study_materials_batch_needs_centre check (
    batch_id is null or centre_id is not null
  )
);

create index study_materials_scope_idx
  on public.study_materials (organization_id, centre_id, course_id, status);
create index study_materials_batch_idx
  on public.study_materials (batch_id) where batch_id is not null;

create trigger set_updated_at
  before update on public.study_materials
  for each row execute function app.set_updated_at();

create trigger audit_changes
  after insert or update or delete on public.study_materials
  for each row execute function app.audit_trigger();

alter table public.study_materials enable row level security;
alter table public.study_materials force row level security;

insert into public.permissions (code, description) values
  ('material.read',   'View a centre''s study materials'),
  ('material.manage', 'Publish and withdraw study materials')
on conflict (code) do nothing;

-- Matrix: Faculty hold "learning resources" for their assigned batches;
-- Centre Owner and Manager run the centre. Counsellor and HO Operator read.
insert into public.role_permissions (role_id, permission_code)
select r.id, v.code
from (values
  ('centre_owner',   'material.read'),
  ('centre_owner',   'material.manage'),
  ('centre_manager', 'material.read'),
  ('centre_manager', 'material.manage'),
  ('faculty',        'material.read'),
  ('faculty',        'material.manage'),
  ('counsellor',     'material.read'),
  ('ho_operator',    'material.read')
) as v(role_code, code)
join public.roles r on r.code = v.role_code
on conflict do nothing;

-- Does the signed-in student have an active enrolment matching a
-- material's scope? Extracted because both the table policy and the two
-- storage policies need exactly this test, and three copies of a join is
-- three chances to let them drift apart.
create function app.student_can_read_material(
  p_centre_id uuid,
  p_course_id uuid,
  p_batch_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.enrolments e
    where e.student_id = app.current_student_id()
      and e.status = 'active'
      and (p_centre_id is null or e.centre_id = p_centre_id)
      and (p_course_id is null or e.course_id = p_course_id)
      and (p_batch_id is null or e.batch_id = p_batch_id)
  );
$$;

revoke all on function app.student_can_read_material(uuid, uuid, uuid)
  from public, anon;
grant execute on function app.student_can_read_material(uuid, uuid, uuid)
  to authenticated;

create policy study_materials_select on public.study_materials
  for select to authenticated
  using (
    app.is_platform_admin()
    or app.has_permission('material.read', organization_id)
    or (centre_id is not null
        and app.has_permission('material.read', organization_id, centre_id)
        and app.can_access_centre(centre_id))
    or (status = 'active'
        and app.student_can_read_material(centre_id, course_id, batch_id))
  );

-- Writes are centre-scoped: an organisation-wide material (centre_id null)
-- is head office's to publish, which keeps a single centre from posting to
-- every other centre's students.
create policy study_materials_manage on public.study_materials
  for all to authenticated
  using (
    app.is_platform_admin()
    or app.has_permission('material.manage', organization_id)
    or (centre_id is not null
        and app.has_permission('material.manage', organization_id, centre_id)
        and app.can_access_centre(centre_id))
  )
  with check (
    app.is_platform_admin()
    or app.has_permission('material.manage', organization_id)
    or (centre_id is not null
        and app.has_permission('material.manage', organization_id, centre_id)
        and app.can_access_centre(centre_id))
  );

-- Storage mirrors the table exactly: whoever may read the row may read its
-- file, whoever may manage the row may write it.
create policy material_files_read on storage.objects
  for select to authenticated
  using (
    bucket_id = 'materials-private'
    and exists (
      select 1 from public.study_materials m
      where m.id = app.path_uuid(name, 1)
        and (
          app.is_platform_admin()
          or app.has_permission('material.read', m.organization_id)
          or (m.centre_id is not null
              and app.has_permission('material.read', m.organization_id, m.centre_id)
              and app.can_access_centre(m.centre_id))
          or (m.status = 'active'
              and app.student_can_read_material(m.centre_id, m.course_id, m.batch_id))
        )
    )
  );

create policy material_files_write on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'materials-private'
    and exists (
      select 1 from public.study_materials m
      where m.id = app.path_uuid(name, 1)
        and (
          app.is_platform_admin()
          or app.has_permission('material.manage', m.organization_id)
          or (m.centre_id is not null
              and app.has_permission('material.manage', m.organization_id, m.centre_id)
              and app.can_access_centre(m.centre_id))
        )
    )
  );

create policy material_files_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'materials-private'
    and exists (
      select 1 from public.study_materials m
      where m.id = app.path_uuid(name, 1)
        and (
          app.is_platform_admin()
          or app.has_permission('material.manage', m.organization_id)
          or (m.centre_id is not null
              and app.has_permission('material.manage', m.organization_id, m.centre_id)
              and app.can_access_centre(m.centre_id))
        )
    )
  );
