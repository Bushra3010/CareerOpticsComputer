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
import { getCurrentCentreContext } from "@/features/centres/current-membership";
import { getPermissionCodes } from "@/features/centres/nav";
import {
  listEnrolmentsForCentre,
  listStudentsForCentre,
} from "@/features/students/queries";
import { PortalCredentialsButton } from "@/features/students/components/portal-credentials-button";
import { StudentBatchCell } from "@/features/batches/components/student-batch-cell";
import { listBatchesForCentre } from "@/features/batches/queries";

export default async function StudentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const context = user
    ? await getCurrentCentreContext(supabase, user.id)
    : null;

  // `batch.manage` is what placing a student actually requires, so it decides
  // whether the batch column offers a picker or just reports where the student
  // already is. `batches_select` only needs `batch.read`, so a viewer can see
  // the batch and its timetable either way.
  const [students, enrolments, batches, permissionCodes] = await Promise.all([
    context ? listStudentsForCentre(context.centreId) : [],
    context ? listEnrolmentsForCentre(context.centreId) : [],
    context ? listBatchesForCentre(context.centreId) : [],
    context && user
      ? getPermissionCodes(supabase, user.id, context.centreId)
      : new Set<string>(),
  ]);

  const canManageBatches = permissionCodes.has("batch.manage");
  const batchesById = new Map(batches.map((b) => [b.id, b]));

  // Only active batches can take a placement, so a retired one is not offered
  // even though it still has to render for a student already in it.
  const options = batches
    .filter((b) => b.status === "active")
    .map((b) => ({ id: b.id, label: `${b.code} — ${b.name}` }));

  const enrolmentsByStudent = new Map<string, typeof enrolments>();
  for (const e of enrolments) {
    const list = enrolmentsByStudent.get(e.studentId) ?? [];
    list.push(e);
    enrolmentsByStudent.set(e.studentId, list);
  }

  const batchCell = (studentId: string) => (
    <StudentBatchCell
      enrolments={enrolmentsByStudent.get(studentId) ?? []}
      batchesById={batchesById}
      options={options}
      canManage={canManageBatches}
      anyBatchesExist={options.length > 0}
    />
  );

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
                  fields={[
                    { label: "Phone", value: student.phone },
                    {
                      label: "Batch and timetable",
                      value: batchCell(student.id),
                    },
                  ]}
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
                    <th className="text-label px-4 py-3">
                      Batch and timetable
                    </th>
                    <th className="text-label px-4 py-3">Portal</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr
                      key={student.id}
                      className="border-border border-t align-top"
                    >
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
                      <td className="px-4 py-3">{batchCell(student.id)}</td>
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
    </div>
  );
}
