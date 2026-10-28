import { describe, expect, it } from "vitest";
import {
  examPhase,
  examProblem,
  formatClock,
  maxScore,
  parseAnswer,
  questionCount,
  questionProblem,
  questionsFromRows,
  scoreAttempt,
  secondsLeft,
  type ExamQuestion,
} from "@/lib/onlineExam";
import { canAccess, canAccessWithRole, pagePermissionPaths } from "@/lib/navigation";

const q = (id: string, answer: number, marks?: number | null): ExamQuestion => ({
  id,
  text: `Question ${id}`,
  options: ["A", "B", "C", "D"],
  answer,
  marks: marks ?? null,
});

/**
 * Online exams are marked the same way in the browser and in the database:
 * the question's marks for a right answer, minus the negative marks for a
 * wrong one, nothing for a blank -- and never below zero.
 */
describe("online exam marking", () => {
  const settings = { marksPerQuestion: 2, negativeMarks: 0.5, passPercentage: 40 };

  it("adds right answers, deducts wrong ones and ignores blanks", () => {
    const summary = scoreAttempt([q("1", 0), q("2", 1), q("3", 2), q("4", 3)], { "1": 0, "2": 2, "3": "2" }, settings);
    expect(summary).toMatchObject({ totalQuestions: 4, attempted: 3, correct: 2, wrong: 1, score: 3.5, maxScore: 8, percentage: 43.75, result: "PASS" });
  });

  it("uses a question's own marks over the exam's", () => {
    const summary = scoreAttempt([q("1", 0, 5), q("2", 0)], { "1": 0, "2": 0 }, settings);
    expect(summary.score).toBe(7);
    expect(summary.maxScore).toBe(7);
    expect(summary.percentage).toBe(100);
  });

  it("never scores below zero and fails under the pass mark", () => {
    const summary = scoreAttempt([q("1", 0), q("2", 0)], { "1": 1, "2": 1 }, { ...settings, negativeMarks: 3 });
    expect(summary.score).toBe(0);
    expect(summary.result).toBe("FAIL");
  });

  it("counts how many questions a student gets and the most they can score", () => {
    const questions = [q("1", 0), q("2", 0, 3), q("3", 0)];
    expect(questionCount({ totalQuestions: 0, questions })).toBe(3);
    expect(questionCount({ totalQuestions: 2, questions })).toBe(2);
    expect(questionCount({ totalQuestions: 9, questions })).toBe(3);
    expect(maxScore({ totalQuestions: 0, questions, marksPerQuestion: 1 })).toBe(5);
    expect(maxScore({ totalQuestions: 2, questions, marksPerQuestion: 1 })).toBe(2);
  });
});

