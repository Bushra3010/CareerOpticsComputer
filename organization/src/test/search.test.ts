import { describe, expect, it } from "vitest";
import { matchesSearch } from "@/lib/search";

describe("matchesSearch", () => {
  const name = "Abhishek  Gupta · APP-2026-0012";
  it("finds a name typed in full, whatever the stored spacing, case or word order", () => {
    for (const q of ["abhishek gupta", "  ABHISHEK   gupta ", "gupta abhishek", "abhi 0012", ""]) expect(matchesSearch(name, q)).toBe(true);
  });
  it("needs every word typed", () => {
    expect(matchesSearch(name, "abhishek kumar")).toBe(false);
    expect(matchesSearch(null, "x")).toBe(false);
  });
});
