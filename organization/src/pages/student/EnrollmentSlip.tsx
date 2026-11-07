import { useEffect, useMemo, useState } from "react";
import { FileBadge, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { enrollmentSlipsPdf } from "@/lib/brand/brandDocuments";
import { franchiseLicenceOf, type BranchDetails } from "@/lib/branchTemplateDocument";
import { getBranchDetails, getBranches, getCourses, getStudents } from "@/lib/supabase/data";
import { photoOf, type StudentRecord } from "@/lib/studentRecord";

type Course = { id: string; name: string; durationMonths?: number };

/**
 * The enrollment slip: the academy's confirmation of a student's enrolment,
 * printed at admission (lib/brand drawEnrollmentSlip). Everything comes from
 * the record; the office may correct the session and duration before printing.
 */
export default function EnrollmentSlip() {
  const { user, view } = useAuth();
  const { toast } = useToast();
  const isBranch = view === "franchise";
  const ownBranch = isBranch ? user?.branchId ?? null : null;
  const organizationId = user?.organizationId ?? null;

  const [branches, setBranches] = useState<Array<{ id: string; name: string }>>([]);
  const [branchId, setBranchId] = useState(ownBranch || "");
  const [branch, setBranch] = useState<BranchDetails | null>(null);
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [session, setSession] = useState("");
  const [duration, setDuration] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isBranch) return;
    getBranches(organizationId)
      .then((r) => setBranches((r.data ?? []) as Array<{ id: string; name: string }>))
      .catch(() => setBranches([]));
  }, [isBranch, organizationId]);

  useEffect(() => {
    if (!branchId || !organizationId) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([
      getStudents(branchId, 1, 2000),
      getCourses(organizationId).catch(() => ({ data: [] })),
      getBranchDetails(organizationId, branchId).catch(() => ({ data: null })),
    ])
      .then(([s, c, b]) => {
        if (cancelled) return;
        setStudents(((s.data ?? []) as StudentRecord[]).filter((row) => row.id));
        setCourses((c.data ?? []) as Course[]);
        setBranch((b.data ?? null) as BranchDetails | null);
      })
      .catch((e) => toast({ title: "Could not load students", description: e instanceof Error ? e.message : undefined, variant: "destructive" }))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [branchId, organizationId, toast]);

  const student = useMemo(() => students.find((s) => String(s.id) === studentId), [students, studentId]);
  const course = useMemo(() => courses.find((c) => c.id === String(student?.courseId ?? "")), [courses, student]);

  useEffect(() => {
    if (!student) return;
    setSession(String(student.academicYear ?? ""));
    setDuration(course?.durationMonths ? `${course.durationMonths} Months` : "");
  }, [student, course]);

  const name = student ? [student.firstName, student.middleName, student.lastName].filter(Boolean).join(" ") : "";
  const licence = branch ? franchiseLicenceOf(branch) : null;

  const print = async () => {
    if (!student) return toast({ title: "Choose a student", variant: "destructive" });
    setBusy(true);
    try {
      const enrollmentNo = String(student.enrollmentNo || student.applicationNo || "");
      await enrollmentSlipsPdf(
        [
          {
            enrollmentNo,
            centreCode: licence?.branchCode || "",
            admissionDate: String(student.admissionDate || student.createdAt || new Date().toISOString()),
            name,
            dateOfBirth: String(student.dateOfBirth ?? ""),
            fatherName: String(student.fatherName ?? ""),
            motherName: String(student.motherName ?? ""),
            mobile: String(student.phone ?? student.fatherPhone ?? ""),
            course: course?.name || String(student.courseName ?? ""),
            duration: duration.trim(),
            session: session.trim(),
            centreName: licence?.centreName || String(branch?.name ?? ""),
            centreAddress: licence?.address || "",
            photo: photoOf(student) || null,
          },
        ],
        `enrollment-slip-${(enrollmentNo || name).replace(/[^\w-]+/g, "-")}`,
      );
      toast({ title: "Enrollment slip ready", description: `${name} — check your Downloads.` });
    } catch (e) {
      toast({ title: "Could not make the slip", description: e instanceof Error ? e.message : undefined, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Enrollment Slip"
        description="The slip handed to a student at admission: enrolment number, centre code, particulars and course, with a QR that confirms the enrolment online."
        breadcrumbs={[{ label: "Students" }, { label: "Enrollment Slip" }]}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Student</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isBranch && (
              <div className="space-y-2">
                <Label>Branch</Label>
                <Select value={branchId} onValueChange={(v) => { setBranchId(v); setStudentId(""); }}>
                  <SelectTrigger aria-label="Branch"><SelectValue placeholder="Choose a branch" /></SelectTrigger>
                  <SelectContent searchable searchPlaceholder="Search centre…">
                    {branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Student</Label>
              <Select value={studentId} onValueChange={setStudentId} disabled={!branchId || loading}>
                <SelectTrigger aria-label="Student"><SelectValue placeholder={loading ? "Loading…" : "Choose a student"} /></SelectTrigger>
                <SelectContent searchable searchPlaceholder="Search name or enrolment…">
                  {students.map((s) => (
                    <SelectItem key={String(s.id)} value={String(s.id)}>
                      {[s.firstName, s.lastName].filter(Boolean).join(" ")} · {s.enrollmentNo || s.applicationNo || "—"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {student && (
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1 rounded-lg border bg-muted/40 p-3 text-sm">
                <dt className="text-muted-foreground">Enrollment No.</dt><dd className="font-medium">{student.enrollmentNo || student.applicationNo || "—"}</dd>
                <dt className="text-muted-foreground">Course</dt><dd className="font-medium">{course?.name || String(student.courseName ?? "—")}</dd>
                <dt className="text-muted-foreground">Father's name</dt><dd className="font-medium">{student.fatherName || "—"}</dd>
                <dt className="text-muted-foreground">Mother's name</dt><dd className="font-medium">{String(student.motherName ?? "") || "—"}</dd>
                <dt className="text-muted-foreground">Centre</dt><dd className="font-medium">{licence?.centreName || branch?.name || "—"} · {licence?.branchCode || "—"}</dd>
                <dt className="text-muted-foreground">Photo</dt><dd className="font-medium">{photoOf(student) ? "On record" : "Not on record"}</dd>
              </dl>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Slip</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="session">Session</Label>
                <Input id="session" value={session} onChange={(e) => setSession(e.target.value)} placeholder="2026-27" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Course duration</Label>
                <Input id="duration" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="6 Months" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">A5 landscape — print at actual size, or two to an A4 sheet.</p>
            <Button className="w-full gap-2" onClick={print} disabled={busy || !student}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileBadge className="h-4 w-4" />}
              Download enrollment slip
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
