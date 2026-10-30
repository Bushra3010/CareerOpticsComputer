/**
 * Three product views live inside one app. Which one a person gets is decided
 * by the account they sign in with: the backend hands back a `SystemRole` and
 * every role maps onto exactly one view. Nothing in the signed-in UI lets a
 * user switch views — authorisation happens at the login, once.
 */
export type View = "admin" | "franchise" | "student";

export const VIEWS: Record<
  View,
  { label: string; short: string; description: string; home: string }
> = {
  admin: {
    label: "Organisation admin",
    short: "Admin",
    description: "Every branch, every module — settings, users and partners included.",
    home: "/",
  },
  franchise: {
    label: "Franchise / branch",
    short: "Franchise",
    description: "One branch: its admissions, fees, attendance, wallet and results.",
    home: "/",
  },
  student: {
    label: "Student",
    short: "Student",
    description: "Your own classes, attendance, fees, results and documents.",
    home: "/me",
  },
};

/**
 * Backend `SystemRole` → the view that role is authorised for. Branch-level
 * staff share the franchise view; an unrecognised role falls to the narrowest
 * view rather than the widest one.
 */
const ROLE_VIEWS: Record<string, View> = {
  SUPER_ADMIN: "admin",
  ORGANIZATION_ADMIN: "admin",
  BRANCH_ADMIN: "franchise",
  FRANCHISE: "franchise",
  ACCOUNTANT: "franchise",
  RECEPTIONIST: "franchise",
  TEACHER: "franchise",
  STAFF: "franchise",
  STUDENT: "student",
};

export const viewForRole = (role?: string | null): View =>
  ROLE_VIEWS[(role ?? "").toUpperCase()] ?? "student";

/**
 * Who may hand a student their portal login. The branch that enrolled the
 * student can, as well as the organisation — but not the rest of the branch
 * staff, who share the franchise view without owning admissions.
 *
 * This list mirrors the check inside the create-student-user edge function. The
 * function is the authority; this only decides whether the button is worth
 * showing, so nobody is offered an action the server will refuse.
 */
const LOGIN_ISSUING_ROLES = ["SUPER_ADMIN", "ORGANIZATION_ADMIN", "BRANCH_ADMIN", "FRANCHISE"];

export const canIssueStudentLogin = (role?: string | null): boolean =>
  LOGIN_ISSUING_ROLES.includes((role ?? "").toUpperCase());

/**
 * Who may add to the course catalogue.
 *
 * `courses` belong to the organisation, not to a branch — `branch_courses`
 * decides which of them a branch may run, and a branch is given its courses
 * rather than writing its own. The navigation already draws this line (there is
 * no "Create Course" item in the franchise menu, and `/course/create` is not in
 * its allow-list), but the Courses & batches page offered a "New course" button
 * regardless, and it opened the form inline — so the one route the guard was
 * protecting could be walked around from the page it protected.
 */
export const canManageCourses = (role?: string | null): boolean =>
  viewForRole(role) === "admin";

/**
 * Who may change the academic calendar.
 *
 * The same line as the course catalogue, and for the same reason: a session
 * belongs to the institute, and moving its dates changes which admissions every
 * branch is allowed to file. Branch staff read the sessions — the admission
 * form needs them — but only the organisation writes them.
 *
 * This mirrors the RLS policy in `session-years.sql`, which is the authority.
 * Here it only decides whether the buttons are worth showing.
 */
export const canManageSessions = (role?: string | null): boolean =>
  viewForRole(role) === "admin";
