import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * That `toStudentProfile` maps correctly is covered next door. What this file
 * covers is that `getStudentProfile` actually applies it -- the six portal
 * screens render what this function hands back straight into JSX, and for as
 * long as it returned the raw row they printed blanks, then crashed with
 * "Objects are not valid as a React child" once the course/batch/branch
 * lookups started arriving as joined rows.
 */
const rows: Record<string, Record<string, unknown>[]> = {};
const selects: string[] = [];

function builder(table: string) {
  const chain: Record<string, unknown> = {
    select: (columns: string) => {
      selects.push(columns);
      return chain;
    },
    eq: () => chain,
    or: () => chain,
    is: () => chain,
    maybeSingle: () => Promise.resolve({ data: (rows[table] ?? [])[0] ?? null, error: null }),
    single: () => Promise.resolve({ data: (rows[table] ?? [])[0] ?? null, error: null }),
  };
  return chain;
}

vi.mock("@/lib/supabase/client", () => ({
  supabase: { from: (table: string) => builder(table) },
  supabaseUrl: "https://project.supabase.co",
}));

const { getStudentProfile } = await import("@/lib/supabase/data");

/** A row the way PostgREST returns it for the portal's select. */
const STUDENT_ROW = {
  id: "s1",
  userId: "auth-1",
  branchId: "b1",
  enrollmentNo: "PNS/2026/001",
  firstName: "Aarav",
  lastName: "Sharma",
  phone: "+91 98220 41100",
  fatherName: "Rajesh Sharma",
  fatherPhone: "+91 98220 41199",
  city: "Pune",
  state: "Maharashtra",
  dateOfBirth: "2007-03-12T00:00:00.000Z",
  admissionDate: "2026-01-04T00:00:00.000Z",
  // The embeds: rows, not names. This is what took the dashboard down.
  course: { name: "ADCA", code: "ADCA-01", baseFee: 24000 },
  batch: { name: "2026-A" },
  branch: { name: "Kothrud Branch" },
};

beforeEach(() => {
  selects.length = 0;
  for (const key of Object.keys(rows)) delete rows[key];
  rows.students = [STUDENT_ROW];
});

describe("getStudentProfile", () => {
  it("hands the pages names, not the joined rows they cannot render", async () => {
    const { data } = await getStudentProfile("auth-1", "b1");

    expect(data.course).toBe("ADCA");
    expect(data.courseFee).toBe(24000);
    expect(data.batch).toBe("2026-A");
    expect(data.branch).toBe("Kothrud Branch");
    expect(data.name).toBe("Aarav Sharma");
  });

  it("returns no field a page could not render", async () => {
    const { data } = await getStudentProfile("auth-1", "b1");

    // Strings and numbers both render; a joined row is what killed the page.
    // `courses` is the one list, and it holds names rather than rows.
    for (const [key, value] of Object.entries(data)) {
      if (key === "courses") {
        expect(Array.isArray(value) && value.every((v) => typeof v === "string")).toBe(true);
        continue;
      }
      expect(
        value === null || typeof value === "string" || typeof value === "number",
        `${key} is a ${typeof value}, which React cannot render`,
      ).toBe(true);
    }
  });

  it("asks for the three names, since the row only carries their ids", async () => {
    await getStudentProfile("auth-1", "b1");

    expect(selects[0]).toContain("course:courses(");
    expect(selects[0]).toContain("batch:batches(name)");
    expect(selects[0]).toContain("branch:branches(name)");
  });

  // The portal shows the student what their course costs before any invoice is
  // raised against them, and it can only do that if the fee is selected here.
  it("asks for the course fee along with the course name", async () => {
    await getStudentProfile("auth-1", "b1");

    expect(selects[0]).toContain("baseFee");
  });

  it("names the missing link rather than letting PostgREST describe it", async () => {
    rows.students = [];

    await expect(getStudentProfile("auth-1", "b1")).rejects.toThrow(
      /No student record is linked to this login/,
    );
  });
});
