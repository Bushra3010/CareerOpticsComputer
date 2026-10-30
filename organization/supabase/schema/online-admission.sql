-- =====================================================================
-- Online admission: a student applies with their documents, and the
-- centre's own admin approves it.
--
--   1. The applicant fills the online form (ERP /apply, no login): centre,
--      course, their details and their documents -- photo, Aadhaar,
--      marksheets, the fee payment screenshot. submit_online_admission
--      files it as a student with admissionStatus SUBMITTED, marked
--      applicationSource ONLINE. Nothing is charged yet.
--   2. The centre (or the head office) opens Student Management -> Online
--      Admission List, looks over the documents, and approves, rejects with
--      a reason, or asks for documents.
--   3. Approval confirms the admission and charges the centre's admission
--      fee from its wallet, exactly as an admission made at the counter is
--      charged; a wallet that cannot cover it keeps the application pending.
--
-- The website reaches the database only through the functions below.
-- Safe to re-run.
-- =====================================================================

alter table public.students add column if not exists "applicationSource" text;


-- ---------------------------------------------------------------------
-- 1. The courses a centre offers, for the form's course picker.
-- ---------------------------------------------------------------------
create or replace function public.public_branch_courses(p_branch_id text)
returns table ("id" text, "name" text)
language sql
stable
security definer
set search_path = public
as $$
  select c."id", c."name"
    from public.branch_courses bc
    join public.courses c on c."id" = bc."courseId"
    join public.branches b on b."id" = bc."branchId"
   where bc."branchId" = p_branch_id
     and c."deletedAt" is null and coalesce(c."isActive", true)
     and b."deletedAt" is null and coalesce(b."isActive", true) and coalesce(b."onlineEnrollment", true)
   order by c."name";
$$;

revoke all on function public.public_branch_courses(text) from public;
grant execute on function public.public_branch_courses(text) to anon, authenticated;


