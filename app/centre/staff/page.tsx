import { redirect } from "next/navigation";

import { StatusBadge } from "@/components/ui/badge";
import { PermissionDeniedState } from "@/components/states";
import { createClient } from "@/lib/db/server";
import { getCurrentCentreContext } from "@/features/centres/current-membership";
import { getPermissionCodes } from "@/features/centres/nav";
import { listCentreStaff } from "@/features/staff/queries";
import { InviteStaffForm } from "@/features/staff/components/invite-staff-form";
import { StaffStatusButton } from "@/features/staff/components/staff-status-button";

export default async function StaffPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const context = user
    ? await getCurrentCentreContext(supabase, user.id)
    : null;
  if (!user || !context) redirect("/centre");

  const codes = await getPermissionCodes(supabase, user.id, context.centreId);

  // Gated in the page as well as the nav: a link can be hidden, a URL cannot.
  if (!codes.has("staff.read")) {
    return (
      <div>
        <h1 className="text-page-title text-navy-900">Staff</h1>
        <PermissionDeniedState className="mt-8" requiredFor="the staff list" />
      </div>
    );
  }

  const staff = await listCentreStaff(context.centreId, user.id);
  const canInvite = codes.has("staff.invite");

  return (
    <div>
      <h1 className="text-page-title text-navy-900">Staff</h1>
      <p className="text-body text-text-secondary mt-2 max-w-prose">
        Suspending someone removes their access immediately while keeping the
        record of who once had it.
      </p>

      <div className="border-border mt-6 overflow-x-auto rounded-[var(--radius-card)] border">
        <table className="w-full text-left">
          <thead className="bg-surface-subtle">
            <tr>
              <th scope="col" className="text-label px-4 py-3">
                Name
              </th>
              <th scope="col" className="text-label px-4 py-3">
                Role
              </th>
              <th scope="col" className="text-label px-4 py-3">
                Status
              </th>
              {canInvite ? (
                <th scope="col" className="text-label px-4 py-3">
                  Access
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {staff.map((m) => (
              <tr key={m.membershipId} className="border-border border-t">
                <td className="text-body px-4 py-3">
                  {m.fullName}
                  {m.isSelf ? (
                    <span className="text-meta text-text-secondary">
                      {" "}
                      (you)
                    </span>
                  ) : null}
                </td>
                <td className="text-body px-4 py-3">{m.roleName}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={m.status} />
                </td>
                {canInvite ? (
                  <td className="px-4 py-3">
                    {m.isSelf || m.roleCode === "centre_owner" ? (
                      <span className="text-meta text-text-secondary">—</span>
                    ) : (
                      <StaffStatusButton
                        membershipId={m.membershipId}
                        suspended={m.status !== "active"}
                      />
                    )}
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {canInvite ? (
        <>
          <h2 className="text-section text-navy-900 mt-10">
            Invite a colleague
          </h2>
          <div className="mt-3 max-w-3xl">
            <InviteStaffForm />
          </div>
        </>
      ) : null}
    </div>
  );
}
