import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";

/**
 * General Settings are saved to the organisation's row, not the browser, and
 * the Partners pages read and write real tables. The data modules are mocked;
 * the validation and balance maths come from the real partners module.
 */
const toast = vi.fn();
let auth: Record<string, unknown> = {};
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast }) }));
vi.mock("@/components/layout/AppLayout", () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/components/ui/PageHeader", () => ({
  PageHeader: ({ actions }: { actions?: React.ReactNode }) => <div>{actions}</div>,
}));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => auth }));
vi.mock("next-themes", () => ({ useTheme: () => ({ theme: "light", setTheme: vi.fn() }) }));

const saveOrgSettings = vi.fn((..._a: unknown[]) => Promise.resolve());
const getOrgSettings = vi.fn();
vi.mock("@/lib/supabase/orgSettings", async () => {
  const actual = await vi.importActual<typeof import("@/lib/supabase/orgSettings")>("@/lib/supabase/orgSettings");
  return {
    ...actual,
    getOrgSettings: (...a: unknown[]) => getOrgSettings(...a),
    saveOrgSettings: (...a: unknown[]) => saveOrgSettings(...a),
  };
});

const createPartner = vi.fn((..._a: unknown[]) => Promise.resolve({}));
vi.mock("@/lib/supabase/partners", async () => {
  const actual = await vi.importActual<typeof import("@/lib/supabase/partners")>("@/lib/supabase/partners");
  return { ...actual, createPartner: (...a: unknown[]) => createPartner(...a) };
});

const { DEFAULT_GENERAL_SETTINGS, LEGACY_SETTINGS_KEY } = await import("@/lib/supabase/orgSettings");
const { summarise, partnerBalances, validateTransaction } = await import("@/lib/supabase/partners");
const GeneralSettings = (await import("@/pages/settings/GeneralSettings")).default;
const AddPartner = (await import("@/pages/partners/AddPartner")).default;

beforeEach(() => {
  toast.mockClear();
  saveOrgSettings.mockClear();
  createPartner.mockClear();
  getOrgSettings.mockReset();
  localStorage.clear();
});

describe("General Settings", () => {
  it("loads from the organisation and saves with its id", async () => {
    auth = { user: { role: "ORGANIZATION_ADMIN" }, organizationId: "org1" };
    getOrgSettings.mockResolvedValue({
      settings: { ...DEFAULT_GENERAL_SETTINGS, schoolName: "Career Optics" },
      isEmpty: false,
    });
    render(<GeneralSettings />);
    const name = await screen.findByLabelText("School Name");
    await waitFor(() => expect(name).toHaveValue("Career Optics"));
    expect(getOrgSettings).toHaveBeenCalledWith("org1");

    fireEvent.change(name, { target: { value: "Career Optics Computer" } });
    fireEvent.click(screen.getByRole("button", { name: /Save Changes/ }));

    await waitFor(() => expect(saveOrgSettings).toHaveBeenCalledTimes(1));
    const [orgId, saved] = saveOrgSettings.mock.calls[0] as [string, Record<string, unknown>];
    expect(orgId).toBe("org1");
    expect(saved.schoolName).toBe("Career Optics Computer");
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: "Settings saved" }));
    expect(JSON.stringify(toast.mock.calls)).not.toMatch(/this device/);
  });

  it("folds in the browser's old copy once when the organisation has none", async () => {
    auth = { user: { role: "ORGANIZATION_ADMIN" }, organizationId: "org1" };
    localStorage.setItem(LEGACY_SETTINGS_KEY, JSON.stringify({ schoolCode: "COC" }));
    getOrgSettings.mockResolvedValue({ settings: DEFAULT_GENERAL_SETTINGS, isEmpty: true });
    render(<GeneralSettings />);
    await waitFor(() => expect(screen.getByLabelText("School Code")).toHaveValue("COC"));
    fireEvent.click(screen.getByRole("button", { name: /Save Changes/ }));
    await waitFor(() => expect(saveOrgSettings).toHaveBeenCalled());
    await waitFor(() => expect(localStorage.getItem(LEGACY_SETTINGS_KEY)).toBeNull());
  });

  it("is read-only for anyone but an organisation admin", async () => {
    auth = { user: { role: "TEACHER" }, organizationId: "org1" };
    getOrgSettings.mockResolvedValue({ settings: DEFAULT_GENERAL_SETTINGS, isEmpty: false });
    render(<GeneralSettings />);
    expect(await screen.findByText(/Only an organisation admin can change them/)).toBeInTheDocument();
    expect(screen.getByLabelText("School Name")).toBeDisabled();
    expect(screen.queryByRole("button", { name: /Save Changes/ })).toBeNull();
  });
});

