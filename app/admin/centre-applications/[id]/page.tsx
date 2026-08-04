import { notFound } from "next/navigation";

import { StatusBadge } from "@/components/ui/badge";
import { ReviewActions } from "@/features/centre-applications/components/review-actions";
import { getCentreApplication } from "@/features/centre-applications/queries";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CentreApplicationDetailPage({
  params,
}: PageProps) {
  const { id } = await params;
  const application = await getCentreApplication(id);

  if (!application) {
    notFound();
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <h1 className="text-page-title text-navy-900">
          {application.application_number}
        </h1>
        <StatusBadge status={application.status} />
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div>
          <p className="text-meta text-text-secondary uppercase">Applicant</p>
          <p className="text-body text-text mt-1">
            {application.applicant_name}
          </p>
          <p className="text-body text-text-secondary">
            {application.applicant_email}
          </p>
          <p className="text-body text-text-secondary">
            {application.applicant_phone}
          </p>
        </div>
        <div>
          <p className="text-meta text-text-secondary uppercase">
            Proposed centre
          </p>
          <p className="text-body text-text mt-1">
            {application.proposed_centre_name}
          </p>
          <p className="text-body text-text-secondary">
            {application.address}, {application.city}, {application.state} -{" "}
            {application.pincode}
          </p>
        </div>
      </div>

      {application.message ? (
        <div className="mt-6">
          <p className="text-meta text-text-secondary uppercase">Message</p>
          <p className="text-body text-text mt-1 whitespace-pre-line">
            {application.message}
          </p>
        </div>
      ) : null}

      {application.status === "submitted" ||
      application.status === "under_review" ? (
        <div className="mt-8">
          <ReviewActions applicationId={application.id} />
        </div>
      ) : null}
    </div>
  );
}
