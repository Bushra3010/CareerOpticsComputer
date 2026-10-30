import { beforeEach, describe, expect, it, vi } from "vitest";
const db = vi.hoisted(() => ({ tables: {} as Record<string, Array<Record<string, any>>>, failPublish: false, writes: 0 }));
vi.mock("@/lib/supabase/client", () => ({ supabaseUrl: "https://example.supabase.co", supabase: { from: (table: string) => {
  const filters: Array<(row: Record<string, any>) => boolean> = [];
  let mutation: Record<string, any> | null = null;
  const result = () => ({ data: (db.tables[table] || []).filter((r) => filters.every((f) => f(r))), error: mutation && table === "exams" && db.failPublish ? { message: "Denied" } : null });
  const chain: any = {
    select: () => chain, order: () => chain,
    eq: (k: string, v: unknown) => { filters.push((r) => r[k] === v); return chain; },
    is: (k: string, v: unknown) => { filters.push((r) => (r[k] ?? null) === v); return chain; },
    in: (k: string, values: unknown[]) => { filters.push((r) => values.includes(r[k])); return chain; },
    update: (payload: Record<string, any>) => { mutation = payload; db.writes++; return chain; },
    insert: () => { db.writes++; return chain; },
    single: () => Promise.resolve({ ...result(), data: result().data[0] }),
    maybeSingle: () => Promise.resolve({ ...result(), data: result().data[0] || null }),
    then: (resolve: (v: unknown) => unknown) => Promise.resolve(result()).then(resolve),
  }; return chain;
} } }));
const { getStudentDocument, getStudentResults, submitExamResults } = await import("@/lib/supabase/data");
beforeEach(() => {
  db.failPublish = false; db.writes = 0;
  const scope = { branchId: "b1", courseId: "c1", batchId: "a" };
  db.tables = {
    students: [{ id: "s1", firstName: "Asha", ...scope }], courses: [{ id: "c1", name: "ADCA" }], branches: [{ id: "b1", name: "Patna" }], batches: [{ id: "a", name: "Morning" }],
    exams: [
      { id: "pub", name: "Final", subject: "Theory", maxMarks: 100, passMarks: 40, examDate: "2026-10-01", status: "PUBLISHED", ...scope },
      { id: "draft", name: "Draft", subject: "Practical", status: "SCHEDULED", ...scope },
      { id: "other", name: "Other", subject: "Other branch", status: "PUBLISHED", ...scope, branchId: "b2" },
    ], exam_results: [
      { id: "r1", studentId: "s1", examId: "pub", marks: 88 },
      { id: "r2", studentId: "s1", examId: "draft", marks: 12 },
      { id: "r3", studentId: "s1", examId: "other", marks: 99 },
    ],
  };
});
describe("results and generation data", () => {
  it("includes only published results of the student's branch and course in documents", async () => {
    const { data } = await getStudentDocument("s1", "b1");
    expect(data.examResults).toHaveLength(1);
    expect(data.examResults[0]).toMatchObject({ marks: 88, exam: { subject: "Theory" } });
  });
  it("joins portal marks to exam metadata and hides drafts", async () => {
    const { data } = await getStudentResults("s1", "b1");
    expect(data).toEqual([{ id: "r1", exam: "Final", subject: "Theory", maxMarks: 100, passMarks: 40, marks: 88, examDate: "2026-10-01" }]);
  });
  it("rejects invalid scores before writing any rows", async () => {
    await expect(submitExamResults("pub", "b1", [{ studentId: "s1", marks: 101 }])).rejects.toThrow("between 0 and 100");
    expect(db.writes).toBe(0);
  });
  it("rejects students outside the exam's branch before any writes", async () => {
    db.tables.students[0].branchId = "b2";
    await expect(submitExamResults("pub", "b1", [{ studentId: "s1", marks: 88 }])).rejects.toThrow("branch, course and batch");
    expect(db.writes).toBe(0);
  });
  it("reports publish failures after saving instead of claiming success", async () => {
    db.failPublish = true;
    await expect(submitExamResults("pub", "b1", [{ studentId: "s1", marks: 88 }], true)).rejects.toThrow("Marks saved, but publishing failed");
  });
});
