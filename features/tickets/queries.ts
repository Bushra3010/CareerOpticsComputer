import { createClient } from "@/lib/db/server";

export interface TicketListRow {
  id: string;
  number: string;
  subject: string;
  category: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: string;
  centreName?: string;
  createdOn: string;
}

async function withCentreNames<T extends { centre_id: string }>(
  supabase: Awaited<ReturnType<typeof createClient>>,
  rows: T[],
): Promise<Map<string, string>> {
  const ids = [...new Set(rows.map((r) => r.centre_id))];
  if (ids.length === 0) return new Map();
  const { data } = await supabase
    .from("centres")
    .select("id, name")
    .in("id", ids);
  return new Map((data ?? []).map((c) => [c.id, c.name]));
}

export async function listTicketsForCentre(
  centreId: string,
): Promise<TicketListRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tickets")
    .select(
      "id, number, subject, category, priority, status, centre_id, created_at",
    )
    .eq("centre_id", centreId)
    .order("created_at", { ascending: false });

  return (data ?? []).map((t) => ({
    id: t.id,
    number: t.number,
    subject: t.subject,
    category: t.category,
    priority: t.priority,
    status: t.status,
    createdOn: t.created_at.slice(0, 10),
  }));
}

export async function listTicketsForAdmin(): Promise<TicketListRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tickets")
    .select(
      "id, number, subject, category, priority, status, centre_id, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  const rows = data ?? [];
  const names = await withCentreNames(supabase, rows);

  return rows.map((t) => ({
    id: t.id,
    number: t.number,
    subject: t.subject,
    category: t.category,
    priority: t.priority,
    status: t.status,
    centreName: names.get(t.centre_id) ?? "Unknown centre",
    createdOn: t.created_at.slice(0, 10),
  }));
}

/**
 * The signed-in student's own centre, for raising a ticket. Deliberately
 * takes no id — the row is resolved from the session, the same shape as
 * `getStudentOverview`, so there is nothing a student could change to raise
 * a ticket as somebody else.
 */
export async function getStudentSelfCentre(): Promise<{
  centreId: string;
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("students")
    .select("centre_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  return data ? { centreId: data.centre_id } : null;
}

/** A student's own tickets — RLS already scopes `tickets` to the caller's
 *  own `requester_id` when `requester_type = 'student'`. */
export async function listTicketsForStudent(): Promise<TicketListRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tickets")
    .select(
      "id, number, subject, category, priority, status, centre_id, created_at",
    )
    .order("created_at", { ascending: false });

  return (data ?? []).map((t) => ({
    id: t.id,
    number: t.number,
    subject: t.subject,
    category: t.category,
    priority: t.priority,
    status: t.status,
    createdOn: t.created_at.slice(0, 10),
  }));
}

export interface TicketMessageRow {
  id: string;
  senderType: "staff" | "student";
  body: string;
  isInternal: boolean;
  createdAt: string;
}

export interface TicketDetail {
  id: string;
  number: string;
  subject: string;
  category: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: string;
  centreId: string;
  centreName: string | null;
  requesterType: "staff" | "student";
  createdOn: string;
  messages: TicketMessageRow[];
}

/**
 * `ticket_messages`' own RLS (two policies: public messages, and internal
 * notes only for `ticket.internal_note` holders) already decides what this
 * plain select returns — a requester genuinely cannot fetch an internal
 * note by asking, not because the app hides it.
 */
export async function getTicketDetail(
  ticketId: string,
): Promise<TicketDetail | null> {
  const supabase = await createClient();

  const { data: ticket } = await supabase
    .from("tickets")
    .select(
      "id, number, subject, category, priority, status, centre_id, requester_type, created_at",
    )
    .eq("id", ticketId)
    .maybeSingle();
  if (!ticket) return null;

  const { data: centre } = await supabase
    .from("centres")
    .select("name")
    .eq("id", ticket.centre_id)
    .maybeSingle();

  const { data: messages } = await supabase
    .from("ticket_messages")
    .select("id, sender_type, body, is_internal, created_at")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true });

  return {
    id: ticket.id,
    number: ticket.number,
    subject: ticket.subject,
    category: ticket.category,
    priority: ticket.priority,
    status: ticket.status,
    centreId: ticket.centre_id,
    centreName: centre?.name ?? null,
    requesterType: ticket.requester_type,
    createdOn: ticket.created_at.slice(0, 10),
    messages: (messages ?? []).map((m) => ({
      id: m.id,
      senderType: m.sender_type,
      body: m.body,
      isInternal: m.is_internal,
      createdAt: m.created_at,
    })),
  };
}
