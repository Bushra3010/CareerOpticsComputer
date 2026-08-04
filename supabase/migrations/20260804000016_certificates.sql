-- 0016: certificates and public verification.
--
-- A certificate is issued against a PUBLISHED student_result and nothing else,
-- so a credential can never exist for marks the student has not been shown.
--
-- PRIVACY TRADE-OFF, stated because it is a real residual risk and not an
-- oversight. Build plan §1.3 specifies sequential certificate numbers
-- (CO-CERT-26-000123) and §2.1 requires /verify/c/[number] to render a result
-- directly from a QR scan. Together those mean anyone can walk the number
-- space and read off holder names. That is inherent to "scan this QR and see
-- who it belongs to" and cannot be designed away while keeping the feature.
-- What is done instead:
--   * the payload is the minimum an employer needs — name, course, centre,
--     outcome, issue date. No phone, email, date of birth, address, marks or
--     registration number.
--   * every lookup is logged, matched or not, so enumeration is visible.
--   * the app layer rate-limits by IP before calling these functions.
-- If the owner would rather prevent enumeration outright, the fix is to
-- require name + number (confirm rather than reveal) and drop the bare-number
-- QR route. That is a product decision, not a technical one.

create type public.issued_document_type as enum ('certificate', 'marksheet');

create table public.issued_documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  centre_id uuid not null references public.centres (id),
  student_id uuid not null references public.students (id),
  student_result_id uuid not null references public.student_results (id),
  document_type public.issued_document_type not null default 'certificate',
  document_number text not null unique,
  status public.document_status not null default 'issued',
  issued_at timestamptz not null default now(),
  issued_by uuid,
  revoked_at timestamptz,
  revoked_by uuid,
  revoked_reason text
);

-- One live certificate per result. Revoking frees the slot so a corrected
-- result can be re-issued, which is why the index is partial rather than a
-- plain unique constraint.
create unique index issued_documents_one_live_per_result_idx
  on public.issued_documents (student_result_id, document_type)
  where status <> 'revoked';

create index issued_documents_centre_idx on public.issued_documents (centre_id, issued_at desc);

-- Insert-only record of every public lookup. No SELECT policy for anon or
-- authenticated: this is evidence of scraping, and exposing it would hand an
-- attacker a list of valid numbers.
create table public.public_verification_logs (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('registration', 'certificate')),
  query_value text not null,
  matched boolean not null,
  created_at timestamptz not null default now()
);

create index public_verification_logs_created_idx
  on public.public_verification_logs (created_at desc);

revoke update, delete on public.public_verification_logs from authenticated, anon;

alter table public.issued_documents enable row level security;
alter table public.issued_documents force row level security;
alter table public.public_verification_logs enable row level security;
alter table public.public_verification_logs force row level security;

create policy issued_documents_staff_select on public.issued_documents
  for select to authenticated
  using (
    app.is_platform_admin()
    or (app.has_permission('certificate.read', organization_id, centre_id)
        and app.can_access_centre(centre_id))
  );

create policy issued_documents_select_self on public.issued_documents
  for select to authenticated
  using (student_id = app.current_student_id());

create policy public_verification_logs_platform_select on public.public_verification_logs
  for select to authenticated
  using (app.is_platform_admin());

-- Issuing goes through this function only; there is no INSERT policy for
-- issued_documents, so the number cannot be forged by a direct REST write.
create or replace function public.issue_certificate(p_student_result_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_org uuid;
  v_centre uuid;
  v_student uuid;
  v_published timestamptz;
  v_outcome public.result_outcome;
  v_number text;
  v_year text;
begin
  select p.organization_id, p.centre_id, e.student_id, p.published_at, r.outcome
    into v_org, v_centre, v_student, v_published, v_outcome
  from public.student_results r
  join public.result_publications p on p.id = r.publication_id
  join public.enrolments e on e.id = r.enrolment_id
  where r.id = p_student_result_id;

  if v_org is null then
    raise exception 'Result not found';
  end if;

  -- SECURITY DEFINER, so authorisation is this function's own responsibility.
  if auth.role() <> 'service_role'
     and not (app.is_platform_admin()
              or (app.has_permission('certificate.issue', v_org, v_centre)
                  and app.can_access_centre(v_centre))) then
    raise exception 'Not permitted to issue certificates for this centre';
  end if;

  if v_published is null then
    raise exception 'Cannot issue a certificate for unpublished results';
  end if;

  if v_outcome = 'fail' then
    raise exception 'Cannot issue a certificate for a failed result';
  end if;

  v_year := to_char(now() at time zone 'Asia/Kolkata', 'YY');
  v_number := 'CO-CERT-' || v_year || '-' ||
    lpad(app.next_document_number(v_org, null, 'certificate', v_year)::text, 6, '0');

  insert into public.issued_documents (
    organization_id, centre_id, student_id, student_result_id,
    document_number, issued_by
  )
  values (v_org, v_centre, v_student, p_student_result_id, v_number, auth.uid());

  return v_number;
end;
$$;

grant execute on function public.issue_certificate(uuid) to authenticated, service_role;
revoke execute on function public.issue_certificate(uuid) from anon, public;

-- Public verification. SECURITY DEFINER because an anonymous caller has no
-- read access to any of these tables and must not be given any.
create or replace function public.verify_certificate(p_number text)
returns table (
  document_number text,
  student_name text,
  course_name text,
  centre_name text,
  outcome public.result_outcome,
  issued_on date,
  status public.document_status
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_found boolean;
begin
  select exists (
    select 1 from public.issued_documents d where d.document_number = trim(p_number)
  ) into v_found;

  insert into public.public_verification_logs (kind, query_value, matched)
  values ('certificate', left(trim(p_number), 100), v_found);

  -- A revoked certificate is returned WITH its revoked status rather than
  -- hidden: an employer holding a revoked document needs to be told it was
  -- revoked, not that it never existed.
  return query
  select d.document_number, s.full_name, c.name, ce.name, r.outcome,
         (d.issued_at at time zone 'Asia/Kolkata')::date, d.status
  from public.issued_documents d
  join public.students s on s.id = d.student_id
  join public.centres ce on ce.id = d.centre_id
  join public.student_results r on r.id = d.student_result_id
  join public.result_publications p on p.id = r.publication_id
  join public.courses c on c.id = p.course_id
  where d.document_number = trim(p_number);
end;
$$;

grant execute on function public.verify_certificate(text) to anon, authenticated;

create or replace function public.verify_registration(p_registration_number text)
returns table (
  registration_number text,
  student_name text,
  course_name text,
  centre_name text,
  enrolment_status public.enrolment_status
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_found boolean;
begin
  select exists (
    select 1 from public.students s
    where s.registration_number = trim(p_registration_number)
  ) into v_found;

  insert into public.public_verification_logs (kind, query_value, matched)
  values ('registration', left(trim(p_registration_number), 100), v_found);

  return query
  select s.registration_number, s.full_name, c.name, ce.name, e.status
  from public.students s
  join public.centres ce on ce.id = s.centre_id
  left join public.enrolments e on e.student_id = s.id and e.status = 'active'
  left join public.courses c on c.id = e.course_id
  where s.registration_number = trim(p_registration_number);
end;
$$;

grant execute on function public.verify_registration(text) to anon, authenticated;
