# Test Baseline

Generated: 2026-09-08

## Summary

| Subsystem | Test Files | Total Tests | Passed | Failed | Skipped | Coverage |
|-----------|-----------|-------------|--------|--------|---------|----------|
| Backend | 2 | 9 | 4 | 0 | 5 | Partial (needs DATABASE_URL) |
| Organization | 4 | 91 | 91 | 0 | 0 | Unknown |
| API Server | 0 | 0 | 0 | 0 | 0 | 0% |
| Next.js App | 0 | 0 | 0 | 0 | 0 | 0% |

## Backend Tests

### Test Infrastructure
- Framework: Vitest
- Config: `vitest.config.ts` (node environment, setup file at `./src/test/setup.ts`)
- API testing: supertest

### Test Files

1. **`src/app.test.ts`** — Unit tests for Express app
   - Test 1: Health endpoint returns `{ status: "ok" }` ✅
   - Test 2: Unauthenticated request to protected route returns 401 ✅
   - Test 3: Invalid login payload returns error ✅
   - Test 4: Security headers present (helmet) ✅
   - **Status: PASSING** (4/4 tests, verified 2026-09-08)

2. **`src/core.integration.test.ts`** — Full workflow integration test
   - Requires `RUN_DB_TESTS=1` environment variable
   - Tests full bootstrap → login → create course → create batch → create student → create invoice → record payment → mark attendance
   - Uses global variables to chain IDs between tests
   - **Status: SKIPPED** — requires DATABASE_URL and valid Prisma client

### Prisma Test Setup
- `prisma.config.ts` exists
- No seed script found
- No migration files found

## Organization Tests

### Test Infrastructure
- Framework: Vitest
- Config: `vitest.config.ts` (jsdom environment, React Testing Library)
- Alias: `@` → `./src`

### Test Files

1. **`src/test/auth.test.tsx`** — Authentication boundary (5 tests)
   - ✅ Redirects anonymous users to sign in
   - ✅ Admits an authenticated session
   - ✅ Stops loading when auth callback never fires (regression guard)
   - ✅ Refuses paths outside the account's workspace
   - ✅ Survives corrupt persisted user in localStorage

2. **`src/test/route-access.test.ts`** — Route authorization (5 tests)
   - ✅ Finds the routes it is meant to be checking (50+ routes)
   - ✅ Every route is reachable by at least one view
   - ✅ Staff kept out of student portal
   - ✅ Students kept out of back office
   - ✅ Trailing slash doesn't bypass gate

3. **`src/test/document-designer.test.tsx`** — Document designer (6 tests)
   - ✅ 6 tests for document type CRUD operations
   - ⚠️ `act()` warnings present

4. **Additional test files** — 75+ tests across components
   - Coverage: DataTable, StatusBadge, StatsCard, buttons, dialogs, forms
   - All passing

### Test Quality Observations
- Auth tests mock Supabase client completely (correct approach)
- Route tests parse App.tsx dynamically to find routes (clever, prevents drift)
- No integration tests against real API
- No E2E tests despite Playwright being available
- No tests for critical financial operations (invoice creation, payment recording)
- No tests for RBAC boundary conditions beyond route access

## API Server Tests

- No test files exist
- No test framework configured
- No CI/CD pipeline detected

## Next.js App Tests

- No test files exist
- No test framework in package.json

## Test Coverage Gaps

| Critical Area | Has Tests | Gap |
|---------------|-----------|-----|
| Login/logout flow | Partial (mocked) | No real API test |
| Bootstrap | No | Critical — first deployment |
| Student CRUD | No | Core business operation |
| Invoice creation | No | Financial integrity |
| Payment recording | No | Financial integrity |
| Attendance marking | No | Core operation |
| RBAC enforcement | Partial (frontend only) | No backend API test |
| Exam creation/grading | No | Core operation |
| Dashboard aggregation | No | Data integrity |
| Document generation | No | PDF generation untested |
| Portal endpoints | No | Student-facing features untested |
