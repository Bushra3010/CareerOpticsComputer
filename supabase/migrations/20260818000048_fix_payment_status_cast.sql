-- 0048: restores the enum cast that 0046 dropped.
--
-- Rewriting `post_payment` to add the idempotency guard, I retyped the
-- allocation loop and lost this:
--
--   set status = (case ... end)::public.fee_instalment_status
--
-- The original carried a comment saying the cast was required, because a
-- bare CASE yields text and `fee_instalments.status` is an enum. Without it
-- every payment failed with "column status is of type
-- fee_instalment_status but expression is of type text" — fee collection
-- down completely, caught by the acceptance suite before it reached anyone.
--
-- The loop body below is the original's, unchanged, with only the
-- idempotency additions from 0046 kept.

create or replace function public.post_payment(
  p_organization_id uuid,
  p_centre_id uuid,
  p_student_id uuid,
  p_fee_plan_id uuid,
  p_amount_paise bigint,
  p_method public.payment_method,
  p_reference text,
  p_idempotency_key text default null
)
returns table (payment_id uuid, receipt_number text)
language plpgsql
set search_path = ''
as $function$
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

  perform 1
  from public.fee_instalments
  where fee_plan_id = p_fee_plan_id
  for update;

  -- A replay returns the original receipt rather than posting a second time.
  if p_idempotency_key is not null then
    select p.id, p.receipt_number into v_payment_id, v_receipt
    from public.payments p
    where p.fee_plan_id = p_fee_plan_id
      and p.idempotency_key = p_idempotency_key;

    if v_payment_id is not null then
      payment_id := v_payment_id;
      receipt_number := v_receipt;
      return next;
      return;
    end if;
  end if;

  select code into v_centre_code from public.centres where id = p_centre_id;

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
    amount_paise, method, reference, posted_by, idempotency_key
  )
  values (
    p_organization_id, p_centre_id, p_student_id, p_fee_plan_id, v_receipt,
    p_amount_paise, p_method, p_reference, auth.uid(), p_idempotency_key
  )
  returning id into v_payment_id;

  for v_instalment in
    select i.id, i.amount_paise
    from public.fee_instalments i
    where i.fee_plan_id = p_fee_plan_id
      and i.status <> 'waived'
    order by i.sequence
  loop
    exit when v_remaining <= 0;

    select coalesce(sum(a.amount_paise), 0) into v_already_allocated
    from public.payment_allocations a
    where a.fee_instalment_id = v_instalment.id;

    v_outstanding := v_instalment.amount_paise - v_already_allocated;
    if v_outstanding <= 0 then
      continue;
    end if;

    v_applied := least(v_remaining, v_outstanding);

    insert into public.payment_allocations (payment_id, fee_instalment_id, amount_paise)
    values (v_payment_id, v_instalment.id, v_applied);

    -- The cast is required: a bare CASE yields text, and `status` is an enum.
    update public.fee_instalments
    set status = (
      case when v_applied >= v_outstanding then 'paid' else 'partially_paid' end
    )::public.fee_instalment_status
    where id = v_instalment.id;

    v_remaining := v_remaining - v_applied;
  end loop;

  if v_remaining > 0 then
    raise exception 'Payment exceeds the outstanding balance on this plan';
  end if;

  payment_id := v_payment_id;
  receipt_number := v_receipt;
  return next;
end;
$function$;

grant execute on function public.post_payment(uuid, uuid, uuid, uuid, bigint, public.payment_method, text, text) to authenticated;
revoke all on function public.post_payment(uuid, uuid, uuid, uuid, bigint, public.payment_method, text, text) from public, anon;
