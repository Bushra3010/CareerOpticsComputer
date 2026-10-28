import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * An organisation account reads every branch's visitors out of one list. The
 * branch each one walked into was on the row all along — as `branchIdRef`,
 * used for updates and deletes — but was never shown and could not be filtered
 * on, so the list gave no way to tell them apart.
 */
const branchId = { current: null as string | null };
let branchesPending = false;
let branchesResolve: (v: unknown) => void = () => {};

const ENQUIRIES = [
  { id: "e1", branchId: "b1", visitorName: "Krishna Singh", phone: "1", purpose: "ADMISSION", status: "NEW", visitDate: "2026-09-10T09:00:00Z" },
  { id: "e2", branchId: "b2", visitorName: "Raj Shekhar", phone: "2", purpose: "ADMISSION", status: "NEW", visitDate: "2026-09-10T10:00:00Z" },
  { id: "e3", branchId: "b1", visitorName: "Sita Devi", phone: "3", purpose: "FEES", status: "NEW", visitDate: "2026-09-10T11:00:00Z" },
];

const toast = vi.fn();
// Stable across renders: `loadEnquiries` lists `toast` in its useCallback deps,
// so a fresh object each render refires its effect forever.
const toastApi = { toast };
vi.mock("@/hooks/use-toast", () => ({ useToast: () => toastApi }));
vi.mock("react-router-dom", () => ({ useNavigate: () => vi.fn() }));
vi.mock("@/components/layout/AppLayout", () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "u1", role: "ORGANIZATION_ADMIN", organizationId: "org1", branchId: branchId.current },
  }),
}));
vi.mock("@/lib/supabase/data", () => ({
  getEnquiries: () => Promise.resolve({ success: true, data: ENQUIRIES }),
  createEnquiry: vi.fn(),
  updateEnquiry: vi.fn(),
  deleteEnquiry: vi.fn(),
  getBranches: () =>
    branchesPending
      ? new Promise((resolve) => {
          branchesResolve = resolve;
        })
      : Promise.resolve(BRANCH_RESULT),
}));

const BRANCH_RESULT = {
  success: true,
  data: [
    { id: "b1", name: "Patna Branch" },
    { id: "b2", name: "Kothrud Branch" },
  ],
};

const EnquiriesWorkspace = (await import("@/pages/reception/EnquiriesWorkspace")).default;

/* jsdom applies no CSS, so the responsive card list renders alongside the
   table and every visitor's name appears twice. Query inside the table. */
const log = () => screen.getByRole("table");
const row = (name: string) =>
  within(log()).getByText(name).closest("tr") as HTMLElement;

const renderList = async () => {
  render(<EnquiriesWorkspace />);
  await waitFor(() => expect(within(log()).getByText("Krishna Singh")).toBeInTheDocument());
};

/** Renders with the branch list already resolved. */
const renderLoaded = async () => {
  await renderList();
  await waitFor(() =>
    expect(within(row("Krishna Singh")).getByText("Patna Branch")).toBeInTheDocument(),
  );
};

beforeEach(() => {
  branchId.current = null;
  branchesPending = false;
  localStorage.clear();
});

describe("Reception, seen from the organisation", () => {
  it("names the branch each visitor walked into", async () => {
    await renderLoaded();

    expect(within(row("Krishna Singh")).getByText("Patna Branch")).toBeInTheDocument();
    expect(within(row("Raj Shekhar")).getByText("Kothrud Branch")).toBeInTheDocument();
  });

  it("gives the log a Branch column", async () => {
    await renderLoaded();
    expect(screen.getByRole("columnheader", { name: "Branch" })).toBeInTheDocument();
  });

  it("waits for the branch list rather than calling every row unknown", async () => {
    branchesPending = true;
    await renderList();

    // The list arrives after the visitors do. "Unknown branch" on every row for
    // that moment reads as data loss rather than as a wait.
    expect(screen.queryByText("Unknown branch")).toBeNull();
    expect(within(row("Krishna Singh")).getByText("…")).toBeInTheDocument();
  });

  it("offers a branch filter once the filters are open", async () => {
    await renderLoaded();
    fireEvent.click(screen.getByRole("button", { name: /filters/i }));

    // Radix renders the closed select as its placeholder.
    expect(screen.getByText("All branches")).toBeInTheDocument();
  });

  // The filter was offered but did nothing: picking a branch left every
  // visitor on the list, because the list was not recomputed when it changed.
  it("narrows the list to the branch picked", async () => {
    await renderLoaded();
    fireEvent.click(screen.getByRole("button", { name: /filters/i }));
    const trigger = screen.getByText("All branches").closest("button")!;
    fireEvent.keyDown(trigger, { key: "Enter" });
    fireEvent.click(await screen.findByRole("option", { name: "Kothrud Branch" }));

    await waitFor(() => expect(within(log()).queryByText("Krishna Singh")).toBeNull());
    expect(within(log()).getByText("Raj Shekhar")).toBeInTheDocument();
    expect(within(log()).queryByText("Sita Devi")).toBeNull();
  });
});

describe("Reception, seen from a branch", () => {
  it("leaves the branch column out, since every row is that one branch", async () => {
    branchId.current = "b1";
    await renderList();

    expect(screen.queryByRole("columnheader", { name: "Branch" })).toBeNull();
    expect(screen.queryByText("Patna Branch")).toBeNull();
  });
});
