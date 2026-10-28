import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Clock, HelpCircle, Monitor, Trophy } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { PHASE_LABELS, examPhase, whenShown } from "@/lib/onlineExam";
import { getMyOnlineExams, type MyExam } from "@/lib/supabase/onlineExams";

const PHASE_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  LIVE: "default",
  UPCOMING: "secondary",
  ENDED: "outline",
  CLOSED: "destructive",
  DRAFT: "outline",
};

/** The online exams assigned to the student, each with what they did in it. */
export default function MyExams() {
  const { user, actingAs } = useAuth();
  const { toast } = useToast();
  const [exams, setExams] = useState<MyExam[]>([]);
  const [loading, setLoading] = useState(true);
  // The office looking at a student's portal sees the list, not the exam room.
  const viewingOnly = !!actingAs?.studentId;

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    setLoading(true);
    getMyOnlineExams(user.id)
      .then((list) => { if (!cancelled) setExams(list); })
      .catch((e) => { if (!cancelled) toast({ title: "Could not load your exams", description: e instanceof Error ? e.message : "", variant: "destructive" }); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user?.id, toast]);

  return (
    <AppLayout>
      <PageHeader title="Online Exams" description="Exams assigned to you, with your results" breadcrumbs={[{ label: "Assessments" }, { label: "Online Exams" }]} />
      {viewingOnly && <p className="mb-4 rounded-xl bg-muted/60 p-3 text-sm text-muted-foreground">You are viewing this student's exams. Only the student's own login can sit an exam.</p>}
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading your exams…</p>
      ) : !exams.length ? (
        <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">No online exam has been assigned to you yet.</CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {exams.map((e) => {
            const phase = examPhase(e);
            const a = e.attempt;
            const done = !!a?.submittedAt;
            const open = !!a && !done && new Date(a.expiresAt).getTime() > Date.now();
            return (
              <Card key={e.id} className="overflow-hidden">
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-bold">{e.title}</h3>
                      <p className="text-xs text-muted-foreground">{e.course || "Any course"}{e.term > 1 ? ` · Term ${e.term}` : ""}</p>
                    </div>
                    <Badge variant={done ? "default" : PHASE_VARIANT[phase]}>{done ? "Completed" : PHASE_LABELS[phase]}</Badge>
                  </div>
                  {e.description && <p className="text-sm text-muted-foreground">{e.description}</p>}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><HelpCircle className="h-3.5 w-3.5" /> {e.questionCount} questions</span>
                    <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {e.durationMinutes} min</span>
                    <span>{e.marksPerQuestion} mark{e.marksPerQuestion === 1 ? "" : "s"} each{e.negativeMarks > 0 ? ` · −${e.negativeMarks} wrong` : ""}</span>
                    <span>Pass {e.passPercentage}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {e.startAt || e.endAt ? `Window: ${whenShown(e.startAt)} → ${whenShown(e.endAt)}` : "Can be sat any time"}
                  </p>
                  {done && a && (
                    <div className="rounded-xl bg-muted/50 p-3 text-sm">
                      {e.showResult ? (
                        <div className="flex flex-wrap items-center gap-3">
                          <Trophy className="h-5 w-5 text-gold" />
                          <span><b>{a.score}</b> / {a.maxScore} · <b>{a.percentage}%</b></span>
                          <Badge variant={a.result === "PASS" ? "default" : "destructive"}>{a.result || "—"}</Badge>
                          <span className="text-xs text-muted-foreground">✓ {a.correct} · ✗ {a.wrong} · {a.attempted} of {a.totalQuestions} answered</span>
                        </div>
                      ) : (
                        <span>Submitted on {whenShown(a.submittedAt)}. Your result will be announced by the institute.</span>
                      )}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {open ? (
                      <Button asChild disabled={viewingOnly}><Link to={`/me/exams/${e.id}`}><Monitor className="mr-1 h-4 w-4" /> Continue exam</Link></Button>
                    ) : !done && phase === "LIVE" ? (
                      viewingOnly ? <Button disabled>Start exam</Button> : <Button asChild><Link to={`/me/exams/${e.id}`}><Monitor className="mr-1 h-4 w-4" /> Start exam</Link></Button>
                    ) : !done && phase === "UPCOMING" ? (
                      <Button variant="outline" disabled>Opens {whenShown(e.startAt)}</Button>
                    ) : !done ? (
                      <Button variant="outline" disabled>{a ? "Time over" : "Closed"}</Button>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}
