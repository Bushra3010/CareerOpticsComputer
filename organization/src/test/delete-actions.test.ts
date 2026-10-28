import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Deletes reported success whether or not anything was deleted.
 *
 * PostgREST answers a write that matched no row with `200 OK` and an empty
 * body — not an error — so `error === null` said nothing about whether the row
 * went. The row then disappeared from the list the user was looking at and came
 * back on the next refresh.
 *
 * Two things silently matched nothing: an organisation admin has no branch of
 * their own, so the branch filter was built from `undefined`; and a row RLS
 * will not let this login write comes back empty as well.
 */
const returned: Record<string, Record<string, unknown>[]> = {};
const calls: {
  table: string;
  filters: Record<string, unknown>;
  updated?: unknown;
  selected?: string;
}[] = [];

function builder(table: string) {
  const call: { table: string; filters: Record<string, unknown>; updated?: unknown; selected?: string } = {
    table,
    filters: {},
  };
  calls.push(call);

  const chain: Record<string, unknown> = {
    update: (values: unknown) => {
      call.updated = values;
      return chain;
    },
    delete: () => chain,
    eq: (column: string, value: unknown) => {
      call.filters[column] = value;
      return chain;
    },
    select: (columns?: string) => {
      call.selected = columns;
      return chain;
    },
    then: (resolve: (value: unknown) => unknown) =>
      Promise.resolve({ data: returned[table] ?? [], error: null }).then(resolve),
  };
  return chain;
}

vi.mock("@/lib/supabase/client", () => ({
  supabase: { from: (table: string) => builder(table) },
  supabaseUrl: "https://project.supabase.co",
}));

const { deleteStudent, deleteCourse, deleteEnquiry } = await import("@/lib/supabase/data");

beforeEach(() => {
  calls.length = 0;
  for (const key of Object.keys(returned)) delete returned[key];
});

describe("deletes", () => {
  it("reports failure when the write matched no row", async () => {
    returned.students = [];
    await expect(deleteStudent("s1", "b1")).rejects.toThrow(/not removed/i);
  });

  it("names both reasons a delete can match nothing", async () => {
    returned.students = [];
    await expect(deleteStudent("s1", "b1")).rejects.toThrow(/no longer exists, or this login is not allowed/i);
  });

  it("succeeds when a row comes back", async () => {
    returned.students = [{ id: "s1" }];
    await expect(deleteStudent("s1", "b1")).resolves.toEqual({ success: true });
    expect(calls[0].selected).toBe("id");
  });

  it("soft-deletes a student rather than dropping the row", async () => {
    returned.students = [{ id: "s1" }];
    await deleteStudent("s1", "b1");
    expect(calls[0].updated).toHaveProperty("deletedAt");
    expect(calls[0].filters).toEqual({ id: "s1", branchId: "b1" });
  });

  it("does not filter on a branch an organisation admin does not have", async () => {
    returned.students = [{ id: "s1" }];
    await deleteStudent("s1", null);
    // `.eq("branchId", undefined)` matched no row, so their deletes never
    // removed anything even though every one of them reported success.
    expect(calls[0].filters).toEqual({ id: "s1" });
  });

  it("applies the same rule to enquiries", async () => {
    returned.visit_enquiries = [{ id: "e1" }];
    await deleteEnquiry("e1", null);
    expect(calls[0].filters).toEqual({ id: "e1" });
  });

  it("reports failure on a course that was not removed", async () => {
    returned.courses = [];
    await expect(deleteCourse("c1")).rejects.toThrow(/not removed/i);
  });
});
