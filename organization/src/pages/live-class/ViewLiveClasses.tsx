import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, Column, type TableFilter } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { StatsCard } from "@/components/ui/StatsCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { Plus, Video, Users, Calendar, Clock, Play, Download, Link2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { downloadCsv } from "@/lib/export";
import { getLiveClasses, updateBatchTiming } from "@/lib/supabase/data";
import { liveClassState, studentsOnSchedule } from "@/lib/liveClasses";

interface LiveClass {
  id: string;
  title: string;
  subject: string;
  instructor: string;
  course: string;
  batch: string;
  /** Which branch runs it. Head office reads every branch's from one list. */
  branch: string;
  date: string;
  time: string;
  duration: string;
  platform: string;
  meetingLink?: string;
  meetingId?: string;
  description?: string;
  attendees: number;
  /** Students actually on the batch — not its seat limit, which is `capacity`. */
  totalStudents: number;
  capacity: number;
  status: "scheduled" | "active" | "completed" | "cancelled";
  recorded?: boolean;
}

const columns: Column<LiveClass>[] = [
  {
    key: "title",
    header: "Class",
    sortable: true,
    cell: (liveClass) => (
      <div>
        <p className="font-medium">{liveClass.title}</p>
        <p className="text-xs text-muted-foreground">{liveClass.subject}</p>
      </div>
    ),
  },
  {
    key: "branch",
    header: "Branch",
    sortable: true,
    cell: (liveClass) => (
      <div>
        <p className="text-sm">{liveClass.branch || "—"}</p>
        <p className="text-xs text-muted-foreground">{liveClass.batch || "No batch"}</p>
      </div>
    ),
  },
  {
    key: "totalStudents",
    header: "Students",
    sortable: true,
    cell: (liveClass) => (
      <div>
        <p className="text-sm font-semibold">{liveClass.totalStudents}</p>
        {liveClass.capacity ? (
          <p className="text-xs text-muted-foreground">of {liveClass.capacity} seats</p>
        ) : null}
      </div>
    ),
  },
  {
    key: "instructor",
    header: "Instructor",
    cell: (liveClass) => (
      <div className="flex items-center gap-2">
        <Avatar className="h-7 w-7">
          <AvatarFallback className="text-xs">
            {liveClass.instructor.split(" ").slice(-1)[0][0]}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm">{liveClass.instructor}</span>
      </div>
    ),
  },
  {
    key: "batch",
    header: "Batch",
    cell: (liveClass) => (
      <div>
        <p className="font-medium">{liveClass.batch}</p>
        <p className="text-xs text-muted-foreground">{liveClass.course}</p>
      </div>
    ),
  },
  {
    key: "date",
    header: "Schedule",
    sortable: true,
    cell: (liveClass) => (
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <div>
          <p className="text-sm">{new Date(liveClass.date).toLocaleDateString()}</p>
          <p className="text-xs text-muted-foreground">{liveClass.time} ({liveClass.duration})</p>
        </div>
      </div>
    ),
  },
  {
    key: "platform",
    header: "Platform",
    cell: (liveClass) => <Badge variant="secondary">{liveClass.platform}</Badge>,
  },
  {
    key: "attendees",
    header: "Attendance",
    cell: (liveClass) => (
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span>{liveClass.attendees}/{liveClass.totalStudents}</span>
      </div>
    ),
  },
  {
    key: "status",
    header: "Status",
    cell: (liveClass) => <StatusBadge status={liveClass.status} />,
  },
];

