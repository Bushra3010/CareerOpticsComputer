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
import { FEE_GROUPS_KEY, FEE_TYPES_KEY, FeeGroup, FeeType, suggestCode } from "@/data/fee-catalog";
import { Plus, IndianRupee, Tags, Edit } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { EditableSelect } from "@/components/ui/EditableSelect";

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

export default function FeeTypes() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);
  const [feeGroups, setFeeGroups] = useState<FeeGroup[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...BLANK });
  const [usage, setUsage] = useState<FeeType | null>(null);
  const [pendingDelete, setPendingDelete] = useState<FeeType | null>(null);

  useEffect(() => {
    let cancelled = false;
    try {
      const t = localStorage.getItem(FEE_TYPES_KEY);
      if (t) setFeeTypes(JSON.parse(t));
      const g = localStorage.getItem(FEE_GROUPS_KEY);
      if (g) setFeeGroups(JSON.parse(g));
    } catch { /* use empty */ }
    return () => { cancelled = true; };
  }, []);

  // Callers pass updater functions; `JSON.stringify(fn)` is `undefined`, which
  // wrote the literal string "undefined" and broke the next load's `JSON.parse`.
  const persistFeeTypes = (next: FeeType[] | ((prev: FeeType[]) => FeeType[])) => {
    setFeeTypes((prev) => {
      const value = typeof next === "function" ? next(prev) : next;
      try { localStorage.setItem(FEE_TYPES_KEY, JSON.stringify(value)); } catch { /* quota */ }
      return value;
    });
  };
  const persistFeeGroups = (next: FeeGroup[] | ((prev: FeeGroup[]) => FeeGroup[])) => {
    setFeeGroups((prev) => {
      const value = typeof next === "function" ? next(prev) : next;
      try { localStorage.setItem(FEE_GROUPS_KEY, JSON.stringify(value)); } catch { /* quota */ }
      return value;
    });
  };

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

  const save = () => {
    const name = form.name.trim();
    const code = (form.code.trim() || suggestCode(name, feeTypes)).toUpperCase();
    const amount = Number(form.defaultAmount);

    if (!name) {
      toast({ title: "Fee name is required", variant: "destructive" });
      return;
    }
    if (!form.defaultAmount || !Number.isFinite(amount) || amount < 0) {
      toast({ title: "Enter a valid default amount", variant: "destructive" });
      return;
    }
    if (feeTypes.some((f) => f.id !== editingId && f.code.toUpperCase() === code)) {
      toast({ title: "That fee code is already in use", description: code, variant: "destructive" });
      return;
    }

    const payload: FeeType = {
      id: editingId ?? `${Date.now().toString(36)}`,
      name,
      code,
      category: form.category,
      defaultAmount: amount,
      frequency: form.frequency,
      applicableTo: [form.applicableTo],
      description: form.description.trim(),
      status: form.active ? ("active" as const) : ("inactive" as const),
    };

    if (editingId) {
      persistFeeTypes((prev) => prev.map((f) => (f.id === editingId ? payload : f)));
      toast({ title: "Fee type updated", description: `${name} was saved.` });
    } else {
      persistFeeTypes((prev) => [payload, ...prev]);
      toast({ title: "Fee type added", description: `${name} (${code}) is now available.` });
    }
    setIsDialogOpen(false);
    setEditingId(null);
    setForm({ ...BLANK, defaultAmount: "" });
  };

  const duplicate = (fee: FeeType) => {
    const name = `${fee.name} (Copy)`;
    const copy: FeeType = { ...fee, id: `${Date.now().toString(36)}`, name, code: suggestCode(fee.name, feeTypes), status: "inactive" };
    persistFeeTypes((prev) => [copy, ...prev]);
    toast({ title: "Fee type duplicated", description: `${name} was created as inactive.` });
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    const usedBy = feeGroups.filter((g) => g.feeTypes.includes(pendingDelete.name));
    persistFeeTypes((prev) => prev.filter((f) => f.id !== pendingDelete.id));
    toast({
      title: "Fee type deleted",
      description: usedBy.length
        ? `${pendingDelete.name} removed — it was still referenced by ${usedBy.length} fee group(s).`
        : `${pendingDelete.name} removed.`,
    });
    setPendingDelete(null);
  };

  const handleActions = (fee: FeeType) => [
    { label: "Edit Fee Type", onClick: () => openEdit(fee) },
    { label: "View Usage", onClick: () => setUsage(fee) },
    { label: "Duplicate", onClick: () => duplicate(fee) },
    {
      label: fee.status === "active" ? "Deactivate" : "Activate",
      onClick: () => {
        persistFeeTypes((prev) => prev.map((f) => (f.id === fee.id ? { ...f, status: f.status === "active" ? "inactive" : "active" } : f)));
        toast({ title: fee.status === "active" ? "Fee type deactivated" : "Fee type activated", description: fee.name });
      },
    },
    { label: "Delete", onClick: () => setPendingDelete(fee), destructive: true },
  ];

  const usageGroups = usage ? feeGroups.filter((g) => g.feeTypes.includes(usage.name)) : [];
  const usageStudents = usageGroups.reduce((sum, g) => sum + g.studentsCount, 0);

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
          <Button className="gap-2" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Add Fee Type
          </Button>
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

      <DataTable
        data={feeTypes}
        columns={columns}
        searchPlaceholder="Search fee types..."
        actions={handleActions}
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
                  min={0}
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
            <Button onClick={save}>{editingId ? "Save changes" : "Add Fee Type"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!usage} onOpenChange={(open) => !open && setUsage(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{usage?.name} usage</DialogTitle>
            <DialogDescription>
              {usageGroups.length
                ? `Included in ${usageGroups.length} fee group(s) covering ${usageStudents} students.`
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
                  <Badge variant="secondary">{group.studentsCount} students</Badge>
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
              {pendingDelete && feeGroups.some((g) => g.feeTypes.includes(pendingDelete.name))
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
