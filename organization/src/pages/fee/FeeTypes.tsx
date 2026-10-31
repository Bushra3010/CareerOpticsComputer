import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { suggestCode } from "@/data/fee-catalog";
import { Plus, IndianRupee, Tags, Edit } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { EditableSelect } from "@/components/ui/EditableSelect";
import {
  canManageFeeStructures,
  copyName,
  createFeeType,
  deleteFeeType,
  feeTypeProblem,
  loadFeeCatalog,
  parseAmount,
  updateFeeType,
  type FeeGroup,
  type FeeType,
} from "@/lib/supabase/feeStructures";

const COURSE_OPTIONS = ["All Courses", "Computer Science", "Engineering", "Commerce", "Science"] as const;

const columns: Column<FeeType>[] = [
  {
    key: "name",
    header: "Fee Type",
    sortable: true,
    cell: (fee) => (
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <IndianRupee className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="font-medium">{fee.name}</p>
          <p className="text-xs text-muted-foreground">{fee.code}</p>
        </div>
      </div>
    ),
  },
  {
    key: "category",
    header: "Category",
    cell: (fee) => <Badge variant="outline">{fee.category}</Badge>,
  },
  {
    key: "defaultAmount",
    header: "Default Amount",
    sortable: true,
    cell: (fee) => <span className="font-medium">₹{fee.defaultAmount.toLocaleString()}</span>,
  },
  {
    key: "frequency",
    header: "Frequency",
    cell: (fee) => <Badge variant="secondary">{fee.frequency}</Badge>,
  },
  {
    key: "applicableTo",
    header: "Applicable To",
    cell: (fee) => (
      <div className="flex flex-wrap gap-1 max-w-[150px]">
        {fee.applicableTo[0] === "All Courses" ? (
          <Badge variant="default">All Courses</Badge>
        ) : (
          <>
            <Badge variant="secondary" className="text-xs">{fee.applicableTo[0]}</Badge>
            {fee.applicableTo.length > 1 && (
              <Badge variant="secondary" className="text-xs">+{fee.applicableTo.length - 1}</Badge>
            )}
          </>
        )}
      </div>
    ),
  },
  {
    key: "status",
    header: "Status",
    cell: (fee) => <StatusBadge status={fee.status} />,
  },
];

const BLANK = {
  name: "",
  code: "",
  category: "Academic" as string,
  defaultAmount: "" as string | number,
  frequency: "Yearly",
  applicableTo: "All Courses",
  description: "",
  active: true,
};

/** Whether a group is built from this fee type. */
const groupUses = (group: FeeGroup, fee: FeeType) => group.items.some((item) => item.feeTypeId === fee.id);

