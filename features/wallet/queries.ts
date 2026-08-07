import { createClient } from "@/lib/db/server";
import { formatPaise } from "@/lib/money";
import type { Paise } from "@/lib/money";

export interface WalletView {
  balancePaise: number;
  balanceLabel: string;
  entries: {
    seq: number;
    typeLabel: string;
    reason: string;
    reference: string | null;
    amountLabel: string;
    isCredit: boolean;
    on: string;
  }[];
}

const TYPE_LABELS: Record<string, string> = {
  recharge: "Recharge",
  debit: "Debit",
  reversal: "Reversal",
};

/**
 * Scoped by RLS from the session — wallet.read at the caller's centre. The
 * balance is summed here from the same rows the list shows, so the figure and
 * the ledger beneath it cannot disagree.
 */
export async function getWallet(centreId: string): Promise<WalletView> {
  const supabase = await createClient();

  const { data: account } = await supabase
    .from("wallet_accounts")
    .select("id")
    .eq("centre_id", centreId)
    .maybeSingle();

  if (!account) {
    return {
      balancePaise: 0,
      balanceLabel: formatPaise(0 as Paise),
      entries: [],
    };
  }

  const { data: entries } = await supabase
    .from("wallet_entries")
    .select(
      "entry_seq, amount_paise, entry_type, reason, reference, created_at",
    )
    .eq("account_id", account.id)
    .order("entry_seq", { ascending: false })
    .limit(100);

  const rows = entries ?? [];
  const balance = rows.reduce((n, e) => n + e.amount_paise, 0);

  return {
    balancePaise: balance,
    balanceLabel: formatPaise(balance as Paise),
    entries: rows.map((e) => ({
      seq: e.entry_seq,
      typeLabel: TYPE_LABELS[e.entry_type] ?? e.entry_type,
      reason: e.reason,
      reference: e.reference,
      amountLabel: formatPaise(Math.abs(e.amount_paise) as Paise),
      isCredit: e.amount_paise > 0,
      on: e.created_at.slice(0, 10),
    })),
  };
}

export interface CentreWalletSummary {
  centreId: string;
  centreName: string;
  centreCode: string;
  balancePaise: number;
  balanceLabel: string;
}

/**
 * Every active centre with its wallet balance, for the head-office recharge
 * screen. A centre with no wallet_accounts row yet — nobody has credited or
 * debited it — shows a zero balance rather than being omitted, so a new
 * centre is reachable to recharge for the first time.
 */
export async function listCentreWalletSummaries(): Promise<
  CentreWalletSummary[]
> {
  const supabase = await createClient();

  const [{ data: centres }, { data: accounts }] = await Promise.all([
    supabase
      .from("centres")
      .select("id, name, code")
      .eq("status", "active")
      .order("name"),
    supabase.from("wallet_accounts").select("id, centre_id"),
  ]);

  const accountByCentre = new Map(
    (accounts ?? []).map((a) => [a.centre_id, a.id]),
  );
  const accountIds = [...accountByCentre.values()];

  const balances = new Map<string, number>();
  if (accountIds.length) {
    const { data: entries } = await supabase
      .from("wallet_entries")
      .select("account_id, amount_paise")
      .in("account_id", accountIds);
    for (const e of entries ?? []) {
      balances.set(
        e.account_id,
        (balances.get(e.account_id) ?? 0) + e.amount_paise,
      );
    }
  }

  return (centres ?? []).map((c) => {
    const accountId = accountByCentre.get(c.id);
    const balance = accountId ? (balances.get(accountId) ?? 0) : 0;
    return {
      centreId: c.id,
      centreName: c.name,
      centreCode: c.code,
      balancePaise: balance,
      balanceLabel: formatPaise(balance as Paise),
    };
  });
}
