import { render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Which branch an enquiry came in at.
 *
 * Head office is shown every branch's enquiries at once -- `getEnquiries` only
 * filters by branch when the caller has one -- and the rows carried a
 * `branchId` and nothing a person could read. So the list was a pile of
 * enquiries from nowhere in particular, and there was no way to tell the branch
 * that took the call from the one that did not.
 */
const toast = vi.fn();
const getEnquiries = vi.fn();
const getBranches = vi.fn();
let signedIn = { branchId: null as string | null, organizationId: "org1" };

vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast }) }));
vi.mock("@/components/layout/AppLayout", () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "u1", role: "ORGANIZATION_ADMIN", ...signedIn },
    ...signedIn,
    view: "admin",
  }),
}));
vi.mock("@/lib/supabase/data", () => ({
  getEnquiries: (...args: unknown[]) => getEnquiries(...(args as [])),
  getBranches: (...args: unknown[]) => getBranches(...(args as [])),
  createEnquiry: vi.fn(),
  updateEnquiry: vi.fn(),
}));

const BranchEnquiry = (await import("@/pages/enquiry/BranchEnquiry")).default;

const ENQUIRIES = [
  {
    id: "e1",
    branchId: "b1",
    visitorName: "Md Mahmood Alam",
    phone: "9162081977",
    purpose: "ADMISSION",
    personToMeet: "Pushpak Sir",
    department: "ACADEMICS",
    status: "CONTACTED",
    visitDate: "2026-09-15T00:00:00.000Z",
    visitTime: "18:30",
    createdAt: "2026-09-15T00:00:00.000Z",
  },
  {
    id: "e2",
    branchId: "b2",
    visitorName: "Sunita Rao",
    phone: "9822041100",
    purpose: "FEE",
    personToMeet: "Accounts",
    department: "ACCOUNTS",
    status: "NEW",
    visitDate: "2026-09-16T00:00:00.000Z",
    visitTime: "11:00",
    createdAt: "2026-09-16T00:00:00.000Z",
  },
];

/** The desktop table; the same list is drawn again as cards for a phone. */
const rowFor = (name: string) =>
  screen.getAllByText(name).map((el) => el.closest("tr")).find(Boolean)!;

beforeEach(() => {
  toast.mockClear();
  signedIn = { branchId: null, organizationId: "org1" };
  getEnquiries.mockResolvedValue({ success: true, data: ENQUIRIES });
  getBranches.mockResolvedValue({
    success: true,
    data: [
      { id: "b1", name: "Main Branch" },
      { id: "b2", name: "Kothrud Centre" },
    ],
  });
});

describe("Branch enquiries", () => {
  it("names the branch each enquiry came in at", async () => {
    render(<MemoryRouter><BranchEnquiry /></MemoryRouter>);
    await waitFor(() => expect(getEnquiries).toHaveBeenCalled());

    expect((await screen.findAllByText("Branch")).length).toBeGreaterThan(0);
    expect(within(rowFor("Md Mahmood Alam")).getByText("Main Branch")).toBeInTheDocument();
    expect(within(rowFor("Sunita Rao")).getByText("Kothrud Centre")).toBeInTheDocument();
  });

  it("says so for an enquiry whose branch is no longer on file", async () => {
    getEnquiries.mockResolvedValue({
      success: true,
      data: [{ ...ENQUIRIES[0], branchId: "gone" }],
    });
    render(<MemoryRouter><BranchEnquiry /></MemoryRouter>);
    await waitFor(() => expect(getEnquiries).toHaveBeenCalled());

    // Better than an empty cell, which reads as "no branch" rather than "a
    // branch this list cannot name".
    expect((await screen.findAllByText("Unknown branch")).length).toBeGreaterThan(0);
  });

  it("leaves the column out for a branch login, which has only its own", async () => {
    signedIn = { branchId: "b1", organizationId: "org1" };
    render(<MemoryRouter><BranchEnquiry /></MemoryRouter>);
    await waitFor(() => expect(getEnquiries).toHaveBeenCalledWith("b1"));

    // A column repeating one name on every row is noise.
    expect(screen.queryByText("Branch")).toBeNull();
  });
});
