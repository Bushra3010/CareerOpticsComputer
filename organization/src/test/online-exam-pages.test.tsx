import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";

/**
 * The online exam screens end to end: the head office sets a paper, assigns
 * it, reads the sittings; the student sees it, sits it against the clock and
 * hands it in.
 */
const toast = vi.fn();
let auth: Record<string, unknown> = {};
const saveOnlineExam = vi.fn((..._a: unknown[]) => Promise.resolve("e9"));
const assignExam = vi.fn((..._a: unknown[]) => Promise.resolve(2));
const startOnlineExam = vi.fn();
const saveOnlineAnswers = vi.fn((..._a: unknown[]) => Promise.resolve());
const submitOnlineExam = vi.fn((..._a: unknown[]) =>
  Promise.resolve({ attemptId: "a1", submitted: true, showResult: true, totalQuestions: 2, attempted: 2, correct: 1, wrong: 1, score: 1, maxScore: 2, percentage: 50, result: "PASS" }),
);
const deleteExamAttempt = vi.fn((..._a: unknown[]) => Promise.resolve());

const exam = {
  id: "e1",
  title: "ADCA Online Test",
  description: "Read every question.",
  courseId: "c1",
  term: 1,
  totalQuestions: 0,
  marksPerQuestion: 1,
  negativeMarks: 0,
  passPercentage: 40,
  durationMinutes: 30,
  startAt: "",
  endAt: "",
  shuffleQuestions: true,
  showResult: true,
  status: "PUBLISHED",
  questions: [
    { id: "q1", text: "2 + 2 = ?", options: ["3", "4", "5", "6"], answer: 1, marks: null },
    { id: "q2", text: "Capital of Bihar?", options: ["Patna", "Gaya", "Ranchi", "Delhi"], answer: 0, marks: null },
  ],
  createdAt: "2026-10-20T10:00:00Z",
  updatedAt: "2026-10-20T10:00:00Z",
};

vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast }) }));
vi.mock("@/components/layout/AppLayout", () => ({ AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));
vi.mock("@/components/ui/PageHeader", () => ({ PageHeader: ({ title, actions }: { title: string; actions?: React.ReactNode }) => <div><h1>{title}</h1>{actions}</div> }));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => auth }));
vi.mock("@/lib/supabase/data", () => ({
  getBranches: () => Promise.resolve({ success: true, data: [{ id: "b1", name: "Begusarai Centre" }, { id: "b2", name: "Patna Centre" }] }),
  getCourses: () => Promise.resolve({ success: true, data: [{ id: "c1", name: "ADCA", durationMonths: 12 }] }),
  getSessionYears: () => Promise.resolve({ success: true, data: [{ name: "2026-2027" }] }),
  getStudentPicklist: () =>
    Promise.resolve({
      success: true,
      data: [
        { id: "s1", branchId: "b1", courseId: "c1", firstName: "Ram", lastName: "Kumar", enrollmentNo: "E001" },
        { id: "s2", branchId: "b1", courseId: "c1", firstName: "Sita", lastName: "Devi", enrollmentNo: "E002" },
        { id: "s3", branchId: "b2", courseId: "c1", firstName: "Mohan", lastName: "Lal", enrollmentNo: "E003" },
      ],
    }),
}));
vi.mock("@/lib/supabase/examWorkflow", () => ({ getExamCentres: () => Promise.resolve([]) }));
vi.mock("@/lib/supabase/onlineExams", () => ({
  getOnlineExams: () => Promise.resolve([exam]),
  saveOnlineExam: (...a: unknown[]) => saveOnlineExam(...a),
  setOnlineExamStatus: vi.fn(),
  deleteOnlineExam: vi.fn(),
  getExamAssignments: () =>
    Promise.resolve([
      { id: "as1", examId: "e1", branchId: "b1", studentId: "", courseId: "", assignedBy: "Head Office", assignedAt: "2026-10-20T10:00:00Z" },
      { id: "as2", examId: "e1", branchId: "b2", studentId: "s3", courseId: "", assignedBy: "Head Office", assignedAt: "2026-10-20T10:00:00Z" },
    ]),
  assignExam: (...a: unknown[]) => assignExam(...a),
  removeExamAssignment: vi.fn(),
  getExamAttempts: () =>
    Promise.resolve([
      { id: "a1", examId: "e1", studentId: "s1", branchId: "b1", startedAt: "2026-10-21T09:00:00Z", expiresAt: "2026-10-21T09:30:00Z", submittedAt: "2026-10-21T09:20:00Z", totalQuestions: 2, attempted: 2, correct: 2, wrong: 0, score: 2, maxScore: 2, percentage: 100, result: "PASS" },
      { id: "a2", examId: "e1", studentId: "s2", branchId: "b1", startedAt: "2026-10-20T09:00:00Z", expiresAt: "2026-10-20T09:30:00Z", submittedAt: "", totalQuestions: 2, attempted: 0, correct: 0, wrong: 0, score: 0, maxScore: 0, percentage: 0, result: "" },
    ]),
  deleteExamAttempt: (...a: unknown[]) => deleteExamAttempt(...a),
  submitOnlineExam: (...a: unknown[]) => submitOnlineExam(...a),
  getMyOnlineExams: () =>
    Promise.resolve([
      { ...exam, course: "ADCA", questionCount: 2, attempt: null },
      { ...exam, id: "e2", title: "Typing Test", course: "ADCA", questionCount: 2, attempt: { id: "a9", startedAt: "", expiresAt: "", submittedAt: "2026-10-20T11:00:00Z", totalQuestions: 2, attempted: 2, correct: 1, wrong: 1, score: 1, maxScore: 2, percentage: 50, result: "PASS" } },
    ]),
  startOnlineExam: (...a: unknown[]) => startOnlineExam(...a),
  saveOnlineAnswers: (...a: unknown[]) => saveOnlineAnswers(...a),
}));

