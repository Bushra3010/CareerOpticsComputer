import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { StatusBadge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PermissionDeniedState } from "@/components/states";
import { createClient } from "@/lib/db/server";
import { can } from "@/lib/permissions";
import { getHeadOfficeContext } from "@/features/exams/access";
import { MessageThread } from "@/features/tickets/components/message-thread";
import {
  AssignTicketForm,
  CloseTicketButton,
  ReopenTicketButton,
  ResolveTicketButton,
} from "@/features/tickets/components/ticket-lifecycle-buttons";
import { getTicketDetail } from "@/features/tickets/queries";

export const metadata: Metadata = { title: "Ticket", robots: { index: false } };

export default async function AdminTicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const context = await getHeadOfficeContext(supabase);

  if (!context) {
    return (
      <div>
        <h1 className="text-page-title text-navy-900">Ticket</h1>
        <PermissionDeniedState className="mt-8" />
      </div>
    );
  }

  const ticket = await getTicketDetail(id);
  if (!ticket) notFound();

  // `ticket.internal_note` is granted to no role yet (migration 0032's own
  // gap note), so today this is true only for a platform admin — but the
  // check is the permission, not the role, so seeding a Support Agent role
  // later lights this up without touching the page.
  const canAddInternalNote =
    context.isPlatformAdmin ||
    (await can(supabase, "ticket.internal_note", context.organizationId));

  const isOpen = !["resolved", "closed"].includes(ticket.status);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/tickets"
          className="text-meta text-text-secondary hover:text-text"
        >
          &larr; All tickets
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-page-title text-navy-900">{ticket.number}</h1>
            <p className="text-body text-text-secondary mt-1">
              {ticket.subject}
            </p>
          </div>
          <StatusBadge status={ticket.status} />
        </div>
        <dl className="text-meta text-text-secondary mt-3 flex flex-wrap gap-x-6 gap-y-1">
          <div className="flex gap-1">
            <dt>Centre:</dt>
            <dd className="text-text">{ticket.centreName ?? "—"}</dd>
          </div>
          <div className="flex gap-1">
            <dt>Priority:</dt>
            <dd className="text-text capitalize">{ticket.priority}</dd>
          </div>
          <div className="flex gap-1">
            <dt>Category:</dt>
            <dd className="text-text capitalize">{ticket.category}</dd>
          </div>
          <div className="flex gap-1">
            <dt>Raised by:</dt>
            <dd className="text-text capitalize">{ticket.requesterType}</dd>
          </div>
          <div className="flex gap-1">
            <dt>Raised:</dt>
            <dd className="text-text">{ticket.createdOn}</dd>
          </div>
        </dl>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isOpen ? <AssignTicketForm ticketId={ticket.id} /> : null}
          <div className="flex flex-wrap gap-2">
            {isOpen ? <ResolveTicketButton ticketId={ticket.id} /> : null}
            {ticket.status !== "closed" ? (
              <CloseTicketButton ticketId={ticket.id} />
            ) : null}
            {!isOpen ? <ReopenTicketButton ticketId={ticket.id} /> : null}
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-section text-navy-900">Conversation</h2>
        <div className="mt-3">
          <MessageThread
            ticketId={ticket.id}
            messages={ticket.messages}
            canAddInternalNote={canAddInternalNote}
          />
        </div>
      </div>
    </div>
  );
}
