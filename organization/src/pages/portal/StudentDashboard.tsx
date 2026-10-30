import { AppGreeting, HeroCard, ServicesGrid } from "@/components/home/AppHome";
import { Link } from "react-router-dom";
import { ArrowUpRight, CalendarCheck, FileCheck, IndianRupee, Megaphone, Video } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useMemo } from "react";
import { getStudentProfile, getStudentPortalAttendance, getStudentPortalInvoices, getStudentPortalResults, getStudentPortalClasses, getNotices } from "@/lib/supabase/data";
import { feeStanding, rupees } from "@/lib/fees";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
// The shared shape, not a local copy of the old api-server's response: the
// page renders these fields straight into JSX, so what getStudentProfile
// actually returns is the only thing worth typing them as.
import type { StudentProfile } from "@/data/student-portal";


interface AttendanceRecord {
  id: string;
  date: string;
  status: string;
  remarks?: string;
  student?: { firstName?: string; lastName?: string; enrollmentNo?: string };
}

interface PortalInvoice {
  id: string;
  invoiceNo?: string;
  description?: string;
  /** Resolved by `getStudentInvoices` — the table's columns are `totalAmount`
   *  and `paidAmount`, and the receipts live in `fee_payments`. */
  amount: number;
  paid: number;
  balance: number;
  status?: string;
  dueDate?: string;
  createdAt?: string;
  payments?: { amount: number; reversedAt?: string }[];
  student?: { firstName?: string; lastName?: string; enrollmentNo?: string };
}

interface PortalResult {
  id: string;
  marks?: number;
  remarks?: string;
  exam?: { name?: string; subject?: string; examDate?: string; maxMarks?: number; passMarks?: number; status?: string };
}

interface PortalClass {
  id: string;
  subject?: string;
  instructor?: string;
  roomNo?: string;
  startTime: string;
  endTime: string;
  day: string;
  batchId?: string;
  course?: string;
}

interface Notice {
  id: string;
  title: string;
  content: string;
  type?: string;
  priority?: string;
  publishDate?: string;
  expiryDate?: string;
  views?: number;
}

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

const toDate = (value: string | Date | undefined) => {
  if (!value) return null;
  const d = typeof value === "string" ? new Date(value) : value;
  return Number.isNaN(d.getTime()) ? null : d;
};

