import { notFound } from "next/navigation";

import { ExamRunner } from "@/features/exams/components/runner";
import { getRunnerData } from "@/features/exams/attempt-queries";

export default async function AttemptPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;
  const data = await getRunnerData(attemptId);

  // "Not yours", "already submitted" and "does not exist" are deliberately the
  // same page — the runner URL carries an attempt id, and which of those three
  // is true is not information for whoever typed it.
  if (!data) notFound();

  return <ExamRunner data={data} />;
}
