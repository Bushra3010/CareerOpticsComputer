import { describe, it, expect, vi } from "vitest";

import { marksheetGrade, marksheetRows, marksheetSummary, type StudentDocument } from "@/lib/documents";
import { asExamResults } from "@/lib/examWorkflow";

/** jsPDF's save() reaches for the browser, and it copies its API onto each
 *  instance, so an own `save` shadows a subclass method — reassign it after
 *  super() to keep the generator running headless. */
vi.mock("jspdf", async () => {
  const actual = await vi.importActual<typeof import("jspdf")>("jspdf");
  class Headless extends actual.jsPDF {
    constructor(...args: ConstructorParameters<typeof actual.jsPDF>) {
      super(...args);
      (this as unknown as { save: unknown }).save = () => this;
    }
  }
  return { ...actual, jsPDF: Headless, default: Headless };
});

const { marksheetPdf } = await import("@/lib/documents");

const paper = (marks: number, maxMarks: number, passMarks: number, subject = "Paper") => ({
  marks,
  exam: { name: subject, subject, maxMarks, passMarks, examDate: "" },
});

describe("marksheetSummary", () => {
  it("totals the marks and the marks available", () => {
    const { total, max } = marksheetSummary([paper(33, 100, 33), paper(26, 50, 17)]);
    expect(total).toBe(59);
    expect(max).toBe(150);
  });

  it("passes a candidate who cleared every paper's own minimum", () => {
    expect(
      marksheetSummary([paper(33, 100, 33), paper(26, 50, 17), paper(239, 250, 150)]).result,
    ).toBe("Pass");
  });

  // The judgement the whole sheet turns on: a candidate can total far above the
  // sum of the minimums and still have failed a paper.
  it("fails a candidate who missed one paper, however high the total", () => {
    const { total, result } = marksheetSummary([
      paper(98, 100, 33),
      paper(10, 50, 17),
      paper(248, 250, 150),
    ]);
    expect(total).toBe(356);
    expect(result).toBe("Fail");
  });

  it("passes a candidate sitting exactly on the minimum", () => {
    expect(marksheetSummary([paper(33, 100, 33)]).result).toBe("Pass");
  });

  it("reports no results as awaited rather than as a fail", () => {
    expect(marksheetSummary([])).toEqual({ total: 0, max: 0, result: "Awaited" });
  });
});

/* ---------- the generator ---------- */

const base: StudentDocument = {
  firstName: "Krishna",
  lastName: "Singh",
  enrollmentNo: "IDS/2026/0003",
  applicationNo: "APP-2026-0003",
  admissionDate: "2026-09-11",
  branch: { name: "Patna Branch", phone: "", email: "", organization: { name: "Career Optics Computer Centre" } },
  feeInvoices: [],
  examResults: [paper(33, 100, 33), paper(26, 50, 17)],
};

describe("parentage on the documents", () => {
  // The admission records S/o, D/o or W/o; before this every document assumed
  // one of them by printing a fixed "Father/Guardian" label.
  it("renders a marksheet that carries the parentage", async () => {
    await expect(
      marksheetPdf({ ...base, parentage: "Wife of", fatherName: "Ram Singh" }),
    ).resolves.toBeUndefined();
  });

  it("renders one that has none, falling back to the neutral label", async () => {
    await expect(
      marksheetPdf({ ...base, parentage: undefined, fatherName: "Ram Singh" }),
    ).resolves.toBeUndefined();
  });

  it("renders a certificate with and without it", async () => {
    const { certificatePdf } = await import("@/lib/documents");
    await expect(certificatePdf({ ...base, parentage: "Daughter of", fatherName: "Ram Singh" })).resolves.toBeUndefined();
    // Half of it is not enough to print a line: "Son of" with no name reads
    // as a mistake on a certificate somebody keeps.
    await expect(certificatePdf({ ...base, parentage: "Son of", fatherName: "" })).resolves.toBeUndefined();
  });
});

