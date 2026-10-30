import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Where the UPI account a branch pays into is set. It used to be a constant in
 * the recharge drawer, so every installation showed one institute's UPI ID and
 * an administrator had no way to put their own in its place.
 */
const toast = vi.fn();
const getRechargeUpi = vi.fn();
const setRechargeUpi = vi.fn();

vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast }) }));
vi.mock("@/lib/supabase/data", () => ({
  getRechargeUpi: (...args: unknown[]) => getRechargeUpi(...(args as [])),
  setRechargeUpi: (...args: unknown[]) => setRechargeUpi(...(args as [])),
}));
vi.mock("qrcode", () => ({
  default: { toDataURL: () => Promise.resolve("data:image/png;base64,QR") },
}));

const { RechargeUpiDialog } = await import("@/components/branch/RechargeUpiDialog");

const open = (props: Record<string, unknown> = {}) =>
  render(
    <RechargeUpiDialog open onOpenChange={() => {}} organizationId="org1" {...props} />,
  );

const upiBox = () => screen.getByLabelText(/upi id/i);
const save = () => fireEvent.click(screen.getByRole("button", { name: /save account/i }));

beforeEach(() => {
  toast.mockClear();
  getRechargeUpi.mockReset();
  setRechargeUpi.mockReset();
  getRechargeUpi.mockResolvedValue({ success: true, data: null });
  setRechargeUpi.mockResolvedValue({ success: true });
});

describe("Recharge payment account", () => {
  it("opens on the account already saved, rather than empty", async () => {
    getRechargeUpi.mockResolvedValue({
      success: true,
      data: { upiId: "careeroptics@icici", merchantName: "Career Optics Computer Centre" },
    });
    open();
    await waitFor(() => expect(upiBox()).toHaveValue("careeroptics@icici"));
    expect(screen.getByLabelText(/account name/i)).toHaveValue("Career Optics Computer Centre");
  });

  it("saves the account against the organisation", async () => {
    open();
    await waitFor(() => expect(getRechargeUpi).toHaveBeenCalledWith("org1"));

    fireEvent.change(upiBox(), { target: { value: "careeroptics@icici" } });
    fireEvent.change(screen.getByLabelText(/account name/i), {
      target: { value: "Career Optics Computer Centre" },
    });
    save();

    await waitFor(() =>
      expect(setRechargeUpi).toHaveBeenCalledWith("org1", "careeroptics@icici", "Career Optics Computer Centre"),
    );
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Payment account saved" }),
    );
  });

  it("refuses an address that is not a UPI ID, rather than saving one nobody can pay", async () => {
    open();
    await waitFor(() => expect(getRechargeUpi).toHaveBeenCalled());

    fireEvent.change(upiBox(), { target: { value: "9876543210" } });
    save();

    expect(setRechargeUpi).not.toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Check the UPI ID" }),
    );
  });

  it("shows the QR a branch will scan once the ID reads as one", async () => {
    open();
    await waitFor(() => expect(getRechargeUpi).toHaveBeenCalled());
    expect(screen.queryByAltText(/recharge upi qr/i)).not.toBeInTheDocument();

    fireEvent.change(upiBox(), { target: { value: "careeroptics@icici" } });
    expect(await screen.findByAltText(/recharge upi qr/i)).toBeInTheDocument();
  });
});
