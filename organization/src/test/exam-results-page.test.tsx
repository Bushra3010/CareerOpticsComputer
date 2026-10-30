import { render, screen, fireEvent, within, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";

/**
 * The Results page: pick a centre's student and a term, type theory and
 * practical marks, and the total, percentage, grade and result are worked out
 * before saving -- the final term's marksheet is what a certificate rests on.
 */
const toast = vi.fn();
let sheets: Array<Record<string, unknown>> = [];
// Null: approvals not set up, so every marksheet prints.
let approvals: Array<Record<string, unknown>> | null = null;
const saveMarksheet = vi.fn((_input: Record<string, unknown>, _by: string) => Promise.resolve({ result: "PASS", percentage: 75, grade: "A" }));

vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast }) }));
vi.mock("@/components/layout/AppLayout", () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ view: "franchise", user: { id: "u1", name: "Centre Staff", role: "FRANCHISE", organizationId: "org1", branchId: "b1" } }),
}));
vi.mock("@/lib/supabase/data", () => ({
  getBranches: () => Promise.resolve({ success: true, data: [{ id: "b1", name: "Begusarai Centre" }, { id: "b2", name: "Patna Centre" }] }),
  getCourses: () => Promise.resolve({ success: true, data: [{ id: "c1", name: "ADCA", durationMonths: 24 }] }),
  getSessionYears: () => Promise.resolve({ success: true, data: [{ name: "2026-2027" }] }),
  getStudentPicklist: () =>
    Promise.resolve({
      success: true,
      data: [
        { id: "s1", branchId: "b1", courseId: "c1", firstName: "Ram", lastName: "Kumar", enrollmentNo: "E001", academicYear: "2026-2027" },
      ],
    }),
  getStudentDocument: (id: string) =>
    Promise.resolve({ data: { id, firstName: id === "s1" ? "Ram" : "Sita", branch: { name: "Begusarai Centre", organization: { name: "Org" } }, examResults: [] } }),
}));
vi.mock("@/lib/supabase/examWorkflow", () => ({
  getExamCentres: () => Promise.resolve([]),
  getMarksheets: () => Promise.resolve(sheets),
  getExamSchedules: () => Promise.resolve([]),
  getAdmitCards: () => Promise.resolve([]),
  getPrintApprovals: () => Promise.resolve(approvals),
  approvalFor: (list: Array<{ kind: string; studentId: string; marksheetId: string; status: string }> | null, kind: string, key: string) =>
    list === null ? "APPROVED" : list.find((a) => a.kind === kind && (kind === "MARKSHEET" ? a.marksheetId === key : a.studentId === key))?.status ?? null,
  deleteMarksheet: vi.fn(),
  saveMarksheet: (input: Record<string, unknown>, by: string) => saveMarksheet(input, by),
  getCourseSubjects: () =>
    Promise.resolve([
      { id: "x1", courseId: "c1", term: 2, code: "A01", name: "Web Design", subjectType: "BOTH", theoryMax: 100, theoryMin: 35, practicalMax: 50, practicalMin: 20, sortOrder: 1 },
      { id: "x2", courseId: "c1", term: 2, code: "A02", name: "Tally", subjectType: "THEORY", theoryMax: 100, theoryMin: 35, practicalMax: 0, practicalMin: 0, sortOrder: 2 },
      { id: "x3", courseId: "c1", term: 1, code: "A00", name: "Basics", subjectType: "THEORY", theoryMax: 100, theoryMin: 35, practicalMax: 0, practicalMin: 0, sortOrder: 1 },
    ]),
}));

vi.mock("@/components/ui/PageHeader", () => ({ PageHeader: () => <div /> }));
const printMarksheetsFromTemplate = vi.fn((..._a: unknown[]) => Promise.resolve(false));
const marksheetsPdf = vi.fn((..._a: unknown[]) => Promise.resolve());
vi.mock("@/lib/studentTemplateDocument", () => ({
  printFromTemplate: vi.fn(),
  printMarksheetsFromTemplate: (...a: unknown[]) => printMarksheetsFromTemplate(...a),
}));
vi.mock("@/lib/documents", () => ({ marksheetPdf: vi.fn(), marksheetsPdf: (...a: unknown[]) => marksheetsPdf(...a) }));

const Results = (await import("@/pages/exam/Results")).default;

