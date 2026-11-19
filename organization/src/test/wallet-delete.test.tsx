import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * The head office deletes a wallet request or history entry from Wallet
 * Requests. Only the row goes; the balance is not touched. A centre, which
 * reaches the same page, gets no Delete.
 */

const m = vi.hoisted(() => ({ view: "admin", deleteWalletTransaction: vi.fn(), toast: vi.fn() }));

vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: m.toast }), toast: m.toast }));
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "a1", name: "Admin", organizationId: "org1", role: "ORGANIZATION_ADMIN" }, view: m.view, branchId: m.view === "admin" ? null : "b1" }),
}));
vi.mock("@/lib/supabase/data", async (importOriginal) => {
  const real = await importOriginal<Record<string, unknown>>();
  const tx = (id: string, status: string) => ({
    id, branchId: "b1", branch: "Ara Centre", branchCode: "AR-01", amount: 500, type: "credit", category: "RECHARGE",
    description: "Recharge", reference: `UTR-${id}`, status, uiStatus: status === "PENDING" ? "pending" : "approved",
    paymentMethod: "UPI", balanceAfter: 0, balance: 0, date: "2026-11-10", formattedDateTime: "10 Nov 2026, 10:00",
    createdAt: "2026-11-10T10:00:00Z", submittedBy: "Centre", proofUrl: null, reviewedBy: null, reviewedAt: null,
    rejectionReason: null, remarks: "",
  });
  return {
    ...real,
    getBranches: () => Promise.resolve({ success: true, data: [{ id: "b1", name: "Ara Centre", code: "AR-01" }] }),
    getWalletsByOrg: () => Promise.resolve({ success: true, data: [{ branchId: "b1", balance: 1200 }] }),
    getWalletTransactions: () =>
      Promise.resolve({
        data: [tx("t1", "PENDING"), tx("t2", "COMPLETED")],
        totalCount: 2, totalPages: 1,
        counts: { all: 2, pending: 1, approved: 1, rejected: 0 },
        totals: { approvedAmount: 0, pendingAmount: 500 },
      }),
    deleteWalletTransaction: (...a: unknown[]) => m.deleteWalletTransaction(...a),
  };
});

const { default: WalletRecharge } = await import("@/pages/branch/WalletRecharge");
const show = () => render(<MemoryRouter><WalletRecharge /></MemoryRouter>);

beforeEach(() => {
  m.view = "admin";
  m.toast.mockReset();
  m.deleteWalletTransaction.mockReset().mockResolvedValue({ success: true });
});

describe("Deleting wallet entries", () => {
  it("lets the head office delete a pending request after asking", async () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
    show();
    fireEvent.click(await screen.findByRole("button", { name: "Delete wallet entry UTR-t1" }));
    expect(confirm.mock.calls[0][0]).toMatch(/recharge request[\s\S]*balance does not change/);
    await waitFor(() => expect(m.deleteWalletTransaction).toHaveBeenCalledWith("t1"));
    confirm.mockRestore();
  });

  it("deletes nothing when the admin cancels", async () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    show();
    fireEvent.click(await screen.findByRole("button", { name: "Delete wallet entry UTR-t2" }));
    expect(m.deleteWalletTransaction).not.toHaveBeenCalled();
    confirm.mockRestore();
  });

  it("gives a centre no Delete", async () => {
    m.view = "franchise";
    show();
    await screen.findByText("UTR-t1");
    expect(screen.queryByRole("button", { name: /Delete wallet entry/ })).toBeNull();
  });
});
