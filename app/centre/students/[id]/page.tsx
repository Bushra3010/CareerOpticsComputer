import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/states";
import { DocumentUpload } from "@/features/students/components/document-upload";
import { InviteButton } from "@/features/students/components/invite-button";
import {
  documentKindLabel,
  listStudentDocuments,
} from "@/features/students/document-queries";
import { getStudentProfile } from "@/features/students/queries";
import { PlaceStudentSelect } from "@/features/batches/components/place-student-select";
import { listBatchOptions } from "@/features/batches/queries";
import { getCurrentCentreContext } from "@/features/centres/current-membership";
import { createClient } from "@/lib/db/server";

export const metadata: Metadata = {
  title: "Student",
  robots: { index: false },
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-meta text-text-secondary uppercase">{label}</dt>
      <dd className="text-body text-text mt-0.5">{value}</dd>
    </div>
  );
}

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const student = await getStudentProfile(id);
  if (!student) notFound();

  const documents = await listStudentDocuments(id);
  const photo = documents.find((d) => d.kind === "photo" && d.url);

  // Batch options come from the viewer's own centre. A viewer without
  // `batch.manage` gets an empty list from RLS, and the select is not
  // rendered at all — the action would refuse them anyway.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const context = user
    ? await getCurrentCentreContext(supabase, user.id)
    : null;
  const batches = context ? await listBatchOptions(context.centreId) : [];

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/centre/students"
          className="text-meta text-text-secondary hover:text-text"
        >
          &larr; All students
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            {photo?.url ? (
              // eslint-disable-next-line @next/next/no-img-element -- signed URL, expires in minutes; next/image would cache it
              <img
                src={photo.url}
                alt={`Photograph of ${student.fullName}`}
                className="border-border h-20 w-20 rounded-[var(--radius-card)] border object-cover"
              />
            ) : (
              <div
                aria-hidden="true"
                className="bg-surface-subtle border-border text-text-muted flex h-20 w-20 items-center justify-center rounded-[var(--radius-card)] border text-2xl font-semibold"
              >
                {student.fullName.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-page-title text-navy-900">
                {student.fullName}
              </h1>
              <p className="text-meta text-text-secondary mt-1">
                {student.registrationNumber} &middot; admitted{" "}
                {student.admittedOn}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={student.status} />
            {student.hasLogin ? (
              <span className="text-meta text-text-secondary">Has login</span>
            ) : (
              <InviteButton studentId={student.id} />
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2">
              <DetailRow label="Phone" value={student.phone} />
              <DetailRow label="Email" value={student.email ?? "—"} />
              <DetailRow label="Guardian" value={student.guardianName ?? "—"} />
              <DetailRow
                label="Date of birth"
                value={student.dateOfBirth ?? "—"}
              />
              <DetailRow
                label="Government ID"
                value={
                  student.govIdLast4
                    ? `ending ${student.govIdLast4}`
                    : "Not recorded"
                }
              />
              <DetailRow label="Address" value={student.address ?? "—"} />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Enrolments</CardTitle>
          </CardHeader>
          <CardContent>
            {student.enrolments.length === 0 ? (
              <p className="text-body text-text-secondary">
                Not enrolled on any course yet.
              </p>
            ) : (
              <ul className="space-y-3">
                {student.enrolments.map((e) => (
                  <li
                    key={e.id}
                    className="flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-body text-text font-semibold">
                        {e.courseName}
                      </p>
                      <p className="text-meta text-text-secondary">
                        Enrolled {e.enrolledOn}
                        {e.batchLabel ? ` · ${e.batchLabel}` : ""}
                      </p>
                      {batches.length > 0 ? (
                        <div className="mt-2">
                          <PlaceStudentSelect
                            enrolmentId={e.id}
                            currentBatchId={e.batchId}
                            batches={batches}
                          />
                        </div>
                      ) : null}
                    </div>
                    <StatusBadge status={e.status} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <DocumentUpload studentId={student.id} />

          {documents.length === 0 ? (
            <EmptyState
              title="No documents yet"
              description="Upload a photograph for the certificate and a proof of identity for the admission record."
            />
          ) : (
            <ul className="divide-border divide-y">
              {documents.map((d) => (
                <li
                  key={d.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3"
                >
                  <div>
                    <p className="text-body text-text font-semibold">
                      {documentKindLabel(d.kind)}
                    </p>
                    <p className="text-meta text-text-secondary">
                      {d.originalName} &middot;{" "}
                      {Math.max(1, Math.round(d.sizeBytes / 1024))} KB &middot;
                      uploaded {d.uploadedOn}
                    </p>
                  </div>
                  {d.url ? (
                    <a
                      href={d.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-body text-brand-600 font-semibold hover:underline"
                    >
                      Open
                    </a>
                  ) : (
                    <span className="text-meta text-text-secondary">
                      Unavailable
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
