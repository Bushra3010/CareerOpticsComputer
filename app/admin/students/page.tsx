import type { Metadata } from "next";

import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState, PermissionDeniedState } from "@/components/states";
import {
  MobileList,
  MobileListItem,
  ResponsiveCollection,
} from "@/components/tables/mobile-list";
import { createClient } from "@/lib/db/server";
import { getHeadOfficeContext } from "@/features/exams/access";
import { listStudentsForAdmin } from "@/features/students/queries";

export const metadata: Metadata = {
  title: "Students",
  robots: { index: false },
};

export default async function AdminStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const supabase = await createClient();
  const context = await getHeadOfficeContext(supabase);

  if (!context) {
    return (
      <div>
        <h1 className="text-page-title text-navy-900">Students</h1>
        <PermissionDeniedState className="mt-8" />
      </div>
    );
  }

  const { q } = await searchParams;
  const students = await listStudentsForAdmin(q);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-page-title text-navy-900">Students</h1>
        <p className="text-body text-text-secondary mt-1">
          Every centre&rsquo;s admissions, newest first. Admission itself
          happens in the centre portal — head office reviews, it does not admit.
        </p>
      </div>

      <form
        action="/admin/students"
        method="get"
        className="flex max-w-md gap-2"
      >
        <Input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search name or registration number"
          aria-label="Search students"
        />
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      {students.length === 0 ? (
        <EmptyState
          title={q ? "No students match" : "No students yet"}
          description={
            q
              ? "Try a different name or registration number."
              : "Students appear here as centres admit them."
          }
        />
      ) : (
        <ResponsiveCollection
          list={
            <MobileList label="Students">
              {students.map((s) => (
                <MobileListItem
                  key={s.id}
                  title={s.fullName}
                  subtitle={`${s.registrationNumber} · ${s.centreName}`}
                  status={<StatusBadge status={s.status} />}
                  fields={[{ label: "Admitted", value: s.admittedOn }]}
                />
              ))}
            </MobileList>
          }
          table={
            <div className="border-border rounded-[var(--radius-card)] border">
              <table className="w-full text-left">
                <thead className="bg-surface-subtle">
                  <tr>
                    <th scope="col" className="text-label px-4 py-3">
                      Registration
                    </th>
                    <th scope="col" className="text-label px-4 py-3">
                      Name
                    </th>
                    <th scope="col" className="text-label px-4 py-3">
                      Centre
                    </th>
                    <th scope="col" className="text-label px-4 py-3">
                      Admitted
                    </th>
                    <th scope="col" className="text-label px-4 py-3">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.id} className="border-border border-t">
                      <td className="text-body text-text px-4 py-3">
                        {s.registrationNumber}
                      </td>
                      <td className="text-body text-text px-4 py-3 font-semibold">
                        {s.fullName}
                      </td>
                      <td className="text-body text-text-secondary px-4 py-3">
                        {s.centreName}
                      </td>
                      <td className="text-body text-text-secondary px-4 py-3">
                        {s.admittedOn}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={s.status} />
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
