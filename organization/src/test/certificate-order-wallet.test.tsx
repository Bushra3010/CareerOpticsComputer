import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MemoryRouter } from "react-router-dom";

/**
 * Approving a certificate order charges the centre's wallet in the database
 * (certificate-order-wallet.sql). The head office's screen has to turn the
 * database's INSUFFICIENT_BALANCE refusal into something it can act on, warn
 * that rejecting an approved order refunds it, and tell the header balance
 * to re-read.
 */
const toast = vi.fn();
const announceWalletChange = vi.fn();
const updateCertificateOrder = vi.fn();
const auth = { view: "organization", branchId: null, organizationId: "org1", user: { name: "Admin", email: "a@x.in", organizationId: "org1" } };

const orders = [
  { id: "o1", orderNo: "ORD-261031-AB12", branchId: "b1", studentIds: ["s1", "s2", "s3"], amount: 0, status: "PENDING", note: null, createdAt: "2026-10-30T10:00:00Z", branch: { id: "b1", name: "Begusarai", code: "BGS" } },
  { id: "o2", orderNo: "ORD-261031-CD34", branchId: "b1", studentIds: ["s4"], amount: 750, status: "APPROVED", note: null, createdAt: "2026-10-30T11:00:00Z", branch: { id: "b1", name: "Begusarai", code: "BGS" } },
];

vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast }) }));
vi.mock("@/components/layout/AppLayout", () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => auth }));
vi.mock("@/lib/supabase/centrePanel", () => ({
  useBranchOptions: () => [],
  listCertificateOrders: () => Promise.resolve(orders),
  listOrderableStudents: () => Promise.resolve([]),
  getStudentsByIds: () => Promise.resolve([]),
  createCertificateOrder: vi.fn(),
  updateCertificateOrder: (...a: unknown[]) => updateCertificateOrder(...a),
}));
vi.mock("@/lib/supabase/data", () => ({
  announceWalletChange: () => announceWalletChange(),
  friendlyChargeError: (m: string) => `friendly(${m})`,
}));

const CentreOrders = (await import("@/pages/centre/CentreOrders")).default;

const confirmSpy = vi.spyOn(window, "confirm");

beforeEach(() => {
  toast.mockClear();
  announceWalletChange.mockClear();
  updateCertificateOrder.mockReset();
  confirmSpy.mockReset().mockReturnValue(true);
});
afterEach(() => confirmSpy.mockReset());

async function approveFirst(amount: string) {
  render(<MemoryRouter><CentreOrders /></MemoryRouter>);
  fireEvent.change(await screen.findByLabelText("Amount for ORD-261031-AB12"), { target: { value: amount } });
  fireEvent.click(screen.getByRole("button", { name: "Approve" }));
}

describe("Certificate order approval and the centre wallet", () => {
  it("explains a wallet that cannot cover the order and does not announce a wallet change", async () => {
    updateCertificateOrder.mockRejectedValue(
      new Error("INSUFFICIENT_BALANCE: certificate order ORD-261031-AB12 needs Rs 1500.00, wallet balance is Rs 320.50."),
    );
    await approveFirst("1500");

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Could not update the order",
          description: "Centre wallet balance is too low — ₹320.5 available, ₹1,500 needed. Ask the centre to recharge.",
          variant: "destructive",
        }),
      ),
    );
    expect(announceWalletChange).not.toHaveBeenCalled();
  });

  it("falls back to the shared wording for an INSUFFICIENT_BALANCE it cannot read", async () => {
    updateCertificateOrder.mockRejectedValue(new Error("INSUFFICIENT_BALANCE: something else"));
    await approveFirst("100");
    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(expect.objectContaining({ description: "friendly(INSUFFICIENT_BALANCE: something else)" })),
    );
  });

  it("passes any other error through unchanged", async () => {
    updateCertificateOrder.mockRejectedValue(new Error("Set the order amount before approving it."));
    await approveFirst("100");
    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(expect.objectContaining({ description: "Set the order amount before approving it." })),
    );
  });

  it("announces the wallet change after an approval", async () => {
    updateCertificateOrder.mockResolvedValue({ ...orders[0], status: "APPROVED", amount: 1500 });
    await approveFirst("1500");
    await waitFor(() => expect(announceWalletChange).toHaveBeenCalledTimes(1));
    expect(updateCertificateOrder).toHaveBeenCalledWith("o1", { status: "APPROVED", amount: 1500 });
  });

  it("warns that rejecting an approved order refunds it, then announces the wallet change", async () => {
    updateCertificateOrder.mockResolvedValue({ ...orders[1], status: "REJECTED" });
    render(<MemoryRouter><CentreOrders /></MemoryRouter>);
    await screen.findByText("ORD-261031-CD34");
    const rejects = screen.getAllByRole("button", { name: "Reject" });
    fireEvent.click(rejects[1]);

    expect(confirmSpy).toHaveBeenCalledWith(expect.stringContaining("₹750 will be refunded to the centre's wallet"));
    await waitFor(() => expect(announceWalletChange).toHaveBeenCalledTimes(1));
  });

  it("does not promise a refund when rejecting a pending order", async () => {
    updateCertificateOrder.mockResolvedValue({ ...orders[0], status: "REJECTED" });
    render(<MemoryRouter><CentreOrders /></MemoryRouter>);
    await screen.findByText("ORD-261031-AB12");
    fireEvent.click(screen.getAllByRole("button", { name: "Reject" })[0]);

    expect(confirmSpy).toHaveBeenCalledWith(expect.not.stringContaining("refunded"));
    await waitFor(() => expect(updateCertificateOrder).toHaveBeenCalledWith("o1", { status: "REJECTED" }));
    expect(announceWalletChange).not.toHaveBeenCalled();
  });
});
