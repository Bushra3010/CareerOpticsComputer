import Link from "next/link";
import { redirect } from "next/navigation";

import { StatusBadge } from "@/components/ui/badge";
import {
  MobileList,
  MobileListItem,
  ResponsiveCollection,
} from "@/components/tables/mobile-list";
import { EmptyState } from "@/components/states";
import { createClient } from "@/lib/db/server";
import { getCurrentCentreContext } from "@/features/centres/current-membership";
import { listPublishedCourses } from "@/features/academics/queries";
import { listPublications } from "@/features/results/queries";
import { CreatePublicationForm } from "@/features/results/components/create-publication-form";

export default async function ResultsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const context = user
    ? await getCurrentCentreContext(supabase, user.id)
    : null;
  if (!context) redirect("/centre");

  const [publications, courses] = await Promise.all([
    listPublications(context.centreId),
    listPublishedCourses(),
  ]);

  return (
    <div>
      <h1 className="text-page-title text-navy-900">Results</h1>

      <h2 className="text-section text-navy-900 mt-8">New result set</h2>
      <div className="mt-3 max-w-2xl">
        <CreatePublicationForm courses={courses} />
      </div>

      <h2 className="text-section text-navy-900 mt-10">Result sets</h2>
      {publications.length === 0 ? (
        <EmptyState
          className="mt-4"
          title="No result sets yet"
          description="Create one above to start entering marks."
        />
      ) : (
        <ResponsiveCollection
          list={
            <MobileList className="mt-3" label="Result sets">
              {publications.map((p) => (
                <MobileListItem
                  key={p.id}
                  title={p.courseName ?? "Course"}
                  subtitle={p.termLabel}
                  href={`/centre/results/${p.id}`}
                  status={
                    <StatusBadge
                      status={p.publishedAt ? "published" : "draft"}
                      label={p.publishedAt ? "Published" : "Draft"}
                    />
                  }
                  fields={[
                    { label: "Version", value: `v${p.version}`, numeric: true },
                    { label: "Marked", value: p.resultCount, numeric: true },
                  ]}
                />
              ))}
            </MobileList>
          }
          table={
            <div className="border-border mt-3 rounded-[var(--radius-card)] border">
              <table className="w-full text-left">
                <thead className="bg-surface-subtle">
                  <tr>
                    <th scope="col" className="text-label px-4 py-3">
                      Course
                    </th>
                    <th scope="col" className="text-label px-4 py-3">
                      Term
                    </th>
                    <th scope="col" className="text-label px-4 py-3">
                      Version
                    </th>
                    <th scope="col" className="text-label px-4 py-3">
                      Marked
                    </th>
                    <th scope="col" className="text-label px-4 py-3">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {publications.map((p) => (
                    <tr key={p.id} className="border-border border-t">
                      <td className="text-body px-4 py-3">
                        <Link
                          href={`/centre/results/${p.id}`}
                          className="font-semibold text-blue-700"
                        >
                          {p.courseName ?? "Course"}
                        </Link>
                      </td>
                      <td className="text-body px-4 py-3">{p.termLabel}</td>
                      <td className="text-body px-4 py-3 tabular-nums">
                        v{p.version}
                      </td>
                      <td className="text-body px-4 py-3 tabular-nums">
                        {p.resultCount}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge
                          status={p.publishedAt ? "published" : "draft"}
                          label={p.publishedAt ? "Published" : "Draft"}
                        />
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
