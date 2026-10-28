/**
 * Primary keys for the tables this app writes through PostgREST.
 *
 * Several tables were created from `backend/prisma/schema.prisma`, where the id
 * carries `@default(cuid())` and `updatedAt` carries `@updatedAt`. Both of those
 * are filled in by Prisma's client, not by Postgres -- the generated DDL leaves
 * the columns `NOT NULL` with no default. The browser talks to PostgREST
 * directly, so nothing fills them in and the insert fails with "null value in
 * column ... violates not-null constraint". Callers supply both explicitly.
 */

/**
 * `crypto.randomUUID` is absent on older Android webviews and on any non-HTTPS
 * origin, both of which reach this app, hence the fallback.
 */
export function newId(prefix = "id") {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** The value for a Prisma-style `updatedAt` column that has no database default. */
export const nowIso = () => new Date().toISOString();
