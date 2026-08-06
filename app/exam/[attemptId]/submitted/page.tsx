import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

import { getSubmittedAttempt } from "@/features/exams/attempt-queries";

export default async function SubmittedPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;
  const attempt = await getSubmittedAttempt(attemptId);
  if (!attempt) notFound();

  const graded = attempt.scoreMarks !== null && attempt.maxMarks !== null;

  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center px-4 text-center">
      <CheckCircle2 className="size-12 text-green-700" aria-hidden="true" />
      <h1 className="text-page-title text-navy-900 mt-4">Exam submitted</h1>
      <p className="text-body text-text-secondary mt-2">
        {attempt.examTitle}
        {attempt.status === "auto_submitted"
          ? " — submitted automatically when time ran out. Everything you had saved was counted."
          : ""}
      </p>

      {graded ? (
        <p className="text-display text-navy-900 mt-6 tabular-nums">
          {attempt.scoreMarks}/{attempt.maxMarks}
        </p>
      ) : (
        <p className="text-body text-text-secondary mt-6">
          Your paper includes questions that are marked by an examiner, so the
          score will appear with your results.
        </p>
      )}

      {/* No pass/fail verdict here, deliberately: PRD §6.7.8 keeps results
          draft until published, and this screen must not front-run that. */}
      <p className="text-meta text-text-secondary mt-4 max-w-prose">
        Marks shown are provisional. Your official result is published
        separately by the academy.
      </p>

      <Link
        href="/student/exams"
        className="text-body text-brand-600 mt-8 font-semibold hover:underline"
      >
        Back to my exams
      </Link>
    </div>
  );
}
