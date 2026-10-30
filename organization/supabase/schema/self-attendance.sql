-- =====================================================================
-- Students mark their own attendance: by scanning the centre's QR, or by
-- a selfie taken in the student portal.
--
--   * The centre shows a QR on a screen (Attendance -> QR Attendance). The
--     code in it lasts 90 seconds and is replaced every minute, so it has to
--     be scanned at the centre, not from a photo sent home.
--   * A selfie is kept with the day's mark as evidence, with where it was
--     taken when the phone allows, for the centre to look over.
--
-- Either way the student gets today's PRESENT in attendance_records (a mark
-- the centre already made stands), and the check-in is logged in
-- attendance_checkins. Students reach both through student_check_in below.
--
-- Safe to re-run.
-- =====================================================================

create table if not exists public.attendance_qr_codes (
  "code"       text primary key,
  "branchId"   text not null references public.branches("id") on delete cascade,
  "createdBy"  text,
  "createdAt"  timestamptz not null default now(),
  "validUntil" timestamptz not null
);
create index if not exists "attendance_qr_codes_branch_idx" on public.attendance_qr_codes ("branchId", "validUntil" desc);
alter table public.attendance_qr_codes enable row level security;
-- No policies: read and written only by the functions below.

create table if not exists public.attendance_checkins (
  "id"           text primary key default gen_random_uuid()::text,
  "attendanceId" text references public.attendance_records("id") on delete set null,
  "studentId"    text not null references public.students("id") on delete cascade,
  "branchId"     text not null,
  "date"         date not null,
  "method"       text not null check ("method" in ('QR', 'SELFIE')),
  "photo"        jsonb,
  "latitude"     double precision,
  "longitude"    double precision,
  "createdAt"    timestamptz not null default now()
);
create index if not exists "attendance_checkins_branch_date_idx" on public.attendance_checkins ("branchId", "date" desc);
create index if not exists "attendance_checkins_student_idx" on public.attendance_checkins ("studentId", "date" desc);
alter table public.attendance_checkins enable row level security;

drop policy if exists "Check-ins readable by admin, the centre or the student" on public.attendance_checkins;
create policy "Check-ins readable by admin, the centre or the student" on public.attendance_checkins
  for select to authenticated
  using (
    public.is_org_admin()
    or public.is_branch_staff("branchId")
    or "studentId" = public.jwt_student_id()
  );
grant select on public.attendance_checkins to authenticated;

-- attendance_records still carries the old "Authenticated full access"
-- policy, which lets any login write any attendance. It is left in place here:
-- a few staff logins (an accountant, a teacher) have no branch on their login
-- and can mark attendance only through it. Closing it belongs with the review
-- of every table that has that policy.


-- ---------------------------------------------------------------------
-- 1. A fresh code for the centre's screen.
-- ---------------------------------------------------------------------
create or replace function public.new_attendance_qr(p_branch_id text, p_by text default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code  text;
  v_until timestamptz := now() + interval '90 seconds';
begin
  if not coalesce(public.is_org_admin() or public.is_branch_staff(p_branch_id), false) then
    raise exception 'Only the centre or the head office can show the attendance QR.';
  end if;
  if not exists (select 1 from public.branches where "id" = p_branch_id and "deletedAt" is null) then
    raise exception 'Centre not found.';
  end if;
  -- Old codes are of no use once they lapse.
  delete from public.attendance_qr_codes where "validUntil" < now() - interval '1 hour';
  v_code := upper(substr(md5(random()::text || clock_timestamp()::text || p_branch_id), 1, 10));
  insert into public.attendance_qr_codes ("code", "branchId", "createdBy", "validUntil")
  values (v_code, p_branch_id, p_by, v_until);
  return jsonb_build_object('code', v_code, 'validUntil', v_until);
end;
$$;

revoke all on function public.new_attendance_qr(text, text) from public, anon;
grant execute on function public.new_attendance_qr(text, text) to authenticated;


-- ---------------------------------------------------------------------
-- 2. A student marks today's attendance.
--    p_method 'QR' needs a live code of the student's own centre; 'SELFIE'
--    needs the photo (a data: URL image, under ~1.5 MB).
-- ---------------------------------------------------------------------
create or replace function public.student_check_in(
  p_method    text,
  p_code      text default null,
  p_photo     jsonb default null,
  p_latitude  double precision default null,
  p_longitude double precision default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student record;
  v_today   date := (now() at time zone 'Asia/Kolkata')::date;
  v_row     record;
  v_id      text;
  v_method  text := upper(coalesce(p_method, ''));
  v_photo   text := coalesce(p_photo ->> 'dataUrl', '');
begin
  if public.jwt_role() <> 'STUDENT' or public.jwt_student_id() is null then
    raise exception 'INVALID: Sign in with your student login to mark attendance.';
  end if;
  select "id", "branchId", "batchId" into v_student
    from public.students where "id" = public.jwt_student_id() and "deletedAt" is null;
  if not found then
    raise exception 'INVALID: Your student record was not found.';
  end if;

  if v_method = 'QR' then
    if not exists (
      select 1 from public.attendance_qr_codes
       where "code" = upper(trim(coalesce(p_code, ''))) and "branchId" = v_student."branchId" and "validUntil" > now()
    ) then
      raise exception 'INVALID: This QR has expired or is not your centre''s. Scan the code on your centre''s screen.';
    end if;
  elsif v_method = 'SELFIE' then
    if v_photo !~ '^data:image/(jpeg|png|webp);base64,' or length(v_photo) > 2000000 then
      raise exception 'INVALID: Take a selfie to mark attendance.';
    end if;
  else
    raise exception 'INVALID: Choose QR or selfie.';
  end if;

  -- Today's mark: a mark the centre already made stands; otherwise PRESENT.
  select "id", "status" into v_row from public.attendance_records
   where "studentId" = v_student."id" and "date" = v_today;
  if found then
    v_id := v_row."id";
  else
    insert into public.attendance_records ("studentId", "branchId", "batchId", "date", "status", "remarks", "updatedAt")
    values (v_student."id", v_student."branchId", v_student."batchId", v_today, 'PRESENT',
            case v_method when 'QR' then 'Self check-in (QR)' else 'Self check-in (selfie)' end, now())
    returning "id" into v_id;
  end if;

  insert into public.attendance_checkins ("attendanceId", "studentId", "branchId", "date", "method", "photo", "latitude", "longitude")
  values (v_id, v_student."id", v_student."branchId", v_today, v_method,
          case when v_method = 'SELFIE' then jsonb_build_object('dataUrl', v_photo, 'uploadedAt', now()) end,
          p_latitude, p_longitude);

  return jsonb_build_object(
    'date', v_today,
    'status', coalesce(v_row."status"::text, 'PRESENT'),
    'alreadyMarked', v_row."id" is not null
  );
end;
$$;

revoke all on function public.student_check_in(text, text, jsonb, double precision, double precision) from public, anon;
grant execute on function public.student_check_in(text, text, jsonb, double precision, double precision) to authenticated;

notify pgrst, 'reload schema';

-- Check: what attendance_records allows now.
select polname from pg_policy where polrelid = 'public.attendance_records'::regclass order by 1;
