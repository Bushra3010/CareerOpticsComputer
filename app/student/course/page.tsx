import type { Metadata } from "next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/states";
import { getStudentSelfProfile } from "@/features/student-portal/queries";

export const metadata: Metadata = {
  title: "My course",
  robots: { index: false },
};

export default async function StudentCoursePage() {
  const profile = await getStudentSelfProfile();

  if (!profile || !profile.course) {
    return (
      <div>
        <h1 className="text-page-title text-navy-900">My course</h1>
        <EmptyState
          className="mt-8"
          title="No enrolment yet"
          description="Your enrolment appears here once your centre records it."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-page-title text-navy-900">My course</h1>

      <Card>
        <CardHeader>
          <CardTitle>{profile.course.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-meta text-text-secondary">Duration</dt>
              <dd className="text-body text-text mt-0.5">
                {profile.course.durationLabel ?? "As scheduled by your centre"}
              </dd>
            </div>
            <div>
              <dt className="text-meta text-text-secondary">Centre</dt>
              <dd className="text-body text-text mt-0.5">
                {profile.centreName ?? "—"}
              </dd>
            </div>
          </dl>
          {profile.course.description ? (
            <p className="text-body text-text max-w-prose whitespace-pre-wrap">
              {profile.course.description}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
