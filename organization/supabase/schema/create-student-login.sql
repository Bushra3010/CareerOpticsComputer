-- =====================================================================
-- Issue a student portal login from the SQL editor
-- =====================================================================
-- A stand-in for the create-student-user edge function, for the case where
-- that function has not been deployed to the project. It mints exactly what
-- the function mints -- an auth account at <loginId>@careeroptics.local, the
-- app_metadata claims the portal RLS reads, and the students.userId link --
-- so a login made here and a login made by the function are the same thing to
-- the rest of the app.
--
-- Two things this deliberately does NOT do, and the edge function does:
--
--   * It does not check who is asking. The SQL editor already runs as the
--     database owner, so there is no caller to confine to a branch. Anyone
--     with SQL editor access can already read and write every table; this
--     function hands them nothing they did not have.
--   * It does not make the "Create login" button in View Students work. That
--     button calls the edge function. Until the function is deployed, every
--     login has to be issued by running this.
--
-- Writing into auth.users by hand is not something Supabase supports, so treat
-- this as the temporary path it is and deploy the function when you can:
--   supabase functions deploy create-student-user --project-ref <ref> --workdir organization
--
-- RUN student-portal-rls.sql FIRST. Without it every signed-in account -- a
-- student included -- can read every student's phone, fees and marks.
--
-- Idempotent: re-running against the same student resets their password
-- instead of creating a second account.
-- =====================================================================

create extension if not exists pgcrypto with schema extensions;


-- ---------------------------------------------------------------------
-- p_student may be the student's id, enrolment number or application
-- number, so you can issue a login straight from what is on screen
-- without going to look up a UUID.
--
-- p_login_id is what the student types to sign in. Left null it falls
-- back to the enrolment number, the way the edge function does. The
-- login page appends @careeroptics.local, so the account is stored there.
-- ---------------------------------------------------------------------
create or replace function public.create_student_login(
  p_student  text,
  p_login_id text default null,
  p_password text default null
)
returns table (student_id text, user_id uuid, login_email text, created boolean)
language plpgsql
security invoker
set search_path = public, extensions, auth
as $$
declare
  v_student  record;
  v_org      text;
  v_name     text;
  v_login    text;
  v_email    text;
  v_user     uuid;
  v_other    uuid;
  v_created  boolean := false;
  v_app      jsonb;
  v_meta     jsonb;
  v_identity jsonb;
