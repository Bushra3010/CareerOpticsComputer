import { supabase } from "./client";
import type { SupportTicket, TicketStatus } from "./centrePanel";

/**
 * A support ticket's conversation (supabase/schema/support-ticket-replies.sql).
 *
 * Kept out of centrePanel.ts so the thread can change without touching the
 * rest of the centre panel. The database decides who wrote a message and
 * which branch it belongs to; what is sent here for those is only a hint.
 */

export type ReplyAuthor = "HEAD_OFFICE" | "CENTRE";

export interface TicketReply {
  id: string;
  ticketId: string;
  branchId: string;
  author: ReplyAuthor;
  message: string;
  createdBy: string | null;
  createdAt: string;
}

const SETUP_HINT =
  "Ticket conversations are not set up yet. Run supabase/schema/support-ticket-replies.sql in Supabase.";

export const isMissingRepliesTable = (error: { code?: string; message?: string } | null) =>
  !!error &&
  (error.code === "42P01" || error.code === "PGRST205" || /support_ticket_replies.*(does not exist|schema cache)/i.test(error.message || ""));

function fail(error: { code?: string; message?: string }): never {
  throw new Error(isMissingRepliesTable(error) ? SETUP_HINT : error.message || "Request failed");
}

/** Whitespace is not a message; the table refuses it too, but later and less kindly. */
export function cleanMessage(message: string | null | undefined): string | null {
  const text = String(message ?? "").trim();
  return text ? text : null;
}

/**
 * The thread as it should be read: oldest first, ties kept in a stable order.
 *
 * A ticket answered before the table existed (or before the backfill ran)
 * has its answer only in `support_tickets.reply`. That answer is shown as a
 * head-office message rather than dropped, unless the thread already holds a
 * head-office message saying the same thing.
 */
export function buildThread(
  ticket: Pick<SupportTicket, "id" | "branchId" | "reply" | "updatedAt">,
  replies: TicketReply[],
): TicketReply[] {
  const ordered = [...replies].sort(
    (a, b) => String(a.createdAt).localeCompare(String(b.createdAt)) || a.id.localeCompare(b.id),
  );
  const legacy = cleanMessage(ticket.reply);
  if (legacy && !ordered.some((r) => r.author === "HEAD_OFFICE" && r.message.trim() === legacy)) {
    const entry: TicketReply = {
      id: `legacy-${ticket.id}`,
      ticketId: ticket.id,
      branchId: ticket.branchId,
      author: "HEAD_OFFICE",
      message: legacy,
      createdBy: null,
      createdAt: ticket.updatedAt,
    };
    // Its true date is unknown, but it predates anything in the table.
    return [entry, ...ordered];
  }
  return ordered;
}

export async function listTicketReplies(ticketId: string): Promise<TicketReply[]> {
  const { data, error } = await supabase
    .from("support_ticket_replies")
    .select("*")
    .eq("ticketId", ticketId)
    .order("createdAt", { ascending: true });
  if (error) fail(error);
  return (data || []) as TicketReply[];
}

/**
 * Post one message. The head office may move the ticket's status in the same
 * action; a centre's status is left to the guard trigger, which ignores it.
 */
export async function postTicketReply(
  ticket: Pick<SupportTicket, "id" | "branchId" | "status">,
  input: { author: ReplyAuthor; message: string; status?: TicketStatus },
): Promise<{ reply: TicketReply; ticket: Partial<SupportTicket> | null }> {
  const message = cleanMessage(input.message);
  if (!message) throw new Error("Write a message before sending.");
  if (input.author === "CENTRE" && ticket.status === "CLOSED") {
    throw new Error("This ticket is closed. Raise a new ticket instead.");
  }

  const { data, error } = await supabase
    .from("support_ticket_replies")
    .insert({ ticketId: ticket.id, branchId: ticket.branchId, author: input.author, message })
    .select("*")
    .single();
  if (error) fail(error);

  let updated: Partial<SupportTicket> | null = null;
  if (input.author === "HEAD_OFFICE") {
    // The insert trigger already copied the message to `reply`; this only
    // carries the status, and returns the ticket as it now stands.
    const patch: Record<string, unknown> = { reply: message };
    if (input.status && input.status !== ticket.status) patch.status = input.status;
    const { data: row, error: updateError } = await supabase
      .from("support_tickets")
      .update(patch)
      .eq("id", ticket.id)
      .select("*")
      .single();
    if (updateError) throw new Error(`The reply was sent, but the status was not saved: ${updateError.message}`);
    updated = row as Partial<SupportTicket>;
  }
  return { reply: data as TicketReply, ticket: updated };
}
