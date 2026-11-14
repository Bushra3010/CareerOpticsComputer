import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

const submitRechargeRequest = vi.fn();
const uploadRechargeProof = vi.fn();
const getRechargeUpi = vi.fn();
const toast = vi.fn();

vi.mock("@/lib/supabase/data", () => ({
  submitRechargeRequest: (...a: unknown[]) => submitRechargeRequest(...a),
  uploadRechargeProof: (...a: unknown[]) => uploadRechargeProof(...a),
  getRechargeUpi: (...a: unknown[]) => getRechargeUpi(...a),
}));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ user: { id: "u1", name: "Centre", email: "c@x.in", organizationId: "org1" } }) }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast }) }));
vi.mock("qrcode", () => ({ default: { toDataURL: () => Promise.resolve("data:image/png;base64,QR") } }));

const { SimpleRechargeDialog } = await import("@/components/branch/SimpleRechargeDialog");

const shot = () => new File([new Uint8Array([137, 80, 78, 71])], "pay.png", { type: "image/png" });
const open = (props: Record<string, unknown> = {}) =>
  render(<SimpleRechargeDialog open onOpenChange={() => {}} branchId="b1" branchName="Ara Centre" {...props} />);

beforeEach(() => {
  submitRechargeRequest.mockReset().mockResolvedValue({ success: true, data: { id: "t1" } });
  uploadRechargeProof.mockReset().mockResolvedValue({ success: true, data: "b1/proof.png" });
  getRechargeUpi.mockReset().mockResolvedValue({ success: true, data: null });
  toast.mockReset();
  globalThis.URL.createObjectURL = vi.fn(() => "blob:shot");
  globalThis.URL.revokeObjectURL = vi.fn();
});

describe("SimpleRechargeDialog", () => {
  it("asks for an amount before showing the QR", () => {
    open();
    fireEvent.click(screen.getByRole("button", { name: /Add Payment/i }));
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: "Enter the amount" }));
    expect(screen.queryByText(/Scan & pay/i)).toBeNull();
  });

  it("shows the company's Scan & Pay poster when no UPI ID is set", async () => {
    open();
    fireEvent.click(screen.getByRole("button", { name: "₹2,000" }));
    fireEvent.click(screen.getByRole("button", { name: /Add Payment/i }));
    expect(await screen.findByAltText(/Scan & Pay/i)).toBeInTheDocument();
    expect(screen.getByText(/50200121129272/)).toBeInTheDocument();
  });

  it("makes a QR for the exact amount when the head office has a UPI ID", async () => {
    getRechargeUpi.mockResolvedValue({ success: true, data: { upiId: "careeroptics@hdfcbank", merchantName: "Career Optics" } });
    open({ initialAmount: "1500" });
    await waitFor(() => expect(getRechargeUpi).toHaveBeenCalled());
    fireEvent.click(screen.getByRole("button", { name: /Add Payment/i }));
    expect(await screen.findByAltText("UPI QR for ₹1,500")).toBeInTheDocument();
  });

  it("will not submit without both the UTR and the screenshot", async () => {
    open({ initialAmount: "500" });
    fireEvent.click(screen.getByRole("button", { name: /Add Payment/i }));
    fireEvent.click(await screen.findByRole("button", { name: /Submit for verification/i }));
    expect(toast).toHaveBeenLastCalledWith(expect.objectContaining({ title: "Enter the UTR / transaction ID" }));
    fireEvent.change(screen.getByPlaceholderText(/12-digit UTR/i), { target: { value: "412345678901" } });
    fireEvent.click(screen.getByRole("button", { name: /Submit for verification/i }));
    expect(toast).toHaveBeenLastCalledWith(expect.objectContaining({ title: "Upload the payment screenshot" }));
    expect(submitRechargeRequest).not.toHaveBeenCalled();
  });

  it("uploads the screenshot and files a pending request for the head office", async () => {
    const onSubmitted = vi.fn();
    const { container } = open({ initialAmount: "2500", onSubmitted });
    fireEvent.click(screen.getByRole("button", { name: /Add Payment/i }));
    fireEvent.change(await screen.findByPlaceholderText(/12-digit UTR/i), { target: { value: "412345678901" } });
    fireEvent.change(container.ownerDocument.querySelector('input[type="file"]')!, { target: { files: [shot()] } });
    fireEvent.click(screen.getByRole("button", { name: /Submit for verification/i }));
    expect(await screen.findByText(/₹2,500 sent for verification/)).toBeInTheDocument();
    expect(uploadRechargeProof).toHaveBeenCalledWith("b1", expect.any(File));
    expect(submitRechargeRequest).toHaveBeenCalledWith(
      expect.objectContaining({ branchId: "b1", amount: 2500, paymentMethod: "UPI", reference: "412345678901", proofUrl: "b1/proof.png" }),
    );
    expect(onSubmitted).toHaveBeenCalled();
  });
});
