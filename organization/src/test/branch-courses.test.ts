import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * A minimal PostgREST stand-in: each `from(table)` call records its filters and
 * hands back whatever rows the test queued for that table.
 */
const rows: Record<string, Record<string, unknown>[]> = {};
const calls: { table: string; filters: Record<string, unknown>; inserted?: unknown; updated?: unknown }[] = [];

function builder(table: string) {
  const call: { table: string; filters: Record<string, unknown>; inserted?: unknown; updated?: unknown } = {
    table,
    filters: {},
  };
  calls.push(call);

  const result = () => ({ data: rows[table] ?? [], error: null });
  const chain: Record<string, unknown> = {
    select: () => chain,
    order: () => chain,
    is: () => chain,
    eq: (column: string, value: unknown) => {
      call.filters[column] = value;
      return chain;
    },
    single: () => Promise.resolve({ data: (rows[table] ?? [])[0] ?? null, error: null }),
    maybeSingle: () => Promise.resolve({ data: (rows[table] ?? [])[0] ?? null, error: null }),
    insert: (values: unknown) => {
      call.inserted = values;
      return Promise.resolve({ data: null, error: null });
    },
    update: (values: unknown) => {
      call.updated = values;
      return chain;
    },
    then: (resolve: (value: unknown) => unknown) => Promise.resolve(result()).then(resolve),
  };
  return chain;
}

vi.mock("@/lib/supabase/client", () => ({
  supabase: { from: (table: string) => builder(table) },
  supabaseUrl: "https://project.supabase.co",
}));

const { getCourses, getBranchCourseIds, setBranchCourseOffered, updateCourse } = await import("@/lib/supabase/data");

const COURSES = [
  { id: "c1", name: "ADCA", code: "ADCA", organizationId: "org1", baseFee: 1000, durationValue: 12 },
  { id: "c2", name: "Tally", code: "TLY", organizationId: "org1", baseFee: 800, durationValue: 6 },
  { id: "c3", name: "DTP", code: "DTP", organizationId: "org1", baseFee: 500, durationValue: 3 },
];

beforeEach(() => {
  calls.length = 0;
  for (const key of Object.keys(rows)) delete rows[key];
  rows.courses = COURSES;
});

describe("getBranchCourseIds", () => {
  it("returns nothing without a branch, rather than querying for every row", async () => {
    expect(await getBranchCourseIds(null)).toEqual(new Set());
    expect(calls).toHaveLength(0);
  });

  it("reads only the branch's offered rows", async () => {
    rows.branch_courses = [{ courseId: "c1" }, { courseId: "c3" }];
    expect(await getBranchCourseIds("brch09")).toEqual(new Set(["c1", "c3"]));
    expect(calls[0].filters).toMatchObject({ branchId: "brch09", isOffered: true });
  });
});

describe("getCourses", () => {
  it("gives an administrator the whole organisation catalogue", async () => {
    const result = await getCourses("org1");
    expect(result.data.map((c: Record<string, unknown>) => c.id)).toEqual(["c1", "c2", "c3"]);
  });

  it("narrows a branch to the courses it has been assigned", async () => {
    rows.branch_courses = [{ courseId: "c2" }];
    const result = await getCourses("org1", "brch09");
    expect(result.data.map((c: Record<string, unknown>) => c.id)).toEqual(["c2"]);
  });

  it("gives a branch with nothing assigned no courses at all", async () => {
    rows.branch_courses = [];
    const result = await getCourses("org1", "brch09");
    expect(result.data).toEqual([]);
  });

  it("drops an assigned course the organisation has switched off", async () => {
    rows.courses = [...COURSES.slice(0, 2), { ...COURSES[2], isActive: false }];
    rows.branch_courses = [{ courseId: "c2" }, { courseId: "c3" }];
    const result = await getCourses("org1", "brch09");
    expect(result.data.map((c: Record<string, unknown>) => c.id)).toEqual(["c2"]);
  });

  it("still shows an administrator the inactive courses", async () => {
    rows.courses = [...COURSES.slice(0, 2), { ...COURSES[2], isActive: false }];
    const result = await getCourses("org1");
    expect(result.data).toHaveLength(3);
  });
});

describe("updateCourse", () => {
  it("takes an inactive course back from every branch", async () => {
    await updateCourse("c3", { isActive: false });
    const takeBack = calls.find((c) => c.table === "branch_courses" && c.updated);
    expect(takeBack?.updated).toMatchObject({ isOffered: false });
    expect(takeBack?.filters).toMatchObject({ courseId: "c3" });
  });

  it("leaves the branches alone when the course stays active", async () => {
    await updateCourse("c3", { name: "DTP Advanced" });
    expect(calls.some((c) => c.table === "branch_courses")).toBe(false);
  });
});

describe("setBranchCourseOffered", () => {
  it("inserts a row when the branch does not have the course yet", async () => {
    rows.branch_courses = [];
    const result = await setBranchCourseOffered("brch09", "c1");

    expect(result).toMatchObject({ success: true, created: true });
    const insert = calls.find((c) => c.inserted);
    expect(insert?.inserted).toMatchObject({ branchId: "brch09", courseId: "c1", isOffered: true });
  });

  // Not an upsert: PostgREST would write the freshly generated id over the
  // existing row's primary key on conflict.
  it("updates the existing row instead of inserting a second one", async () => {
    rows.branch_courses = [{ id: "bc1" }];
    const result = await setBranchCourseOffered("brch09", "c1");

    expect(result).toMatchObject({ success: true, created: false });
    expect(calls.some((c) => c.inserted)).toBe(false);
    expect(calls.find((c) => c.updated)?.updated).toMatchObject({ isOffered: true });
  });

  it("refuses a call with no branch", async () => {
    expect(await setBranchCourseOffered("", "c1")).toMatchObject({ success: false });
  });
});
