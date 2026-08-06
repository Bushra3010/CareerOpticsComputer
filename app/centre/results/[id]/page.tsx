import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { StatusBadge } from "@/components/ui/badge";
import {
  MobileList,
  MobileListItem,
  ResponsiveCollection,
} from "@/components/tables/mobile-list";
import { createClient } from "@/lib/db/server";
import { getCurrentCentreContext } from "@/features/centres/current-membership";
import { getPublicationDetail } from "@/features/results/queries";
import { ImportAttemptsButton } from "@/features/results/components/import-attempts-button";
import {
  MarkSheetForm,
  PublishButton,
} from "@/features/results/components/mark-sheet-form";
import { IssueCertificateButton } from "@/features/certificates/components/issue-button";

export default async function PublicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const context = user
    ? await getCurrentCentreContext(supabase, user.id)
    : null;
  if (!context) redirect("/centre");

  const detail = await getPublicationDetail(context.centreId, id);
  if (!detail) notFound();

  const marked = detail.rows.filter((r) => r.obtainedMarks !== null);
  const defaultMax = marked[0]?.maxMarks ?? 100;

  return (
    <div>
      <Link
        href="/centre/results"
        className="text-body font-semibold text-blue-700"
      >
        ← All results
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="text-page-title text-navy-900">
          {detail.courseName ?? "Course"}
        </h1>
        <StatusBadge
          status={detail.publishedAt ? "published" : "draft"}
          label={detail.publishedAt ? "Published" : "Draft"}
        />
      </div>
      <p className="text-body text-text-secondary mt-1">
        {detail.termLabel} · version {detail.version}
      </p>

      {detail.publishedAt ? (
        <div className="mt-8">
          <p className="text-body text-text-secondary max-w-prose">
            These results are published and can no longer be edited. Students
            enrolled in this course can see their own result. To correct a mark,
            create a new version from the results list.
          </p>
          <ResponsiveCollection
            list={
              <MobileList className="mt-4" label="Published results">
                {detail.rows.map((r) => (
                  <MobileListItem
                    key={r.enrolmentId}
                    title={r.studentName}
                    subtitle={r.registrationNumber}
                    status={
                      r.outcome ? (
                        <StatusBadge
                          status={r.outcome === "fail" ? "failed" : "passed"}
                          label={
                            r.outcome === "distinction"
                              ? "Distinction"
                              : r.outcome === "pass"
                                ? "Pass"
                                : "Fail"
                          }
                        />
                      ) : (
                        <span className="text-meta text-text-secondary">
                          Not marked
                        </span>
                      )
                    }
                    fields={[
                      {
                        label: "Marks",
                        value:
                          r.obtainedMarks === null
                            ? "—"
                            : `${r.obtainedMarks}/${r.maxMarks}`,
                        numeric: true,
                      },
                    ]}
                  />
                ))}
              </MobileList>
            }
            table={
              <div className="border-border mt-4 rounded-[var(--radius-card)] border">
                <table className="w-full text-left">
                  <thead className="bg-surface-subtle">
                    <tr>
                      <th scope="col" className="text-label px-4 py-3">
                        Registration no.
                      </th>
                      <th scope="col" className="text-label px-4 py-3">
                        Name
                      </th>
                      <th
                        scope="col"
                        className="text-label px-4 py-3 text-right"
                      >
                        Marks
                      </th>
                      <th scope="col" className="text-label px-4 py-3">
                        Outcome
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.rows.map((r) => (
                      <tr
                        key={r.enrolmentId}
                        className="border-border border-t"
                      >
                        <td className="text-body px-4 py-3">
                          {r.registrationNumber}
                        </td>
                        <td className="text-body px-4 py-3">{r.studentName}</td>
                        <td className="text-body px-4 py-3 text-right tabular-nums">
                          {r.obtainedMarks === null
                            ? "—"
                            : `${r.obtainedMarks}/${r.maxMarks}`}
                        </td>
                        <td className="px-4 py-3">
                          {r.outcome ? (
                            <StatusBadge
                              status={
                                r.outcome === "fail" ? "failed" : "passed"
                              }
                              label={
                                r.outcome === "distinction"
                                  ? "Distinction"
                                  : r.outcome === "pass"
                                    ? "Pass"
                                    : "Fail"
                              }
                            />
                          ) : (
                            <span className="text-meta text-text-secondary">
                              Not marked
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            }
          />
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          <ImportAttemptsButton publicationId={detail.id} />
          <MarkSheetForm
            publicationId={detail.id}
            rows={detail.rows}
            defaultMax={defaultMax}
          />
          {marked.length > 0 ? (
            <PublishButton publicationId={detail.id} />
          ) : null}
        </div>
      )}
    </div>
  );
}
