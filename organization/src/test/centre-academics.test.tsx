import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

/**
 * The centre panel's academics: the question bank's CSV upload, drawing a
 * paper from it, and the Manage Batch list.
 */
vi.mock("@/lib/supabase/client", () => ({ supabase: { from: vi.fn(), rpc: vi.fn() } }));
// Stable across renders, as the real hook's is: the pages reload when it changes.
const toast = vi.fn();
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast }) }));
vi.mock("@/components/layout/AppLayout", () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ view: "franchise", branchId: "b1", organizationId: "org1", user: { id: "u1", name: "Centre", branchId: "b1" } }),
}));
const createBatch = vi.fn((..._a: unknown[]) => Promise.resolve({ success: true, data: {} }));
vi.mock("@/lib/supabase/data", () => ({
  getBatches: () =>
    Promise.resolve({
      success: true,
      data: [
        { id: "bt1", name: "Morning ADCA", branchId: "b1", courseId: "c1", isActive: true, createdAt: "2026-10-01T00:00:00Z", currentStudents: 12 },
        { id: "bt2", name: "Evening DCA", branchId: "b1", courseId: "c2", isActive: false, createdAt: "2026-09-01T00:00:00Z", currentStudents: 3 },
      ],
    }),
  getBatchesByOrg: () => Promise.resolve({ success: true, data: [] }),
  getBranches: () => Promise.resolve({ success: true, data: [] }),
  getCourses: () => Promise.resolve({ success: true, data: [{ id: "c1", name: "ADCA" }, { id: "c2", name: "DCA" }] }),
  createBatch: (...a: unknown[]) => createBatch(...a),
  updateBatch: vi.fn(),
}));

const { parseQuestionCsv, splitCsv, SAMPLE_QUESTION_CSV, toExamQuestion, drawRandom } = await import("@/lib/supabase/questionBank");
const { default: CentreBatches } = await import("@/pages/centre/CentreBatches");

describe("parseQuestionCsv", () => {
  it("takes the answer as the option's words or its number, and skips the header", () => {
    const { questions, errors } = parseQuestionCsv(
      [
        "question,option1,option2,option3,option4,answer",
        "What is RAM?,Memory,Printer,Mouse,Cable,Memory",
        "2 + 2?,3,4,5,6,2",
        "Pick the OS,Excel,Word,Linux,Paint,linux",
      ].join("\n"),
    );
    expect(errors).toEqual([]);
    expect(questions).toEqual([
      { question: "What is RAM?", options: ["Memory", "Printer", "Mouse", "Cable"], answer: "Memory" },
      { question: "2 + 2?", options: ["3", "4", "5", "6"], answer: "4" },
      // Matched without regard to case, stored as the option was written.
      { question: "Pick the OS", options: ["Excel", "Word", "Linux", "Paint"], answer: "Linux" },
    ]);
  });

  it("keeps commas, doubled quotes and line breaks inside quoted fields", () => {
    const { questions, errors } = parseQuestionCsv(
      '"Which adds A1, A2 and A3?","=SUM(A1:A3)","=ADD(A1,A3)","say ""hi""",=MAX(A1),"=ADD(A1,A3)"\r\n"Two\nlines?",a,b,c,d,4\r\n',
    );
    expect(errors).toEqual([]);
    expect(questions[0]).toEqual({
      question: "Which adds A1, A2 and A3?",
      options: ["=SUM(A1:A3)", "=ADD(A1,A3)", 'say "hi"', "=MAX(A1)"],
      answer: "=ADD(A1,A3)",
    });
    expect(questions[1]).toMatchObject({ question: "Two\nlines?", answer: "d" });
  });

  it("names the rows it skips", () => {
    const { questions, errors } = parseQuestionCsv("q1,a,b,c,d,9\nq2,a,,c,d,1\n,a,b,c,d,1\nq4,a,b,c,d,e");
    expect(questions).toEqual([]);
    expect(errors).toHaveLength(4);
    expect(errors[0]).toMatch(/^Row 1:/);
    expect(errors[1]).toMatch(/four options/);
  });

  it("reads its own sample file cleanly", () => {
    const { questions, errors } = parseQuestionCsv(SAMPLE_QUESTION_CSV);
    expect(errors).toEqual([]);
    expect(questions).toHaveLength(splitCsv(SAMPLE_QUESTION_CSV).length - 1);
    expect(questions[1].answer).toBe("Ctrl + C");
  });
});

describe("drawing a paper", () => {
  it("turns the answer's words into the option index the exam marks by", () => {
    const q = toExamQuestion({ question: "2 + 2?", options: ["3", "4", "5", "6"], answer: "4" });
    expect(q).toMatchObject({ text: "2 + 2?", options: ["3", "4", "5", "6"], answer: 1, marks: null });
    expect(q.id).toBeTruthy();
  });

  it("draws the asked number without repeats", () => {
    const drawn = drawRandom([1, 2, 3, 4, 5], 3);
    expect(drawn).toHaveLength(3);
    expect(new Set(drawn).size).toBe(3);
  });
});

describe("Manage Batch", () => {
  it("lists the centre's batches with course, students and status, and filters by course", async () => {
    render(
      <MemoryRouter>
        <CentreBatches />
      </MemoryRouter>,
    );
    const row = (await screen.findByText("Morning ADCA")).closest("tr")!;
    expect(within(row).getByText("ADCA")).toBeInTheDocument();
    expect(within(row).getByText("12")).toBeInTheDocument();
    expect(within(row).getByText("ACTIVE")).toBeInTheDocument();
    expect(within(row).getByRole("link", { name: "All Students" })).toHaveAttribute("href", "/centre/batch-students?id=bt1");
    expect(within(screen.getByText("Evening DCA").closest("tr")!).getByText("INACTIVE")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Filter by course"), { target: { value: "c2" } });
    expect(screen.queryByText("Morning ADCA")).not.toBeInTheDocument();
    expect(screen.getByText("Evening DCA")).toBeInTheDocument();
  });

  it("adds a batch for the centre with a generated code", async () => {
    render(
      <MemoryRouter>
        <CentreBatches />
      </MemoryRouter>,
    );
    await screen.findByText("Morning ADCA");
    fireEvent.change(screen.getByPlaceholderText("Batch Name"), { target: { value: "Weekend Tally" } });
    const courseSelect = screen.getAllByRole("combobox").find((el) => within(el).queryByText("Select Course"))!;
    fireEvent.change(courseSelect, { target: { value: "c1" } });
    fireEvent.click(screen.getByRole("button", { name: "Add Now" }));
    await waitFor(() => expect(createBatch).toHaveBeenCalled());
    const [branch, payload] = createBatch.mock.calls[0] as [string, Record<string, unknown>];
    expect(branch).toBe("b1");
    expect(payload).toMatchObject({ name: "Weekend Tally", courseId: "c1", isActive: true });
    expect(String(payload.code)).toMatch(/^WEEKEN-[A-Z0-9]{4}$/);
  });
});
