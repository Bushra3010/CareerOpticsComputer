# Defect Register

Generated: 2026-09-07
Status: Active — No fixes applied yet

## Severity Legend

- **P0-BLOCKER**: Prevents any meaningful use of the system
- **P1-CRITICAL**: Causes data loss, security failure, or broken core workflow
- **P2-HIGH**: Broken feature, wrong data, security weakness
- **P3-MEDIUM**: UX issue, dead code, missing feature
- **P4-LOW**: Code quality, documentation

---

## P0-BLOCKER

### DEF-001: Prisma Schema Invalid — Duplicate Fields in Student Model

- **File**: `backend/prisma/schema.prisma:590-707`
- **Description**: `courseId`, `course`, `batchId`, `batch` are declared twice in the Student model (lines 598-601 and 638-641). Prisma client generation fails with "Field is already defined" errors.
- **Impact**: Backend cannot compile or start. No API requests can be served.
- **Fix**: Remove duplicate field declarations at lines 638-641.

### DEF-002: Prisma Schema Invalid — Missing AdmissionStatus Enum

- **File**: `backend/prisma/schema.prisma:689`
- **Description**: `admissionStatus AdmissionStatus` references an enum that is not defined anywhere in the schema.
- **Impact**: Prisma client generation fails entirely.
- **Fix**: Add `enum AdmissionStatus { DRAFT SUBMITTED PENDING_PAYMENT APPROVED REJECTED }` to the enums section.

### DEF-003: Prisma Client Generation Path Mismatch

- **File**: `backend/prisma/schema.prisma:3` and `backend/src/db.ts`
- **Description**: Schema outputs to `../generated/prisma` but `db.ts` imports from `../generated/prisma/client`. The generated output is a directory without a `client` subdirectory.
- **Impact**: TypeScript cannot resolve the Prisma client module.
- **Fix**: Either change schema output to `../generated/prisma/client` or update import path.

### DEF-004: API Server Has No Authentication

- **File**: `api-server/src/index.js`
- **Description**: Auth middleware exists (`api-server/src/middleware/auth.js`) but is never applied to any route. All Supabase proxy endpoints are completely unauthenticated.
- **Impact**: Any client can read/write any organization's data. Critical data exposure and integrity risk.
- **Fix**: Apply `authenticate` middleware to all protected routes.

### DEF-005: API Server Bootstrap Logic Inverted

- **File**: `api-server/src/routes/auth.js`
- **Description**: `if (profiles && profiles.length >= 0)` is always true (any array has length >= 0). Bootstrap always returns 400 "System already initialized".
- **Impact**: First-time deployment cannot initialize the system.
- **Fix**: Change to `profiles.length === 0`.

---

## P1-CRITICAL

### DEF-006: api-server Dashboard Returns Hardcoded Zeros

- **File**: `api-server/src/routes/core.js`
- **Description**: Dashboard endpoint returns `{ students: 0, enquiriesToday: 0, outstandingDues: 0, attendance: 0, payments: 0, courses: 0 }` regardless of actual data.
- **Impact**: Admin and franchise dashboards always show zero for all metrics.
- **Fix**: Query Supabase for actual counts.

### DEF-007: api-server Invoice/Receipt Number Generation Always Produces "INV-1"/"RCT-1"

- **File**: `api-server/src/routes/core.js`
- **Description**: `"INV-" + String((countData.length > 0 ? 0 : 0) + 1)` always evaluates to "INV-1". Same pattern for receipts.
- **Impact**: Every invoice gets the same number, violating uniqueness constraints.
- **Fix**: Use actual count + 1 or UUID-based numbering.

### DEF-008: FeeInvoice Field Name Mismatch

- **File**: `backend/prisma/schema.prisma:721` vs `backend/src/module/core/core.routes.ts`
- **Description**: Schema defines `invoiceNumber String @unique` but backend routes write `invoiceNo` which doesn't exist in the schema.
- **Impact**: Invoice creation will fail with a Prisma unknown field error.
- **Fix**: Use `invoiceNumber` consistently, or rename schema field to `invoiceNo`.

### DEF-009: Student Model Duplicate Relations Break All Student CRUD

