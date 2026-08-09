import Link from "next/link";
import type { Metadata } from "next";

import { StatusBadge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, PermissionDeniedState } from "@/components/states";
import {
  MobileList,
  MobileListItem,
  ResponsiveCollection,
} from "@/components/tables/mobile-list";
import { createClient } from "@/lib/db/server";
import { getCurrentCentreContext } from "@/features/centres/current-membership";
import { CreateTicketForm } from "@/features/tickets/components/create-ticket-form";
import { listTicketsForCentre } from "@/features/tickets/queries";

export const metadata: Metadata = {
  title: "Support",
  robots: { index: false },
};

export default async function CentreSupportPage() {
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
        <h1 className="text-page-title text-navy-900">Support</h1>
        <PermissionDeniedState className="mt-8" />
      </div>
    );
  }

  const tickets = await listTicketsForCentre(context.centreId);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-page-title text-navy-900">Support</h1>
        <p className="text-body text-text-secondary mt-1">
          Raise a ticket with head office and follow the conversation here.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Raise a ticket</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateTicketForm
            centreId={context.centreId}
            redirectBase="/centre/support"
          />
        </CardContent>
      </Card>

      {tickets.length === 0 ? (
        <EmptyState
          title="No tickets yet"
          description="Tickets you or your staff raise appear here."
        />
      ) : (
        <ResponsiveCollection
          list={
            <MobileList label="Tickets">
              {tickets.map((t) => (
                <MobileListItem
                  key={t.id}
                  title={t.subject}
                  subtitle={t.number}
                  status={<StatusBadge status={t.status} />}
                  fields={[
                    { label: "Priority", value: t.priority },
                    { label: "Raised", value: t.createdOn },
                  ]}
                  href={`/centre/support/${t.id}`}
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
                      Ticket
                    </th>
                    <th scope="col" className="text-label px-4 py-3">
                      Priority
                    </th>
                    <th scope="col" className="text-label px-4 py-3">
                      Status
                    </th>
                    <th scope="col" className="text-label px-4 py-3">
                      Raised
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((t) => (
                    <tr key={t.id} className="border-border border-t">
                      <td className="px-4 py-3">
                        <Link
                          href={`/centre/support/${t.id}`}
                          className="text-body text-brand-600 font-semibold hover:underline"
                        >
                          {t.number}
                        </Link>
                        <p className="text-meta text-text-secondary">
                          {t.subject}
                        </p>
                      </td>
                      <td className="text-body text-text px-4 py-3 capitalize">
                        {t.priority}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={t.status} />
                      </td>
                      <td className="text-body text-text-secondary px-4 py-3">
                        {t.createdOn}
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