export default function ViewLiveClasses() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const branchId = user?.branchId || null;
  const { toast } = useToast();
  const [classesData, setClassesData] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<LiveClass | null>(null);
  const [editing, setEditing] = useState<LiveClass | null>(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        // Was a REST call against an API server that is not part of this
        // deployment - `api` is not even defined here, so the page threw on mount.
        const result = await getLiveClasses(branchId);
        setClassesData(result.data as LiveClass[]);
      } catch (error) {
        toast({
          title: "Failed to load classes",
          description: error instanceof Error ? error.message : undefined,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, [toast, branchId]);

  const join = (liveClass: LiveClass) => {
    if (!liveClass.meetingLink) {
      toast({ title: "No meeting link on this class", variant: "destructive" });
      return;
    }
    window.open(liveClass.meetingLink, "_blank", "noopener");
    toast({ title: "Opening the class", description: `${liveClass.platform} · ${liveClass.title}` });
  };

  const cancelClass = async (liveClass: LiveClass) => {
    try {
      await updateBatchTiming(liveClass.id, { status: "cancelled" });
      setClassesData((prev) => prev.map((c) => (c.id === liveClass.id ? { ...c, status: "cancelled" } : c)));
      toast({ title: "Class cancelled", description: `${liveClass.title} was marked cancelled.` });
    } catch {
      toast({ title: "Failed to cancel class", variant: "destructive" });
    }
  };

  const recording = (liveClass: LiveClass) => {
    if (!liveClass.recorded) {
      toast({
        title: "No recording available",
        description: `${liveClass.title} was not recorded.`,
        variant: "destructive",
      });
      return;
    }
    toast({ title: "Recording ready", description: `Streaming ${liveClass.title} from ${liveClass.platform}.` });
    setDetails(liveClass);
  };

  const attendanceReport = (liveClass: LiveClass) => {
    downloadCsv(`attendance-${liveClass.title.toLowerCase().replace(/\s+/g, "-")}.csv`, [
      {
        Class: liveClass.title,
        Instructor: liveClass.instructor,
        Batch: liveClass.batch,
        Date: liveClass.date,
        Time: liveClass.time,
        Attended: liveClass.attendees,
        Enrolled: liveClass.totalStudents,
        "Attendance %": Math.round((liveClass.attendees / liveClass.totalStudents) * 100),
      },
    ]);
    toast({ title: "Attendance report exported" });
  };

  const saveEdit = async () => {
    if (!editing) return;
    if (!editing.title.trim()) {
      toast({ title: "Class title is required", variant: "destructive" });
      return;
    }
    try {
      await updateBatchTiming(editing.id, { ...editing } as Record<string, unknown>);
      setClassesData((prev) => prev.map((c) => (c.id === editing.id ? editing : c)));
      toast({ title: "Class updated", description: `${editing.title} was saved.` });
      setEditing(null);
    } catch {
      toast({ title: "Failed to update class", variant: "destructive" });
    }
  };

  const handleActions = (liveClass: LiveClass) => {
    const actions = [
      { label: "View Details", onClick: () => setDetails(liveClass) },
    ];

    if (liveClass.meetingLink) {
      actions.push({ label: "Copy Meeting Link", onClick: () => void copyLink(liveClass) });
    }
    if (liveClass.status === "active") {
      actions.unshift({ label: "Join Class", onClick: () => join(liveClass) });
    }
    if (liveClass.status === "scheduled") {
      actions.push({ label: "Edit", onClick: () => setEditing(liveClass) });
      actions.push({ label: "Cancel", onClick: () => cancelClass(liveClass) });
    }
    if (liveClass.status === "completed") {
      actions.push({ label: "View Recording", onClick: () => recording(liveClass) });
      actions.push({ label: "Attendance Report", onClick: () => attendanceReport(liveClass) });
    }

    return actions;
  };

  /* Branch, batch and course are the three ways this list is asked for, and
     status is the fourth — "what is running right now" against "what is still
     to come". They read their choices off the rows, so a branch with no class
     scheduled does not appear as an option that finds nothing. */
  const filters: TableFilter<LiveClass>[] = [
    { label: "Branch", key: "branch" },
    { label: "Batch", key: "batch" },
    { label: "Course", key: "course" },
    {
      label: "Status",
      key: "status",
      options: ["Live now", "Upcoming", "Completed", "Cancelled"],
      value: (c) => liveClassState(c.status),
    },
  ];

  const copyLink = async (liveClass: LiveClass) => {
    if (!liveClass.meetingLink) {
      toast({ title: "No meeting link", description: "This class has no link on it yet.", variant: "destructive" });
      return;
    }
    try {
      await navigator.clipboard.writeText(liveClass.meetingLink);
      toast({ title: "Link copied", description: liveClass.title });
    } catch {
      // Clipboard access is refused outside a secure context, so the link is
      // shown to be copied by hand rather than silently doing nothing.
      toast({ title: "Copy it by hand", description: liveClass.meetingLink });
    }
  };

  const exportClasses = () => {
    if (!classesData.length) {
      toast({ title: "Nothing to export", description: "No classes on the schedule yet." });
      return;
    }
    downloadCsv(
      "live-classes.csv",
      classesData.map((c) => ({
        Class: c.title,
        Subject: c.subject,
        Branch: c.branch,
        Batch: c.batch,
        Course: c.course,
        Instructor: c.instructor,
        Date: c.date,
        Time: c.time,
        Duration: c.duration,
        Students: c.totalStudents,
        Platform: c.platform,
        Status: c.status,
        MeetingLink: c.meetingLink ?? "",
      })),
    );
    toast({ title: "Classes exported", description: `${classesData.length} rows written to CSV.` });
  };

  const liveNow = classesData.filter((c) => c.status === "active").length;
  const upcoming = classesData.filter((c) => c.status === "scheduled").length;
  const studentCount = studentsOnSchedule(classesData);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading classes...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title="Live Classes"
        description="View and manage live class sessions"
        breadcrumbs={[
          { label: "Live Class", href: "/live-class/view" },
          { label: "View Classes" },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={exportClasses} disabled={!classesData.length}>
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button className="gap-2" onClick={() => navigate("/live-class/setup")}>
              <Plus className="h-4 w-4" />
              Schedule Class
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatsCard title="Total Classes" value={classesData.length} subtitle="On the schedule" icon={Video} variant="primary" />
        <StatsCard title="Live Now" value={liveNow} subtitle="In progress" icon={Play} variant="success" />
        <StatsCard title="Upcoming" value={upcoming} subtitle="Scheduled" icon={Calendar} variant="info" />
        <StatsCard
          title="Students"
          value={studentCount}
          subtitle="Across the classes listed"
          icon={Users}
          variant="warning"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Class Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={classesData}
            columns={columns}
            filters={filters}
            searchPlaceholder="Search class, branch, batch, trainer…"
            actions={handleActions}
          />
        </CardContent>
      </Card>

      <Dialog open={!!details} onOpenChange={(open) => !open && setDetails(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{details?.title}</DialogTitle>
            <DialogDescription>{details?.subject} · {details?.instructor}</DialogDescription>
          </DialogHeader>
          {details && (
            <>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                {[
                  ["Course", `${details.course} · ${details.batch}`],
                  ["Schedule", `${new Date(details.date).toLocaleDateString()} at ${details.time}`],
                  ["Duration", details.duration],
                  ["Platform", details.platform],
                  ["Attendance", `${details.attendees}/${details.totalStudents}`],
                  ["Recording", details.recorded ? "Available" : "Not recorded"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className="font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
              {details.description && <p className="text-sm text-muted-foreground">{details.description}</p>}
              {details.meetingLink && (
                <p className="truncate text-xs text-muted-foreground" title={details.meetingLink}>
                  {details.meetingLink}
                </p>
              )}
            </>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetails(null)}>Close</Button>
            {details?.meetingLink && <Button onClick={() => join(details)}>Open meeting</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit class</DialogTitle>
            <DialogDescription>Change the schedule for this session.</DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="class-title">Title</Label>
                <Input id="class-title" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="class-date">Date</Label>
                <DatePicker value={editing.date} onChange={(v) => setEditing({ ...editing, date: v })} id="class-date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="class-time">Time</Label>
                <Input id="class-time" value={editing.time} onChange={(e) => setEditing({ ...editing, time: e.target.value })} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="class-link">Meeting link</Label>
                <Input id="class-link" value={editing.meetingLink ?? ""} onChange={(e) => setEditing({ ...editing, meetingLink: e.target.value })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={saveEdit}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
