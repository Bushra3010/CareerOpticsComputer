import { act, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * "Login as center": an organisation admin works as one centre without its
 * password. The view becomes the franchise one, narrowed to that branch, and
 * only an admin can do it.
 */
let role = "ORGANIZATION_ADMIN";
vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: (callback: (event: string, value: unknown) => void) => {
        queueMicrotask(() =>
          callback("INITIAL_SESSION", { user: { id: "u1", email: "a@b.c", user_metadata: { name: "Pushpak", role, organizationId: "org" } } }),
        );
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
      signOut: () => Promise.resolve({ error: null }),
    },
  },
}));
vi.mock("@/lib/supabase/data", () => ({ getUserModules: () => Promise.resolve({ data: [] }) }));

const { AuthProvider, useAuth } = await import("@/contexts/AuthContext");

let auth: ReturnType<typeof useAuth>;
function Probe() {
  auth = useAuth();
  return <p>{`${auth.view}|${auth.user?.branchId ?? "none"}|${auth.realView}`}</p>;
}

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
  role = "ORGANIZATION_ADMIN";
});

describe("login as center", () => {
  it("opens a centre's franchise view for an admin, and comes back", async () => {
    render(<AuthProvider><Probe /></AuthProvider>);
    await screen.findByText("admin|none|admin");
    act(() => auth.actAsCentre({ branchId: "b1", name: "Coder Infotech" }));
    expect(screen.getByText("franchise|b1|admin")).toBeInTheDocument();
    expect(auth.actingAs?.name).toBe("Coder Infotech");
    act(() => auth.actAsCentre(null));
    expect(screen.getByText("admin|none|admin")).toBeInTheDocument();
  });

  it("is ignored for an account that is not an admin", async () => {
    role = "BRANCH_ADMIN";
    sessionStorage.setItem("erp-acting-as", JSON.stringify({ branchId: "b9", name: "Elsewhere" }));
    render(<AuthProvider><Probe /></AuthProvider>);
    await waitFor(() => expect(auth.realView).toBe("franchise"));
    expect(auth.actingAs).toBeNull();
    expect(auth.user?.branchId).not.toBe("b9");
  });

  it("lets a branch account view one of its students' portal, and come back", async () => {
    role = "BRANCH_ADMIN";
    render(<AuthProvider><Probe /></AuthProvider>);
    await waitFor(() => expect(auth.realView).toBe("franchise"));
    act(() => auth.actAsCentre({ branchId: "b1", name: "Rohit Sharma", studentId: "s1" }));
    expect(auth.view).toBe("student");
    expect(auth.user).toMatchObject({ id: "s1", role: "STUDENT", branchId: "b1", name: "Rohit Sharma" });
    act(() => auth.actAsCentre(null));
    expect(auth.view).toBe("franchise");
    expect(auth.user?.id).toBe("u1");
  });
});
