import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * A centre's wallet page shows its own balance -- the figure in the header --
 * not every centre's wallets added up, and asks for its own ledger only.
 */
let view = "franchise";
const ledgerCalls: Array<Record<string, unknown>> = [];

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "u1", name: "Er Pushpak Kumar", organizationId: "org1", branchId: view === "admin" ? null : "b1" },
    view,
    branchId: view === "admin" ? null : "b1",
  }),
}));
vi.mock("@/components/layout/AppLayout", () => ({ AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));
vi.mock("@/lib/supabase/data", () => ({
  getBranches: () => Promise.resolve({ success: true, data: [
    { id: "b1", name: "Digi skill Hub PVT LTD", code: "BRCH00009", isActive: true },
    { id: "b2", name: "Digiskills computer academy", code: "BR00912", isActive: true },
  ] }),
  getWalletsByOrg: () => Promise.resolve({ success: true, data: [{ branchId: "b1", balance: 450 }, { branchId: "b2", balance: 500 }] }),
  getWalletTransactions: (filters: Record<string, unknown>) => {
    ledgerCalls.push(filters);
    return Promise.resolve({
      success: true, data: [], totalCount: 0, page: 1, pageSize: 25, totalPages: 1,
      counts: { all: 0, pending: 0, approved: 0, rejected: 0 },
      totals: { totalBalance: 0, pendingAmount: 0, approvedAmount: 0 },
    });
  },
  approveRechargeTransaction: vi.fn(),
  rejectRechargeTransaction: vi.fn(),
  bulkApproveRecharges: vi.fn(),
  bulkRejectRecharges: vi.fn(),
}));

const { default: WalletRecharge } = await import("@/pages/branch/WalletRecharge");

beforeEach(() => {
  ledgerCalls.length = 0;
});

describe("wallet balance", () => {
  it("shows a centre its own wallet, the same as the header", async () => {
    view = "franchise";
    render(<MemoryRouter><WalletRecharge /></MemoryRouter>);
    expect(await screen.findByText("My Wallet Balance")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("₹450")).toBeInTheDocument());
    expect(screen.queryByText("₹950")).toBeNull();
    expect(ledgerCalls.at(-1)).toMatchObject({ branchId: "b1" });
    // No made-up growth figure.
    expect(screen.queryByText(/\+12%/)).toBeNull();
  });

  it("shows the head office every centre's wallets added up", async () => {
    view = "admin";
    render(<MemoryRouter><WalletRecharge /></MemoryRouter>);
    expect(await screen.findByText("Total Wallet Balance")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("₹950")).toBeInTheDocument());
    expect(ledgerCalls.at(-1)).toMatchObject({ branchId: null });
  });
});
