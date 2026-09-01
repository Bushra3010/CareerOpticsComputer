import type { Metadata } from "next";

import { PermissionDeniedState } from "@/components/states";
import { createClient } from "@/lib/db/server";
import { businessDate } from "@/lib/dates";
import { getCurrentCentreContext } from "@/features/centres/current-membership";
import { listPublishedCourses } from "@/features/academics/queries";
import { BatchManager } from "@/features/batches/components/batch-manager";
import {
  listBatchesForCentre,
  listFacultyOptions,
} from "@/features/batches/queries";

export const metadata: Metadata = {
  title: "Batches",
  robots: { index: false },
};

export default async function CentreBatchesPage() {
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
        <h1 className="text-page-title text-navy-900">Batches</h1>
        <PermissionDeniedState className="mt-8" />
      </div>
    );
  }

  const [batches, courses, faculty] = await Promise.all([
    listBatchesForCentre(context.centreId),
    listPublishedCourses(),
    listFacultyOptions(context.centreId),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-page-title text-navy-900">Batches</h1>
        <p className="text-body text-text-secondary mt-1">
          A batch groups students taking one course together on a weekly
          timetable. Students are placed into a batch from their enrolment; a
          batch with a capacity refuses the place that would exceed it.
        </p>
      </div>

      <BatchManager
        batches={batches}
        courses={courses.map((c) => ({ id: c.id, name: c.name }))}
        faculty={faculty}
        today={businessDate()}
      />
    </div>
  );
}
