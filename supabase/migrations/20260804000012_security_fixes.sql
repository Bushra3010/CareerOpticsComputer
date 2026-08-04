-- 0012: security and correctness fixes for defects found by audit and then
-- reproduced against the live project. Every item below was demonstrated, not
-- theorised — the probe results are quoted with each fix.

-- ---------------------------------------------------------------------------
-- 1. Attendance could never be re-saved.
--
--    Probe: second `upsert` of the same session ->
--    "new row violates row-level security policy (USING expression) for table
--     attendance_sessions"
--
--    features/attendance/actions.ts upserts the session with merge-duplicates,
--    which Postgres executes as ON CONFLICT DO UPDATE. Migration 0010 gave the
--    table INSERT and SELECT policies but no UPDATE policy, so the *first*
--    save of a day worked and every correction afterwards failed. The row
--    carries no mutable business data; the policy exists purely so the
--    get-or-create upsert can complete.
-- ---------------------------------------------------------------------------
create policy attendance_sessions_update on public.attendance_sessions
  for update to authenticated
  using (
    app.has_permission('attendance.create', organization_id, centre_id)
    and app.can_access_centre(centre_id)
  )
  with check (
    app.has_permission('attendance.create', organization_id, centre_id)
    and app.can_access_centre(centre_id)
  );

-- ---------------------------------------------------------------------------
-- 2. Attendance records accepted any enrolment id.
--
--    Probe: centre A marked centre B's enrolment inside A's own session and
--    the write succeeded.
--
--    0010's policies scoped only through session_id — they proved the session
--    belonged to your centre but never that the *enrolment* did. enrolment_id
--    arrives from raw form field names (`status_<uuid>`), so it is entirely
--    attacker-chosen. Require the enrolment to sit in the same centre AND the
--    same course as its session; that also stops an honest mis-post of a
--    student who isn't in this class.
-- ---------------------------------------------------------------------------
drop policy attendance_records_insert on public.attendance_records;
drop policy attendance_records_update on public.attendance_records;

create policy attendance_records_insert on public.attendance_records
  for insert to authenticated
  with check (
    exists (
      select 1
      from public.attendance_sessions s
      join public.enrolments e
        on e.id = enrolment_id
       and e.centre_id = s.centre_id
       and e.course_id = s.course_id
      where s.id = session_id
        and app.has_permission('attendance.create', s.organization_id, s.centre_id)
        and app.can_access_centre(s.centre_id)
        and app.centre_is_operational(s.centre_id)
    )
  );

create policy attendance_records_update on public.attendance_records
  for update to authenticated
  using (
    exists (
      select 1 from public.attendance_sessions s
      where s.id = session_id
        and app.has_permission('attendance.create', s.organization_id, s.centre_id)
        and app.can_access_centre(s.centre_id)
    )
  )
  with check (
    exists (
      select 1
      from public.attendance_sessions s
      join public.enrolments e
        on e.id = enrolment_id
       and e.centre_id = s.centre_id
       and e.course_id = s.course_id
      where s.id = session_id
        and app.has_permission('attendance.create', s.organization_id, s.centre_id)
        and app.can_access_centre(s.centre_id)
    )
  );

-- ---------------------------------------------------------------------------
-- 3. Any signed-in user could consume another centre's document sequence.
--
--    Probe: centre A called next_document_number with centre B's id and it
--    returned a number, permanently advancing B's receipt counter.
--
--    The wrapper is SECURITY DEFINER and was granted to `authenticated` with
--    no permission check at all. Nothing in the application calls it — the
--    numbering happens inside admit_student / create_fee_plan / post_payment,
--    which reach app.next_document_number directly. PostgREST only exposes the
--    `public` schema, so revoking the wrapper closes the REST hole while
--    leaving the internal callers untouched.
-- ---------------------------------------------------------------------------
revoke execute on function public.next_document_number(uuid, uuid, text, text)
  from authenticated, anon, public;

