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
