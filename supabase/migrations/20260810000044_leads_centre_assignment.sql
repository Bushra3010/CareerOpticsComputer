-- 0044: leads reach the centres. The matrix has always said Centre
-- Owner / Centre Manager / Counsellor hold `lead.*` "all (own)" and HO
-- Operator "all" — but migration 0006 shipped `leads` with no centre
-- column, no lead permission codes, and platform-admin-only RLS, so the
-- centre half of the funnel (PRD §6.2: enquiry → counselling → admission)
-- never existed. The admin list page's own comment records the same gap.
--
-- `centre_id` is nullable on purpose: a public enquiry arrives centreless
-- into the head-office pool, and assignment to a centre is an explicit,
-- audited act. "all (own)" then means: a centre works the leads assigned
-- to it, and never sees the pool or another centre's pipeline.

alter table public.leads
  add column centre_id uuid references public.centres (id);

create index leads_centre_idx on public.leads (centre_id, status)
  where centre_id is not null;

insert into public.permissions (code, description) values
  ('lead.read',   'View admission leads assigned to a centre'),
  ('lead.manage', 'Work a lead: update its status, record the outcome')
on conflict (code) do nothing;

-- Matrix row `lead.*`: all (own) for the three counselling-side centre
-- roles; nothing for Faculty and Accountant. HO Operator gets org-wide
-- read/manage — assignment included, via the org-level policy arm below.
insert into public.role_permissions (role_id, permission_code)
select r.id, p.code
from public.roles r
cross join (values ('lead.read'), ('lead.manage')) as p(code)
where r.code in ('centre_owner', 'centre_manager', 'counsellor', 'ho_operator')
on conflict do nothing;

-- Since migration 0020 an org-level check passes only for a membership
-- with centre_id null, so the first arm is HO staff and the second is
-- centre staff on their own centre's assigned leads — a centre never
-- matches the pool (centre_id null) through either.
create policy leads_centre_read on public.leads
  for select to authenticated
  using (
    app.has_permission('lead.read', organization_id)
    or (centre_id is not null
        and app.has_permission('lead.read', organization_id, centre_id)
        and app.can_access_centre(centre_id))
  );

-- WITH CHECK reuses the same predicate: centre staff cannot move a lead to
-- another centre (can_access_centre fails on the new row) nor back into the
-- pool (the centre arm needs centre_id not null, and the org arm is not
-- theirs). HO staff can do both, which is what assignment is.
create policy leads_centre_update on public.leads
  for update to authenticated
  using (
    app.has_permission('lead.manage', organization_id)
    or (centre_id is not null
        and app.has_permission('lead.manage', organization_id, centre_id)
        and app.can_access_centre(centre_id))
  )
  with check (
    app.has_permission('lead.manage', organization_id)
    or (centre_id is not null
        and app.has_permission('lead.manage', organization_id, centre_id)
        and app.can_access_centre(centre_id))
  );
