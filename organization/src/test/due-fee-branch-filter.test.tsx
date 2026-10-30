import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

/**
 * Due Fee Collection showed every branch's dues in one pile, with totals for
 * all of them, and named each student by a database key. An organisation
 * account can now pick a branch; the cards, the list, reminders and export
 * all follow it.
 */
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock("@/components/layout/AppLayout", () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "u1", role: "ORGANIZATION_ADMIN", organizationId: "org1", branchId: null }, view: "admin" }),
}));
vi.mock("@/lib/supabase/data", () => ({
  getBranches: () =>
    Promise.resolve({ success: true, data: [{ id: "b1", name: "Kothrud" }, { id: "b2", name: "Patna" }] }),
}));
const invoice = (id: string, branchId: string, studentId: string, enrollmentNo: string, firstName: string, total: number) => ({
  id, branchId, studentId, invoiceNo: `INV-${id}`, description: "ADCA", totalAmount: total, paidAmount: 0,
  dueDate: "2026-09-01", status: "DUE", payments: [],
  student: { id: studentId, firstName, lastName: "", phone: "", enrollmentNo },
});
vi.mock("@/lib/supabase/studentFee", async (original) => {
  const actual = await original<typeof import("@/lib/supabase/studentFee")>();
  return {
    ...actual,
    listInvoices: () =>
      Promise.resolve({
        success: true,
        data: [
          invoice("i1", "b1", "s1", "ENR-001", "Raj", 1000),
          invoice("i2", "b1", "s1", "ENR-001", "Raj", 500),
          invoice("i3", "b2", "s2", "ENR-002", "Sita", 2000),
        ],
      }),
  };
});

const { default: DueFeeCollection } = await import("@/pages/fee/DueFeeCollection");

const statValue = (title: string) => screen.getByText(title).closest("div")!.parentElement!.textContent;

describe("Due Fee Collection branch filter", () => {
  it("narrows the cards and the list to the branch picked", async () => {
    render(<MemoryRouter><DueFeeCollection /></MemoryRouter>);
    await screen.findAllByText("ENR-002", { exact: false });
    // One student with two invoices counts once.
    expect(statValue("Students with Dues")).toContain("2");

    fireEvent.keyDown(screen.getByRole("combobox", { name: "Branch" }), { key: "Enter" });
    fireEvent.click(await screen.findByRole("option", { name: "Kothrud" }));

    await waitFor(() => expect(screen.queryByText("ENR-002", { exact: false })).not.toBeInTheDocument());
    const rows = screen.getAllByText("ENR-001", { exact: false }).map((el) => el.closest("tr")).filter(Boolean);
    expect(rows).toHaveLength(2);
    expect(within(rows[0]!).getByText("Kothrud")).toBeInTheDocument();
    expect(statValue("Students with Dues")).toContain("1");
    expect(statValue("Total Due Amount")).toContain("1,500");
  });
});
