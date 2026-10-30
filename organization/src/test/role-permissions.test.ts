import { describe, it, expect } from "vitest";

import { canAccess, canAccessWithRole, menuFor, modulesForView, permissionsForView } from "@/lib/navigation";

/**
 * Roles used to decide one thing only: which of the three views a person got.
 * An accountant, a receptionist and a teacher were therefore handed the same
 * branch menu, and choosing between them at Add User changed nothing at all.
 *
 * A role now carries the pages it may open. What this file pins down is the
 * boundary: the list narrows a view, it can never widen one, and a role with
 * no list of its own behaves exactly as every account did before.
 */
describe("a role's own menu", () => {
  it("gives the whole view to a role that was never narrowed", () => {
    // Every account had no list until an administrator made one, and none of
    // them should have lost a page the day roles arrived.
    expect(canAccessWithRole("franchise", "/student/view", [])).toBe(true);
    expect(canAccessWithRole("franchise", "/fee/collection", null)).toBe(true);
    expect(menuFor("franchise", []).length).toBe(menuFor("franchise", null).length);
  });

  it("opens only what it was granted, once it has been narrowed", () => {
    const accounts = ["/fee/collection", "/fee/due-collection"];
    expect(canAccessWithRole("franchise", "/fee/collection", accounts)).toBe(true);
    expect(canAccessWithRole("franchise", "/student/view", accounts)).toBe(false);
  });

  it("cannot be granted a page its view was never authorised for", () => {
    // The ceiling is the view, which is the line the database keeps too: a
    // branch role handed an organisation page would be refused the data anyway.
    expect(canAccess("franchise", "/branch/create")).toBe(false);
    expect(canAccessWithRole("franchise", "/branch/create", ["/branch/create"])).toBe(false);
    expect(canAccessWithRole("student", "/user/all", ["/user/all"])).toBe(false);
  });

  it("keeps the landing page, so a narrowed role is not locked out of its own home", () => {
    expect(canAccessWithRole("franchise", "/", ["/fee/collection"])).toBe(true);
  });

  it("refuses a menu page that was not ticked, even to someone who knows the URL", () => {
    expect(canAccessWithRole("admin", "/student/view", ["/fee/collection"])).toBe(false);
  });

  it("carries a path no picker can offer only with the page it belongs to", () => {
    // `/student/add` is what New admission and Edit open; it is on no menu,
    // so it follows Admission Form or View Students -- not any student page.
    expect(canAccessWithRole("admin", "/student/add", ["/student/admission-form"])).toBe(true);
    expect(canAccessWithRole("admin", "/student/add", ["/student/view"])).toBe(true);
    expect(canAccessWithRole("admin", "/student/add", ["/student/passout"])).toBe(false);
    expect(canAccessWithRole("admin", "/student/add", ["/fee/collection"])).toBe(false);
    expect(canAccessWithRole("franchise", "/exam/create", ["/exam/schedule"])).toBe(true);
    expect(canAccessWithRole("franchise", "/exam/create", ["/exam/admit-cards"])).toBe(false);
  });

  it("opens no page by its URL that a narrowed branch role was not given", () => {
    // These used to open for every branch role whatever was ticked.
    const narrowed = ["/fee/collection"];
    for (const path of ["/exam/create", "/exam/assign-marks", "/marksheet/generate", "/documents/designer", "/certificate/template", "/reception/visitors"]) {
      expect(canAccessWithRole("franchise", path, narrowed)).toBe(false);
    }
  });

  it("opens nothing but the landing page for a role saved with nothing ticked", () => {
    // Access Control stores "nothing ticked" as the landing page alone; an empty
    // list would have meant the whole view.
    expect(canAccessWithRole("franchise", "/", ["/"])).toBe(true);
    expect(canAccessWithRole("franchise", "/student/view", ["/"])).toBe(false);
    expect(canAccessWithRole("franchise", "/student/add", ["/"])).toBe(false);
    expect(menuFor("franchise", ["/"])).toEqual([]);
  });

  it("gives a sibling path the actions ticked for its page", () => {
    const perms = permissionsForView("franchise", { "/exam/schedule": ["print"] }, ["/exam/schedule"]);
    expect(perms["/exam/create"]).toEqual(["print"]);
    // View Students view-only, Admission Form not granted: the edit screen is view-only too.
    const students = permissionsForView("franchise", { "/student/view": [] }, ["/student/view"]);
    expect(students["/student/add"]).toEqual([]);
  });

  it("lets a branch role schedule live classes only when Live Class Setup is ticked", () => {
    // A branch could see View Live Classes but its Schedule Class button led to
    // "Not authorised"; Live Class Setup is now a page of its own to tick.
    expect(modulesForView("franchise").flatMap((g) => g.items.map((i) => i.url))).toContain("/live-class/setup");
    expect(canAccessWithRole("franchise", "/live-class/setup", [])).toBe(true);
    expect(canAccessWithRole("franchise", "/live-class/setup", ["/live-class/view", "/live-class/setup"])).toBe(true);
    expect(canAccessWithRole("franchise", "/live-class/setup", ["/live-class/view"])).toBe(false);
  });

  it("drops a group whose every page was withheld, rather than leaving it empty", () => {
    const menu = menuFor("franchise", ["/fee/collection"]);
    expect(menu).toHaveLength(1);
    expect(menu[0].items.map((item) => item.url)).toEqual(["/fee/collection"]);
  });
});

describe("the pages an administrator can tick", () => {
  it("offers a view's real menu, grouped as the sidebar groups it", () => {
    const groups = modulesForView("franchise");
    expect(groups.length).toBeGreaterThan(0);
    const urls = groups.flatMap((group) => group.items.map((item) => item.url));
    // Only pages that view can actually open are offered.
    expect(urls.every((url) => canAccess("franchise", url))).toBe(true);
    expect(urls).toContain("/fee/collection");
    expect(urls).not.toContain("/branch/create");
  });
});
