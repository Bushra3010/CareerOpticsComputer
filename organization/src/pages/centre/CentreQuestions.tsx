import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  DceBadge,
  DceButton,
  DceDivider,
  DceField,
  DceGrid,
  DceInput,
  DcePanel,
  DceSelect,
  DceTable,
  DceTextarea,
  shortDate,
  type DceColumn,
} from "@/components/dce/Dce";
import { getBranches, getCourses } from "@/lib/supabase/data";
import { getCourseSubjects } from "@/lib/supabase/examWorkflow";
import {
  SAMPLE_QUESTION_CSV,
  createBankQuestions,
  deleteBankQuestion,
  listBankQuestions,
  parseQuestionCsv,
  setBankQuestionStatus,
  updateBankQuestion,
  type BankQuestion,
} from "@/lib/supabase/questionBank";

interface Named {
  id: string;
  name: string;
}

const blankQuestion = { id: "", courseId: "", subject: "", question: "", options: ["", "", "", ""], answer: "" };

/** Subjects of a course, by name, as `question_bank.subject` stores them. */
function useSubjects(courseId: string) {
  const [subjects, setSubjects] = useState<string[]>([]);
  useEffect(() => {
    let live = true;
    if (!courseId) {
      setSubjects([]);
      return;
    }
    getCourseSubjects(courseId)
      .then((rows) => live && setSubjects([...new Set(rows.map((s) => s.name).filter(Boolean))]))
      .catch(() => live && setSubjects([]));
    return () => {
      live = false;
    };
  }, [courseId]);
  return subjects;
}

