import { describe, it, expect } from "vitest";

import { DROPDOWN_DEFAULTS, DROPDOWN_TITLES } from "@/lib/dropdownOptions";
import { STUDENT_OPTIONAL_COLUMNS } from "@/lib/supabase/studentFee";

/**
 * Certificates read "Krishna Singh, S/o Ram Singh", and a married woman is
 * named "W/o" rather than "D/o" — which the admission form had no way to
 * record, so every document had to assume one of them.
 */
describe("parentage and marital status", () => {
  it("offers the three ways a student is named on their paperwork", () => {
    expect(DROPDOWN_DEFAULTS.parentage).toEqual(["Son of", "Daughter of", "Wife of"]);
  });

  it("offers both marital states", () => {
    expect(DROPDOWN_DEFAULTS.maritalStatus).toEqual(["Single", "Married"]);
  });

  // `guardianRelation` is the local guardian's relation to the student — a
  // different question, and the reason this is a list of its own.
  it("stays separate from the local guardian's relation", () => {
    expect(DROPDOWN_DEFAULTS.guardianRelation).not.toContain("Son of");
    expect(DROPDOWN_DEFAULTS.parentage).not.toContain("Uncle");
  });

  it("is titled for the picker that manages it", () => {
    expect(DROPDOWN_TITLES.parentage).toBe("Parentage");
    expect(DROPDOWN_TITLES.maritalStatus).toBe("Marital status");
  });

  // Both columns arrive with add-student-parentage.sql. Until it is run, the
  // admission has to save without them rather than fail outright.
  it("is droppable, so an unmigrated database still takes the admission", () => {
    expect(STUDENT_OPTIONAL_COLUMNS).toContain("parentage");
    expect(STUDENT_OPTIONAL_COLUMNS).toContain("maritalStatus");
  });
});
