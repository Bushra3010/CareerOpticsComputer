import { describe, expect, it } from "vitest";
import { moduleOnMarksheet, subjectsFromModules } from "@/lib/examWorkflow";

/**
 * A course's syllabus modules become the subjects its marksheet prints: one
 * per module not yet there, in the syllabus's order, with the marks chosen.
 */
const defaults = { subjectType: "BOTH" as const, theoryMax: 100, theoryMin: 35, practicalMax: 50, practicalMin: 20 };
const modules = [
  { name: "MS Word", sortOrder: 2 },
  { name: "Computer Fundamentals", sortOrder: 1 },
  { name: "Tally", sortOrder: 4, status: "Inactive" },
  { name: "MS Excel", sortOrder: 3 },
];

describe("syllabus modules as marksheet subjects", () => {
  it("makes one subject per active module, in syllabus order, coded by the course", () => {
    const out = subjectsFromModules(modules, [], { courseId: "c1", courseCode: "adca p12", term: 1, defaults });
    expect(out.map((s) => [s.code, s.name, s.sortOrder])).toEqual([
      ["ADCAP12-01", "Computer Fundamentals", 1],
      ["ADCAP12-02", "MS Word", 2],
      ["ADCAP12-03", "MS Excel", 3],
    ]);
    expect(out[0]).toMatchObject({ courseId: "c1", term: 1, subjectType: "BOTH", theoryMax: 100, theoryMin: 35, practicalMax: 50, practicalMin: 20 });
  });

  it("skips modules already on the marksheet, whatever their case, and does not reuse a code", () => {
    const existing = [{ name: "computer fundamentals ", code: "ADCAP12-01" }];
    expect(moduleOnMarksheet("Computer Fundamentals", existing)).toBe(true);
    const out = subjectsFromModules(modules, existing, { courseId: "c1", courseCode: "ADCAP12", term: 1, defaults });
    expect(out.map((s) => [s.code, s.name, s.sortOrder])).toEqual([
      ["ADCAP12-02", "MS Word", 2],
      ["ADCAP12-03", "MS Excel", 3],
    ]);
  });

  it("zeroes the paper the type leaves out, and works without a course code", () => {
    const out = subjectsFromModules([{ name: "Typing", sortOrder: 1 }], [], {
      courseId: "c1",
      term: 2,
      defaults: { ...defaults, subjectType: "PRACTICAL" },
    });
    expect(out).toEqual([
      { courseId: "c1", term: 2, code: "M-01", name: "Typing", subjectType: "PRACTICAL", theoryMax: 0, theoryMin: 0, practicalMax: 50, practicalMin: 20, sortOrder: 1 },
    ]);
  });
});
