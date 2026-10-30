import { useCallback, useEffect, useMemo, useState } from "react";

import { AppLayout } from "@/components/layout/AppLayout";
import {
  DceBadge,
  DceButton,
  DceField,
  DceInput,
  DcePanel,
  DceSelect,
  DceTable,
  DceTextarea,
  inr,
  shortDate,
  type DceColumn,
} from "@/components/dce/Dce";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  createCertificateOrder,
  getStudentsByIds,
  listCertificateOrders,
  listOrderableStudents,
  updateCertificateOrder,
  useBranchOptions,
  type CertificateOrder,
  type OrderStatus,
  type OrderableStudent,
} from "@/lib/supabase/centrePanel";

/** The students on one order, fetched when the row is opened. */
function OrderStudents({ ids }: { ids: string[] }) {
  const [list, setList] = useState<Array<{ id: string; name: string; enrollmentNo: string | null }> | null>(null);
  useEffect(() => {
    let live = true;
    getStudentsByIds(ids)
      .then((r) => live && setList(r))
      .catch(() => live && setList([]));
    return () => {
      live = false;
    };
  }, [ids]);
  if (!list) return <p className="mt-2 text-[12px] text-slate-500">Loading students…</p>;
  if (!list.length) return <p className="mt-2 text-[12px] text-slate-500">No students found.</p>;
  return (
    <ol className="mt-2 list-decimal space-y-0.5 pl-5 text-[12px] text-slate-600">
      {list.map((s) => (
        <li key={s.id}>
          {s.name}
          {s.enrollmentNo ? <span className="text-slate-400"> · {s.enrollmentNo}</span> : null}
        </li>
      ))}
    </ol>
  );
}

