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
