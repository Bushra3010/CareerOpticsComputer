import Link from "next/link";
import type { Metadata } from "next";

import { StatusBadge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, PermissionDeniedState } from "@/components/states";
import {
  MobileList,
  MobileListItem,
  ResponsiveCollection,
} from "@/components/tables/mobile-list";
import { createClient } from "@/lib/db/server";
import { getHeadOfficeContext } from "@/features/exams/access";
import { ExamForm } from "@/features/exams/components/exam-form";
import {
  formatIst,
  listBankOptions,
  listExams,
} from "@/features/exams/queries";

export const metadata: Metadata = { title: "Exams", robots: { index: false } };

export default async function ExamsPage() {
  const supabase = await createClient();
  const context = await getHeadOfficeContext(supabase);

  if (!context) {
    return (
      <div>
        <h1 className="text-page-title text-navy-900">Exams</h1>
        <PermissionDeniedState className="mt-8" />
      </div>
    );
  }

  const [exams, banks] = await Promise.all([listExams(), listBankOptions()]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-page-title text-navy-900">Exams</h1>
        <Link
          href="/admin/exams/question-banks"
          className="text-body text-brand-600 font-semibold hover:underline"
        >
          Question banks
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New exam</CardTitle>
        </CardHeader>
        <CardContent>
          <ExamForm banks={banks} />
        </CardContent>
      </Card>

      {exams.length === 0 ? (
        <EmptyState
          title="No exams yet"
          description="An exam draws a fixed paper from one question bank and is assigned to centres."
        />
      ) : (
        <ResponsiveCollection
          list={
            <MobileList label="Exams">
              {exams.map((e) => (
                <MobileListItem
                  key={e.id}
                  title={e.title}
                  subtitle={e.bankName}
                  href={`/admin/exams/${e.id}`}
                  status={
                    <StatusBadge status={e.isOpen ? "active" : e.status} />
                  }
                  fields={[
                    { label: "Opens", value: formatIst(e.opensAt) },
                    { label: "Questions", value: String(e.questionCount) },
                    { label: "Centres", value: String(e.centreCount) },
                    { label: "Duration", value: `${e.durationMinutes} min` },
                  ]}
                />
              ))}
            </MobileList>
          }
          table={
            <div className="border-border rounded-[var(--radius-card)] border">
              <table className="w-full text-left">
                <thead className="bg-surface-subtle">
                  <tr>
                    <th scope="col" className="text-label px-4 py-3">
                      Exam
                    </th>
                    <th scope="col" className="text-label px-4 py-3">
                      Window (IST)
                    </th>
                    <th scope="col" className="text-label px-4 py-3 text-right">
                      Questions
                    </th>
                    <th scope="col" className="text-label px-4 py-3 text-right">
                      Centres
                    </th>
                    <th scope="col" className="text-label px-4 py-3">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {exams.map((e) => (
                    <tr key={e.id} className="border-border border-t">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/exams/${e.id}`}
                          className="text-body text-brand-600 font-semibold hover:underline"
                        >
                          {e.title}
                        </Link>
                        <p className="text-meta text-text-secondary">
                          {e.bankName} &middot; {e.durationMinutes} min
                        </p>
                      </td>
                      <td className="text-meta text-text-secondary px-4 py-3">
                        {formatIst(e.opensAt)} — {formatIst(e.closesAt)}
                      </td>
                      <td className="text-body px-4 py-3 text-right tabular-nums">
                        {e.questionCount}
                      </td>
                      <td className="text-body px-4 py-3 text-right tabular-nums">
                        {e.centreCount}
                      </td>
                      <td className="px-4 py-3">
                        {/* "Open" is a fact about the clock, so it is shown
                            instead of the editorial status while it holds. */}
                        <StatusBadge status={e.isOpen ? "active" : e.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          }
        />
      )}
    </div>
  );
}
