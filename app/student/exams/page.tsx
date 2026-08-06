import type { Metadata } from "next";

import { StatusBadge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/states";
import { formatIst } from "@/features/exams/queries";
import { listStudentExams } from "@/features/exams/attempt-queries";
import { StartExamButton } from "@/features/exams/components/start-exam-button";

export const metadata: Metadata = {
  title: "My exams",
  robots: { index: false },
};

export default async function StudentExamsPage() {
  const exams = await listStudentExams();

  return (
    <div>
      <h1 className="text-page-title text-navy-900">My exams</h1>
      <p className="text-body text-text-secondary mt-1">
        Exams open at their scheduled time. Your answers save automatically
        while you work.
      </p>

      {exams.length === 0 ? (
        <EmptyState
          className="mt-8"
          title="No exams scheduled"
          description="When your centre is assigned an exam, it appears here."
        />
      ) : (
        <ul className="mt-6 space-y-4">
          {exams.map((exam) => {
            const attemptsUsed = exam.attempts.filter(
              (a) => a.status !== "in_progress",
            ).length;
            const canStart =
              exam.isOpen &&
              (exam.resumeAttemptId !== null ||
                attemptsUsed < exam.maxAttempts);
            const lastFinished = exam.attempts
              .filter((a) => a.status !== "in_progress")
              .at(-1);

            return (
              <li key={exam.id}>
                <Card>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="text-card-title text-navy-900">
                          {exam.title}
                        </h2>
                        <p className="text-meta text-text-secondary mt-1">
                          {exam.durationMinutes} minutes &middot;{" "}
                          {formatIst(exam.opensAt)} — {formatIst(exam.closesAt)}{" "}
                          IST
                        </p>
                      </div>
                      <StatusBadge
                        status={exam.isOpen ? "active" : "scheduled"}
                      />
                    </div>

                    {exam.instructions ? (
                      <p className="text-body text-text-secondary max-w-prose">
                        {exam.instructions}
                      </p>
                    ) : null}

                    {lastFinished &&
                    lastFinished.scoreMarks !== null &&
                    lastFinished.maxMarks !== null ? (
                      <p className="text-body text-text">
                        Last attempt:{" "}
                        <span className="font-semibold tabular-nums">
                          {lastFinished.scoreMarks}/{lastFinished.maxMarks}
                        </span>{" "}
                        <span className="text-meta text-text-secondary">
                          (provisional — official results are published
                          separately)
                        </span>
                      </p>
                    ) : null}

                    {canStart ? (
                      <StartExamButton
                        examId={exam.id}
                        resume={exam.resumeAttemptId !== null}
                      />
                    ) : exam.isOpen ? (
                      <p className="text-meta text-text-secondary">
                        You have used all {exam.maxAttempts}{" "}
                        {exam.maxAttempts === 1 ? "attempt" : "attempts"}.
                      </p>
                    ) : (
                      <p className="text-meta text-text-secondary">
                        {exam.notYetOpen
                          ? "Opens at the scheduled time."
                          : "This exam has closed."}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
