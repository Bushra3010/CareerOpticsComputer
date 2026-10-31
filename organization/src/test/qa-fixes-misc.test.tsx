import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";

/**
 * QA findings on the live site:
 *  - a fee group billed to students still read "0 students" and could be
 *    deleted from under its invoices;
 *  - a ticket held one reply that each answer overwrote, and an empty reply
 *    could be saved.
 */

const toast = vi.fn();
const auth: Record<string, unknown> = { view: "admin", branchId: null, organizationId: "org1", permissions: {}, user: { organizationId: "org1" } };
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast }) }));
vi.mock("@/components/layout/AppLayout", () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => auth }));
vi.mock("@/contexts/PermissionsContext", () => ({ usePermissionsOrNull: () => ({}) }));

// Every write the data modules attempt, so a refused one can be shown not to
// have reached the database.
const writes: Array<{ table: string; op: string; body: unknown }> = [];
vi.mock("@/lib/supabase/client", () => {
  const from = (table: string) => {
    const chain: Record<string, unknown> = {};
    const done = () => Promise.resolve({ data: { id: "r-new", ticketId: "t1", author: "CENTRE", message: "x", createdAt: "2026-10-31T10:00:00Z" }, error: null });
    Object.assign(chain, {
      select: () => chain,
      eq: () => chain,
      neq: () => chain,
      not: () => chain,
      order: () => chain,
      single: done,
      insert: (body: unknown) => {
        writes.push({ table, op: "insert", body });
        return chain;
      },
      update: (body: unknown) => {
        writes.push({ table, op: "update", body });
        return chain;
      },
    });
    return chain;
  };
  return { supabase: { from, auth: { getSession: () => Promise.resolve({ data: { session: null } }) } } };
});

const feeInvoices = vi.fn();
vi.mock("@/lib/supabase/studentFee", async () => {
  const actual = await vi.importActual<typeof import("@/lib/supabase/studentFee")>("@/lib/supabase/studentFee");
  return { ...actual, listFeeGroupInvoices: () => feeInvoices() };
});

const ticketReplies = vi.fn();
vi.mock("@/lib/supabase/ticketReplies", async () => {
  const actual = await vi.importActual<typeof import("@/lib/supabase/ticketReplies")>("@/lib/supabase/ticketReplies");
  return { ...actual, listTicketReplies: () => ticketReplies() };
});

const ticket = {
  id: "t1",
  code: "TKT-ABC123",
  branchId: "b1",
  category: "Exam",
  subcategory: "Admit card",
  subject: "Admit card not printing",
  content: "The print button does nothing.",
  image: null,
  status: "OPEN" as const,
  reply: "Clear the browser cache and retry.",
  createdAt: "2026-10-28T09:00:00Z",
  updatedAt: "2026-10-30T09:00:00Z",
};
vi.mock("@/lib/supabase/centrePanel", async () => {
  const actual = await vi.importActual<typeof import("@/lib/supabase/centrePanel")>("@/lib/supabase/centrePanel");
  return { ...actual, useBranchOptions: () => [], listSupportTickets: () => Promise.resolve([ticket]) };
});

const { feeGroupUsage, studentsOnFeeGroups } = await vi.importActual<typeof import("@/lib/supabase/studentFee")>(
  "@/lib/supabase/studentFee",
);
const { buildThread, cleanMessage, postTicketReply } = await vi.importActual<
  typeof import("@/lib/supabase/ticketReplies")
>("@/lib/supabase/ticketReplies");
const { FEE_GROUPS_KEY } = await import("@/data/fee-catalog");
const FeeGroups = (await import("@/pages/fee/FeeGroups")).default;
const CentreTickets = (await import("@/pages/centre/CentreTickets")).default;

beforeEach(() => {
  toast.mockClear();
  writes.length = 0;
  feeInvoices.mockReset();
  ticketReplies.mockReset();
  localStorage.clear();
});

/* ------------------------------------------------------------ fee groups */

