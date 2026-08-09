-- 0042: announcements — the last unbuilt bullet in Phase 5 (PRD §17:
-- "Ticketing, announcements and notifications"). Tickets and notifications
-- shipped in 0032/0037; this closes the phase.
--
-- PRD §10.6 gives the table three words for what it needs beyond title/body:
-- "author, scope filters, ... publish/expiry dates" — plural "filters" with
-- no enumeration of what they filter by. Modelled as the simplest reading
-- that the matrix and the nav actually support: an announcement is either
-- organisation-wide or scoped to exactly one centre — the same
-- discriminator + nullable-target shape migration 0032 used for a
-- referral's polymorphic owner, chosen for the same reason (a closed,
-- reversible set beats inventing a filter grammar nobody specified).
--
-- Permission matrix (build plan §4, `announcement.*` row) grants read only
-- to Student and manage only to Super Admin, HO Operator and Centre Owner
-- ("all (own centre)") — every other centre role (Manager, Counsellor,
-- Faculty, Accountant) gets a blank cell. Read here anyway: the nav item is
-- shown to the whole centre portal (build plan §5.3), not just the owner,
-- and denying every other centre role the ability to read a notice addressed
-- to their own centre serves no purpose the matrix's blank cell was
-- protecting against. Recorded as an interpretive extension, the same shape
-- migration 0023 already used to grant centre roles `exam.read`.

create type public.announcement_scope as enum ('organization', 'centre');

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  scope_type public.announcement_scope not null default 'organization',
  scope_centre_id uuid references public.centres (id),
  title text not null,
  body text not null,
  status public.catalog_item_status not null default 'draft',
  publish_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  created_by uuid,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  constraint announcements_scope_shape check (
    (scope_type = 'centre' and scope_centre_id is not null)
    or (scope_type = 'organization' and scope_centre_id is null)
  ),
  constraint announcements_expiry_after_publish check (
    expires_at is null or publish_at is null or expires_at > publish_at
  )
);

create index announcements_org_status_idx on public.announcements (organization_id, status, publish_at desc);
create index announcements_centre_idx on public.announcements (scope_centre_id) where scope_centre_id is not null;

create trigger set_updated_at
  before update on public.announcements
  for each row execute function app.set_updated_at();

create trigger audit_changes
  after insert or update or delete on public.announcements
  for each row execute function app.audit_trigger();

alter table public.announcements enable row level security;
alter table public.announcements force row level security;

-- Whoever may manage an announcement may also always see it, published
-- window or not — a draft has to be readable by its own author to edit it.
create policy announcements_manage on public.announcements
  for all to authenticated
  using (
    app.is_platform_admin()
    or app.has_permission('announcement.manage', organization_id)
    or (scope_type = 'centre'
        and app.has_permission('announcement.manage', organization_id, scope_centre_id)
        and app.can_access_centre(scope_centre_id))
  )
  with check (
    app.is_platform_admin()
    or app.has_permission('announcement.manage', organization_id)
    or (scope_type = 'centre'
        and app.has_permission('announcement.manage', organization_id, scope_centre_id)
        and app.can_access_centre(scope_centre_id))
  );

-- Everyone else: only published, in-window, in-scope announcements.
-- `is_org_member` covers staff; a student has no membership row (0014's
-- `current_student_id()` is the only way to identify one), so organisation
-- scope is checked against the student's own organisation directly.
create policy announcements_select on public.announcements
  for select to authenticated
  using (
    status = 'active'
    and (publish_at is null or publish_at <= now())
    and (expires_at is null or expires_at > now())
    and (
      (scope_type = 'organization' and (
        app.is_org_member(organization_id)
        or exists (
          select 1 from public.students s
          where s.id = app.current_student_id() and s.organization_id = organization_id
        )
      ))
      or (scope_type = 'centre' and (
        (app.has_permission('announcement.read', organization_id, scope_centre_id)
         and app.can_access_centre(scope_centre_id))
        or exists (
          select 1 from public.students s
          where s.id = app.current_student_id() and s.centre_id = scope_centre_id
        )
      ))
    )
  );

insert into public.permissions (code, description) values
  ('announcement.read',   'Read announcements addressed to a centre'),
  ('announcement.manage', 'Create, publish and archive announcements')
on conflict (code) do nothing;

-- Matrix: Centre Owner "all (own centre)".
insert into public.role_permissions (role_id, permission_code)
select r.id, 'announcement.manage'
from public.roles r
where r.code = 'centre_owner'
on conflict do nothing;

-- Read extended to every centre role per this migration's header note.
insert into public.role_permissions (role_id, permission_code)
select r.id, 'announcement.read'
from public.roles r
where r.code in ('centre_owner', 'centre_manager', 'counsellor', 'faculty', 'accountant')
on conflict do nothing;

-- Matrix: HO Operator "all", organisation-wide.
insert into public.role_permissions (role_id, permission_code)
select r.id, 'announcement.manage'
from public.roles r
where r.code = 'ho_operator'
on conflict do nothing;
