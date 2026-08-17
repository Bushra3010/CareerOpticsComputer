-- 0046: a duplicate payment submission can no longer double-post.
--
-- PRD §19.4 promises "duplicate submission cannot double-post". It did.
-- Measured against the live database: two identical `post_payment` calls
-- issued together were BOTH accepted — two payment rows, two receipt
-- numbers, two sets of allocations, and ₹2,000 posted against a single
-- ₹1,000 tender. The ledger is insert-only, so the correction is a
-- reversal — after the student has already walked away with a receipt.
--
-- This is the ordinary shape of the bug, not an exotic one: a double click,
-- or a retry on a flaky connection at a centre counter.
--
-- The guard follows migration 0028's wallet idiom exactly rather than
-- inventing a second mechanism: a nullable `idempotency_key` plus a partial
-- unique index. A replay does not raise — it returns the ORIGINAL receipt,
-- which is what the counter clerk needs to see. Raising would be worse: the
-- clerk would read "error" and post it a third time.
--
-- The key stays nullable so every existing caller keeps working; the
-- application supplies one per rendered form.

alter table public.payments add column idempotency_key text;

create unique index payments_idempotency_idx
  on public.payments (fee_plan_id, idempotency_key)
  where idempotency_key is not null;

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

  -- The existing row lock. Taking it BEFORE the replay check is what makes
  -- two simultaneous submissions resolve one after the other rather than
  -- both reading "no payment yet" and both inserting.
  perform 1
  from public.fee_instalments
  where fee_plan_id = p_fee_plan_id
  for update;

  -- A replay returns the original receipt rather than a second one.
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

  -- Oldest instalment first, exactly as before.
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

    update public.fee_instalments
    set status = case
      when v_already_allocated + v_applied >= v_instalment.amount_paise then 'paid'
      else 'partially_paid'
    end
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
