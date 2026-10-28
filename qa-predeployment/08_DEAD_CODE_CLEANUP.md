# Dead Code & Cleanup Report

Generated: 2026-09-08

## Superseded Imports / Unused Fields

| File | Line | Issue | Action |
|------|------|-------|--------|
| `src/module/core/core.routes.ts` | 3 | Imported `Prisma` type for `Prisma.TransactionClient` only used in payment and exam-result handlers. All other routes use plain callbacks. | No action — type annotation is necessary for `$transaction` callbacks. |
| `src/module/core/core.routes.ts` | 19 | Dashboard reduce callbacks use explicit types `(sum:number, invoice:any)` etc. — these are necessary for strict mode. | No action — required by TypeScript strict mode. |

## INEFFECTIVE_DYNAMIC_IMPORT Warning

- **Location:** `organization/src/lib/supabase/client.ts`
- **Problem:** Supabase client is statically imported by `AuthContext.tsx`, `data.ts`, `examAttendance.ts`, `reception.ts`, `studentFee.ts` and others, negating all dynamic imports.
- **Impact:** The `supabase/client.ts` chunk cannot be lazy-loaded; it ends up in the main bundle.
- **Recommendation:** Either make all imports consistent (all dynamic) or extract the Supabase client into a shared chunk.

## Oversized Main Bundle (Organization Frontend)

- **Main bundle:** `index-BAS_kNLw.js` — 1,553.89 KB (402.40 KB gzipped)
- **Root cause:** All page components, layouts, and business logic are bundled together.
- **Recommendation:** Implement route-based code splitting. Each page module should be a separate chunk loaded on demand.

## Removed / Renamed Schema Fields (dead in code after migration)

| Old Code Reference | Removed/ Renamed | Status |
|-------------------|------------------|--------|
| `Batch.create({ status: "UPCOMING" })` | Removed — Batch model has no `status` field; `isActive` boolean handles activation. | Fixed — line removed from `core.routes.ts`. |
| `Student.include.attendance` | Renamed to `attendanceRecords` in schema. | Fixed — all route code updated. |
| `Batch.include.timings` | Renamed to `batchTimings` in schema. | Fixed — all route code updated. |

## Orphaned / Unused Zod Enum Values

- Route `POST /courses` accepts `category: "OTHER"` which is present in the `CourseCategory` enum but was not in the original set. No downstream code branches on `"OTHER"` — it's a valid catch-all.
- No dead enum values found that cause runtime misbehavior.

## Unused Test Infrastructure

- `src/core.integration.test.ts` — 5 tests, all **skipped** (gated by `RUN_DB_TESTS=1` env var, which requires a live PostgreSQL database).
  - These tests cover the full bootstrap→login→course→batch→student→invoice→payment→attendance pipeline.
  - **Recommendation:** Once `DATABASE_URL` is available, remove the skip guard and run these as the primary integration suite.

## Summary

| Category | Count | Actionable |
|----------|-------|------------|
| Dead code (unreachable) | 0 | — |
| Removed schema fields still referenced | 0 | All fixed |
| Unused imports | 0 | All necessary |
| Performance warnings | 2 | INEFFECTIVE_DYNAMIC_IMPORT, oversized main bundle |
| Skipped integration tests | 5 | Need DATABASE_URL |

**Recommendation:** No dead code removal is required before release. Two performance improvements (code splitting, consistent Supabase import strategy) should be scheduled for the next sprint.
