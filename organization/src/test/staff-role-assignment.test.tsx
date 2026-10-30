import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * The institute names its own roles, but the database does not know those
 * names: every RLS policy in the schema reads `users.role` through jwt_role(),
 * and that column is the eight-value `SystemRole` enum.
 *
 * So a role called "Counsellor" is a base of STAFF wearing a name. What this
 * file pins down is that the account is minted as the base -- never as the
 * institute's own name -- and that the name is attached afterwards, by an
 * ordinary write the admin's own session may make.
 */
const toast = vi.fn();
const createStaffUser = vi.fn();
const setUserRole = vi.fn();
const getUsers = vi.fn();
const getRoles = vi.fn();

vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast }) }));
vi.mock("@/components/layout/AppLayout", () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "u1", role: "ORGANIZATION_ADMIN", organizationId: "org1", branchId: null },
    organizationId: "org1",
    branchId: null,
    view: "admin",
  }),
}));
vi.mock("@/lib/supabase/data", () => ({
  getUsers: (...args: unknown[]) => getUsers(...(args as [])),
  getRoles: (...args: unknown[]) => getRoles(...(args as [])),
  createStaffUser: (...args: unknown[]) => createStaffUser(...(args as [])),
  setUserRole: (...args: unknown[]) => setUserRole(...(args as [])),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
  getBranches: () => Promise.resolve({ success: true, data: [] }),
  grantableRoles: () => ["ORGANIZATION_ADMIN", "BRANCH_ADMIN", "ACCOUNTANT", "STAFF"],
  canManageUsers: () => true,
  SYSTEM_ROLES: ["SUPER_ADMIN", "ORGANIZATION_ADMIN", "BRANCH_ADMIN", "ACCOUNTANT", "RECEPTIONIST", "TEACHER", "STAFF", "STUDENT"],
}));

const AllUsers = (await import("@/pages/user/AllUsers")).default;

const ROLES = [
  { id: "role-counsellor", organizationId: "org1", name: "Counsellor", description: "", baseRole: "STAFF", modules: [], isSystem: false },
  { id: "role-accounts", organizationId: "org1", name: "Accounts Head", description: "", baseRole: "ACCOUNTANT", modules: ["/fee/collection"], isSystem: false },
];

const open = () => render(<MemoryRouter><AllUsers /></MemoryRouter>);

const fillForm = () => {
  fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: "Neha Sharma" } });
  fireEvent.change(screen.getByLabelText(/login id/i), { target: { value: "neha" } });
  fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "secret123" } });
};

beforeEach(() => {
  toast.mockClear();
  createStaffUser.mockReset();
  setUserRole.mockReset();
  getUsers.mockResolvedValue({ success: true, data: [] });
  getRoles.mockResolvedValue({ success: true, data: ROLES });
  createStaffUser.mockResolvedValue({
    success: true,
    data: { userId: "new-user", username: "neha", created: true, role: "STAFF", branchId: null },
  });
  setUserRole.mockResolvedValue({ success: true });
});

describe("giving a new login one of the institute's roles", () => {
  it("puts the institute's own roles above the ones the app ships with", async () => {
    getRoles.mockResolvedValue({
      success: true,
      data: [
        ...ROLES,
        { id: "role-staff", organizationId: "org1", name: "Staff", description: "", baseRole: "STAFF", modules: [], isSystem: true },
      ],
    });
    open();
    await waitFor(() => expect(getRoles).toHaveBeenCalled());
    fireEvent.click(screen.getByRole("button", { name: /add user/i }));
    fireEvent.keyDown(screen.getByRole("combobox", { name: /role for the new user/i }), { key: "Enter" });

    expect(await screen.findByText("Your roles")).toBeInTheDocument();
    expect(screen.getByText("Built in")).toBeInTheDocument();
  });

  it("offers the institute's roles by name, not the database's eight", async () => {
    open();
    await waitFor(() => expect(getRoles).toHaveBeenCalledWith("org1"));
    fireEvent.click(screen.getByRole("button", { name: /add user/i }));

    const picker = screen.getByRole("combobox", { name: /role for the new user/i });
    fireEvent.keyDown(picker, { key: "Enter" });

    expect(await screen.findByText("Counsellor")).toBeInTheDocument();
    expect(screen.getByText("Accounts Head")).toBeInTheDocument();
    // The raw enum values are the database's business, not the office's.
    expect(screen.queryByText("Staff")).toBeNull();
  });

  it("mints the account as the role's base, then attaches the role itself", async () => {
    open();
    await waitFor(() => expect(getRoles).toHaveBeenCalled());
    fireEvent.click(screen.getByRole("button", { name: /add user/i }));
    fillForm();

    const picker = screen.getByRole("combobox", { name: /role for the new user/i });
    fireEvent.keyDown(picker, { key: "Enter" });
    fireEvent.click(await screen.findByText("Accounts Head"));

    fireEvent.click(screen.getByRole("button", { name: /^create user$/i }));

    await waitFor(() => expect(createStaffUser).toHaveBeenCalled());
    // ACCOUNTANT is what RLS will see; "Accounts Head" is only a name.
    expect(createStaffUser.mock.calls[0][0]).toMatchObject({ role: "ACCOUNTANT" });
    await waitFor(() => expect(setUserRole).toHaveBeenCalledWith("new-user", "role-accounts"));
  });

  it("falls back to the built-in roles on a database without roles.sql", async () => {
    getRoles.mockResolvedValue({ success: true, data: [] });
    open();
    await waitFor(() => expect(getRoles).toHaveBeenCalled());
    fireEvent.click(screen.getByRole("button", { name: /add user/i }));

    const picker = screen.getByRole("combobox", { name: /role for the new user/i });
    fireEvent.keyDown(picker, { key: "Enter" });

    expect(await screen.findByText("Accountant")).toBeInTheDocument();
  });
});