describe("marksheetPdf", () => {
  it("renders for a student with nothing configured beyond their name", async () => {
    // The bare sheet is the one that broke: with no heading lines the title
    // block was short and the particulars were drawn over the photograph.
    await expect(
      marksheetPdf({ ...base, enrollmentNo: undefined, examResults: [] }),
    ).resolves.toBeUndefined();
  });

  it("renders with every heading, a photograph and a logo supplied", async () => {
    const pixel =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
    await expect(
      marksheetPdf({
        ...base,
        photo: pixel,
        rollNo: "2201",
        fatherName: "Ram Singh",
        dateOfBirth: "12 Mar 2007",
        course: { name: "ADCA AI", code: "ADCA-AI" },
        branch: { ...base.branch, logo: pixel, address: "Kankarbagh, Patna" },
        awarding: {
          body: "Board of Examinations",
          scheme: "Computer Training Scheme",
          session: "Session 2026-27",
          examination: "Year 1 (Annual Examination)",
          examMonthYear: "Sep-2026",
          notes: ["Note: minimum pass marks are 33%."],
          signatory: "Controller of Examinations",
        },
      }),
    ).resolves.toBeUndefined();
  });

  it("survives an image that will not decode, rather than losing the sheet", async () => {
    await expect(
      marksheetPdf({ ...base, photo: "data:image/png;base64,not-a-real-image" }),
    ).resolves.toBeUndefined();
  });

  it("puts several students' marksheets in one file", async () => {
    const { marksheetsPdf } = await import("@/lib/documents");
    await expect(marksheetsPdf([base, { ...base, firstName: "Sita" }], "marksheets-2")).resolves.toBeUndefined();
  });

  it("runs a long list of papers onto further pages", async () => {
    const many = Array.from({ length: 40 }, (_, i) => paper(40, 50, 20, `Paper ${i + 1}`));
    await expect(marksheetPdf({ ...base, examResults: many })).resolves.toBeUndefined();
  });
});

describe("marksheetRows", () => {
  const line = (name: string, subjectType: "THEORY" | "PRACTICAL" | "BOTH", theory: number | null, practical: number | null) => ({
    subjectId: name, code: name, name, subjectType, theoryMax: 50, theoryMin: 35, practicalMax: 50, practicalMin: 35, theory, practical,
  });

  // The printed sheet reads a subject across one line: theory, practical, total.
  it("puts a subject's theory and practical papers on one row", () => {
    const results = asExamResults(
      [{ term: 1, issueDate: "2026-10-22", marks: [line("Fundamental", "BOTH", 42, 45), line("Tally", "THEORY", 40, null), line("Lab", "PRACTICAL", null, 38)] as never }],
      "YEAR",
    );
    expect(marksheetRows(results)).toEqual([
      { subject: "Fundamental", theory: { marks: 42, max: 50 }, practical: { marks: 45, max: 50 }, total: { marks: 87, max: 100 } },
      { subject: "Tally", theory: { marks: 40, max: 50 }, total: { marks: 40, max: 50 } },
      { subject: "Lab", practical: { marks: 38, max: 50 }, total: { marks: 38, max: 50 } },
    ]);
  });

  it("reads the paper from the name when the kind is not carried", () => {
    expect(marksheetRows([paper(30, 50, 17, "MS Word (Theory)"), paper(44, 50, 17, "MS Word (Practical)")].map((r) => ({ ...r, exam: { ...r.exam, name: "1st Year" } })))).toEqual([
      { subject: "MS Word", theory: { marks: 30, max: 50 }, practical: { marks: 44, max: 50 }, total: { marks: 74, max: 100 } },
    ]);
  });

  it("grades by percentage, and a failed paper is an F", () => {
    expect(marksheetGrade(85.88, true)).toBe("A+");
    expect(marksheetGrade(62, true)).toBe("B");
    expect(marksheetGrade(95, false)).toBe("F");
  });
});
