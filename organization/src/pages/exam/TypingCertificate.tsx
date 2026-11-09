import { useEffect, useMemo, useState } from "react";
import { Keyboard, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { typingCertificatesPdf } from "@/lib/brand/brandDocuments";
import { franchiseLicenceOf, type BranchDetails } from "@/lib/branchTemplateDocument";
import { getBranchDetails, getBranches, getCourses, getStudents } from "@/lib/supabase/data";
import { supabase } from "@/lib/supabase/client";
import { photoOf, type StudentRecord } from "@/lib/studentRecord";

/**
 * The computer typing certificate: a typing course's completion with the
 * student's speed in English and Hindi, on the academy's letterhead
 * (lib/brand). The office enters the speeds; the rest comes from the record.
 */
export default function TypingCertificate() {
  const { user, view } = useAuth();
  const { toast } = useToast();
  const isBranch = view === "franchise";
  const ownBranch = isBranch ? user?.branchId ?? null : null;
  const organizationId = user?.organizationId ?? null;

  const [branches, setBranches] = useState<Array<{ id: string; name: string }>>([]);
  const [branchId, setBranchId] = useState(ownBranch || "");
  const [branch, setBranch] = useState<BranchDetails | null>(null);
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [courses, setCourses] = useState<Array<{ id: string; name: string; durationMonths?: number }>>([]);
  const [loading, setLoading] = useState(false);
  const [studentId, setStudentId] = useState("");

  const today = new Date().toISOString().slice(0, 10);
  // Blank means "take the next number": COCA/CERT/<year>/<n> and the YYMM serial, from the same series as every certificate.
  const [certificateNo, setCertificateNo] = useState("");
  const [serialNo, setSerialNo] = useState("");
  const [issueDate, setIssueDate] = useState(today);
  const [course, setCourse] = useState("TSA (Typing Speed & Accuracy)");
  const [duration, setDuration] = useState("");
  const [englishWpm, setEnglishWpm] = useState("");
  const [hindiWpm, setHindiWpm] = useState("");
  const [accuracy, setAccuracy] = useState("");
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
        setCourses((c.data ?? []) as Array<{ id: string; name: string; durationMonths?: number }>);
        setBranch((b.data ?? null) as BranchDetails | null);
      })
      .catch((e) => toast({ title: "Could not load students", description: e instanceof Error ? e.message : undefined, variant: "destructive" }))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [branchId, organizationId, toast]);

  const student = useMemo(() => students.find((s) => String(s.id) === studentId), [students, studentId]);
  const enrolled = useMemo(() => courses.find((c) => c.id === String(student?.courseId ?? "")), [courses, student]);

  // The record's own course fills the form when it is a typing course; the office may still edit it.
  useEffect(() => {
    if (!student) return;
    const name = enrolled?.name || String(student.courseName ?? "");
    if (/typing|tsa/i.test(name)) setCourse(name);
    const months = enrolled?.durationMonths;
    setDuration(months ? (months % 12 === 0 ? `${months / 12 === 1 ? "One" : months / 12} Year${months / 12 === 1 ? "" : "s"}` : `${months} Months`) : "");
  }, [student, enrolled]);

  const name = student ? [student.firstName, student.middleName, student.lastName].filter(Boolean).join(" ") : "";
  const licence = branch ? franchiseLicenceOf(branch) : null;

  const print = async () => {
    if (!student) return toast({ title: "Choose a student", variant: "destructive" });
    if (!englishWpm.trim() && !hindiWpm.trim()) return toast({ title: "Enter the typing speed", description: "At least one of English or Hindi words per minute.", variant: "destructive" });
    setBusy(true);
    try {
      let certNo = certificateNo.trim();
      let serial = serialNo.trim();
      if (!certNo || !serial) {
        const { data, error } = await supabase.rpc("allocate_certificate_numbers");
        if (error) throw new Error(`Could not take the next certificate number: ${error.message}`);
        const next = (data || {}) as { certificateNo?: string; serialNo?: string };
        certNo = certNo || String(next.certificateNo || "");
        serial = serial || String(next.serialNo || "");
        // Shown on the form, so a reprint uses the same numbers rather than taking new ones.
        setCertificateNo(certNo);
        setSerialNo(serial);
      }
      await typingCertificatesPdf(
        [
          {
            certificateNo: certNo,
            serialNo: serial,
            name,
            fatherName: String(student.fatherName ?? ""),
            registrationNo: String(student.enrollmentNo || student.applicationNo || ""),
            course: course.trim(),
            duration: duration.trim(),
            centre: licence?.centreName || String(branch?.name ?? ""),
            centreCode: licence?.branchCode || "",
            issueDate,
            englishWpm: englishWpm.trim(),
            hindiWpm: hindiWpm.trim(),
            accuracy: accuracy.trim(),
            photo: photoOf(student) || null,
          },
        ],
        `typing-certificate-${(student.enrollmentNo || student.applicationNo || name).toString().replace(/[^\w-]+/g, "-")}`,
      );
      toast({ title: "Typing certificate ready", description: `${name} — check your Downloads.` });
    } catch (e) {
      toast({ title: "Could not make the certificate", description: e instanceof Error ? e.message : undefined, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Typing Certificate"
        description="The computer typing certificate, on the academy's letterhead, with the student's speed in English and Hindi."
        breadcrumbs={[{ label: "Certificate & Marksheet" }, { label: "Typing Certificate" }]}
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
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
                <dt className="text-muted-foreground">Registration No.</dt><dd className="font-medium">{student.enrollmentNo || student.applicationNo || "—"}</dd>
                <dt className="text-muted-foreground">Father's name</dt><dd className="font-medium">{student.fatherName || "—"}</dd>
                <dt className="text-muted-foreground">Study centre</dt><dd className="font-medium">{licence?.centreName || branch?.name || "—"}</dd>
                <dt className="text-muted-foreground">ATP code</dt><dd className="font-medium">{licence?.branchCode || "—"}</dd>
                <dt className="text-muted-foreground">Photo</dt><dd className="font-medium">{photoOf(student) ? "On record" : "Not on record"}</dd>
              </dl>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Certificate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="certificateNo">Certificate No.</Label>
                <Input id="certificateNo" value={certificateNo} onChange={(e) => setCertificateNo(e.target.value)} placeholder="Auto — next COCA/CERT number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="serialNo">Sl. No.</Label>
                <Input id="serialNo" value={serialNo} onChange={(e) => setSerialNo(e.target.value)} placeholder="Auto — e.g. 26110001" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Date of issue</Label>
                <DatePicker value={issueDate} onChange={setIssueDate} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="course">Course name</Label>
                <Input id="course" value={course} onChange={(e) => setCourse(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Course duration</Label>
                <Input id="duration" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="6 Months" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="englishWpm">English speed (WPM)</Label>
                <Input id="englishWpm" inputMode="numeric" value={englishWpm} onChange={(e) => setEnglishWpm(e.target.value)} placeholder="45" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hindiWpm">Hindi speed (WPM)</Label>
                <Input id="hindiWpm" inputMode="numeric" value={hindiWpm} onChange={(e) => setHindiWpm(e.target.value)} placeholder="40" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accuracy">Accuracy (%)</Label>
                <Input id="accuracy" inputMode="numeric" value={accuracy} onChange={(e) => setAccuracy(e.target.value)} placeholder="96" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">A speed or accuracy left blank is not printed.</p>
            <Button className="w-full gap-2" onClick={print} disabled={busy || !student}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Keyboard className="h-4 w-4" />}
              Download typing certificate
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
