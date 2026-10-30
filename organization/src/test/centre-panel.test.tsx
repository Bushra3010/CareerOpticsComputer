import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";

/**
 * The centre panel's own pages: the till's running total is credits less
 * debits, a ticket cannot be raised without a subject, and the wallet lists
 * the centre's transactions.
 */
const toast = vi.fn();
const createSupportTicket = vi.fn((..._a: unknown[]) => Promise.resolve({ code: "TKT-ABC123" }));
const auth = { view: "franchise", branchId: "b1", organizationId: "org1", user: { name: "Centre", email: "c@x.in", organizationId: "org1", branchId: "b1" } };

vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast }) }));
vi.mock("@/components/layout/AppLayout", () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => auth }));
vi.mock("@/lib/supabase/centrePanel", async () => {
  const actual = await vi.importActual<typeof import("@/lib/supabase/centrePanel")>("@/lib/supabase/centrePanel");
  return {
    ...actual,
    useBranchOptions: () => [],
    listCentreExpenses: () =>
      Promise.resolve([
        { id: "e1", branchId: "b1", date: "2026-10-01", amount: 1000, mode: "Cash", type: "credit", reference: "Fees", createdAt: "2026-10-01T10:00:00Z" },
        { id: "e2", branchId: "b1", date: "2026-10-02", amount: 250, mode: "UPI", type: "debit", reference: "Electricity", createdAt: "2026-10-02T10:00:00Z" },
        { id: "e3", branchId: "b1", date: "2026-10-03", amount: 100, mode: "Gpay", type: "debit", reference: "Tea", createdAt: "2026-10-03T10:00:00Z" },
      ]),
    listSupportTickets: () => Promise.resolve([]),
    createSupportTicket: (...a: unknown[]) => createSupportTicket(...a),
  };
});
vi.mock("@/lib/supabase/data", () => ({
  WALLET_CHANGED: "wallet:changed",
  getBranches: () => Promise.resolve({ success: true, data: [] }),
  getWallet: () => Promise.resolve({ success: true, data: { balance: 1500 } }),
  getWalletTransactions: () =>
    Promise.resolve({
      success: true,
      data: [
        { id: "t1", branchId: "b1", branch: "Begusarai", branchCode: "BGS", amount: 2000, type: "credit", category: "RECHARGE", description: "Wallet recharge via UPI", reference: "UPI-778899", status: "COMPLETED", uiStatus: "approved", paymentMethod: "UPI", balanceAfter: 2000, balance: 2000, date: "2026-10-01", formattedDateTime: "01 Oct 2026, 10:00", createdAt: "2026-10-01T10:00:00Z", proofUrl: null, reviewedBy: null, reviewedAt: null, submittedBy: "Centre", rejectionReason: null, remarks: "" },
        { id: "t2", branchId: "b1", branch: "Begusarai", branchCode: "BGS", amount: 500, type: "debit", category: "CERTIFICATE", description: "Certificate fee for Rahul", reference: "CERT-0001", status: "COMPLETED", uiStatus: "approved", paymentMethod: "WALLET", balanceAfter: 1500, balance: 1500, date: "2026-10-02", formattedDateTime: "02 Oct 2026, 11:00", createdAt: "2026-10-02T11:00:00Z", proofUrl: null, reviewedBy: null, reviewedAt: null, submittedBy: "Centre", rejectionReason: null, remarks: "" },
      ],
      totalCount: 2,
      page: 1,
      pageSize: 1000,
      totalPages: 1,
      counts: { all: 2, pending: 0, approved: 2, rejected: 0 },
      totals: { totalBalance: 0, pendingAmount: 0, approvedAmount: 2000 },
    }),
}));

const { expenseTotal } = await import("@/lib/supabase/centrePanel");
const CentreExpenses = (await import("@/pages/centre/CentreExpenses")).default;
const CentreTickets = (await import("@/pages/centre/CentreTickets")).default;
const CentreWallet = (await import("@/pages/centre/CentreWallet")).default;

beforeEach(() => {
  toast.mockClear();
  createSupportTicket.mockClear();
});

describe("Centre expenses", () => {
  it("totals credits minus debits", async () => {
    expect(expenseTotal([{ amount: 1000, type: "credit" }, { amount: 250, type: "debit" }, { amount: 100, type: "debit" }])).toBe(650);
    expect(expenseTotal([{ amount: 50, type: "debit" }])).toBe(-50);

    render(<MemoryRouter><CentreExpenses /></MemoryRouter>);
    expect(await screen.findByText("Electricity")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Expense total" })).toHaveTextContent("Total - ₹650");
  });
});

describe("Centre tickets", () => {
  it("will not raise a ticket without a subject", async () => {
    render(<MemoryRouter><CentreTickets /></MemoryRouter>);
    fireEvent.click(await screen.findByRole("button", { name: "New Ticket" }));
    fireEvent.click(screen.getByRole("button", { name: "Submit Ticket" }));
    await waitFor(() => expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: "Subject is required" })));
    expect(createSupportTicket).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText("Subject"), { target: { value: "Admit card not printing" } });
    fireEvent.click(screen.getByRole("button", { name: "Submit Ticket" }));
    await waitFor(() => expect(createSupportTicket).toHaveBeenCalledTimes(1));
    expect(createSupportTicket.mock.calls[0][0]).toMatchObject({ branchId: "b1", subject: "Admit card not printing", category: "Student Registration" });
  });
});

describe("Centre wallet", () => {
  it("shows the balance and the transaction history", async () => {
    render(<MemoryRouter><CentreWallet /></MemoryRouter>);
    expect(await screen.findByText("Wallet recharge via UPI")).toBeInTheDocument();
    expect(screen.getByText("Certificate fee for Rahul")).toBeInTheDocument();
    expect(screen.getByText("UPI-778899")).toBeInTheDocument();
    expect(screen.getByText("+₹2,000")).toBeInTheDocument();
    expect(screen.getByText("−₹500")).toBeInTheDocument();
    expect(screen.getByLabelText("Wallet balance")).toHaveTextContent("₹1,500");
  });
});