export default function StudentDashboard() {
  const { toast } = useToast();
  const { user } = useAuth();
  const userId = user?.id;
  const branchId = user?.branchId;
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [invoices, setInvoices] = useState<PortalInvoice[]>([]);
  const [results, setResults] = useState<PortalResult[]>([]);
  const [classes, setClasses] = useState<PortalClass[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!userId || !branchId) {
        setLoading(false);
        return;
      }
      try {
        const [profileRes, attendanceRes, invoicesRes, resultsRes, classesRes, noticesRes] = await Promise.all([
          getStudentProfile(userId, branchId),
          getStudentPortalAttendance(userId, branchId),
          getStudentPortalInvoices(userId, branchId),
          getStudentPortalResults(userId, branchId),
          getStudentPortalClasses(userId, branchId),
          getNotices(branchId),
        ]);

        if (!cancelled) {
          if (profileRes.success) setProfile(profileRes.data);
          if (attendanceRes.success) setAttendance(attendanceRes.data);
          if (invoicesRes.success) setInvoices(invoicesRes.data);
          if (resultsRes.success) setResults(resultsRes.data);
          if (classesRes.success) setClasses(classesRes.data);
          if (noticesRes.success) setNotices(noticesRes.data);
        }
      } catch (err) {
        if (!cancelled) {
          toast({ title: "Failed to load dashboard", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [userId, branchId, toast]);

  const presence = useMemo(() => {
    const total = attendance.length;
    const present = attendance.filter((r) => r.status === "PRESENT" || r.status === "LATE").length;
    const late = attendance.filter((r) => r.status === "LATE").length;
    const absent = attendance.filter((r) => r.status === "ABSENT").length;
    const percentage = total ? Math.round((present / total) * 1000) / 10 : 0;
    return { total, present, late, absent, percentage };
  }, [attendance]);

  /* The same rule the branch roster applies, so the student's own login and the
     office read one set of figures: the total is what the course costs, raised
     by anything billed on top of it. Overdue counts what is still open on a
     late invoice, not its face value — a part-paid invoice is not overdue for
     the amount already settled. */
  const fees = useMemo(() => {
    const billed = invoices.reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
    const standing = feeStanding({
      courseFee: profile?.courseFee,
      invoiced: billed,
      paid: invoices.reduce((sum, inv) => sum + Number(inv.paid || 0), 0),
    });
    const today = new Date().toISOString().slice(0, 10);
    const overdue = invoices
      .filter((inv) => inv.dueDate && inv.dueDate < today)
      .reduce((sum, inv) => sum + Number(inv.balance || 0), 0);
    return { billed, total: standing.total, paid: standing.paid, due: standing.balance, overdue };
  }, [invoices, profile]);

  const scores = useMemo(() => {
    const exams = results.map((r) => ({
      id: r.id,
      subject: r.exam?.subject || "Unknown",
      exam: r.exam?.name || "Unknown",
      examDate: r.exam?.examDate || "",
      marks: Number(r.marks || 0),
      maxMarks: Number(r.exam?.maxMarks || 100),
      passMarks: Number(r.exam?.passMarks || 40),
    }));
    const totalMarks = exams.reduce((sum, e) => sum + e.marks, 0);
    const totalMax = exams.reduce((sum, e) => sum + e.maxMarks, 0);
    const percentage = totalMax ? Math.round((totalMarks / totalMax) * 1000) / 10 : 0;
    return { exams, percentage };
  }, [results]);

  const agenda = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    return [...classes]
      .filter((item) => {
        const startsAt = toDate(item.day ? `${item.day}T${item.startTime || "00:00"}` : null);
        if (!startsAt) return true;
        return startsAt >= new Date(todayStr);
      })
      .sort((a, b) => {
        const aDate = toDate(a.day ? `${a.day}T${a.startTime || "00:00"}` : null);
        const bDate = toDate(b.day ? `${b.day}T${b.startTime || "00:00"}` : null);
        const aTime = aDate ? aDate.getTime() : 0;
        const bTime = bDate ? bDate.getTime() : 0;
        return aTime - bTime;
      });
  }, [classes]);

  const next = agenda[0];
  const recent = useMemo(() => [...results].sort((a, b) => {
    const aDate = toDate(a.exam?.examDate)?.getTime() || 0;
    const bDate = toDate(b.exam?.examDate)?.getTime() || 0;
    return bDate - aDate;
  }).slice(0, 4), [results]);


  const join = (item: PortalClass) => {
    // Live classes would have a link in a real implementation
    toast({ title: `Joining ${item.subject || "class"}`, description: "Opening class session." });
  };

  const stats = [
    { label: "Attendance", value: presence.total ? `${presence.percentage}%` : "—", note: presence.total ? `${presence.present + presence.late} of ${presence.total} sessions` : "No register taken yet", icon: CalendarCheck, to: "/me/attendance" },
    { label: "Fee balance", value: rupees(fees.due), note: fees.overdue ? `${rupees(fees.overdue)} overdue` : `${rupees(fees.paid)} paid of ${rupees(fees.total)}`, icon: IndianRupee, to: "/me/fees" },
    { label: "Average score", value: `${scores.percentage}%`, note: `${scores.exams.length} exams recorded`, icon: FileCheck, to: "/me/results" },
    { label: "Classes ahead", value: agenda.length, note: next ? `${next.day} ${next.startTime || ""}` : "nothing scheduled", icon: Video, to: "/me/classes" },
  ];

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <AppGreeting name={profile?.name?.split(" ")[0] || "Student"} title="Ready to learn today?" />
      <HeroCard
        badge={profile?.course || "My course"}
        headline={next ? `Next class: ${next.subject || "Class"}` : "No class scheduled"}
        accent={next ? `${next.day} ${next.startTime || ""}`.trim() : fees.due > 0 ? `${rupees(fees.due)} fee due` : undefined}
        note={[profile?.batch, profile?.branch, profile?.enrollmentNo && `Enrolment ${profile.enrollmentNo}`].filter(Boolean).join(" · ")}
        figures={[
          { value: presence.total ? `${presence.percentage}%` : "—", label: "Attendance", to: "/me/attendance" },
          { value: `${scores.percentage}%`, label: "Avg score", to: "/me/results" },
          { value: rupees(fees.due), label: "Fee due", to: "/me/fees" },
        ]}
        primary={{ label: "My courses", to: "/me/courses" }}
        secondary={{ label: "Live classes", to: "/me/classes" }}
      />
      <ServicesGrid />

      <section className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} to={stat.to} className="group">
            <Card className="h-full transition-colors hover:border-brand/40">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="eyebrow pt-1">{stat.label}</p>
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-brand/12 group-hover:text-brand-ink"><stat.icon className="h-4 w-4" /></span>
                </div>
                <p className="metric mt-4">{stat.value}</p>
                <p className="mt-3 text-xs text-muted-foreground">{stat.note}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>

      <section className="mb-5 grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div><CardTitle>Your timetable</CardTitle><p className="mt-1 text-xs text-muted-foreground">Live and upcoming sessions for {profile?.batch}</p></div>
            <Button variant="outline" size="sm" asChild><Link to="/me/classes">All classes</Link></Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {agenda.slice(0, 4).map((item) => (
              <div key={item.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/70 p-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2"><p className="truncate text-sm font-semibold">{item.subject}</p></div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{item.instructor} · {item.course}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{item.day} {item.startTime} - {item.endTime} · {item.roomNo}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => join(item)}>Join</Button>
              </div>
            ))}
            {!agenda.length && <p className="py-6 text-center text-sm text-muted-foreground">No sessions scheduled. Recordings of past classes are on the classes page.</p>}
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader><CardTitle>Attendance this term</CardTitle></CardHeader>
            <CardContent>
              <div className="mb-3 flex items-end gap-2.5"><span className="metric">{presence.total ? `${presence.percentage}%` : "—"}</span>{presence.total ? <span className={presence.percentage >= 75 ? "delta delta-up mb-1.5" : "delta delta-down mb-1.5"}>{presence.percentage >= 75 ? "Above requirement" : "Below 75%"}</span> : <span className="mb-1.5 text-xs text-muted-foreground">No register taken yet</span>}</div>
              <Progress value={presence.percentage} className="h-2" />
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {[{ label: "Present", value: presence.present }, { label: "Late", value: presence.late }, { label: "Absent", value: presence.absent }].map((cell) => (
                  <div key={cell.label} className="rounded-xl bg-muted/60 p-2"><p className="text-lg font-semibold tabular">{cell.value}</p><p className="text-[11px] text-muted-foreground">{cell.label}</p></div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0"><CardTitle>Fees</CardTitle><Button size="sm" asChild><Link to="/me/fees">Pay now</Link></Button></CardHeader>
            <CardContent>
              <p className="metric">₹{fees.due.toFixed(2)}</p>
              <p className="mt-1 text-xs text-muted-foreground">outstanding of ₹{fees.total.toFixed(2)} total fee · ₹{fees.paid.toFixed(2)} received</p>
              {fees.overdue > 0 && <p className="mt-3 rounded-xl border border-destructive/25 bg-destructive/10 p-2.5 text-xs text-destructive">₹{fees.overdue.toFixed(2)} is past its due date.</p>}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0"><CardTitle>Latest results</CardTitle><Button variant="ghost" size="sm" asChild><Link to="/me/results">Open<ArrowUpRight /></Link></Button></CardHeader>
          <CardContent className="space-y-1">
            {recent.map((result) => (
              <div key={result.id} className="flex items-center gap-3 border-b py-3 last:border-0">
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{result.exam?.subject || "Unknown"}</p><p className="text-xs text-muted-foreground">{result.exam?.name || "Unknown"} · {result.exam?.examDate ? new Date(result.exam.examDate).toLocaleDateString("en-IN") : ""}</p></div>
                <span className="tabular text-sm font-semibold">{Number(result.marks || 0)}/{result.exam?.maxMarks || 100}</span>
                <Badge variant={(result.marks || 0) >= (result.exam?.passMarks || 40) ? "secondary" : "destructive"}>{(result.marks || 0) >= (result.exam?.passMarks || 40) ? "Pass" : "Review"}</Badge>
              </div>
            ))}
            {!recent.length && <p className="py-6 text-center text-sm text-muted-foreground">No results published yet.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Megaphone className="h-4 w-4" />Notices</CardTitle></CardHeader>
          <CardContent className="space-y-1">
            {notices.map((notice) => (
              <div key={notice.id} className="border-b py-3 last:border-0">
                <p className="text-sm font-semibold">{notice.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{notice.content}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{notice.publishDate ? new Date(notice.publishDate).toLocaleDateString("en-IN") : ""}</p>
              </div>
            ))}
            {!notices.length && <p className="py-6 text-center text-sm text-muted-foreground">No notices at the moment.</p>}
          </CardContent>
        </Card>
      </section>
    </AppLayout>
  );
}
