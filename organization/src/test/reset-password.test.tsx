import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

/** The page the emailed reset link opens: it sets the new password on the recovery session. */
const updateUser = vi.fn(() => Promise.resolve({ error: null }));
vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    auth: {
      onAuthStateChange: (cb: (event: string, session: unknown) => void) => {
        queueMicrotask(() => cb("PASSWORD_RECOVERY", { user: { id: "u1" } }));
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
      getSession: () => Promise.resolve({ data: { session: null } }),
      updateUser,
    },
  },
}));

const { default: ResetPassword } = await import("@/pages/ResetPassword");

describe("reset password", () => {
  it("refuses mismatched passwords, then saves a matching one", async () => {
    render(<MemoryRouter><ResetPassword /></MemoryRouter>);
    const password = await screen.findByLabelText("New password");
    fireEvent.change(password, { target: { value: "secret123" } });
    fireEvent.change(screen.getByLabelText("Confirm password"), { target: { value: "secret124" } });
    fireEvent.click(screen.getByRole("button", { name: "Save new password" }));
    expect(await screen.findByText("The two passwords do not match.")).toBeInTheDocument();
    expect(updateUser).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText("Confirm password"), { target: { value: "secret123" } });
    fireEvent.click(screen.getByRole("button", { name: "Save new password" }));
    await waitFor(() => expect(updateUser).toHaveBeenCalledWith({ password: "secret123" }));
    expect(await screen.findByText(/Password changed/)).toBeInTheDocument();
  });
});
