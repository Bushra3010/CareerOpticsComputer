import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * A student's portal showed the name of their course and nothing of what
 * went with it. getStudentPortalCourses gathers it: every course on the
 * record, the batch, its teachers, the subjects -- set on the batch and on
 * the timetable -- when each is taught, and the syllabus.
 */
const rows: Record<string, Record<string, unknown>[]> = {};

function builder(table: string) {
  const filters: Record<string, unknown> = {};
  // PostgREST's `or`: "a.eq.x,b.eq.y" keeps rows matching either.
  let either: Array<[string, string]> = [];
  const list = () =>
    (rows[table] ?? []).filter(
      (r) =>
        Object.entries(filters).every(([k, v]) => (Array.isArray(v) ? v.includes(r[k]) : r[k] === v)) &&
        (!either.length || either.some(([k, v]) => String(r[k]) === v)),
    );
  const chain: Record<string, unknown> = {
    select: () => chain,
    order: () => chain,
    is: () => chain,
    or: (expr: string) => {
      either = expr.split(",").map((part) => {
        const [k, , v] = part.split(".");
        return [k, v] as [string, string];
      });
      return chain;
    },
    eq: (column: string, value: unknown) => {
      filters[column] = value;
      return chain;
    },
    in: (column: string, values: unknown[]) => {
      filters[column] = values;
      return chain;
    },
    maybeSingle: () => Promise.resolve({ data: list()[0] ?? null, error: null }),
    single: () => Promise.resolve({ data: list()[0] ?? null, error: null }),
    then: (resolve: (value: unknown) => unknown) => Promise.resolve({ data: list(), error: null }).then(resolve),
  };
  return chain;
}

vi.mock("@/lib/supabase/client", () => ({
  supabase: { from: (table: string) => builder(table) },
  supabaseUrl: "https://project.supabase.co",
}));

const { getStudentPortalCourses } = await import("@/lib/supabase/data");

beforeEach(() => {
  rows.students = [{ id: "s1", userId: "login-1", branchId: "b1", courseId: "c10", courseIds: ["c10", "cspk"], batchId: "bt1" }];
  rows.courses = [
    { id: "c10", name: "10th Bihar Board", code: "BSEB10", durationValue: 6, durationUnit: "MONTHS", baseFee: 999, eligibility: "9th pass" },
    { id: "cspk", name: "Spoken English", code: "SPK", durationValue: 3, durationUnit: "MONTHS", baseFee: 1500 },
  ];
  rows.batches = [{ id: "bt1", name: "Crash Course 10th", courseId: "c10", instructor: "Raunak kumar", subjects: ["Science", "Math", "Hindi"] }];
  rows.batch_timings = [
    { batchId: "bt1", day: "TUESDAY", startTime: "06:15:00", endTime: "07:15:00", subject: "Science", instructor: "Raunak kumar", roomNo: "Hall" },
    { batchId: "bt1", day: "MONDAY", startTime: "06:15:00", endTime: "07:15:00", subject: "Science", instructor: "Raunak kumar", roomNo: "Hall" },
    { batchId: "bt1", day: "MONDAY", startTime: "08:15:00", endTime: "09:20:00", subject: "Math", instructor: "Raunak", roomNo: "Room 1" },
  ];
  rows.course_modules = [{ id: "m1", courseId: "c10", name: "Physics", sortOrder: 1, status: "Active" }];
  rows.course_chapters = [{ id: "ch1", moduleId: "m1", courseId: "c10", name: "Light", sortOrder: 1, status: "Active" }];
});

describe("getStudentPortalCourses", () => {
  it("returns every course the student is enrolled on", async () => {
    const { data } = await getStudentPortalCourses("login-1", "b1");
    expect(data.map((c) => c.name)).toEqual(["10th Bihar Board", "Spoken English"]);
    expect(data[0]).toMatchObject({ code: "BSEB10", duration: "6 months", fee: 999, eligibility: "9th pass" });
  });

  it("puts the batch and its teachers on the course the batch teaches", async () => {
    const { data } = await getStudentPortalCourses("login-1", "b1");
    expect(data[0].batch).toMatchObject({ name: "Crash Course 10th", teachers: ["Raunak kumar"] });
    expect(data[1].batch).toBeNull();
  });

  it("lists the batch's subjects with their teacher and weekly times, in day order", async () => {
    const { data } = await getStudentPortalCourses("login-1", "b1");
    const subjects = data[0].subjects;
    expect(subjects.map((s) => s.name)).toEqual(["Science", "Math", "Hindi"]);
    expect(subjects[0].slots.map((s) => s.day)).toEqual(["MONDAY", "TUESDAY"]);
    expect(subjects[1]).toMatchObject({ teachers: ["Raunak"], slots: [{ day: "MONDAY", startTime: "08:15", endTime: "09:20", room: "Room 1" }] });
    // A subject with no slot of its own falls back to the batch's teacher.
    expect(subjects[2]).toMatchObject({ teachers: ["Raunak kumar"], slots: [] });
  });

  it("carries the course's syllabus", async () => {
    const { data } = await getStudentPortalCourses("login-1", "b1");
    expect(data[0].syllabus.modules.map((m) => m.name)).toEqual(["Physics"]);
    expect(data[0].syllabus.chapters.map((c) => c.name)).toEqual(["Light"]);
  });

  it("finds the student by record id too, for an office account viewing their portal", async () => {
    const { data } = await getStudentPortalCourses("s1", "b1");
    expect(data.map((c) => c.name)).toEqual(["10th Bihar Board", "Spoken English"]);
  });

  it("returns nothing for a login with no student record", async () => {
    const { data } = await getStudentPortalCourses("someone-else", "b1");
    expect(data).toEqual([]);
  });
});
