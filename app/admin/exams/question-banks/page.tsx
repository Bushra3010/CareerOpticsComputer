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
import { BankForm } from "@/features/exams/components/bank-form";
import { getHeadOfficeContext } from "@/features/exams/access";
import { listQuestionBanks } from "@/features/exams/queries";

export const metadata: Metadata = {
  title: "Question banks",
  robots: { index: false },
};

export default async function QuestionBanksPage() {
  const supabase = await createClient();
  const context = await getHeadOfficeContext(supabase);

  if (!context) {
    return (
      <div>
        <h1 className="text-page-title text-navy-900">Question banks</h1>
        <PermissionDeniedState className="mt-8" />
      </div>
    );
  }

  const banks = await listQuestionBanks();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-page-title text-navy-900">Question banks</h1>
        <p className="text-body text-text-secondary mt-1">
          Questions live in a bank and are drawn into exams from it. Answer keys
          are never returned to a student&rsquo;s browser.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New bank</CardTitle>
        </CardHeader>
        <CardContent>
          <BankForm />
        </CardContent>
      </Card>

      {banks.length === 0 ? (
        <EmptyState
          title="No question banks yet"
          description="Create one above, then add questions to it."
        />
      ) : (
        <ResponsiveCollection
          list={
            <MobileList label="Question banks">
              {banks.map((b) => (
                <MobileListItem
                  key={b.id}
                  title={b.name}
                  subtitle={b.description ?? undefined}
                  href={`/admin/exams/question-banks/${b.id}`}
                  status={<StatusBadge status={b.status} />}
                  fields={[
                    { label: "Questions", value: String(b.questionCount) },
                    { label: "Created", value: b.createdOn },
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
                      Bank
                    </th>
                    <th scope="col" className="text-label px-4 py-3 text-right">
                      Questions
                    </th>
                    <th scope="col" className="text-label px-4 py-3">
                      Status
                    </th>
                    <th scope="col" className="text-label px-4 py-3">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {banks.map((b) => (
                    <tr key={b.id} className="border-border border-t">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/exams/question-banks/${b.id}`}
                          className="text-body text-brand-600 font-semibold hover:underline"
                        >
                          {b.name}
                        </Link>
                        {b.description ? (
                          <p className="text-meta text-text-secondary">
                            {b.description}
                          </p>
                        ) : null}
                      </td>
                      <td className="text-body px-4 py-3 text-right tabular-nums">
                        {b.questionCount}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={b.status} />
                      </td>
                      <td className="text-body text-text-secondary px-4 py-3">
                        {b.createdOn}
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