describe("online exam checks", () => {
  it("refuses a question with no wording, an empty or repeated option, or no answer", () => {
    expect(questionProblem({ ...q("1", 0), text: " " })).toMatch(/wording/);
    expect(questionProblem({ ...q("1", 0), options: ["A", "", "C", "D"] })).toMatch(/empty option/);
    expect(questionProblem({ ...q("1", 0), options: ["A", "a", "C", "D"] })).toMatch(/repeats/);
    expect(questionProblem(q("1", 4))).toMatch(/right answer/);
    expect(questionProblem(q("1", 1))).toBeNull();
  });

  it("refuses an exam with no title, a window that closes before it opens, or no questions unless a draft", () => {
    const base = { title: "Test", durationMinutes: 30, marksPerQuestion: 1, negativeMarks: 0, passPercentage: 40, totalQuestions: 0, status: "PUBLISHED" as const, questions: [q("1", 0)] };
    expect(examProblem({ ...base, title: "" })).toMatch(/title/);
    expect(examProblem({ ...base, startAt: "2026-11-02T10:00", endAt: "2026-11-01T10:00" })).toMatch(/close after/);
    expect(examProblem({ ...base, questions: [] })).toMatch(/at least one question/);
    expect(examProblem({ ...base, questions: [], status: "DRAFT" })).toBeNull();
    expect(examProblem(base)).toBeNull();
  });

  it("knows where an exam is in its life", () => {
    const now = new Date("2026-10-21T10:00:00Z");
    expect(examPhase({ status: "DRAFT", startAt: "", endAt: "" }, now)).toBe("DRAFT");
    expect(examPhase({ status: "CLOSED", startAt: "", endAt: "" }, now)).toBe("CLOSED");
    expect(examPhase({ status: "PUBLISHED", startAt: "2026-10-22T10:00:00Z", endAt: "" }, now)).toBe("UPCOMING");
    expect(examPhase({ status: "PUBLISHED", startAt: "", endAt: "2026-10-20T10:00:00Z" }, now)).toBe("ENDED");
    expect(examPhase({ status: "PUBLISHED", startAt: "2026-10-20T10:00:00Z", endAt: "2026-10-22T10:00:00Z" }, now)).toBe("LIVE");
    expect(examPhase({ status: "PUBLISHED", startAt: "", endAt: "" }, now)).toBe("LIVE");
  });

  it("runs the clock down to zero and shows it as minutes and seconds", () => {
    const at = new Date("2026-10-21T10:00:00Z").getTime();
    expect(secondsLeft("2026-10-21T10:01:30Z", at)).toBe(90);
    expect(secondsLeft("2026-10-21T09:59:00Z", at)).toBe(0);
    expect(formatClock(90)).toBe("01:30");
    expect(formatClock(3725)).toBe("1:02:05");
  });

  it("reads a sheet of questions, however the answer is written", () => {
    const options = ["Red", "Green", "Blue"];
    expect(parseAnswer("B", options)).toBe(1);
    expect(parseAnswer("3", options)).toBe(2);
    expect(parseAnswer("green", options)).toBe(1);
    expect(parseAnswer("Z", options)).toBe(-1);
    const { questions, problems } = questionsFromRows([
      { Question: "Sky colour?", "Option 1": "Red", "Option 2": "Blue", "Option 3": "Green", "Option 4": "Black", Answer: "B", Marks: "2" },
      { Question: "", "Option 1": "x", "Option 2": "y", "Option 3": "", "Option 4": "", Answer: "A", Marks: "" },
      { question: "True or false: 2+2=4", a: "True", b: "False", c: "", d: "", answer: "a", marks: "" },
    ]);
    expect(questions).toHaveLength(2);
    expect(questions[0]).toMatchObject({ text: "Sky colour?", options: ["Red", "Blue", "Green", "Black"], answer: 1, marks: 2 });
    expect(questions[1]).toMatchObject({ options: ["True", "False"], answer: 0, marks: null });
    expect(problems).toEqual([expect.stringMatching(/^Row 3: .*wording/)]);
  });
});

/**
 * The exam room lives under the student's Online Exams page: a path nested
 * one level below a menu page opens with that page's permission, and nothing
 * else gets in by looking like one.
 */
describe("nested page paths", () => {
  it("lets a student into the exam room through the Online Exams page", () => {
    expect(canAccess("student", "/me/exams")).toBe(true);
    expect(canAccess("student", "/me/exams/abc-123")).toBe(true);
    expect(pagePermissionPaths("student", "/me/exams/abc-123")).toEqual(["/me/exams"]);
    expect(canAccessWithRole("student", "/me/exams/abc-123", ["/me/exams"])).toBe(true);
    expect(canAccessWithRole("student", "/me/exams/abc-123", ["/me/results"])).toBe(false);
  });

  it("does not open anything deeper, or under a page the view lacks", () => {
    expect(canAccess("student", "/me/exams/abc/def")).toBe(false);
    expect(canAccess("student", "/branch/create/x")).toBe(false);
    expect(canAccess("franchise", "/online-exam/create/x")).toBe(true);
    expect(canAccess("franchise", "/branch/create/x")).toBe(false);
  });

  it("puts the centre's online exam pages in the franchise menu", () => {
    expect(canAccess("franchise", "/online-exam/assign")).toBe(true);
    expect(canAccess("franchise", "/online-exam/marks")).toBe(true);
    expect(canAccess("franchise", "/online-exam/add-questions")).toBe(false);
  });
});
