import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatsCard } from "@/components/ui/StatsCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, FileText, HelpCircle, CheckSquare, ListOrdered } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getExams } from "@/lib/supabase/data";
import { printHtml } from "@/lib/export";
import { plainToRichText, richTextToPlain, sanitizeRichText } from "@/lib/rich-text";
import { QUESTION_BANK_KEY, QUESTION_SEED, type Question } from "./AddQuestions";

interface QuestionPaper {
  id: string;
  paperCode: string;
  title: string;
  course: string;
  totalQuestions: number;
  totalMarks: number;
  duration: string;
  createdDate: string;
  status: "draft" | "published" | "archived";
  questionIds?: string[];
}

const PAPERS_KEY = "erp-question-papers";

const PAPERS_SEED: QuestionPaper[] = [
  { id: "1", paperCode: "QP-2024-CS-001", title: "Mid-Term Computer Science", course: "Computer Science", totalQuestions: 50, totalMarks: 100, duration: "2 hours", createdDate: "2024-01-15", status: "published" },
  { id: "2", paperCode: "QP-2024-PHY-001", title: "Physics Unit Test", course: "Science", totalQuestions: 30, totalMarks: 50, duration: "1 hour", createdDate: "2024-01-18", status: "published" },
  { id: "3", paperCode: "QP-2024-MATH-001", title: "Mathematics Final Exam", course: "Commerce", totalQuestions: 60, totalMarks: 100, duration: "3 hours", createdDate: "2024-01-20", status: "draft" },
  { id: "4", paperCode: "QP-2024-ENG-001", title: "English Comprehension", course: "Arts", totalQuestions: 40, totalMarks: 80, duration: "1.5 hours", createdDate: "2024-01-22", status: "draft" },
];

const COURSES = ["Computer Science", "Commerce", "Science", "Arts", "Engineering"];
const DURATIONS = ["30 minutes", "1 hour", "1.5 hours", "2 hours", "3 hours"];

const getStatusColor = (status: string) => {
  switch (status) {
    case "published": return "bg-success/10 text-success border-success/20";
    case "draft": return "bg-warning/10 text-warning border-warning/20";
    case "archived": return "bg-muted text-muted-foreground";
    default: return "bg-muted text-muted-foreground";
  }
};

const columns: Column<QuestionPaper>[] = [
  {
    key: "paperCode",
    header: "Paper Code",
    sortable: true,
    cell: (paper) => (
      <div>
        <p className="font-medium">{paper.paperCode}</p>
        <p className="text-xs text-muted-foreground">{paper.title}</p>
      </div>
    ),
  },
  { key: "course", header: "Course" },
  {
    key: "totalQuestions",
    header: "Questions",
    cell: (paper) => (
      <div className="flex items-center gap-2">
        <HelpCircle className="h-4 w-4 text-muted-foreground" />
        <span>{paper.totalQuestions}</span>
      </div>
    ),
  },
  {
    key: "totalMarks",
    header: "Total Marks",
    cell: (paper) => <Badge variant="secondary">{paper.totalMarks} marks</Badge>,
  },
  { key: "duration", header: "Duration" },
  {
    key: "createdDate",
    header: "Created",
    sortable: true,
    cell: (paper) => new Date(paper.createdDate).toLocaleDateString(),
  },
  {
    key: "status",
    header: "Status",
    cell: (paper) => (
      <Badge variant="outline" className={getStatusColor(paper.status)}>
        {paper.status.charAt(0).toUpperCase() + paper.status.slice(1)}
      </Badge>
    ),
  },
];

/** "CS-2024-001" style code derived from the course name plus a running number. */
const nextPaperCode = (course: string, existing: QuestionPaper[]) => {
  const slug = course.split(/\s+/).map((w) => w[0]?.toUpperCase() ?? "").join("").slice(0, 4) || "GEN";
  const year = new Date().getFullYear();
  const prefix = `QP-${year}-${slug}-`;
  const used = existing
    .filter((p) => p.paperCode.startsWith(prefix))
    .map((p) => Number(p.paperCode.slice(prefix.length)))
    .filter((n) => Number.isFinite(n));
  return `${prefix}${String(Math.max(0, ...used) + 1).padStart(3, "0")}`;
};

const BLANK = { title: "", course: COURSES[0], duration: DURATIONS[3], totalMarks: "100" };

