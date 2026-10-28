import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DataTable, Column, type TableFilter } from "@/components/ui/DataTable";
import { Users, IndianRupee, CheckCircle, Link2, AlertCircle, Download } from "lucide-react";
import { downloadCsv } from "@/lib/export";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { deleteInvoice, getBranches } from "@/lib/supabase/data";
import {
  listStudents,
  listInvoices,
  createInvoiceRow,
  updateInvoiceRow,
  paidFromPayments,
  studentCode,
  studentName,
  toNumber,
  formatDate,
  type InvoiceRow,
  type StudentRow,
} from "@/lib/supabase/studentFee";
import { FEE_GROUPS_KEY, FeeGroup } from "@/data/fee-catalog";

interface StudentAllocation {
  /** Always the student's id, so row selection and lookups agree. */
  id: string;
  /** Which branch admitted them. Head office allocates across all of them. */
  branch: string;
  /** The invoice backing this row, when one exists. */
  invoiceId?: string;
  studentId: string;
  name: string;
  course: string;
  batch: string;
  feeGroup: string;
  totalFee: number;
  paid: number;
  allocated: boolean;
  dueDate: string;
  discount?: number;
  discountNote?: string;
}

/** What the student actually owes once any discount is applied. */
const netFee = (student: StudentAllocation) => Math.max(0, student.totalFee - (student.discount ?? 0));

const columns: Column<StudentAllocation>[] = [
  {
    key: "studentId",
    header: "Student",
    cell: (student) => (
      <div>
        <p className="font-medium">{student.name}</p>
        <p className="text-xs text-muted-foreground">{student.studentId}</p>
      </div>
    ),
  },
  {
    key: "course",
    header: "Course",
    cell: (student) => (
      <div>
        <Badge variant="outline">{student.course || "No course"}</Badge>
        {student.batch ? <p className="text-xs text-muted-foreground mt-1">{student.batch}</p> : null}
      </div>
    ),
  },
  {
    key: "feeGroup",
    header: "Fee Group",
    cell: (student) => (
      student.feeGroup ? (
        <Badge variant="secondary">{student.feeGroup}</Badge>
      ) : (
        <span className="text-muted-foreground text-sm">Not assigned</span>
      )
    ),
  },
  {
    key: "totalFee",
    header: "Total Fee",
    sortable: true,
    cell: (student) => (
      student.totalFee > 0 ? (
        <div>
          <span className="font-medium">₹{netFee(student).toLocaleString("en-IN")}</span>
          {!!student.discount && (
            <p className="text-xs text-success">-₹{student.discount.toLocaleString("en-IN")} discount</p>
          )}
          {student.paid > 0 && (
            <p className="text-xs text-muted-foreground">₹{student.paid.toLocaleString("en-IN")} paid</p>
          )}
        </div>
      ) : (
        <span className="text-muted-foreground">-</span>
      )
    ),
  },
  {
    key: "dueDate",
    header: "Due Date",
    cell: (student) => (
      student.dueDate ? (
        <span>{formatDate(student.dueDate)}</span>
      ) : (
        <span className="text-muted-foreground">-</span>
      )
    ),
  },
  {
    key: "allocated",
    header: "Status",
    cell: (student) => (
      student.allocated ? (
        <Badge variant="default" className="gap-1">
          <CheckCircle className="h-3 w-3" />
          Allocated
        </Badge>
      ) : (
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Pending
        </Badge>
      )
    ),
  },
];

const inThirtyDays = () => new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10);

