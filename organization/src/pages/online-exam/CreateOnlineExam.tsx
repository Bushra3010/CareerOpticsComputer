import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Upload, Download } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { DateTimePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { downloadCsv, parseCsv, pickFile } from "@/lib/export";
import { richTextToPlain } from "@/lib/rich-text";
import { termLabel, termPlan, termsOf } from "@/lib/examWorkflow";
import {
  PHASE_LABELS,
  blankQuestion,
  examPhase,
  examProblem,
  maxScore,
  newQuestionId,
  optionLetter,
  questionCount,
  questionsFromRows,
  whenShown,
  type ExamQuestion,
  type ExamStatus,
  type OnlineExam,
} from "@/lib/onlineExam";
import {
  deleteOnlineExam,
  getOnlineExams,
  saveOnlineExam,
  setOnlineExamStatus,
  type OnlineExamInput,
} from "@/lib/supabase/onlineExams";
import { QUESTION_BANK_KEY, type Question as BankQuestion } from "./AddQuestions";
import { useExamData } from "../exam/useExamData";

const blankExam = (): OnlineExamInput => ({
  title: "",
  description: "",
  courseId: "",
  term: 1,
  totalQuestions: 0,
  marksPerQuestion: 1,
  negativeMarks: 0,
  passPercentage: 40,
  durationMinutes: 60,
  startAt: "",
  endAt: "",
  shuffleQuestions: true,
  showResult: true,
  status: "PUBLISHED",
  questions: [],
});

/** An ISO instant as the date-time picker holds it: local "yyyy-mm-ddThh:mm". */
const toLocalInput = (iso: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const two = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}T${two(d.getHours())}:${two(d.getMinutes())}`;
};

/** The multiple-choice questions saved in the question bank, as exam questions. */
const bankQuestions = (): ExamQuestion[] => {
  try {
    const raw = localStorage.getItem(QUESTION_BANK_KEY);
    const bank = raw ? (JSON.parse(raw) as BankQuestion[]) : [];
    return bank
      .filter((q) => q.type === "mcq" && Array.isArray(q.options) && q.options.length >= 2)
      .map((q) => ({
        id: newQuestionId(),
        text: richTextToPlain(q.text || ""),
        options: (q.options || []).map((o) => richTextToPlain(o)),
        answer: Number(q.answer) || 0,
        marks: Number(q.marks) > 0 ? Number(q.marks) : null,
      }));
  } catch {
    return [];
  }
};

const PHASE_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  LIVE: "default",
  UPCOMING: "secondary",
  DRAFT: "outline",
  ENDED: "outline",
  CLOSED: "destructive",
};

/**
 * The head office's online exams: a multiple-choice paper with its marks,
 * timing and window, and the questions themselves. Saved exams are assigned
 * to centres and students under Assign Exam, and sat from the student portal.
 */
export default function OnlineExams() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isAdmin, courses, courseOf } = useExamData();
  const [exams, setExams] = useState<OnlineExam[]>([]);
  const [draft, setDraft] = useState<OnlineExamInput>(blankExam);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setExams(await getOnlineExams());
    } catch (e) {
      toast({ title: "Could not load exams", description: e instanceof Error ? e.message : "", variant: "destructive" });
    }
  }, [toast]);
  useEffect(() => {
    void load();
  }, [load]);

  const course = courseOf.get(draft.courseId) || null;
  const terms = useMemo(() => termsOf(course), [course]);
  const set = <K extends keyof OnlineExamInput>(key: K, value: OnlineExamInput[K]) => setDraft((d) => ({ ...d, [key]: value }));
  const setQuestion = (index: number, patch: Partial<ExamQuestion>) =>
    setDraft((d) => ({ ...d, questions: d.questions.map((q, i) => (i === index ? { ...q, ...patch } : q)) }));
  const setOption = (index: number, option: number, value: string) =>
    setDraft((d) => ({
      ...d,
      questions: d.questions.map((q, i) => (i === index ? { ...q, options: q.options.map((o, n) => (n === option ? value : o)) } : q)),
    }));
  const addQuestions = (list: ExamQuestion[]) => setDraft((d) => ({ ...d, questions: [...d.questions, ...list] }));
  const removeQuestion = (index: number) => setDraft((d) => ({ ...d, questions: d.questions.filter((_, i) => i !== index) }));

  const importBank = () => {
    const list = bankQuestions();
    if (!list.length) return toast({ title: "No multiple-choice questions in the question bank", description: "Add some under Question Bank first." });
    addQuestions(list);
    toast({ title: `${list.length} question(s) added from the question bank` });
  };

  const importCsv = async () => {
    const file = await pickFile(".csv,text/csv");
    if (!file) return;
    const { questions, problems } = questionsFromRows(parseCsv(file.text));
    if (questions.length) addQuestions(questions);
    toast({
      title: questions.length ? `${questions.length} question(s) added from ${file.name}` : "Nothing could be read",
      description: problems.length ? `${problems.length} row(s) skipped: ${problems.slice(0, 3).join(" ")}` : undefined,
      variant: questions.length ? "default" : "destructive",
    });
  };

  const sampleCsv = () =>
    downloadCsv("online-exam-questions-sample", [
      { question: "Which key copies the selected text?", option1: "Ctrl+C", option2: "Ctrl+V", option3: "Ctrl+X", option4: "Ctrl+Z", answer: "A", marks: "1" },
      { question: "HTML stands for?", option1: "Hyper Text Markup Language", option2: "High Text Machine Language", option3: "Hyperlinks Text Mark Language", option4: "None", answer: "1", marks: "" },
    ]);

  const save = async () => {
    const problem = examProblem(draft);
    if (problem) return toast({ title: "Could not save exam", description: problem, variant: "destructive" });
    setSaving(true);
    try {
      await saveOnlineExam(draft, { name: user?.name, organizationId: user?.organizationId });
      toast({ title: draft.id ? "Exam updated" : "Exam saved", description: `${draft.title} · ${draft.questions.length} question(s)` });
      setDraft(blankExam());
      await load();
    } catch (e) {
      toast({ title: "Could not save exam", description: e instanceof Error ? e.message : "", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const edit = (exam: OnlineExam) => {
    setDraft({ ...exam, startAt: toLocalInput(exam.startAt), endAt: toLocalInput(exam.endAt) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const setStatus = async (exam: OnlineExam, status: ExamStatus) => {
    try {
      await setOnlineExamStatus(exam.id, status);
      await load();
    } catch (e) {
      toast({ title: "Could not change the exam", description: e instanceof Error ? e.message : "", variant: "destructive" });
    }
  };

  const remove = async (exam: OnlineExam) => {
    if (!window.confirm(`Delete "${exam.title}"? Students' sittings of it will no longer be listed.`)) return;
    try {
      await deleteOnlineExam(exam.id);
      if (draft.id === exam.id) setDraft(blankExam());
      await load();
    } catch (e) {
      toast({ title: "Could not delete", description: e instanceof Error ? e.message : "", variant: "destructive" });
    }
  };

  type Row = OnlineExam & { courseName: string; termName: string; phase: string; questionsShown: string; window: string; marks: number };
  const rows: Row[] = exams.map((e) => {
    const c = courseOf.get(e.courseId);
    return {
      ...e,
      courseName: c?.name || "Any course",
      termName: c ? termLabel(termPlan(c).type, e.term) : "",
      phase: PHASE_LABELS[examPhase(e)],
      questionsShown: `${questionCount(e)} of ${e.questions.length}`,
      window: e.startAt || e.endAt ? `${whenShown(e.startAt)} → ${whenShown(e.endAt)}` : "Any time",
      marks: maxScore(e),
    };
  });
  const columns: Column<Row>[] = [
    { key: "title", header: "Exam", sortable: true, cell: (r) => <span className="font-medium">{r.title}</span> },
    { key: "courseName", header: "Course", cell: (r) => <span>{r.courseName}{r.termName ? <span className="block text-xs text-muted-foreground">{r.termName}</span> : null}</span> },
    { key: "questionsShown", header: "Questions", cell: (r) => <span className="text-xs">{r.questionsShown} · {r.marks} marks</span> },
    { key: "durationMinutes", header: "Duration", cell: (r) => `${r.durationMinutes} min` },
    { key: "window", header: "Window", cell: (r) => <span className="text-xs">{r.window}</span> },
    { key: "phase", header: "Status", cell: (r) => <Badge variant={PHASE_VARIANT[examPhase(r)]}>{r.phase}</Badge> },
  ];

  const field = (label: string, child: React.ReactNode, span = "") => (
    <div className={`space-y-2 ${span}`}>
      <Label>{label}</Label>
      {child}
    </div>
  );
  const number = (key: "totalQuestions" | "marksPerQuestion" | "negativeMarks" | "passPercentage" | "durationMinutes", label: string, step = 1, min = 0) =>
    field(label, <Input type="number" min={min} step={step} aria-label={label} value={draft[key]} onChange={(e) => set(key, Number(e.target.value))} />);

  return (
    <AppLayout>
      <PageHeader
        title="Online Exams"
        description="Set multiple-choice exams with their timing and marks; assign them to centres and students, who sit them in their portal"
        breadcrumbs={[{ label: "Online Exam" }, { label: "Exams" }]}
      />
      {isAdmin && (
        <Card className="mb-4">
          <CardHeader><CardTitle>{draft.id ? "Edit exam" : "Create exam"}</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {field("Exam title *", <Input aria-label="Exam title" value={draft.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. ADCA 1st Year Online Test" />, "lg:col-span-2")}
              {field(
                "Course",
                <Select value={draft.courseId || "any"} onValueChange={(v) => setDraft((d) => ({ ...d, courseId: v === "any" ? "" : v, term: 1 }))}>
                  <SelectTrigger aria-label="Course"><SelectValue placeholder="Any course" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any course</SelectItem>
                    {courses.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>,
              )}
              {field(
                "Year / Semester",
                <Select value={String(draft.term)} onValueChange={(v) => set("term", Number(v))} disabled={!course}>
                  <SelectTrigger aria-label="Year / Semester"><SelectValue /></SelectTrigger>
                  <SelectContent>{terms.map((t) => <SelectItem key={t.term} value={String(t.term)}>{t.label}</SelectItem>)}</SelectContent>
                </Select>,
              )}
              {number("durationMinutes", "Duration (minutes) *", 1, 1)}
              {number("totalQuestions", "Questions per student (0 = all)")}
              {number("marksPerQuestion", "Marks per question", 0.5)}
              {number("negativeMarks", "Negative marks per wrong answer", 0.25)}
              {number("passPercentage", "Pass percentage")}
              {field("Opens at", <DateTimePicker id="exam-opens" value={draft.startAt} onChange={(v) => set("startAt", v)} />)}
              {field("Closes at", <DateTimePicker id="exam-closes" value={draft.endAt} onChange={(v) => set("endAt", v)} defaultTime="18:00" />)}
              {field(
                "Status",
                <Select value={draft.status} onValueChange={(v) => set("status", v as ExamStatus)}>
                  <SelectTrigger aria-label="Status"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUBLISHED">Published — students may sit it</SelectItem>
                    <SelectItem value="DRAFT">Draft — not shown to students</SelectItem>
                    <SelectItem value="CLOSED">Closed — no new sittings</SelectItem>
                  </SelectContent>
                </Select>,
              )}
              {field("Instructions", <Textarea rows={2} aria-label="Instructions" value={draft.description} onChange={(e) => set("description", e.target.value)} placeholder="Shown to the student before they start" />, "sm:col-span-2 lg:col-span-4")}
            </div>
            <div className="flex flex-wrap gap-6 text-sm">
              <label className="flex items-center gap-2"><Switch checked={draft.shuffleQuestions} onCheckedChange={(v) => set("shuffleQuestions", v)} aria-label="Shuffle questions" /> Shuffle questions for each student</label>
              <label className="flex items-center gap-2"><Switch checked={draft.showResult} onCheckedChange={(v) => set("showResult", v)} aria-label="Show result to student" /> Show the result to the student on submission</label>
            </div>

            <div className="space-y-3 rounded-xl border p-3 sm:p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-semibold">
                  Questions <Badge variant="secondary" className="ml-1">{draft.questions.length}</Badge>
                  <span className="ml-2 text-xs font-normal text-muted-foreground">A student gets {draft.totalQuestions > 0 ? Math.min(draft.totalQuestions, draft.questions.length) : draft.questions.length} of them · {maxScore(draft)} marks</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => addQuestions([blankQuestion()])}><Plus className="mr-1 h-4 w-4" /> Add question</Button>
                  <Button type="button" variant="outline" size="sm" onClick={importBank}>Add from question bank</Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => void importCsv()}><Upload className="mr-1 h-4 w-4" /> Upload CSV</Button>
                  <Button type="button" variant="ghost" size="sm" onClick={sampleCsv}><Download className="mr-1 h-4 w-4" /> Sample CSV</Button>
                </div>
              </div>
              {!draft.questions.length && <p className="text-sm text-muted-foreground">No questions yet. Add them one by one, from the question bank, or upload a CSV with columns question, option1–option4, answer (A–D or 1–4) and marks.</p>}
              {draft.questions.map((q, i) => (
                <div key={q.id} className="space-y-2 rounded-lg bg-muted/40 p-3">
                  <div className="flex items-start gap-2">
                    <span className="mt-2 w-7 shrink-0 text-sm font-semibold text-muted-foreground">{i + 1}.</span>
                    <Textarea rows={2} aria-label={`Question ${i + 1}`} value={q.text} onChange={(e) => setQuestion(i, { text: e.target.value })} placeholder="Question wording" className="bg-background" />
                    <div className="w-24 shrink-0 space-y-1">
                      <Input type="number" min={0} step={0.5} aria-label={`Question ${i + 1} marks`} value={q.marks ?? ""} placeholder={String(draft.marksPerQuestion)} onChange={(e) => setQuestion(i, { marks: e.target.value === "" ? null : Number(e.target.value) })} className="bg-background" />
                      <span className="block text-[10px] text-muted-foreground">marks</span>
                    </div>
                    <Button type="button" variant="ghost" size="icon" aria-label={`Remove question ${i + 1}`} onClick={() => removeQuestion(i)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                  <div className="grid gap-2 pl-9 sm:grid-cols-2">
                    {q.options.map((o, n) => (
                      <label key={n} className={`flex items-center gap-2 rounded-md border bg-background px-2 ${q.answer === n ? "border-primary" : ""}`}>
                        <input
                          type="radio"
                          name={`answer-${q.id}`}
                          aria-label={`Question ${i + 1} option ${optionLetter(n)} is correct`}
                          checked={q.answer === n}
                          onChange={() => setQuestion(i, { answer: n })}
                        />
                        <span className="text-xs font-semibold text-muted-foreground">{optionLetter(n)}</span>
                        <Input aria-label={`Question ${i + 1} option ${optionLetter(n)}`} value={o} onChange={(e) => setOption(i, n, e.target.value)} className="border-0 px-1 shadow-none focus-visible:ring-0" placeholder={`Option ${optionLetter(n)}`} />
                      </label>
                    ))}
                  </div>
                  <p className="pl-9 text-[11px] text-muted-foreground">Tick the circle beside the right option.</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={save} disabled={saving}>{saving ? "Saving…" : draft.id ? "Update exam" : "Save exam"}</Button>
              {draft.id && <Button variant="outline" onClick={() => setDraft(blankExam())}>Cancel</Button>}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Exams <Badge variant="secondary" className="ml-2">{rows.length}</Badge></CardTitle></CardHeader>
        <CardContent>
          <DataTable
            data={rows}
            columns={columns}
            searchPlaceholder="Search exam, course…"
            filters={[{ label: "Course", key: "courseName" }, { label: "Status", key: "phase" }]}
            actions={(r) => [
              ...(isAdmin ? [{ label: "Edit", onClick: () => edit(r) }] : []),
              { label: "Assign", onClick: () => navigate(`/online-exam/assign?exam=${r.id}`) },
              { label: "Student results", onClick: () => navigate(`/online-exam/marks?exam=${r.id}`) },
              ...(isAdmin
                ? [
                    r.status === "CLOSED"
                      ? { label: "Reopen", onClick: () => void setStatus(r, "PUBLISHED") }
                      : { label: "Close exam", onClick: () => void setStatus(r, "CLOSED") },
                    { label: "Delete", onClick: () => void remove(r), destructive: true },
                  ]
                : []),
            ]}
            emptyMessage={isAdmin ? "No online exams yet. Create one above." : "No online exams have been assigned to this centre yet."}
          />
        </CardContent>
      </Card>
    </AppLayout>
  );
}
