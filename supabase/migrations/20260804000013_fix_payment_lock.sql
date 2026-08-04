-- 0013: fix a regression introduced by 0012.
--
-- 0012 added a linkage check to post_payment written as
--   perform 1 from public.fee_plans p join public.enrolments e ... for update of p;
--   if not found then raise exception ...
--
-- That rejected every legitimate payment. The cause is not the linkage — a
-- plain SELECT of the identical join returns the row for the same user. It is
-- the lock: under RLS, `SELECT ... FOR UPDATE` can only lock rows the caller
-- could also UPDATE, and fee_plans has SELECT and INSERT policies but no
-- UPDATE policy (it has no mutable columns, so none was ever needed). With no
-- UPDATE policy the row is unlockable, the query yields nothing, and the guard
-- fires on a valid payment.
--
-- The lock is still wanted — it serialises two cashiers posting against the
-- same plan so the allocation loop cannot interleave and over-allocate an
-- instalment. So keep the lock but move it to fee_instalments, which is what
-- the loop actually reads and updates, and which does have an UPDATE policy.

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
  v_linked uuid;
  v_remaining bigint := p_amount_paise;
  v_instalment record;
  v_already_allocated bigint;
  v_outstanding bigint;
  v_applied bigint;
begin
  if p_amount_paise <= 0 then
    raise exception 'Payment amount must be positive';
  end if;

  -- The plan, the student, the centre and the org must be one consistent set.
  -- Plain SELECT: locking fee_plans is not possible under RLS (see header).
  select p.id into v_linked
  from public.fee_plans p
  join public.enrolments e on e.id = p.enrolment_id
  where p.id = p_fee_plan_id
    and p.centre_id = p_centre_id
    and p.organization_id = p_organization_id
    and e.student_id = p_student_id;

  if v_linked is null then
    raise exception 'Fee plan does not belong to this centre and student';
  end if;

  -- Serialise concurrent cashiers on this plan by locking the instalment rows
  -- the allocation loop below reads and mutates. A second payment against the
  -- same plan waits here until the first commits, so it sees that payment's
  -- allocations rather than a stale outstanding balance.
  perform 1
  from public.fee_instalments
  where fee_plan_id = p_fee_plan_id
  for update;

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
