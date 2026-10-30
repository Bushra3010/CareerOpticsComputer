import { render, screen, waitFor, within } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { canManageCourses } from "@/lib/roles";
import { canAccess } from "@/lib/navigation";

/**
 * Courses belong to the organisation; `branch_courses` decides which of them a
 * branch may run. The navigation already drew that line — no "Create Course"
 * item in the franchise menu, and `/course/create` outside its allow-list — but
 * Courses & batches offered a "New course" button to everyone, and it opened
 * the form inline. The one route the guard protected could be walked around
 * from the page it was protecting.
 */
describe("canManageCourses", () => {
  it("lets the organisation write its own catalogue", () => {
    expect(canManageCourses("SUPER_ADMIN")).toBe(true);
    expect(canManageCourses("ORGANIZATION_ADMIN")).toBe(true);
  });

  it("keeps every branch role out of it", () => {
    for (const role of ["BRANCH_ADMIN", "FRANCHISE", "ACCOUNTANT", "RECEPTIONIST", "TEACHER", "STAFF"]) {
      expect(canManageCourses(role), `${role} must not write courses`).toBe(false);
    }
  });

  it("refuses an unknown or missing role rather than assuming the widest one", () => {
    expect(canManageCourses(undefined)).toBe(false);
    expect(canManageCourses("")).toBe(false);
    expect(canManageCourses("SOMETHING_NEW")).toBe(false);
  });

  it("agrees with the route guard, which is the other half of the same rule", () => {
    expect(canAccess("franchise", "/course/create")).toBe(false);
    expect(canAccess("franchise", "/course/view")).toBe(true);
    // A branch still owns its own cohorts.
    expect(canAccess("franchise", "/course/batch/create")).toBe(true);
  });
});

/* ---------- the page ---------- */

const role = { current: "FRANCHISE" };

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "u1", role: role.current, organizationId: "org1", branchId: "b1" } }),
}));
vi.mock("@/components/layout/AppLayout", () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
/** Held in a box so a test can empty the catalogue without remocking it. */
const catalogue = {
  rows: [
    { id: "c1", name: "ADCA", code: "ADCA12", durationMonths: 12, baseFee: 8500, isActive: true },
  ] as Array<Record<string, unknown>>,
};

vi.mock("@/lib/supabase/data", () => ({
  getCourses: () => Promise.resolve({ success: true, data: catalogue.rows }),
  getBatches: () => Promise.resolve({ success: true, data: [] }),
  getBatchesByOrg: () => Promise.resolve({ success: true, data: [] }),
  getBranches: () => Promise.resolve({ success: true, data: [] }),
  createCourse: vi.fn(),
  createBatch: vi.fn(),
}));
vi.mock("react-router-dom", () => ({ useLocation: () => ({ pathname: "/course/view" }) }));

const AcademicsWorkspace = (await import("@/pages/course/AcademicsWorkspace")).default;

describe("Courses & batches actions", () => {
  it("offers a branch its batches but not the catalogue", () => {
    role.current = "FRANCHISE";
    render(<AcademicsWorkspace />);

    expect(screen.queryByRole("button", { name: /new course/i })).toBeNull();
    // Import writes courses, so it goes the same way.
    expect(screen.queryByRole("button", { name: /^import$/i })).toBeNull();
    expect(screen.getByRole("button", { name: /new batch/i })).toBeInTheDocument();
    // Export only reads; a branch keeps it.
    expect(screen.getByRole("button", { name: /export/i })).toBeInTheDocument();
  });

  it("leaves the organisation admin every action", () => {
    role.current = "ORGANIZATION_ADMIN";
    render(<AcademicsWorkspace />);

    expect(screen.getByRole("button", { name: /new course/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^import$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /new batch/i })).toBeInTheDocument();
  });

  /* The registers are tables now, so the row's actions live behind its menu
     rather than as buttons on the row itself. What is being asserted is the
     same: a branch is offered no way in. */
  /** jsdom applies no CSS, so the responsive card list renders beside the
   *  table and every name appears twice. The courses table is the first one.
   *
   *  Waited on by its contents, not by the table: the empty table is in the
   *  DOM before the courses load, so finding the element is not the same as
   *  the row being there. */
  const coursesTable = async (rowText = "ADCA") => {
    await waitFor(() =>
      expect(within(screen.getAllByRole("table")[0]).getByText(rowText)).toBeInTheDocument(),
    );
    return screen.getAllByRole("table")[0];
  };

  /**
   * The row's actions menu, or null when the row offers none.
   *
   * Its contents are not asserted: Radix opens on a real pointer event that
   * jsdom does not produce, and what the menu holds is `DataTable`'s rendering
   * of the `actions` array rather than this page's rule. The rule is whether
   * the row offers a way in at all, which is exactly what this returns.
   */
  const rowMenu = async (rowText: string) => {
    const row = within(await coursesTable(rowText)).getByText(rowText).closest("tr") as HTMLElement;
    return within(row).queryByRole("button");
  };

  // A branch could open the course edit form and only find out at save that it
  // was not allowed to write it.
  it("gives a branch no way to edit or delete a course it was assigned", async () => {
    role.current = "FRANCHISE";
    render(<AcademicsWorkspace />);

    expect(within(await coursesTable()).getByText("ADCA")).toBeInTheDocument();
    // The course is listed, and the row offers no way to act on it.
    expect(await rowMenu("ADCA")).toBeNull();
  });

  it("keeps both for the organisation, whose catalogue it is", async () => {
    role.current = "ORGANIZATION_ADMIN";
    render(<AcademicsWorkspace />);

    expect(await rowMenu("ADCA")).not.toBeNull();
  });

  it("tells a branch where its courses come from instead of pointing at a button it cannot see", async () => {
    catalogue.rows = [];
    role.current = "FRANCHISE";
    render(<AcademicsWorkspace />);

    expect((await screen.findAllByText(/assigned to this branch/i)).length).toBeGreaterThan(0);
  });
});
