import { describe, it, expect } from "vitest";
import { academicYearOf, recentAcademicYears } from "@/lib/academicYear";

describe("Academic years", () => {
  it("run April to March", () => {
    expect(academicYearOf("2024-08-10")).toBe("2024-25");
    expect(academicYearOf("2025-02-15")).toBe("2024-25");
    expect(academicYearOf("2025-04-01")).toBe("2025-26");
    expect(academicYearOf("2099-12-31")).toBe("2099-00");
    expect(academicYearOf("")).toBe("");
  });

  it("list a few years back and one ahead, newest first", () => {
    expect(recentAcademicYears("2026-11-19")).toEqual(["2027-28", "2026-27", "2025-26", "2024-25", "2023-24", "2022-23", "2021-22"]);
  });
});
