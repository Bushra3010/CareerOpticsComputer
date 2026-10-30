import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AlertTriangle, ChevronLeft, ChevronRight, Clock, Trophy } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { useToast } from "@/hooks/use-toast";
import { formatClock, optionLetter, secondsLeft } from "@/lib/onlineExam";
import { saveOnlineAnswers, startOnlineExam, submitOnlineExam, type ExamPaper, type SubmitResult } from "@/lib/supabase/onlineExams";

/**
 * The exam room. The paper comes from the database without its answers, the
 * clock runs from the sitting's expiry, answers are saved as they are given,
 * and the paper is handed in -- by the student, or by the clock.
 */
export default function TakeExam() {
  const { examId = "" } = useParams();
  const { toast } = useToast();
  const [paper, setPaper] = useState<ExamPaper | null>(null);
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [index, setIndex] = useState(0);
  const [left, setLeft] = useState(0);
  const [confirm, setConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const answersRef = useRef(answers);
  answersRef.current = answers;
  const dirty = useRef(false);

  useEffect(() => {
    let cancelled = false;
    startOnlineExam(examId)
      .then((p) => {
        if (cancelled) return;
        setPaper(p);
        setAnswers(p.answers);
        setLeft(secondsLeft(p.expiresAt));
      })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : "Could not open the exam."); });
    return () => { cancelled = true; };
  }, [examId]);

  const handIn = useCallback(
    async (byClock = false) => {
      if (!paper || submitting) return;
      setSubmitting(true);
      try {
        const r = await submitOnlineExam(paper.attemptId, answersRef.current);
        setResult(r);
        if (byClock) toast({ title: "Time is over", description: "Your answers have been submitted." });
      } catch (e) {
        toast({ title: "Could not submit", description: e instanceof Error ? e.message : "", variant: "destructive" });
      } finally {
        setSubmitting(false);
        setConfirm(false);
      }
    },
    [paper, submitting, toast],
  );

  // The clock, and the hand-in when it runs out.
  useEffect(() => {
    if (!paper || result) return;
    const tick = () => {
      const s = secondsLeft(paper.expiresAt);
      setLeft(s);
      if (s <= 0) void handIn(true);
    };
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [paper, result, handIn]);

  // Answers saved a moment after they change, so a dropped line loses nothing.
  useEffect(() => {
    if (!paper || result || !dirty.current) return;
    const timer = window.setTimeout(() => {
      dirty.current = false;
      saveOnlineAnswers(paper.attemptId, answersRef.current).catch(() => { /* retried on the next change */ });
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [answers, paper, result]);

  const choose = (qid: string, option: number) => {
    dirty.current = true;
    setAnswers((a) => ({ ...a, [qid]: option }));
  };
  const clear = (qid: string) => {
    dirty.current = true;
    setAnswers((a) => {
      const next = { ...a };
      delete next[qid];
      return next;
    });
  };

  if (error) {
    return (
      <AppLayout>
        <Card className="mx-auto max-w-lg"><CardContent className="space-y-4 p-6 text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-destructive" />
          <p className="text-sm">{error}</p>
          <Button asChild variant="outline"><Link to="/me/exams">Back to my exams</Link></Button>
        </CardContent></Card>
      </AppLayout>
    );
  }

  if (result) {
    return (
      <AppLayout>
        <Card className="mx-auto max-w-lg"><CardContent className="space-y-4 p-6 text-center">
          <Trophy className="mx-auto h-10 w-10 text-gold" />
          <h2 className="text-xl font-bold">{result.alreadySubmitted ? "Already submitted" : "Exam submitted"}</h2>
          {result.showResult ? (
            <>
              <p className="text-3xl font-black">{result.score} <span className="text-base font-semibold text-muted-foreground">/ {result.maxScore}</span></p>
              <div className="text-lg font-semibold">{result.percentage}% <Badge variant={result.result === "PASS" ? "default" : "destructive"} className="ml-2">{result.result}</Badge></div>
              <p className="text-sm text-muted-foreground">✓ {result.correct} right · ✗ {result.wrong} wrong · {result.attempted} of {result.totalQuestions} answered</p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Your answers are in. The institute will announce the result.</p>
          )}
          <Button asChild><Link to="/me/exams">Back to my exams</Link></Button>
        </CardContent></Card>
      </AppLayout>
    );
  }

  if (!paper) {
    return (
      <AppLayout>
        <p className="text-sm text-muted-foreground">Opening your paper…</p>
      </AppLayout>
    );
  }

  const q = paper.questions[index];
  const answered = paper.questions.filter((x) => answers[x.id] !== undefined).length;
  const urgent = left <= 60;

  return (
    <AppLayout>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-card p-4 shadow-sm">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold">{paper.title}</h1>
          <p className="text-xs text-muted-foreground">{paper.questions.length} questions · {paper.marksPerQuestion} mark{paper.marksPerQuestion === 1 ? "" : "s"} each{paper.negativeMarks > 0 ? ` · −${paper.negativeMarks} for a wrong answer` : ""} · {answered} answered</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 font-mono text-lg font-bold ${urgent ? "bg-destructive/10 text-destructive" : "bg-muted"}`} aria-label="Time left">
            <Clock className="h-4 w-4" /> {formatClock(left)}
          </span>
          <Button onClick={() => setConfirm(true)} disabled={submitting}>Submit exam</Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
        <Card>
          <CardContent className="space-y-5 p-5">
            {q ? (
              <>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Question {index + 1} of {paper.questions.length}{q.marks ? ` · ${q.marks} marks` : ""}</p>
                <p className="whitespace-pre-wrap text-base font-medium">{q.text}</p>
                <div className="space-y-2" role="radiogroup" aria-label={`Question ${index + 1} options`}>
                  {q.options.map((o, n) => {
                    const on = answers[q.id] === n;
                    return (
                      <button
                        key={n}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        onClick={() => choose(q.id, n)}
                        className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left text-sm transition-colors ${on ? "border-primary bg-primary/10 font-semibold" : "hover:bg-muted/60"}`}
                      >
                        <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold ${on ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{optionLetter(n)}</span>
                        <span>{o}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Button variant="outline" onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0}><ChevronLeft className="h-4 w-4" /> Previous</Button>
                  <Button variant="ghost" onClick={() => clear(q.id)} disabled={answers[q.id] === undefined}>Clear answer</Button>
                  {index < paper.questions.length - 1 ? (
                    <Button onClick={() => setIndex((i) => Math.min(paper.questions.length - 1, i + 1))}>Next <ChevronRight className="h-4 w-4" /></Button>
                  ) : (
                    <Button onClick={() => setConfirm(true)}>Finish</Button>
                  )}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">This paper has no questions.</p>
            )}
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardContent className="space-y-3 p-4">
            <p className="text-sm font-semibold">Questions</p>
            <div className="grid grid-cols-5 gap-2">
              {paper.questions.map((x, n) => {
                const done = answers[x.id] !== undefined;
                return (
                  <button
                    key={x.id}
                    type="button"
                    aria-label={`Go to question ${n + 1}${done ? ", answered" : ""}`}
                    onClick={() => setIndex(n)}
                    className={`h-9 rounded-lg text-sm font-semibold ${n === index ? "ring-2 ring-primary" : ""} ${done ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                  >
                    {n + 1}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">{answered} answered · {paper.questions.length - answered} left</p>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit the exam?</AlertDialogTitle>
            <AlertDialogDescription>
              You have answered {answered} of {paper.questions.length} questions. Once submitted, the paper cannot be opened again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Keep writing</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); void handIn(); }} disabled={submitting}>{submitting ? "Submitting…" : "Submit now"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
