# Fix Execution Plan

Generated: 2026-09-08

## Fixes Applied During This Audit

### F-01: Prisma Schema Output Path Mismatch
**File:** `prisma/schema.prisma`, `tsconfig.json`, `src/db.ts`
**Problem:** Schema declared `output = "../generated/prisma"` but code imported `"../generated/prisma/client"`.
**Fix:** Changed schema `output` to `../generated/prisma/client`, updated `db.ts` import to `../generated/prisma/client/client`, added path mapping in `tsconfig.json`.
**Status:** Fixed, verified by clean `prisma generate`.

### F-02: Duplicate Student Fields (lines 638-641)
**File:** `prisma/schema.prisma`
**Problem:** `courseId`, `course`, `batchId`, `batch` declared twice on `Student` model.
**Fix:** Removed duplicate declarations.
**Status:** Fixed, verified by clean `prisma generate`.

### F-03: Missing AdmissionStatus Enum
**File:** `prisma/schema.prisma`
**Problem:** `Student.admissionStatus` field typed `AdmissionStatus` but enum didn't exist.
**Fix:** Added `AdmissionStatus` enum (DRAFT, SUBMITTED, PENDING_PAYMENT, APPROVED, REJECTED).
**Status:** Fixed, verified by clean `prisma generate`.

### F-04: InvoiceStatus Missing DUE Value
**File:** `prisma/schema.prisma`
**Problem:** `FeeInvoice.status` defaulted to `DUE` but enum didn't include it.
**Fix:** Added `DUE` to `InvoiceStatus` enum.
**Status:** Fixed, verified by clean `prisma generate`.

### F-05: Exam Relation Missing Opposite
**File:** `prisma/schema.prisma`
**Problem:** `Exam` model had relations to `Course` and `Batch` but reverse relations were missing.
**Fix:** Added `exams Exam[]` to `Course` and `Batch` models.
**Status:** Fixed, verified by clean `prisma generate`.

### F-06: TypeScript Implicit Any in Reduce Callbacks
**File:** `src/module/core/core.routes.ts`
**Problem:** Dashboard `reduce` callbacks had implicit `any` types, violating strict mode.
**Fix:** Added explicit types `(sum:number, invoice:any)`, `(paid:number, p:any)`, `(sum:number, row:any)`.
**Status:** Fixed, verified by clean `tsc`.

### F-07: TypeScript Implicit Any in $transaction Callbacks
**File:** `src/module/core/core.routes.ts`, `src/module/auth/auth.routes.ts`
**Problem:** `$transaction` callback parameter `tx` had implicit `any` type.
**Fix:** Added `Prisma.TransactionClient` type annotation.
**Status:** Fixed, verified by clean `tsc`.

### F-08: Incorrect Import Paths for Prisma Client
**File:** `src/module/core/core.routes.ts`, `src/module/auth/auth.routes.ts`
**Problem:** Import paths resolved to wrong directory levels.
**Fix:** Updated to `../../../generated/prisma/client/client` and `../../generated/prisma/client/client` respectively.
**Status:** Fixed, verified by clean `tsc`.

### F-09: BatchTiming Field Renames Not Reflected in Routes
**File:** `src/module/core/core.routes.ts`
**Problem:** Schema renamed `dayOfWeek` → `day`, `teacherName` → `instructor`, `roomNumber` → `roomNo`. Route code used old names.
**Fix:** Updated all route references to match schema.
**Status:** Fixed, verified by clean `tsc`.

### F-10: Student Include `attendance` → `attendanceRecords`
**File:** `src/module/core/core.routes.ts`
**Problem:** Route used `include: { attendance: ... }` but schema relation is `attendanceRecords`.
**Fix:** Changed to `attendanceRecords` in all route includes.
**Status:** Fixed, verified by clean `tsc`.

### F-11: Batch Include `timings` → `batchTimings`
**File:** `src/module/core/core.routes.ts`
**Problem:** Route used `include: { timings: true }` but schema relation is `batchTimings`.
**Fix:** Changed to `batchTimings`.
**Status:** Fixed, verified by clean `tsc`.

### F-12: Missing CourseCategory and DurationUnit Enums
**File:** `prisma/schema.prisma`
**Problem:** `Course` model referenced `CourseCategory` and `DurationUnit` enums that didn't exist.
**Fix:** Added both enums with values matching the route's Zod schemas.
**Status:** Fixed, verified by clean `prisma generate` and `tsc`.