const page = async (path: string) => (await import(path)).default;
const admin = { view: "admin", user: { id: "u1", name: "Head Office", role: "SUPER_ADMIN", organizationId: "org1", branchId: null }, actingAs: null };
const centre = { view: "franchise", user: { id: "u2", name: "Begusarai", role: "BRANCH_ADMIN", organizationId: "org1", branchId: "b1" }, actingAs: null };
const student = { view: "student", user: { id: "s1", name: "Ram Kumar", role: "STUDENT", organizationId: "org1", branchId: "b1" }, actingAs: null };

beforeEach(() => {
  auth = admin;
  toast.mockClear();
  saveOnlineExam.mockClear();
  assignExam.mockClear();
  submitOnlineExam.mockClear();
  startOnlineExam.mockReset();
  startOnlineExam.mockImplementation(() =>
    Promise.resolve({
      attemptId: "a1",
      examId: "e1",
      title: "ADCA Online Test",
      durationMinutes: 30,
      marksPerQuestion: 1,
      negativeMarks: 0,
      passPercentage: 40,
      showResult: true,
      startedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      answers: {},
      questions: exam.questions.map(({ answer: _answer, ...q }) => q),
    }),
  );
});

describe("Online Exams (head office)", () => {
  it("lists exams and saves a new one with its questions", async () => {
    const OnlineExams = await page("@/pages/online-exam/CreateOnlineExam");
    render(<MemoryRouter><OnlineExams /></MemoryRouter>);
    expect((await screen.findAllByText("ADCA Online Test")).length).toBeGreaterThan(0);
    expect(screen.getAllByText("2 of 2 · 2 marks").length).toBeGreaterThan(0);

    fireEvent.change(screen.getByLabelText("Exam title"), { target: { value: "MS Office Test" } });
    fireEvent.change(screen.getByLabelText("Duration (minutes) *"), { target: { value: "45" } });
    fireEvent.click(screen.getByRole("button", { name: /Add question/ }));
    fireEvent.change(screen.getByLabelText("Question 1"), { target: { value: "Which key copies?" } });
    fireEvent.change(screen.getByLabelText("Question 1 option A"), { target: { value: "Ctrl+C" } });
    fireEvent.change(screen.getByLabelText("Question 1 option B"), { target: { value: "Ctrl+V" } });
    fireEvent.change(screen.getByLabelText("Question 1 option C"), { target: { value: "Ctrl+X" } });
    fireEvent.change(screen.getByLabelText("Question 1 option D"), { target: { value: "Ctrl+Z" } });
    fireEvent.click(screen.getByLabelText("Question 1 option A is correct"));
    fireEvent.click(screen.getByRole("button", { name: "Save exam" }));

    await waitFor(() => expect(saveOnlineExam).toHaveBeenCalled());
    const [input] = saveOnlineExam.mock.calls[0] as [Record<string, unknown>];
    expect(input).toMatchObject({ title: "MS Office Test", durationMinutes: 45, status: "PUBLISHED" });
    expect(input.questions).toEqual([expect.objectContaining({ text: "Which key copies?", options: ["Ctrl+C", "Ctrl+V", "Ctrl+X", "Ctrl+Z"], answer: 0 })]);
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: "Exam saved" }));
  });

  it("refuses to save a question whose options are empty", async () => {
    const OnlineExams = await page("@/pages/online-exam/CreateOnlineExam");
    render(<MemoryRouter><OnlineExams /></MemoryRouter>);
    await screen.findAllByText("ADCA Online Test");
    fireEvent.change(screen.getByLabelText("Exam title"), { target: { value: "Broken" } });
    fireEvent.click(screen.getByRole("button", { name: /Add question/ }));
    fireEvent.change(screen.getByLabelText("Question 1"), { target: { value: "Hmm?" } });
    fireEvent.click(screen.getByRole("button", { name: "Save exam" }));
    await waitFor(() => expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: "Could not save exam", description: expect.stringMatching(/empty option/) })));
    expect(saveOnlineExam).not.toHaveBeenCalled();
  });

  it("shows a centre the exams it was given, without the editor", async () => {
    auth = centre;
    const OnlineExams = await page("@/pages/online-exam/CreateOnlineExam");
    render(<MemoryRouter><OnlineExams /></MemoryRouter>);
    expect((await screen.findAllByText("ADCA Online Test")).length).toBeGreaterThan(0);
    expect(screen.queryByText("Create exam")).not.toBeInTheDocument();
  });
});

