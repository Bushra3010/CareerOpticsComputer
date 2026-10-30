import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * "Cannot coerce the result to a single JSON object".
 *
 * PostgREST says that when `.single()` matches no row, and every write on these
 * screens matched no row for an administrator: the branch filter was applied
 * unconditionally, head office has no branch of its own, and `branchId = ""`
 * matches nothing. Adding a follow-up, converting an enquiry, saving a student
 * -- all of them failed, and the message read like a parsing fault rather than
 * a filter that could never match.
 *
 * The filter is a convenience. RLS is what actually keeps a branch to its own
 * rows, so leaving it off for a caller with no branch narrows nothing.
 */
const filters: Array<Array<[string, unknown]>> = [];
let rows: unknown[] = [{ id: "row-1" }];

const builder = () => {
  const applied: Array<[string, unknown]> = [];
  filters.push(applied);
  const chain: Record<string, unknown> = {
    update: () => chain,
    select: () => chain,
    eq: (column: string, value: unknown) => {
      applied.push([column, value]);
      return chain;
    },
    single: () =>
      Promise.resolve(
        rows.length ? { data: rows[0], error: null } : { data: null, error: { code: "PGRST116" } },
      ),
    then: (resolve: (value: unknown) => unknown) =>
      Promise.resolve({ data: rows, error: null }).then(resolve),
  };
  return chain;
};

vi.mock("@/lib/supabase/client", () => ({
  supabase: { from: () => builder() },
  supabaseUrl: "https://project.supabase.co",
}));

const { updateEnquiry, updateStudent } = await import("@/lib/supabase/data");

const columns = () => filters.at(-1)!.map(([column]) => column);

beforeEach(() => {
  filters.length = 0;
  rows = [{ id: "row-1" }];
});

describe("a write from head office", () => {
  it("does not filter an enquiry by a branch the caller does not have", async () => {
    await updateEnquiry("e1", null, { status: "CONTACTED" });
    expect(columns()).toEqual(["id"]);
  });

  it("does not filter a student by one either", async () => {
    await updateStudent("s1", "", { firstName: "Asha" });
    expect(columns()).toEqual(["id"]);
  });
});

describe("a write from a branch", () => {
  it("stays inside its own branch, for an enquiry", async () => {
    await updateEnquiry("e1", "b1", { status: "CONTACTED" });
    expect(filters.at(-1)).toEqual([
      ["id", "e1"],
      ["branchId", "b1"],
    ]);
  });

  it("stays inside its own branch, for a student", async () => {
    await updateStudent("s1", "b1", { firstName: "Asha" });
    expect(filters.at(-1)).toEqual([
      ["id", "s1"],
      ["branchId", "b1"],
    ]);
  });
});

describe("when nothing matched", () => {
  it("says what happened, rather than passing on a coercion error", async () => {
    rows = [];
    await expect(updateEnquiry("e1", "b2", { status: "CONTACTED" })).rejects.toThrow(
      /could not be found.*another branch/i,
    );
  });
});
