import Link from "next/link";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/states";
import { createClient } from "@/lib/db/server";
import { getCurrentCentreContext } from "@/features/centres/current-membership";
import { listStudentsForCentre } from "@/features/students/queries";
import { InviteButton } from "@/features/students/components/invite-button";

export default async function StudentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const context = user
    ? await getCurrentCentreContext(supabase, user.id)
    : null;
  const students = context ? await listStudentsForCentre(context.centreId) : [];

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
        <div className="border-border mt-6 overflow-x-auto rounded-[var(--radius-card)] border">
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
                  <td className="text-body px-4 py-3">{student.full_name}</td>
                  <td className="text-body px-4 py-3">{student.phone}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={student.status} />
                  </td>
                  <td className="px-4 py-3">
                    {student.user_id ? (
                      <span className="text-meta text-text-secondary">
                        Has login
                      </span>
                    ) : (
                      <InviteButton studentId={student.id} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
