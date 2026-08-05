import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  MobileList,
  MobileListItem,
  ResponsiveCollection,
} from "@/components/tables/mobile-list";
import { EmptyState } from "@/components/states";
import { createClient } from "@/lib/db/server";
import { getCurrentCentreContext } from "@/features/centres/current-membership";
import { listAttendanceSessions } from "@/features/attendance/queries";

export default async function AttendancePage() {
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

  const sessions = await listAttendanceSessions(context.centreId);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-page-title text-navy-900">Attendance</h1>
        <Button asChild>
          <Link href="/centre/attendance/take">Take attendance</Link>
        </Button>
      </div>

      {sessions.length === 0 ? (
        <EmptyState
          className="mt-8"
          title="No attendance recorded yet"
          description="Sessions you take attendance for will appear here."
        />
      ) : (
        <ResponsiveCollection
          list={
            <MobileList className="mt-6" label="Attendance sessions">
              {sessions.map((session) => (
                <MobileListItem
                  key={session.id}
                  title={session.sessionDate}
                  fields={[
                    {
                      label: "Marked",
                      value: session.totalCount,
                      numeric: true,
                    },
                    {
                      label: "Present",
                      value: `${session.presentCount}/${session.totalCount}`,
                      numeric: true,
                    },
                  ]}
                />
              ))}
            </MobileList>
          }
          table={
            <div className="border-border mt-6 rounded-[var(--radius-card)] border">
              <table className="w-full text-left">
                <thead className="bg-surface-subtle">
                  <tr>
                    <th className="text-label px-4 py-3">Date</th>
                    <th className="text-label px-4 py-3">Marked</th>
                    <th className="text-label px-4 py-3">Present</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session) => (
                    <tr key={session.id} className="border-border border-t">
                      <td className="text-body px-4 py-3">
                        {session.sessionDate}
                      </td>
                      <td className="text-body px-4 py-3">
                        {session.totalCount}
                      </td>
                      <td className="text-body px-4 py-3 tabular-nums">
                        {session.presentCount}/{session.totalCount}
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