describe("Add Partner", () => {
  it("rejects a phone number that is not a 10-digit mobile", async () => {
    auth = { user: { role: "ORGANIZATION_ADMIN" }, organizationId: "org1" };
    render(
      <MemoryRouter>
        <AddPartner />
      </MemoryRouter>,
    );
    fireEvent.change(screen.getByLabelText("Partner Name *"), { target: { value: "Bright Future" } });
    fireEvent.change(screen.getByLabelText("Phone *"), { target: { value: "5123456789" } });
    fireEvent.click(screen.getByRole("button", { name: "Save Partner" }));
    expect(await screen.findByText(/10-digit mobile number/)).toBeInTheDocument();
    expect(createPartner).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText("Phone *"), { target: { value: "98765 43210" } });
    fireEvent.change(screen.getByLabelText("Commission Rate (%)"), { target: { value: "12.5" } });
    fireEvent.click(screen.getByRole("button", { name: "Save Partner" }));
    await waitFor(() => expect(createPartner).toHaveBeenCalledTimes(1));
    const [orgId, input] = createPartner.mock.calls[0] as [string, Record<string, unknown>];
    expect(orgId).toBe("org1");
    expect(input).toMatchObject({ name: "Bright Future", phone: "9876543210", commissionPercent: 12.5, email: null });
  });
});

describe("Partner balance", () => {
  const tx = (partnerId: string, type: "COMMISSION" | "PAYOUT" | "ADJUSTMENT", amount: number, direction: "CREDIT" | "DEBIT" | null = null) => ({
    id: Math.random().toString(36),
    organizationId: "org1",
    partnerId,
    type,
    direction,
    amount,
    reference: null,
    note: null,
    date: "2026-10-01",
    createdAt: "2026-10-01T00:00:00Z",
  });

  it("is commission minus payouts, plus or minus adjustments, to the paisa", () => {
    const txs = [
      tx("p1", "COMMISSION", 1000.1),
      tx("p1", "COMMISSION", 0.2),
      tx("p1", "PAYOUT", 400),
      tx("p1", "ADJUSTMENT", 50, "CREDIT"),
      tx("p1", "ADJUSTMENT", 20.15, "DEBIT"),
      tx("p2", "PAYOUT", 100),
    ];
    expect(summarise(txs)).toEqual({ commission: 1000.3, payouts: 500, adjustments: 29.85, balance: 530.15 });
    const balances = partnerBalances(txs);
    expect(balances.get("p1")).toBe(630.15);
    expect(balances.get("p2")).toBe(-100);
    expect(balances.has("p3")).toBe(false);
  });

  it("accepts only positive amounts with at most two decimals", () => {
    const base = { partnerId: "p1", type: "COMMISSION" as const, direction: "CREDIT" as const, date: "2026-10-01", reference: "", note: "" };
    expect(validateTransaction({ ...base, amount: "0" }).errors.amount).toBeTruthy();
    expect(validateTransaction({ ...base, amount: "10.555" }).errors.amount).toBeTruthy();
    expect(validateTransaction({ ...base, amount: "-5" }).errors.amount).toBeTruthy();
    const ok = validateTransaction({ ...base, amount: "10.55" });
    expect(ok.value).toMatchObject({ amount: 10.55, direction: null, reference: null });
  });
});
