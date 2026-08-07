import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { StatusBadge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, PermissionDeniedState } from "@/components/states";
import { createClient } from "@/lib/db/server";
import { getHeadOfficeContext } from "@/features/exams/access";
import { QuestionForm } from "@/features/exams/components/question-form";
import { RetireQuestionButton } from "@/features/exams/components/lifecycle-buttons";
import { getQuestionBank } from "@/features/exams/queries";

export const metadata: Metadata = {
  title: "Question bank",
  robots: { index: false },
};

export default async function QuestionBankPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const context = await getHeadOfficeContext(supabase);

  if (!context) {
    return (
      <div>
        <h1 className="text-page-title text-navy-900">Question bank</h1>
        <PermissionDeniedState className="mt-8" />
      </div>
    );
  }

  const bank = await getQuestionBank(id);
  if (!bank) notFound();

  const totalMarks = bank.questions.reduce((n, q) => n + q.marks, 0);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/exams/question-banks"
          className="text-meta text-text-secondary hover:text-text"
        >
          &larr; All question banks
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-page-title text-navy-900">{bank.name}</h1>
            <p className="text-meta text-text-secondary mt-1">
              {bank.questions.length}{" "}
              {bank.questions.length === 1 ? "question" : "questions"} &middot;{" "}
              {totalMarks} marks in total
            </p>
          </div>
          <StatusBadge status={bank.status} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add a question</CardTitle>
        </CardHeader>
        <CardContent>
          <QuestionForm bankId={bank.id} />
        </CardContent>
      </Card>

      {bank.questions.length === 0 ? (
        <EmptyState
          title="No questions yet"
          description="Add the first one above. A bank with no questions cannot be drawn into an exam."
        />
      ) : (
        <ol className="space-y-4">
          {bank.questions.map((q, index) => (
            <li key={q.id}>
              <Card>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <p className="text-body text-text font-semibold">
                      <span className="text-text-secondary">{index + 1}.</span>{" "}
                      {q.body}
                    </p>
                    <div className="flex shrink-0 items-center gap-3">
                      <StatusBadge status={q.status} />
                      {q.status !== "retired" ? (
                        <RetireQuestionButton
                          bankId={bank.id}
                          questionId={q.id}
                        />
                      ) : null}
                    </div>
                  </div>

                  <p className="text-meta text-text-secondary">
                    {q.typeLabel} &middot; {q.marks}{" "}
                    {q.marks === 1 ? "mark" : "marks"}
                    {q.negativeMarks > 0
                      ? ` · −${q.negativeMarks} if wrong`
                      : ""}{" "}
                    &middot; {q.difficulty}
                  </p>

                  <ul className="space-y-1">
                    {q.options.map((o) => (
                      <li
                        key={o.id}
                        className="text-body text-text flex items-start gap-2"
                      >
                        {/* The tick is the answer key, so it carries a word as
                            well as a mark — status is never colour or glyph
                            alone. */}
                        <span
                          className={
                            o.isCorrect
                              ? "font-semibold text-green-700"
                              : "text-text-muted"
                          }
                          aria-hidden="true"
                        >
                          {o.isCorrect ? "✓" : "○"}
                        </span>
                        <span>
                          {o.body}
                          {o.isCorrect ? (
                            <span className="text-meta ml-2 font-semibold text-green-700">
                              Correct
                            </span>
                          ) : null}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