export default function FeeTypes() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const organizationId = user?.organizationId ?? null;
  const canManage = canManageFeeStructures(user?.role);
  const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);
  const [feeGroups, setFeeGroups] = useState<FeeGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...BLANK });
  const [usage, setUsage] = useState<FeeType | null>(null);
  const [pendingDelete, setPendingDelete] = useState<FeeType | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadFeeCatalog(organizationId, { canImport: canManage })
      .then(({ types, groups, imported, importError }) => {
        if (cancelled) return;
        setFeeTypes(types);
        setFeeGroups(groups);
        setLoadError(null);
        if (importError) {
          toast({
            title: "Could not move this browser's fee catalogue to the database",
            description: `${importError} It is still saved in this browser; reopen the page to retry.`,
            variant: "destructive",
          });
        }
        if (imported) {
          toast({
            title: "Fee catalogue moved to the database",
            description: `${imported.types} fee type(s) and ${imported.groups} group(s) from this browser are now shared by every computer.`,
          });
        }
      })
      .catch((error: Error) => {
        if (!cancelled) setLoadError(error.message || "Could not load fee types.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `toast` is stable; reload only when the login changes.
  }, [organizationId, canManage]);

  const failed = (title: string, error: unknown) =>
    toast({ title, description: (error as Error)?.message || "Please try again.", variant: "destructive" });

  const set = <K extends keyof typeof BLANK>(key: K, value: (typeof BLANK)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...BLANK, defaultAmount: "" });
    setIsDialogOpen(true);
  };

  const openEdit = (fee: FeeType) => {
    setEditingId(fee.id);
    setForm({
      name: fee.name,
      code: fee.code,
      category: fee.category,
      defaultAmount: String(fee.defaultAmount),
      frequency: fee.frequency,
      applicableTo: fee.applicableTo[0] ?? "All Courses",
      description: fee.description,
      active: fee.status === "active",
    });
    setIsDialogOpen(true);
  };

  const save = async () => {
    const name = form.name.trim();
    const code = (form.code.trim() || suggestCode(name, feeTypes)).toUpperCase();
    const problem = feeTypeProblem({ name, code, defaultAmount: form.defaultAmount }, feeTypes, editingId);
    if (problem) {
      toast({ title: problem, variant: "destructive" });
      return;
    }

    const input = {
      name,
      code,
      category: form.category,
      defaultAmount: parseAmount(form.defaultAmount) as number,
      frequency: form.frequency,
      applicableTo: [form.applicableTo],
      description: form.description.trim(),
      status: form.active ? ("active" as const) : ("inactive" as const),
    };

    setSaving(true);
    try {
      if (editingId) {
        await updateFeeType(editingId, input);
        setFeeTypes((prev) => prev.map((f) => (f.id === editingId ? { ...input, id: editingId } : f)));
        toast({ title: "Fee type updated", description: `${name} was saved.` });
      } else {
        const created = await createFeeType(organizationId, input);
        setFeeTypes((prev) => [created, ...prev]);
        toast({ title: "Fee type added", description: `${name} (${code}) is now available.` });
      }
      setIsDialogOpen(false);
      setEditingId(null);
      setForm({ ...BLANK, defaultAmount: "" });
    } catch (error) {
      failed("Could not save the fee type", error);
    } finally {
      setSaving(false);
    }
  };

  const duplicate = async (fee: FeeType) => {
    const name = copyName(fee.name, feeTypes.map((f) => f.name));
    const { id: _id, ...rest } = fee;
    try {
      const copy = await createFeeType(organizationId, { ...rest, name, code: suggestCode(fee.name, feeTypes), status: "inactive" });
      setFeeTypes((prev) => [copy, ...prev]);
      toast({ title: "Fee type duplicated", description: `${name} was created as inactive.` });
    } catch (error) {
      failed("Could not duplicate the fee type", error);
    }
  };

  const toggleStatus = async (fee: FeeType) => {
    const status = fee.status === "active" ? ("inactive" as const) : ("active" as const);
    try {
      await updateFeeType(fee.id, { status });
      setFeeTypes((prev) => prev.map((f) => (f.id === fee.id ? { ...f, status } : f)));
      toast({ title: status === "inactive" ? "Fee type deactivated" : "Fee type activated", description: fee.name });
    } catch (error) {
      failed("Could not change the fee type", error);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const target = pendingDelete;
    const usedBy = feeGroups.filter((g) => groupUses(g, target));
    try {
      await deleteFeeType(target.id);
      setFeeTypes((prev) => prev.filter((f) => f.id !== target.id));
      toast({
        title: "Fee type deleted",
        description: usedBy.length
          ? `${target.name} removed — it was still referenced by ${usedBy.length} fee group(s).`
          : `${target.name} removed.`,
      });
    } catch (error) {
      failed("Could not delete the fee type", error);
    } finally {
      setPendingDelete(null);
    }
  };

  const handleActions = (fee: FeeType) =>
    canManage
      ? [
          { label: "Edit Fee Type", onClick: () => openEdit(fee) },
          { label: "View Usage", onClick: () => setUsage(fee) },
          { label: "Duplicate", onClick: () => duplicate(fee) },
          { label: fee.status === "active" ? "Deactivate" : "Activate", onClick: () => toggleStatus(fee) },
          { label: "Delete", onClick: () => setPendingDelete(fee), destructive: true },
        ]
      : [{ label: "View Usage", onClick: () => setUsage(fee) }];

  const usageGroups = usage ? feeGroups.filter((g) => groupUses(g, usage)) : [];

  return (
    <AppLayout>
      <PageHeader
        title="Fee Types"
        description="Manage different types of fees"
        breadcrumbs={[
          { label: "Fee Management", href: "/fee/collection" },
          { label: "Fee Types" },
        ]}
        actions={
          canManage ? (
            <Button className="gap-2" onClick={openCreate} disabled={loading || !!loadError}>
              <Plus className="h-4 w-4" />
              Add Fee Type
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <div className="p-4 bg-card border rounded-lg">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Tags className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{feeTypes.length}</p>
              <p className="text-sm text-muted-foreground">Total Fee Types</p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-card border rounded-lg">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
              <IndianRupee className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{feeTypes.filter(f => f.status === "active").length}</p>
              <p className="text-sm text-muted-foreground">Active Types</p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-card border rounded-lg">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Edit className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{feeTypes.filter(f => f.category === "Academic").length}</p>
              <p className="text-sm text-muted-foreground">Academic Fees</p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-card border rounded-lg">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
              <Tags className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{feeTypes.filter(f => f.category === "Optional").length}</p>
              <p className="text-sm text-muted-foreground">Optional Fees</p>
            </div>
          </div>
        </div>
      </div>

      {loadError && (
        <p role="alert" className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {loadError}
        </p>
      )}
      {!canManage && !loadError && (
        <p className="mb-4 text-sm text-muted-foreground">Only an organisation admin can change fee types.</p>
      )}

      <DataTable
        data={feeTypes}
        columns={columns}
        searchPlaceholder="Search fee types..."
        actions={handleActions}
        emptyMessage={loading ? "Loading fee types…" : "No fee types yet"}
      />

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingId(null);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Fee Type" : "Add New Fee Type"}</DialogTitle>
            <DialogDescription>
              Fee types are the building blocks of the packages on the Fee Groups page.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fee-name">Fee Name *</Label>
                <Input
                  id="fee-name"
                  placeholder="e.g., Tuition Fee"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fee-code">Fee Code</Label>
                <Input
                  id="fee-code"
                  placeholder={form.name ? suggestCode(form.name, feeTypes) : "e.g., TF001"}
                  value={form.code}
                  onChange={(e) => set("code", e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Category</Label>
                <EditableSelect
                  optionKey="feeCategory"
                  value={form.category}
                  onChange={(v) => set("category", v)}
                  placeholder="Select category"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fee-amount">Default Amount (₹) *</Label>
                <Input
                  id="fee-amount"
                  type="number"
                  min={0.01}
                  step="0.01"
                  placeholder="e.g., 5000"
                  value={String(form.defaultAmount)}
                  onChange={(e) => set("defaultAmount", e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Frequency</Label>
                <EditableSelect
                  optionKey="feeFrequency"
                  value={form.frequency}
                  onChange={(v) => set("frequency", v)}
                  placeholder="Select frequency"
                />
              </div>
              <div className="space-y-2">
                <Label>Applicable To</Label>
                <Select value={form.applicableTo} onValueChange={(v) => set("applicableTo", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select courses" />
                  </SelectTrigger>
                  <SelectContent>
                    {COURSE_OPTIONS.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fee-description">Description</Label>
              <Textarea
                id="fee-description"
                placeholder="Brief description of the fee type..."
                rows={2}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch id="active" checked={form.active} onCheckedChange={(v) => set("active", v)} />
              <Label htmlFor="active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{editingId ? "Save changes" : "Add Fee Type"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!usage} onOpenChange={(open) => !open && setUsage(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{usage?.name} usage</DialogTitle>
            <DialogDescription>
              {usageGroups.length
                ? `Included in ${usageGroups.length} fee group(s).`
                : "This fee type is not part of any fee group yet."}
            </DialogDescription>
          </DialogHeader>
          {usageGroups.length > 0 && (
            <ul className="space-y-2 text-sm">
              {usageGroups.map((group) => (
                <li key={group.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{group.name}</p>
                    <p className="text-xs text-muted-foreground">{group.courses.join(", ")}</p>
                  </div>
                  <Badge variant="secondary">₹{group.totalAmount.toLocaleString()}</Badge>
                </li>
              ))}
            </ul>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setUsage(null)}>Close</Button>
            <Button onClick={() => navigate("/fee/groups")}>Open fee groups</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {pendingDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete && feeGroups.some((g) => groupUses(g, pendingDelete))
                ? "This fee type is still referenced by one or more fee groups. Those groups keep their totals but will no longer be able to re-add it."
                : "This removes the fee type from the catalogue."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
