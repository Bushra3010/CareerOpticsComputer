import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { canAccess } from "@/lib/navigation";
import type { View } from "@/lib/roles";

/**
 * `ProtectedRoute` gates every authenticated path on `canAccess`. That gate is
 * only as good as the allow-list behind it: a route that no view can reach is
 * dead, and it fails as a blank "Not authorised" card rather than as a build
 * error. So read the routes straight out of App.tsx and assert the two
 * properties that matter, rather than restating the list here where it would
 * drift.
 */
const APP = readFileSync(resolve(__dirname, "../App.tsx"), "utf8");
const ROUTE_PATHS = [...APP.matchAll(/<Route\s+path="([^"]+)"/g)]
  .map((match) => match[1])
  .filter((path) => path !== "*" && path !== "/login");

const VIEWS: View[] = ["admin", "franchise", "student"];

describe("route authorisation", () => {
  it("finds the routes it is meant to be checking", () => {
    expect(ROUTE_PATHS.length).toBeGreaterThan(50);
    expect(ROUTE_PATHS).toContain("/branch/create");
    expect(ROUTE_PATHS).toContain("/me/fees");
  });

  it.each(ROUTE_PATHS)("%s is reachable by at least one view", (path) => {
    expect(VIEWS.some((view) => canAccess(view, path))).toBe(true);
  });

  it("keeps staff out of the student portal", () => {
    expect(canAccess("admin", "/me/fees")).toBe(false);
    expect(canAccess("franchise", "/me/fees")).toBe(false);
    expect(canAccess("student", "/me/fees")).toBe(true);
  });

  it("keeps students out of the back office", () => {
    expect(canAccess("student", "/branch/create")).toBe(false);
    expect(canAccess("student", "/user/all")).toBe(false);
    expect(canAccess("student", "/")).toBe(true);
  });

  it("does not let a trailing slash walk past the gate", () => {
    expect(canAccess("student", "/branch/create/")).toBe(false);
  });
});