export default function FeeAllocation() {
  const { user } = useAuth();
  const { toast } = useToast();
  const branchId = user?.branchId || null;
  /* Head office allocates fees across every branch, and the list arrives as one
     pile; a branch-scoped account only ever sees its own, where a branch filter
     would be a control with one choice on it. */
  const showBranch = !branchId;
  const [branches, setBranches] = useState<Array<{ id: string; name: string }>>([]);
  const [allocations, setAllocations] = useState<StudentAllocation[]>([]);
  const [feeGroups, setFeeGroups] = useState<FeeGroup[]>([]);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedFeeGroup, setSelectedFeeGroup] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [batchFilter, setBatchFilter] = useState("all");
  const [dueDate, setDueDate] = useState(inThirtyDays());
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [details, setDetails] = useState<StudentAllocation | null>(null);
  const [changing, setChanging] = useState<StudentAllocation | null>(null);
  const [changeGroup, setChangeGroup] = useState("");
  const [changeDue, setChangeDue] = useState(inThirtyDays());
  const [discounting, setDiscounting] = useState<StudentAllocation | null>(null);
  const [discount, setDiscount] = useState({ mode: "amount", value: "", note: "" });
  const [removing, setRemoving] = useState<StudentAllocation | null>(null);

  const activeGroups = feeGroups.filter((group) => group.status === "active");

  /** Re-reads invoices. `getInvoices` in data.ts returns a { success, data }
   *  envelope; assigning it straight to state used to blank the page with
   *  "invoices.map is not a function" on the very next render. */
  const refreshInvoices = async () => {
    try {
      const refreshed = await listInvoices(branchId, { includeVoid: false });
      setInvoices(refreshed.data);
    } catch {
      // Refresh failed; state will reconcile on the next manual action.
    }
  };

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      setLoading(true);
      try {
        const [studentsData, invoicesData, groupsData] = await Promise.all([
          listStudents(branchId, 200),
          listInvoices(branchId, { includeVoid: false }),
          (async () => {
            try {
              const raw = localStorage.getItem(FEE_GROUPS_KEY);
              const parsed = raw ? JSON.parse(raw) : [];
              return Array.isArray(parsed) ? (parsed as FeeGroup[]) : [];
            } catch { return [] as FeeGroup[]; }
          })(),
        ]);
        if (!cancelled) {
          setStudents(studentsData.data);
          setInvoices(invoicesData.data);
          setFeeGroups(groupsData);
        }
      } catch (err) {
        if (!cancelled) {
          toast({
            title: "Failed to load fee allocation data",
            description: (err as Error)?.message || "Please try again.",
            variant: "destructive",
          });
          setStudents([]);
          setInvoices([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    loadData();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchId]);

  useEffect(() => {
    if (!showBranch) return;
    getBranches(user?.organizationId || null)
      .then((r) =>
        setBranches(
          ((r.data ?? []) as Record<string, unknown>[]).map((b) => ({
            id: String(b.id ?? ""),
            name: String(b.name ?? "Unnamed branch"),
          })),
        ),
      )
      // The filter is a convenience; the allocation list must not fail with it.
      .catch(() => setBranches([]));
  }, [showBranch, user?.organizationId]);

  const branchName = (id: string) => branches.find((b) => b.id === id)?.name || "";

  // Build the allocations view from students + invoices.
  useEffect(() => {
    const invoiceMap = new Map<string, InvoiceRow>();
    (Array.isArray(invoices) ? invoices : []).forEach((inv) => {
      if (inv.studentId) invoiceMap.set(inv.studentId, inv);
    });
    const built: StudentAllocation[] = (Array.isArray(students) ? students : []).map((stu) => {
      const inv = invoiceMap.get(stu.id);
      const base = {
        id: stu.id,
        branch: branchName(String(stu.branchId ?? "")),
        studentId: studentCode(stu),
        name: studentName(stu as never, "Unnamed student"),
        course: stu.course?.name || "",
        batch: stu.batch?.name || "",
      };
      if (inv) {
        const group = feeGroups.find((g) => g.id === inv.feeGroupId);
        const invoiceDiscount = toNumber(inv.discount);
        return {
          ...base,
          invoiceId: inv.id,
          feeGroup: group?.name ?? (inv.description || "Custom invoice"),
          totalFee: toNumber(inv.totalAmount),
          paid: paidFromPayments(inv),
          allocated: true,
          dueDate: inv.dueDate || "",
          discount: invoiceDiscount > 0 ? invoiceDiscount : undefined,
          discountNote: invoiceDiscount > 0 ? (inv.notes as string) || "Concession" : undefined,
        };
      }
      return {
        ...base,
        feeGroup: "",
        totalFee: 0,
        paid: 0,
        allocated: false,
        dueDate: "",
      };
    });
    setAllocations(built);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `branchName` is derived from `branches`, which is listed.
  }, [students, invoices, feeGroups, branches]);

  const courses = Array.from(new Set(allocations.map((s) => s.course).filter(Boolean))).sort();
  const batches = Array.from(new Set(allocations.map((s) => s.batch).filter(Boolean))).sort();

  const visible = allocations.filter(
    (student) =>
      (courseFilter === "all" || student.course === courseFilter) &&
      (batchFilter === "all" || student.batch === batchFilter),
  );

  /**
   * The Quick Allocation panel already narrows by course and batch, on its own
   * side of the page. These sit on the list itself, where the question is which
   * branch's students are being looked at and which of them still need a fee
   * group -- the thing this screen exists to fix.
   */
  const allocationFilters: TableFilter<StudentAllocation>[] = [
    ...(showBranch ? [{ label: "Branch", key: "branch" as const }] : []),
    { label: "Course", key: "course" as const },
    { label: "Batch", key: "batch" as const },
    {
      label: "Allocation",
      key: "allocated" as const,
      options: ["Allocated", "Pending"],
      value: (student: StudentAllocation) => (student.allocated ? "Allocated" : "Pending"),
    },
  ];

  const targetIds = selectedIds.filter((id) => visible.some((student) => student.id === id));

  const findInvoice = (studentId: string) =>
    (Array.isArray(invoices) ? invoices : []).find((inv) => inv.studentId === studentId);

  const allocateSelected = async () => {
    const group = activeGroups.find((item) => item.id === selectedFeeGroup);
    if (!group) {
      toast({ title: "Pick a fee group first", variant: "destructive" });
      return;
    }
    if (!targetIds.length) {
      toast({ title: "Select students in the list", description: "Tick the rows you want to allocate.", variant: "destructive" });
      return;
    }
    if (!dueDate) {
      toast({ title: "Pick a due date", variant: "destructive" });
      return;
    }

    setSaving(true);
    let succeeded = 0;
    const failures: string[] = [];
    for (const studentId of targetIds) {
      const existing = findInvoice(studentId);
      try {
        if (existing) {
          await updateInvoiceRow(existing.id, {
            feeGroupId: group.id,
            totalAmount: group.totalAmount,
            description: group.name,
            dueDate,
          });
        } else {
          await createInvoiceRow(branchId, {
            studentId,
            feeGroupId: group.id,
            totalAmount: group.totalAmount,
            description: group.name,
            dueDate,
          });
        }
        succeeded += 1;
      } catch (err) {
        failures.push((err as Error)?.message || "Unknown error");
      }
    }

    await refreshInvoices();
    setSaving(false);

    if (succeeded) {
      toast({
        title: "Fee group allocated",
        description: `${group.name} applied to ${succeeded} student${succeeded === 1 ? "" : "s"} · ₹${(group.totalAmount * succeeded).toLocaleString("en-IN")} billed.`,
      });
    }
    if (failures.length) {
      toast({
        title: `${failures.length} allocation${failures.length === 1 ? "" : "s"} failed`,
        description: failures[0],
        variant: "destructive",
      });
    }
    setSelectedIds([]);
  };

  const saveChange = async () => {
    if (!changing) return;
    const group = activeGroups.find((item) => item.id === changeGroup);
    if (!group) {
      toast({ title: "Pick a fee group", variant: "destructive" });
      return;
    }
    const existing = findInvoice(changing.id);
    setSaving(true);
    try {
      if (existing) {
        await updateInvoiceRow(existing.id, {
          feeGroupId: group.id,
          totalAmount: group.totalAmount,
          description: group.name,
          dueDate: changeDue,
          discount: 0,
        });
      } else {
        // The student had no invoice yet — changing the group creates one
        // instead of silently doing nothing, which is what used to happen.
        await createInvoiceRow(branchId, {
          studentId: changing.id,
          feeGroupId: group.id,
          totalAmount: group.totalAmount,
          description: group.name,
          dueDate: changeDue,
        });
      }
      await refreshInvoices();
      toast({ title: "Fee group updated", description: `${changing.name} → ${group.name}.` });
      setChanging(null);
    } catch (err) {
      toast({
        title: "Failed to update fee group",
        description: (err as Error)?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const saveDiscount = async () => {
    if (!discounting) return;
    const value = Number(discount.value);
    if (!Number.isFinite(value) || value <= 0) {
      toast({ title: "Enter a discount greater than zero", variant: "destructive" });
      return;
    }
    const amount = discount.mode === "percent"
      ? Math.round((discounting.totalFee * value) / 100)
      : Math.round(value);
    if (amount > discounting.totalFee) {
      toast({ title: "Discount exceeds the total fee", description: `Maximum is ₹${discounting.totalFee.toLocaleString("en-IN")}.`, variant: "destructive" });
      return;
    }
    const existing = findInvoice(discounting.id);
    if (!existing) {
      toast({ title: "No invoice to discount", description: `Allocate a fee group to ${discounting.name} first.`, variant: "destructive" });
      return;
    }
    const note = discount.note.trim() || (discount.mode === "percent" ? `${value}% concession` : "Flat concession");
    setSaving(true);
    try {
      // A discount is recorded on the invoice. It used to be written as a
      // fee_payments row with a `note` column that does not exist in the live
      // database, so it both failed and would have looked like a real payment.
      const updated = await updateInvoiceRow(existing.id, { discount: amount, notes: note });
      await refreshInvoices();
      if (!("discount" in (updated.data as unknown as Record<string, unknown>))) {
        toast({
          title: "Discount not stored",
          description: "The fee_invoices table has no discount column yet. Run supabase/schema/add-student-fee-fields.sql.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Discount applied",
          description: `₹${amount.toLocaleString("en-IN")} off — ${discounting.name} now owes ₹${(discounting.totalFee - amount).toLocaleString("en-IN")}.`,
        });
      }
      setDiscounting(null);
    } catch (err) {
      toast({
        title: "Failed to apply discount",
        description: (err as Error)?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleActions = (student: StudentAllocation) => [
    { label: "View Details", onClick: () => setDetails(student) },
    {
      label: student.allocated ? "Change Fee Group" : "Allocate Fee Group",
      onClick: () => {
        setChangeGroup(activeGroups.find((g) => g.name === student.feeGroup)?.id ?? "");
        setChangeDue(student.dueDate ? student.dueDate.slice(0, 10) : inThirtyDays());
        setChanging(student);
      },
    },
    {
      label: "Add Discount",
      onClick: () => {
        if (!student.allocated) {
          toast({ title: "Allocate a fee group first", description: `${student.name} has no fee to discount.`, variant: "destructive" });
          return;
        }
        setDiscount({ mode: "amount", value: "", note: "" });
        setDiscounting(student);
      },
    },
    {
      label: "Remove Allocation",
      onClick: () => {
        if (!student.allocated) {
          toast({ title: "Nothing to remove", description: `${student.name} has no fee group.` });
          return;
        }
        setRemoving(student);
      },
      destructive: true,
    },
  ];

  const allocatedRows = allocations.filter((s) => s.allocated);
  const pendingCount = allocations.length - allocatedRows.length;
  const totalAllocated = allocatedRows.reduce((sum, s) => sum + netFee(s), 0);

  // Exports what the filters currently show, not the whole table.
  const exportAllocations = () => {
    if (visible.length === 0) {
      toast({ title: "Nothing to export", description: "No students match these filters." });
      return;
    }
    downloadCsv(
      "fee-allocation.csv",
      visible.map((a) => ({
        Student: a.name,
        StudentId: a.studentId,
        Course: a.course,
        Batch: a.batch,
        FeeGroup: a.feeGroup,
        TotalFee: a.totalFee,
        Discount: a.discount ?? 0,
        DiscountNote: a.discountNote ?? "",
        Payable: netFee(a),
        Paid: a.paid,
        DueDate: a.dueDate ? formatDate(a.dueDate) : "",
        Allocated: a.allocated ? "yes" : "no",
      })),
    );
    toast({ title: "Allocations exported", description: `${visible.length} rows written to CSV.` });
  };

  return (
    <AppLayout>
      <PageHeader
        title="Fee Allocation"
        description="Assign fee groups to students"
        breadcrumbs={[
          { label: "Fee Management", href: "/fee/collection" },
          { label: "Fee Allocation" },
        ]}
        actions={
          <Button variant="outline" className="gap-2" onClick={exportAllocations}>
            <Download className="h-4 w-4" />
            Export
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        {[
          { value: allocations.length, label: "Total Students", icon: Users, bg: "bg-primary/10", fg: "text-primary" },
          { value: allocatedRows.length, label: "Fee Allocated", icon: CheckCircle, bg: "bg-success/10", fg: "text-success" },
          { value: pendingCount, label: "Pending Allocation", icon: AlertCircle, bg: "bg-destructive/10", fg: "text-destructive" },
          { value: `₹${(totalAllocated / 100000).toFixed(1)}L`, label: "Total Allocated", icon: IndianRupee, bg: "bg-warning/10", fg: "text-warning" },
        ].map((tile) => (
          <Card key={tile.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg ${tile.bg} flex items-center justify-center`}>
                  <tile.icon className={`h-5 w-5 ${tile.fg}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{tile.value}</p>
                  <p className="text-sm text-muted-foreground">{tile.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-4 mb-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              Quick Allocation
            </CardTitle>
            <CardDescription>Assign fee group to multiple students</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Fee Group</Label>
              <Select value={selectedFeeGroup} onValueChange={setSelectedFeeGroup}>
                <SelectTrigger>
                  <SelectValue placeholder="Select fee group" />
                </SelectTrigger>
                <SelectContent>
                  {activeGroups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      <div className="flex flex-col">
                        <span>{group.name}</span>
                        <span className="text-xs text-muted-foreground">₹{toNumber(group.totalAmount).toLocaleString("en-IN")}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!activeGroups.length && (
                <p className="text-xs text-muted-foreground">
                  No active fee groups yet — create one under Fee Management → Fee Groups.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Filter by Course</Label>
              <Select value={courseFilter} onValueChange={setCourseFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All courses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course} value={course}>{course}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Filter by Batch</Label>
              <Select value={batchFilter} onValueChange={setBatchFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All batches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Batches</SelectItem>
                  {batches.map((batch) => (
                    <SelectItem key={batch} value={batch}>{batch}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Due Date</Label>
              <DatePicker value={dueDate} onChange={(v) => setDueDate(v)} />
            </div>
            <Button className="w-full" disabled={loading || saving || !selectedFeeGroup || !targetIds.length} onClick={allocateSelected}>
              {saving ? "Working…" : `Allocate to Selected${targetIds.length ? ` (${targetIds.length})` : ""}`}
            </Button>
            {!targetIds.length && (
              <p className="text-xs text-muted-foreground">Tick students in the list to enable allocation.</p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Student List</CardTitle>
            <CardDescription>
              Select students to allocate fee groups
              {visible.length !== allocations.length && ` · showing ${visible.length} of ${allocations.length}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={visible}
              columns={columns}
              filters={allocationFilters}
              searchPlaceholder="Search students..."
              actions={handleActions}
              selectable
              onSelectionChange={(ids) => setSelectedIds(ids.map(String))}
              emptyMessage="No students match these filters"
            />
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!details} onOpenChange={(open) => !open && setDetails(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{details?.name}</DialogTitle>
            <DialogDescription>{details?.studentId} · {details?.course} · {details?.batch}</DialogDescription>
          </DialogHeader>
          {details && (
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              {[
                ["Fee group", details.feeGroup || "Not assigned"],
                ["Gross fee", details.totalFee ? `₹${details.totalFee.toLocaleString("en-IN")}` : "-"],
                ["Discount", details.discount ? `₹${details.discount.toLocaleString("en-IN")}` : "None"],
                ["Paid", details.paid ? `₹${details.paid.toLocaleString("en-IN")}` : "None"],
                ["Payable", details.totalFee ? `₹${netFee(details).toLocaleString("en-IN")}` : "-"],
                ["Due date", details.dueDate ? formatDate(details.dueDate) : "-"],
                ["Status", details.allocated ? "Allocated" : "Pending"],
                ...(details.discountNote ? [["Discount note", details.discountNote]] : []),
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                if (!details) return;
                setChangeGroup(activeGroups.find((g) => g.name === details.feeGroup)?.id ?? "");
                setChangeDue(details.dueDate ? details.dueDate.slice(0, 10) : inThirtyDays());
                setChanging(details);
                setDetails(null);
              }}
            >
              Change fee group
            </Button>
            <Button onClick={() => setDetails(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!changing} onOpenChange={(open) => !open && setChanging(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change fee group</DialogTitle>
            <DialogDescription>
              {changing?.name} · {changing?.feeGroup || "no group assigned"} — any existing discount is cleared.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Fee group</Label>
              <Select value={changeGroup} onValueChange={setChangeGroup}>
                <SelectTrigger><SelectValue placeholder="Select fee group" /></SelectTrigger>
                <SelectContent>
                  {activeGroups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name} · ₹{toNumber(group.totalAmount).toLocaleString("en-IN")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Due date</Label>
              <DatePicker value={changeDue} onChange={(v) => setChangeDue(v)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChanging(null)}>Cancel</Button>
            <Button onClick={saveChange} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!discounting} onOpenChange={(open) => !open && setDiscounting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add discount</DialogTitle>
            <DialogDescription>
              {discounting?.name} · gross ₹{toNumber(discounting?.totalFee).toLocaleString("en-IN")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Discount type</Label>
                <Select value={discount.mode} onValueChange={(value) => setDiscount((c) => ({ ...c, mode: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="amount">Flat amount (₹)</SelectItem>
                    <SelectItem value="percent">Percentage (%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{discount.mode === "percent" ? "Percentage" : "Amount"}</Label>
                <Input
                  type="number"
                  min={0}
                  value={discount.value}
                  onChange={(e) => setDiscount((c) => ({ ...c, value: e.target.value }))}
                  placeholder={discount.mode === "percent" ? "10" : "5000"}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Reason</Label>
              <Input
                value={discount.note}
                onChange={(e) => setDiscount((c) => ({ ...c, note: e.target.value }))}
                placeholder="Merit scholarship, sibling concession..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDiscounting(null)}>Cancel</Button>
            <Button onClick={saveDiscount} disabled={saving}>{saving ? "Saving…" : "Apply discount"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!removing} onOpenChange={(open) => !open && setRemoving(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this allocation?</AlertDialogTitle>
            <AlertDialogDescription>
              {removing?.name} will go back to pending and the ₹{removing ? netFee(removing).toLocaleString("en-IN") : 0} billing is dropped.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (!removing) return;
                const existing = findInvoice(removing.id);
                if (!existing) {
                  toast({ title: "Nothing to remove", description: `${removing.name} has no invoice.` });
                  setRemoving(null);
                  return;
                }
                if (paidFromPayments(existing) > 0) {
                  // Deleting an invoice with payments against it would either
                  // fail on the foreign key or orphan the receipts.
                  toast({
                    title: "Payments already recorded",
                    description: `${removing.name} has paid ₹${paidFromPayments(existing).toLocaleString("en-IN")}. Void or refund the invoice instead.`,
                    variant: "destructive",
                  });
                  setRemoving(null);
                  return;
                }
                try {
                  await deleteInvoice(existing.id, branchId);
                  await refreshInvoices();
                  toast({ title: "Allocation removed", description: `${removing.name} is pending allocation.` });
                } catch (err) {
                  toast({
                    title: "Failed to remove allocation",
                    description: (err as Error)?.message || "Please try again.",
                    variant: "destructive",
                  });
                }
                setRemoving(null);
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}