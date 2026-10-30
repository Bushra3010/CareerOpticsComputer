import { useCallback, useEffect, useMemo, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { DceBadge, DceButton, DceLinkButton, DcePanel, DceTable, shortDate, type DceColumn } from "@/components/dce/Dce";
import { getBranches, getCourses } from "@/lib/supabase/data";
import { listStudents, studentName, type StudentRow } from "@/lib/supabase/examAttendance";
import { getExamAssignments, getExamAttempts, type ExamAssignment, type ExamAttempt } from "@/lib/supabase/onlineExams";
import { listCentreExams, type CentreExam } from "@/lib/supabase/questionBank";

const STATUS_BADGE: Record<string, { status: string; label: string }> = {
  PUBLISHED: { status: "ACTIVE", label: "Published" },
  DRAFT: { status: "PENDING", label: "Draft" },
  CLOSED: { status: "CLOSED", label: "Closed" },
};

/**
 * Which students an exam reaches, worked out the way the database's
 * online_exam_assigned() does: a named student, or every student of the
 * centre (of one course, when the assignment names one).
 */
function assignedStudentIds(examId: string, assignments: ExamAssignment[], students: StudentRow[]): Set<string> {
  const out = new Set<string>();
  for (const a of assignments) {
    if (a.examId !== examId) continue;
    if (a.studentId) out.add(a.studentId);
    else for (const s of students) if (s.branchId === a.branchId && (!a.courseId || s.courseId === a.courseId)) out.add(s.id);
  }
  return out;
}

export default function CentreExams() {
  const { branchId, organizationId } = useAuth();
  const { toast } = useToast();
  const isAdmin = !branchId;
  const [exams, setExams] = useState<CentreExam[]>([]);
  const [assignments, setAssignments] = useState<ExamAssignment[]>([]);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [courses, setCourses] = useState<Map<string, string>>(new Map());
  const [branches, setBranches] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [resultsFor, setResultsFor] = useState<CentreExam | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [e, as, at, st, c, b] = await Promise.all([
        listCentreExams(),
        getExamAssignments(branchId),
        getExamAttempts({ branchId }),
        listStudents(branchId),
        getCourses(organizationId, branchId),
        isAdmin ? getBranches(organizationId) : Promise.resolve({ success: true, data: [] as Record<string, unknown>[] }),
      ]);
      setExams(e);
      setAssignments(as);
      setAttempts(at);
      setStudents(st);
      setCourses(new Map((c.data || []).map((r: Record<string, unknown>) => [String(r.id), String(r.name ?? "")])));
      setBranches(new Map((b.data || []).map((r: Record<string, unknown>) => [String(r.id), String(r.name ?? "")])));
    } catch (err) {
      toast({ title: "Could not load exams", description: err instanceof Error ? err.message : "", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [branchId, organizationId, isAdmin, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const studentById = useMemo(() => new Map(students.map((s) => [s.id, s])), [students]);
  const counts = useMemo(() => {
    const out = new Map<string, { assigned: number; attempted: number }>();
    for (const e of exams) {
      out.set(e.id, {
        assigned: assignedStudentIds(e.id, assignments, students).size,
        attempted: attempts.filter((a) => a.examId === e.id && a.submittedAt).length,
      });
    }
    return out;
  }, [exams, assignments, students, attempts]);

  const columns: DceColumn<CentreExam>[] = [
    { key: "n", label: "#", render: (_r, i) => i + 1, className: "w-10" },
    {
      key: "exam",
      label: "Exam",
      render: (e) => (
        <div>
          <div className="font-semibold">{e.title}</div>
          <div className="text-[11.5px] text-slate-500">
            {e.examType === "PRACTICE" ? "Practice" : "Online"} · {e.durationMinutes} min
            {isAdmin ? ` · ${e.branchId ? branches.get(e.branchId) || "Centre" : "Head Office"}` : ""}
          </div>
        </div>
      ),
    },
    { key: "course", label: "Course", render: (e) => courses.get(e.courseId) || "—" },
    { key: "q", label: "Questions", render: (e) => e.questionCount },
    {
      key: "students",
      label: "Students",
      render: (e) => {
        const c = counts.get(e.id);
        return `${c?.assigned ?? 0} / ${c?.attempted ?? 0}`;
      },
    },
    { key: "created", label: "Created At", render: (e) => shortDate(e.createdAt) },
    {
      key: "status",
      label: "Status",
      render: (e) => {
        const b = STATUS_BADGE[e.status] || { status: e.status, label: e.status };
        return <DceBadge status={b.status} label={b.label} />;
      },
    },
    {
      key: "action",
      label: "Action",
      render: (e) => (
        <DceButton size="sm" tone="teal" onClick={() => setResultsFor(e)}>
          Results
        </DceButton>
      ),
    },
  ];

  const results = useMemo(() => (resultsFor ? attempts.filter((a) => a.examId === resultsFor.id) : []), [attempts, resultsFor]);
  const resultColumns: DceColumn<ExamAttempt>[] = [
    { key: "n", label: "#", render: (_r, i) => i + 1, className: "w-10" },
    {
      key: "student",
      label: "Student",
      render: (a) => {
        const s = studentById.get(a.studentId);
        return s ? `${studentName(s)}${s.enrollmentNo ? ` (${s.enrollmentNo})` : ""}` : a.studentId;
      },
    },
    { key: "started", label: "Started", render: (a) => shortDate(a.startedAt) },
    { key: "att", label: "Attempted", render: (a) => (a.submittedAt ? `${a.attempted} / ${a.totalQuestions}` : "In progress") },
    { key: "cw", label: "Correct / Wrong", render: (a) => (a.submittedAt ? `${a.correct} / ${a.wrong}` : "—") },
    { key: "score", label: "Score", render: (a) => (a.submittedAt ? `${a.score} / ${a.maxScore} (${a.percentage}%)` : "—") },
    {
      key: "result",
      label: "Result",
      render: (a) => (a.result ? <DceBadge status={a.result === "PASS" ? "ACTIVE" : "REJECTED"} label={a.result} /> : <DceBadge status="PENDING" label="Sitting" />),
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-5">
        <DcePanel
          title="All Exams"
          actions={
            <DceLinkButton tone="red" to="/centre/exam-create">
              Add New
            </DceLinkButton>
          }
        >
          <p className="mb-3 text-[12px] text-slate-500">Students: assigned / attempted.</p>
          <DceTable columns={columns} rows={exams} rowKey={(e) => e.id} loading={loading} empty="No exams yet." />
        </DcePanel>

        {resultsFor && (
          <DcePanel
            title={`Results - ${resultsFor.title}`}
            actions={
              <>
                <DceLinkButton tone="light" size="sm" to={`/online-exam/marks?exam=${encodeURIComponent(resultsFor.id)}`}>
                  Full Results Page
                </DceLinkButton>
                <DceButton tone="light" size="sm" onClick={() => setResultsFor(null)}>
                  Close
                </DceButton>
              </>
            }
          >
            <DceTable columns={resultColumns} rows={results} rowKey={(a) => a.id} empty="No student has sat this exam yet." />
          </DcePanel>
        )}
      </div>
    </AppLayout>
  );
}
