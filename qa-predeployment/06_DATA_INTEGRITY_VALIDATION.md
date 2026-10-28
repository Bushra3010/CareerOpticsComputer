# Data Integrity Validation

Generated: 2026-09-07

## Schema-Level Issues

### 1. Duplicate Fields in Student Model

**File:** `backend/prisma/schema.prisma:598-641`

```
// First declaration (lines 598-601):
  courseId        String?
  course          Course?  @relation(fields: [courseId], references: [id])
  batchId         String?
  batch           Batch?   @relation(fields: [batchId], references: [id])

// Duplicate declaration (lines 638-641):
  courseId        String?
  course          Course?  @relation(fields: [courseId], references: [id])
  batchId         String?
  batch           Batch?   @relation(fields: [batchId], references: [id])
```

**Impact:** Prisma fails to generate client. No database operations possible.
**Validation:** `npx prisma generate` → "Field is already defined" error.
**Fix:** Remove lines 638-641.

### 2. Missing AdmissionStatus Enum

**File:** `backend/prisma/schema.prisma:689`

```prisma
admissionStatus   AdmissionStatus @default(DRAFT)
```

The `AdmissionStatus` enum is not defined anywhere in the schema.

**Impact:** Prisma client generation fails.
**Validation:** `npx prisma generate` → "Type AdmissionStatus is neither a built-in type, nor refers to another model, composite type, or enum."
**Fix:** Add enum definition:
```prisma
enum AdmissionStatus {
  DRAFT
  SUBMITTED
  PENDING_PAYMENT
  APPROVED
  REJECTED
}
```

### 3. Prisma Client Output Path Mismatch

**File:** `backend/prisma/schema.prisma:1-4` and `backend/src/db.ts`

```prisma
// schema.prisma
output = "../generated/prisma"

// db.ts
import { PrismaClient } from "../generated/prisma/client"
```

Prisma generates to `../generated/prisma/` but code imports from `../generated/prisma/client/`.

**Impact:** TypeScript compilation fails.
**Fix:** Change schema output to `"../generated/prisma/client"`.

## API-Level Schema Mismatches

### 4. FeeInvoice.invoiceNumber vs invoiceNo

