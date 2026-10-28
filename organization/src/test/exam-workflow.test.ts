import { describe, expect, it } from "vitest";
import {
  asExamResults,
  gradeFor,
  isFinalTerm,
  lineFor,
  lineProblem,
  summarise,
  termLabel,
  termPlan,
  termsOf,
  type CourseSubject,
} from "@/lib/examWorkflow";

const subject = (over: Partial<CourseSubject>): CourseSubject => ({
  id: "s",
  courseId: "c",
  term: 1,
  code: "S01",
  name: "Subject",
  subjectType: "BOTH",
  theoryMax: 100,
  theoryMin: 35,
  practicalMax: 100,
  practicalMin: 35,
  sortOrder: 0,
  ...over,
});

describe("terms", () => {
  it("runs a course of a year or less as one term", () => {
    expect(termPlan({ durationValue: 6, durationUnit: "MONTHS" })).toEqual({ type: "SINGLE", count: 1 });
    expect(termPlan({ durationValue: 1, durationUnit: "YEARS" })).toEqual({ type: "SINGLE", count: 1 });
    expect(termsOf({ durationMonths: 12 })).toEqual([{ term: 1, label: "Full Course" }]);
  });

  it("runs a longer course in years unless it says otherwise", () => {
    expect(termPlan({ durationValue: 2, durationUnit: "YEARS" })).toEqual({ type: "YEAR", count: 2 });
    expect(termPlan({ durationMonths: 18 })).toEqual({ type: "YEAR", count: 2 });
    expect(termPlan({ durationMonths: 12, termType: "SEMESTER", termCount: 2 })).toEqual({ type: "SEMESTER", count: 2 });
    expect(termsOf({ termType: "SEMESTER", termCount: 2 }).map((t) => t.label)).toEqual(["1st Semester", "2nd Semester"]);
  });

  it("names terms with ordinals", () => {
    expect([1, 2, 3, 4, 11, 12, 13, 21].map((n) => termLabel("YEAR", n))).toEqual([
      "1st Year", "2nd Year", "3rd Year", "4th Year", "11th Year", "12th Year", "13th Year", "21st Year",
    ]);
  });

  it("knows the final term", () => {
    expect(isFinalTerm({ durationMonths: 24 }, 1)).toBe(false);
    expect(isFinalTerm({ durationMonths: 24 }, 2)).toBe(true);
    expect(isFinalTerm({ durationMonths: 6 }, 1)).toBe(true);
  });
});

describe("marksheet", () => {
  it("passes only when every paper clears its minimum", () => {
    const lines = [
      { ...lineFor(subject({ id: "a", name: "Fundamentals" })), theory: 80, practical: 30 },
      { ...lineFor(subject({ id: "b", name: "Office", subjectType: "THEORY" })), theory: 90 },
    ];
    const s = summarise(lines);
    expect(s.totalObtained).toBe(200);
    expect(s.totalMax).toBe(300);
    expect(s.percentage).toBe(66.67);
    expect(s.result).toBe("FAIL");
    expect(s.grade).toBe("F");
    expect(s.failedSubjects).toEqual(["Fundamentals"]);
  });

  it("grades a pass by percentage", () => {
    const lines = [{ ...lineFor(subject({ subjectType: "PRACTICAL" })), practical: 86 }];
    expect(summarise(lines)).toMatchObject({ result: "PASS", grade: "A+", percentage: 86, totalMax: 100 });
    expect([85, 75, 60, 45, 40].map((p) => gradeFor(p))).toEqual(["A+", "A", "B", "C", "D"]);
  });

  it("drops the paper a subject does not have", () => {
    const line = lineFor(subject({ subjectType: "THEORY", practicalMax: 100 }), { practical: 50, theory: 40 });
    expect(line.practical).toBeNull();
    expect(line.practicalMax).toBe(0);
    expect(line.theory).toBe(40);
  });

  it("asks for missing or out-of-range marks", () => {
    expect(lineProblem(lineFor(subject({ name: "Web" })))).toBe("Enter theory marks for Web.");
    expect(lineProblem({ ...lineFor(subject({ name: "Web" })), theory: 101, practical: 1 })).toBe(
      "Web: theory marks must be between 0 and 100.",
    );
    expect(lineProblem({ ...lineFor(subject({})), theory: 50, practical: 50 })).toBeNull();
  });

  it("feeds the document templates one row per paper", () => {
    const rows = asExamResults(
      [{ term: 1, issueDate: "2026-11-01", marks: [{ ...lineFor(subject({ name: "Web" })), theory: 70, practical: 60 }] }],
      "YEAR",
    );
    expect(rows).toEqual([
      { marks: 70, exam: { name: "1st Year", subject: "Web (Theory)", maxMarks: 100, passMarks: 35, examDate: "2026-11-01", paper: "Theory", base: "Web" } },
      { marks: 60, exam: { name: "1st Year", subject: "Web (Practical)", maxMarks: 100, passMarks: 35, examDate: "2026-11-01", paper: "Practical", base: "Web" } },
    ]);
  });
});
