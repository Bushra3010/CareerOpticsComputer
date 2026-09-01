import Link from "next/link";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import {
  MobileList,
  MobileListItem,
  ResponsiveCollection,
} from "@/components/tables/mobile-list";
import { EmptyState } from "@/components/states";
import { createClient } from "@/lib/db/server";
import { businessDate } from "@/lib/dates";
import { getCurrentCentreContext } from "@/features/centres/current-membership";
import { getPermissionCodes } from "@/features/centres/nav";
import { listStudentsForCentre } from "@/features/students/queries";
import { PortalCredentialsButton } from "@/features/students/components/portal-credentials-button";
import { listPublishedCourses } from "@/features/academics/queries";
import { BatchManager } from "@/features/batches/components/batch-manager";
import {
  listBatchesForCentre,
  listFacultyOptions,
} from "@/features/batches/queries";

export default async function StudentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const context = user
    ? await getCurrentCentreContext(supabase, user.id)
    : null;

  // Batch management is shown here as well as on its own page, so a centre can
  // set up a batch and place students without leaving this screen. Gated on
  // `batch.manage` — the same permission the actions require — so a role that
  // could only ever be refused is not shown the forms at all.
  const [students, permissionCodes] = await Promise.all([
    context ? listStudentsForCentre(context.centreId) : [],
    context && user
      ? getPermissionCodes(supabase, user.id, context.centreId)
      : new Set<string>(),
  ]);
  const canManageBatches = permissionCodes.has("batch.manage");

  const [batches, courses, faculty] =
    context && canManageBatches
      ? await Promise.all([
          listBatchesForCentre(context.centreId),
          listPublishedCourses(),
          listFacultyOptions(context.centreId),
        ])
      : [[], [], []];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-page-title text-navy-900">Students</h1>
        <Button asChild>
          <Link href="/centre/students/new">Admit student</Link>
        </Button>
      </div>

      {students.length === 0 ? (
        <EmptyState
          className="mt-8"
          title="No students yet"
          description="Admitted students will appear here."
        />
      ) : (
        <ResponsiveCollection
          list={
            <MobileList className="mt-6" label="Students">
              {students.map((student) => (
                <MobileListItem
                  key={student.id}
                  title={student.full_name}
                  subtitle={student.registration_number}
                  href={`/centre/students/${student.id}`}
                  status={<StatusBadge status={student.status} />}
                  fields={[{ label: "Phone", value: student.phone }]}
                  // Portal state is not repeated as a field: the action below
                  // already says "Has login" or offers to create one, and the
                  // same words twice in a card this small reads as a bug.
                  action={
                    <PortalCredentialsButton
                      studentId={student.id}
                      hasLogin={Boolean(student.user_id)}
                    />
                  }
                />
              ))}
            </MobileList>
          }
          table={
            <div className="border-border mt-6 rounded-[var(--radius-card)] border">
              <table className="w-full text-left">
                <thead className="bg-surface-subtle">
                  <tr>
                    <th className="text-label px-4 py-3">Registration no.</th>
                    <th className="text-label px-4 py-3">Name</th>
                    <th className="text-label px-4 py-3">Phone</th>
                    <th className="text-label px-4 py-3">Status</th>
                    <th className="text-label px-4 py-3">Portal</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id} className="border-border border-t">
                      <td className="text-body px-4 py-3 font-semibold">
                        {student.registration_number}
                      </td>
                      <td className="text-body px-4 py-3">
                        <Link
                          href={`/centre/students/${student.id}`}
                          className="font-semibold text-blue-700 hover:underline"
                        >
                          {student.full_name}
                        </Link>
                      </td>
                      <td className="text-body px-4 py-3">{student.phone}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={student.status} />
                      </td>
                      <td className="px-4 py-3">
                        <PortalCredentialsButton
                          studentId={student.id}
                          hasLogin={Boolean(student.user_id)}
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

      {canManageBatches ? (
        <section className="border-border mt-10 border-t pt-8">
          <h2 className="text-section text-navy-900">Batches and timetable</h2>
          <p className="text-body text-text-secondary mt-1 max-w-prose">
            A batch groups students taking one course together on a weekly
            timetable. Create one here, give it slots, then place a student into
            it from their own page.
          </p>
          <div className="mt-4">
            <BatchManager
              batches={batches}
              courses={courses.map((c) => ({ id: c.id, name: c.name }))}
              faculty={faculty}
              today={businessDate()}
            />
          </div>
        </section>
      ) : null}
    </div>
  );
}
