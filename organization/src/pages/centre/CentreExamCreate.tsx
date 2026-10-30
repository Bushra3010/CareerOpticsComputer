import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { DceButton, DceField, DceGrid, DceInput, DceLinkButton, DcePanel, DceSelect, DceTextarea } from "@/components/dce/Dce";
import { getBatches, getBatchesByOrg, getBranches, getCourses } from "@/lib/supabase/data";
import { getCourseSubjects } from "@/lib/supabase/examWorkflow";
import { NO_SUBJECT, createCentreExam, listBankQuestions, type BankQuestion, type CentreExamType } from "@/lib/supabase/questionBank";

interface Named {
  id: string;
  name: string;
}
interface BatchOption extends Named {
  branchId: string;
  courseId: string;
}

const named = (rows: Record<string, unknown>[] | undefined): Named[] =>
  (rows || []).map((r) => ({ id: String(r.id), name: String(r.name ?? "") }));

export default function CentreExamCreate() {
  const { user, branchId, organizationId } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isAdmin = !branchId;
  const [courses, setCourses] = useState<Named[]>([]);
  const [batches, setBatches] = useState<BatchOption[]>([]);
  const [branches, setBranches] = useState<Named[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [bank, setBank] = useState<BankQuestion[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    examType: "ONLINE" as CentreExamType,
    branchId: "",
    batchId: "",
    courseId: "",
    subject: "",
    durationMinutes: "60",
    questionCount: "20",
    description: "",
  });
  const target = branchId || form.branchId;

  useEffect(() => {
    Promise.all([
      getCourses(organizationId, branchId),
      branchId ? getBatches(branchId) : getBatchesByOrg(organizationId),
      isAdmin ? getBranches(organizationId) : Promise.resolve({ success: true, data: [] as Record<string, unknown>[] }),
    ])
      .then(([c, b, br]) => {
        setCourses(named(c.data));
        setBatches(
          (b.data || [])
            .filter((r: Record<string, unknown>) => r.isActive !== false)
            .map((r: Record<string, unknown>) => ({ id: String(r.id), name: String(r.name ?? ""), branchId: String(r.branchId ?? ""), courseId: String(r.courseId ?? "") })),
        );
        setBranches(named(br.data));
      })
      .catch((e) => toast({ title: "Could not load the form", description: e instanceof Error ? e.message : "", variant: "destructive" }));
  }, [branchId, organizationId, isAdmin, toast]);

  useEffect(() => {
    let live = true;
    setSubjects([]);
    if (!form.courseId) return;
    getCourseSubjects(form.courseId)
      .then((rows) => live && setSubjects([...new Set(rows.map((s) => s.name).filter(Boolean))]))
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [form.courseId]);

  // The centre's bank for this course, so the form can say how many questions there are to draw from.
  useEffect(() => {
    let live = true;
    setBank([]);
    if (!form.courseId || !target) return;
    listBankQuestions({ branchId: target, courseId: form.courseId })
      .then((rows) => live && setBank(rows.filter((q) => q.status === "ACTIVE")))
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [form.courseId, target]);

  const available = useMemo(
    () => bank.filter((q) => (form.subject === NO_SUBJECT ? !q.subject : !form.subject || q.subject === form.subject)).length,
    [bank, form.subject],
  );
  const batchOptions = useMemo(
    () => batches.filter((b) => (!target || b.branchId === target) && (!form.courseId || b.courseId === form.courseId)),
    [batches, target, form.courseId],
  );

  const submit = async () => {
    setSaving(true);
    try {
      const result = await createCentreExam({
        title: form.title,
        examType: form.examType,
        branchId: target,
        organizationId,
        courseId: form.courseId,
        subject: form.subject,
        batchId: form.batchId,
        durationMinutes: Number(form.durationMinutes),
        questionCount: Number(form.questionCount),
        description: form.description,
        createdBy: user?.name || null,
      });
      toast({
        title: "Exam created",
        description: `${result.questions} questions drawn${result.assigned ? `, given to ${result.assigned} student(s)` : ", given to every student of the course"}.`,
      });
      navigate("/centre/exams");
    } catch (e) {
      toast({ title: "Could not create the exam", description: e instanceof Error ? e.message : "", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  return (
    <AppLayout>
      <DcePanel
        title="Create Exam"
        actions={
          <DceLinkButton tone="red" to="/centre/exams">
            All Exams
          </DceLinkButton>
        }
      >
        <DceGrid>
          <DceField label="Exam Name" required span={2}>
            <DceInput value={form.title} placeholder="Exam Name" onChange={(e) => set({ title: e.target.value })} />
          </DceField>
          <DceField label="Exam Type" required>
            <DceSelect value={form.examType} onChange={(e) => set({ examType: e.target.value as CentreExamType })}>
              <option value="ONLINE">Online Exam</option>
              <option value="PRACTICE">Practice (Mock) Test</option>
            </DceSelect>
          </DceField>
          {isAdmin && (
            <DceField label="Centre" required>
              <DceSelect value={form.branchId} onChange={(e) => set({ branchId: e.target.value, batchId: "" })}>
                <option value="">Select Centre</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </DceSelect>
            </DceField>
          )}
          <DceField label="Select Course" required>
            <DceSelect value={form.courseId} onChange={(e) => set({ courseId: e.target.value, subject: "", batchId: "" })}>
              <option value="">Select Course</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </DceSelect>
          </DceField>
          <DceField label="Batch" hint="Leave as all to give the exam to every student of the course.">
            <DceSelect
              value={form.batchId}
              onChange={(e) => {
                const batch = batches.find((b) => b.id === e.target.value);
                set({ batchId: e.target.value, ...(batch && !form.courseId ? { courseId: batch.courseId } : {}) });
              }}
            >
              <option value="">All students of the course</option>
              {batchOptions.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </DceSelect>
          </DceField>
          <DceField label="Select Subject">
            <DceSelect value={form.subject} onChange={(e) => set({ subject: e.target.value })}>
              <option value="">All Subjects</option>
              <option value={NO_SUBJECT}>No Subject</option>
              {subjects.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </DceSelect>
          </DceField>
          <DceField label="Duration of Exam (in minutes)" required>
            <DceInput type="number" min={1} value={form.durationMinutes} onChange={(e) => set({ durationMinutes: e.target.value })} />
          </DceField>
          <DceField
            label="Number of questions"
            required
            hint={form.courseId && target ? `${available} active question(s) in the bank for this selection.` : undefined}
          >
            <DceInput type="number" min={1} value={form.questionCount} onChange={(e) => set({ questionCount: e.target.value })} />
          </DceField>
          <DceField label="Exam Description (optional)" span={4}>
            <DceTextarea value={form.description} onChange={(e) => set({ description: e.target.value })} />
          </DceField>
        </DceGrid>
        <div className="mt-5">
          <DceButton tone="blue" onClick={submit} disabled={saving}>
            {saving ? "Creating…" : "Create Exam"}
          </DceButton>
        </div>
      </DcePanel>
    </AppLayout>
  );
}
