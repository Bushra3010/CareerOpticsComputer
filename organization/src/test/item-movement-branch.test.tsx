import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Which branch an item went to, or came from.
 *
 * `item_movements.branch_id` says whose register a row is in -- who recorded
 * the movement -- and there was nothing at all for the branch at the other end.
 * A dispatch to the Kothrud centre and a dispatch to a courier read the same
 * once filed, and the register could not be filtered by branch because no
 * column named one.
 */
const toast = vi.fn();
const getItemMovements = vi.fn();
const createItemMovement = vi.fn();
const getBranches = vi.fn();

vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast }) }));
vi.mock("@/components/layout/AppLayout", () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "u1", role: "ORGANIZATION_ADMIN", organizationId: "org1" },
    branchId: null,
    organizationId: "org1",
    view: "admin",
  }),
}));
vi.mock("@/lib/supabase/data", () => ({
  getBranches: (...args: unknown[]) => getBranches(...(args as [])),
}));
vi.mock("@/lib/supabase/reception", async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    getItemMovements: (...args: unknown[]) => getItemMovements(...(args as [])),
    createItemMovement: (...args: unknown[]) => createItemMovement(...(args as [])),
    updateItemMovement: vi.fn(),
    deleteItemMovement: vi.fn(),
  };
});

const ItemMovementWorkspace = (await import("@/pages/reception/ItemMovementWorkspace")).default;

const MOVEMENTS = [
  {
    id: "mv1",
    branch_id: "b1",
    counterparty_branch_id: "b2",
    direction: "Dispatched",
    item: "Certificates",
    item_id: "CRT-1",
    category: "certificates",
    party: "Kothrud front desk",
    quantity: 12,
    department: "Academics",
    status: "In transit",
    courier: "",
    tracking: "",
    notes: "",
    dispatch_date: "2026-09-15",
    receive_date: null,
    created_at: "2026-09-15T10:00:00.000Z",
  },
  {
    id: "mv2",
    branch_id: "b1",
    counterparty_branch_id: null,
    direction: "Received",
    item: "Printer toner",
    item_id: "TNR-9",
    category: "equipment",
    party: "Bluedart",
    quantity: 2,
    department: "IT",
    status: "Completed",
    courier: "Bluedart",
    tracking: "BD123",
    notes: "",
    dispatch_date: null,
    receive_date: "2026-09-16",
    created_at: "2026-09-16T10:00:00.000Z",
  },
];

const rowFor = (item: string) =>
  screen.getAllByText(item).map((el) => el.closest("tr")).find(Boolean)!;

beforeEach(() => {
  toast.mockClear();
  localStorage.clear();
  getItemMovements.mockResolvedValue({ success: true, data: MOVEMENTS });
  createItemMovement.mockResolvedValue({ success: true, data: MOVEMENTS[0] });
  getBranches.mockResolvedValue({
    success: true,
    data: [
      { id: "b1", name: "Main Branch" },
      { id: "b2", name: "Kothrud Centre" },
    ],
  });
});

describe("the movement register", () => {
  it("names the branch at the other end of each movement", async () => {
    render(<MemoryRouter><ItemMovementWorkspace /></MemoryRouter>);
    await waitFor(() => expect(getItemMovements).toHaveBeenCalled());

    expect(within(rowFor("Certificates")).getByText("Kothrud Centre")).toBeInTheDocument();
    // A courier is not a branch, and should not be dressed as one.
    expect(within(rowFor("Printer toner")).getByText("—")).toBeInTheDocument();
  });

  it("filters the register down to one branch", async () => {
    render(<MemoryRouter><ItemMovementWorkspace /></MemoryRouter>);
    await waitFor(() => expect(getItemMovements).toHaveBeenCalled());

    fireEvent.click(screen.getByRole("button", { name: /more filters/i }));
    // The branch filter is the first of the extra ones the button reveals.
    const filters = screen.getAllByRole("combobox");
    fireEvent.keyDown(filters[1], { key: "Enter" });
    // The name is on a row as well as in the list, so pick it out of the list.
    const list = await screen.findByRole("listbox");
    fireEvent.click(within(list).getByText("Kothrud Centre"));

    expect(screen.queryAllByText("Printer toner")).toHaveLength(0);
    expect(screen.getAllByText("Certificates").length).toBeGreaterThan(0);
  });
});