describe("fee group usage", () => {
  const invoices = [
    { studentId: "s1", feeGroupId: "g1", status: "DUE" },
    { studentId: "s1", feeGroupId: "g1", status: "PAID" }, // same student, second invoice
    { studentId: "s2", feeGroupId: "g1", status: "PARTIAL" },
    { studentId: "s3", feeGroupId: "g1", status: "VOID" }, // cancelled: not on the group
    { studentId: "s1", feeGroupId: "g2", status: "DUE" },
    { studentId: "s4", feeGroupId: null, status: "DUE" }, // custom invoice
  ];

  it("counts distinct students with a live invoice, and every live invoice", () => {
    const usage = feeGroupUsage(invoices);
    expect(usage.get("g1")).toEqual({ students: 2, invoices: 3 });
    expect(usage.get("g2")).toEqual({ students: 1, invoices: 1 });
    expect(usage.has("")).toBe(false);
  });

  it("leaves a group with only void invoices off the list", () => {
    expect(feeGroupUsage([{ studentId: "s1", feeGroupId: "g9", status: "VOID" }]).has("g9")).toBe(false);
  });

  it("counts a student on two groups once in the total", () => {
    expect(studentsOnFeeGroups(invoices, ["g1", "g2"])).toBe(2);
    // A group this browser does not know is not part of its total.
    expect(studentsOnFeeGroups(invoices, ["g2"])).toBe(1);
  });
});

describe("Fee Groups page", () => {
  const group = (id: string, name: string) => ({
    id,
    name,
    description: "Package",
    feeTypes: ["Tuition Fee"],
    totalAmount: 5000,
    courses: ["All Courses"],
    studentsCount: 0,
    status: "active",
  });

  const openDelete = async (row: string) => {
    // The table renders a card list for phones as well; the row is the one in <tr>.
    const cell = screen.getAllByText(row).find((el) => el.closest("tr")) as HTMLElement;
    const trigger = within(cell.closest("tr") as HTMLElement).getByRole("button", { name: "Row actions" });
    fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false });
    fireEvent.keyDown(trigger, { key: "Enter" });
    fireEvent.click(await screen.findByText("Delete"));
  };

  it("reads its student count from the invoices and will not delete a group they use", async () => {
    localStorage.setItem(FEE_GROUPS_KEY, JSON.stringify([group("g1", "Standard Package"), group("g2", "Unused Package")]));
    feeInvoices.mockResolvedValue([
      { id: "i1", studentId: "s1", feeGroupId: "g1", status: "DUE" },
      { id: "i2", studentId: "s2", feeGroupId: "g1", status: "PAID" },
    ]);
    render(<MemoryRouter><FeeGroups /></MemoryRouter>);

    // The tile, not the stored zero.
    const tile = (await screen.findByText("Students Assigned")).previousElementSibling as HTMLElement;
    await waitFor(() => expect(tile).toHaveTextContent("2"));

    await openDelete("Standard Package");
    expect(await screen.findByText(/2 invoices for 2 students use this group/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Delete" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(JSON.parse(localStorage.getItem(FEE_GROUPS_KEY) || "[]")).toHaveLength(2);
  });

  it("still deletes a group no invoice uses", async () => {
    localStorage.setItem(FEE_GROUPS_KEY, JSON.stringify([group("g2", "Unused Package")]));
    feeInvoices.mockResolvedValue([]);
    render(<MemoryRouter><FeeGroups /></MemoryRouter>);
    await screen.findAllByText("Unused Package");
    await waitFor(() =>
      expect((screen.getByText("Students Assigned").previousElementSibling as HTMLElement)).toHaveTextContent("0"),
    );

    await openDelete("Unused Package");
    fireEvent.click(await screen.findByRole("button", { name: "Delete" }));
    expect(JSON.parse(localStorage.getItem(FEE_GROUPS_KEY) || "[]")).toHaveLength(0);
  });
});

/* -------------------------------------------------------------- tickets */