/** The head office's controls on an order: price it, then approve, dispatch or reject it. */
function OrderReview({ order, onSaved }: { order: CertificateOrder; onSaved: (o: CertificateOrder) => void }) {
  const { toast } = useToast();
  const [amount, setAmount] = useState(order.amount ? String(order.amount) : "");
  const [busy, setBusy] = useState(false);
  const act = async (status: OrderStatus) => {
    setBusy(true);
    try {
      const saved = await updateCertificateOrder(order.id, { status, amount: Number(amount) || 0 });
      onSaved({ ...order, ...saved, amount: Number(saved?.amount ?? amount) || 0 });
      toast({ title: `Order ${order.orderNo} ${status.toLowerCase()}` });
    } catch (error) {
      toast({ title: "Could not update the order", description: (error as Error).message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <DceInput type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" className="w-24 py-1" aria-label={`Amount for ${order.orderNo}`} />
      <DceButton size="sm" tone="green" disabled={busy} onClick={() => void act("APPROVED")}>Approve</DceButton>
      <DceButton size="sm" tone="teal" disabled={busy} onClick={() => void act("DISPATCHED")}>Dispatch</DceButton>
      <DceButton size="sm" tone="red" disabled={busy} onClick={() => void act("REJECTED")}>Reject</DceButton>
    </div>
  );
}

/** Certificate orders: a centre asks the head office to print certificates for a batch of students. */
export default function CentreOrders() {
  const { branchId, organizationId } = useAuth();
  const { toast } = useToast();
  const isAdmin = !branchId;
  const branches = useBranchOptions(organizationId, isAdmin);

  const [orders, setOrders] = useState<CertificateOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const [placing, setPlacing] = useState(false);
  const [orderBranch, setOrderBranch] = useState("");
  const [students, setStudents] = useState<OrderableStudent[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setOrders(await listCertificateOrders(branchId));
    } catch (error) {
      toast({ title: "Could not load orders", description: (error as Error).message, variant: "destructive" });
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [branchId, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const target = branchId || orderBranch;
  useEffect(() => {
    if (!placing || !target) {
      setStudents([]);
      return;
    }
    let live = true;
    setStudentsLoading(true);
    // An admin reads every branch's orders already; the candidates are filtered against the target's.
    listOrderableStudents(target, orders.filter((o) => o.branchId === target))
      .then((r) => live && setStudents(r))
      .catch((error) => {
        if (!live) return;
        setStudents([]);
        toast({ title: "Could not load students", description: (error as Error).message, variant: "destructive" });
      })
      .finally(() => live && setStudentsLoading(false));
    return () => {
      live = false;
    };
  }, [placing, target, orders, toast]);

  const needle = search.trim().toLowerCase();
  const visible = useMemo(
    () => (needle ? students.filter((s) => s.name.toLowerCase().includes(needle) || (s.enrollmentNo || "").toLowerCase().includes(needle)) : students),
    [students, needle],
  );

  const togglePick = (id: string) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const allVisiblePicked = visible.length > 0 && visible.every((s) => picked.has(s.id));
  const toggleAll = () =>
    setPicked((prev) => {
      const next = new Set(prev);
      for (const s of visible) {
        if (allVisiblePicked) next.delete(s.id);
        else next.add(s.id);
      }
      return next;
    });

  const place = async () => {
    if (!target) return toast({ title: "Choose a branch", variant: "destructive" });
    if (!picked.size) return toast({ title: "Select at least one student", variant: "destructive" });
    setSaving(true);
    try {
      const created = await createCertificateOrder({ branchId: target, studentIds: [...picked], note: note.trim() });
      toast({ title: "Order placed", description: created?.orderNo ? `Order ${created.orderNo} is pending approval.` : undefined });
      setPicked(new Set());
      setNote("");
      setPlacing(false);
      await load();
    } catch (error) {
      toast({ title: "Could not place the order", description: (error as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const columns: DceColumn<CertificateOrder>[] = [
    { key: "n", label: "S/N", render: (_r, i) => i + 1 },
    { key: "order", label: "Order ID", render: (r) => <span className="font-mono font-semibold">{r.orderNo}</span> },
    { key: "branch", label: "Franchise", render: (r) => r.branch?.name || "—" },
    {
      key: "students",
      label: "No. Of Students",
      render: (r) => (
        <div>
          {r.studentIds.length}
          {expanded === r.id && <OrderStudents ids={r.studentIds} />}
        </div>
      ),
    },
    { key: "amount", label: "Amount", render: (r) => inr(r.amount) },
    { key: "date", label: "Order Date", render: (r) => shortDate(r.createdAt) },
    { key: "status", label: "Status", render: (r) => <DceBadge status={r.status} /> },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <div className="space-y-1.5">
          <DceButton size="sm" onClick={() => setExpanded(expanded === r.id ? null : r.id)}>
            {expanded === r.id ? "Hide Students" : "View Students"}
          </DceButton>
          {isAdmin && <OrderReview order={r} onSaved={(o) => setOrders((all) => all.map((x) => (x.id === o.id ? { ...x, ...o } : x)))} />}
          {r.note && <p className="max-w-[220px] text-[11.5px] text-slate-500">Note: {r.note}</p>}
        </div>
      ),
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-5">
        <DcePanel
          title="Certificate Orders"
          actions={
            <DceButton tone="red" onClick={() => setPlacing((v) => !v)}>
              {placing ? "Close" : "New Order"}
            </DceButton>
          }
        >
          <DceTable columns={columns} rows={orders} rowKey={(r) => r.id} loading={loading} empty="No certificate orders yet." />
        </DcePanel>

        {placing && (
          <DcePanel title="Select Students" actions={<span className="text-[13px]">{picked.size} selected</span>}>
            <div className="mb-4 flex flex-wrap items-end gap-3">
              {isAdmin && (
                <div className="w-64">
                  <DceField label="Branch" required>
                    <DceSelect
                      value={orderBranch}
                      onChange={(e) => {
                        setOrderBranch(e.target.value);
                        setPicked(new Set());
                      }}
                      aria-label="Branch"
                    >
                      <option value="">Select branch</option>
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </DceSelect>
                  </DceField>
                </div>
              )}
              <div className="w-72">
                <DceInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or enrollment no." aria-label="Search students" />
              </div>
            </div>

            {!target ? (
              <p className="text-[13px] text-slate-500">Choose a branch to list its students.</p>
            ) : studentsLoading ? (
              <p className="text-[13px] text-slate-500">Loading students…</p>
            ) : visible.length === 0 ? (
              <p className="text-[13px] text-slate-500">
                No admitted, active students without an order{needle ? " match the search" : ""}.
              </p>
            ) : (
              <div className="max-h-[420px] overflow-auto rounded border border-slate-200">
                <label className="flex cursor-pointer items-center gap-2 border-b bg-slate-50 px-3 py-2 text-[13px] font-semibold">
                  <input type="checkbox" checked={allVisiblePicked} onChange={toggleAll} aria-label="Select all" />
                  Select all ({visible.length})
                </label>
                {visible.map((s) => (
                  <label key={s.id} className="flex cursor-pointer items-center gap-2 border-b border-slate-100 px-3 py-2 text-[13px] hover:bg-slate-50">
                    <input type="checkbox" checked={picked.has(s.id)} onChange={() => togglePick(s.id)} aria-label={s.name} />
                    <span className="font-medium text-slate-800">{s.name}</span>
                    {s.enrollmentNo && <span className="text-slate-500">· {s.enrollmentNo}</span>}
                    {s.passed && <DceBadge status="APPROVED" label="Passed" />}
                  </label>
                ))}
              </div>
            )}

            <div className="mt-4 max-w-xl">
              <DceField label="Note (optional)">
                <DceTextarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Anything the head office should know" aria-label="Note" />
              </DceField>
            </div>
            <div className="mt-4">
              <DceButton tone="blue" disabled={saving || !picked.size} onClick={() => void place()}>
                {saving ? "Placing…" : `Place Order${picked.size ? ` (${picked.size})` : ""}`}
              </DceButton>
            </div>
          </DcePanel>
        )}
      </div>
    </AppLayout>
  );
}
