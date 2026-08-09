import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { StatusBadge } from "@/components/ui/badge";
import { MessageThread } from "@/features/tickets/components/message-thread";
import { ReopenTicketButton } from "@/features/tickets/components/ticket-lifecycle-buttons";
import { getTicketDetail } from "@/features/tickets/queries";

export const metadata: Metadata = { title: "Ticket", robots: { index: false } };

export default async function StudentTicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // RLS scopes `tickets` to the student's own requester rows, so a foreign
  // id simply returns nothing — no separate permission check to make here.
  const ticket = await getTicketDetail(id);
  if (!ticket) notFound();

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/student/support"
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
        {/* JSX drops whitespace that spans a line break, so the separators
            carry explicit {" "} spaces — without them this renders as
            "Highpriority · Billing·". */}
        <p className="text-meta text-text-secondary mt-2">
          <span className="capitalize">{ticket.priority}</span> priority{" "}
          &middot; <span className="capitalize">{ticket.category}</span>{" "}
          &middot; raised {ticket.createdOn}
        </p>
      </div>

      {["resolved", "closed"].includes(ticket.status) ? (
        <div className="flex items-center gap-3">
          <p className="text-body text-text-secondary">
            Not fixed after all? Reopen the ticket to continue the conversation.
          </p>
          <ReopenTicketButton ticketId={ticket.id} />
        </div>
      ) : null}

      <div>
        <h2 className="text-section text-navy-900">Conversation</h2>
        <div className="mt-3">
          <MessageThread
            ticketId={ticket.id}
            messages={ticket.messages}
            canAddInternalNote={false}
          />
        </div>
      </div>
    </div>
  );
}
