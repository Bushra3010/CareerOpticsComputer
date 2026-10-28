import { useEffect, useMemo, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SelectWithCustom } from "@/components/ui/select-with-custom";
import { CalendarCheck, Check, Clock3, Download, FileText, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { downloadCsv } from "@/lib/export";
import { getUsers, type SystemUserRow } from "@/lib/supabase/data";

/** The four the office keeps to, or whatever else was typed in its place. */
type HolidayType = string;

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  branchId: string;
}

interface Application {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  designation: string;
  holidayType: HolidayType;
  fromDate: string;
  toDate: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  appliedAt: string;
}

const HOLIDAY_TYPES: { value: HolidayType; label: string }[] = [
  { value: "public_holiday", label: "Public Holiday" },
  { value: "casual_leave", label: "Casual Leave" },
  { value: "sick_leave", label: "Sick Leave" },
  { value: "earned_leave", label: "Earned Leave" },
];

const STORAGE_KEY = "erp-holiday-applications";

/** Applications the page used to invent on first open. A browser that opened
 *  it then still holds them; they are dropped on load. */
const INVENTED = new Set(["HOL-1001", "HOL-1002", "HOL-1003"]);

/** The institute's own staff, as User Management lists them. */
const asEmployee = (u: SystemUserRow): Employee => ({
  id: u.id,
  name: u.name || u.email,
  email: u.email,
  department: u.branch || u.organization || "—",
  designation: (u.role || "Staff").replace(/_/g, " "),
  branchId: u.branchId,
});

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  approved: "bg-emerald-100 text-emerald-800 border-emerald-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
};

