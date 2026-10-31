import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

const submitRechargeRequest = vi.fn();
const uploadRechargeProof = vi.fn();
/** The organisation's own UPI account, which the drawer reads when it opens. */
const getRechargeUpi = vi.fn(() =>
  Promise.resolve({ success: true, data: { upiId: "careeroptics@icici", merchantName: "Career Optics Computer Academy" } }),
);

vi.mock("@/lib/supabase/data", () => ({
  submitRechargeRequest,
  uploadRechargeProof,
  getRechargeUpi: (...args: unknown[]) => getRechargeUpi(...(args as [])),
}));
vi.mock("qrcode", () => ({ default: { toDataURL: () => Promise.resolve("data:image/png;base64,QR") } }));

const { RechargeDrawer } = await import("@/components/branch/RechargeDrawer");

const INSTITUTES = [
  { id: "brch09", name: "PNS ACADEMY", directorName: "BRCH09", balance: 10000 },
  { id: "brch11", name: "Kothrud Centre", directorName: "BRCH11", balance: 4000 },
];

function open(props: Record<string, unknown> = {}) {
  return render(
    <RechargeDrawer
      open
      onOpenChange={() => {}}
      institutes={INSTITUTES}
      onSuccess={() => {}}
      user={{ id: "u1", name: "Branch Staff", email: "staff@example.com", organizationId: "org1" }}
      {...props}
    />,
  );
}

/** Fill the two fields the submit button waits on. */
function fillAmountAndReference() {
  fireEvent.change(screen.getByPlaceholderText(/Enter amount/i), { target: { value: "2500" } });
  fireEvent.change(screen.getByPlaceholderText(/329104829102/), { target: { value: "11323" } });
}

beforeEach(() => {
  getRechargeUpi.mockClear();
  submitRechargeRequest.mockReset();
  uploadRechargeProof.mockReset();
  submitRechargeRequest.mockResolvedValue({ success: true, data: { id: "txn1" } });
});

describe("RechargeDrawer, filing for a branch login", () => {
  it("shows the branch instead of a picker, so no other branch can be chosen", () => {
    open({ fixedInstituteId: "brch09" });

    expect(screen.queryByPlaceholderText(/Type branch name or code/i)).toBeNull();
    expect(screen.getByText("PNS ACADEMY")).toBeInTheDocument();
    expect(screen.getByText(/your branch/i)).toBeInTheDocument();
  });

  // The bug: the branch picked from a list of every branch in the organisation,
  // and the policy on branch_transactions rejected the insert on submit.
  it("files against the branch it was given, not one typed into a search box", async () => {
    open({ fixedInstituteId: "brch09" });
    fillAmountAndReference();
    fireEvent.click(screen.getByRole("button", { name: /Submit Recharge/i }));

    await waitFor(() => expect(submitRechargeRequest).toHaveBeenCalled());
    expect(submitRechargeRequest.mock.calls[0][0]).toMatchObject({
      branchId: "brch09",
      amount: 2500,
      reference: "11323",
    });
  });

  it("refuses to submit when the branch is not among the active ones", async () => {
    open({ fixedInstituteId: "brch-missing" });
    fillAmountAndReference();

    expect(screen.getByText(/not in the list of active branches/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Submit Recharge/i })).toBeDisabled();
    expect(submitRechargeRequest).not.toHaveBeenCalled();
  });
});

describe("RechargeDrawer, the account being paid", () => {
  // It used to be a constant in the file: one institute's UPI ID, shown to
  // every branch on every installation.
  it("shows the organisation's own UPI account, not a hardcoded one", async () => {
    open();
    expect(await screen.findByText("careeroptics@icici")).toBeInTheDocument();
    expect(getRechargeUpi).toHaveBeenCalledWith("org1");
  });

  it("still shows an account to pay when the organisation has not set one", async () => {
    getRechargeUpi.mockResolvedValueOnce({ success: true, data: null });
    open();
    await waitFor(() => expect(getRechargeUpi).toHaveBeenCalled());
    expect(screen.getByText(/@/)).toBeInTheDocument();
  });
});

describe("RechargeDrawer, filing as an administrator", () => {
  it("keeps the picker, since an admin may top up any branch", () => {
    open({ fixedInstituteId: null });
    expect(screen.getByPlaceholderText(/Type branch name or code/i)).toBeInTheDocument();
  });

  it("cannot submit until a branch is chosen", async () => {
    open({ fixedInstituteId: null });
    fillAmountAndReference();

    expect(screen.getByRole("button", { name: /Submit Recharge/i })).toBeDisabled();

    fireEvent.change(screen.getByPlaceholderText(/Type branch name or code/i), {
      target: { value: "Kothrud" },
    });
    fireEvent.click(screen.getByText("Kothrud Centre"));
    fireEvent.click(screen.getByRole("button", { name: /Submit Recharge/i }));

    await waitFor(() => expect(submitRechargeRequest).toHaveBeenCalled());
    expect(submitRechargeRequest.mock.calls[0][0]).toMatchObject({ branchId: "brch11" });
  });
});