- **File**: `backend/prisma/schema.prisma:638-641`
- **Description**: Duplicate `courseId`/`batchId`/`course`/`batch` declarations mean even if the enum is fixed, the model is structurally invalid.
- **Impact**: No student can be created, read, updated, or deleted.
- **Fix**: Remove lines 638-641 (duplicate block).

### DEF-010: BatchTiming dayOfWeek/DAY_ENUM Mismatch

- **File**: `backend/prisma/schema.prisma:557` vs `organization/src/pages/course/BatchTiming.tsx:41-47`
- **Description**: Schema stores `dayOfWeek Int` (0=Sunday), frontend sends string day enum ("MONDAY".."SATURDAY").
- **Impact**: Timetable entries will have garbled day values. Frontend displays will be wrong.
- **Fix**: Either change schema to store day as string, or translate in the API layer.

---

## P2-HIGH

### DEF-011: Exam Model Missing courseId/batchId — API Includes Non-existent Relations

- **File**: `backend/src/module/core/core.routes.ts` (exam query)
- **Description**: API tries to `include: { course: true, batch: true }` on Exam, but the model has no such relations.
- **Impact**: Exam list endpoint will throw a Prisma error.
- **Fix**: Remove non-existent includes, or add relations via ExamAssignment.

### DEF-012: FeePayment Missing receivedById Field Referenced by Code

- **File**: `backend/prisma/schema.prisma:755-778`
- **Description**: Schema has `receivedBy String?` but attendance/payment code references `receivedById` and `markedById` which don't exist.
- **Impact**: Payment attribution to users is broken.
- **Fix**: Add `receivedById String?` with User relation, or update all references.

### DEF-013: AttendanceRecord Upsert Uses Wrong Compound Key Name

- **File**: `backend/src/module/core/core.routes.ts` (attendance POST)
- **Description**: Schema defines `@@unique([studentId, date])` but backend uses `studentId_date` as the upsert key.
- **Impact**: Attendance upsert will fail with "Unknown field" error.
- **Fix**: Use the correct compound unique field names.

### DEF-014: Reception ItemDispatch/ItemReceive Use Mock Data in UI

- **File**: `organization/src/pages/reception/ItemDispatch.tsx`, `ItemReceive.tsx`
- **Description**: Pages display hardcoded mock arrays (`dispatchData`, `receiveData`) instead of fetching from API.
- **Impact**: Item tracking is non-functional in the UI.
- **Fix**: Replace mock data with Supabase queries.

### DEF-015: api-server Uses pbkdf2 Instead of bcrypt

- **File**: `api-server/src/routes/auth.js`
- **Description**: Password hashing uses pbkdf2 while backend uses bcrypt. Passwords created via api-server cannot be verified by backend.
- **Impact**: Users registered via api-server cannot log in via backend.
- **Fix**: Standardize on bcrypt across both servers.

### DEF-016: Organization Login Sends Non-Email as Email

- **File**: `organization/src/contexts/AuthContext.tsx:42`
- **Description**: `const email = identifier.includes("@") ? identifier : `${identifier}@careeroptics.local`;` — non-email identifiers get a fake domain.
- **Impact**: Users logging in with username will fail if their account email doesn't match.
- **Fix**: Look up user by username first, then use their actual email for Supabase auth.

### DEF-017: nextjs-app Uses Placeholder Supabase Credentials

- **File**: `nextjs-app/.env.example`
- **Description**: `NEXT_PUBLIC_SUPABASE_URL=your_supabase_url` — placeholder values.
- **Impact**: Next.js app cannot function without real credentials.
- **Fix**: Provide actual Supabase project credentials.

### DEF-018: Backend config.ts Requires DATABASE_URL But No .env Exists

- **File**: `backend/.env.example` (exists but no actual `.env`)
- **Description**: Backend requires DATABASE_URL, JWT_SECRET (32+ chars), JWT_REFRESH_SECRET. Without these, the server crashes on startup.
- **Impact**: Backend cannot start in any environment without manual env setup.
- **Fix**: Ensure `.env` is created from `.env.example` before deployment.

---

## P3-MEDIUM

### DEF-019: Student Routes Stub Returns "Hello World"

