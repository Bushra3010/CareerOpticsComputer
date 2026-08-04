import Link from "next/link";
import { redirect } from "next/navigation";

import { EmptyState } from "@/components/states";
import { createClient } from "@/lib/db/server";
import { formatPaise } from "@/lib/money";
import { getCurrentCentreContext } from "@/features/centres/current-membership";
import { listStudentFeeSummaries } from "@/features/fees/queries";

export default async function FeesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const context = user
    ? await getCurrentCentreContext(supabase, user.id)
    : null;
  if (!context) {
    redirect("/centre");
  }

  const summaries = await listStudentFeeSummaries(context.centreId);

  return (
    <div>
      <h1 className="text-page-title text-navy-900">Fees</h1>

      {summaries.length === 0 ? (
        <EmptyState
          className="mt-8"
          title="No students yet"
          description="Admit a student to start tracking fees."
        />
      ) : (
        <div className="border-border mt-6 overflow-x-auto rounded-[var(--radius-card)] border">
          <table className="w-full text-left">
            <thead className="bg-surface-subtle">
              <tr>
                <th className="text-label px-4 py-3">Registration no.</th>
                <th className="text-label px-4 py-3">Name</th>
                <th className="text-label px-4 py-3 text-right">Total</th>
                <th className="text-label px-4 py-3 text-right">Paid</th>
                <th className="text-label px-4 py-3 text-right">Due</th>
              </tr>
            </thead>
            <tbody>
              {summaries.map((row) => (
                <tr key={row.studentId} className="border-border border-t">
                  <td className="text-body px-4 py-3">
                    <Link
                      href={`/centre/fees/${row.studentId}`}
                      className="font-semibold text-blue-700"
                    >
                      {row.registrationNumber}
                    </Link>
                  </td>
                  <td className="text-body px-4 py-3">{row.studentName}</td>
                  <td className="text-body px-4 py-3 text-right tabular-nums">
                    {row.feePlanId ? formatPaise(row.totalPaise) : "—"}
                  </td>
                  <td className="text-body px-4 py-3 text-right tabular-nums">
                    {formatPaise(row.paidPaise)}
                  </td>
                  <td className="text-body text-navy-900 px-4 py-3 text-right font-semibold tabular-nums">
                    {row.feePlanId ? formatPaise(row.duePaise) : "No plan"}
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
