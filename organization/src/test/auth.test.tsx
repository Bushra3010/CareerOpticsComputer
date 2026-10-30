import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Authentication moved to Supabase, so the client has to be mocked: without it
 * `AuthProvider` waits on a network call that never resolves under jsdom and
 * every one of these renders is just the loading spinner.
 *
 * `session` is what the mocked client reports; `emitAuthChange` controls whether
 * the `onAuthStateChange` callback fires at all, which is the difference between
 * a healthy sign-in and the offline case that used to hang the app forever.
 */
let session: { user: { id: string; email: string; user_metadata: Record<string, unknown> } } | null = null;
let emitAuthChange = true;

vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: () => Promise.resolve({ data: { session }, error: null }),
      onAuthStateChange: (callback: (event: string, value: typeof session) => void) => {
        if (emitAuthChange) queueMicrotask(() => callback("INITIAL_SESSION", session));
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
      signInWithPassword: () => Promise.resolve({ error: null }),
      signOut: () => Promise.resolve({ error: null }),
    },
  },
}));

const { AuthProvider } = await import("@/contexts/AuthContext");
const { ProtectedRoute } = await import("@/components/ProtectedRoute");

const signedInAs = (role: string) => {
  session = { user: { id: "u1", email: "person@example.com", user_metadata: { name: "Person", role } } };
};

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<p>Secure sign in</p>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<p>Private ERP</p>} />
            <Route path="/branch/create" element={<p>Branch admin tools</p>} />
          </Route>
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );

describe("authenticated application boundary", () => {
  beforeEach(() => {
    localStorage.clear();
    session = null;
    emitAuthChange = true;
  });

  it("redirects anonymous users to sign in", async () => {
    renderAt("/");
    expect(await screen.findByText("Secure sign in")).toBeInTheDocument();
    expect(screen.queryByText("Private ERP")).not.toBeInTheDocument();
  });

  it("admits an authenticated session", async () => {
    signedInAs("ORGANIZATION_ADMIN");
    renderAt("/");
    expect(await screen.findByText("Private ERP")).toBeInTheDocument();
  });

  it("stops loading even when the auth callback never fires", async () => {
    // Regression guard: `loading` used to be cleared only from
    // `onAuthStateChange`, so an unreachable auth endpoint left the whole app
    // stuck on its spinner with no route ever rendering.
    emitAuthChange = false;
    renderAt("/");
    expect(await screen.findByText("Secure sign in")).toBeInTheDocument();
  });

  it("refuses a path outside the signed-in account's workspace", async () => {
    signedInAs("STUDENT");
    renderAt("/branch/create");
    expect(await screen.findByText("Not authorised")).toBeInTheDocument();
    expect(screen.queryByText("Branch admin tools")).not.toBeInTheDocument();
  });

  it("survives a corrupt persisted user", async () => {
    localStorage.setItem("erp-user", "undefined");
    renderAt("/");
    expect(await screen.findByText("Secure sign in")).toBeInTheDocument();
  });
});
