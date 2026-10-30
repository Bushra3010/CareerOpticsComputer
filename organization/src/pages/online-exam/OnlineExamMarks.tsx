import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Award, CheckCircle2, Clock, Users } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { StatsCard } from "@/components/ui/StatsCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { downloadCsv } from "@/lib/export";
import { whenShown, type OnlineExam } from "@/lib/onlineExam";
import { deleteExamAttempt, getExamAttempts, getOnlineExams, submitOnlineExam, type ExamAttempt } from "@/lib/supabase/onlineExams";
import { studentName, useExamData } from "../exam/useExamData";

type Status = "Submitted" | "In progress" | "Time over";

const statusOf = (a: ExamAttempt, now = Date.now()): Status =>
  a.submittedAt ? "Submitted" : new Date(a.expiresAt).getTime() < now ? "Time over" : "In progress";

/**
 * Every student's sitting of an online exam: when they sat it, how many they
 * answered, right and wrong, their score and PASS / FAIL -- for every centre
 * at the head office, for its own at a centre.
 */
export default function StudentExams() {
  const { toast } = useToast();
  const [params] = useSearchParams();
  const { ownBranch, studentOf, branchOf } = useExamData();
  const [exams, setExams] = useState<OnlineExam[]>([]);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const examFilter = params.get("exam") || "";

  const load = useCallback(async () => {
    try {
      const [e, a] = await Promise.all([getOnlineExams(), getExamAttempts({ branchId: ownBranch, examId: examFilter || null })]);
      setExams(e);
      setAttempts(a);
    } catch (e) {
      toast({ title: "Could not load student exams", description: e instanceof Error ? e.message : "", variant: "destructive" });
    }
  }, [ownBranch, examFilter, toast]);
  useEffect(() => {
    void load();
  }, [load]);

  const examOf = useMemo(() => new Map(exams.map((e) => [e.id, e])), [exams]);

  const close = async (a: ExamAttempt) => {
    try {
      const r = await submitOnlineExam(a.id);
      toast({ title: "Sitting closed and marked", description: `${r.score}/${r.maxScore} · ${r.percentage}% · ${r.result}` });
      await load();
    } catch (e) {
      toast({ title: "Could not close the sitting", description: e instanceof Error ? e.message : "", variant: "destructive" });
    }
  };

  const reattempt = async (a: ExamAttempt) => {
    if (!window.confirm("Remove this sitting so the student can sit the exam again? Its marks are lost.")) return;
    try {
      await deleteExamAttempt(a.id);
      await load();
    } catch (e) {
      toast({ title: "Could not remove the sitting", description: e instanceof Error ? e.message : "", variant: "destructive" });
    }
  };

  type Row = ExamAttempt & { name: string; enrollmentNo: string; examTitle: string; centre: string; status: Status; outcome: string };
  const rows: Row[] = attempts.map((a) => {
    const st = studentOf.get(a.studentId);
    return {
      ...a,
      name: studentName(st) || "—",
      enrollmentNo: st?.enrollmentNo || st?.applicationNo || "—",
      examTitle: examOf.get(a.examId)?.title || "—",
      centre: branchOf.get(a.branchId)?.name || "—",
      status: statusOf(a),
      outcome: a.submittedAt ? a.result : "—",
    };
  });

  const submitted = rows.filter((r) => r.submittedAt);
  const passed = submitted.filter((r) => r.result === "PASS").length;
  const average = submitted.length ? Math.round((submitted.reduce((s, r) => s + r.percentage, 0) / submitted.length) * 10) / 10 : 0;

  const columns: Column<Row>[] = [
    { key: "name", header: "Student", sortable: true, cell: (r) => <span><span className="font-medium">{r.name}</span><span className="block font-mono text-[11px] text-muted-foreground">{r.enrollmentNo}</span></span> },
    { key: "examTitle", header: "Exam", sortable: true },
    { key: "centre", header: "Centre" },
    { key: "startedAt", header: "Sat on", sortable: true, cell: (r) => <span className="text-xs">{whenShown(r.startedAt)}{r.submittedAt ? <span className="block text-muted-foreground">handed in {whenShown(r.submittedAt)}</span> : null}</span> },
    { key: "status", header: "Status", cell: (r) => <Badge variant={r.status === "Submitted" ? "default" : r.status === "Time over" ? "destructive" : "secondary"}>{r.status}</Badge> },
    { key: "attempted", header: "Answered", cell: (r) => (r.submittedAt ? `${r.attempted} / ${r.totalQuestions}` : `— / ${r.totalQuestions}`) },
    { key: "correct", header: "Right / Wrong", cell: (r) => (r.submittedAt ? <span><span className="text-success">✓ {r.correct}</span> <span className="ml-2 text-destructive">✗ {r.wrong}</span></span> : "—") },
    { key: "percentage", header: "Score", sortable: true, cell: (r) => (r.submittedAt ? <span className="text-xs"><b>{r.score}</b> / {r.maxScore} · {r.percentage}%</span> : "—") },
    { key: "outcome", header: "Result", cell: (r) => (r.submittedAt ? <Badge variant={r.result === "PASS" ? "default" : "destructive"}>{r.result}</Badge> : "—") },
  ];

  const exportCsv = () =>
    downloadCsv(
      "online-exam-results",
      rows.map((r) => ({
        student: r.name,
        enrollment: r.enrollmentNo,
        exam: r.examTitle,
        centre: r.centre,
        satOn: r.startedAt,
        submittedAt: r.submittedAt,
        status: r.status,
        answered: r.attempted,
        total: r.totalQuestions,
        correct: r.correct,
        wrong: r.wrong,
        score: r.score,
        maxScore: r.maxScore,
        percentage: r.percentage,
        result: r.outcome,
      })),
    );

  return (
    <AppLayout>
      <PageHeader
        title="Student Exams"
        description={examFilter && examOf.get(examFilter) ? `Sittings of ${examOf.get(examFilter)?.title}` : "Every student's sitting of an online exam, with the marks worked out on submission"}
        breadcrumbs={[{ label: "Online Exam" }, { label: "Student Exams" }]}
        actions={<Button variant="outline" onClick={exportCsv} disabled={!rows.length}>Download CSV</Button>}
      />
      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Sittings" value={rows.length} icon={Users} />
        <StatsCard title="Submitted" value={submitted.length} icon={CheckCircle2} variant="info" subtitle={`${rows.length - submitted.length} still open`} />
        <StatsCard title="Passed" value={passed} icon={Award} variant="success" subtitle={submitted.length ? `${submitted.length - passed} failed` : undefined} />
        <StatsCard title="Average score" value={`${average}%`} icon={Clock} variant="primary" />
      </div>
      <Card>
        <CardHeader><CardTitle>Sittings</CardTitle></CardHeader>
        <CardContent>
          <DataTable
            data={rows}
            columns={columns}
            searchPlaceholder="Search student, enrollment, exam…"
            filters={[{ label: "Exam", key: "examTitle" }, { label: "Centre", key: "centre" }, { label: "Status", key: "status" }, { label: "Result", key: "outcome" }]}
            actions={(r) => [
              ...(r.status === "Time over" ? [{ label: "Close and mark", onClick: () => void close(r) }] : []),
              { label: "Allow re-attempt", onClick: () => void reattempt(r), destructive: true },
            ]}
            emptyMessage="No student has sat an online exam yet."
          />
        </CardContent>
      </Card>
    </AppLayout>
  );
}
