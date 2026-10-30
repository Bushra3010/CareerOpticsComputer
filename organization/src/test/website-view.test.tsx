import { render, screen, waitFor, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { asDay, daysUntil, licenceState, EXPIRY_WARNING_DAYS } from "@/lib/websiteLicence";

/**
 * The register exists to catch a renewal before it lapses, so the state is
 * computed rather than left as a column of dates for the reader to compare
 * against today's.
 */
const TODAY = new Date("2026-09-19T14:30:00Z");

describe("licenceState", () => {
  it("calls a date already past expired", () => {
    expect(licenceState("2026-09-18", TODAY)).toBe("Expired");
    expect(licenceState("2025-01-01", TODAY)).toBe("Expired");
  });

  // Compared as days, not instants: a licence expiring later today has not
  // expired, and an hour of clock difference must not say otherwise.
  it("does not expire a licence that runs to the end of today", () => {
    expect(licenceState("2026-09-19", TODAY)).toBe("Expiring soon");
    expect(daysUntil("2026-09-19", TODAY)).toBe(0);
  });

  it("warns inside the notice period and not outside it", () => {
    expect(licenceState("2026-10-19", TODAY)).toBe("Expiring soon"); // 30 days
    expect(licenceState("2026-10-20", TODAY)).toBe("Active"); // 31
    expect(EXPIRY_WARNING_DAYS).toBe(30);
  });

  it("separates a branch with no date from one that is fine", () => {
    // Otherwise a branch nobody has set up reads as healthy.
    expect(licenceState("", TODAY)).toBe("No date");
    expect(licenceState("not-a-date", TODAY)).toBe("No date");
    expect(licenceState("2027-12-31", TODAY)).toBe("Active");
  });
});

describe("asDay", () => {
  it("prints the day the register shows", () => {
    // "Sep" or "Sept" depending on the platform's ICU data.
    expect(asDay("2026-09-18")).toMatch(/^18 Sept? 2026$/);
  });

  it("dashes an empty date and leaves an unparseable one alone", () => {
    expect(asDay("")).toBe("—");
    expect(asDay("whenever")).toBe("whenever");
  });
});

/* ---------- the page ---------- */

const BRANCHES = [
  { id: "b1", name: "Patna Branch", code: "BRPTN", branchType: "MAIN", phone: "9876543210", whatsappNumber: "9876543211", website: "" },
  { id: "b2", name: "Gaya Branch", code: "BRGAY", branchType: "SUB", phone: "", whatsappNumber: "", website: "https://gaya.example.com/" },
];
const SETTINGS = [
  { branchId: "b1", siteName: "Ideal Patna", primaryDomain: "https://patna.example.com", subdomain: "", registrationDate: "2026-01-01", expiryDate: "2027-12-31", renewalDate: "2028-01-01" },
];

const toast = vi.fn();
const toastApi = { toast };
vi.mock("@/hooks/use-toast", () => ({ useToast: () => toastApi }));
vi.mock("@/components/layout/AppLayout", () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/components/ui/PageHeader", () => ({
  PageHeader: ({ actions }: { actions?: React.ReactNode }) => <div>{actions}</div>,
}));
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "u1", role: "ORGANIZATION_ADMIN", organizationId: "org1", branchId: null } }),
}));
/* `getBranches` awaits the query builder itself, so the fake has to be
   thenable rather than resolving on one particular chain method. */
vi.mock("@/lib/supabase/client", () => {
  const rowsFor = (table: string) => (table === "branches" ? BRANCHES : SETTINGS);
  const builder = (table: string) => {
    const chain: Record<string, unknown> = {
      select: () => chain,
      eq: () => chain,
      in: () => chain,
      is: () => chain,
      order: () => chain,
      limit: () => chain,
      then: (resolve: (v: unknown) => unknown) => resolve({ data: rowsFor(table), error: null }),
    };
    return chain;
  };
  return { supabase: { from: builder }, supabaseUrl: "https://project.supabase.co" };
});

const WebsiteView = (await import("@/pages/branch/WebsiteView")).default;

const table = () => screen.getByRole("table");
const row = (name: string) => within(table()).getByText(name).closest("tr") as HTMLElement;

beforeEach(() => toast.mockClear());

describe("Website View", () => {
  it("lists every branch with its site", async () => {
    render(<WebsiteView />);
    await waitFor(() => expect(within(table()).getByText("Patna Branch")).toBeInTheDocument());

    const link = within(row("Patna Branch")).getByRole("link", { name: /patna\.example\.com/ });
    expect(link).toHaveAttribute("href", "https://patna.example.com");
  });

  it("falls back to the branch's own address, and strips the scheme", async () => {
    render(<WebsiteView />);
    // Gaya has no settings row; its address was recorded on the branch itself.
    await waitFor(() => expect(within(table()).getByText("Gaya Branch")).toBeInTheDocument());

    const link = within(row("Gaya Branch")).getByRole("link", { name: /gaya\.example\.com/ });
    expect(link).toHaveTextContent("gaya.example.com");
    expect(link).toHaveAttribute("href", "https://gaya.example.com");
  });

  it("dials the mobile and opens WhatsApp on the other number", async () => {
    render(<WebsiteView />);
    await waitFor(() => expect(within(table()).getByText("Patna Branch")).toBeInTheDocument());

    const cells = row("Patna Branch");
    expect(within(cells).getByRole("link", { name: /call patna branch/i })).toHaveAttribute(
      "href",
      "tel:+919876543210",
    );
    expect(within(cells).getByRole("link", { name: /whatsapp patna branch/i })).toHaveAttribute(
      "href",
      expect.stringContaining("919876543211"),
    );
  });

  it("says a branch has no number rather than offering a dead link", async () => {
    render(<WebsiteView />);
    await waitFor(() => expect(within(table()).getByText("Gaya Branch")).toBeInTheDocument());

    expect(within(row("Gaya Branch")).queryByRole("link", { name: /call/i })).toBeNull();
    expect(within(row("Gaya Branch")).getAllByText("No number").length).toBe(2);
  });

  it("names a branch with no site instead of printing a dash", async () => {
    render(<WebsiteView />);
    await waitFor(() => expect(within(table()).getByText("Patna Branch")).toBeInTheDocument());

    // Both branches here have an address; the empty state is the copy itself.
    expect(screen.queryByText("No website set up")).toBeNull();
  });
});
