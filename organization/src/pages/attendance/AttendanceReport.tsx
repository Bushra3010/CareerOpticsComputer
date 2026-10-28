import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Download } from "lucide-react";
import { format, subDays } from "date-fns";
import { downloadCsv } from "@/lib/export";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getAllAttendanceRecords } from "@/lib/supabase/data";
import { safeDateLabel, safePercent } from "@/lib/supabase/examAttendance";

interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  enrollmentNo: string;
  date: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY" | "LEAVE";
  remarks?: string;
}

export default function AttendanceReport() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [tab, setTab] = useState("today");
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [detail, setDetail] = useState<AttendanceRecord | null>(null);

  const day = (ago: number) => format(subDays(new Date(), ago), "yyyy-MM-dd");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const branchId = user?.branchId || "";
        const res = await getAllAttendanceRecords(branchId || undefined);
        if (cancelled) return;
        const rawRecords = res.data || [];
        const studentIds = Array.from(new Set(rawRecords.map((r: any) => r.studentId)));
        const { supabase } = await import("@/lib/supabase/client");
        const { data: students } = await supabase
          .from("students")
          .select("id, firstName, lastName, enrollmentNo")
          .in("id", studentIds);
        const byId = new Map((students || []).map((s: any) => [s.id, s]));
        const mapped: AttendanceRecord[] = rawRecords.map((r: any) => {
          const s = byId.get(r.studentId);
          return {
            id: r.id,
            studentId: r.studentId,
            studentName: s ? [s.firstName, s.lastName].filter(Boolean).join(" ") : r.studentId,
            enrollmentNo: s?.enrollmentNo || "",
            date: r.date,
            status: r.status,
            remarks: r.remarks || "",
          };
        });
        setRecords(mapped);
      } catch {
        if (!cancelled) toast({ title: "Failed to load attendance report", variant: "destructive" });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [user?.branchId, toast]);

  const changeTab = (value: string) => {
    setTab(value);
    if (value === "today") setSelectedDate(day(0));
    if (value === "yesterday") setSelectedDate(day(1));
  };

  const dayRecords = records.filter((record) => record.date === selectedDate);
  const totalPresent = dayRecords.filter(r => r.status === "PRESENT").length;
  const totalAbsent = dayRecords.filter(r => r.status === "ABSENT").length;
  const totalLate = dayRecords.filter(r => r.status === "LATE").length;
  const totalHalfDay = dayRecords.filter(r => r.status === "HALF_DAY").length;
  // "Attended" counts late and half-day arrivals; only a true absence is missing.
  const attendedPercent = safePercent(dayRecords.length - totalAbsent, dayRecords.length);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      PRESENT: "default",
      ABSENT: "destructive",
      LATE: "secondary",
      HALF_DAY: "outline",
      LEAVE: "outline",
    };
    return <Badge variant={variants[status] || "outline"}>{(status || "—").replace(/_/g, " ")}</Badge>;
  };

  const exportReport = () => {
    if (!dayRecords.length) {
      toast({ title: "Nothing to export", description: "No records for the selected date.", variant: "destructive" });
      return;
    }
    downloadCsv(
      `attendance-report-${selectedDate}.csv`,
      dayRecords.map((record) => ({
        StudentId: record.studentId,
        StudentName: record.studentName,
        EnrollmentNo: record.enrollmentNo,
        Date: record.date,
        Status: record.status,
        Remarks: record.remarks || "-",
      })),
    );
    toast({ title: "Report exported", description: `${dayRecords.length} rows downloaded.` });
  };

  return (
    <AppLayout>
      <PageHeader
        title="Attendance Report"
        description="Daily attendance summary and details"
        breadcrumbs={[
          { label: "Attendance", href: "/attendance" },
          { label: "Attendance Report" },
        ]}
        actions={
          <Button variant="outline" onClick={exportReport}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        }
      />

      <Tabs value={tab} onValueChange={changeTab} className="mt-6">
        <TabsList>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="yesterday">Yesterday</TabsTrigger>
          <TabsTrigger value="custom">Custom Date</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="mt-4">
          <SummaryCards
            total={dayRecords.length}
            present={totalPresent}
            absent={totalAbsent}
            late={totalLate}
            halfDay={totalHalfDay}
            attended={attendedPercent}
          />
        </TabsContent>

        <TabsContent value="yesterday" className="mt-4">
          <SummaryCards
            total={dayRecords.length}
            present={totalPresent}
            absent={totalAbsent}
            late={totalLate}
            halfDay={totalHalfDay}
            attended={attendedPercent}
          />
        </TabsContent>

        <TabsContent value="custom" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Select Date</CardTitle>
            </CardHeader>
            <CardContent>
              <DatePicker value={selectedDate} onChange={(v) => setSelectedDate(v)} />
            </CardContent>
          </Card>
          <SummaryCards
            total={dayRecords.length}
            present={totalPresent}
            absent={totalAbsent}
            late={totalLate}
            halfDay={totalHalfDay}
            attended={attendedPercent}
          />
        </TabsContent>
      </Tabs>

      <Card className="mt-6">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle>
              Attendance for {selectedDate ? safeDateLabel(selectedDate, "en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "— pick a date"}
            </CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading report...</div>
          ) : (
            <DataTable
              columns={[
                {
                  key: "studentName",
                  header: "Student",
                  cell: (record: AttendanceRecord) => (
                    <div>
                      <p className="font-medium">{record.studentName}</p>
                      <p className="text-xs text-muted-foreground">{record.enrollmentNo || "—"}</p>
                    </div>
                  ),
                },
                {
                  key: "status",
                  header: "Status",
                  cell: (record: AttendanceRecord) => getStatusBadge(record.status),
                },
                {
                  key: "date",
                  header: "Date",
                  cell: (record: AttendanceRecord) => (
                    <span className="text-sm">{safeDateLabel(record.date, "en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                  ),
                },
                {
                  key: "remarks",
                  header: "Remarks",
                  cell: (record: AttendanceRecord) => (
                    <span className="block max-w-[220px] truncate text-xs text-muted-foreground">{record.remarks || "—"}</span>
                  ),
                },
              ]}
              data={dayRecords.filter(r =>
                `${r.studentName || ""} ${r.enrollmentNo || ""}`.toLowerCase().includes(searchTerm.toLowerCase())
              )}
              searchable={false}
              emptyMessage="No attendance records for this date"
              actions={(record) => [
                { label: "View details", onClick: () => setDetail(record) },
                {
                  label: "Export this row",
                  onClick: () => {
                    downloadCsv(`attendance-${record.studentId}-${record.date}.csv`, [
                      {
                        StudentId: record.studentId,
                        StudentName: record.studentName,
                        EnrollmentNo: record.enrollmentNo,
                        Date: record.date,
                        Status: record.status,
                        Remarks: record.remarks || "-",
                      },
                    ]);
                    toast({ title: "Row exported" });
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
                <DialogTitle>Attendance Details</DialogTitle>
                <DialogDescription>
                  {detail.studentName} • {safeDateLabel(detail.date, "en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  {[
                    ["Student ID", detail.studentId],
                    ["Enrollment", detail.enrollmentNo || "—"],
                    ["Date", safeDateLabel(detail.date, "en-IN", { day: "2-digit", month: "short", year: "numeric" })],
                    ["Status", (detail.status || "").replace(/_/g, " ")],
                    ["Remarks", detail.remarks || "—"],
                  ].map(([label, value]) => (
                    <div key={String(label)}>
                      <dt className="text-xs text-muted-foreground">{String(label)}</dt>
                      <dd className="font-medium">{String(value)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

function SummaryCards({ total, present, absent, late, halfDay, attended }: { total: number; present: number; absent: number; late: number; halfDay: number; attended: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-6 mb-6">
      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="mt-1 text-2xl font-semibold">{total}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Present</p>
          <p className="mt-1 text-2xl font-semibold text-green-600">{present}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Absent</p>
          <p className="mt-1 text-2xl font-semibold text-red-600">{absent}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Late</p>
          <p className="mt-1 text-2xl font-semibold text-amber-600">{late}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Half Day</p>
          <p className="mt-1 text-2xl font-semibold text-orange-600">{halfDay}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Attended</p>
          <p className="mt-1 text-2xl font-semibold">{total ? `${attended}%` : "—"}</p>
        </CardContent>
      </Card>
    </div>
  );
}
