import { describe, it, expect } from "vitest";

import {
  buildSyllabus,
  filterSyllabus,
  nextOrder,
  safeUrl,
  studyLinkCount,
  syllabusProblem,
} from "@/lib/syllabus";
import type { SyllabusChapter, SyllabusModule } from "@/lib/supabase/data";

const mod = (id: string, sortOrder: number, over: Partial<SyllabusModule> = {}): SyllabusModule => ({
  id,
  courseId: "c1",
  name: `Module ${id}`,
  description: "",
  sortOrder,
  status: "Active",
  ...over,
});

const chap = (id: string, moduleId: string, sortOrder: number, over: Partial<SyllabusChapter> = {}): SyllabusChapter => ({
  id,
  moduleId,
  courseId: "c1",
  name: `Chapter ${id}`,
  description: "",
  practical: "",
  pdfUrl: "",
  videoUrl: "",
  sortOrder,
  status: "Active",
  ...over,
});

describe("buildSyllabus", () => {
  it("nests chapters under their module, in teaching order", () => {
    const sections = buildSyllabus(
      [mod("m2", 2), mod("m1", 1)],
      [chap("c2", "m1", 2), chap("c1", "m1", 1), chap("c3", "m2", 1)],
    );

    expect(sections.map((s) => s.module.id)).toEqual(["m1", "m2"]);
    expect(sections[0].chapters.map((c) => c.id)).toEqual(["c1", "c2"]);
  });

  it("keeps a module with no chapters, since that is one still to be filled", () => {
    const sections = buildSyllabus([mod("m1", 1)], []);
    expect(sections).toHaveLength(1);
    expect(sections[0].chapters).toEqual([]);
  });

  // Two sections given the same number still have to come out in a fixed order.
  it("breaks a tie on the name rather than leaving it to chance", () => {
    const sections = buildSyllabus([mod("b", 1, { name: "Beta" }), mod("a", 1, { name: "Alpha" })], []);
    expect(sections.map((s) => s.module.name)).toEqual(["Alpha", "Beta"]);
  });

  it("drops a chapter whose module is not in the list", () => {
    const sections = buildSyllabus([mod("m1", 1)], [chap("c1", "gone", 1)]);
    expect(sections[0].chapters).toEqual([]);
  });
});

describe("filterSyllabus", () => {
  const sections = buildSyllabus(
    [mod("m1", 1, { name: "MS Excel" }), mod("m2", 2, { name: "MS Word" })],
    [
      chap("c1", "m1", 1, { name: "Basic formulas" }),
      chap("c2", "m1", 2, { name: "Pivot tables", status: "Inactive" }),
      chap("c3", "m2", 1, { name: "Mail merge" }),
    ],
  );

  it("returns everything when nothing is asked", () => {
    expect(filterSyllabus(sections)).toHaveLength(2);
  });

  // Searching for a section means wanting to see what is in it.
  it("keeps a matching module whole", () => {
    const found = filterSyllabus(sections, { search: "excel" });
    expect(found).toHaveLength(1);
    expect(found[0].chapters).toHaveLength(2);
  });

  it("keeps a module only for the chapters that matched", () => {
    const found = filterSyllabus(sections, { search: "mail merge" });
    expect(found).toHaveLength(1);
    expect(found[0].module.name).toBe("MS Word");
    expect(found[0].chapters.map((c) => c.name)).toEqual(["Mail merge"]);
  });

  it("narrows by status", () => {
    const active = filterSyllabus(sections, { status: "Active" });
    expect(active.flatMap((s) => s.chapters).map((c) => c.name)).toEqual([
      "Basic formulas",
      "Mail merge",
    ]);

    const inactive = filterSyllabus(sections, { status: "Inactive" });
    expect(inactive.flatMap((s) => s.chapters).map((c) => c.name)).toEqual(["Pivot tables"]);
  });

  it("finds nothing rather than everything when a search matches nothing", () => {
    expect(filterSyllabus(sections, { search: "astrophysics" })).toEqual([]);
  });
});

describe("nextOrder", () => {
  it("carries on from the highest, not from the count", () => {
    // Deleting the middle of a list must not hand out a number already used.
    expect(nextOrder([{ sortOrder: 1 }, { sortOrder: 7 }])).toBe(8);
    expect(nextOrder([])).toBe(1);
  });
});

describe("studyLinkCount", () => {
  it("counts a chapter once whether it has notes, a video or both", () => {
    expect(
      studyLinkCount([
        chap("1", "m1", 1, { pdfUrl: "https://x/notes.pdf" }),
        chap("2", "m1", 2, { videoUrl: "https://x/v" }),
        chap("3", "m1", 3, { pdfUrl: "https://x/n", videoUrl: "https://x/v" }),
        chap("4", "m1", 4),
      ]),
    ).toBe(3);
  });
});

describe("syllabusProblem", () => {
  it("passes something named and numbered", () => {
    expect(syllabusProblem({ name: "MS Excel", sortOrder: 1 })).toBeNull();
  });

  it("names what is wrong", () => {
    expect(syllabusProblem({ name: "  ", sortOrder: 1 })).toMatch(/name/i);
    expect(syllabusProblem({ name: "X", sortOrder: 0 })).toMatch(/1 or more/i);
    expect(syllabusProblem({ name: "X", sortOrder: Number.NaN })).toMatch(/1 or more/i);
  });
});

describe("safeUrl", () => {
  it("passes a real address through", () => {
    expect(safeUrl("https://example.com/notes.pdf")).toBe("https://example.com/notes.pdf");
    expect(safeUrl("  http://example.com  ")).toBe("http://example.com/");
  });

  // A half-typed address renders a link that goes nowhere; `javascript:` is
  // worse than useless on a page that prints what a branch typed in.
  it("refuses anything that is not a web address", () => {
    expect(safeUrl("")).toBeNull();
    expect(safeUrl("example.com/notes.pdf")).toBeNull();
    expect(safeUrl("javascript:alert(1)")).toBeNull();
    expect(safeUrl("data:text/html,<script>")).toBeNull();
  });
});

describe("several links per chapter", () => {
  it("reads one link per line, and a single old link as a list of one", async () => {
    const { splitLinks, joinLinks, safeLinks, badLink } = await import("@/lib/syllabus");
    expect(splitLinks("https://x/a.pdf")).toEqual(["https://x/a.pdf"]);
    expect(splitLinks("https://x/a.pdf\nhttps://x/b.pdf\n")).toEqual(["https://x/a.pdf", "https://x/b.pdf"]);
    expect(splitLinks("")).toEqual([]);
    expect(joinLinks([" https://x/a.pdf ", "", "https://x/b.pdf"])).toBe("https://x/a.pdf\nhttps://x/b.pdf");
    // Only real web addresses become links.
    expect(safeLinks("https://x/a.pdf\njavascript:alert(1)\nhttps://x/b.pdf")).toEqual(["https://x/a.pdf", "https://x/b.pdf"]);
    expect(badLink(["https://x/a.pdf", "", "x/b.pdf"])).toBe(2);
    expect(badLink(["https://x/a.pdf", ""])).toBeNull();
  });

  it("counts a chapter with any of its links as having study material", () => {
    expect(studyLinkCount([chap("1", "m1", 1, { pdfUrl: "https://x/a\nhttps://x/b" }), chap("2", "m1", 2, { videoUrl: "nope" })])).toBe(1);
  });
});
