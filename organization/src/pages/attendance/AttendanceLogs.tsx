import { useEffect, useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Download, Filter, Calendar } from "lucide-react";
import { downloadCsv } from "@/lib/export";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getAllAttendanceRecords } from "@/lib/supabase/data";
import { listBatches, listCourses, safeDateLabel } from "@/lib/supabase/examAttendance";

interface AttendanceLog {
  id: string;
  studentId: string;
  studentName: string;
  enrollmentNo: string;
  courseId: string;
  batchId: string;
  date: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY" | "LEAVE";
  courseName: string;
  batchName: string;
  remarks?: string;
}

type Detail = { log: AttendanceLog };

export default function AttendanceLogs() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [detail, setDetail] = useState<Detail | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const branchId = user?.branchId || "";
        const res = await getAllAttendanceRecords(branchId || undefined);
        if (cancelled) return;
        const rawRecords = res.data || [];
        // Build lookup of unique student IDs
        const studentIds = Array.from(new Set(rawRecords.map((r: any) => r.studentId)));
        // Fetch student details
        const { supabase } = await import("@/lib/supabase/client");
        const { data: students } = await supabase
          .from("students")
          .select("id, firstName, lastName, enrollmentNo, courseId, batchId")
          .in("id", studentIds);
        const byId = new Map((students || []).map((s: any) => [s.id, s]));
        // Raw UUIDs are unreadable in a log, so course/batch are resolved to names.
        const [courseRows, batchRows] = await Promise.all([
          listCourses(user?.organizationId),
          listBatches(branchId || undefined),
        ]);
        const courseName = new Map(courseRows.map((c) => [c.id, c.name]));
        const batchName = new Map(batchRows.map((b) => [b.id, b.name]));
        const mapped: AttendanceLog[] = rawRecords.map((r: any) => {
          const s = byId.get(r.studentId);
          return {
            id: r.id,
            studentId: r.studentId,
            studentName: s ? [s.firstName, s.lastName].filter(Boolean).join(" ") : r.studentId,
            enrollmentNo: s?.enrollmentNo || "",
            courseId: s?.courseId || "",
            batchId: s?.batchId || "",
            courseName: courseName.get(s?.courseId) || "",
            batchName: batchName.get(s?.batchId) || "",
            date: r.date,
            status: r.status,
            remarks: r.remarks,
          };
        });
        setLogs(mapped);
      } catch {
        if (!cancelled) toast({ title: "Failed to load attendance logs", variant: "destructive" });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [user?.branchId, user?.organizationId, toast]);

  const statuses = useMemo(() => Array.from(new Set(logs.map(l => l.status).filter(Boolean))).sort(), [logs]);

  const filtered = logs.filter((log) => {
    const matchesSearch =
      (log.studentName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.enrollmentNo || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || log.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedStatus("all");
  };

  const exportLogs = () => {
    if (!filtered.length) {
      toast({ title: "Nothing to export", description: "No records match the current filters.", variant: "destructive" });
      return;
    }
    downloadCsv(
      `attendance-logs.csv`,
      filtered.map((log) => ({
        StudentId: log.studentId,
        StudentName: log.studentName,
        EnrollmentNo: log.enrollmentNo,
        Course: log.courseName || log.courseId,
        Batch: log.batchName || log.batchId,
        Date: log.date,
        Status: log.status,
        Remarks: log.remarks || "-",
      })),
    );
    toast({ title: "Export ready", description: `${filtered.length} record(s) downloaded.` });
  };

  const statusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      PRESENT: "default",
      ABSENT: "destructive",
      LATE: "secondary",
      HALF_DAY: "outline",
      LEAVE: "outline",
    };
    return <Badge variant={variants[status] || "outline"}>{(status || "—").replace(/_/g, " ")}</Badge>;
  };

  const columns = [
    {
      key: "date",
      header: "Date",
      sortable: true,
      cell: (log: AttendanceLog) => (
        <span className="text-sm">{safeDateLabel(log.date, "en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
      ),
    },
    {
      key: "studentName",
      header: "Student",
      cell: (log: AttendanceLog) => (
        <div>
          <p className="font-medium">{log.studentName || log.studentId}</p>
          <p className="text-xs text-muted-foreground">{log.enrollmentNo || "—"}</p>
        </div>
      ),
    },
    {
      key: "courseId",
      header: "Course",
      cell: (log: AttendanceLog) => <span className="text-sm">{log.courseName || log.courseId || "—"}</span>,
    },
    {
      key: "batchId",
      header: "Batch",
      cell: (log: AttendanceLog) => <span className="text-sm">{log.batchName || log.batchId || "—"}</span>,
    },
    {
      key: "status",
      header: "Status",
      cell: (log: AttendanceLog) => statusBadge(log.status),
    },
    {
      key: "remarks",
      header: "Remarks",
      cell: (log: AttendanceLog) => (
        <span className="text-xs text-muted-foreground max-w-[200px] truncate block">{log.remarks || "—"}</span>
      ),
    },
  ];

  return (
    <AppLayout>
      <PageHeader
        title="Attendance Logs"
        description="View detailed attendance history"
        breadcrumbs={[
          { label: "Attendance", href: "/attendance" },
          { label: "Attendance Logs" },
        ]}
        actions={
          <Button variant="outline" onClick={exportLogs}>
            <Download className="mr-2 h-4 w-4" />
            Export Logs
          </Button>
        }
      />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label>Search Student</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, ID, or enrollment..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger><SelectValue placeholder="All Statuses" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statuses.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Showing {filtered.length} of {logs.length} records
            </p>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <Calendar className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading attendance logs...</div>
          ) : (
            <DataTable
              columns={columns}
              data={filtered}
              searchable={false}
              emptyMessage="No attendance logs found"
              actions={(log) => [
                { label: "View details", onClick: () => setDetail({ log }) },
                {
                  label: "Copy student ID",
                  onClick: () => {
                    void navigator.clipboard
                      .writeText(log.studentId)
                      .then(() => toast({ title: "Student ID copied", description: log.studentId }))
                      .catch(() => toast({ title: "Could not copy", description: log.studentId, variant: "destructive" }));
                  },
                },
                {
                  label: "Export this record",
                  onClick: () => {
                    downloadCsv(`attendance-${log.studentId}-${log.date}.csv`, [
                      {
                        StudentId: log.studentId,
                        StudentName: log.studentName,
                        EnrollmentNo: log.enrollmentNo,
                        Course: log.courseName || log.courseId,
                        Batch: log.batchName || log.batchId,
                        Date: log.date,
                        Status: log.status,
                        Remarks: log.remarks || "-",
                      },
                    ]);
                    toast({ title: "Record exported" });
                  },
                },
              ]}
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={detail !== null} onOpenChange={(open) => !open && setDetail(null)}>
        <DialogContent className="max-w-lg">
          {detail && (
            <>
              <DialogHeader>
                <DialogTitle>Attendance Log Details</DialogTitle>
                <DialogDescription>
                  {detail.log.studentName || detail.log.studentId} • {safeDateLabel(detail.log.date, "en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                </DialogDescription>
              </DialogHeader>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                {[
                  ["Student ID", detail.log.studentId],
                  ["Enrollment", detail.log.enrollmentNo || "—"],
                  ["Course", detail.log.courseName || detail.log.courseId || "—"],
                  ["Batch", detail.log.batchName || detail.log.batchId || "—"],
                  ["Status", (detail.log.status || "").replace(/_/g, " ")],
                  ["Remarks", detail.log.remarks || "—"],
                ].map(([label, value]) => (
                  <div key={String(label)}>
                    <dt className="text-xs text-muted-foreground">{String(label)}</dt>
                    <dd className="font-medium">{String(value)}</dd>
                  </div>
                ))}
              </dl>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
