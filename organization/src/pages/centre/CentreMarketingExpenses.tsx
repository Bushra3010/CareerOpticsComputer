import { useCallback, useEffect, useRef, useState } from "react";

import { AppLayout } from "@/components/layout/AppLayout";
import {
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
  createMarketingExpense,
  deleteMarketingExpense,
  listMarketingExpenses,
  resizeImage,
  useBranchOptions,
  type MarketingExpense,
} from "@/lib/supabase/centrePanel";

/** Money spent on promotion -- pamphlets, banners, ads -- with a photo of the bill or the banner as proof. */
export default function CentreMarketingExpenses() {
  const { branchId, organizationId } = useAuth();
  const { toast } = useToast();
  const isAdmin = !branchId;
  const branches = useBranchOptions(organizationId, isAdmin);

  const [rows, setRows] = useState<MarketingExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [remarks, setRemarks] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [target, setTarget] = useState("");
  const [saving, setSaving] = useState(false);
  const [enlarged, setEnlarged] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await listMarketingExpenses(branchId));
    } catch (error) {
      toast({ title: "Could not load marketing expenses", description: (error as Error).message, variant: "destructive" });
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [branchId, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const total = rows.reduce((sum, r) => sum + r.amount, 0);

  const pick = async (file: File | undefined) => {
    if (!file) return setPhoto(null);
    try {
      setPhoto(await resizeImage(file));
    } catch (error) {
      toast({ title: "Could not use that photo", description: (error as Error).message, variant: "destructive" });
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const value = Number(amount);
    const branch = branchId || target;
    if (!branch) return toast({ title: "Choose a branch", variant: "destructive" });
    if (!(value > 0)) return toast({ title: "Enter an amount above zero", variant: "destructive" });
    setSaving(true);
    try {
      await createMarketingExpense({ branchId: branch, amount: value, remarks: remarks.trim(), photo });
      toast({ title: "Marketing expense added" });
      setAmount("");
      setRemarks("");
      setPhoto(null);
      if (fileRef.current) fileRef.current.value = "";
      await load();
    } catch (error) {
      toast({ title: "Could not add the expense", description: (error as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row: MarketingExpense) => {
    if (!window.confirm(`Delete this ${inr(row.amount)} entry?`)) return;
    try {
      await deleteMarketingExpense(row.id);
      setRows((all) => all.filter((r) => r.id !== row.id));
    } catch (error) {
      toast({ title: "Could not delete", description: (error as Error).message, variant: "destructive" });
    }
  };

  const columns: DceColumn<MarketingExpense>[] = [
    { key: "n", label: "#", render: (_r, i) => i + 1 },
    ...(isAdmin ? [{ key: "branch", label: "Branch", render: (r: MarketingExpense) => r.branch?.name || "—" }] : []),
    { key: "amount", label: "Amount", render: (r) => <span className="font-semibold">{inr(r.amount)}</span> },
    { key: "remarks", label: "Remarks", render: (r) => r.remarks || "—" },
    {
      key: "photo",
      label: "Photo",
      render: (r) =>
        r.photo ? (
          <button type="button" onClick={() => setEnlarged(r.photo)} aria-label="Enlarge photo">
            <img src={r.photo} alt="Marketing proof" className="h-12 w-16 rounded border object-cover" />
          </button>
        ) : (
          "—"
        ),
    },
    { key: "created", label: "Created At", render: (r) => shortDate(r.createdAt) },
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
        <DcePanel title="Marketing Expanse" actions={<DceButton tone="green">Total - {inr(total)}</DceButton>}>
          <DceTable columns={columns} rows={rows} rowKey={(r) => r.id} loading={loading} empty="No marketing expenses recorded." />
        </DcePanel>

        <DcePanel title="Add Marketing Expanse">
          <form onSubmit={submit}>
            <DceGrid>
              {isAdmin && (
                <DceField label="Branch" required>
                  <DceSelect value={target} onChange={(e) => setTarget(e.target.value)} aria-label="Branch">
                    <option value="">Select branch</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </DceSelect>
                </DceField>
              )}
              <DceField label="Amount" required>
                <DceInput type="number" min="1" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" aria-label="Amount" />
              </DceField>
              <DceField label="Remarks" span={2}>
                <DceInput value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Pamphlets, banner, newspaper ad…" aria-label="Remarks" />
              </DceField>
              <DceField label="Upload Photo">
                <DceInput ref={fileRef} type="file" accept="image/png,image/jpeg" onChange={(e) => void pick(e.target.files?.[0])} aria-label="Upload Photo" />
              </DceField>
            </DceGrid>
            {photo && <img src={photo} alt="Selected" className="mt-3 h-24 rounded border object-cover" />}
            <div className="mt-5">
              <DceButton type="submit" disabled={saving}>
                {saving ? "Adding…" : "Add Now"}
              </DceButton>
            </div>
          </form>
        </DcePanel>
      </div>

      {enlarged && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onClick={() => setEnlarged(null)} role="dialog" aria-label="Photo">
          <img src={enlarged} alt="Marketing proof, enlarged" className="max-h-[90vh] max-w-full rounded bg-white shadow-xl" />
        </div>
      )}
    </AppLayout>
  );
}
