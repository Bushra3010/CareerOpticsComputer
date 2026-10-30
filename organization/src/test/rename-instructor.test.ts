import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Renaming a teacher rewrites their name on the batches and timetable slots
 * they are already on. That writes production rows, so what is pinned here is
 * which rows get touched: only those naming the teacher, and only inside the
 * branch.
 */
const BATCHES = [
  { id: "b1", name: "Morning", instructor: "Vikram", branchId: "br1" },
  { id: "b2", name: "Evening", instructor: "Prabhat Sir, vikram", branchId: "br1" },
  { id: "b3", name: "Weekend", instructor: "Rajesh", branchId: "br1" },
];
const SLOTS = [
  { id: "t1", batchId: "b1", instructor: "Vikram" },
  { id: "t2", batchId: "b3", instructor: "Rajesh" },
];

const updates: Array<{ table: string; id: string; instructor: string }> = [];
let scopedBy: string | null = null;
let slotsScopedTo: string[] | null = null;

vi.mock("@/lib/supabase/client", () => {
  const builder = (table: string) => {
    let payload: Record<string, unknown> | null = null;
    const rows = () => (table === "batches" ? BATCHES : SLOTS);
    const chain: Record<string, unknown> = {
      select: () => chain,
      update: (body: Record<string, unknown>) => {
        payload = body;
        return chain;
      },
      eq: (column: string, value: string) => {
        if (payload && column === "id") {
          updates.push({ table, id: value, instructor: String(payload.instructor) });
          return Promise.resolve({ error: null });
        }
        if (column === "branchId") scopedBy = value;
        return chain;
      },
      in: (_column: string, values: string[]) => {
        if (table === "batch_timings") slotsScopedTo = values;
        return chain;
      },
      then: (resolve: (v: unknown) => unknown) => resolve({ data: rows(), error: null }),
    };
    return chain;
  };
  return { supabase: { from: builder }, supabaseUrl: "https://x.supabase.co" };
});

const { renameInstructor, getInstructorUsage } = await import("@/lib/supabase/data");

beforeEach(() => {
  updates.length = 0;
  scopedBy = null;
  slotsScopedTo = null;
});

describe("renameInstructor", () => {
  it("rewrites the name on every batch and slot that has it, and nothing else", async () => {
    const { data } = await renameInstructor("br1", "Vikram", "Vikram Singh");

    expect(data).toEqual({ batches: 2, slots: 1 });
    expect(updates).toEqual([
      { table: "batches", id: "b1", instructor: "Vikram Singh" },
      // Matched whatever the case, and the other teacher on the batch kept.
      { table: "batches", id: "b2", instructor: "Prabhat Sir, Vikram Singh" },
      { table: "batch_timings", id: "t1", instructor: "Vikram Singh" },
    ]);
  });

  // "Raj" must not turn "Rajesh" into "Raj Kumaresh".
  it("leaves a teacher whose name merely contains the old one", async () => {
    await renameInstructor("br1", "Raj", "Raj Kumar");
    expect(updates).toEqual([]);
  });

  it("scopes the batches to the branch, and the slots to those batches", async () => {
    await renameInstructor("br1", "Vikram", "Vikram Singh");
    expect(scopedBy).toBe("br1");
    expect(slotsScopedTo).toEqual(["b1", "b2", "b3"]);
  });

  it("writes nothing for a teacher on no batch", async () => {
    const { data } = await renameInstructor("br1", "Nobody", "Somebody");
    expect(data).toEqual({ batches: 0, slots: 0 });
    expect(updates).toEqual([]);
  });
});

describe("getInstructorUsage", () => {
  it("names each teacher's batches, merging spellings", async () => {
    const { data } = await getInstructorUsage("br1");
    const vikram = data.find((entry) => entry.name.toLowerCase() === "vikram");
    expect(vikram?.batches).toEqual(["Evening", "Morning"]);
    // One entry, not one per spelling.
    expect(data.filter((entry) => entry.name.toLowerCase() === "vikram")).toHaveLength(1);
  });
});
