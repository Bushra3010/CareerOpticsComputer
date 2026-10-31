import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Layers, IndianRupee, Users, BookOpen } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  feeGroupUsage,
  listFeeGroupInvoices,
  studentsOnFeeGroups,
  type FeeGroupInvoice,
} from "@/lib/supabase/studentFee";
import { useAuth } from "@/contexts/AuthContext";
import {
  canManageFeeStructures,
  copyName,
  createFeeGroup,
  deleteFeeGroup,
  feeGroupProblem,
  loadFeeCatalog,
  updateFeeGroup,
  type FeeGroup,
  type FeeType,
} from "@/lib/supabase/feeStructures";

/** A group as the table shows it: the stored package plus who it is billed to. */
interface FeeGroupRow extends FeeGroup {
  /** Fee type names for display; a live type's current name wins over the item's copy. */
  feeTypes: string[];
  /** Read from the group's invoices. */
  studentsCount: number;
  invoiceCount: number;
}

const columns: Column<FeeGroupRow>[] = [
  {
    key: "name",
    header: "Fee Group",
    sortable: true,
    cell: (group) => (
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Layers className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="font-medium">{group.name}</p>
          <p className="text-xs text-muted-foreground">{group.description}</p>
        </div>
      </div>
    ),
  },
  {
    key: "feeTypes",
    header: "Fee Types",
    cell: (group) => (
      <div className="flex flex-wrap gap-1 max-w-[200px]">
        {group.feeTypes.slice(0, 2).map((type) => (
          <Badge key={type} variant="secondary" className="text-xs">{type}</Badge>
        ))}
        {group.feeTypes.length > 2 && (
          <Badge variant="secondary" className="text-xs">+{group.feeTypes.length - 2}</Badge>
        )}
      </div>
    ),
  },
  {
    key: "totalAmount",
    header: "Total Amount",
    sortable: true,
    cell: (group) => <span className="font-medium text-success">₹{group.totalAmount.toLocaleString()}</span>,
  },
  {
    key: "courses",
    header: "Courses",
    cell: (group) => (
      group.courses[0] === "All Courses" ? (
        <Badge variant="default">All Courses</Badge>
      ) : (
        <Badge variant="outline">{group.courses.length} courses</Badge>
      )
    ),
  },
  {
    key: "studentsCount",
    header: "Students",
    sortable: true,
    cell: (group) => (
      <div className="flex items-center gap-1">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span>{group.studentsCount}</span>
      </div>
    ),
  },
  {
    key: "status",
    header: "Status",
    cell: (group) => <StatusBadge status={group.status} />,
  },
];

const BLANK = { name: "", courses: "All Courses", description: "", feeTypeIds: [] as string[] };

