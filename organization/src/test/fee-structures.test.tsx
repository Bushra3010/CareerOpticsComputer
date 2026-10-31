import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";

/**
 * Fee types and groups moved from each browser's localStorage to the database.
 * The import has to keep the browser's ids, because fee_invoices."feeGroupId"
 * already holds them, and may only clear the browser's copy once the database
 * has it.
 */

const toast = vi.fn();
const auth = {
  view: "admin",
  organizationId: "org1",
  user: { id: "u1", organizationId: "org1", branchId: "b1", role: "ORGANIZATION_ADMIN" },
};
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast }) }));
vi.mock("@/components/layout/AppLayout", () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => auth }));
vi.mock("@/contexts/PermissionsContext", () => ({ usePermissionsOrNull: () => ({}) }));
vi.mock("@/components/ui/EditableSelect", () => ({
  EditableSelect: ({ value }: { value: string }) => <span>{value}</span>,
}));

const rpc = vi.fn();
vi.mock("@/lib/supabase/client", () => ({ supabase: { rpc: (...args: unknown[]) => rpc(...args) } }));

const loadFeeCatalog = vi.fn();
const createFeeType = vi.fn();
const listFeeGroups = vi.fn();
vi.mock("@/lib/supabase/feeStructures", async () => {
  const actual = await vi.importActual<typeof import("@/lib/supabase/feeStructures")>("@/lib/supabase/feeStructures");
  return {
    ...actual,
    loadFeeCatalog: (...args: unknown[]) => loadFeeCatalog(...args),
    createFeeType: (...args: unknown[]) => createFeeType(...args),
    listFeeGroups: (...args: unknown[]) => listFeeGroups(...args),
  };
});

const listStudents = vi.fn();
const listInvoices = vi.fn();
vi.mock("@/lib/supabase/studentFee", async () => {
  const actual = await vi.importActual<typeof import("@/lib/supabase/studentFee")>("@/lib/supabase/studentFee");
  return { ...actual, listStudents: () => listStudents(), listInvoices: () => listInvoices() };
});
vi.mock("@/lib/supabase/data", () => ({
  deleteInvoice: vi.fn(),
  getBranches: () => Promise.resolve({ data: [] }),
}));

const { importLocalFeeStructures } = await vi.importActual<typeof import("@/lib/supabase/feeStructures")>(
  "@/lib/supabase/feeStructures",
);
const { FEE_GROUPS_KEY, FEE_TYPES_KEY } = await import("@/data/fee-catalog");
const FeeTypes = (await import("@/pages/fee/FeeTypes")).default;
const FeeAllocation = (await import("@/pages/fee/FeeAllocation")).default;

const feeType = (id: string, name: string, defaultAmount: number) => ({
  id,
  name,
  code: `${name.slice(0, 2).toUpperCase()}001`,
  category: "Academic",
  defaultAmount,
  frequency: "Yearly",
  applicableTo: ["All Courses"],
  description: "",
  status: "active" as const,
});

beforeEach(() => {
  toast.mockClear();
  rpc.mockReset();
  loadFeeCatalog.mockReset();
  createFeeType.mockReset();
  listFeeGroups.mockReset();
  listStudents.mockReset();
  listInvoices.mockReset();
  localStorage.clear();
});

/* ------------------------------------------------------------ import */

describe("importing this browser's fee catalogue", () => {
  const seed = () => {
    localStorage.setItem(FEE_TYPES_KEY, JSON.stringify([feeType("lx1", "Tuition Fee", 5000), feeType("lx2", "Lab Fee", 750.5)]));
    localStorage.setItem(
      FEE_GROUPS_KEY,
      JSON.stringify([
        {
          id: "grp-legacy",
          name: "Standard Package",
          description: "",
          feeTypes: ["Tuition Fee", "Lab Fee", "Hostel Fee"],
          totalAmount: 6000,
          courses: ["All Courses"],
          studentsCount: 12,
          status: "active",
        },
      ]),
    );
  };

  it("sends the browser's ids and clears its copy only once the database has it", async () => {
    seed();
    let keysWhileSaving: Array<string | null> = [];
    rpc.mockImplementation(async () => {
      keysWhileSaving = [localStorage.getItem(FEE_TYPES_KEY), localStorage.getItem(FEE_GROUPS_KEY)];
      return { data: { imported: true, types: 2, groups: 1 }, error: null };
    });

    const result = await importLocalFeeStructures();

    expect(result).toEqual({ imported: true, types: 2, groups: 1 });
    const [fn, args] = rpc.mock.calls[0];
    expect(fn).toBe("import_fee_structures");
    expect(args.p_types.map((t: { id: string }) => t.id)).toEqual(["lx1", "lx2"]);
    const [group] = args.p_groups;
    // Invoices already point at this id.
    expect(group.id).toBe("grp-legacy");
    expect(group.totalAmount).toBe(6000);
    expect(group.items).toEqual([
      { feeTypeId: "lx1", name: "Tuition Fee", amount: 5000 },
      { feeTypeId: "lx2", name: "Lab Fee", amount: 750.5 },
      // Gone from the browser's catalogue, but still part of what was billed.
      { feeTypeId: null, name: "Hostel Fee", amount: 0 },
    ]);
    expect(keysWhileSaving.every(Boolean)).toBe(true);
    expect(localStorage.getItem(FEE_TYPES_KEY)).toBeNull();
    expect(localStorage.getItem(FEE_GROUPS_KEY)).toBeNull();
  });

  it("keeps the browser's copy when the insert fails", async () => {
    seed();
    rpc.mockResolvedValue({ data: null, error: { code: "23505", message: "duplicate key value violates unique constraint" } });

    await expect(importLocalFeeStructures()).rejects.toThrow(/duplicate key/);
    expect(localStorage.getItem(FEE_TYPES_KEY)).not.toBeNull();
    expect(localStorage.getItem(FEE_GROUPS_KEY)).not.toBeNull();
  });

  it("keeps the browser's copy when the organisation already had a catalogue", async () => {
    seed();
    rpc.mockResolvedValue({ data: { imported: false, types: 0, groups: 0 }, error: null });

    expect(await importLocalFeeStructures()).toEqual({ imported: false, types: 0, groups: 0 });
    expect(localStorage.getItem(FEE_TYPES_KEY)).not.toBeNull();
  });

  it("renames repeated names instead of letting the unique index refuse the lot", async () => {
    localStorage.setItem(
      FEE_TYPES_KEY,
      JSON.stringify([feeType("a", "Lab Fee (Copy)", 10), { ...feeType("b", "lab fee (copy)", 10), code: "XX001" }]),
    );
    rpc.mockResolvedValue({ data: { imported: true, types: 2, groups: 0 }, error: null });

    await importLocalFeeStructures();
    expect(rpc.mock.calls[0][1].p_types.map((t: { name: string }) => t.name)).toEqual(["Lab Fee (Copy)", "lab fee (copy) (2)"]);
  });

  it("does not call the database when the browser has nothing", async () => {
    expect(await importLocalFeeStructures()).toEqual({ imported: false, types: 0, groups: 0 });
    expect(rpc).not.toHaveBeenCalled();
  });
});

