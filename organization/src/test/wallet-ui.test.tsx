import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Supabase client
vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({ single: async () => ({ data: null, error: null }), maybeSingle: async () => ({ data: null, error: null }) }),
        in: () => ({ order: () => Promise.resolve({ data: [], error: null }) }),
        order: () => Promise.resolve({
          data: [
            {
              id: "TXN-101",
              branchId: "b1",
              amount: 5000,
              type: "CREDIT",
              category: "RECHARGE",
              description: "Test recharge • Submitted by: Rahul Staff",
              reference: "UTR-123456",
              status: "PENDING",
              paymentMethod: "UPI",
              balanceAfter: 50000,
              createdAt: "2026-09-09T23:20:00.000Z",
              proofUrl: null,
              reviewedBy: null,
              reviewedAt: null,
              branch: { id: "b1", name: "Canton Branch", code: "CAN-01" },
            },
          ],
          error: null,
        }),
        is: () => ({ order: () => Promise.resolve({ data: [{ id: "b1", name: "Canton Branch", code: "CAN-01", isActive: true }], error: null }) }),
      }),
    }),
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
  },
}));

// Mock AuthContext
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "admin-1", name: "Administrator", email: "admin@careeroptics.local", role: "ORGANIZATION_ADMIN" },
    view: "admin",
  }),
}));

const { default: WalletRecharge } = await import("@/pages/branch/WalletRecharge");

describe("Wallet Recharge & Transaction Ledger UI", () => {
  it("renders the executive header, stats cards, status tabs, and high-volume table", async () => {
    render(
      <MemoryRouter>
        <WalletRecharge />
      </MemoryRouter>
    );

    // 1. Header
    expect(screen.getByText("Wallet Recharge & Transaction Ledger")).toBeDefined();

    // 2. Stats cards
    expect(screen.getByText("Total Wallet Balance")).toBeDefined();
    expect(screen.getByText("Approved This Month")).toBeDefined();
    expect(screen.getAllByText("Pending Approval").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("Total Transactions")).toBeDefined();

    // 3. Status Tabs
    expect(screen.getByText("All Transactions")).toBeDefined();
    expect(screen.getByText("Approved")).toBeDefined();
    expect(screen.getByText("Rejected")).toBeDefined();

    // 4. Action buttons
    expect(screen.getByText("+ New Recharge")).toBeDefined();
    expect(screen.getByText("Refresh")).toBeDefined();
    expect(screen.getByText("Export CSV")).toBeDefined();

    // 5. High-volume table columns
    await waitFor(() => {
      expect(screen.getByText("UTR / Reference No.")).toBeDefined();
      expect(screen.getByText("Institute / Branch")).toBeDefined();
      expect(screen.getByText("Submitted By")).toBeDefined();
    });

    // 6. Transaction Row is rendered with UTR and action buttons
    await waitFor(() => {
      expect(screen.getByText("UTR-123456")).toBeDefined();
      expect(screen.getByText("Canton Branch")).toBeDefined();
      expect(screen.getByText("Rahul Staff")).toBeDefined();
      expect(screen.getByText("Approve")).toBeDefined();
      expect(screen.getByText("Reject")).toBeDefined();
    });

    // 7. Click "+ New Recharge" button to verify drawer opens
    const newRechargeBtn = screen.getByText("+ New Recharge");
    fireEvent.click(newRechargeBtn);

    await waitFor(() => {
      expect(screen.getByText("New Wallet Recharge Request")).toBeDefined();
      expect(screen.getByText("1. Institute / Branch")).toBeDefined();
      expect(screen.getByText("2. Recharge Amount (₹)")).toBeDefined();
      expect(screen.getByText("3. Payment Method")).toBeDefined();
      expect(screen.getByText("4. UTR / Transaction Reference No.")).toBeDefined();
      expect(screen.getByText("Submit Recharge")).toBeDefined();
    });
  });
});
