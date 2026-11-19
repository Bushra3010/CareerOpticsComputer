import { describe, it, expect } from "vitest";
import { canAccess, pagePermissionPaths } from "@/lib/navigation";

/** The eye button on a centre's student list opens /centre/student-view. */
describe("A franchise opening one of its students", () => {
  it("may open the student's page from its student list", () => {
    expect(canAccess("franchise", "/centre/student-view")).toBe(true);
  });

  it("is held to the student list's permissions there", () => {
    expect(pagePermissionPaths("franchise", "/centre/student-view")).toContain("/centre/students");
  });
});
