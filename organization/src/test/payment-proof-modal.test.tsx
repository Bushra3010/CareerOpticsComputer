import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

const createSignedUrl = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    storage: { from: () => ({ createSignedUrl }) },
  },
}));

import type { WalletTransactionItem } from "@/lib/supabase/data";

const { PaymentProofModal } = await import("@/components/branch/PaymentProofModal");

function makeTransaction(overrides: Record<string, unknown> = {}) {
  return {
    id: "85d4dd43-1413-4a19-8492-c88abd1e82b6",
    branchId: "b1",
    branch: "demo",
    branchCode: "101",
    amount: 5000,
    type: "credit",
    category: "RECHARGE",
    description: "Wallet recharge",
    reference: "123334",
    status: "PENDING",
    uiStatus: "pending",
    paymentMethod: "UPI",
    balanceAfter: 0,
    balance: 0,
    date: "2026-09-09",
    formattedDateTime: "09 Sept 2026, 06:47",
    createdAt: "2026-09-09T06:47:00.000Z",
    proofUrl: null,
    reviewedBy: null,
    reviewedAt: null,
    submittedBy: "Staff",
    rejectionReason: null,
    remarks: "",
    ...overrides,
  } as unknown as WalletTransactionItem;
}

describe("PaymentProofModal", () => {
  beforeEach(() => {
    createSignedUrl.mockReset();
  });

  it("exchanges a private storage path for a signed URL before rendering the proof", async () => {
    createSignedUrl.mockResolvedValue({
      data: { signedUrl: "https://storage.test/signed/proof.jpg?token=abc" },
      error: null,
    });

    render(
      <PaymentProofModal
        open
        onOpenChange={() => {}}
        transaction={makeTransaction({ proofUrl: "b1/proof_9f2c.jpg" })}
      />,
    );

    await waitFor(() => {
      const img = screen.getByAltText("Payment receipt for 123334") as HTMLImageElement;
      expect(img.src).toBe("https://storage.test/signed/proof.jpg?token=abc");
    });

    // The raw column value is a path, not something an <img> can load.
    expect(createSignedUrl).toHaveBeenCalledWith("b1/proof_9f2c.jpg", 600);
  });

  it("renders an inline data URL as-is, without asking storage to sign it", async () => {
    const dataUrl = "data:image/png;base64,iVBORw0KGgo=";

    render(
      <PaymentProofModal open onOpenChange={() => {}} transaction={makeTransaction({ proofUrl: dataUrl })} />,
    );

    await waitFor(() => {
      const img = screen.getByAltText("Payment receipt for 123334") as HTMLImageElement;
      expect(img.src).toBe(dataUrl);
    });

    expect(createSignedUrl).not.toHaveBeenCalled();
  });

  it("surfaces a retryable error instead of a broken image when signing fails", async () => {
    createSignedUrl.mockResolvedValue({ data: null, error: { message: "Object not found" } });

    render(
      <PaymentProofModal
        open
        onOpenChange={() => {}}
        transaction={makeTransaction({ proofUrl: "b1/missing.jpg" })}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Payment proof could not be loaded")).toBeDefined();
      expect(screen.getByText("Object not found")).toBeDefined();
      expect(screen.getByText("Retry")).toBeDefined();
    });

    expect(screen.queryByAltText("Payment receipt for 123334")).toBeNull();
  });

  it("says so plainly when no proof was attached", async () => {
    render(<PaymentProofModal open onOpenChange={() => {}} transaction={makeTransaction()} />);

    await waitFor(() => {
      expect(screen.getByText("No document file attached")).toBeDefined();
    });
    expect(createSignedUrl).not.toHaveBeenCalled();
  });

  it("hands a rejection to the caller so the reason box can open", async () => {
    const onReject = vi.fn();
    const onApprove = vi.fn().mockResolvedValue(undefined);

    render(
      <PaymentProofModal
        open
        onOpenChange={() => {}}
        transaction={makeTransaction()}
        onApprove={onApprove}
        onReject={onReject}
      />,
    );

    fireEvent.click(await screen.findByText("Reject"));
    expect(onReject).toHaveBeenCalledTimes(1);
    expect(onApprove).not.toHaveBeenCalled();
  });

  it("offers no approval controls once the request is no longer pending", async () => {
    render(
      <PaymentProofModal
        open
        onOpenChange={() => {}}
        transaction={makeTransaction({ status: "COMPLETED", uiStatus: "approved", reviewedBy: "Administrator" })}
        onApprove={vi.fn()}
        onReject={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Approved")).toBeDefined();
      expect(screen.getByText("Close proof viewer")).toBeDefined();
    });
    expect(screen.queryByText("Approve & Credit")).toBeNull();
  });
});
