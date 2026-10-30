import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * The Edit User dialog can set a new password. It is off until asked for, so
 * a routine edit to a name cannot also reset a password; and because the
 * details are saved first, a refused password says only the password did not
 * change — not that nothing did.
 */
const toast = vi.fn();
const updateUser = vi.fn();
const setUserPassword = vi.fn();
const getUsers = vi.fn();

vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast }) }));
vi.mock("@/components/layout/AppLayout", () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "admin", role: "ORGANIZATION_ADMIN", organizationId: "org1", branchId: null },
    organizationId: "org1",
    branchId: null,
    view: "admin",
  }),
}));
vi.mock("@/lib/supabase/data", () => ({
  getUsers: (...a: unknown[]) => getUsers(...(a as [])),
  getRoles: () => Promise.resolve({ success: true, data: [] }),
  createStaffUser: vi.fn(),
  setUserRole: vi.fn(),
  setUserPassword: (...a: unknown[]) => setUserPassword(...(a as [])),
  updateUser: (...a: unknown[]) => updateUser(...(a as [])),
  deleteUser: vi.fn(),
  getBranches: () => Promise.resolve({ success: true, data: [] }),
  grantableRoles: () => ["STAFF"],
  canManageUsers: () => true,
  SYSTEM_ROLES: ["STAFF"],
}));

const AllUsers = (await import("@/pages/user/AllUsers")).default;

const VIKRAM = {
  id: "u-vikram",
  name: "Vikram Kumar",
  email: "vikram@careeroptics.local",
  phone: "",
  role: "STAFF",
  roleId: null,
  isActive: true,
  branchName: "",
  branchId: null,
  userType: "BRANCH",
  lastLoginAt: null,
};

beforeEach(() => {
  toast.mockClear();
  updateUser.mockReset().mockResolvedValue({ success: true });
  setUserPassword.mockReset().mockResolvedValue({ success: true });
  getUsers.mockResolvedValue({ success: true, data: [VIKRAM] });
});

/** Radix opens a row's menu on a key press in jsdom, not on a click. */
const openEditFor = async (name: string) => {
  render(<MemoryRouter><AllUsers /></MemoryRouter>);
  await screen.findAllByText(name);
  const trigger = screen.getAllByRole("button").find((b) => b.querySelector("svg.lucide-ellipsis, svg.lucide-more-horizontal"));
  if (!trigger) throw new Error("row menu not found");
  fireEvent.keyDown(trigger, { key: "Enter" });
  fireEvent.click(await screen.findByText("Edit user"));
  await screen.findByRole("dialog");
};

const saveChanges = () => fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

describe("setting a password from Edit User", () => {
  it("keeps the password closed until asked, and says the current one cannot be shown", async () => {
    await openEditFor("Vikram Kumar");
    expect(screen.queryByLabelText("New password")).toBeNull();
    expect(screen.getByText(/current password cannot be shown/i)).toBeInTheDocument();
  });

  // A routine edit must not reset anyone's password.
  it("does not touch the password on a plain edit", async () => {
    await openEditFor("Vikram Kumar");
    saveChanges();
    await waitFor(() => expect(updateUser).toHaveBeenCalled());
    expect(setUserPassword).not.toHaveBeenCalled();
  });

  it("sets the new password for that user, after the details", async () => {
    await openEditFor("Vikram Kumar");
    fireEvent.click(screen.getByRole("button", { name: /set a new password/i }));
    fireEvent.change(screen.getByLabelText("New password"), { target: { value: "k7Mw-p3Rx" } });
    saveChanges();

    await waitFor(() => expect(setUserPassword).toHaveBeenCalledWith("u-vikram", "k7Mw-p3Rx"));
    expect(updateUser.mock.invocationCallOrder[0]).toBeLessThan(setUserPassword.mock.invocationCallOrder[0]);
  });

  it("refuses a short password before saving anything", async () => {
    await openEditFor("Vikram Kumar");
    fireEvent.click(screen.getByRole("button", { name: /set a new password/i }));
    fireEvent.change(screen.getByLabelText("New password"), { target: { value: "abc" } });
    saveChanges();

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: "Check the new password" })),
    );
    expect(updateUser).not.toHaveBeenCalled();
    expect(setUserPassword).not.toHaveBeenCalled();
  });

  it("says only the password failed when the server refuses it", async () => {
    setUserPassword.mockRejectedValueOnce(new Error("That login belongs to another branch."));
    await openEditFor("Vikram Kumar");
    fireEvent.click(screen.getByRole("button", { name: /set a new password/i }));
    fireEvent.change(screen.getByLabelText("New password"), { target: { value: "k7Mw-p3Rx" } });
    saveChanges();

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Details saved, password not changed",
          description: "That login belongs to another branch.",
        }),
      ),
    );
  });

  it("can generate one, and shows it so it can be read out", async () => {
    await openEditFor("Vikram Kumar");
    fireEvent.click(screen.getByRole("button", { name: /set a new password/i }));
    fireEvent.click(screen.getByRole("button", { name: /generate/i }));

    const field = screen.getByLabelText("New password") as HTMLInputElement;
    expect(field.value).toMatch(/^[A-Za-z2-9]{4}-[A-Za-z2-9]{4}$/);
    expect(field.type).toBe("text");
  });

  it("can be backed out of with Keep current", async () => {
    await openEditFor("Vikram Kumar");
    fireEvent.click(screen.getByRole("button", { name: /set a new password/i }));
    fireEvent.change(screen.getByLabelText("New password"), { target: { value: "k7Mw-p3Rx" } });
    fireEvent.click(screen.getByRole("button", { name: /keep current/i }));
    saveChanges();

    await waitFor(() => expect(updateUser).toHaveBeenCalled());
    expect(setUserPassword).not.toHaveBeenCalled();
  });
});
