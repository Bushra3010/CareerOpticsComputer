import { describe, it, expect, vi, beforeEach } from "vitest";

import { designFor, type DocumentTemplate, type TemplateAssignments } from "@/lib/supabase/documentTemplates";
import { designHtml, starterDesign, element, type DocumentDesign } from "@/lib/documentDesigner";
import { photoOf, tokensForRecord } from "@/lib/studentTemplateDocument";

/**
 * Templates the institute designs, and the branch each one belongs to.
 *
 * The designer saved to `localStorage` -- one browser -- and the pages that
 * actually print carried their own hardcoded layouts, so a template drawn at
 * head office reached nobody. These pin down the join: which design a branch
 * prints, and whose face goes on it.
 */
const design = (name: string): DocumentDesign => ({
  ...starterDesign("student-id"),
  background: name,
});

const template = (over: Partial<DocumentTemplate>): DocumentTemplate => ({
  id: "t1",
  organizationId: "org1",
  kind: "student-id",
  name: "Card",
  design: design("#ffffff"),
  isDefault: false,
  ...over,
});

describe("which template a branch prints", () => {
  const assigned: TemplateAssignments = { b1: { "student-id": "t-own" } };
  const library = [
    template({ id: "t-own", name: "Kothrud card", design: design("#111111") }),
    template({ id: "t-default", name: "House card", isDefault: true, design: design("#222222") }),
    template({ id: "t-other", name: "Old card", design: design("#333333") }),
  ];

  it("prints what it was given", () => {
    const { template: chosen } = designFor("student-id", library, assigned, "b1");
    expect(chosen?.name).toBe("Kothrud card");
  });

  it("falls back to the organisation's default for a branch with none", () => {
    const { template: chosen } = designFor("student-id", library, assigned, "b2");
    expect(chosen?.name).toBe("House card");
  });

  it("uses the only one there is, default or not", () => {
    const only = [template({ id: "t-solo", name: "The only card" })];
    const { template: chosen } = designFor("student-id", only, {}, "b2");
    expect(chosen?.name).toBe("The only card");
  });

  it("never leaves a branch unable to print", () => {
    // An empty library is the app before any of this: the starter layout.
    const { template: chosen, design: fallback } = designFor("student-id", [], {}, "b1");
    expect(chosen).toBeNull();
    expect(fallback.elements.length).toBeGreaterThan(0);
  });

  it("does not hand one kind's template to another", () => {
    const { template: chosen } = designFor("certificate", library, assigned, "b1");
    expect(chosen).toBeNull();
  });
});

describe("the student's photograph", () => {
  it("is the passport photo the admission collected", () => {
    expect(
      photoOf({ documents: { passportPhoto: { dataUrl: "data:image/png;base64,FACE" } } }),
    ).toBe("data:image/png;base64,FACE");
  });

  it("falls back to the picture an older record kept", () => {
    // Filed before the admission collected its documents as a set.
    expect(photoOf({ photo: { dataUrl: "data:image/png;base64,OLD" } })).toBe(
      "data:image/png;base64,OLD",
    );
    expect(photoOf({ photo: "data:image/png;base64,BARE" })).toBe("data:image/png;base64,BARE");
  });

  it("is empty for a student who has none, rather than a sample face", () => {
    expect(photoOf({})).toBe("");
    expect(tokensForRecord({ firstName: "Asha" }).photo).toBe("");
  });

  it("goes onto the card the template drew a photo box on", () => {
    const card: DocumentDesign = {
      ...starterDesign("student-id"),
      elements: [element("photo", { x: 10, y: 10, width: 100, height: 120 })],
    };
    const tokens = tokensForRecord({
      firstName: "Asha",
      documents: { passportPhoto: { dataUrl: "data:image/png;base64,FACE" } },
    });

    const html = designHtml("student-id", card, tokens);
    expect(html).toContain("data:image/png;base64,FACE");
    // Cropped to the box: a letterboxed passport photo is not a passport photo.
    expect(html).toContain("object-fit:cover");
  });

  it("draws the empty frame for a student with no photograph", () => {
    const card: DocumentDesign = {
      ...starterDesign("student-id"),
      elements: [element("photo", { x: 10, y: 10, width: 100, height: 120, text: "Photo" })],
    };
    const html = designHtml("student-id", card, tokensForRecord({ firstName: "Asha" }));
    expect(html).not.toContain("<img");
    expect(html).toContain("Photo");
  });
});

describe("what a template can say about a student", () => {
  it("fills the tokens the record answers, and leaves the rest to the sample", () => {
    const tokens = tokensForRecord({
      firstName: "Asha",
      lastName: "Verma",
      enrollmentNo: "ENR-2026-0125",
      bloodGroup: "O+",
    });
    expect(tokens.student_name).toBe("Asha Verma");
    expect(tokens.enrollment_no).toBe("ENR-2026-0125");
    // The id a card is verified by, when the record has no separate one.
    expect(tokens.certificate_id).toBe("ENR-2026-0125");
    expect(tokens.blood_group).toBe("O+");
  });
});
