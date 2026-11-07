import { useEffect, useMemo, useState } from "react";
import { FileCheck2, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { verificationLetterPdf } from "@/lib/brand/brandDocuments";
import { getBranches, getCourses, getStudents } from "@/lib/supabase/data";
import type { StudentRecord } from "@/lib/studentRecord";
import { instituteName } from "@/lib/instituteName";

/**
 * The student education verification certificate: the letter an employer or
 * a government office asks the academy for, confirming that a student studied
 * here. Printed on the designer's letterhead (lib/brand).
 */
export default function VerificationLetter() {
  const { user, view } = useAuth();
  const { toast } = useToast();
  const isBranch = view === "franchise";
  const ownBranch = isBranch ? user?.branchId ?? null : null;

  const [branches, setBranches] = useState<Array<{ id: string; name: string }>>([]);
  const [branchId, setBranchId] = useState(ownBranch || "");
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [courses, setCourses] = useState<Array<{ id: string; name: string; durationMonths?: number }>>([]);
  const [loading, setLoading] = useState(false);
  const [studentId, setStudentId] = useState("");

  const today = new Date().toISOString().slice(0, 10);
  const [refNo, setRefNo] = useState(`COCA/LTR/${new Date().getFullYear()}/`);
  const [date, setDate] = useState(today);
  const [addressee, setAddressee] = useState("The Concerned Verification Officer\n");
  const [honorific, setHonorific] = useState("Mr.");
  const [session, setSession] = useState("");
  const [duration, setDuration] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isBranch) return;
    getBranches(user?.organizationId ?? null)
      .then((r) => setBranches((r.data ?? []) as Array<{ id: string; name: string }>))
      .catch(() => setBranches([]));
  }, [isBranch, user?.organizationId]);

  useEffect(() => {
    if (!branchId) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([getStudents(branchId, 1, 2000), getCourses(user?.organizationId ?? null).catch(() => ({ data: [] }))])
      .then(([s, c]) => {
        if (cancelled) return;
        setStudents(((s.data ?? []) as StudentRecord[]).filter((row) => row.id));
        setCourses((c.data ?? []) as Array<{ id: string; name: string; durationMonths?: number }>);
      })
      .catch((e) => toast({ title: "Could not load students", description: e instanceof Error ? e.message : undefined, variant: "destructive" }))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [branchId, user?.organizationId, toast]);

  const student = useMemo(() => students.find((s) => String(s.id) === studentId), [students, studentId]);
  const course = useMemo(() => courses.find((c) => c.id === String(student?.courseId ?? "")), [courses, student]);

  // The record's own answers fill the form as soon as a student is picked; the office may still edit them.
  useEffect(() => {
    if (!student) return;
    setSession(String(student.academicYear ?? ""));
    const months = course?.durationMonths;
    setDuration(months ? (months % 12 === 0 ? `${months / 12 === 1 ? "One" : months / 12} Year${months / 12 === 1 ? "" : "s"}` : `${months} Months`) : "");
    const gender = String(student.gender ?? "").toLowerCase();
    setHonorific(gender.startsWith("f") ? "Ms." : gender.startsWith("m") ? "Mr." : "");
  }, [student, course]);

  const name = student ? [student.firstName, student.middleName, student.lastName].filter(Boolean).join(" ") : "";
  const pronoun = honorific === "Ms." ? "her" : honorific === "Mr." ? "his" : "their";

  const print = async () => {
    if (!student) return toast({ title: "Choose a student", variant: "destructive" });
    if (!refNo.trim() || /\/$/.test(refNo.trim())) return toast({ title: "Enter the reference number", description: "Finish the Ref. No., e.g. COCA/LTR/2026/0007.", variant: "destructive" });
    setBusy(true);
    try {
      await verificationLetterPdf({
        refNo: refNo.trim(),
        date,
        addressee: addressee.split("\n").map((l) => l.trim()).filter(Boolean),
        studentName: name,
        honorific: honorific || undefined,
        pronoun,
        institution: instituteName(),
        course: course?.name || String(student.courseName ?? ""),
        enrollmentNo: String(student.enrollmentNo || student.applicationNo || ""),
        session,
        duration,
      });
      toast({ title: "Verification letter ready", description: `${name} — check your Downloads.` });
    } catch (e) {
      toast({ title: "Could not make the letter", description: e instanceof Error ? e.message : undefined, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Verification Letter"
        description="The student education verification certificate, on the academy's letterhead, for an employer or office that asks."
        breadcrumbs={[{ label: "Certificate & Marksheet" }, { label: "Verification Letter" }]}
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
                <dt className="text-muted-foreground">Enrolment No.</dt><dd className="font-medium">{student.enrollmentNo || student.applicationNo || "—"}</dd>
                <dt className="text-muted-foreground">Course</dt><dd className="font-medium">{course?.name || "—"}</dd>
                <dt className="text-muted-foreground">Father's name</dt><dd className="font-medium">{student.fatherName || "—"}</dd>
              </dl>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Letter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="refNo">Ref. No.</Label>
                <Input id="refNo" value={refNo} onChange={(e) => setRefNo(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <DatePicker value={date} onChange={setDate} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="addressee">Addressed to (one line each)</Label>
              <Textarea id="addressee" rows={3} value={addressee} onChange={(e) => setAddressee(e.target.value)} placeholder={"The Concerned Verification Officer\nBihar Secretariat, Government of Bihar."} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Addressed as</Label>
                <Select value={honorific || "none"} onValueChange={(v) => setHonorific(v === "none" ? "" : v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mr.">Mr. (his)</SelectItem>
                    <SelectItem value="Ms.">Ms. (her)</SelectItem>
                    <SelectItem value="none">No title (their)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="session">Session</Label>
                <Input id="session" value={session} onChange={(e) => setSession(e.target.value)} placeholder="2025 – 2026" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Course duration</Label>
                <Input id="duration" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="One Year" />
              </div>
            </div>
            <Button className="w-full gap-2" onClick={print} disabled={busy || !student}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileCheck2 className="h-4 w-4" />}
              Download verification letter
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