begin
  if length(coalesce(p_password, '')) < 6 then
    raise exception 'Password must be at least 6 characters';
  end if;

  -- The id column may be uuid or text depending on how the table was
  -- built, so every comparison here goes through ::text.
  select s."id"::text                  as id,
         s."firstName"                 as first_name,
         s."lastName"                  as last_name,
         s."branchId"::text            as branch_id,
         s."userId"::text              as user_id,
         s."enrollmentNo"::text        as enrollment_no,
         s."applicationNo"::text       as application_no,
         s."email"::text               as email,
         s."phone"::text               as phone
    into v_student
    from public.students s
   where s."deletedAt" is null
     and (    s."id"::text                          = p_student
          or lower(coalesce(s."enrollmentNo"::text, '')) = lower(p_student)
          or lower(coalesce(s."applicationNo"::text, '')) = lower(p_student))
   limit 1;

  if v_student.id is null then
    raise exception 'No student matches "%" by id, enrolment number or application number', p_student;
  end if;

  select b."organizationId"::text
    into v_org
    from public.branches b
   where b."id"::text = v_student.branch_id;

  if v_org is null then
    raise exception 'The student''s branch (%) no longer exists', v_student.branch_id;
  end if;

  v_name := nullif(btrim(concat_ws(' ', v_student.first_name, v_student.last_name)), '');
  v_name := coalesce(v_name, 'Student');

  v_login := nullif(btrim(coalesce(p_login_id, '')), '');
  v_login := coalesce(v_login,
                      nullif(btrim(coalesce(v_student.enrollment_no, '')), ''),
                      nullif(btrim(coalesce(v_student.application_no, '')), ''));
  if v_login is null then
    raise exception 'This student has no enrolment number yet, so pass a login ID';
  end if;

  v_email := lower(v_login);
  if position('@' in v_email) = 0 then
    v_email := v_email || '@careeroptics.local';
  end if;

  -- students.userId is the link the portal reads, so an existing account is
  -- found through it rather than by matching on the address.
  if v_student.user_id is not null then
    select u.id into v_user from auth.users u where u.id::text = v_student.user_id;
  end if;

  -- Refuse to move an address off someone else's account: that would sign
  -- this student in as them.
  select u.id
    into v_other
    from auth.users u
   where lower(u.email) = v_email
     and (v_user is null or u.id <> v_user);
  if v_other is not null then
    raise exception 'Login ID "%" is already taken by another account', v_login;
  end if;

  -- Only the service role can write app_metadata through the API, which is
  -- why the portal's RLS policies read the claims from there and not from
  -- user_metadata, which a student can rewrite themselves.
  v_app := jsonb_build_object(
    'role',           'STUDENT',
    'branchId',       v_student.branch_id,
    'organizationId', v_org,
    'studentId',      v_student.id
  );

  v_meta := jsonb_build_object(
    'name',           v_name,
    'role',           'STUDENT',
    'userType',       'STUDENT',
    'branchId',       v_student.branch_id,
    'organizationId', v_org,
    'studentId',      v_student.id,
    'contactEmail',   v_student.email,
    'phone',          v_student.phone
  );

  if v_user is null then
    v_user := gen_random_uuid();

    -- The token columns are set to '' rather than left null on purpose:
    -- GoTrue reads them as strings and a null makes later auth calls for
    -- this account fail with a conversion error.
    insert into auth.users (
      instance_id, id, aud, role,
      email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change,
      email_change_token_current, reauthentication_token, phone_change, phone_change_token
    ) values (
      '00000000-0000-0000-0000-000000000000', v_user, 'authenticated', 'authenticated',
      v_email, crypt(p_password, gen_salt('bf')), now(),
      jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')) || v_app,
      v_meta,
      now(), now(),
      '', '', '', '', '', '', '', ''
    );
    v_created := true;
  else
    update auth.users
       set email              = v_email,
           encrypted_password = crypt(p_password, gen_salt('bf')),
           email_confirmed_at = coalesce(email_confirmed_at, now()),
           raw_app_meta_data  = coalesce(raw_app_meta_data,  '{}'::jsonb) || v_app,
           raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || v_meta,
           updated_at         = now()
     where id = v_user;
  end if;

  -- Password sign-in resolves the account through auth.identities, so an
  -- account without this row exists but cannot sign in.
  v_identity := jsonb_build_object(
    'sub',            v_user::text,
    'email',          v_email,
    'email_verified', true,
    'phone_verified', false
  );

  if exists (
    select 1 from information_schema.columns
     where table_schema = 'auth' and table_name = 'identities' and column_name = 'provider_id'
  ) then
    insert into auth.identities (
      id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(), v_user, v_user::text, v_identity, 'email', now(), now(), now()
    )
    on conflict (provider, provider_id)
      do update set identity_data = excluded.identity_data, updated_at = now();
  else
    -- Older projects key identities on (provider, id) and have no provider_id.
    insert into auth.identities (
      id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
    ) values (
      v_user::text, v_user, v_identity, 'email', now(), now(), now()
    )
    on conflict (provider, id)
      do update set identity_data = excluded.identity_data, updated_at = now();
  end if;

  -- Without this link every portal query resolves to no student and they
  -- sign in to an empty workspace. The id is passed as a literal so it fits
  -- whether the column is uuid or text.
  execute format(
    'update public.students set "userId" = %L, "updatedAt" = now() where "id"::text = %L',
    v_user::text, v_student.id
  );

  return query select v_student.id, v_user, v_email, v_created;
end;
$$;


-- ---------------------------------------------------------------------
-- Anything in `public` is reachable over PostgREST as /rest/v1/rpc/<name>,
-- so leaving the default EXECUTE in place would let any visitor with the
-- anon key reset any student's password. Only the SQL editor and the
-- service role should be able to call this.
-- ---------------------------------------------------------------------
revoke all on function public.create_student_login(text, text, text) from public;
revoke all on function public.create_student_login(text, text, text) from anon, authenticated;
