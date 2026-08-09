-- 0045: centre income and expenses — the matrix's `expense.*` row (Finance
-- Admin all, HO Operator read, Centre Owner/Manager/Accountant all-own),
-- PRD §6.7's "income & expense tracking" bullet. Course fees are NOT this:
-- they already live in the payments ledger. This is everything else a
-- centre's cash box sees — rent out, photocopying income in.
--
-- Insert-only, per CLAUDE.md rule 4: corrections are compensating rows.
-- A reversal is a NEW row with the OPPOSITE type, the SAME amount, and
-- `reverses_entry_id` pointing at the original — so net = income − expense
-- self-corrects with no signed-amount tricks, a partial unique index makes
-- double reversal impossible, and a trigger keeps a reversal honest
-- (opposite type, equal amount, same centre). UPDATE and DELETE are
-- revoked at the privilege level, same as every ledger here.
--
-- `category` is free text with suggestions in the UI, not an enum: neither
-- source document names a single category, and unlike ticket priority
-- (C11) nothing routes on it — it only groups report lines. Recorded in
-- C14 alongside this slice's other assumption: income/expense entries do
-- not touch the wallet, which is head-office money, not the cash box.

create table public.expense_entries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id),
  centre_id uuid not null references public.centres (id),
  entry_type text not null check (entry_type in ('income', 'expense')),
  category text not null check (length(btrim(category)) between 2 and 60),
  amount_paise public.money_paise not null check (amount_paise > 0),
  entry_date date not null default current_date,
  note text,
  reverses_entry_id uuid references public.expense_entries (id),
  created_at timestamptz not null default now(),
  created_by uuid not null default auth.uid()
);

create index expense_entries_centre_idx
  on public.expense_entries (centre_id, entry_date desc);
create unique index expense_entries_no_double_reversal_idx
  on public.expense_entries (reverses_entry_id)
  where reverses_entry_id is not null;

create function app.validate_expense_reversal()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_original public.expense_entries%rowtype;
begin
  if new.reverses_entry_id is null then
    return new;
  end if;

  select * into v_original
  from public.expense_entries
  where id = new.reverses_entry_id;

  if v_original.id is null then
    raise exception 'Reversed entry not found' using errcode = 'no_data_found';
  end if;
  if v_original.reverses_entry_id is not null then
    raise exception 'A reversal cannot itself be reversed — record a fresh entry'
      using errcode = 'invalid_parameter_value';
  end if;
  if new.centre_id <> v_original.centre_id
     or new.amount_paise <> v_original.amount_paise
     or new.entry_type = v_original.entry_type then
    raise exception 'A reversal must mirror the original exactly'
      using errcode = 'invalid_parameter_value';
  end if;
  if coalesce(btrim(new.note), '') = '' then
    raise exception 'A reversal needs a reason in the note'
      using errcode = 'invalid_parameter_value';
  end if;

  return new;
end;
$$;

create trigger validate_expense_reversal
  before insert on public.expense_entries
  for each row execute function app.validate_expense_reversal();

create trigger audit_changes
  after insert or update or delete on public.expense_entries
  for each row execute function app.audit_trigger();

alter table public.expense_entries enable row level security;
alter table public.expense_entries force row level security;

insert into public.permissions (code, description) values
  ('expense.read',   'View a centre''s income and expense ledger'),
  ('expense.manage', 'Record income and expense entries, and reversals')
on conflict (code) do nothing;

insert into public.role_permissions (role_id, permission_code)
select r.id, v.code
from (values
  ('centre_owner',   'expense.read'),
  ('centre_owner',   'expense.manage'),
  ('centre_manager', 'expense.read'),
  ('centre_manager', 'expense.manage'),
  ('accountant',     'expense.read'),
  ('accountant',     'expense.manage'),
  ('finance_admin',  'expense.read'),
  ('finance_admin',  'expense.manage'),
  ('ho_operator',    'expense.read')
) as v(role_code, code)
join public.roles r on r.code = v.role_code
on conflict do nothing;

create policy expense_entries_select on public.expense_entries
  for select to authenticated
  using (
    app.is_platform_admin()
    or app.has_permission('expense.read', organization_id)
    or (app.has_permission('expense.read', organization_id, centre_id)
        and app.can_access_centre(centre_id))
  );

-- Plain RLS insert rather than a SECURITY DEFINER function: unlike the
-- wallet there is no cross-row invariant to serialise — the trigger above
-- carries the one rule a row cannot check about itself.
create policy expense_entries_insert on public.expense_entries
  for insert to authenticated
  with check (
    created_by = auth.uid()
    and (
      app.is_platform_admin()
      or app.has_permission('expense.manage', organization_id)
      or (app.has_permission('expense.manage', organization_id, centre_id)
          and app.can_access_centre(centre_id))
    )
  );

revoke update, delete on public.expense_entries from authenticated;
