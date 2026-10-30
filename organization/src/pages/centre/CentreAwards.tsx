import { useCallback, useEffect, useRef, useState } from "react";

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
  DceTextarea,
  shortDate,
  type DceColumn,
} from "@/components/dce/Dce";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  createCentreAward,
  deleteCentreAward,
  listCentreAwards,
  resizeImage,
  updateCentreAward,
  useBranchOptions,
  type CentreAward,
} from "@/lib/supabase/centrePanel";

/** Awards the head office has given a centre. Only the head office adds them (RLS enforces it). */
export default function CentreAwards() {
  const { branchId, organizationId } = useAuth();
  const { toast } = useToast();
  const isAdmin = !branchId;
  const branches = useBranchOptions(organizationId, isAdmin);

  const [rows, setRows] = useState<CentreAward[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState<CentreAward | null>(null);
  const [form, setForm] = useState({ branchId: "", name: "", description: "", awardedAt: new Date().toISOString().slice(0, 10) });
  const [image, setImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await listCentreAwards(branchId));
    } catch (error) {
      toast({ title: "Could not load awards", description: (error as Error).message, variant: "destructive" });
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [branchId, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.branchId || !form.name.trim()) return toast({ title: "Choose a branch and name the award", variant: "destructive" });
    setSaving(true);
    try {
      await createCentreAward({ branchId: form.branchId, name: form.name.trim(), description: form.description.trim(), image, awardedAt: form.awardedAt });
      toast({ title: "Award added" });
      setForm({ ...form, name: "", description: "" });
      setImage(null);
      if (fileRef.current) fileRef.current.value = "";
      await load();
    } catch (error) {
      toast({ title: "Could not add the award", description: (error as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (row: CentreAward) => {
    const status = row.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await updateCentreAward(row.id, { status });
      setRows((all) => all.map((r) => (r.id === row.id ? { ...r, status } : r)));
    } catch (error) {
      toast({ title: "Could not update", description: (error as Error).message, variant: "destructive" });
    }
  };

  const remove = async (row: CentreAward) => {
    if (!window.confirm(`Delete the award "${row.name}"?`)) return;
    try {
      await deleteCentreAward(row.id);
      setRows((all) => all.filter((r) => r.id !== row.id));
    } catch (error) {
      toast({ title: "Could not delete", description: (error as Error).message, variant: "destructive" });
    }
  };

  const columns: DceColumn<CentreAward>[] = [
    { key: "n", label: "#", render: (_r, i) => i + 1 },
    ...(isAdmin ? [{ key: "branch", label: "Branch", render: (r: CentreAward) => r.branch?.name || "—" }] : []),
    {
      key: "name",
      label: "NAME",
      render: (r) => (
        <div>
          <p className="font-semibold">{r.name}</p>
          <p className="text-[12px] text-slate-500">{shortDate(r.awardedAt)}</p>
        </div>
      ),
    },
    { key: "status", label: "Status", render: (r) => <DceBadge status={r.status} /> },
    {
      key: "action",
      label: "Action",
      render: (r) => (
        <div className="flex flex-wrap gap-1.5">
          <DceButton size="sm" onClick={() => setViewing(r)}>View</DceButton>
          {isAdmin && (
            <>
              <DceButton size="sm" tone="slate" onClick={() => void toggle(r)}>
                {r.status === "ACTIVE" ? "Deactivate" : "Activate"}
              </DceButton>
              <DceButton size="sm" tone="red" onClick={() => void remove(r)}>Delete</DceButton>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-5">
        <DcePanel title="Awards">
          <DceTable columns={columns} rows={rows} rowKey={(r) => r.id} loading={loading} empty="No awards yet." />
        </DcePanel>

        {isAdmin && (
          <DcePanel title="Add Award">
            <form onSubmit={submit}>
              <DceGrid>
                <DceField label="Branch" required>
                  <DceSelect value={form.branchId} onChange={(e) => setForm({ ...form, branchId: e.target.value })} aria-label="Branch">
                    <option value="">Select branch</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </DceSelect>
                </DceField>
                <DceField label="Award Name" required>
                  <DceInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Best Centre 2026" aria-label="Award Name" />
                </DceField>
                <DceField label="Awarded On">
                  <DceInput type="date" value={form.awardedAt} onChange={(e) => setForm({ ...form, awardedAt: e.target.value })} aria-label="Awarded On" />
                </DceField>
                <DceField label="Image">
                  <DceInput
                    ref={fileRef}
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      try {
                        setImage(file ? await resizeImage(file) : null);
                      } catch (error) {
                        toast({ title: "Could not use that image", description: (error as Error).message, variant: "destructive" });
                      }
                    }}
                    aria-label="Image"
                  />
                </DceField>
                <DceField label="Description" span={4}>
                  <DceTextarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} aria-label="Description" />
                </DceField>
              </DceGrid>
              <div className="mt-5">
                <DceButton type="submit" disabled={saving}>{saving ? "Adding…" : "Add Now"}</DceButton>
              </div>
            </form>
          </DcePanel>
        )}
      </div>

      {viewing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={() => setViewing(null)} role="dialog" aria-label={viewing.name}>
          <div className="max-h-[90vh] w-full max-w-lg overflow-auto rounded bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-800">{viewing.name}</h3>
            <p className="mb-3 text-[12px] text-slate-500">
              {viewing.branch?.name ? `${viewing.branch.name} · ` : ""}
              {shortDate(viewing.awardedAt)}
            </p>
            {viewing.image && <img src={viewing.image} alt={viewing.name} className="mb-3 w-full rounded border" />}
            <p className="whitespace-pre-wrap text-[13px] text-slate-700">{viewing.description || "No description."}</p>
            <div className="mt-4 text-right">
              <DceButton tone="light" onClick={() => setViewing(null)}>Close</DceButton>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
