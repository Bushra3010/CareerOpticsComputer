import { render, screen, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

/**
 * A centre's panel -- including the head office's "Login as center" -- shows
 * the centre's ID, licence validity and wallet balance, and re-reads the
 * balance when a certificate has just been paid from it.
 */
let balance = 1200;
const auth = { view: "franchise", branchId: "b1" };
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => auth }));
vi.mock("@/lib/supabase/data", () => ({
  WALLET_CHANGED: "wallet:changed",
  getCentreSummary: () =>
    Promise.resolve({ name: "Begusarai Centre", code: "N0088", isActive: true, validUpto: "2099-06-20", balance }),
}));

const { CentreBar } = await import("@/components/layout/CentreBar");

describe("CentreBar", () => {
  it("shows the centre and its wallet, and refreshes after a charge", async () => {
    render(<MemoryRouter><CentreBar /></MemoryRouter>);
    expect(await screen.findByText("₹1,200")).toBeInTheDocument();
    expect(screen.getByText("ID N0088")).toBeInTheDocument();
    expect(screen.getByText("Valid upto 20/06/2099")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /My wallet/ })).toHaveAttribute("href", "/branch/wallet");

    balance = 1050;
    act(() => { window.dispatchEvent(new Event("wallet:changed")); });
    await waitFor(() => expect(screen.getByText("₹1,050")).toBeInTheDocument());
  });

  it("stays out of the head office's own view", () => {
    auth.view = "admin";
    const { container } = render(<MemoryRouter><CentreBar /></MemoryRouter>);
    expect(container).toBeEmptyDOMElement();
    auth.view = "franchise";
  });
});