**Schema (Prisma):** `invoiceNumber String @unique`
**Backend routes:** Write `invoiceNo` (field doesn't exist)
**Frontend Supabase client:** Writes `invoiceNo` (correct for Supabase schema)
**Supabase schema (`supabase-schema.sql`):** Unknown (not verified)

**Impact:** Backend invoice creation fails. Frontend Supabase invoice creation works only if Supabase column is named `invoiceNo`.
**Validation:** Compare schema definition with route code and frontend queries.
**Fix:** Align all three layers on one field name.

### 5. BatchTiming dayOfWeek vs day String Enum

**Schema (Prisma):** `dayOfWeek Int // 0=Sunday, 1=Monday, etc.`
**Backend routes:** Unknown (not verified)
**Frontend BatchTiming.tsx:** Sends string values "MONDAY".."SATURDAY"
**Supabase schema:** Uses `day` field with string values

**Impact:** Timetable entries written from frontend will have garbled values. Display will be wrong.
**Validation:** Frontend sends `day: "MONDAY"` but schema expects integer 1.
**Fix:** Translate string to integer in API layer, or change schema.

### 6. Exam Model Missing courseId/batchId Relations

**Schema (Prisma):** Exam has only `branchId`. Relations are through `ExamAssignment`.
**Backend routes:** Try to `include: { course: true, batch: true }` in Exam query.

**Impact:** Exam list endpoint crashes with "Unknown relation" error.
**Validation:** Check route code for non-existent relation includes.
**Fix:** Remove invalid includes, join through ExamAssignment if needed.

### 7. FeePayment receivedById Not in Schema

**Schema (Prisma):** `receivedBy String?`
**Code references:** `receivedById`, `markedById` (not in schema)

**Impact:** Cannot attribute payments to specific users.
**Validation:** Grep codebase for `receivedById` and `markedById`.
**Fix:** Add `receivedById String? @db.Text` with User relation, or remove references.

### 8. AttendanceRecord Upsert Key Mismatch

**Schema (Prisma):** `@@unique([studentId, date])`
**Backend routes:** Use `studentId_date` as upsert key

**Impact:** Attendance upsert will fail.
**Validation:** Compare unique constraint name with route code.
**Fix:** Use correct compound field names in upsert.

## Financial Integrity

### 9. Paise Arithmetic Implementation

**File:** `backend/src/module/core/core.routes.ts` (fee payment logic)

The backend implements paise-based arithmetic (storing amounts as integers representing paise) to avoid floating-point drift.

**Validation needed:**
- Confirm all monetary fields use integer paise
- Verify conversion to/from display format (rupees)
- Test edge cases: 0.01 rounding, large amounts

### 10. Row-Level Locking on Invoice Payments

**File:** `backend/src/module/core/core.routes.ts`

```typescript
const invoice = await prisma.feeInvoice.findFirst({
  where: { id: invoiceId },
  select: { id: true, status: true, totalAmount: true, netAmount: true },
});
// ... then FOR UPDATE lock
```

**Validation needed:**
- Confirm `FOR UPDATE` is applied within a `$transaction`
- Verify no race condition between reading and locking
- Test concurrent payment scenarios

## Data Consistency Checks

### 11. Student → Invoice → Payment Chain

Expected flow:
1. Student created → generates `applicationNo`, `enrollmentNo`
2. Invoice created → references `studentId`, generates `invoiceNumber`
3. Payment recorded → references `invoiceId`, `studentId`, updates invoice `status`

**Validation needed:**
- Orphaned invoices (no student)
- Orphaned payments (no invoice)
- Invoice status mismatch with payment sum
- Negative balances

### 12. Attendance Uniqueness

Schema: `@@unique([studentId, date])`

**Validation needed:**
- Duplicate attendance records for same student+date
- Attendance for non-existent students
- Attendance for dates outside academic year

### 13. Exam Assignment Uniqueness

Schema: `@@unique([examId, batchId])`

**Validation needed:**
- Duplicate exam-batch assignments
- Exams assigned to non-existent batches
- Orphaned exam results (exam deleted but results remain — SetNull should handle)

## Referential Integrity

| Relation | On Delete | Risk |
|----------|-----------|------|
| User → Organization | None (userId is unique, not FK) | Orphaned orgs if user deleted |
| User → Branch | None (userId is unique) | Orphaned branches if user deleted |
| Student → User | SetNull (userId optional) | OK |
| Student → Course | SetNull (courseId optional) | OK |
| Student → Batch | SetNull (batchId optional) | OK |
| Batch → Course | Restrict (default) | Cannot delete course with batches |
| FeeInvoice → Student | Restrict (default) | Cannot delete student with invoices |
| FeePayment → Invoice | Restrict (default) | Cannot delete invoice with payments |
| ExamAssignment → Exam | Cascade | OK |
| ExamAssignment → Batch | Cascade | OK |
| ExamResult → Exam | SetNull (default) | OK |
| ExamResult → Student | SetNull (default) | OK |
| RefreshSession → User | Cascade | OK |
| AuditEvent → User | SetNull | OK |

## Supabase Schema Concerns

The `supabase-schema.sql` file (34KB) exists but has not been verified against:
1. The Prisma schema (field name alignment)
2. The organization frontend Supabase queries
3. The api-server Supabase proxy logic

**Risk:** Column name mismatches between Prisma schema and Supabase schema will cause runtime errors when the api-server or nextjs-app queries data.

## Integrity Validation Summary

| Check | Status | Severity |
|-------|--------|----------|
| Prisma schema validates | FAIL | P0-BLOCKER |
| Prisma client generates | FAIL | P0-BLOCKER |
| Schema ↔ Backend routes aligned | FAIL | P1-CRITICAL |
| Schema ↔ Frontend Supabase queries aligned | UNKNOWN | P1-CRITICAL |
| Prisma ↔ Supabase schema aligned | UNKNOWN | P1-CRITICAL |
| Financial arithmetic correct | UNTESTED | P1-CRITICAL |
| Row-level locking works | UNTESTED | P2-HIGH |
| Referential integrity enforced | UNTESTED | P2-HIGH |
| Attendance uniqueness enforced | UNTESTED | P2-HIGH |
| Exam assignment uniqueness enforced | UNTESTED | P2-HIGH |
| No orphaned records | UNTESTED | P2-HIGH |