-- ---------------------------------------------------------------------------
-- 4. Any signed-in user could write audit rows into any organisation.
--
--    Probe: centre A inserted an audit row with action 'FORGED' against the
--    organisation, and it was accepted.
--
--    actor_id was already forced to auth.uid() for non-service-role callers,
--    so entries could not be misattributed — but an attacker could still
--    flood or pollute another tenant's audit trail, which is exactly the
--    record you rely on during an investigation. Require org membership.
--    (The only application caller is approveCentreApplication, on the
--    service-role client, which is unaffected.)
-- ---------------------------------------------------------------------------
create or replace function public.record_audit_entry(
  p_organization_id uuid,
  p_action text,
  p_table_name text,
  p_row_id uuid default null,
  p_reason text default null,
  p_before jsonb default null,
  p_after jsonb default null,
  p_actor_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
  v_actor uuid;
  v_is_service boolean := auth.role() = 'service_role';
begin
  if not v_is_service
     and not (app.is_platform_admin() or app.is_org_member(p_organization_id)) then
    raise exception 'Not permitted to write audit entries for this organization';
  end if;

  -- Only the service role may assert an explicit actor (webhooks, cron, the
  -- invitation flow). Authenticated callers always get their own auth.uid(),
  -- so a client can never forge "who did it" in an audit entry.
  v_actor := case when v_is_service then p_actor_id else auth.uid() end;

  insert into public.audit_logs (
    organization_id, actor_id, action, table_name, row_id, reason, before_data, after_data
  )
  values (
    p_organization_id, v_actor, p_action, p_table_name, p_row_id, p_reason, p_before, p_after
  )
  returning id into v_id;

  return v_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- 5. Money RPCs trusted their own arguments.
--
--    Probe: centre A called create_fee_plan with centre B's enrolment id and
--    it succeeded. Because fee_plans has a UNIQUE index on enrolment_id, that
--    is not just a stray row — it permanently prevents centre B from ever
--    creating a fee plan for that student.
--
--    Both functions are SECURITY INVOKER, so RLS applied to the rows they
--    wrote; but RLS was checking the *caller-supplied* centre_id, which the
--    caller controls, rather than the centre the enrolment actually belongs
--    to. Tie the arguments to each other explicitly.
-- ---------------------------------------------------------------------------
create or replace function public.create_fee_plan(
  p_organization_id uuid,
  p_centre_id uuid,
  p_enrolment_id uuid,
  p_total_paise bigint,
  p_instalment_count int,
  p_first_due_date date
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_plan_id uuid;
  v_base bigint;
  v_remainder bigint;
  v_amount bigint;
  i int;
begin
  if p_instalment_count < 1 then
    raise exception 'Instalment count must be at least 1';
  end if;

  -- The enrolment must actually live in the centre and org being billed.
  -- Without this, the caller's own centre_id argument is the only thing RLS
  -- has to check, and the caller chooses it.
  if not exists (
    select 1 from public.enrolments e
    where e.id = p_enrolment_id
      and e.centre_id = p_centre_id
      and e.organization_id = p_organization_id
  ) then
    raise exception 'Enrolment does not belong to this centre';
  end if;

  insert into public.fee_plans (organization_id, centre_id, enrolment_id, total_paise)
  values (p_organization_id, p_centre_id, p_enrolment_id, p_total_paise)
  returning id into v_plan_id;

  -- Integer split: the remainder paise go onto the first instalment so the
  -- instalments always sum to exactly the total (never off by a paisa).
  v_base := p_total_paise / p_instalment_count;
  v_remainder := p_total_paise - (v_base * p_instalment_count);

  for i in 1..p_instalment_count loop
    v_amount := v_base + case when i = 1 then v_remainder else 0 end;
    insert into public.fee_instalments (fee_plan_id, sequence, due_date, amount_paise)
    values (
      v_plan_id, i,
      (p_first_due_date + ((i - 1) * interval '1 month'))::date,
      v_amount
    );
  end loop;

  return v_plan_id;
end;
$$;

create or replace function public.post_payment(
  p_organization_id uuid,
  p_centre_id uuid,
  p_student_id uuid,
  p_fee_plan_id uuid,
  p_amount_paise bigint,
  p_method public.payment_method,
  p_reference text
)
returns table (payment_id uuid, receipt_number text)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_receipt text;
  v_payment_id uuid;
  v_centre_code text;
  v_fy text;
  v_local timestamp;
  v_remaining bigint := p_amount_paise;
  v_instalment record;
  v_already_allocated bigint;
  v_outstanding bigint;
  v_applied bigint;
begin
  if p_amount_paise <= 0 then
    raise exception 'Payment amount must be positive';
  end if;

  -- The plan, the student and the centre must be one consistent set. Locking
  -- the plan row also serialises concurrent cashiers against the same plan,
  -- so the allocation loop below cannot interleave with another payment and
  -- over-allocate an instalment.
  perform 1
  from public.fee_plans p
  join public.enrolments e on e.id = p.enrolment_id
  where p.id = p_fee_plan_id
    and p.centre_id = p_centre_id
    and p.organization_id = p_organization_id
    and e.student_id = p_student_id
  for update of p;

  if not found then
    raise exception 'Fee plan does not belong to this centre and student';
  end if;

  select code into v_centre_code from public.centres where id = p_centre_id;

  -- Indian financial year runs April-March (assumption A4), evaluated in the
  -- organisation's timezone. now() is UTC in the database session, so between
  -- midnight and 05:30 IST on 1 April this would otherwise still issue last
  -- year's receipt series (build plan R13).
  v_local := now() at time zone 'Asia/Kolkata';
  v_fy := case
    when extract(month from v_local) >= 4
      then to_char(v_local, 'YY') || to_char(v_local + interval '1 year', 'YY')
      else to_char(v_local - interval '1 year', 'YY') || to_char(v_local, 'YY')
  end;

  v_receipt := 'RCP-' || v_centre_code || '-' || v_fy || '-' ||
    lpad(app.next_document_number(p_organization_id, p_centre_id, 'receipt', v_fy)::text, 6, '0');

  insert into public.payments (
    organization_id, centre_id, student_id, fee_plan_id, receipt_number,
    amount_paise, method, reference, posted_by
  )
  values (
    p_organization_id, p_centre_id, p_student_id, p_fee_plan_id, v_receipt,
    p_amount_paise, p_method, p_reference, auth.uid()
  )
  returning id into v_payment_id;

  -- Allocate oldest unpaid instalment first. Each instalment's outstanding
  -- amount comes from its own prior allocations, not from payment ordering,
  -- so a partial payment followed by another lands correctly.
  for v_instalment in
    select id, amount_paise
    from public.fee_instalments
    where fee_plan_id = p_fee_plan_id and status in ('pending', 'partially_paid')
    order by sequence
  loop
    exit when v_remaining <= 0;

    select coalesce(sum(a.amount_paise), 0) into v_already_allocated
    from public.payment_allocations a
    where a.fee_instalment_id = v_instalment.id;

    v_outstanding := v_instalment.amount_paise - v_already_allocated;
    continue when v_outstanding <= 0;

    v_applied := least(v_remaining, v_outstanding);
    v_remaining := v_remaining - v_applied;

    insert into public.payment_allocations (payment_id, fee_instalment_id, amount_paise)
    values (v_payment_id, v_instalment.id, v_applied);

    -- The cast is required: a bare CASE yields text, and `status` is an enum.
    update public.fee_instalments
    set status = (
      case when v_applied >= v_outstanding then 'paid' else 'partially_paid' end
    )::public.fee_instalment_status
    where id = v_instalment.id;
  end loop;

  -- Overpayment is rejected rather than silently kept as a credit: student
  -- wallets/credit balances are a later feature, and quietly swallowing money
  -- with nothing pointing at it is worse than making the cashier fix the
  -- amount. The raise rolls the payment row back with it.
  if v_remaining > 0 then
    raise exception 'Payment exceeds the outstanding balance by % paise', v_remaining;
  end if;

  return query select v_payment_id, v_receipt;
end;
$$;

-- ---------------------------------------------------------------------------
-- 6. An enrolment could be duplicated.
--
--    Nothing stopped the same student being enrolled in the same course twice
--    at the same centre, which would double every fee plan, attendance roster
--    row and eventual certificate for that student.
-- ---------------------------------------------------------------------------
create unique index if not exists enrolments_unique_active_idx
  on public.enrolments (student_id, course_id)
  where status = 'active';

-- ---------------------------------------------------------------------------
-- 7. Nothing was ever audited.
--
--    Probe: after admitting students, taking attendance, creating fee plans
--    and posting payments, audit_logs contained zero rows from the system —
--    app.audit_trigger() was written in migration 0003 and then attached to
--    no table at all.
--
--    Ledger tables (payments, payment_allocations) are deliberately excluded:
--    they are insert-only and are their own audit record, so duplicating them
--    would double the write cost for no extra evidence.
--
--    Only tables carrying organization_id are listed. audit_trigger reads that
--    column off the row, and audit_logs_select filters on it — a child table
--    like fee_instalments or attendance_records would produce rows with a null
--    organisation that no org admin could ever read.
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'centres', 'memberships', 'students', 'enrolments',
    'centre_applications', 'fee_plans'
  ]
  loop
    execute format(
      'create trigger audit_changes after insert or update or delete on public.%I
         for each row execute function app.audit_trigger()',
      t
    );
  end loop;
end;
$$;
