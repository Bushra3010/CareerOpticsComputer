import { describe, it, expect, vi, beforeEach } from "vitest";

import { generatePassword, passwordIssue, MIN_PASSWORD_LENGTH } from "@/lib/passwords";

/**
 * Setting another user's password goes through set-user-password, which
 * changes the password and nothing else. Who may reset whom is decided inside
 * the function from the target's own claims; these cover the call.
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

const { setUserPassword } = await import("@/lib/supabase/data");

const liveSession = () => getSession.mockResolvedValue({ data: { session: { access_token: "jwt" } } });

describe("setUserPassword", () => {
  beforeEach(() => {
    invoke.mockReset();
    getSession.mockReset();
  });

  it("sends the user and the new password, and nothing else", async () => {
    liveSession();
    invoke.mockResolvedValue({ data: { userId: "u9", updated: true }, error: null });

    await setUserPassword("u9", "k7Mw-p3Rx");

    // No role, no branch: those are what create-staff-user would have
    // re-written, and why this is a function of its own.
    expect(invoke).toHaveBeenCalledWith("set-user-password", { body: { userId: "u9", password: "k7Mw-p3Rx" } });
  });

  it("refuses a short password before calling anything", async () => {
    liveSession();
    await expect(setUserPassword("u9", "abc")).rejects.toThrow(/at least 6/);
    expect(invoke).not.toHaveBeenCalled();
  });

  // The function's own reason — another branch, a higher rank — is what the
  // admin needs to read, not "non-2xx status code".
  it("passes the function's refusal through as it was written", async () => {
    liveSession();
    invoke.mockResolvedValue({
      data: { error: "A branch admin cannot set the password of a organization admin." },
      error: null,
    });
    await expect(setUserPassword("u9", "k7Mw-p3Rx")).rejects.toThrow(/cannot set the password/);
  });

  it("says to deploy the function when it is not there", async () => {
    liveSession();
    invoke.mockResolvedValue({
      data: null,
      error: { name: "FunctionsHttpError", message: "404", context: { status: 404, json: async () => null } },
    });
    await expect(setUserPassword("u9", "k7Mw-p3Rx")).rejects.toThrow(/set-user-password/);
  });
});

describe("generatePassword", () => {
  it("is long enough to be accepted", () => {
    for (let i = 0; i < 50; i++) {
      expect(generatePassword().length).toBeGreaterThanOrEqual(MIN_PASSWORD_LENGTH);
      expect(passwordIssue(generatePassword())).toBeNull();
    }
  });

  // Read aloud and typed back by someone else, so no look-alike pairs.
  it("never uses a character that is easy to mis-hear or mis-read", () => {
    const seen = Array.from({ length: 200 }, generatePassword).join("");
    for (const ambiguous of ["0", "O", "1", "l", "I", "5", "S"]) {
      expect(seen, `contains ${ambiguous}`).not.toContain(ambiguous);
    }
  });

  it("is not the same twice", () => {
    const made = new Set(Array.from({ length: 100 }, generatePassword));
    expect(made.size).toBe(100);
  });
});

describe("passwordIssue", () => {
  it("passes a reasonable password", () => {
    expect(passwordIssue("Focus@1234")).toBeNull();
  });

  it("refuses one that is too short", () => {
    expect(passwordIssue("abc12")).toMatch(/at least 6/);
  });

  // Invisible, and then the password they were given does not work.
  it("catches a space pasted onto either end", () => {
    expect(passwordIssue(" Focus@1234")).toMatch(/space/);
    expect(passwordIssue("Focus@1234 ")).toMatch(/space/);
  });
});