export default function QuestionPaperBuilder() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [papers, setPapers] = useState<QuestionPaper[]>([]);
  const [bank, setBank] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...BLANK });
  const [picking, setPicking] = useState<QuestionPaper | null>(null);
  const [pickedIds, setPickedIds] = useState<string[]>([]);
  const [pendingDelete, setPendingDelete] = useState<QuestionPaper | null>(null);

  const set = <K extends keyof typeof BLANK>(key: K, value: (typeof BLANK)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    try {
      const rawPapers = localStorage.getItem(PAPERS_KEY);
      setPapers(rawPapers ? JSON.parse(rawPapers) : PAPERS_SEED);
    } catch {
      setPapers(PAPERS_SEED);
    }
    try {
      const rawBank = localStorage.getItem(QUESTION_BANK_KEY);
      setBank(rawBank ? JSON.parse(rawBank) : QUESTION_SEED);
    } catch {
      setBank(QUESTION_SEED);
    }
    if (!cancelled) setLoading(false);
    return () => { cancelled = true; };
  }, []);

  const persistPapers = (list: QuestionPaper[]) => {
    setPapers(list);
    try { localStorage.setItem(PAPERS_KEY, JSON.stringify(list)); } catch { /* quota */ }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...BLANK });
    setIsFormOpen(true);
  };

  const openEdit = (paper: QuestionPaper) => {
    setEditingId(paper.id);
    setForm({
      title: paper.title,
      course: paper.course,
      duration: paper.duration,
      totalMarks: String(paper.totalMarks),
    });
    setIsFormOpen(true);
  };

  const savePaper = () => {
    const title = form.title.trim();
    const marks = Number(form.totalMarks);
    if (!title) {
      toast({ title: "Paper title is required", variant: "destructive" });
      return;
    }
    if (!Number.isFinite(marks) || marks <= 0) {
      toast({ title: "Total marks must be a positive number", variant: "destructive" });
      return;
    }

    if (editingId) {
      const updated = papers.map((p) => p.id === editingId ? { ...p, title, course: form.course, duration: form.duration, totalMarks: marks } : p);
      persistPapers(updated);
      toast({ title: "Paper updated", description: title });
    } else {
      const paperCode = nextPaperCode(form.course, papers);
      const newPaper: QuestionPaper = {
        // Without an id, edit / delete / publish - all of which match on `p.id` -
        // silently acted on every paper that lacked one.
        id: `paper-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        paperCode,
        title,
        course: form.course,
        duration: form.duration,
        totalMarks: marks,
        totalQuestions: 0,
        createdDate: new Date().toISOString().slice(0, 10),
        status: "draft",
        questionIds: [],
      };
      persistPapers([newPaper, ...papers]);
      toast({ title: "Question paper created", description: `${paperCode} - add questions next.` });
    }
    setIsFormOpen(false);
    setEditingId(null);
  };

  const openPicker = (paper: QuestionPaper) => {
    setPicking(paper);
    setPickedIds(paper.questionIds ?? []);
  };

  const savePicked = () => {
    if (!picking) return;
    const chosen = bank.filter((q) => pickedIds.includes(q.id));
    const updated = papers.map((p) => {
      if (p.id !== picking.id) return p;
      return {
        ...p,
        questionIds: pickedIds,
        totalQuestions: chosen.length,
        totalMarks: chosen.reduce((sum, q) => sum + (Number(q.marks) || 0), 0) || p.totalMarks,
      };
    });
    persistPapers(updated);
    toast({
      title: "Questions attached",
      description: `${chosen.length} question(s) on ${picking.paperCode}.`,
    });
    setPicking(null);
  };

  const preview = (paper: QuestionPaper) => {
    const chosen = bank.filter((q) => (paper.questionIds ?? []).includes(q.id));
    const body = `
      <div style="font-family:system-ui,sans-serif;max-width:720px;margin:0 auto">
        <h1 style="margin:0;font-size:22px">${paper.title}</h1>
        <p style="margin:4px 0 8px;color:#6b7280;font-size:13px">
          ${paper.paperCode} - ${paper.course} - ${paper.duration} - ${paper.totalMarks} marks
        </p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0" />
        ${
          chosen.length
            ? `<ol style="font-size:14px;line-height:1.7;padding-left:20px">
                ${chosen
                  .map(
                    (q) => `<li style="margin-bottom:14px">
                      <div>${sanitizeRichText(q.text)} <span style="color:#6b7280">[${q.marks} mark(s)]</span></div>
                      ${
                        q.options?.length
                          ? `<ol type="a" style="color:#374151;margin:6px 0 0">${q.options
                              .map((o) => `<li>${plainToRichText(o)}</li>`)
                              .join("")}</ol>`
                          : ""
                      }
                    </li>`,
                  )
                  .join("")}
              </ol>`
            : `<p style="font-size:14px;color:#6b7280">No questions attached yet - use "Add Questions" to build this paper from the question bank.</p>`
        }
      </div>`;
    printHtml(paper.paperCode, body);
  };

  const duplicate = (paper: QuestionPaper) => {
    const { id, ...rest } = paper;
    const paperCode = nextPaperCode(paper.course, papers);
    const newPaper: QuestionPaper = {
      ...rest,
      id: `paper-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      paperCode,
      title: `${paper.title} (Copy)`,
      status: "draft",
      createdDate: new Date().toISOString().slice(0, 10),
    };
    persistPapers([newPaper, ...papers]);
    toast({ title: "Paper duplicated", description: `${paperCode} created as a draft.` });
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    persistPapers(papers.filter((p) => p.id !== pendingDelete.id));
    toast({ title: "Paper deleted", description: pendingDelete.paperCode });
    setPendingDelete(null);
  };

  const handleActions = (paper: QuestionPaper) => [
    { label: "Edit Paper", onClick: () => openEdit(paper) },
    { label: "Add Questions", onClick: () => openPicker(paper) },
    { label: "Preview", onClick: () => preview(paper) },
    {
      label: paper.status === "published" ? "Unpublish" : "Publish",
      onClick: () => {
        if (paper.status !== "published" && !paper.totalQuestions) {
          toast({
            title: "Nothing to publish",
            description: "Attach at least one question first.",
            variant: "destructive",
          });
          return;
        }
        const nextStatus: QuestionPaper["status"] = paper.status === "published" ? "draft" : "published";
        const updated = papers.map((p) => (p.id === paper.id ? { ...p, status: nextStatus } : p));
        persistPapers(updated);
        toast({
          title: paper.status === "published" ? "Paper unpublished" : "Paper published",
          description: paper.paperCode,
        });
      },
    },
    { label: "Duplicate", onClick: () => duplicate(paper) },
    { label: "Delete", onClick: () => setPendingDelete(paper), destructive: true },
  ];

  const pickedMarks = bank
    .filter((q) => pickedIds.includes(q.id))
    .reduce((sum, q) => sum + (Number(q.marks) || 0), 0);

  return (
    <AppLayout>
      <PageHeader
        title="Question Paper Builder"
        description="Create and manage question papers for online exams"
        breadcrumbs={[
          { label: "Online Exam", href: "/online-exam/create" },
          { label: "Question Paper Builder" },
        ]}
        actions={
          <Button className="gap-2" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            New Question Paper
          </Button>
        }
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatsCard title="Total Papers" value={papers.length} subtitle="In the builder" icon={FileText} variant="primary" />
        <StatsCard title="Questions Bank" value={bank.length} subtitle="Available questions" icon={HelpCircle} variant="info" />
        {/* Split by how a question is marked, not by how it looks: the two
            tiles have to account for the whole bank, and a fill-in-the-blanks
            question fell outside both while they were named after MCQs. */}
        <StatsCard
          title="Objective"
          value={bank.filter((q) => q.type === "mcq" || q.type === "true-false" || q.type === "blanks").length}
          subtitle="MCQ, true/false, blanks"
          icon={CheckSquare}
          variant="success"
        />
        <StatsCard
          title="Descriptive"
          value={bank.filter((q) => q.type === "short" || q.type === "long").length}
          subtitle="Marked by hand"
          icon={ListOrdered}
          variant="warning"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Question Papers</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={papers}
            columns={columns}
            searchPlaceholder="Search question papers..."
            actions={handleActions}
          />
        </CardContent>
      </Card>

      <Dialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingId(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit question paper" : "New question paper"}</DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update the paper metadata; question selection lives under 'Add Questions'."
                : "The paper starts as a draft - attach questions before publishing it."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="paper-title">Title *</Label>
              <Input
                id="paper-title"
                placeholder="e.g., Mid-Term Computer Science"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Course</Label>
                <Select value={form.course} onValueChange={(v) => set("course", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COURSES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Duration</Label>
                <Select value={form.duration} onValueChange={(v) => set("duration", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATIONS.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paper-marks">Total marks</Label>
              <Input
                id="paper-marks"
                type="number"
                min={1}
                value={form.totalMarks}
                onChange={(e) => set("totalMarks", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Recalculated from the attached questions once you add them.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
            <Button onClick={savePaper}>{editingId ? "Save changes" : "Create paper"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!picking} onOpenChange={(open) => !open && setPicking(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add questions to {picking?.paperCode}</DialogTitle>
            <DialogDescription>
              {pickedIds.length} selected - {pickedMarks} marks. The bank is shared with the Add Questions page.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-80 space-y-2 overflow-y-auto rounded-lg border p-3">
            {bank.length === 0 && (
              <p className="text-sm text-muted-foreground">The question bank is empty.</p>
            )}
            {bank.map((question) => (
              <label
                key={question.id}
                htmlFor={`q-${question.id}`}
                className="flex cursor-pointer items-start gap-3 rounded-lg p-2 hover:bg-muted"
              >
                <Checkbox
                  id={`q-${question.id}`}
                  checked={pickedIds.includes(question.id)}
                  onCheckedChange={() =>
                    setPickedIds((prev) =>
                      prev.includes(question.id)
                        ? prev.filter((id) => id !== question.id)
                        : [...prev, question.id],
                    )
                  }
                />
                <span className="text-sm">
                  <span className="block">{richTextToPlain(question.text)}</span>
                  <span className="text-xs text-muted-foreground">
                    {question.topic} - {question.difficulty} - {question.marks} mark(s)
                  </span>
                </span>
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => navigate("/online-exam/add-questions")}>
              Open question bank
            </Button>
            <Button onClick={savePicked}>Attach {pickedIds.length || ""} question(s)</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {pendingDelete?.paperCode}?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete?.status === "published"
                ? "This paper is published - deleting it removes it from any exam that references it."
                : "This draft paper will be removed."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}