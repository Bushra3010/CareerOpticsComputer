import { describe, it, expect, vi } from "vitest";

/**
 * Saving a register failed with "null value in column markedById": the table
 * came from Prisma, which filled the id, updatedAt and who-marked-it itself,
 * and the browser writes through PostgREST, which does not.
 */
const inserted: Record<string, unknown>[] = [];
vi.mock("@/lib/supabase/client", () => {
  const chain: Record<string, unknown> = {};
  Object.assign(chain, {
    select: () => chain,
    eq: () => chain,
    in: () => Promise.resolve({ data: [], error: null }),
    insert: (rows: Record<string, unknown>[]) => {
      inserted.push(...rows);
      return Promise.resolve({ error: null });
    },
  });
  return { supabase: { from: () => chain } };
});

const { saveAttendance } = await import("@/lib/supabase/examAttendance");

describe("saveAttendance", () => {
  it("records who took the register, with an id and updatedAt", async () => {
    const result = await saveAttendance("b1", "2026-10-05", [{ studentId: "s1", status: "LATE" }], "user-1");
    expect(result.inserted).toBe(1);
    expect(inserted[0]).toMatchObject({ studentId: "s1", status: "LATE", branchId: "b1", markedById: "user-1" });
    expect(inserted[0].id).toBeTruthy();
    expect(inserted[0].updatedAt).toBeTruthy();
  });

  it("refuses to save without knowing who marked it", async () => {
    await expect(saveAttendance("b1", "2026-10-05", [{ studentId: "s1", status: "PRESENT" }], null)).rejects.toThrow(/Sign in again/);
  });
});