export default function FeeGroups() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const organizationId = user?.organizationId ?? null;
  const canManage = canManageFeeStructures(user?.role);
  const [groups, setGroups] = useState<FeeGroup[]>([]);
  const [allFeeTypes, setAllFeeTypes] = useState<FeeType[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...BLANK });
  const [details, setDetails] = useState<FeeGroupRow | null>(null);
  const [pendingDelete, setPendingDelete] = useState<FeeGroupRow | null>(null);
  // null until the invoices have loaded. A delete is refused while it is, since
  // "no students" cannot be told apart from "not counted yet".
  const [invoices, setInvoices] = useState<FeeGroupInvoice[] | null>(null);
  const [usageError, setUsageError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadFeeCatalog(organizationId, { canImport: canManage })
      .then(({ types, groups: loaded, imported, importError }) => {
        if (cancelled) return;
        setAllFeeTypes(types);
        setGroups(loaded);
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
        if (!cancelled) setLoadError(error.message || "Could not load fee groups.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `toast` is stable; reload only when the login changes.
  }, [organizationId, canManage]);

  useEffect(() => {
    let cancelled = false;
    // Row-level security scopes the invoices to what this login may see.
    listFeeGroupInvoices(null)
      .then((rows) => {
        if (!cancelled) {
          setInvoices(rows);
          setUsageError(null);
        }
      })
      .catch((error: Error) => {
        if (!cancelled) setUsageError(error.message || "Could not count the students on each group.");
      });
    return () => { cancelled = true; };
  }, []);

  const usage = useMemo(() => feeGroupUsage(invoices ?? []), [invoices]);
  const rows: FeeGroupRow[] = useMemo(
    () =>
      groups.map((g) => ({
        ...g,
        feeTypes: g.items.map((item) => allFeeTypes.find((f) => f.id === item.feeTypeId)?.name ?? item.name),
        studentsCount: usage.get(g.id)?.students ?? 0,
        invoiceCount: usage.get(g.id)?.invoices ?? 0,
      })),
    [groups, usage, allFeeTypes],
  );
  const studentsAssigned = useMemo(
    () => studentsOnFeeGroups(invoices ?? [], groups.map((g) => g.id)),
    [invoices, groups],
  );

  const failed = (title: string, error: unknown) =>
    toast({ title, description: (error as Error)?.message || "Please try again.", variant: "destructive" });

  /** Only live fee types can go into a new package. */
  const availableFeeTypes = allFeeTypes.filter((f) => f.status === "active");

  const set = <K extends keyof typeof BLANK>(key: K, value: (typeof BLANK)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleFeeType = (feeId: string) =>
    setForm((f) => ({
      ...f,
      feeTypeIds: f.feeTypeIds.includes(feeId)
        ? f.feeTypeIds.filter((id) => id !== feeId)
        : [...f.feeTypeIds, feeId],
    }));

  const totalSelected = form.feeTypeIds.reduce((sum, id) => {
    const fee = allFeeTypes.find((f) => f.id === id);
    return sum + (fee?.defaultAmount ?? 0);
  }, 0);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...BLANK });
    setIsDialogOpen(true);
  };

  const openEdit = (group: FeeGroup) => {
    setEditingId(group.id);
    setForm({
      name: group.name,
      courses: group.courses.join(", "),
      description: group.description,
      feeTypeIds: group.items
        .map((item) => item.feeTypeId)
        .filter((id): id is string => !!id && allFeeTypes.some((f) => f.id === id)),
    });
    setIsDialogOpen(true);
  };

  const save = async () => {
    const name = form.name.trim();
    const chosen = allFeeTypes.filter((f) => form.feeTypeIds.includes(f.id));
    const items = chosen.map((f) => ({ feeTypeId: f.id, name: f.name, amount: f.defaultAmount }));
    const problem = feeGroupProblem({ name, items }, groups, editingId);
    if (problem) {
      toast({ title: problem, variant: "destructive" });
      return;
    }

    const courses = form.courses
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    const input = {
      name,
      description: form.description.trim() || `${chosen.length} fee types`,
      courses: courses.length ? courses : ["All Courses"],
      // Frozen at save, as before: repricing a fee type later must not change
      // what allocation bills for a package students are already on.
      totalAmount: Math.round(items.reduce((sum, item) => sum + item.amount, 0) * 100) / 100,
      status: editingId ? groups.find((g) => g.id === editingId)?.status ?? ("active" as const) : ("active" as const),
      items,
    };

    setSaving(true);
    try {
      if (editingId) {
        await updateFeeGroup(editingId, input);
        setGroups((prev) => prev.map((g) => (g.id === editingId ? { ...input, id: editingId } : g)));
        toast({ title: "Fee group updated", description: `${name} was saved.` });
      } else {
        const created = await createFeeGroup(organizationId, input);
        setGroups((prev) => [created, ...prev]);
        toast({ title: "Fee group created", description: `${name} · ₹${input.totalAmount.toLocaleString()}` });
      }
      setIsDialogOpen(false);
      setEditingId(null);
      setForm({ ...BLANK });
    } catch (error) {
      failed("Could not save the fee group", error);
    } finally {
      setSaving(false);
    }
  };

  const duplicate = async (group: FeeGroupRow) => {
    const name = copyName(group.name, groups.map((g) => g.name));
    try {
      const copy = await createFeeGroup(organizationId, {
        name,
        description: group.description,
        courses: group.courses,
        totalAmount: group.totalAmount,
        status: "inactive",
        items: group.items,
      });
      setGroups((prev) => [copy, ...prev]);
      toast({ title: "Fee group duplicated", description: `${name} was created as inactive.` });
    } catch (error) {
      failed("Could not duplicate the fee group", error);
    }
  };

  /**
   * Deleting is refused, not merely warned about, while any invoice names the
   * group. The group is only soft-deleted, but it drops off every list, so its
   * invoices would read as "Custom invoice" on allocation with nothing left to
   * say what they were for. Void or re-allocate those invoices first; the group can go after.
   */
  const deleteBlocker = (group: FeeGroupRow): string | null => {
    if (invoices === null) {
      return usageError
        ? `Could not check which invoices use this group (${usageError}). Try again before deleting.`
        : "Still counting the invoices on this group. Try again in a moment.";
    }
    if (group.invoiceCount > 0) {
      return `${group.invoiceCount} invoice${group.invoiceCount === 1 ? "" : "s"} for ${group.studentsCount} student${group.studentsCount === 1 ? "" : "s"} use this group. Void or re-allocate them on Fee Allocation before deleting it.`;
    }
    return null;
  };

  const confirmDelete = async () => {
    if (!pendingDelete || deleteBlocker(pendingDelete)) return;
    const target = pendingDelete;
    try {
      await deleteFeeGroup(target.id);
      setGroups((prev) => prev.filter((g) => g.id !== target.id));
      toast({ title: "Fee group deleted", description: `${target.name} was removed.` });
    } catch (error) {
      failed("Could not delete the fee group", error);
    } finally {
      setPendingDelete(null);
    }
  };

  const handleActions = (group: FeeGroupRow) =>
    canManage
      ? [
          { label: "View Details", onClick: () => setDetails(group) },
          { label: "Edit Group", onClick: () => openEdit(group) },
          // Students are put on a group by allocating it, which bills them. The
          // number typed here used to be added to a counter and billed no one.
          { label: "Assign to Students", onClick: () => navigate("/fee/allocation") },
          { label: "Duplicate", onClick: () => duplicate(group) },
          { label: "Delete", onClick: () => setPendingDelete(group), destructive: true },
        ]
      : [{ label: "View Details", onClick: () => setDetails(group) }];

  const avgAmount = groups.length
    ? Math.round(groups.reduce((sum, g) => sum + g.totalAmount, 0) / groups.length / 1000)
    : 0;

  return (
    <AppLayout>
      <PageHeader
        title="Fee Groups"
        description="Create and manage fee group packages"
        breadcrumbs={[
          { label: "Fee Management", href: "/fee/collection" },
          { label: "Fee Groups" },
        ]}
        actions={
          canManage ? (
            <Button className="gap-2" onClick={openCreate} disabled={loading || !!loadError}>
              <Plus className="h-4 w-4" />
              Create Fee Group
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Layers className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{groups.length}</p>
                <p className="text-sm text-muted-foreground">Fee Groups</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{invoices === null && !usageError ? "…" : studentsAssigned}</p>
                <p className="text-sm text-muted-foreground">Students Assigned</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <IndianRupee className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">₹{avgAmount}K</p>
                <p className="text-sm text-muted-foreground">Avg. Group Amount</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{availableFeeTypes.length}</p>
                <p className="text-sm text-muted-foreground">Fee Types Available</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {loadError && (
        <p role="alert" className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {loadError}
        </p>
      )}
      {!canManage && !loadError && (
        <p className="mb-4 text-sm text-muted-foreground">Only an organisation admin can change fee groups.</p>
      )}

      <DataTable
        data={rows}
        columns={columns}
        searchPlaceholder="Search fee groups..."
        actions={handleActions}
        emptyMessage={loading ? "Loading fee groups…" : "No fee groups yet"}
      />

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingId(null);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Fee Group" : "Create New Fee Group"}</DialogTitle>
            <DialogDescription>
              The total is the sum of the fee types you tick — maintain those on the Fee Types page.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="group-name">Group Name *</Label>
                <Input
                  id="group-name"
                  placeholder="e.g., Standard Fee Package"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="group-courses">Applicable Courses</Label>
                <Input
                  id="group-courses"
                  placeholder="All Courses, or a comma separated list"
                  value={form.courses}
                  onChange={(e) => set("courses", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="group-description">Description</Label>
              <Textarea
                id="group-description"
                placeholder="Brief description of the fee group..."
                rows={2}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Select Fee Types *</Label>
              <div className="border rounded-lg p-4 space-y-3 max-h-64 overflow-y-auto">
                {availableFeeTypes.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No active fee types. Add one on the Fee Types page first.
                  </p>
                )}
                {availableFeeTypes.map((fee) => (
                  <div key={fee.id} className="flex items-center justify-between p-2 hover:bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={`fee-${fee.id}`}
                        checked={form.feeTypeIds.includes(fee.id)}
                        onCheckedChange={() => toggleFeeType(fee.id)}
                      />
                      <label htmlFor={`fee-${fee.id}`} className="cursor-pointer">
                        <span className="font-medium">{fee.name}</span>
                        <span className="ml-2 text-xs text-muted-foreground">{fee.frequency}</span>
                      </label>
                    </div>
                    <span className="text-muted-foreground">₹{fee.defaultAmount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
            {form.feeTypeIds.length > 0 && (
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Total Amount:</span>
                    <span className="text-xl font-bold text-primary">₹{totalSelected.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{editingId ? "Save changes" : "Create Group"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!details} onOpenChange={(open) => !open && setDetails(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{details?.name}</DialogTitle>
            <DialogDescription>{details?.description}</DialogDescription>
          </DialogHeader>
          {details && (
            <div className="space-y-4">
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                {[
                  ["Total amount", `₹${details.totalAmount.toLocaleString()}`],
                  ["Students assigned", String(details.studentsCount)],
                  ["Invoices", String(details.invoiceCount)],
                  ["Courses", details.courses.join(", ")],
                  ["Expected revenue", `₹${(details.totalAmount * details.studentsCount).toLocaleString()}`],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className="font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Fee types</p>
                <ul className="divide-y rounded-lg border text-sm">
                  {details.items.map((item, index) => {
                    const fee = allFeeTypes.find((f) => f.id === item.feeTypeId);
                    return (
                      <li key={`${item.feeTypeId ?? item.name}-${index}`} className="flex items-center justify-between p-2">
                        <span>{fee?.name ?? item.name}</span>
                        <span className="text-muted-foreground">
                          ₹{item.amount.toLocaleString()}
                          {!fee && " · not in catalogue"}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetails(null)}>Close</Button>
            <Button onClick={() => navigate("/fee/allocation")}>Go to allocation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {pendingDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete && (deleteBlocker(pendingDelete) ?? "No invoice uses this fee group. It can be deleted safely.")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{pendingDelete && deleteBlocker(pendingDelete) ? "Close" : "Cancel"}</AlertDialogCancel>
            {pendingDelete && !deleteBlocker(pendingDelete) && (
              <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}