const control = (label: string) => {
  const labelEl = Array.from(document.querySelectorAll("label")).find((el) => el.textContent?.trim() === label)!;
  return within(labelEl.parentElement!).getByRole("combobox");
};
const choose = async (label: string, option: RegExp | string) => {
  fireEvent.keyDown(control(label), { key: "Enter" });
  fireEvent.click(await screen.findByRole("option", { name: option }));
};

beforeEach(() => {
  sheets = [];
  approvals = null;
  toast.mockClear();
  saveMarksheet.mockClear();
  printMarksheetsFromTemplate.mockClear();
  marksheetsPdf.mockClear();
});

describe("Results page", () => {
  it("prints a centre's marksheet only once the head office approves it", async () => {
    const sheet = (id: string, studentId: string) => ({
      id, studentId, branchId: "b1", courseId: "c1", term: 1, session: "2026-2027", issueDate: "2026-10-21",
      marks: [], totalObtained: 70, totalMax: 100, percentage: 70, grade: "B", result: "PASS", isFinal: false, marksheetNo: `MS-${id}`, updatedAt: "",
    });
    sheets = [sheet("m1", "s1"), sheet("m2", "s2")];
    approvals = [
      { id: "a1", kind: "MARKSHEET", marksheetId: "m1", studentId: "s1", status: "APPROVED" },
      { id: "a2", kind: "MARKSHEET", marksheetId: "m2", studentId: "s2", status: "PENDING" },
    ];
    render(<MemoryRouter><Results /></MemoryRouter>);
    expect(await screen.findByText("Awaiting approval")).toBeInTheDocument();
    expect(screen.getByText("Approved")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Print all (2)" }));
    await waitFor(() => expect(marksheetsPdf).toHaveBeenCalledTimes(1));
    expect((marksheetsPdf.mock.calls[0] as unknown[])[0]).toHaveLength(1);
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: "1 marksheet(s) left out" }));
  });

  it("prints the ticked students' marksheets together", async () => {
    const sheet = (id: string, studentId: string) => ({
      id, studentId, branchId: "b1", courseId: "c1", term: 1, session: "2026-2027", issueDate: "2026-10-21",
      marks: [{ subjectId: "x3", code: "A00", name: "Basics", subjectType: "THEORY", theoryMax: 100, theoryMin: 35, theory: 70, practicalMax: 0, practicalMin: 0, practical: null }],
      totalObtained: 70, totalMax: 100, percentage: 70, grade: "B", result: "PASS", isFinal: false, marksheetNo: `MS-${id}`, updatedAt: "",
    });
    sheets = [sheet("m1", "s1"), sheet("m2", "s2")];
    render(<MemoryRouter><Results /></MemoryRouter>);
    expect(await screen.findByRole("button", { name: "Print all (2)" })).toBeEnabled();
    expect(screen.getByRole("button", { name: /Print selected \(0\)/ })).toBeDisabled();

    const rowOf = (no: string) => screen.getAllByText(no).map((el) => el.closest("tr")).find(Boolean) as HTMLElement;
    await waitFor(() => expect(rowOf("E001")).toBeTruthy());
    fireEvent.click(within(rowOf("E001")).getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: /Print selected \(1\)/ }));
    await waitFor(() => expect(marksheetsPdf).toHaveBeenCalledTimes(1));
    expect((marksheetsPdf.mock.calls[0] as unknown[])[0]).toEqual([expect.objectContaining({ firstName: "Ram" })]);

    fireEvent.click(screen.getByRole("button", { name: "Print all (2)" }));
    await waitFor(() => expect(marksheetsPdf).toHaveBeenCalledTimes(2));
    expect((marksheetsPdf.mock.calls[1] as unknown[])[0]).toHaveLength(2);
    // The designs are tried first, all in one run.
    expect((printMarksheetsFromTemplate.mock.calls[1] as unknown[])[0]).toHaveLength(2);
  });

  it("works out the result from theory and practical marks and saves the final term", async () => {
    render(<MemoryRouter><Results /></MemoryRouter>);
    await waitFor(() => expect(control("Centre")).toHaveTextContent("Begusarai Centre"));

    await choose("Student", /Ram Kumar/);
    await choose("Year / Semester", "2nd Year");

    // The second year's two papers, not the first year's.
    expect(await screen.findByText("Web Design")).toBeInTheDocument();
    expect(screen.queryByText("Basics")).toBeNull();
    expect(screen.getByText(/final term/)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Web Design theory"), { target: { value: "80" } });
    fireEvent.change(screen.getByLabelText("Web Design practical"), { target: { value: "15" } });
    fireEvent.change(screen.getByLabelText("Tally theory"), { target: { value: "90" } });

    // 185 of 250, but a practical below its minimum fails the subject.
    expect(screen.getByText("FAIL")).toBeInTheDocument();
    expect(screen.getByText(/Below minimum: Web Design/)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Web Design practical"), { target: { value: "40" } });
    expect(screen.getByText("PASS")).toBeInTheDocument();
    expect(screen.getByText("84%")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Save result" }));
    await waitFor(() => expect(saveMarksheet).toHaveBeenCalledTimes(1));
    const [input, by] = saveMarksheet.mock.calls[0] as unknown as [Record<string, unknown>, string];
    expect(by).toBe("Centre Staff");
    expect(input).toMatchObject({ studentId: "s1", branchId: "b1", courseId: "c1", term: 2, session: "2026-2027", isFinal: true, enrollmentNo: "E001" });
    expect((input.marks as Array<Record<string, unknown>>).map((l) => [l.name, l.theory, l.practical])).toEqual([
      ["Web Design", 80, 40],
      ["Tally", 90, null],
    ]);
  });

  it("lets a paper the course no longer has be removed from a saved marksheet", async () => {
    // Saved when the second year still had "Old Paper"; the course has since dropped it.
    sheets = [{
      id: "m1", studentId: "s1", branchId: "b1", courseId: "c1", term: 2, session: "2026-2027", issueDate: "2026-10-21",
      marks: [
        { subjectId: "x1", code: "A01", name: "Web Design", subjectType: "BOTH", theoryMax: 100, theoryMin: 35, theory: 70, practicalMax: 50, practicalMin: 20, practical: 30 },
        { subjectId: "gone", code: "OLD", name: "Old Paper", subjectType: "THEORY", theoryMax: 100, theoryMin: 35, theory: 60, practicalMax: 0, practicalMin: 0, practical: null },
      ],
      totalObtained: 160, totalMax: 250, percentage: 64, grade: "B", result: "PASS", isFinal: true, marksheetNo: "MS-E001-2", updatedAt: "",
    }];
    render(<MemoryRouter><Results /></MemoryRouter>);
    await waitFor(() => expect(control("Centre")).toHaveTextContent("Begusarai Centre"));
    await choose("Student", /Ram Kumar/);
    await choose("Year / Semester", "2nd Year");

    expect(await screen.findByText("Old Paper")).toBeInTheDocument();
    expect(screen.getByText("No longer a subject of this course.")).toBeInTheDocument();
    // Only the dropped paper can be removed.
    expect(screen.queryByRole("button", { name: "Remove Web Design from this marksheet" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Remove Old Paper from this marksheet" }));
    expect(screen.queryByText("Old Paper")).toBeNull();

    fireEvent.change(screen.getByLabelText("Tally theory"), { target: { value: "90" } });
    fireEvent.click(screen.getByRole("button", { name: "Update result" }));
    await waitFor(() => expect(saveMarksheet).toHaveBeenCalledTimes(1));
    const [input] = saveMarksheet.mock.calls[0] as unknown as [Record<string, unknown>];
    expect((input.marks as Array<Record<string, unknown>>).map((l) => l.name)).toEqual(["Web Design", "Tally"]);
  });

  it("will not save a mark above the paper's maximum", async () => {
    render(<MemoryRouter><Results /></MemoryRouter>);
    await waitFor(() => expect(control("Centre")).toHaveTextContent("Begusarai Centre"));
    await choose("Student", /Ram Kumar/);
    await choose("Year / Semester", "1st Year");
    fireEvent.change(await screen.findByLabelText("Basics theory"), { target: { value: "120" } });
    fireEvent.click(screen.getByRole("button", { name: "Save result" }));
    await waitFor(() => expect(toast).toHaveBeenCalledWith(expect.objectContaining({ description: "Basics: theory marks must be between 0 and 100." })));
    expect(saveMarksheet).not.toHaveBeenCalled();
  });
});
