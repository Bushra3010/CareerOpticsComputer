import type { Metadata } from "next";

import { StatusBadge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, PermissionDeniedState } from "@/components/states";
import { createClient } from "@/lib/db/server";
import { getCurrentCentreContext } from "@/features/centres/current-membership";
import { listPublishedCourses } from "@/features/academics/queries";
import { listBatchOptions } from "@/features/batches/queries";
import {
  CreateMaterialForm,
  MaterialStatusButton,
} from "@/features/materials/components/material-forms";
import { listMaterialsForCentre } from "@/features/materials/queries";

export const metadata: Metadata = {
  title: "Study materials",
  robots: { index: false },
};

export default async function CentreMaterialsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const context = user
    ? await getCurrentCentreContext(supabase, user.id)
    : null;

  if (!context) {
    return (
      <div>
        <h1 className="text-page-title text-navy-900">Study materials</h1>
        <PermissionDeniedState className="mt-8" />
      </div>
    );
  }

  const [materials, courses, batches] = await Promise.all([
    listMaterialsForCentre(),
    listPublishedCourses(),
    listBatchOptions(context.centreId),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-page-title text-navy-900">Study materials</h1>
        <p className="text-body text-text-secondary mt-1">
          Files and links for your students. Narrow a material to a course or a
          single batch, or leave both empty to share it with everyone at your
          centre.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New material</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateMaterialForm
            courses={courses.map((c) => ({ id: c.id, name: c.name }))}
            batches={batches}
          />
        </CardContent>
      </Card>

      {materials.length === 0 ? (
        <EmptyState
          title="Nothing shared yet"
          description="Publish a file or a link above and it appears for the students in scope."
        />
      ) : (
        <ul className="space-y-3">
          {materials.map((m) => (
            <li
              key={m.id}
              className="border-border bg-surface rounded-[var(--radius-card)] border p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-body text-text font-semibold">{m.title}</p>
                  <p className="text-meta text-text-secondary">
                    {m.scopeLabel} · {m.kind === "file" ? "File" : "Link"} ·
                    added {m.addedOn}
                  </p>
                  {m.description ? (
                    <p className="text-meta text-text mt-1">{m.description}</p>
                  ) : null}
                  {m.href ? (
                    <a
                      href={m.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-meta text-brand-600 mt-1 inline-block font-semibold hover:underline"
                    >
                      {m.kind === "file"
                        ? (m.fileName ?? "Open file")
                        : "Open link"}
                    </a>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={m.status} />
                  <MaterialStatusButton
                    materialId={m.id}
                    currentStatus={m.status}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
