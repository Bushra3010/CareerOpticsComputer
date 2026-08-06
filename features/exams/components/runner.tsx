"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/db/browser";
import type { PaperQuestion, RunnerData } from "../attempt-queries";

/**
 * The attempt runner.
 *
 * In-exam traffic — autosave, heartbeat, focus events, submit — goes from the
 * browser straight to the database's SECURITY DEFINER functions rather than
 * through server actions. This is the highest-QPS authenticated path in the
 * product (build plan R3), a server action would add a full Next.js round trip
 * to every save, and the functions carry their own authorisation
 * (`student_id = app.current_student_id()`), so the app layer has nothing to
 * add but latency. This is the "high-frequency exam traffic" exception the
 * build plan's route-handler policy names — PostgREST is that endpoint.
 *
 * The timer is a rendering of the server's deadline, never an authority. The
 * initial remaining time is computed on the server (nothing here calls
 * Date.now() during render); the heartbeat re-bases it, so a wrong local clock
 * still shows the right countdown. At zero the client merely *asks* to submit —
 * the cron sweep is the backstop that does not need the tab to still exist.
 */

type AnswerValue = { option_id?: string; option_ids?: string[] };

const AUTOSAVE_DEBOUNCE_MS = 1200;
const HEARTBEAT_MS = 60_000;

function formatClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function ExamRunner({ data }: { data: RunnerData }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const initialAnswers = useMemo(() => {
    const out: Record<string, AnswerValue> = {};
    for (const [qid, saved] of Object.entries(data.saved)) {
      out[qid] = saved.answer as AnswerValue;
    }
    return out;
  }, [data.saved]);

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] =
    useState<Record<string, AnswerValue>>(initialAnswers);
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [offline, setOffline] = useState(false);
  const [remaining, setRemaining] = useState(data.initialRemainingSeconds);
  // Announcements are throttled by meaning, not time: only transitions are
  // announced (save failed, recovered, the two time warnings), so a
  // screen-reader user is not narrated at every autosave — PRD §8.2 wants
  // announcements, not a commentary.
  const [politeMessage, setPoliteMessage] = useState("");
  const [assertiveMessage, setAssertiveMessage] = useState("");

  // Refs, touched only inside effects and handlers — never during render.
  // `remainingBase` is the countdown's origin: (server-remaining, local time
  // it was learned), reset by the heartbeat so clock skew self-corrects.
  const remainingBase = useRef<{ seconds: number; at: number } | null>(null);
  const answersRef = useRef(answers);
  const trackers = useRef<Record<string, { seq: number; failed: boolean }>>({});
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const warned = useRef({ five: false, one: false });
  const submitted = useRef(false);
  // The retry timeout calls the latest persist through this ref — a direct
  // self-reference inside useCallback trips the compiler's TDZ check, and a
  // stale closure would retry with an old sequence counter.
  const persistRef = useRef<(questionId: string) => Promise<void>>(null);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const doSubmit = useCallback(
    async (auto: boolean) => {
      if (submitted.current) return;
      submitted.current = true;
      setSubmitting(true);

      const { error } = await supabase.rpc("submit_exam_attempt", {
        p_attempt_id: data.attemptId,
      });

      if (error && !auto) {
        // A manual submit that failed needs the student to know; an automatic
        // one at the deadline is finished by the sweep regardless.
        submitted.current = false;
        setSubmitting(false);
        setAssertiveMessage(
          "Could not submit. Check your connection and try again.",
        );
        return;
      }
      router.replace(`/exam/${data.attemptId}/submitted`);
    },
    [data.attemptId, router, supabase],
  );

  const persist = useCallback(
    async (questionId: string) => {
      const tracker = (trackers.current[questionId] ??= {
        seq: 0,
        failed: false,
      });
      const wasFailed = tracker.failed;
      tracker.seq += 1;
      const seq = tracker.seq;

      const { data: result, error } = await supabase.rpc("save_exam_answer", {
        p_attempt_id: data.attemptId,
        p_question_id: questionId,
        p_answer: answersRef.current[questionId] ?? {},
        p_client_seq: seq,
      });

      // A newer save has been fired since; let it own the outcome.
      if (tracker.seq !== seq) return;

      if (error) {
        if (!wasFailed) setPoliteMessage("A save failed. Retrying…");
        tracker.failed = true;
        timers.current[questionId] = setTimeout(
          () => void persistRef.current?.(questionId),
          4000,
        );
        return;
      }

      const row = (
        result as { saved: boolean; remaining_seconds: number }[] | null
      )?.[0];
      if (row && !row.saved && row.remaining_seconds === 0) {
        void doSubmit(true);
        return;
      }
      if (wasFailed) setPoliteMessage("Saved.");
      tracker.failed = false;
    },
    [data.attemptId, doSubmit, supabase],
  );

  useEffect(() => {
    persistRef.current = persist;
  }, [persist]);

  const scheduleSave = useCallback(
    (questionId: string, delay = AUTOSAVE_DEBOUNCE_MS) => {
      clearTimeout(timers.current[questionId]);
      timers.current[questionId] = setTimeout(
        () => void persist(questionId),
        delay,
      );
    },
    [persist],
  );

  // The countdown. The base is seeded from the server figure and re-based by
  // the heartbeat, so the interval only ever does arithmetic.
  useEffect(() => {
    remainingBase.current = {
      seconds: data.initialRemainingSeconds,
      at: Date.now(),
    };
    const tick = setInterval(() => {
      const base = remainingBase.current;
      if (!base) return;
      const left = Math.max(
        0,
        base.seconds - Math.floor((Date.now() - base.at) / 1000),
      );
      setRemaining(left);

      if (left <= 300 && !warned.current.five) {
        warned.current.five = true;
        setAssertiveMessage("Five minutes remaining.");
      }
      if (left <= 60 && !warned.current.one) {
        warned.current.one = true;
        setAssertiveMessage(
          "One minute remaining. Your answers are saved as you go.",
        );
      }
      if (left === 0) {
        clearInterval(tick);
        void doSubmit(true);
      }
    }, 1000);
    return () => clearInterval(tick);
  }, [data.initialRemainingSeconds, doSubmit]);

  // Heartbeat: re-bases the countdown and notices a submission that happened
  // elsewhere (the sweep, or the same student on another device).
  useEffect(() => {
    const beat = setInterval(async () => {
      const { data: hb, error } = await supabase.rpc("exam_attempt_heartbeat", {
        p_attempt_id: data.attemptId,
      });
      if (error) return;
      const row = (
        hb as { remaining_seconds: number; status: string }[] | null
      )?.[0];
      if (!row) return;
      remainingBase.current = {
        seconds: row.remaining_seconds,
        at: Date.now(),
      };
      if (row.status !== "in_progress") {
        router.replace(`/exam/${data.attemptId}/submitted`);
      }
    }, HEARTBEAT_MS);
    return () => clearInterval(beat);
  }, [data.attemptId, router, supabase]);

  // Focus changes: recorded as a signal, nothing else. PRD §7.7.
  useEffect(() => {
    const onVisibility = () => {
      void supabase.rpc("record_exam_event", {
        p_attempt_id: data.attemptId,
        p_event: document.hidden ? "focus_lost" : "focus_regained",
      });
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [data.attemptId, supabase]);

  useEffect(() => {
    const on = () => {
      setOffline(false);
      setPoliteMessage("Back online. Unsaved answers will retry.");
      for (const q of data.paper) {
        if (trackers.current[q.questionId]?.failed) {
          scheduleSave(q.questionId, 0);
        }
      }
    };
    const off = () => {
      setOffline(true);
      setPoliteMessage(
        "You are offline. Keep going — answers save when the connection returns.",
      );
    };
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, [data.paper, scheduleSave]);

  const choose = (q: PaperQuestion, optionId: string) => {
    setAnswers((prev) => {
      if (q.type === "multiple_choice") {
        const current = new Set(prev[q.questionId]?.option_ids ?? []);
        if (current.has(optionId)) current.delete(optionId);
        else current.add(optionId);
        return { ...prev, [q.questionId]: { option_ids: [...current] } };
      }
      return { ...prev, [q.questionId]: { option_id: optionId } };
    });
    scheduleSave(q.questionId);
  };

  const clearAnswer = (q: PaperQuestion) => {
    setAnswers((prev) => ({ ...prev, [q.questionId]: {} }));
    scheduleSave(q.questionId);
  };

  const isAnswered = (qid: string) => {
    const a = answers[qid];
    return Boolean(
      a && (a.option_id || (a.option_ids && a.option_ids.length > 0)),
    );
  };

  const isChosen = (q: PaperQuestion, optionId: string) => {
    const a = answers[q.questionId];
    if (!a) return false;
    return q.type === "multiple_choice"
      ? (a.option_ids ?? []).includes(optionId)
      : a.option_id === optionId;
  };

  const question = data.paper[index];
  const answeredCount = data.paper.filter((q) =>
    isAnswered(q.questionId),
  ).length;
  const lowTime = remaining <= 300;

  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col px-4 pb-28 lg:pb-8">
      <p aria-live="polite" className="sr-only">
        {politeMessage}
      </p>
      <p aria-live="assertive" role="alert" className="sr-only">
        {assertiveMessage}
      </p>

      <header className="bg-canvas sticky top-0 z-10 flex items-center justify-between gap-3 py-3">
        <div className="min-w-0">
          <h1 className="text-card-title text-navy-900 truncate">
            {data.examTitle}
          </h1>
          <p className="text-meta text-text-secondary">
            {answeredCount} of {data.paper.length} answered
            {offline ? " · offline" : ""}
          </p>
        </div>
        <p
          className={`text-body shrink-0 rounded-[var(--radius-control)] border px-3 py-1.5 font-semibold tabular-nums ${
            lowTime
              ? "border-danger text-danger"
              : "border-border text-navy-900"
          }`}
        >
          <span className="sr-only">Time remaining </span>
          {formatClock(remaining)}
        </p>
      </header>

      <main className="flex-1 py-4">
        <p className="text-meta text-text-secondary">
          Question {index + 1} of {data.paper.length} &middot; {question.marks}{" "}
          {question.marks === 1 ? "mark" : "marks"}
          {question.negativeMarks > 0
            ? ` · −${question.negativeMarks} if wrong`
            : ""}
          {question.type === "multiple_choice"
            ? " · choose all that apply"
            : ""}
        </p>
        <h2 className="text-section text-text mt-2">{question.body}</h2>

        <fieldset className="mt-6 space-y-3">
          <legend className="sr-only">Options for question {index + 1}</legend>
          {question.options.map((o) => {
            const chosen = isChosen(question, o.id);
            return (
              <label
                key={o.id}
                className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-[var(--radius-card)] border px-4 py-3 transition-colors duration-[var(--duration-standard)] ${
                  chosen
                    ? "border-navy-900 bg-blue-100"
                    : "border-border bg-surface"
                }`}
              >
                <input
                  type={
                    question.type === "multiple_choice" ? "checkbox" : "radio"
                  }
                  name={`q-${question.questionId}`}
                  checked={chosen}
                  onChange={() => choose(question, o.id)}
                  className="size-5 shrink-0 accent-[var(--color-navy-900)]"
                />
                <span className="text-body text-text">{o.body}</span>
              </label>
            );
          })}
        </fieldset>

        {isAnswered(question.questionId) ? (
          <button
            type="button"
            onClick={() => clearAnswer(question)}
            className="text-meta text-text-secondary hover:text-text mt-3 underline"
          >
            Clear my answer
          </button>
        ) : null}
      </main>

      {/* Every question reachable directly; answered state carries a dot inside
          the number, not colour alone. */}
      <nav aria-label="Questions" className="py-3">
        <ol className="flex flex-wrap gap-2">
          {data.paper.map((q, i) => {
            const answered = isAnswered(q.questionId);
            const current = i === index;
            return (
              <li key={q.questionId}>
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-current={current ? "true" : undefined}
                  aria-label={`Question ${i + 1}${answered ? ", answered" : ", not answered"}`}
                  className={`size-11 rounded-[var(--radius-control)] border text-sm font-semibold tabular-nums ${
                    current
                      ? "border-navy-900 bg-navy-900 text-white"
                      : answered
                        ? "border-navy-900 text-navy-900 bg-blue-100"
                        : "border-border text-text-secondary bg-surface"
                  }`}
                >
                  {answered && !current ? `${i + 1}•` : i + 1}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <footer className="bg-canvas fixed inset-x-0 bottom-0 z-10 border-t border-[var(--color-border)] lg:static lg:border-0">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <Button
            variant="secondary"
            disabled={index === 0}
            onClick={() => setIndex(index - 1)}
          >
            Previous
          </Button>

          {confirming ? (
            <div className="flex items-center gap-2">
              <span className="text-meta text-text-secondary hidden sm:inline">
                {data.paper.length - answeredCount > 0
                  ? `${data.paper.length - answeredCount} unanswered.`
                  : "All answered."}
              </span>
              <Button
                variant="secondary"
                onClick={() => setConfirming(false)}
                disabled={submitting}
              >
                Keep going
              </Button>
              <Button
                onClick={() => void doSubmit(false)}
                loading={submitting}
                loadingLabel="Submitting"
              >
                Submit now
              </Button>
            </div>
          ) : index === data.paper.length - 1 ? (
            <Button onClick={() => setConfirming(true)}>Finish exam</Button>
          ) : (
            <Button onClick={() => setIndex(index + 1)}>Next</Button>
          )}
        </div>
      </footer>
    </div>
  );
}