export default function CentreQuestions() {
  const { branchId, organizationId } = useAuth();
  const { toast } = useToast();
  const isAdmin = !branchId;
  const [questions, setQuestions] = useState<BankQuestion[]>([]);
  const [courses, setCourses] = useState<Named[]>([]);
  const [branches, setBranches] = useState<Named[]>([]);
  const [loading, setLoading] = useState(true);
  const [courseFilter, setCourseFilter] = useState("");

  // The bulk upload card.
  const [uploadBranch, setUploadBranch] = useState("");
  const [uploadCourse, setUploadCourse] = useState("");
  const [uploadSubject, setUploadSubject] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const uploadSubjects = useSubjects(uploadCourse);

  // The single question form, for adding one or editing one.
  const [editing, setEditing] = useState<typeof blankQuestion | null>(null);
  const [saving, setSaving] = useState(false);
  const editSubjects = useSubjects(editing?.courseId || "");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [q, c, b] = await Promise.all([
        listBankQuestions({ branchId }),
        getCourses(organizationId, branchId),
        isAdmin ? getBranches(organizationId) : Promise.resolve({ success: true, data: [] as Record<string, unknown>[] }),
      ]);
      setQuestions(q);
      setCourses((c.data || []).map((r: Record<string, unknown>) => ({ id: String(r.id), name: String(r.name ?? "") })));
      setBranches((b.data || []).map((r: Record<string, unknown>) => ({ id: String(r.id), name: String(r.name ?? "") })));
    } catch (e) {
      toast({ title: "Could not load questions", description: e instanceof Error ? e.message : "", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [branchId, organizationId, isAdmin, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const courseName = useMemo(() => new Map(courses.map((c) => [c.id, c.name])), [courses]);
  const branchName = useMemo(() => new Map(branches.map((b) => [b.id, b.name])), [branches]);
  const shown = useMemo(() => questions.filter((q) => !courseFilter || q.courseId === courseFilter), [questions, courseFilter]);

  const downloadSample = () => {
    const url = URL.createObjectURL(new Blob([SAMPLE_QUESTION_CSV], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample-questions.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const upload = async () => {
    const target = branchId || uploadBranch;
    if (!target) return toast({ title: "Select the centre", variant: "destructive" });
    if (!uploadCourse) return toast({ title: "Select the course", variant: "destructive" });
    if (!file) return toast({ title: "Choose the question CSV file", variant: "destructive" });
    if (!/\.csv$/i.test(file.name)) return toast({ title: "Only a .csv file is allowed", variant: "destructive" });
    setUploading(true);
    try {
      const { questions: parsed, errors } = parseQuestionCsv(await file.text());
      if (!parsed.length) {
        toast({ title: "No questions found in the file", description: errors[0] || "Check it against the sample.", variant: "destructive" });
        return;
      }
      const added = await createBankQuestions(
        target,
        parsed.map((q) => ({ ...q, courseId: uploadCourse, subject: uploadSubject })),
      );
      toast({
        title: `${added} question${added === 1 ? "" : "s"} added`,
        description: errors.length ? `${errors.length} row(s) skipped. ${errors.slice(0, 2).join(" ")}` : undefined,
        variant: errors.length ? "destructive" : "default",
      });
      setFile(null);
      if (fileInput.current) fileInput.current.value = "";
      await load();
    } catch (e) {
      toast({ title: "Could not add the questions", description: e instanceof Error ? e.message : "", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const saveOne = async () => {
    if (!editing) return;
    const target = branchId || uploadBranch;
    if (!editing.courseId) return toast({ title: "Select the course", variant: "destructive" });
    setSaving(true);
    try {
      const input = { courseId: editing.courseId, subject: editing.subject, question: editing.question, options: editing.options, answer: editing.answer };
      if (editing.id) await updateBankQuestion(editing.id, input);
      else await createBankQuestions(target || null, [input]);
      toast({ title: editing.id ? "Question updated" : "Question added" });
      setEditing(null);
      await load();
    } catch (e) {
      toast({ title: "Could not save the question", description: e instanceof Error ? e.message : "", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (q: BankQuestion) => {
    try {
      await setBankQuestionStatus(q.id, q.status === "ACTIVE" ? "INACTIVE" : "ACTIVE");
      await load();
    } catch (e) {
      toast({ title: "Could not change the status", description: e instanceof Error ? e.message : "", variant: "destructive" });
    }
  };

  const remove = async (q: BankQuestion) => {
    if (!window.confirm("Delete this question? Exams already set keep their copy of it.")) return;
    try {
      await deleteBankQuestion(q.id);
      toast({ title: "Question deleted" });
      await load();
    } catch (e) {
      toast({ title: "Could not delete", description: e instanceof Error ? e.message : "", variant: "destructive" });
    }
  };

  const columns: DceColumn<BankQuestion>[] = [
    { key: "n", label: "#", render: (_r, i) => i + 1, className: "w-10" },
    {
      key: "q",
      label: "Question",
      render: (q) => (
        <div className="max-w-md">
          <div className="font-semibold">{q.question}</div>
          <div className="mt-0.5 text-[11.5px] text-slate-500">
            {[courseName.get(q.courseId), q.subject || "No Subject", isAdmin ? branchName.get(q.branchId) : ""].filter(Boolean).join(" · ")}
          </div>
        </div>
      ),
    },
    { key: "a", label: "Answer", render: (q) => q.answer },
    { key: "c", label: "Created At", render: (q) => shortDate(q.createdAt) },
    { key: "s", label: "Status", render: (q) => <DceBadge status={q.status} /> },
    {
      key: "action",
      label: "Action",
      render: (q) => (
        <div className="flex flex-wrap gap-1.5">
          <DceButton
            size="sm"
            tone="blue"
            onClick={() =>
              setEditing({
                id: q.id,
                courseId: q.courseId,
                subject: q.subject,
                question: q.question,
                options: [0, 1, 2, 3].map((i) => q.options[i] ?? ""),
                answer: q.answer,
              })
            }
          >
            Edit
          </DceButton>
          <DceButton size="sm" tone={q.status === "ACTIVE" ? "orange" : "green"} onClick={() => toggle(q)}>
            {q.status === "ACTIVE" ? "Deactivate" : "Activate"}
          </DceButton>
          <DceButton size="sm" tone="red" onClick={() => remove(q)}>
            Delete
          </DceButton>
        </div>
      ),
    },
  ];

  const branchSelect = isAdmin && (
    <DceField label="Centre" required>
      <DceSelect value={uploadBranch} onChange={(e) => setUploadBranch(e.target.value)}>
        <option value="">Select Centre</option>
        {branches.map((b) => (
          <option key={b.id} value={b.id}>{b.name}</option>
        ))}
      </DceSelect>
    </DceField>
  );

  return (
    <AppLayout>
      <DcePanel
        title="Manage Questions"
        actions={
          <DceButton tone="red" onClick={() => setEditing({ ...blankQuestion, courseId: uploadCourse, subject: uploadSubject })}>
            Add New
          </DceButton>
        }
      >
        <div className="rounded border border-slate-200 p-4">
          <DceGrid>
            {branchSelect}
            <DceField label="Select Course" required>
              <DceSelect
                value={uploadCourse}
                onChange={(e) => {
                  setUploadCourse(e.target.value);
                  setUploadSubject("");
                }}
              >
                <option value="">Select Course</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </DceSelect>
            </DceField>
            <DceField label="Select Subject">
              <DceSelect value={uploadSubject} onChange={(e) => setUploadSubject(e.target.value)}>
                <option value="">No Subject</option>
                {uploadSubjects.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </DceSelect>
            </DceField>
            <DceField label="Select Question CSV File (only csv file allowed)" required span={isAdmin ? 1 : 2}>
              <DceInput ref={fileInput} type="file" accept=".csv,text/csv" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </DceField>
          </DceGrid>
          <div className="mt-4 flex flex-wrap gap-2">
            <DceButton tone="slate" onClick={downloadSample}>
              Download Sample
            </DceButton>
            <DceButton tone="blue" onClick={upload} disabled={uploading}>
              {uploading ? "Adding…" : "Add Now"}
            </DceButton>
          </div>
        </div>

        {editing && (
          <div className="mt-5 rounded border border-slate-200 p-4">
            <h3 className="mb-3 text-[13.5px] font-bold text-slate-700">{editing.id ? "Edit Question" : "Add Question"}</h3>
            <DceGrid>
              {!editing.id && branchSelect}
              <DceField label="Course" required>
                <DceSelect value={editing.courseId} onChange={(e) => setEditing({ ...editing, courseId: e.target.value, subject: "" })}>
                  <option value="">Select Course</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </DceSelect>
              </DceField>
              <DceField label="Subject">
                <DceSelect value={editing.subject} onChange={(e) => setEditing({ ...editing, subject: e.target.value })}>
                  <option value="">No Subject</option>
                  {/* Keeps an edited question's subject even if the course no longer lists it. */}
                  {[...new Set([...editSubjects, ...(editing.subject ? [editing.subject] : [])])].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </DceSelect>
              </DceField>
              <DceField label="Question" required span={4}>
                <DceTextarea value={editing.question} onChange={(e) => setEditing({ ...editing, question: e.target.value })} />
              </DceField>
              {editing.options.map((o, i) => (
                <DceField key={i} label={`Option ${i + 1}`} required>
                  <DceInput
                    value={o}
                    onChange={(e) => {
                      const options = [...editing.options];
                      // The answer follows its option when the option's words are edited.
                      const wasAnswer = editing.answer && editing.answer === o;
                      options[i] = e.target.value;
                      setEditing({ ...editing, options, answer: wasAnswer ? e.target.value : editing.answer });
                    }}
                  />
                </DceField>
              ))}
              <DceField label="Answer" required>
                <DceSelect value={editing.answer} onChange={(e) => setEditing({ ...editing, answer: e.target.value })}>
                  <option value="">Select Answer</option>
                  {editing.options.map((o, i) =>
                    o.trim() ? (
                      <option key={i} value={o}>
                        Option {i + 1}: {o}
                      </option>
                    ) : null,
                  )}
                </DceSelect>
              </DceField>
            </DceGrid>
            <div className="mt-4 flex gap-2">
              <DceButton tone="blue" onClick={saveOne} disabled={saving}>
                {saving ? "Saving…" : editing.id ? "Update Now" : "Add Now"}
              </DceButton>
              <DceButton tone="light" onClick={() => setEditing(null)}>
                Cancel
              </DceButton>
            </div>
          </div>
        )}

        <DceDivider />

        <div className="mb-4 max-w-xs">
          <DceSelect aria-label="Filter by course" value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
            <option value="">All Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </DceSelect>
        </div>
        <DceTable columns={columns} rows={shown} rowKey={(q) => q.id} loading={loading} empty="No questions yet. Upload a CSV or add one." />
      </DcePanel>
    </AppLayout>
  );
}