describe("Assign Exam", () => {
  it("lists who is on each exam and assigns ticked students", async () => {
    const AssignExam = await page("@/pages/online-exam/AssignExam");
    render(<MemoryRouter initialEntries={["/online-exam/assign?exam=e1"]}><AssignExam /></MemoryRouter>);
    expect((await screen.findAllByText("All students of the centre")).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Mohan Lal · E003/).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByLabelText("Selected students"));
    // No centre picked yet, so no list; pick one through the select's native form.
    const centreTrigger = screen.getByLabelText("Centre");
    fireEvent.click(centreTrigger);
    fireEvent.click(await screen.findByRole("option", { name: "Begusarai Centre" }));
    fireEvent.click(await screen.findByLabelText("Ram Kumar"));
    fireEvent.click(screen.getByLabelText("Sita Devi"));
    fireEvent.click(screen.getByRole("button", { name: "Assign to 2 student(s)" }));
    await waitFor(() => expect(assignExam).toHaveBeenCalledWith({ examId: "e1", branchId: "b1", studentIds: ["s1", "s2"], courseId: null }, "Head Office"));
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: "Exam assigned" }));
  });

  it("assigns an exam to a whole centre", async () => {
    const AssignExam = await page("@/pages/online-exam/AssignExam");
    render(<MemoryRouter initialEntries={["/online-exam/assign?exam=e1"]}><AssignExam /></MemoryRouter>);
    await screen.findAllByText("All students of the centre");
    fireEvent.click(screen.getByLabelText("Centre"));
    fireEvent.click(await screen.findByRole("option", { name: "Patna Centre" }));
    fireEvent.click(screen.getByRole("button", { name: "Assign to the centre" }));
    await waitFor(() => expect(assignExam).toHaveBeenCalledWith({ examId: "e1", branchId: "b2", studentIds: null, courseId: "c1" }, "Head Office"));
  });

  it("keeps a centre to its own students", async () => {
    auth = centre;
    const AssignExam = await page("@/pages/online-exam/AssignExam");
    render(<MemoryRouter initialEntries={["/online-exam/assign?exam=e1"]}><AssignExam /></MemoryRouter>);
    expect(await screen.findByLabelText("Ram Kumar")).toBeInTheDocument();
    expect(screen.queryByLabelText("Mohan Lal")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Every student of the centre")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Centre")).toBeDisabled();
  });
});

