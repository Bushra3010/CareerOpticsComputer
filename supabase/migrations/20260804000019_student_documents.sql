-- 0019: file storage — student photographs and identity documents.
--
-- Nothing in the system could hold a file until now, so an admission was
-- incomplete: no photograph for the certificate or ID card, no proof of
-- identity on record.
--
-- The bucket is PRIVATE. Everything is served through short-lived signed URLs
-- generated on the server, so an object path leaking (in a log, a screenshot,
-- a shared link) does not expose the file for long. Build plan R11 asks for
-- exactly this: private buckets, unpredictable paths, short-lived signed URLs.
--
-- Path convention, which the policies below depend on:
--   {centre_id}/{student_id}/{uuid}.{ext}
-- The first two segments are what RLS reads to decide access, and the random
-- filename is what stops anyone guessing a path even if they know both ids.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'student-private',
  'student-private',
  false,
  5 * 1024 * 1024, -- 5 MB: a phone photo of an Aadhaar card, not a scan archive
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do nothing;

create type public.student_document_kind as enum ('photo', 'id_proof', 'other');

create table public.student_documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  centre_id uuid not null references public.centres (id),
  student_id uuid not null references public.students (id) on delete cascade,
  kind public.student_document_kind not null,
  storage_path text not null unique,
  original_name text not null,
  mime_type text not null,
  size_bytes int not null check (size_bytes > 0),
  uploaded_at timestamptz not null default now(),
  uploaded_by uuid
);

create index student_documents_student_idx on public.student_documents (student_id, kind);

-- One photograph per student. A second one would make "which face goes on the
-- certificate?" ambiguous, and replacing is the operation people actually
-- want, so the upload path deletes the old row rather than adding beside it.
create unique index student_documents_one_photo_idx
  on public.student_documents (student_id)
  where kind = 'photo';

alter table public.student_documents enable row level security;
alter table public.student_documents force row level security;

create policy student_documents_staff_select on public.student_documents
  for select to authenticated
  using (
    app.is_platform_admin()
    or (app.has_permission('student.read', organization_id, centre_id)
        and app.can_access_centre(centre_id))
  );

create policy student_documents_staff_write on public.student_documents
  for all to authenticated
  using (
    app.has_permission('student.create', organization_id, centre_id)
    and app.can_access_centre(centre_id)
  )
  with check (
    app.has_permission('student.create', organization_id, centre_id)
    and app.can_access_centre(centre_id)
    and app.centre_is_operational(centre_id)
  );

-- A student may see their own documents but never upload or replace one:
-- a photograph that goes on a certificate has to come from the centre that
-- verified their identity, not from the student.
create policy student_documents_select_self on public.student_documents
  for select to authenticated
  using (student_id = app.current_student_id());

-- ---------------------------------------------------------------------------
-- Storage object policies.
--
-- These sit on storage.objects, so they cannot use the tenant columns — the
-- only thing available is the object path. `storage.foldername(name)` splits
-- it, giving centre_id at [1] and student_id at [2].
-- ---------------------------------------------------------------------------

-- A plain `(storage.foldername(name))[1]::uuid` would be a landmine. A policy
-- on storage.objects is evaluated against rows in *every* bucket, and Postgres
-- does not promise it will test `bucket_id = '…'` before the cast — so the
-- first object in some future bucket whose folder is not a UUID would raise
-- 22P02 and take the whole query down. Parsing to null instead keeps a
-- non-conforming path simply unmatched, which is also the safe answer.
create function app.path_uuid(object_name text, segment int)
returns uuid
language sql
immutable
set search_path = ''
as $$
  select case
    when split_part(object_name, '/', segment)
         ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
    then split_part(object_name, '/', segment)::uuid
  end;
$$;

create policy student_files_staff_read on storage.objects
  for select to authenticated
  using (
    bucket_id = 'student-private'
    and app.can_access_centre(app.path_uuid(name, 1))
  );

create policy student_files_staff_write on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'student-private'
    and app.can_access_centre(app.path_uuid(name, 1))
    and app.centre_is_operational(app.path_uuid(name, 1))
  );

-- Replacing a photograph deletes the previous object, so staff need delete.
create policy student_files_staff_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'student-private'
    and app.can_access_centre(app.path_uuid(name, 1))
  );

-- The student's own files, matched on the student_id segment of the path.
-- Select only: a student never uploads, so there is no matching write policy.
create policy student_files_select_self on storage.objects
  for select to authenticated
  using (
    bucket_id = 'student-private'
    and app.path_uuid(name, 2) = app.current_student_id()
  );

-- An identity document is exactly the sort of thing someone should be able to
-- ask "who put this here, and when?" about, and the table carries
-- organization_id, so app.audit_trigger() can read it the same way it does for
-- the six tables migration 0012 attached it to.
create trigger audit_changes
  after insert or update or delete on public.student_documents
  for each row execute function app.audit_trigger();
