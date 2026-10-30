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
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { addPayment } from "@/lib/supabase/data";
import { FEE_GROUPS_KEY, FEE_TYPES_KEY } from "@/data/fee-catalog";

interface FeeGroup {
  id: string;
  name: string;
  description: string;
  feeTypes: string[];
  totalAmount: number;
  courses: string[];
  studentsCount: number;
  status: "active" | "inactive";
}

interface FeeType {
  id: string;
  name: string;
  code: string;
  category: string;
  defaultAmount: number;
  frequency: string;
  applicableTo: string[];
  description: string;
  status: "active" | "inactive";
}

const COURSE_OPTIONS = ["All Courses", "Computer Science", "Engineering", "Commerce", "Science"] as const;

function suggestCode(name: string, existing: FeeType[]): string {
  const initials = name.split(/\s+/).filter(Boolean).map((word) => word[0]?.toUpperCase() ?? "").join("").slice(0, 3) || "FEE";
  let counter = 1;
  let code = `${initials}${String(counter).padStart(3, "0")}`;
  while (existing.some((f) => f.code.toUpperCase() === code)) {
    counter += 1;
    code = `${initials}${String(counter).padStart(3, "0")}`;
  }
  return code;
}

const columns: Column<FeeGroup>[] = [
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
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [groups, setGroups] = useState<FeeGroup[]>([]);
  const [allFeeTypes, setAllFeeTypes] = useState<FeeType[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...BLANK });
  const [details, setDetails] = useState<FeeGroup | null>(null);
  const [assigning, setAssigning] = useState<FeeGroup | null>(null);
  const [assignCount, setAssignCount] = useState("");
  const [pendingDelete, setPendingDelete] = useState<FeeGroup | null>(null);

  useEffect(() => {
    let cancelled = false;
    try {
      const g = localStorage.getItem(FEE_GROUPS_KEY);
      if (g) setGroups(JSON.parse(g));
      const f = localStorage.getItem(FEE_TYPES_KEY);
      if (f) setAllFeeTypes(JSON.parse(f));
    } catch { /* use empty */ }
    return () => { cancelled = true; };
  }, []);

  // Every caller passes an updater function, so these have to resolve it before
  // writing: `JSON.stringify(fn)` is `undefined`, which stored the literal string
  // "undefined" and made the next `JSON.parse` throw - fee groups never persisted.
  const persistGroups = (next: FeeGroup[] | ((prev: FeeGroup[]) => FeeGroup[])) => {
    setGroups((prev) => {
      const value = typeof next === "function" ? next(prev) : next;
      try { localStorage.setItem(FEE_GROUPS_KEY, JSON.stringify(value)); } catch { /* quota */ }
      return value;
    });
  };
  const persistFeeTypes = (next: FeeType[] | ((prev: FeeType[]) => FeeType[])) => {
    setAllFeeTypes((prev) => {
      const value = typeof next === "function" ? next(prev) : next;
      try { localStorage.setItem(FEE_TYPES_KEY, JSON.stringify(value)); } catch { /* quota */ }
      return value;
    });
  };

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
      feeTypeIds: allFeeTypes.filter((f) => group.feeTypes.includes(f.name)).map((f) => f.id),
    });
    setIsDialogOpen(true);
  };

  const save = () => {
    const name = form.name.trim();
    if (!name) {
      toast({ title: "Group name is required", variant: "destructive" });
      return;
    }
    if (!form.feeTypeIds.length) {
      toast({ title: "Pick at least one fee type", variant: "destructive" });
      return;
    }
    if (groups.some((g) => g.id !== editingId && g.name.toLowerCase() === name.toLowerCase())) {
      toast({ title: "A fee group with that name already exists", variant: "destructive" });
      return;
    }

    const chosen = allFeeTypes.filter((f) => form.feeTypeIds.includes(f.id));
    const courses = form.courses
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    const payload: FeeGroup = {
      id: editingId ?? `${Date.now().toString(36)}`,
      name,
      description: form.description.trim() || `${chosen.length} fee types`,
      feeTypes: chosen.map((f) => f.name),
      totalAmount: chosen.reduce((sum, f) => sum + f.defaultAmount, 0),
      courses: courses.length ? courses : ["All Courses"],
      status: "active" as const,
      studentsCount: editingId ? groups.find((g) => g.id === editingId)?.studentsCount ?? 0 : 0,
    };

    if (editingId) {
      persistGroups((prev) => prev.map((g) => (g.id === editingId ? payload : g)));
      toast({ title: "Fee group updated", description: `${name} was saved.` });
    } else {
      persistGroups((prev) => [payload, ...prev]);
      toast({ title: "Fee group created", description: `${name} · ₹${payload.totalAmount.toLocaleString()}` });
    }
    setIsDialogOpen(false);
    setEditingId(null);
    setForm({ ...BLANK });
  };

  const duplicate = (group: FeeGroup) => {
    const name = `${group.name} (Copy)`;
    const copy: FeeGroup = { ...group, id: `${Date.now().toString(36)}`, name, studentsCount: 0, status: "inactive" };
    persistGroups((prev) => [copy, ...prev]);
    toast({ title: "Fee group duplicated", description: `${name} was created as inactive.` });
  };

  const confirmAssign = () => {
    if (!assigning) return;
    const count = Number(assignCount);
    if (!assignCount.trim() || !Number.isFinite(count) || count <= 0) {
      toast({ title: "Enter how many students to assign", variant: "destructive" });
      return;
    }
    persistGroups((prev) => prev.map((g) => (g.id === assigning.id ? { ...g, studentsCount: g.studentsCount + count } : g)));
    toast({
      title: "Fee group assigned",
      description: `${count} student(s) added to ${assigning.name} · ₹${(count * assigning.totalAmount).toLocaleString()} billed.`,
    });
    setAssigning(null);
    setAssignCount("");
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    persistGroups((prev) => prev.filter((g) => g.id !== pendingDelete.id));
    toast({ title: "Fee group deleted", description: `${pendingDelete.name} was removed.` });
    setPendingDelete(null);
  };

  const handleActions = (group: FeeGroup) => [
    { label: "View Details", onClick: () => setDetails(group) },
    { label: "Edit Group", onClick: () => openEdit(group) },
    {
      label: "Assign to Students",
      onClick: () => {
        setAssigning(group);
        setAssignCount("");
      },
    },
    { label: "Duplicate", onClick: () => duplicate(group) },
    { label: "Delete", onClick: () => setPendingDelete(group), destructive: true },
  ];

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
          <Button className="gap-2" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Create Fee Group
          </Button>
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
                <p className="text-2xl font-bold">{groups.reduce((sum, g) => sum + g.studentsCount, 0)}</p>
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

      <DataTable
        data={groups}
        columns={columns}
        searchPlaceholder="Search fee groups..."
        actions={handleActions}
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
            <Button onClick={save}>{editingId ? "Save changes" : "Create Group"}</Button>
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
                  {details.feeTypes.map((name) => {
                    const fee = allFeeTypes.find((f) => f.name === name);
                    return (
                      <li key={name} className="flex items-center justify-between p-2">
                        <span>{name}</span>
                        <span className="text-muted-foreground">
                          {fee ? `₹${fee.defaultAmount.toLocaleString()}` : "not in catalogue"}
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

      <Dialog
        open={!!assigning}
        onOpenChange={(open) => {
          if (!open) {
            setAssigning(null);
            setAssignCount("");
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign {assigning?.name}</DialogTitle>
            <DialogDescription>
              ₹{assigning?.totalAmount.toLocaleString()} per student · {assigning?.studentsCount} already assigned.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="assign-count">Number of students</Label>
            <Input
              id="assign-count"
              type="number"
              min={1}
              placeholder="e.g., 25"
              value={assignCount}
              onChange={(e) => setAssignCount(e.target.value)}
            />
            {Number(assignCount) > 0 && assigning && (
              <p className="text-xs text-muted-foreground">
                Bills ₹{(Number(assignCount) * assigning.totalAmount).toLocaleString()} in total.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssigning(null)}>Cancel</Button>
            <Button onClick={confirmAssign}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {pendingDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete?.studentsCount
                ? `${pendingDelete.studentsCount} students are on this package — they will lose their fee structure.`
                : "This fee group has no students assigned."}
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