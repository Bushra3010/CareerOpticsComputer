import { createClient } from "@/lib/db/server";
import { formatPaise, paise, type Paise } from "@/lib/money";

export interface ExpenseEntryRow {
  id: string;
  entryType: "income" | "expense";
  category: string;
  amountLabel: string;
  entryDate: string;
  note: string | null;
  /** Set when this row corrects an earlier one. */
  reversesEntryId: string | null;
  /** Set when a later row corrects this one — such a row cannot be reversed again. */
  reversedById: string | null;
}

export interface ExpenseLedger {
  entries: ExpenseEntryRow[];
  incomePaise: Paise;
  expensePaise: Paise;
  netPaise: Paise;
}

/**
 * One centre's cash-box ledger, newest first, with the month's totals
 * computed from the rows themselves — a reversal is just a row of the
 * opposite type, so the sums need no special cases.
 */
export async function getExpenseLedger(
  centreId: string,
): Promise<ExpenseLedger> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("expense_entries")
    .select(
      "id, entry_type, category, amount_paise, entry_date, note, reverses_entry_id",
    )
    .eq("centre_id", centreId)
    .order("entry_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(300);

  const rows = data ?? [];
  const reversedBy = new Map<string, string>();
  for (const r of rows) {
    if (r.reverses_entry_id) reversedBy.set(r.reverses_entry_id, r.id);
  }

  let income = 0;
  let expense = 0;
  for (const r of rows) {
    if (r.entry_type === "income") income += r.amount_paise;
    else expense += r.amount_paise;
  }

  return {
    entries: rows.map((r) => ({
      id: r.id,
      entryType: r.entry_type,
      category: r.category,
      amountLabel: formatPaise(paise(r.amount_paise)),
      entryDate: r.entry_date,
      note: r.note,
      reversesEntryId: r.reverses_entry_id,
      reversedById: reversedBy.get(r.id) ?? null,
    })),
    incomePaise: paise(income),
    expensePaise: paise(expense),
    netPaise: paise(income - expense),
  };
}