export default function HolidayApply() {
  const { toast } = useToast();
  const { user } = useAuth();

  const [applications, setApplications] = useState<Application[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return (JSON.parse(stored) as Application[]).filter((a) => !INVENTED.has(a.id));
    } catch { /* fall through */ }
    return [];
  });

  const [employees, setEmployees] = useState<Employee[]>([]);
  useEffect(() => {
    let cancelled = false;
    getUsers(user?.organizationId ?? null, user?.branchId ?? null)
      .then((result) => {
        if (!cancelled) setEmployees(result.data.filter((u) => u.isActive !== false && u.role?.toUpperCase() !== "STUDENT").map(asEmployee));
      })
      .catch((error) => {
        if (!cancelled) {
          toast({
            title: "Could not load staff",
            description: error instanceof Error ? error.message : "Please try again",
            variant: "destructive",
          });
        }
      });
    return () => { cancelled = true; };
  }, [user?.organizationId, user?.branchId, toast]);

  const [mode, setMode] = useState<"list" | "form">("list");
  const [employeeId, setEmployeeId] = useState("");
  const [holidayType, setHolidayType] = useState<HolidayType>("casual_leave");
  const [fromDate, setFromDate] = useState(new Date().toISOString().slice(0, 10));
  const [toDate, setToDate] = useState(new Date().toISOString().slice(0, 10));
  const [reason, setReason] = useState("");
  const [search, setSearch] = useState("");

  const selectedEmployee = useMemo(
    () => employees.find((e) => e.id === employeeId),
    [employees, employeeId],
  );

  /** Auto-detect current logged-in employee by email. */
  useEffect(() => {
    if (!user?.email) return;
    const match = employees.find((e) => e.email.toLowerCase() === user.email!.toLowerCase());
    if (match) {
      setEmployeeId(match.id);
    }
  }, [employees, user?.email]);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(applications)); }, [applications]);

  const reset = () => {
    setEmployeeId("");
    setHolidayType("casual_leave");
    setFromDate(new Date().toISOString().slice(0, 10));
    setToDate(new Date().toISOString().slice(0, 10));
    setReason("");
  };

  const submit = () => {
    if (!employeeId || !selectedEmployee) {
      toast({ title: "Employee ID required", description: "Select an employee to apply holiday.", variant: "destructive" });
      return;
    }
    if (!fromDate || !toDate) {
      toast({ title: "Dates required", description: "Select both from and to dates.", variant: "destructive" });
      return;
    }
    if (toDate < fromDate) {
      toast({ title: "Invalid dates", description: "To date cannot be before from date.", variant: "destructive" });
      return;
    }
    const entry: Application = {
      id: `HOL-${Math.floor(Math.random() * 9000 + 1000)}`,
      employeeId: selectedEmployee.id,
      employeeName: selectedEmployee.name,
      department: selectedEmployee.department,
      designation: selectedEmployee.designation,
      holidayType,
      fromDate,
      toDate,
      reason: reason.trim() || "—",
      status: "pending",
      appliedAt: new Date().toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" }),
    };
    setApplications((list) => [entry, ...list]);
    toast({ title: "Holiday applied", description: `${entry.id} for ${selectedEmployee.name} submitted.` });
    reset();
    setMode("list");
  };

  /** Approve / reject moves an application out of "pending". */
  const decide = (id: string, status: "approved" | "rejected") => {
    setApplications((list) => list.map((a) => (a.id === id ? { ...a, status } : a)));
    toast({ title: status === "approved" ? "Application approved" : "Application rejected", description: id });
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return applications;
    return applications.filter((a) =>
      `${a.id} ${a.employeeId} ${a.employeeName} ${a.department} ${a.designation} ${a.reason}`
        .toLowerCase()
        .includes(q),
    );
  }, [applications, search]);

  const exportCsv = () => {
    if (!filtered.length) {
      toast({ title: "Nothing to export", description: "No applications match this search.", variant: "destructive" });
      return;
    }
    downloadCsv(
      "holiday-applications.csv",
      filtered.map((a) => ({
        id: a.id,
        employeeId: a.employeeId,
        employeeName: a.employeeName,
        department: a.department,
        designation: a.designation,
        type: a.holidayType.replace(/_/g, " "),
        fromDate: a.fromDate,
        toDate: a.toDate,
        reason: a.reason,
        status: a.status,
        appliedAt: a.appliedAt,
      })),
      ["id", "employeeId", "employeeName", "department", "designation", "type", "fromDate", "toDate", "reason", "status", "appliedAt"],
    );
    toast({ title: "Exported", description: `${filtered.length} application(s) downloaded.` });
  };

  const stats = useMemo(() => {
    const total = applications.length;
    const pending = applications.filter((a) => a.status === "pending").length;
    const approved = applications.filter((a) => a.status === "approved").length;
    const rejected = applications.filter((a) => a.status === "rejected").length;
    return { total, pending, approved, rejected };
  }, [applications]);

  return (
    <AppLayout>
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-muted-foreground">Attendance</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-[-.04em]">Holiday Apply</h1>
          <p className="mt-1 text-sm text-muted-foreground">Apply leave or holiday for any employee. Employee data is auto-filled from the employee directory.</p>
          <p className="mt-1 text-xs text-amber-700">Saved in this browser only — the institute database has no holiday / leave table yet, so these applications are not shared with other users.</p>
        </div>
        {mode === "list"
          ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportCsv} disabled={!filtered.length}><Download />Export</Button>
              <Button onClick={() => setMode("form")}><CalendarCheck />New Application</Button>
            </div>
          )
          : <Button variant="outline" onClick={() => { reset(); setMode("list"); }}><X />Close</Button>
        }
      </div>

      {mode === "list" ? (
        <>
          <div className="mb-4 grid gap-3 sm:grid-cols-4">
            {[
              { l: "Total Applications", v: String(stats.total), i: FileText },
              { l: "Pending", v: String(stats.pending), i: Clock3 },
              { l: "Approved", v: String(stats.approved), i: Check },
              { l: "Rejected", v: String(stats.rejected), i: X },
            ].map((x) => (
              <Card key={x.l}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-xs text-muted-foreground">{x.l}</p>
                    <p className="mt-1 text-2xl font-semibold">{x.v}</p>
                  </div>
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-muted"><x.i className="h-4 w-4" /></span>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="border-b p-4">
                <Input
                  placeholder="Search by employee name, ID, or reason..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[780px] text-sm">
                  <thead>
                    <tr className="border-b bg-muted/35 text-left text-xs text-muted-foreground">
                      <th className="px-4 py-3 font-medium">ID</th>
                      <th className="px-4 py-3 font-medium">Employee</th>
                      <th className="px-4 py-3 font-medium">Department</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">From</th>
                      <th className="px-4 py-3 font-medium">To</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Applied</th>
                      <th className="px-4 py-3 font-medium text-right">Decision</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r) => (
                      <tr key={r.id} className="border-b last:border-0 hover:bg-muted/25">
                        <td className="px-4 py-3 font-mono text-xs">{r.id}</td>
                        <td className="px-4 py-3">
                          <p className="font-medium">{r.employeeName}</p>
                          <p className="text-xs text-muted-foreground">{r.employeeId} · {r.designation}</p>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{r.department}</td>
                        <td className="px-4 py-3 capitalize">{r.holidayType.replace("_", " ")}</td>
                        <td className="px-4 py-3 text-muted-foreground">{r.fromDate}</td>
                        <td className="px-4 py-3 text-muted-foreground">{r.toDate}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[r.status]}`}>{r.status}</span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{r.appliedAt}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1.5">
                            {r.status === "pending" ? (
                              <>
                                <Button size="sm" variant="outline" onClick={() => decide(r.id, "approved")}>
                                  <Check className="mr-1 h-3.5 w-3.5" />Approve
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => decide(r.id, "rejected")}>
                                  <X className="mr-1 h-3.5 w-3.5" />Reject
                                </Button>
                              </>
                            ) : (
                              <span className="text-xs text-muted-foreground">Decided</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr><td colSpan={9} className="px-4 py-8 text-center text-sm text-muted-foreground">
                        {applications.length ? "No applications match this search." : "No holiday applications yet."}
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="overflow-hidden">
          <div className="border-b bg-muted/25 px-5 py-4">
            <p className="text-sm font-semibold">New Holiday Application</p>
            <p className="text-xs text-muted-foreground">Select an employee to auto-fill their details.</p>
          </div>
          <CardContent className="p-6">
            <div className="mx-auto max-w-3xl space-y-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label>Employee</Label>
                  <Select value={employeeId} onValueChange={setEmployeeId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((e) => (
                        <SelectItem key={e.id} value={e.id}>{e.name} — {e.designation}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedEmployee && (
                  <>
                    <div className="sm:col-span-2 rounded-xl border bg-muted/20 p-4">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">Auto-filled Employee Details</p>
                      <div className="mt-3 grid gap-3 sm:grid-cols-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Name</p>
                          <p className="font-medium">{selectedEmployee.name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Department</p>
                          <p className="font-medium">{selectedEmployee.department}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Designation</p>
                          <p className="font-medium">{selectedEmployee.designation}</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                <div>
                  <Label>Holiday / Leave Type</Label>
                  <SelectWithCustom
                    value={holidayType}
                    onValueChange={setHolidayType}
                    options={HOLIDAY_TYPES}
                    placeholder="Select type"
                    customPlaceholder="Type the leave type"
                  />
                </div>
                <div>
                  <Label>From Date</Label>
                  <DatePicker value={fromDate} onChange={(v) => setFromDate(v)} />
                </div>
                <div>
                  <Label>To Date</Label>
                  <DatePicker value={toDate} onChange={(v) => setToDate(v)} />
                </div>
                <div className="sm:col-span-2">
                  <Label>Reason</Label>
                  <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason for holiday / leave" rows={3} />
                </div>
              </div>
            </div>
          </CardContent>
          <div className="flex items-center justify-between border-t bg-card/95 p-4">
            <Button variant="ghost" onClick={() => { reset(); setMode("list"); }}>Cancel</Button>
            <Button onClick={submit}><CalendarCheck />Submit Application</Button>
          </div>
        </Card>
      )}
    </AppLayout>
  );
}
