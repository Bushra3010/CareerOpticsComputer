/**
 * Where the signed-in sessions live.
 *
 * Its own module because Playwright refuses to let one test file import
 * another, and both `auth.setup.ts` and `portal.spec.ts` are test files.
 * Gitignored — these are real sessions against a live project.
 */
export const CENTRE_STATE = "playwright/.auth/centre.json";
export const STUDENT_STATE = "playwright/.auth/student.json";