- **File**: `backend/src/module/students/routes/student.routes.ts`
- **Description**: Route handler is a stub that returns "Hello World".
- **Impact**: No student API exists at this path.
- **Fix**: Implement or remove the stub.

### DEF-020: DEPLOYMENT.md Bootstrap curl Uses Wrong URL Path

- **File**: `DEPLOYMENT.md:11`
- **Description**: Example curl uses `/api/v1/auth/bootstrap` but the actual backend path is `/api/v1/bootstrap`.
- **Impact**: Bootstrap script in deployment docs will fail.
- **Fix**: Correct the path in documentation.

### DEF-021: api-server CORS Uses Wildcard Origin

- **File**: `api-server/src/index.js`
- **Description**: `cors({ origin: "*" })` allows any origin.
- **Impact**: CSRF risk, any site can make authenticated requests.
- **Fix**: Restrict to known origins like the backend does.

### DEF-022: api-server Has No Helmet, No Rate Limiting, No Body Size Limit

- **File**: `api-server/src/index.js`
- **Description**: Missing security middleware present in backend.
- **Impact**: Vulnerable to injection, DoS, oversized payloads.
- **Fix**: Add helmet, rate limiting, and body size limit.

### DEF-023: BatchTiming Frontend Has No Valid Day 0 (Sunday)

- **File**: `organization/src/pages/course/BatchTiming.tsx:41`
- **Description**: `DAY_ENUM` maps 1-6 to MONDAY-SATURDAY, skipping Sunday (0).
- **Impact**: Sunday classes cannot be scheduled via the UI.
- **Fix**: Include Sunday in the enum mapping.

### DEF-024: Holiday Apply Page Has No Backend

- **File**: `organization/src/pages/attendance/HolidayApply.tsx`
- **Description**: Page exists but reminders are stored in localStorage only, never synced to backend.
- **Impact**: Holiday data is lost on device change or cache clear.
- **Fix**: Create backend API for holiday management.

### DEF-025: Organization Tests Have act() Warnings

- **File**: `organization/src/test/document-designer.test.tsx`
- **Description**: React state updates not wrapped in act().
- **Impact**: Tests may be flaky, not catching real regressions.
- **Fix**: Wrap state updates in act().

### DEF-026: DEPLOYMENT.md Default Admin Credentials Are Hardcoded

- **File**: `backend/.env.example:18-19`
- **Description**: `# Username: admin` and `# Password: admin123` are documented in env file.
- **Impact**: Credential leakage risk if env file is committed.
- **Fix**: Remove default credentials from env file, document in secure deployment guide only.

---

## P4-LOW

### DEF-027: Ineffective Dynamic Import Warning for supabase/client.ts

- **File**: `organization/src/lib/supabase/client.ts`
- **Description**: Dynamically imported by some files but also statically imported, defeating code-splitting.
- **Impact**: Larger initial bundle.
- **Fix**: Either fully dynamic or fully static import.

### DEF-028: Some Chunks Exceed 500KB After Minification

- **File**: `organization/vite.config.ts` build output
- **Description**: Main chunk is 1.5MB (400KB gzipped).
- **Impact**: Slower initial page load.
- **Fix**: Further code-splitting, especially for chart libraries.

### DEF-029: Git Repository Nested Incorrectly

- **File**: Project root
- **Description**: Git repo is at `career_optics_erp/` inside the project folder `career optics erp/`. `.gitignore` and `README.md` are in the inner folder.
- **Impact**: Confusing git workflow, accidental commits of parent directory.
- **Fix**: Move git root to project root, or restructure.

### DEF-030: TypeScript Implicit any in core.routes.ts

- **File**: `backend/src/module/core/core.routes.ts`
- **Description**: Multiple callback parameters have implicit `any` type (13 occurrences).
- **Impact**: Type safety lost, potential runtime errors.
- **Fix**: Add explicit types or enable `noImplicitAny: true`.

---

## Defect Summary

| Severity | Count |
|----------|-------|
| P0-BLOCKER | 5 |
| P1-CRITICAL | 7 |
| P2-HIGH | 8 |
| P3-MEDIUM | 7 |
| P4-LOW | 5 |
| **Total** | **32** |
