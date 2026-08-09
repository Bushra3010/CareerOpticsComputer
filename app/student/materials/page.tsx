import type { Metadata } from "next";

import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/states";
import { listMaterialsForStudent } from "@/features/materials/queries";

export const metadata: Metadata = {
  title: "Study materials",
  robots: { index: false },
};

export default async function StudentMaterialsPage() {
  const materials = await listMaterialsForStudent();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-page-title text-navy-900">Study materials</h1>
        <p className="text-body text-text-secondary mt-1">
          Everything your centre has shared for your course and batch.
        </p>
      </div>

      {materials.length === 0 ? (
        <EmptyState
          title="Nothing shared yet"
          description="Notes, slides and links your centre publishes appear here."
        />
      ) : (
        <div className="space-y-3">
          {materials.map((m) => (
            <Card key={m.id}>
              <CardContent className="p-6">
                <p className="text-body text-text font-semibold">{m.title}</p>
                <p className="text-meta text-text-secondary mt-0.5">
                  {m.scopeLabel} · added {m.addedOn}
                </p>
                {m.description ? (
                  <p className="text-body text-text mt-2">{m.description}</p>
                ) : null}
                {m.href ? (
                  <a
                    href={m.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-body text-brand-600 mt-2 inline-block font-semibold hover:underline"
                  >
                    {m.kind === "file"
                      ? `Download ${m.fileName ?? "file"}`
                      : "Open link"}
                  </a>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