/* ------------------------------------------------------------ Fee Types page */

describe("Fee Types page", () => {
  it("refuses a second fee type with the same name", async () => {
    loadFeeCatalog.mockResolvedValue({ types: [feeType("t1", "Tuition Fee", 5000)], groups: [], imported: null, importError: null });
    render(<MemoryRouter><FeeTypes /></MemoryRouter>);
    await screen.findAllByText("Tuition Fee");
    expect(loadFeeCatalog).toHaveBeenCalledWith("org1", { canImport: true });

    fireEvent.click(screen.getByRole("button", { name: /Add Fee Type/ }));
    fireEvent.change(await screen.findByLabelText("Fee Name *"), { target: { value: "  tuition fee " } });
    fireEvent.change(screen.getByLabelText("Default Amount (₹) *"), { target: { value: "1200" } });
    const submit = screen.getAllByRole("button", { name: "Add Fee Type" }).at(-1) as HTMLElement;
    fireEvent.click(submit);

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: "A fee type with that name already exists" })),
    );
    expect(createFeeType).not.toHaveBeenCalled();
  });

  it("refuses an amount with more than two decimals", async () => {
    loadFeeCatalog.mockResolvedValue({ types: [], groups: [], imported: null, importError: null });
    render(<MemoryRouter><FeeTypes /></MemoryRouter>);
    await waitFor(() => expect(loadFeeCatalog).toHaveBeenCalled());

    fireEvent.click(await screen.findByRole("button", { name: /Add Fee Type/ }));
    fireEvent.change(await screen.findByLabelText("Fee Name *"), { target: { value: "Exam Fee" } });
    fireEvent.change(screen.getByLabelText("Default Amount (₹) *"), { target: { value: "10.555" } });
    fireEvent.click(screen.getAllByRole("button", { name: "Add Fee Type" }).at(-1) as HTMLElement);

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: expect.stringMatching(/at most 2 decimals/) })),
    );
    expect(createFeeType).not.toHaveBeenCalled();
  });
});

/* ------------------------------------------------------- Fee Allocation page */

describe("Fee Allocation page", () => {
  it("reads its fee groups from the database module, not localStorage", async () => {
    // A stale browser copy that must not be used.
    localStorage.setItem(FEE_GROUPS_KEY, JSON.stringify([{ id: "g1", name: "Browser Copy", status: "active", totalAmount: 1 }]));
    listFeeGroups.mockResolvedValue([
      {
        id: "g1",
        name: "Standard Package",
        description: "",
        courses: ["All Courses"],
        totalAmount: 5000,
        status: "active",
        items: [{ feeTypeId: "t1", name: "Tuition Fee", amount: 5000 }],
      },
    ]);
    listStudents.mockResolvedValue({ success: true, data: [{ id: "s1", firstName: "Asha", lastName: "Rao", enrollmentNo: "EN1" }] });
    listInvoices.mockResolvedValue({
      success: true,
      data: [{ id: "i1", studentId: "s1", feeGroupId: "g1", totalAmount: 5000, description: "Old label", status: "DUE", payments: [] }],
    });

    render(<MemoryRouter><FeeAllocation /></MemoryRouter>);

    expect((await screen.findAllByText("Standard Package")).length).toBeGreaterThan(0);
    expect(listFeeGroups).toHaveBeenCalledWith("org1");
    expect(screen.queryByText("Browser Copy")).toBeNull();
    expect(screen.queryByText(/No active fee groups yet/)).toBeNull();
  });
});