-- ---------------------------------------------------------------------
-- 2. The application.
--    p_student: firstName, lastName, dateOfBirth (yyyy-mm-dd), gender,
--      phone, email, whatsappNumber, fatherName, motherName,
--      streetAddress, city, district, state, pincode.
--    p_documents: { slot: { name, dataUrl } } -- passportPhoto and
--      aadharCardFront are required; aadharCardBack, tenthMarksheet,
--      twelfthMarksheet and paymentProof are optional.
-- ---------------------------------------------------------------------
create or replace function public.submit_online_admission(
  p_branch_id text,
  p_course_id text,
  p_student   jsonb,
  p_documents jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_branch   record;
  v_phone    text := right(regexp_replace(coalesce(p_student ->> 'phone', ''), '\D', '', 'g'), 10);
  v_dob      date;
  v_docs     jsonb := '{}'::jsonb;
  v_slot     text;
  v_file     jsonb;
  v_url      text;
  v_total    integer := 0;
  v_no       text;
  v_id       text;
  v_session  text;
  v_existing record;
  v_allowed  text[] := array['passportPhoto', 'aadharCardFront', 'aadharCardBack', 'tenthMarksheet', 'twelfthMarksheet', 'paymentProof'];
  v_need     text;
begin
  select "id", "name" into v_branch from public.branches
   where "id" = p_branch_id and "deletedAt" is null and coalesce("isActive", true) and coalesce("onlineEnrollment", true);
  if not found then
    raise exception 'INVALID: Please choose a centre from the list.';
  end if;
  if p_course_id is not null and not exists (
    select 1 from public.branch_courses where "branchId" = p_branch_id and "courseId" = p_course_id
  ) then
    raise exception 'INVALID: Please choose a course this centre offers.';
  end if;

  foreach v_need in array array['firstName', 'lastName', 'gender', 'fatherName', 'motherName', 'streetAddress', 'city', 'state', 'pincode'] loop
    if public.clean_text(p_student ->> v_need, 200) is null then
      raise exception 'INVALID: Please fill in %.', initcap(regexp_replace(v_need, '([A-Z])', ' \1', 'g'));
    end if;
  end loop;
  if length(v_phone) <> 10 or v_phone !~ '^[6-9]' then
    raise exception 'INVALID: Please enter a valid 10-digit mobile number.';
  end if;
  begin
    v_dob := (p_student ->> 'dateOfBirth')::date;
  exception when others then
    v_dob := null;
  end;
  if v_dob is null or v_dob > current_date - interval '3 years' or v_dob < date '1940-01-01' then
    raise exception 'INVALID: Please enter your date of birth.';
  end if;
  if (p_student ->> 'pincode') !~ '^\s*\d{6}\s*$' then
    raise exception 'INVALID: Pincode must be 6 digits.';
  end if;

  -- Documents: known slots only, images or PDFs, a sane size each and in all.
  for v_slot, v_file in select key, value from jsonb_each(coalesce(p_documents, '{}'::jsonb)) loop
    continue when not (v_slot = any(v_allowed));
    v_url := coalesce(v_file ->> 'dataUrl', '');
    continue when v_url = '';
    if v_url !~ '^data:(image/(jpeg|png|webp)|application/pdf);base64,' then
      raise exception 'INVALID: % must be a photo or a PDF.', initcap(regexp_replace(v_slot, '([A-Z])', ' \1', 'g'));
    end if;
    if length(v_url) > 3000000 then
      raise exception 'INVALID: % is too large; keep each file under 2 MB.', initcap(regexp_replace(v_slot, '([A-Z])', ' \1', 'g'));
    end if;
    v_total := v_total + length(v_url);
    v_docs := v_docs || jsonb_build_object(v_slot, jsonb_build_object(
      'name', public.clean_text(v_file ->> 'name', 120), 'dataUrl', v_url, 'uploadedAt', now()));
  end loop;
  if v_total > 12000000 then
    raise exception 'INVALID: The documents together are too large; keep them under 8 MB.';
  end if;
  if not (v_docs ? 'passportPhoto') then
    raise exception 'INVALID: Please upload your passport-size photo.';
  end if;
  if not (v_docs ? 'aadharCardFront') then
    raise exception 'INVALID: Please upload your Aadhaar card (front).';
  end if;

  -- The same applicant pressing submit again: the first application stands.
  select "id", "applicationNo" into v_existing from public.students
   where "branchId" = p_branch_id and "phone" = v_phone and "applicationSource" = 'ONLINE'
     and "admissionStatus" in ('SUBMITTED', 'PENDING_PAYMENT') and "deletedAt" is null
     and lower("firstName") = lower(public.clean_text(p_student ->> 'firstName', 80))
   order by "createdAt" desc limit 1;
  if found then
    return jsonb_build_object('applicationNo', v_existing."applicationNo", 'centre', v_branch."name", 'duplicate', true);
  end if;

  select "name" into v_session from public.session_years
   where "deletedAt" is null and "isCurrent" order by "startDate" desc limit 1;

  v_no := public.next_application_no();
  insert into public.students (
    "branchId", "applicationNo", "firstName", "lastName", "dateOfBirth", "gender", "phone", "whatsappNumber", "email",
    "fatherName", "motherName", "streetAddress", "city", "district", "state", "pincode",
    "courseId", "courseIds", "academicYear", "admissionDate", "admissionStatus", "applicationSource", "documents"
  ) values (
    p_branch_id, v_no,
    public.clean_text(p_student ->> 'firstName', 80), public.clean_text(p_student ->> 'lastName', 80), v_dob,
    upper(public.clean_text(p_student ->> 'gender', 20)), v_phone,
    coalesce(nullif(right(regexp_replace(coalesce(p_student ->> 'whatsappNumber', ''), '\D', '', 'g'), 10), ''), v_phone),
    public.clean_text(p_student ->> 'email', 120),
    public.clean_text(p_student ->> 'fatherName', 120), public.clean_text(p_student ->> 'motherName', 120),
    public.clean_text(p_student ->> 'streetAddress', 300), public.clean_text(p_student ->> 'city', 80),
    public.clean_text(p_student ->> 'district', 80), public.clean_text(p_student ->> 'state', 80), trim(p_student ->> 'pincode'),
    p_course_id, case when p_course_id is null then '{}'::text[] else array[p_course_id] end,
    v_session, now(), 'SUBMITTED', 'ONLINE', v_docs
  )
  returning "id" into v_id;

  return jsonb_build_object('applicationNo', v_no, 'centre', v_branch."name", 'duplicate', false);
end;
$$;

revoke all on function public.submit_online_admission(text, text, jsonb, jsonb) from public;
grant execute on function public.submit_online_admission(text, text, jsonb, jsonb) to anon, authenticated;


-- ---------------------------------------------------------------------
-- 3. Where an application stands, for the applicant: by application
--    number and the mobile it was made with.
-- ---------------------------------------------------------------------
create or replace function public.online_admission_status(p_application_no text, p_phone text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select jsonb_build_object(
        'applicationNo', s."applicationNo",
        'name', trim(s."firstName" || ' ' || s."lastName"),
        'centre', b."name",
        'status', s."admissionStatus"::text,
        'note', s."decisionNote",
        'requested', s."requestedDocuments")
       from public.students s join public.branches b on b."id" = s."branchId"
      where upper(trim(s."applicationNo")) = upper(trim(p_application_no))
        and s."phone" = right(regexp_replace(coalesce(p_phone, ''), '\D', '', 'g'), 10)
        and s."deletedAt" is null
      limit 1),
    jsonb_build_object('status', 'NOT_FOUND'));
$$;

revoke all on function public.online_admission_status(text, text) from public;
grant execute on function public.online_admission_status(text, text) to anon, authenticated;


-- ---------------------------------------------------------------------
-- 4. Approval confirms the admission and charges the centre, once.
--    An admission made at the counter was charged as it was saved; the
--    charge is keyed by the student, so approving it later charges nothing.
-- ---------------------------------------------------------------------
create or replace function public.charge_admission_on_approval()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new."admissionStatus" = 'APPROVED' and old."admissionStatus" is distinct from 'APPROVED' then
    perform public.charge_centre(new."branchId", 'ADMISSION', new."id",
      'Admission fee - ' || trim(concat_ws(' ', new."firstName", new."lastName")),
      coalesce(new."applicationNo", new."enrollmentNo"), null);
  end if;
  return new;
end;
$$;

-- An admission made at the counter is charged as it is saved; an online
-- application only when it is approved -- even one a member of staff typed in
-- on the online form while signed in.
create or replace function public.charge_admission()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.jwt_role() <> '' and public.jwt_role() <> 'STUDENT'
     and new."applicationSource" is distinct from 'ONLINE' then
    perform public.charge_centre(new."branchId", 'ADMISSION', new."id",
      'Admission fee - ' || trim(concat_ws(' ', new."firstName", new."lastName")),
      coalesce(new."applicationNo", new."enrollmentNo"), null);
  end if;
  return new;
end;
$$;

drop trigger if exists "students_charge_on_approval" on public.students;
create trigger "students_charge_on_approval" after update of "admissionStatus" on public.students
  for each row execute function public.charge_admission_on_approval();

notify pgrst, 'reload schema';

-- Check: what the form will offer.
select b."name" as centre, c."name" as course
  from public.public_centres() b
  left join lateral public.public_branch_courses(b."id") c on true;
