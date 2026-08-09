import type { Metadata } from "next";

import { StatusBadge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/states";
import { getStudentResults } from "@/features/results/queries";

export const metadata: Metadata = {
  title: "Results",
  robots: { index: false },
};

export default async function StudentResultsPage() {
  const results = await getStudentResults();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-page-title text-navy-900">Results</h1>
        <p className="text-body text-text-secondary mt-1">
          Published results only — a result appears here the moment your
          centre&rsquo;s publication is made official.
        </p>
      </div>

      {results.length === 0 ? (
        <EmptyState
          title="Nothing published yet"
          description="Your results appear here once they are published."
        />
      ) : (
        <div className="space-y-3">
          {results.map((r, index) => (
            <Card key={`${r.termLabel}-${index}`}>
              <CardHeader className="flex flex-wrap items-start justify-between gap-2">
                <CardTitle>
                  {r.courseName ?? "Course"} — {r.termLabel}
                </CardTitle>
                <StatusBadge status={r.outcome} />
              </CardHeader>
              <CardContent>
                <p className="text-body text-text">
                  {r.obtainedMarks} of {r.maxMarks} marks · {r.percentage}%
                </p>
                <p className="text-meta text-text-secondary mt-1">
                  Published {r.publishedAt.slice(0, 10)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
