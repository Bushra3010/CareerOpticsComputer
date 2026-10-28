import { useCallback, useEffect, useMemo, useState } from "react";
import { matchesSearch } from "@/lib/search";
import { useLocation } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { downloadCsv } from "@/lib/export";
import { printFromTemplate } from "@/lib/studentTemplateDocument";
import {
  admissionPdf,
  certificatePdf,
  marksheetPdf,
  marksheetSummary,
  type StudentDocument,
} from "@/lib/documents";
import { Award, Download, FileCheck2, GraduationCap, Save, type LucideIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { isExamCandidate, validExamMarks, validScore } from "@/lib/assessments";
import { newId } from "@/lib/id";
import {
  getExams,
  createExam,
  submitExamResults,
  getStudents,
  getCourses,
  getBatches,
  getBranches,
  getStudentDocument,
  getCertificateFee,
  getCertificateIssue,
  issueCertificate,
  type CertificateIssue,
} from "@/lib/supabase/data";
type Exam = {
  id: string;
  name: string;
  subject: string;
  examDate: string;
  maxMarks: number;
  passMarks: number;
  status: string;
  branchId: string;
  courseId: string;
  batchId?: string;
  course: { name: string };
  results: Array<{
    marks: number;
    studentId: string;
  }>;
};
type Student = {
  id: string;
  firstName: string;
  lastName: string;
  enrollmentNo?: string;
  branchId?: string;
  courseId?: string;
  courseIds?: string[];
  batchId?: string;
};
type Course = { id: string; name: string; code: string };
type Batch = { id: string; name: string; code: string; courseId: string };

const blankExam = {
  branchId: "",
  courseId: "",
  batchId: "",
  name: "",
  subject: "",
  examDate: "",
  maxMarks: "100",
  passMarks: "40",
};

/**
 * Nine sidebar links answer to this one screen. Until this existed they all
 * rendered `<Tabs defaultValue="results">`, so "Create exam", "Enter marks" and
 * "Student Documents" each dropped you on the results table with no sign that
 * the thing you clicked was a tab away.
 */
type AssessmentTab = "results" | "create" | "marks" | "documents";
const TAB_FOR_PATH: Record<string, AssessmentTab> = {
  "/exam/create": "create",
  "/exam/schedule": "create",
  "/exam/assign-marks": "marks",
  "/exam/marks-list": "results",
  "/exam/grade-management": "results",
  "/certificate/template": "documents",
  "/certificate/generate": "documents",
  "/marksheet/template": "documents",
  "/marksheet/generate": "documents",
};

export default function AssessmentsWorkspace() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const branchId = user?.branchId || null;
  const orgId = user?.organizationId || null;
  const { toast } = useToast();
  const [tab, setTab] = useState<AssessmentTab>(() => TAB_FOR_PATH[pathname] ?? "results");
  // Navigating between two links that share this screen changes the path
  // without remounting, so the tab has to follow the path.
  useEffect(() => {
    setTab(TAB_FOR_PATH[pathname] ?? "results");
  }, [pathname]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [studentId, setStudentId] = useState("");
  const [draft, setDraft] = useState(blankExam);
  const [creating, setCreating] = useState(false);
  const [marksExamId, setMarksExamId] = useState("");
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [documentBranch, setDocumentBranch] = useState("all");
  const [studentSearch, setStudentSearch] = useState("");
  const [documentRecord, setDocumentRecord] = useState<StudentDocument | null>(null);
  const [documentLoading, setDocumentLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [issueDate, setIssueDate] = useState(() => new Date().toLocaleDateString("en-CA"));
  const [examinationDate, setExaminationDate] = useState("");
  const documentStudents = students.filter((s) => (documentBranch === "all" || s.branchId === documentBranch)
    && matchesSearch(`${s.firstName} ${s.lastName} ${s.enrollmentNo || ""}`, studentSearch));
  useEffect(() => {
    let cancelled = false;
    setDocumentRecord(null);
    if (!studentId) return;
    setDocumentLoading(true);
    getStudentDocument(studentId, branchId).then((r) => { if (!cancelled) setDocumentRecord(r.data); })
      .catch((e) => { if (!cancelled) toast({ title: "Could not load student document", description: e.message, variant: "destructive" }); })
      .finally(() => { if (!cancelled) setDocumentLoading(false); });
    return () => { cancelled = true; };
  }, [studentId, branchId, toast]);
  const documentSummary = marksheetSummary(documentRecord?.examResults || []);
  // The centre's certificate price and whether this student's certificate has
  // already been issued (and so paid for): the first print takes the price from
  // the centre's wallet, every later one is free.
  const [certificateFee, setCertificateFee] = useState<{ fee: number; issued: CertificateIssue | null } | null>(null);
  const documentBranchId = documentRecord?.branchId || branchId;
  useEffect(() => {
    let cancelled = false;
    setCertificateFee(null);
    if (!studentId || !documentRecord) return;
    Promise.all([getCertificateFee(documentBranchId), getCertificateIssue(studentId)])
      .then(([fee, issued]) => { if (!cancelled) setCertificateFee({ fee, issued }); })
      .catch(() => { /* the note is a courtesy; the charge itself is checked on print */ });
    return () => { cancelled = true; };
  }, [studentId, documentRecord, documentBranchId]);

  /*
   * An organisation account belongs to no branch, and an exam must: the
   * branch is chosen first, and the courses and batches offered are that
   * branch's own. A branch account files the exam under its own branch.
   */
  const pickBranch = !branchId;
  const [branchOptions, setBranchOptions] = useState<Array<{ id: string; name: string }>>([]);
  const [branchCourses, setBranchCourses] = useState<Course[]>([]);
  const [branchBatches, setBranchBatches] = useState<Batch[]>([]);
  useEffect(() => {
    if (!pickBranch) return;
    getBranches(orgId)
      .then((r) => setBranchOptions((r.data as Array<{ id: string; name: string }>).map((b) => ({ id: String(b.id), name: String(b.name ?? "") }))))
      .catch(() => setBranchOptions([]));
  }, [pickBranch, orgId]);
  const chooseExamBranch = (id: string) => {
    setDraft((d) => ({ ...d, branchId: id, courseId: "", batchId: "" }));
    setBranchCourses([]);
    setBranchBatches([]);
    Promise.all([getCourses(orgId, id), getBatches(id)])
      .then(([c, b]) => {
        setBranchCourses(c.data as Course[]);
        setBranchBatches(b.data as Batch[]);
      })
      .catch((e) => toast({ title: "Could not load that branch's courses", description: e instanceof Error ? e.message : undefined, variant: "destructive" }));
  };
  const examBranch = branchId || draft.branchId;
  const examCourses = pickBranch ? branchCourses : courses;
  const examBatches = pickBranch ? branchBatches : batches;
  const load = useCallback(
    () =>
      Promise.all([
        getExams(branchId),
        getStudents(branchId, 1, 100),
        getCourses(orgId, branchId),
        getBatches(branchId),
      ])
        .then(([e, s, c, b]) => {
          setExams(e.data as Exam[]);
          setStudents(s.data as Student[]);
          setCourses(c.data as Course[]);
          setBatches(b.data as Batch[]);
          if (s.data[0]) setStudentId((current) => current || s.data[0].id);
        })
        .catch((e) =>
          toast({
            title: "Could not load academic records",
            description: e.message,
            variant: "destructive",
          }),
        ),
    [toast, branchId, orgId],
  );
  useEffect(() => {
    void load();
  }, [load]);
  const published = exams.filter((e) => e.status === "PUBLISHED");
  const results = useMemo(
    () => exams.flatMap((e) => e.results.map((r) => ({ ...r, exam: e }))),
    [exams],
  );
  const selectedExam = exams.find((e) => e.id === marksExamId);
  // The API rejects results for students outside the exam's course, so only
  // offer the students who are actually eligible.
  const examStudents = useMemo(
    () =>
      selectedExam
        ? students.filter((s) => isExamCandidate(s, selectedExam))
        : [],
    [students, selectedExam],
  );

  const handleCreateExam = async () => {
    setCreating(true);
    try {
      // The columns `exams` actually has. This sent examType, totalMarks and
      // passingMarks, none of which exist, and left out the required course.
      await createExam(examBranch, {
          id: newId("exam"),
          name: draft.name,
          subject: draft.subject,
          courseId: draft.courseId,
          maxMarks: Number(draft.maxMarks),
          passMarks: Number(draft.passMarks),
          examDate: draft.examDate,
          status: "SCHEDULED",
          updatedAt: new Date().toISOString(),
          ...(draft.batchId ? { batchId: draft.batchId } : {}),
        });
      toast({
        title: "Exam scheduled",
        description: `${draft.name} was created successfully.`,
      });
      // The branch stays chosen: the next exam is usually for the same one.
      setDraft({ ...blankExam, branchId: draft.branchId });
      await load();
    } catch (e) {
      toast({
        title: "Could not create exam",
        description: e instanceof Error ? e.message : "Try again",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const saveMarks = async (publish: boolean) => {
    if (!selectedExam) return;
    const results = Object.entries(marks)
      .filter(([id]) => examStudents.some((s) => s.id === id))
      .filter(([, value]) => value !== "")
      .map(([student, value]) => ({ studentId: student, marks: Number(value) }));
    if (!results.length) {
      toast({
        title: "Nothing to save",
        description: "Enter marks for at least one student.",
        variant: "destructive",
      });
      return;
    }
    if (results.some((r) => !validScore(r.marks, selectedExam.maxMarks))) {
      toast({ title: "Invalid marks", description: `Enter a number between 0 and ${selectedExam.maxMarks}.`, variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await submitExamResults(selectedExam.id, branchId, results, publish);
      toast({
        title: publish ? "Results published" : "Marks saved",
        description: `${results.length} student result(s) recorded.`,
      });
      await load();
    } catch (e) {
      toast({
        title: "Could not save marks",
        description: e instanceof Error ? e.message : "Try again",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const generate = async (kind: "admission" | "marksheet" | "certificate") => {
    if (!studentId || generating || !issueDate) return;
    setGenerating(true);
    try {
      const body: { data: StudentDocument } = await getStudentDocument(studentId, branchId);
      body.data = { ...body.data, issueDate, examinationDate };
      if (kind !== "admission" && !body.data.examResults.length) throw new Error("Publish this student's exam results before generating documents.");
      if (kind === "certificate" && marksheetSummary(body.data.examResults).result !== "Pass") throw new Error("The student must pass every published paper before receiving a completion certificate.");
      if (kind === "certificate" && !body.data.course?.name) throw new Error("Assign the student's course first.");
      // The centre pays for the certificate before it is printed, once per
      // student; a wallet that cannot cover it stops the print here.
      let charged = "";
      if (kind === "certificate") {
        const charge = await issueCertificate(studentId, user?.name);
        if (charge.charged) charged = ` ₹${charge.amount.toLocaleString("en-IN")} was deducted from the centre wallet.`;
        setCertificateFee((prev) => ({
          fee: prev?.fee ?? charge.amount,
          issued: prev?.issued ?? { amount: charge.amount, issuedAt: new Date().toISOString() },
        }));
      }
      // The institute's own template first: a certificate or marksheet the
      // office designed and gave this branch beats the layout written into
      // documents.ts, which is the same for everyone using this app.
      const printed =
        kind === "admission"
          ? false
          : await printFromTemplate(
              kind === "certificate" ? "certificate" : "marksheet",
              body.data,
              user?.organizationId ?? null,
              body.data.branchId || branchId,
            );
      if (printed) {
        toast({
          title: "Document ready",
          description: `The ${kind} was printed from your branch's template.${charged}`,
        });
        return;
      }
      // `marksheetPdf` is async — it renders a QR before saving. Awaiting the
      // lot keeps the "ready in Downloads" toast honest and routes a failure
      // into the catch below rather than leaving it unhandled.
      await ({
        admission: admissionPdf,
        marksheet: marksheetPdf,
        certificate: certificatePdf,
      })[kind](body.data);
      toast({
        title: "PDF generated",
        description: `The ${kind} is ready in Downloads.${charged}`,
      });
    } catch (e) {
      toast({
        title: "Document failed",
        description: e instanceof Error ? e.message : "Try again",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };
  return (
    <AppLayout>
      <PageHeader
        title="Assessments & Documents"
        description="One workspace from examination to verified student documents"
        breadcrumbs={[
          { label: "Academics" },
          { label: "Assessments & Documents" },
        ]}
      />
      <div className="mb-5 grid gap-3 md:grid-cols-3">
        {(
          [
            ["Published exams", published.length, FileCheck2],
            ["Recorded results", results.length, GraduationCap],
            ["Students with published results", new Set(published.flatMap((e) => e.results.map((r) => r.studentId))).size, Award],
          ] satisfies Array<[string, number, LucideIcon]>
        ).map(([label, value, Icon]) => (
          <Card key={label}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="mt-1 text-2xl font-semibold">{value}</p>
              </div>
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand text-brand-foreground">
                <Icon className="h-4 w-4" />
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
      <Tabs value={tab} onValueChange={(value) => setTab(value as AssessmentTab)}>
        <TabsList>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="create">Create exam</TabsTrigger>
          <TabsTrigger value="marks">Enter marks</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        <TabsContent value="results">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap justify-between gap-3"><CardTitle>Exam results</CardTitle><Button variant="outline" disabled={!results.length} onClick={() => downloadCsv("exam-results.csv", results.map((r) => { const s = students.find((s) => s.id === r.studentId); return { Enrollment: s?.enrollmentNo || "", Student: s ? `${s.firstName} ${s.lastName}` : r.studentId, Exam: r.exam.name, Subject: r.exam.subject, Date: r.exam.examDate, Maximum: r.exam.maxMarks, PassMarks: r.exam.passMarks, Marks: r.marks, Result: r.marks >= r.exam.passMarks ? "Pass" : "Fail", Status: r.exam.status }; }))}><Download className="mr-2 h-4 w-4" />Export marks report</Button></div>
            </CardHeader>
            <CardContent className="space-y-3">
              {exams.map((e) => (
                <div key={e.id} className="rounded-2xl border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{e.subject}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(e.examDate).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                    <Badge>{e.status.replace("_", " ")}</Badge>
                  </div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {e.results.map((r) => {
                      const student = students.find((s) => s.id === r.studentId);
                      return (
                        <div
                          key={r.studentId}
                          className="rounded-xl bg-muted/60 p-3"
                        >
                          <p className="text-sm font-medium">
                            {student?.firstName || "Student"} {student?.lastName || ""}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {student?.enrollmentNo || r.studentId.slice(0, 8)}
                          </p>
                          <p className="mt-2 text-lg font-semibold">
                            {r.marks}/{e.maxMarks}{" "}
                            <span
                              className={
                                r.marks >= e.passMarks
                                  ? "text-emerald-600"
                                  : "text-orange-600"
                              }
                            >
                              {r.marks >= e.passMarks ? "Pass" : "Review"}
                            </span>
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Schedule an exam</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-w-2xl space-y-4">
                {pickBranch && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Branch *</Label>
                      <Select value={draft.branchId} onValueChange={chooseExamBranch}>
                        <SelectTrigger aria-label="Branch">
                          <SelectValue placeholder="Select branch" />
                        </SelectTrigger>
                        <SelectContent searchable searchPlaceholder="Search centre…">
                          {branchOptions.map((b) => (
                            <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Course *</Label>
                    <Select
                      disabled={pickBranch && !draft.branchId}
                      value={draft.courseId}
                      onValueChange={(courseId) =>
                        setDraft((d) => ({ ...d, courseId, batchId: "" }))
                      }
                    >
                      <SelectTrigger aria-label="Course">
                        <SelectValue placeholder={pickBranch && !draft.branchId ? "Select a branch first" : "Select course"} />
                      </SelectTrigger>
                      <SelectContent>
                        {examCourses.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name} · {c.code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Batch</Label>
                    <Select
                      value={draft.batchId}
                      onValueChange={(batchId) =>
                        setDraft((d) => ({ ...d, batchId }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Optional" />
                      </SelectTrigger>
                      <SelectContent>
                        {examBatches
                          .filter((b) => b.courseId === draft.courseId)
                          .map((b) => (
                            <SelectItem key={b.id} value={b.id}>
                              {b.name} · {b.code}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="examName">Exam name *</Label>
                    <Input
                      id="examName"
                      placeholder="e.g. Mid-Term Examination"
                      value={draft.name}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, name: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="examSubject">Subject *</Label>
                    <Input
                      id="examSubject"
                      placeholder="e.g. Mathematics"
                      value={draft.subject}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, subject: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="examDate">Exam date *</Label>
                    <DatePicker value={draft.examDate} onChange={(v) => setDraft((d) => ({ ...d, examDate: v }))} id="examDate" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxMarks">Maximum marks *</Label>
                    <Input
                      id="maxMarks"
                      type="number"
                      min={1}
                      value={draft.maxMarks}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, maxMarks: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passMarks">Pass marks *</Label>
                    <Input
                      id="passMarks"
                      type="number"
                      min={0}
                      value={draft.passMarks}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, passMarks: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <Button
                  className="gap-2"
                  disabled={
                    creating ||
                    !examBranch ||
                    !draft.courseId ||
                    draft.name.trim().length < 2 ||
                    draft.subject.trim().length < 2 ||
                    !draft.examDate ||
                    !validExamMarks(Number(draft.maxMarks), Number(draft.passMarks))
                  }
                  onClick={handleCreateExam}
                >
                  <Save className="h-4 w-4" />
                  {creating ? "Creating…" : "Create exam"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="marks">
          <Card>
            <CardHeader>
              <CardTitle>Enter marks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="max-w-xl space-y-2">
                <Label>Exam</Label>
                <Select
                  value={marksExamId}
                  onValueChange={(id) => {
                    setMarksExamId(id);
                    const exam = exams.find((e) => e.id === id);
                    setMarks(
                      Object.fromEntries(
                        (exam?.results ?? []).map((r) => [
                          r.studentId,
                          String(r.marks),
                        ]),
                      ),
                    );
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an exam" />
                  </SelectTrigger>
                  <SelectContent>
                    {exams.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.subject} · {e.course.name} ·{" "}
                        {new Date(e.examDate).toLocaleDateString("en-IN")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedExam && (
                <>
                  <p className="text-sm text-muted-foreground">
                    {selectedExam.name} — maximum {selectedExam.maxMarks}, pass
                    mark {selectedExam.passMarks}. Leave a field blank to skip
                    that student.
                  </p>
                  {examStudents.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No students are enrolled in {selectedExam.course.name} yet.
                    </p>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {examStudents.map((s) => (
                        <div
                          key={s.id}
                          className="flex items-center justify-between gap-3 rounded-xl border p-3"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {s.firstName} {s.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {s.enrollmentNo || "Pending"}
                            </p>
                          </div>
                          <Input
                            type="number"
                            className="w-24"
                            min={0}
                            max={selectedExam.maxMarks}
                            placeholder="—"
                            value={marks[s.id] ?? ""}
                            onChange={(e) =>
                              setMarks((m) => ({ ...m, [s.id]: e.target.value }))
                            }
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 border-t pt-4">
                    <Button
                      variant="outline"
                      className="gap-2"
                      disabled={saving || examStudents.length === 0}
                      onClick={() => saveMarks(false)}
                    >
                      <Save className="h-4 w-4" />
                      {saving ? "Saving…" : "Save marks"}
                    </Button>
                    <Button
                      className="gap-2"
                      disabled={saving || examStudents.length === 0}
                      onClick={() => saveMarks(true)}
                    >
                      <FileCheck2 className="h-4 w-4" />
                      Save &amp; publish results
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Generate verified documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pickBranch && <div className="max-w-xl space-y-2"><Label>Centre / Branch</Label><Select value={documentBranch} onValueChange={(id) => { setDocumentBranch(id); setStudentId(""); }}><SelectTrigger aria-label="Document branch"><SelectValue /></SelectTrigger><SelectContent searchable searchPlaceholder="Search centre…"><SelectItem value="all">All branches</SelectItem>{branchOptions.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent></Select></div>}
                <Input aria-label="Search document students" placeholder="Search student name or enrollment number" value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)} className="max-w-xl" />
                <div className="max-w-xl">
                  <p className="mb-2 text-sm font-medium">Student record</p>
                  <Select value={studentId} onValueChange={setStudentId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent searchable searchPlaceholder="Search student or enrollment…">
                      {documentStudents.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.firstName} {s.lastName} ·{" "}
                          {s.enrollmentNo || "Pending"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid max-w-xl gap-4 sm:grid-cols-2">
                  <div className="space-y-2"><Label htmlFor="documentIssueDate">Issue date *</Label><DatePicker id="documentIssueDate" value={issueDate} onChange={setIssueDate} /></div>
                  <div className="space-y-2"><Label htmlFor="documentExamDate">Examination conducted date</Label><DatePicker id="documentExamDate" value={examinationDate} onChange={setExaminationDate} /></div>
                </div>
                {documentLoading && <p className="text-sm text-muted-foreground">Loading published results…</p>}
                {documentRecord && <div className="rounded-xl border p-4 space-y-3">
                  <div className="flex flex-wrap justify-between gap-2"><div><p className="font-semibold">{documentRecord.firstName} {documentRecord.lastName}</p><p className="text-sm text-muted-foreground">{documentRecord.course?.name} · {documentRecord.branch.name}</p></div><Badge>{documentSummary.result} · {documentSummary.total}/{documentSummary.max}</Badge></div>
                  <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left"><th className="p-2">Subject</th><th className="p-2">Exam</th><th className="p-2">Maximum</th><th className="p-2">Pass marks</th><th className="p-2">Obtained</th><th className="p-2">Result</th></tr></thead><tbody>{documentRecord.examResults.map((r, i) => <tr className="border-b" key={i}><td className="p-2">{r.exam.subject}</td><td className="p-2">{r.exam.name}</td><td className="p-2">{r.exam.maxMarks}</td><td className="p-2">{r.exam.passMarks}</td><td className="p-2 font-medium">{r.marks}</td><td className="p-2">{r.marks >= r.exam.passMarks ? "Pass" : "Fail"}</td></tr>)}</tbody></table></div>
                  {!documentRecord.examResults.length && <p className="text-sm text-muted-foreground">No published results. Enter marks and publish the exam before issuing a marksheet or certificate.</p>}
                </div>}
                <div className="grid max-w-xl gap-3 sm:grid-cols-3">
                  {(
                    [
                      ["Admission summary", "admission"],
                      ["Marksheet", "marksheet"],
                      ["Certificate", "certificate"],
                    ] satisfies Array<
                      [string, "admission" | "marksheet" | "certificate"]
                    >
                  ).map(([label, kind]) => (
                    <Button
                      key={kind}
                      variant="outline"
                      className="h-24 flex-col gap-2"
                      disabled={!documentRecord || documentLoading || generating || !issueDate || (kind !== "admission" && !documentRecord.examResults.length) || (kind === "certificate" && documentSummary.result !== "Pass")}
                      onClick={() => generate(kind)}
                    >
                      <Download className="h-5 w-5" />
                      {label}
                    </Button>
                  ))}
                </div>
                {documentRecord && certificateFee && (
                  <p className="text-sm text-muted-foreground">
                    {certificateFee.issued
                      ? `Certificate already issued${certificateFee.issued.amount ? ` (₹${certificateFee.issued.amount.toLocaleString("en-IN")} charged)` : ""} — printing it again is free.`
                      : certificateFee.fee > 0
                        ? `Generating the certificate deducts ₹${certificateFee.fee.toLocaleString("en-IN")} from ${documentRecord.branch.name}'s wallet.`
                        : "No certificate fee is set for this centre."}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Documents use live admission, course, payment, and published
                  result records. PDF files are generated locally and are
                  print-ready.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
