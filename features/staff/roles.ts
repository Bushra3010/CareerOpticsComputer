/**
 * Roles a centre owner may invite into — never centre_owner itself.
 *
 * Lives in its own module rather than in `queries.ts` because the invite form is
 * a Client Component. Importing this constant from `queries.ts` pulled that
 * module's `lib/db/server` import into the browser bundle, and with it
 * `next/headers`, which fails the production build.
 *
 * Data that both a Server Component and a Client Component need has to sit in a
 * module with no server-only dependencies of its own.
 */
export const INVITABLE_ROLES = [
  {
    code: "centre_manager",
    name: "Centre Manager",
    note: "Everything except staff changes",
  },
  {
    code: "counsellor",
    name: "Counsellor",
    note: "Admissions; cannot take payments",
  },
  {
    code: "faculty",
    name: "Faculty",
    note: "Attendance and results; no fee access",
  },
  { code: "accountant", name: "Accountant", note: "Fees and payments only" },
] as const;
