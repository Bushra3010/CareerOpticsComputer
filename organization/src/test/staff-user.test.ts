import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Creating a staff login goes through an edge function, because the account
 * has to be minted with the service-role key: signing up from the browser
 * would swap out the admin's own session.
 *
 * These cover the call itself. What a given admin is *allowed* to create is
 * decided inside the function from the caller's token — `grantableRoles` only
 * mirrors it so the form does not offer a role the server will refuse, and is
 * covered in system-users.test.ts.
 */
const invoke = vi.fn();
const getSession = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    functions: { invoke },
    auth: { getSession },
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }) }),
    storage: { from: () => ({}) },
  },
  supabaseUrl: "https://project.supabase.co",
}));

const { createStaffUser } = await import("@/lib/supabase/data");

const liveSession = () => getSession.mockResolvedValue({ data: { session: { access_token: "jwt" } } });

const draft = {
  name: "Priya Sharma",
  username: "priya.sharma",
  password: "Focus@1234",
  role: "RECEPTIONIST" as const,
  branchId: "b1",
};

describe("createStaffUser", () => {
  beforeEach(() => {
    invoke.mockReset();
    getSession.mockReset();
    vi.unstubAllGlobals();
  });

  it("passes the whole draft through on the happy path", async () => {
    liveSession();
    invoke.mockResolvedValue({
      data: {
        userId: "u9",
        loginEmail: "priya.sharma@careeroptics.local",
        username: "priya.sharma",
        role: "RECEPTIONIST",
        branchId: "b1",
        created: true,
      },
      error: null,
    });

    const res = await createStaffUser(draft);

    expect(invoke).toHaveBeenCalledWith("create-staff-user", { body: draft });
    expect(res.data.created).toBe(true);
    expect(res.data.username).toBe("priya.sharma");
  });

  it("sends no branch for someone posted to head office", async () => {
    liveSession();
    invoke.mockResolvedValue({ data: { userId: "u9", created: true }, error: null });

    await createStaffUser({ ...draft, branchId: null });

    expect(invoke).toHaveBeenCalledWith("create-staff-user", {
      body: expect.objectContaining({ branchId: null }),
    });
  });

  it("tells the caller to sign in again rather than blaming the function", async () => {
    // The app restores the last account from localStorage, so the UI can show
    // you signed in after the session behind it has gone.
    getSession.mockResolvedValue({ data: { session: null } });

    await expect(createStaffUser(draft)).rejects.toThrow(/session has expired/);
    expect(invoke).not.toHaveBeenCalled();
  });

  it("surfaces the function's own refusal, such as reaching above your role", async () => {
    liveSession();
    invoke.mockResolvedValue({
      data: null,
      error: Object.assign(new Error("non-2xx status code"), {
        name: "FunctionsHttpError",
        context: {
          status: 403,
          json: async () => ({ error: "A branch admin cannot create a organization admin login" }),
        },
      }),
    });

    await expect(createStaffUser({ ...draft, role: "ORGANIZATION_ADMIN" })).rejects.toThrow(
      /cannot create a organization admin login/,
    );
  });

  it("names the missing deployment instead of reporting a generic failure", async () => {
    liveSession();
    // A function that was never deployed is invisible from the browser: its
    // preflight 404 blocks the POST, so supabase-js can only say this much.
    invoke.mockResolvedValue({
      data: null,
      error: Object.assign(new Error("Failed to send a request to the Edge Function"), {
        name: "FunctionsFetchError",
      }),
    });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ status: 404 }));

    await expect(createStaffUser(draft)).rejects.toThrow(/create-staff-user.*has not been deployed/s);
    await expect(createStaffUser(draft)).rejects.toThrow(/supabase functions deploy create-staff-user/);
  });

  it("reports a half-made account rather than a success the list will contradict", async () => {
    liveSession();
    // The auth account exists but the users row failed, so the person can sign
    // in and yet appear nowhere. Saying "created" here would be a lie.
    invoke.mockResolvedValue({
      data: { error: "The sign-in account was created, but listing it failed: relation does not exist." },
      error: null,
    });

    await expect(createStaffUser(draft)).rejects.toThrow(/listing it failed/);
  });
});