describe("ticket thread", () => {
  const reply = (id: string, author: "HEAD_OFFICE" | "CENTRE", message: string, createdAt: string) => ({
    id, ticketId: "t1", branchId: "b1", author, message, createdBy: null, createdAt,
  });

  it("reads oldest first", () => {
    const thread = buildThread({ ...ticket, reply: null }, [
      reply("r3", "HEAD_OFFICE", "Fixed now.", "2026-10-30T12:00:00Z"),
      reply("r1", "HEAD_OFFICE", "Looking into it.", "2026-10-28T10:00:00Z"),
      reply("r2", "CENTRE", "Still broken.", "2026-10-29T08:00:00Z"),
    ]);
    expect(thread.map((r) => r.id)).toEqual(["r1", "r2", "r3"]);
  });

  it("keeps a reply saved before the thread existed, once", () => {
    const legacyOnly = buildThread(ticket, []);
    expect(legacyOnly).toHaveLength(1);
    expect(legacyOnly[0]).toMatchObject({ author: "HEAD_OFFICE", message: ticket.reply });

    // After the migration the column mirrors the latest head-office message.
    const mirrored = buildThread(ticket, [reply("r1", "HEAD_OFFICE", ticket.reply, "2026-10-30T09:00:00Z")]);
    expect(mirrored.map((r) => r.id)).toEqual(["r1"]);
  });

  it("refuses an empty message before it reaches the database", async () => {
    expect(cleanMessage("   \n ")).toBeNull();
    await expect(postTicketReply(ticket, { author: "HEAD_OFFICE", message: "  " })).rejects.toThrow(/Write a message/);
    expect(writes).toHaveLength(0);
  });

  it("will not let a centre post on a closed ticket", async () => {
    await expect(postTicketReply({ ...ticket, status: "CLOSED" }, { author: "CENTRE", message: "Hello?" })).rejects.toThrow(/closed/);
    expect(writes).toHaveLength(0);
  });

  it("adds a message instead of overwriting the last one", async () => {
    await postTicketReply(ticket, { author: "HEAD_OFFICE", message: "  Second answer  ", status: "RESOLVED" });
    expect(writes[0]).toMatchObject({ table: "support_ticket_replies", op: "insert", body: { ticketId: "t1", author: "HEAD_OFFICE", message: "Second answer" } });
    expect(writes[1]).toMatchObject({ table: "support_tickets", op: "update", body: { reply: "Second answer", status: "RESOLVED" } });
  });
});

describe("Centre Tickets page", () => {
  it("shows the whole conversation in order and will not send a blank follow-up", async () => {
    auth.branchId = "b1";
    ticketReplies.mockResolvedValue([
      { id: "r2", ticketId: "t1", branchId: "b1", author: "CENTRE", message: "Still broken after that.", createdBy: null, createdAt: "2026-10-31T08:00:00Z" },
      { id: "r1", ticketId: "t1", branchId: "b1", author: "HEAD_OFFICE", message: "Clear the browser cache and retry.", createdBy: null, createdAt: "2026-10-30T09:00:00Z" },
    ]);
    render(<MemoryRouter><CentreTickets /></MemoryRouter>);
    fireEvent.click(await screen.findByRole("button", { name: "View" }));

    const conversation = await screen.findByRole("list", { name: "Conversation" });
    await waitFor(() => expect(within(conversation).getAllByRole("listitem")).toHaveLength(2));
    const items = within(conversation).getAllByRole("listitem").map((li) => li.textContent);
    expect(items[0]).toMatch(/Head office.*Clear the browser cache/);
    expect(items[1]).toMatch(/Centre.*Still broken/);

    const box = screen.getByLabelText("Follow-up message");
    const send = screen.getByRole("button", { name: "Send Message" });
    fireEvent.change(box, { target: { value: "   " } });
    expect(send).toBeDisabled();
    fireEvent.change(box, { target: { value: "Any update?" } });
    expect(send).not.toBeDisabled();
    auth.branchId = null;
  });
});

/* ------------------------------------------------- live classes, notices */

const { inferClassMode, isOnlineSlot } = await import("@/lib/batchSchedule");
const { recordingLabel } = await import("@/lib/liveClasses");
const { formatDay, dayValue } = await import("@/lib/dates");

describe("live class mode", () => {
  it("reads a slot set up with a meeting link as online, and a room slot as not", () => {
    expect(inferClassMode({ classMode: null, platform: "Custom Link", meetingLink: "https://x.test/m" })).toBe("Online");
    expect(inferClassMode({ classMode: null, platform: null, meetingLink: null })).toBe("Offline");
    expect(inferClassMode({ classMode: "Hybrid", platform: null, meetingLink: null })).toBe("Hybrid");
    expect(isOnlineSlot({ classMode: "Offline", platform: "In person", meetingLink: null })).toBe(false);
  });

  it("does not offer a recording of a class that has not happened", () => {
    expect(recordingLabel("scheduled", true)).toBe("Will be recorded");
    expect(recordingLabel("completed", true)).toBe("Available");
    expect(recordingLabel("completed", false)).toBe("Not recorded");
  });
});

describe("notice dates", () => {
  it("shows a stored day as that day, with no timezone shift", () => {
    expect(formatDay("2026-10-31T00:00:00")).toBe("31 Oct 2026");
    expect(formatDay("2026-01-05")).toBe("5 Jan 2026");
    expect(formatDay("")).toBe("—");
    expect(dayValue("2026-10-31T00:00:00")).toBe("2026-10-31");
  });
});
