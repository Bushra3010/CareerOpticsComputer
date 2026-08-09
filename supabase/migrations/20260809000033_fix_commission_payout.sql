-- 0033: fixes a permission-boundary bug in `pay_commission` (migration
-- 0032), found live rather than assumed — never rewrite an applied
-- migration, per CLAUDE.md rule 5, so the fix is forward.
--
-- `pay_commission` is SECURITY DEFINER and already checks the caller holds
-- `commission.manage` before doing anything. It then called
-- `public.credit_wallet()` directly to pay a centre beneficiary — but
-- `credit_wallet` is ALSO SECURITY DEFINER and does its OWN independent
-- check, `has_permission('wallet.manage', ...)`, against `auth.uid()`, which
-- is unchanged by nesting one SECURITY DEFINER call inside another. A caller
-- who holds `commission.manage` but not `wallet.manage` — the entirely
-- expected case, since nothing says approving commissions should also
-- require wallet administration — was rejected with "Not authorised to
-- recharge wallets", a permission nobody was ever told they needed.
--
-- The fix follows the same pattern already used for `app.ensure_wallet_account`
-- and `app.reverse_wallet_debit`: a trusted internal helper in the `app`
-- schema with NO permission check of its own, callable only from another
-- SECURITY DEFINER function that has already done the checking. It is not a
-- second `credit_wallet` — it exists because a commission payout is not a
-- "recharge" (that word means an offline payment head office received, per
-- migration 0028's own header) and labelling it one would corrupt the
-- wallet's own reporting.

alter table public.wallet_entries drop constraint wallet_entries_entry_type_check;
alter table public.wallet_entries
  add constraint wallet_entries_entry_type_check
  check (entry_type in ('recharge', 'debit', 'reversal', 'commission_payout'));

create function app.credit_wallet_for_commission(
  p_centre_id uuid,
  p_amount_paise bigint,
  p_reference text
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_account uuid;
  v_org uuid;
begin
  select organization_id into v_org from public.centres where id = p_centre_id;
  v_account := app.ensure_wallet_account(p_centre_id);

  insert into public.wallet_entries
    (account_id, organization_id, amount_paise, entry_type, reason, reference, created_by)
  values
    (v_account, v_org, p_amount_paise, 'commission_payout', 'Referral commission', p_reference, auth.uid());

  return (select coalesce(sum(amount_paise), 0) from public.wallet_entries where account_id = v_account);
end;
$$;

revoke all on function app.credit_wallet_for_commission(uuid, bigint, text) from public, anon, authenticated;

create or replace function public.pay_commission(
  p_commission_entry_id uuid,
  p_payout_reference text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_entry public.commission_entries%rowtype;
  v_wallet_seq bigint;
  v_reference text;
begin
  select * into v_entry from public.commission_entries where id = p_commission_entry_id for update;
  if v_entry.id is null then raise exception 'Commission entry not found' using errcode = 'no_data_found'; end if;
  if not (app.is_platform_admin() or app.has_permission('commission.manage', v_entry.organization_id)) then
    raise exception 'Not authorised to pay commissions' using errcode = 'insufficient_privilege';
  end if;
  if v_entry.status <> 'payable' then
    raise exception 'Commission is not payable' using errcode = 'invalid_parameter_value';
  end if;

  if v_entry.beneficiary_type = 'centre' then
    v_reference := 'commission:' || p_commission_entry_id::text;
    perform app.credit_wallet_for_commission(v_entry.beneficiary_id, v_entry.amount_paise, v_reference);
    select entry_seq into v_wallet_seq
    from public.wallet_entries we
    join public.wallet_accounts wa on wa.id = we.account_id
    where wa.centre_id = v_entry.beneficiary_id
      and we.reference = v_reference;
  else
    if coalesce(btrim(p_payout_reference), '') = '' then
      raise exception 'A payout reference is required to settle a user beneficiary' using errcode = 'invalid_parameter_value';
    end if;
  end if;

  update public.commission_entries
  set status = 'paid', paid_at = now(), paid_by = auth.uid(),
      wallet_entry_seq = v_wallet_seq, payout_reference = p_payout_reference
  where id = p_commission_entry_id;
end;
$$;

grant execute on function public.pay_commission(uuid, text) to authenticated;
revoke all on function public.pay_commission(uuid, text) from public, anon;
