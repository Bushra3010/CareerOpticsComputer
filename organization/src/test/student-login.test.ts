import { describe, it, expect, vi, beforeEach } from "vitest";

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

const { setStudentLogin } = await import("@/lib/supabase/data");

const liveSession = () => getSession.mockResolvedValue({ data: { session: { access_token: "jwt" } } });

describe("setStudentLogin", () => {
  beforeEach(() => {
    invoke.mockReset();
    getSession.mockReset();
    vi.unstubAllGlobals();
  });

  it("names the missing deployment instead of reporting a generic failure", async () => {
    liveSession();
    // A function that was never deployed is invisible from the browser: its
    // preflight 404 blocks the POST, so supabase-js can only say this much.
    const fetchError = Object.assign(new Error("Failed to send a request to the Edge Function"), {
      name: "FunctionsFetchError",
    });
    invoke.mockResolvedValue({ data: null, error: fetchError });
    // describeUnreachableFunction asks the gateway itself, without headers.
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ status: 404 }));

    await expect(setStudentLogin({ studentId: "s1", password: "Focus@1234" })).rejects.toThrow(
      /create-student-user.*has not been deployed/s,
    );
    await expect(setStudentLogin({ studentId: "s1", password: "Focus@1234" })).rejects.toThrow(
      /supabase functions deploy create-student-user/,
    );
  });

  it("surfaces the function's own refusal, such as a branch reaching outside itself", async () => {
    liveSession();
    invoke.mockResolvedValue({
      data: null,
      error: Object.assign(new Error("non-2xx status code"), {
        name: "FunctionsHttpError",
        context: { status: 403, json: async () => ({ error: "That student belongs to another branch" }) },
      }),
    });

    await expect(setStudentLogin({ studentId: "s1", password: "Focus@1234" })).rejects.toThrow(
      "That student belongs to another branch",
    );
  });

  it("tells the caller to sign in again rather than blaming the function", async () => {
    getSession.mockResolvedValue({ data: { session: null } });

    await expect(setStudentLogin({ studentId: "s1", password: "Focus@1234" })).rejects.toThrow(
      /session has expired/,
    );
    expect(invoke).not.toHaveBeenCalled();
  });

  it("passes the student and credentials through on the happy path", async () => {
    liveSession();
    invoke.mockResolvedValue({
      data: { userId: "u1", loginEmail: "pns-2026-002@careeroptics.local", username: "pns-2026-002", created: true },
      error: null,
    });

    const res = await setStudentLogin({ studentId: "s1", username: "pns-2026-002", password: "Focus@1234" });

    expect(invoke).toHaveBeenCalledWith("create-student-user", {
      body: { studentId: "s1", username: "pns-2026-002", password: "Focus@1234" },
    });
    expect(res.data.created).toBe(true);
    expect(res.data.username).toBe("pns-2026-002");
  });

  it("omits the username on a reset, so the current login ID is kept", async () => {
    liveSession();
    invoke.mockResolvedValue({
      data: { userId: "u1", loginEmail: "pns-2026-002@careeroptics.local", username: "pns-2026-002", created: false },
      error: null,
    });

    await setStudentLogin({ studentId: "s1", password: "NewPass@99" });

    expect(invoke).toHaveBeenCalledWith("create-student-user", {
      body: { studentId: "s1", username: undefined, password: "NewPass@99" },
    });
  });
});
