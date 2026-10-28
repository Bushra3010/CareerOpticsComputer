import { describe, expect, it, vi } from "vitest";
import { isExamCandidate, validExamMarks, validScore } from "@/lib/assessments";
import { designHtml, starterDesign } from "@/lib/documentDesigner";
import { printFromTemplate, tokensFor, tokensForRecord } from "@/lib/studentTemplateDocument";
import type { StudentDocument } from "@/lib/documents";
import { loadDesignFor } from "@/lib/supabase/documentTemplates";
import { printHtml } from "@/lib/export";
import { admitCardHtml } from "@/data/admit-card-templates";
vi.mock("@/lib/supabase/client", () => ({ supabase: {}, supabaseUrl: "https://example.supabase.co" }));
vi.mock("@/lib/supabase/documentTemplates", () => ({ loadDesignFor: vi.fn() }));
vi.mock("@/lib/export", () => ({ printHtml: vi.fn() }));
const student: StudentDocument = {
  firstName: "Asha", lastName: "Verma", admissionDate: "2026-01-01", issueDate: "2026-10-10",
  branch: { name: "Patna", phone: "", email: "", organization: { name: "Training Centre" } }, feeInvoices: [],
  examResults: [
    { marks: 85, exam: { name: "Final", subject: "Theory <script>", maxMarks: 100, passMarks: 40, examDate: "2026-10-01" } },
    { marks: 30, exam: { name: "Final", subject: "Practical", maxMarks: 50, passMarks: 35, examDate: "2026-10-02" } },
  ],
};
describe("academic documents use the student's records", () => {
  it("does not fill missing identity fields with demo students", () => {
    expect(tokensFor(student).father_name).toBe("");
    expect(tokensFor(student).enrollment_no).toBe("");
    expect(tokensForRecord({ firstName: "Asha" }).course_name).toBe("");
  });
  it("derives aggregate marks and fails when any paper fails", () => {
    const tokens = tokensFor(student);
    expect(tokens).toMatchObject({ total_marks: "115", maximum_marks: "150", percentage: "76.67%", grade: "F", result: "Fail" });
    expect(tokens.issue_date).toContain("10");
    expect(tokensFor({ ...student, examResults: [] })).toMatchObject({ grade: "", percentage: "", result: "Awaited" });
  });
  it("prints subjects, minimum marks and scores, escaping the subject text", () => {
    const html = designHtml("marksheet", starterDesign("marksheet"), tokensFor(student));
    expect(html).toContain("Theory &lt;script&gt;");
    expect(html).toContain("Practical");
    expect(html).toContain(">85</td>");
    expect(html).toContain(">35</td>");
    expect(html).not.toContain("88.4%");
    expect(html).not.toContain("<script>");
  });
  it("uses the selected live examination and institute on admit cards", () => {
    const html = admitCardHtml({ id: "t", name: "Final card", exam: "midterm", status: "active", size: "a4", showPhoto: false, showQr: false, showSchedule: true, elements: ["Exam Name", "Exam Date"],
      institute: { name: "Patna Training", address: "Bihar" },
      liveExam: { value: "e1", label: "ADCA Final", window: "12 Oct 2026", schedule: [{ subject: "Computers", when: "12 Oct 2026" }] },
    }, { id: "s1", name: "Asha", class: "ADCA", section: "A", rollNo: "01", feeStatus: "paid" });
    expect(html).toContain("Patna Training"); expect(html).toContain("ADCA Final"); expect(html).toContain("12 Oct 2026");
    expect(html).not.toContain("Mid-Term Examination");
  });
});
describe("marks entry", () => {
  const exam = { branchId: "b1", courseId: "c1", batchId: "a" };
  it("accepts a secondary enrolled course and enforces branch and batch", () => {
    expect(isExamCandidate({ ...exam, courseId: "c2", courseIds: ["c1"] }, exam)).toBe(true);
    expect(isExamCandidate({ ...exam, branchId: "b2" }, exam)).toBe(false);
    expect(isExamCandidate({ ...exam, batchId: "b" }, exam)).toBe(false);
    expect(isExamCandidate({ ...exam, courseId: "c2" }, exam)).toBe(false);
  });
  it("accepts zero and boundary scores, rejects nonfinite and out of range values", () => {
    expect(validScore(0, 100)).toBe(true); expect(validScore(100, 100)).toBe(true);
    for (const score of [-1, 101, NaN, Infinity]) expect(validScore(score, 100)).toBe(false);
    expect(validExamMarks(100, 101)).toBe(false); expect(validExamMarks(0, 0)).toBe(false); expect(validExamMarks(100, 40)).toBe(true);
  });
});

describe("custom marksheet printing", () => {
  it("prints every paper across pages and keeps the overall total", async () => {
    const design = starterDesign("marksheet");
    vi.mocked(loadDesignFor).mockResolvedValue({ template: { id: "t1", organizationId: "o1", name: "Results", kind: "marksheet", design, isDefault: true }, design });
    const many = Array.from({ length: 20 }, (_, i) => ({ ...student.examResults[0], exam: { ...student.examResults[0].exam, subject: `Paper ${i + 1}` } }));
    await expect(printFromTemplate("marksheet", { ...student, examResults: many }, "o1", "b1")).resolves.toBe(true);
    const html = vi.mocked(printHtml).mock.calls.at(-1)![1];
    expect(html.match(/page-break-after:always/g)).toHaveLength(3);
    expect(html).toContain("Paper 20");
    expect(html).toContain("1700 / 2000");
  });
  it("falls back to the PDF for older templates with no marks table", async () => {
    const design = starterDesign("marksheet"); design.elements = design.elements.filter((el) => el.type !== "marks-table");
    vi.mocked(loadDesignFor).mockResolvedValue({ template: { id: "t1", organizationId: "o1", name: "Old Results", kind: "marksheet", design, isDefault: true }, design });
    await expect(printFromTemplate("marksheet", student, "o1", "b1")).resolves.toBe(false);
  });
});
