import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * What "Inactive" means on a course.
 *
 * It meant nothing: the word sat on the catalogue row and stopped nothing at
 * all, so a course the organisation had retired could still be handed to a
 * branch -- and that branch would then admit students into it.
 */
let courseRow: Record<string, unknown> | null = null;
const inserted: Array<Record<string, unknown>> = [];

const builder = (table: string) => {
  const chain: Record<string, unknown> = {
    select: () => chain,
    eq: () => chain,
    insert: (payload: Record<string, unknown>) => {
      inserted.push({ table, ...payload });
      return chain;
    },
    update: () => chain,
    maybeSingle: () =>
      Promise.resolve(
        table === "courses" ? { data: courseRow, error: null } : { data: null, error: null },
      ),
    then: (resolve: (value: unknown) => unknown) =>
      Promise.resolve({ data: [], error: null }).then(resolve),
  };
  return chain;
};

vi.mock("@/lib/supabase/client", () => ({
  supabase: { from: (table: string) => builder(table) },
  supabaseUrl: "https://project.supabase.co",
}));

const { setBranchCourseOffered } = await import("@/lib/supabase/data");

beforeEach(() => {
  inserted.length = 0;
  courseRow = { name: "ADCA", isActive: true };
});

describe("giving a course to a branch", () => {
  it("hands over an active one", async () => {
    const result = await setBranchCourseOffered("b1", "c1");
    expect(result.success).toBe(true);
    expect(inserted.some((row) => row.table === "branch_courses")).toBe(true);
  });

  it("refuses an inactive one, and says where to switch it back on", async () => {
    courseRow = { name: "10th Crash Course", isActive: false };
    const result = await setBranchCourseOffered("b1", "c1");

    expect(result).toMatchObject({ success: false });
    expect(String((result as { error?: string }).error)).toMatch(/inactive.*course catalogue/i);
    // Nothing was written: the branch does not half-get the course.
    expect(inserted).toHaveLength(0);
  });

  it("still takes a course back off a branch, whatever the course's state", async () => {
    // Retiring a course and then withdrawing it from the branches that ran it
    // is the order this actually happens in.
    courseRow = { name: "10th Crash Course", isActive: false };
    const result = await setBranchCourseOffered("b1", "c1", false);
    expect(result.success).toBe(true);
  });

  it("refuses without a branch or a course at all", async () => {
    expect(await setBranchCourseOffered("", "c1")).toMatchObject({ success: false });
    expect(await setBranchCourseOffered("b1", "")).toMatchObject({ success: false });
  });
});