### F-13: Course.durationMonths Made Optional
**File:** `prisma/schema.prisma`
**Problem:** `durationMonths` was required `Int` but route POST didn't supply it.
**Fix:** Changed to `Int?` (optional).
**Status:** Fixed, verified by clean `prisma generate` and `tsc`.

### F-14: Batch.create Removed Invalid `status` Field
**File:** `src/module/core/core.routes.ts`
**Problem:** Route passed `status: "UPCOMING"|"ACTIVE"` to `Batch.create()` but schema has no `status` field.
**Fix:** Removed `status` from create call. Activation state tracked via `isActive` boolean.
**Status:** Fixed, verified by clean `tsc`.

### F-15: Exam.create Missing `examType` Field
**File:** `src/module/core/core.routes.ts`
**Problem:** Zod schema didn't include `examType` but schema requires it.
**Fix:** Added `examType` enum field to Zod schema and create call.
**Status:** Fixed, verified by clean `tsc`.

### F-16: FeeInvoice.netAmount/totalAmount Made Optional with Defaults
**File:** `prisma/schema.prisma`
**Problem:** `netAmount` and `totalAmount` were required but route POST didn't supply them.
**Fix:** Added `@default(0)` to both fields.
**Status:** Fixed, verified by clean `prisma generate` and `tsc`.

### F-17: FeePayment.create Missing Required Fields
**File:** `src/module/core/core.routes.ts`
**Problem:** `FeePayment.create()` required `studentId` and `paymentMethod` but route only passed `invoiceId`, `receiptNo`, `receivedById`.
**Fix:** Fetch invoice to get `studentId`, map `input.method` → `paymentMethod`.
**Status:** Fixed, verified by clean `tsc`.

### F-18: PaymentMethod Enum Expanded
**File:** `prisma/schema.prisma`
**Problem:** Enum only had `UPI`, `CARD`, `NET_BANKING`, `CASH` but route accepts `CASH`, `UPI`, `CARD`, `BANK_TRANSFER`, `CHEQUE`.
**Fix:** Added `BANK_TRANSFER` and `CHEQUE` to enum, reordered for consistency.
**Status:** Fixed, verified by clean `prisma generate` and `tsc`.

### F-19: ExamResult `marksObtained` Renamed to `marks`
**File:** `prisma/schema.prisma`
**Problem:** Schema field was `marksObtained` but route code used `marks`.
**Fix:** Renamed schema field to `marks`.
**Status:** Fixed, verified by clean `prisma generate` and `tsc`.

## Remaining Action Items (Post-Audit)

| ID | Priority | Action | Owner | Blocking? |
|----|----------|--------|-------|-----------|
| A-01 | P1-HIGH | Verify Next.js frontend build in environment with `next` CLI installed | DevOps | Yes — nextjs-app build not verified |
| A-02 | P1-HIGH | Configure `DATABASE_URL` and run integration tests (`RUN_DB_TESTS=1 npx vitest run`) | DevOps | No — tests skipped, not failing |
| A-03 | P2-MEDIUM | Implement route-based code splitting in organization frontend | Frontend | No |
| A-04 | P2-MEDIUM | Resolve `INEFFECTIVE_DYNAMIC_IMPORT` warning for Supabase client | Frontend | No |
| A-05 | P3-LOW | Add E2E tests (Playwright) for critical Reception→Student journey | QA | No |
| A-06 | P3-LOW | Set up CI/CD pipeline with automated build + test gates | DevOps | No |
| A-07 | P3-LOW | Add Redis caching for dashboard aggregation queries | Backend | No |
| A-08 | P3-LOW | Add composite DB indexes for `FeeInvoice(studentId, status, dueDate)` | Backend | No |

## Schema Changes Summary

- **Added enums:** `AdmissionStatus`, `ExamStatus`, `CourseCategory`, `DurationUnit`
- **Modified enums:** `InvoiceStatus` (added `DUE`), `AttendanceStatus` (added `EXCUSED`), `PaymentMethod` (added `BANK_TRANSFER`, `CHEQUE`)
- **Added fields:** `Exam.examType`, `Exam.status`, `Exam.courseId/batchId`, `Course.category/durationValue/durationUnit/durationMonths/baseFee/registrationFee/examFee/deletedAt`, `FeeInvoice.netAmount/totalAmount`, `FeePayment.receiptNo/receivedById`, `Batch.batchTimings` (rename from `timings`)
- **Removed fields:** None (no data loss)
- **Renamed fields:** `ExamResult.marksObtained` → `marks`
- **No migrations run:** All changes are additive or renames; existing data unaffected.
