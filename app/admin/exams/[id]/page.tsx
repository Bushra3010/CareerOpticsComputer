import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { StatusBadge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, PermissionDeniedState } from "@/components/states";
import { createClient } from "@/lib/db/server";
import { getHeadOfficeContext } from "@/features/exams/access";
import {
  AddQuestion,
  AssignCentre,
  PublishButton,
} from "@/features/exams/components/paper-builder";
import {
  formatIst,
  getExam,
  listAvailableQuestions,
  listCentreOptions,
} from "@/features/exams/queries";

export const metadata: Metadata = { title: "Exam", robots: { index: false } };

export default async function ExamPage({
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
        <h1 className="text-page-title text-navy-900">Exam</h1>
        <PermissionDeniedState className="mt-8" />
      </div>
    );
  }

  const exam = await getExam(id);
  if (!exam) notFound();

  const [available, allCentres] = await Promise.all([
    listAvailableQuestions(exam.bankId, exam.id),
    listCentreOptions(),
  ]);

  const assigned = new Set(exam.centres.map((c) => c.centreId));
  const unassigned = allCentres.filter((c) => !assigned.has(c.id));
  const totalMarks = exam.paper.reduce((n, q) => n + q.marks, 0);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/exams"
          className="text-meta text-text-secondary hover:text-text"
        >
          &larr; All exams
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-page-title text-navy-900">{exam.title}</h1>
            <p className="text-meta text-text-secondary mt-1">
              {exam.bankName} &middot; {exam.durationMinutes} minutes &middot;{" "}
              {exam.paper.length} questions, {totalMarks} marks &middot; pass at{" "}
              {exam.passPercent}%
            </p>
            <p className="text-meta text-text-secondary">
              {formatIst(exam.opensAt)} — {formatIst(exam.closesAt)} IST
            </p>
          </div>
          <StatusBadge status={exam.isOpen ? "active" : exam.status} />
        </div>
      </div>

      {exam.status === "draft" ? (
        <Card>
          <CardHeader>
            <CardTitle>Publish</CardTitle>
          </CardHeader>
          <CardContent>
            <PublishButton examId={exam.id} />
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Add a question</CardTitle>
          </CardHeader>
          <CardContent>
            <AddQuestion examId={exam.id} questions={available} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Centres sitting this exam</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <AssignCentre examId={exam.id} centres={unassigned} />
            {exam.centres.length === 0 ? (
              <p className="text-meta text-text-secondary">
                No centres assigned. An exam cannot be published until at least
                one is.
              </p>
            ) : (
              <ul className="text-body text-text space-y-1">
                {exam.centres.map((c) => (
                  <li key={c.id}>
                    {c.name}{" "}
                    <span className="text-meta text-text-secondary">
                      {c.code}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-section text-navy-900">The paper</h2>
        {exam.paper.length === 0 ? (
          <EmptyState
            className="mt-3"
            title="No questions on the paper"
            description="Add them from the bank above. An exam cannot be published while it is empty."
          />
        ) : (
          <ol className="mt-3 space-y-2">
            {exam.paper.map((q, index) => (
              <li
                key={q.id}
                className="border-border bg-surface flex items-start justify-between gap-4 rounded-[var(--radius-card)] border px-4 py-3"
              >
                <p className="text-body text-text">
                  <span className="text-text-secondary">{index + 1}.</span>{" "}
                  {q.body}
                </p>
                <p className="text-meta text-text-secondary shrink-0">
                  {q.typeLabel} &middot; {q.marks}
                </p>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