describe("Student Exams", () => {
  it("lists every sitting with its marks and lets a re-attempt be allowed", async () => {
    const StudentExams = await page("@/pages/online-exam/OnlineExamMarks");
    render(<MemoryRouter><StudentExams /></MemoryRouter>);
    expect((await screen.findAllByText("Ram Kumar")).length).toBeGreaterThan(0);
    expect(screen.getAllByText("100%", { exact: false }).length).toBeGreaterThan(0);
    expect(screen.getAllByText("PASS").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Time over").length).toBeGreaterThan(0);
    const row = screen.getAllByText("Sita Devi").map((el) => el.closest("tr")).find(Boolean) as HTMLElement;
    fireEvent.keyDown(within(row).getByRole("button", { name: "Row actions" }), { key: "Enter" });
    fireEvent.click(await screen.findByRole("menuitem", { name: "Close and mark" }));
    await waitFor(() => expect(submitOnlineExam).toHaveBeenCalledWith("a2"));
  });
});

describe("the student's exams", () => {
  it("lists assigned exams with a start button and a finished one with its result", async () => {
    auth = student;
    const MyExams = await page("@/pages/portal/MyExams");
    render(<MemoryRouter><MyExams /></MemoryRouter>);
    expect(await screen.findByText("ADCA Online Test")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Start exam/ })).toHaveAttribute("href", "/me/exams/e1");
    expect(screen.getByText("Typing Test")).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
  });

  it("keeps the office out of the exam room when viewing a student", async () => {
    auth = { ...student, actingAs: { branchId: "b1", name: "Ram Kumar", studentId: "s1" } };
    const MyExams = await page("@/pages/portal/MyExams");
    render(<MemoryRouter><MyExams /></MemoryRouter>);
    expect(await screen.findByText("ADCA Online Test")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start exam" })).toBeDisabled();
  });

  it("opens the paper, takes answers, and hands it in for marking", async () => {
    auth = student;
    const TakeExam = await page("@/pages/portal/TakeExam");
    render(
      <MemoryRouter initialEntries={["/me/exams/e1"]}>
        <Routes><Route path="/me/exams/:examId" element={<TakeExam />} /></Routes>
      </MemoryRouter>,
    );
    expect(await screen.findByText("2 + 2 = ?")).toBeInTheDocument();
    expect(startOnlineExam).toHaveBeenCalledWith("e1");
    fireEvent.click(screen.getByRole("radio", { name: "B 4" }));
    fireEvent.click(screen.getByRole("button", { name: /Next/ }));
    expect(screen.getByText("Capital of Bihar?")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio", { name: "B Gaya" }));
    expect(screen.getByText("2 answered · 0 left")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Finish" }));
    fireEvent.click(await screen.findByRole("button", { name: "Submit now" }));
    await waitFor(() => expect(submitOnlineExam).toHaveBeenCalledWith("a1", { q1: 1, q2: 1 }));
    expect(await screen.findByText("Exam submitted")).toBeInTheDocument();
    expect(screen.getByText("50%", { exact: false })).toBeInTheDocument();
  });

  it("explains when the paper cannot be opened", async () => {
    auth = student;
    startOnlineExam.mockImplementation(() => Promise.reject(new Error("This exam has not been assigned to you.")));
    const TakeExam = await page("@/pages/portal/TakeExam");
    render(
      <MemoryRouter initialEntries={["/me/exams/e1"]}>
        <Routes><Route path="/me/exams/:examId" element={<TakeExam />} /></Routes>
      </MemoryRouter>,
    );
    expect(await screen.findByText("This exam has not been assigned to you.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to my exams" })).toHaveAttribute("href", "/me/exams");
  });

  it("hands the paper in by itself when the clock runs out", async () => {
    auth = student;
    vi.useFakeTimers();
    try {
      startOnlineExam.mockImplementation(() =>
        Promise.resolve({
          attemptId: "a1", examId: "e1", title: "ADCA Online Test", durationMinutes: 30, marksPerQuestion: 1, negativeMarks: 0, passPercentage: 40, showResult: true,
          startedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 1500).toISOString(), answers: { q1: 1 },
          questions: exam.questions.map(({ answer: _answer, ...q }) => q),
        }),
      );
      const TakeExam = await page("@/pages/portal/TakeExam");
      render(
        <MemoryRouter initialEntries={["/me/exams/e1"]}>
          <Routes><Route path="/me/exams/:examId" element={<TakeExam />} /></Routes>
        </MemoryRouter>,
      );
      await act(async () => { await Promise.resolve(); });
      await act(async () => { await Promise.resolve(); });
      expect(screen.getByText("2 + 2 = ?")).toBeInTheDocument();
      await act(async () => { vi.advanceTimersByTime(2100); });
      await act(async () => { await Promise.resolve(); });
      expect(submitOnlineExam).toHaveBeenCalledWith("a1", { q1: 1 });
    } finally {
      vi.useRealTimers();
    }
  });
});
