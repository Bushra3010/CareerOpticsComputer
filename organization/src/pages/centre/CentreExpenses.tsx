import { useCallback, useEffect, useState } from "react";

import { AppLayout } from "@/components/layout/AppLayout";
import {
  DceBadge,
  DceButton,
  DceField,
  DceGrid,
  DceInput,
  DcePanel,
  DceSelect,
  DceTable,
  inr,
  shortDate,
  type DceColumn,
} from "@/components/dce/Dce";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  EXPENSE_MODES,
  createCentreExpense,
  deleteCentreExpense,
  expenseTotal,
  listCentreExpenses,
  useBranchOptions,
  type CentreExpense,
} from "@/lib/supabase/centrePanel";

const today = () => new Date().toISOString().slice(0, 10);
const blank = () => ({ date: today(), amount: "", mode: "Cash", type: "debit" as "debit" | "credit", reference: "", branchId: "" });

/** "Manage Expanse": the centre's own till, money in and out, kept apart from student fees. */
export default function CentreExpenses() {
  const { branchId, organizationId } = useAuth();
  const { toast } = useToast();
  const isAdmin = !branchId;
  const branches = useBranchOptions(organizationId, isAdmin);

  const [rows, setRows] = useState<CentreExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await listCentreExpenses(branchId, { from: from || undefined, to: to || undefined }));
    } catch (error) {
      toast({ title: "Could not load expenses", description: (error as Error).message, variant: "destructive" });
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [branchId, from, to, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const total = expenseTotal(rows);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const amount = Number(form.amount);
    const target = branchId || form.branchId;
    if (!target) return toast({ title: "Choose a branch", variant: "destructive" });
    if (!form.date || !(amount > 0)) return toast({ title: "Enter a date and an amount above zero", variant: "destructive" });
    setSaving(true);
    try {
      await createCentreExpense({ branchId: target, date: form.date, amount, mode: form.mode, type: form.type, reference: form.reference.trim() });
      toast({ title: "Expense added" });
      // An admin entering several bills for one centre keeps that centre picked.
      setForm({ ...blank(), branchId: form.branchId });
      await load();
    } catch (error) {
      toast({ title: "Could not add the expense", description: (error as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row: CentreExpense) => {
    if (!window.confirm(`Delete this ${inr(row.amount)} entry?`)) return;
    try {
      await deleteCentreExpense(row.id);
      setRows((all) => all.filter((r) => r.id !== row.id));
      toast({ title: "Expense deleted" });
    } catch (error) {
      toast({ title: "Could not delete", description: (error as Error).message, variant: "destructive" });
    }
  };

  const columns: DceColumn<CentreExpense>[] = [
    { key: "n", label: "#", render: (_r, i) => i + 1 },
    ...(isAdmin ? [{ key: "branch", label: "Branch", render: (r: CentreExpense) => r.branch?.name || "—" }] : []),
    { key: "amount", label: "Amount", render: (r) => <span className="font-semibold">{inr(r.amount)}</span> },
    { key: "mode", label: "Mode", render: (r) => r.mode },
    {
      key: "type",
      label: "Type",
      render: (r) => <DceBadge status={r.type === "credit" ? "APPROVED" : "REJECTED"} label={r.type === "credit" ? "Credit" : "Debit"} />,
    },
    { key: "remarks", label: "Remarks", render: (r) => r.reference || "—" },
    { key: "created", label: "Created At", render: (r) => shortDate(r.date || r.createdAt) },
    {
      key: "action",
      label: "Action",
      render: (r) => (
        <DceButton tone="red" size="sm" onClick={() => void remove(r)}>
          Delete
        </DceButton>
      ),
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-5">
        <DcePanel
          title="Manage Expanse"
          actions={
            <DceButton tone={total < 0 ? "red" : "green"} aria-label="Expense total">
              Total - {total < 0 ? "-" : ""}
              {inr(Math.abs(total))}
            </DceButton>
          }
        >
          <div className="mb-4 flex flex-wrap items-end gap-3">
            <label className="text-[13px] font-semibold text-slate-700">
              From
              <DceInput type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1 w-40" aria-label="From date" />
            </label>
            <label className="text-[13px] font-semibold text-slate-700">
              To
              <DceInput type="date" value={to} onChange={(e) => setTo(e.target.value)} className="mt-1 w-40" aria-label="To date" />
            </label>
            {(from || to) && (
              <DceButton tone="light" onClick={() => { setFrom(""); setTo(""); }}>
                Clear
              </DceButton>
            )}
          </div>
          <DceTable columns={columns} rows={rows} rowKey={(r) => r.id} loading={loading} empty="No expenses recorded." />
        </DcePanel>

        <DcePanel title="Add Expanse">
          <form onSubmit={submit}>
            <DceGrid>
              {isAdmin && (
                <DceField label="Branch" required>
                  <DceSelect value={form.branchId} onChange={(e) => setForm({ ...form, branchId: e.target.value })} aria-label="Branch">
                    <option value="">Select branch</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </DceSelect>
                </DceField>
              )}
              <DceField label="Date" required>
                <DceInput type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} aria-label="Date" />
              </DceField>
              <DceField label="Amount" required>
                <DceInput type="number" min="1" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="Amount" aria-label="Amount" />
              </DceField>
              <DceField label="Expanse Mode" required>
                <DceSelect value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })} aria-label="Expanse Mode">
                  {EXPENSE_MODES.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </DceSelect>
              </DceField>
              <DceField label="Expanse Type" required>
                <DceSelect value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as "debit" | "credit" })} aria-label="Expanse Type">
                  <option value="debit">Debit</option>
                  <option value="credit">Credit</option>
                </DceSelect>
              </DceField>
              <DceField label="Expanse Reference" span={4}>
                <DceInput value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="What was it for?" aria-label="Expanse Reference" />
              </DceField>
            </DceGrid>
            <div className="mt-5">
              <DceButton type="submit" tone="blue" disabled={saving}>
                {saving ? "Adding…" : "Add Now"}
              </DceButton>
            </div>
          </form>
        </DcePanel>
      </div>
    </AppLayout>
  );
}
