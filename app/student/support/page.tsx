import Link from "next/link";
import type { Metadata } from "next";

import { StatusBadge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/states";
import { CreateTicketForm } from "@/features/tickets/components/create-ticket-form";
import {
  getStudentSelfCentre,
  listTicketsForStudent,
} from "@/features/tickets/queries";

export const metadata: Metadata = {
  title: "Support",
  robots: { index: false },
};

export default async function StudentSupportPage() {
  const self = await getStudentSelfCentre();

  if (!self) {
    return (
      <div>
        <h1 className="text-page-title text-navy-900">Support</h1>
        <EmptyState
          className="mt-8"
          title="No student record linked to this account"
          description="Ask your centre to send you a portal invitation from your student record."
        />
      </div>
    );
  }

  const tickets = await listTicketsForStudent();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-page-title text-navy-900">Support</h1>
        <p className="text-body text-text-secondary mt-1">
          Raise a ticket and follow the conversation here.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Raise a ticket</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateTicketForm
            centreId={self.centreId}
            redirectBase="/student/support"
          />
        </CardContent>
      </Card>

      {tickets.length === 0 ? (
        <EmptyState
          title="No tickets yet"
          description="Tickets you raise appear here."
        />
      ) : (
        <ul className="space-y-2">
          {tickets.map((t) => (
            <li key={t.id}>
              <Link
                href={`/student/support/${t.id}`}
                className="border-border bg-surface flex min-h-[44px] items-center justify-between gap-3 rounded-[var(--radius-card)] border px-4 py-3"
              >
                <div>
                  <p className="text-body text-text font-semibold">
                    {t.subject}
                  </p>
                  <p className="text-meta text-text-secondary">
                    {t.number} &middot; raised {t.createdOn}
                  </p>
                </div>
                <StatusBadge status={t.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
