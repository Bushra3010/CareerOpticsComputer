import type { Metadata } from "next";

import { StatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/states";
import {
  MobileList,
  MobileListItem,
  ResponsiveCollection,
} from "@/components/tables/mobile-list";
import { formatIst, listExams } from "@/features/exams/queries";
import { CentreExamForm } from "@/features/exams/components/centre-exam-form";
import { createClient } from "@/lib/db/server";
import { getCurrentCentreContext } from "@/features/centres/current-membership";
import { getPermissionCodes } from "@/features/centres/nav";

export const metadata: Metadata = { title: "Exams", robots: { index: false } };

/**
 * Read-only, deliberately.
 *
 * Build plan §4 gives every centre role read-only on `exam.*`, so there is no
 * primary action on this page and no eligibility control — who sits an exam is
 * set by head office until C8's sixth item is decided. The paper itself is not
 * here either: `exam_questions` is time-windowed (proof R18) and a centre
 * reading tomorrow's questions today is the thing that policy exists to stop.
 */
export default async function CentreExamsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const context = user
    ? await getCurrentCentreContext(supabase, user.id)
    : null;

  // `exam.author` is what migration 0056 gates centre-written exams on, and it
  // is held by owners and managers only — a counsellor keeps the read-only
  // page 0023 gave them rather than a button that would be refused.
  const [exams, permissionCodes] = await Promise.all([
    listExams(),
    context && user
      ? getPermissionCodes(supabase, user.id, context.centreId)
      : new Set<string>(),
  ]);
  const canAuthor = permissionCodes.has("exam.author");

  // Only this centre's own banks: an exam may not draw from head office's, and
  // the trigger in 0056 would refuse it anyway.
  const { data: bankRows } =
    canAuthor && context
      ? await supabase
          .from("question_banks")
          .select("id, name")
          .eq("centre_id", context.centreId)
          .eq("status", "active")
          .order("name")
      : { data: [] };
  const banks = bankRows ?? [];

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-page-title text-navy-900">Exams</h1>
          <p className="text-body text-text-secondary mt-1">
            {canAuthor
              ? "Exams your centre has been assigned, and the ones it has written itself."
              : "Exams your centre has been assigned. Papers open at the scheduled time."}
          </p>
        </div>
        {canAuthor ? <CentreExamForm banks={banks} /> : null}
      </div>

      {exams.length === 0 ? (
        <EmptyState
          className="mt-8"
          title="No exams scheduled"
          description="Head office assigns exams to your centre. They appear here once published."
        />
      ) : (
        <div className="mt-6">
          <ResponsiveCollection
            list={
              <MobileList label="Exams">
                {exams.map((e) => (
                  <MobileListItem
                    key={e.id}
                    title={e.title}
                    subtitle={`${e.durationMinutes} minutes`}
                    status={
                      <StatusBadge status={e.isOpen ? "active" : "scheduled"} />
                    }
                    fields={[
                      { label: "Opens", value: formatIst(e.opensAt) },
                      { label: "Closes", value: formatIst(e.closesAt) },
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
                        Opens (IST)
                      </th>
                      <th scope="col" className="text-label px-4 py-3">
                        Closes (IST)
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
                          <p className="text-body text-text font-semibold">
                            {e.title}
                          </p>
                          <p className="text-meta text-text-secondary">
                            {e.durationMinutes} minutes
                          </p>
                        </td>
                        <td className="text-body text-text px-4 py-3">
                          {formatIst(e.opensAt)}
                        </td>
                        <td className="text-body text-text px-4 py-3">
                          {formatIst(e.closesAt)}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge
                            status={e.isOpen ? "active" : "scheduled"}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            }
          />
        </div>
      )}
    </div>
  );
}
