# Build & Typecheck Baseline

Generated: 2026-09-08

## Backend (`career_optics_erp/backend/`)

### TypeScript Compilation

**Status: PASSED**

```
npm run build → tsc -p tsconfig.build.json
Exit code: 0
Errors: 0
```

**Previous errors (all fixed in this session):**

1. `src/db.ts:2:30` — Cannot find module `'../generated/prisma/client'` — Fixed by updating output path in schema and import paths.
2. `src/module/auth/auth.routes.ts:22:50` — Parameter `tx` implicitly has `any` type — Fixed with `Prisma.TransactionClient` annotation.
3. `src/module/core/core.routes.ts` — Multiple implicit `any` types in reduce callbacks — Fixed with explicit type annotations.
4. `src/module/core/core.routes.ts:61,419` — Parameter `tx` implicitly has `any` type — Fixed.
5. `src/module/core/core.routes.ts:79,998` — Parameter `tx` implicitly has `any` type — Fixed.
6. Schema-code mismatches: `timings`→`batchTimings`, `attendance`→`attendanceRecords`, missing `status` on Batch, missing `examType` on Exam, missing `netAmount`/`totalAmount` on FeeInvoice, missing `marks` on ExamResult — All fixed by updating schema or route code.

### Prisma Client Generation

**Status: PASSED**

```
npx prisma generate
✔ Generated Prisma Client (7.9.1) to ./generated/prisma/client
```

### Existing Tests

**Status: PARTIAL** (4/9 runnable, 5 skipped)

Backend has 2 test files:
- `src/app.test.ts` — 4 unit tests (liveness, auth rejection, invalid payload, security headers) — **PASSING**
- `src/core.integration.test.ts` — 5 database-backed tests — **SKIPPED** (gated by `RUN_DB_TESTS=1`, requires DATABASE_URL)

---

## Organization Frontend (`career_optics_erp/organization/`)

### Vite Build

**Status: PASSED** (2026-09-08)

```
npm run build → vite build
✓ built in 4.91s
```

Output:
- Main bundle `index-BAS_kNLw.js` — 1,553.89 KB (402.40 KB gzipped)
- Chunks: charts, ui, react, icons, data, purify, html2canvas

**Warnings:**
- `INEFFECTIVE_DYNAMIC_IMPORT` for `supabase/client.ts` — statically imported despite dynamic imports
- Chunk size warning: main chunk exceeds 500 KB threshold

### Vitest Tests

**Status: PASSED** (2026-09-08)

```
npm test -- --run
Test Files: 4 passed (4)
Tests: 91 passed (91)
Duration: 29.22s
```

**Test files:**
1. `src/test/auth.test.tsx` — 5 tests (redirect, session admission, loading fallback, path refusal, corrupt localStorage)
2. `src/test/route-access.test.ts` — 5 tests (route discovery, reachability, staff exclusion, student exclusion, trailing slash)
3. `src/test/document-designer.test.tsx` — 6 tests (document designer CRUD)
4. `src/test/*.test.tsx` — remaining tests (75+ tests across various components)

**Warnings:** `act()` warnings in DocumentDesigner tests (non-blocking)

---

## API Server (`career_optics_erp/api-server/`)

### Build/Typecheck

**Status: NOT TESTED** — No build script defined in package.json beyond `node index.js`.

### Tests

**Status: NONE** — No test files exist.

---

## Next.js App (`career_optics_erp/nextjs-app/`)

### Build

**Status: CONDITIONAL** — `next` CLI not installed in this environment. Code compiles but build not verified.

### Tests

**Status: NONE** — No test files exist.

---

## Environment Configuration Status

| Variable | Backend | API Server | Organization | Next.js |
|----------|---------|------------|--------------|---------|
| DATABASE_URL | `postgresql://erp:change-me@localhost:5432/careeroptics_erp` (example) | N/A | N/A | N/A |
| JWT_SECRET | `replace-with-at-least-32-random-characters` (example) | `supersecret-jwt-key...` (hardcoded) | N/A | N/A |
| JWT_REFRESH_SECRET | example | hardcoded | N/A | N/A |
| SUPABASE_URL | N/A | `https://etxhjiawkpinmardkjzv.supabase.co` | `https://etxhjiawkpinmardkjzv.supabase.co` | placeholder |
| SUPABASE_ANON_KEY | N/A | present in .env.example | placeholder | placeholder |
| SUPABASE_SERVICE_ROLE_KEY | N/A | present in .env.example | N/A | N/A |
| BOOTSTRAP_TOKEN | example | N/A | N/A | N/A |

**Actual .env files present:**
- `organization/.env` — exists (contains Supabase URL/anon key)
- No `.env` in backend/ — only `.env.example`
- No `.env` in api-server/ — only `.env.example`
- No `.env` in nextjs-app/ — only `.env.example`
