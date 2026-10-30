# Feature Inventory

Generated: 2026-09-07
Auditor: Pre-Deployment Production Readiness Audit — Phase 0-1

## 1. Subsystems

| Subsystem | Path | Stack | Status |
|-----------|------|-------|--------|
| Backend API | `backend/` | Express 5, Prisma 7, PostgreSQL | **BLOCKED** — Prisma schema invalid |
| API Server (legacy) | `api-server/` | Express 4, Supabase proxy | **BROKEN** — no auth, broken bootstrap |
| Organization Frontend | `organization/` | Vite, React Router 7, Radix UI | **BUILD OK** — 91 tests pass |
| Next.js Frontend | `nextjs-app/` | Next.js 14, Supabase | **UNKNOWN** — no tests, no build run |
| Supabase Schema | `supabase-schema.sql` | PostgreSQL (Supabase) | **UNKNOWN** — not executed |
| Deployment | `DEPLOYMENT.md`, `.env.deploy.example` | Docker Compose | Configured but untested |

## 2. Feature Matrix

### 2.1 Authentication & RBAC

| Feature | Backend | API Server | Organization | Next.js | Status |
|---------|---------|------------|--------------|---------|--------|
| Bootstrap (first org) | YES | YES (broken) | NO | NO | **BLOCKER** |
| Login (JWT) | YES | YES | YES (Supabase) | YES (Supabase) | Partial |
| Logout | YES | YES | YES | YES | OK |
| Refresh Token | YES | YES | YES | YES | OK |
| Role enforcement | YES (RBAC) | **NO** | YES (ProtectedRoute + canAccess) | Unknown | **BLOCKER** |
| Session restore | YES | NO | YES | YES | OK |

**Roles defined:** SUPER_ADMIN, ORGANIZATION_ADMIN, BRANCH_ADMIN, ACCOUNTANT, RECEPTIONIST, TEACHER, STAFF, STUDENT

### 2.2 Reception Module

| Feature | Backend | API Server | Org Frontend | Next.js | Status |
|---------|---------|------------|--------------|---------|--------|
| Visitor Enquiry (VisitEnquiry) | YES (routes exist) | YES | YES (VisitEnquiry.tsx) | YES | API OK |
| Enquiry list/search | YES | YES | YES | YES | API OK |
| Follow-up tracking | YES | NO | NO | NO | Dead frontend |
| Item Dispatch | YES | YES | **MOCK DATA** | NO | **BLOCKER** |
| Item Receive | YES | YES | **MOCK DATA** | NO | **BLOCKER** |

**Reception→Student journey:**
1. Walk-in visitor → VisitEnquiry created (backend works)
2. Enquiry converted → Student created (backend works)
3. Student admission form → Student record with documents (backend works)
4. Fee invoice generated → Payment collected (backend works)
5. Attendance marked (backend works)

**BLOCKER:** Backend cannot run (Prisma schema invalid). Reception items use mock data in UI.

### 2.3 Branch Management

| Feature | Backend | API Server | Org Frontend | Next.js | Status |
|---------|---------|------------|--------------|---------|--------|
| Create Branch | YES | YES | YES | NO | API OK |
| View Branch | YES | YES | YES | NO | API OK |
| Wallet Recharge | YES | YES | YES | NO | API OK |
| Branch Transactions | YES | YES | YES | NO | API OK |
| Notice Board | YES | YES | YES | NO | API OK |
| Website Settings | YES | YES | YES | NO | API OK |

### 2.4 Enquiry Management

| Feature | Backend | API Server | Org Frontend | Next.js | Status |
|---------|---------|------------|--------------|---------|--------|
| Branch Enquiry list | YES | YES | YES | YES | API OK |
| Online Branch Enquiry | NO | YES | YES | YES | **Dead frontend** |
| Online Student Enquiry | NO | YES | YES | YES | **Dead frontend** |

### 2.5 Course & Batch Management

| Feature | Backend | API Server | Org Frontend | Next.js | Status |
|---------|---------|------------|--------------|---------|--------|
| Create Course | YES | YES | YES | YES | API OK |
| View Courses | YES | YES | YES | YES | API OK |
| Create Batch | YES | YES | YES | YES | API OK |
| Batch Timing (timetable) | YES | YES | YES | **MISMATCH** | **BLOCKER** |
| Assign Course to Batch | YES | YES | YES | YES | API OK |

**BatchTiming field mismatch:** Schema uses `dayOfWeek Int` (0=Sunday), frontend uses string day enum ("MONDAY".."SATURDAY"). Writes will fail or produce garbage.

### 2.6 Student Management

| Feature | Backend | API Server | Org Frontend | Next.js | Status |
|---------|---------|------------|--------------|---------|--------|
| Admission Form | YES | YES | YES | YES | API OK |
| View Students | YES | YES | YES | YES | API OK |
| Online Admission List | NO | YES | YES | YES | **Dead frontend** |
| Student Detail | YES | YES | YES | YES | API OK |

**Student model duplicate fields:** `courseId`, `course`, `batchId`, `batch` appear twice (lines 598-601 and 638-641). Prisma fails to generate client. **BLOCKER.**

### 2.7 Fee Management

| Feature | Backend | API Server | Org Frontend | Next.js | Status |
|---------|---------|------------|--------------|---------|--------|
| Fee Types | NO | YES | YES | NO | **Dead backend** |
| Fee Groups | NO | YES | YES | NO | **Dead backend** |
| Fee Allocation | NO | YES | YES | NO | **Dead backend** |
| Fee Collection | YES | YES | YES | YES | API OK |
| Due Fee Collection | YES | YES | YES | YES | API OK |

**Field mismatch:**
- Backend schema: `FeeInvoice.invoiceNumber` (String, unique)
- Backend routes: write `invoiceNo` (field doesn't exist in schema)
- Frontend Supabase client: writes `invoiceNo` (correct for Supabase), reads `invoiceNumber` (wrong)

### 2.8 Exam & Marks

| Feature | Backend | API Server | Org Frontend | Next.js | Status |
|---------|---------|------------|--------------|---------|--------|
| Create Exam | YES | YES | YES | YES | API OK |
| Exam List | YES | YES | YES | YES | API OK |
| Assign Marks | YES | YES | YES | YES | API OK |
| Exam Schedule | YES | YES | YES | YES | API OK |
| Grade Management | NO | YES | YES | YES | **Dead backend** |
| MarksList | YES | YES | YES | YES | API OK |

**Exam model issue:** No `courseId`/`batchId` on Exam model, but API routes try to `include: { course: true, batch: true }`. Only `ExamAssignment` links exams to batches.

### 2.9 Online Exam

| Feature | Backend | API Server | Org Frontend | Next.js | Status |
|---------|---------|------------|--------------|---------|--------|
| Create Online Exam | NO | YES | YES | YES | **Dead backend** |
| Question Paper Builder | NO | YES | YES | NO | **Dead backend** |
| Add Questions | NO | YES | YES | NO | **Dead backend** |
| Online Exam Marks | NO | YES | YES | NO | **Dead backend** |

**Entire module is Supabase-only. No backend support.**

### 2.10 Attendance

| Feature | Backend | API Server | Org Frontend | Next.js | Status |
|---------|---------|------------|--------------|---------|--------|
| Mark Attendance | YES | YES | YES | YES | API OK |
| Attendance Report | YES | YES | YES | YES | API OK |
| Attendance Logs | YES | YES | YES | YES | API OK |
| Holiday Apply | NO | NO | **LOCAL ONLY** | NO | **Dead backend** |

### 2.11 ID/Admit Cards & Documents

| Feature | Backend | API Server | Org Frontend | Next.js | Status |
|---------|---------|------------|--------------|---------|--------|
| ID Card Template | NO | NO | YES | NO | **Dead backend** |
| Generate ID Cards | NO | NO | YES | NO | **Dead backend** |
| Admit Card Template | NO | NO | YES | NO | **Dead backend** |
| Generate Admit Cards | NO | NO | YES | NO | **Dead backend** |
| Document Designer | NO | NO | YES | NO | **Dead backend** |
| Certificate Template | NO | NO | YES | NO | **Dead backend** |
| Generate Certificates | NO | NO | YES | NO | **Dead backend** |
| Marksheet Template | NO | NO | YES | NO | **Dead backend** |
| Generate Marksheets | NO | NO | YES | NO | **Dead backend** |

**Entire documents/cards/certificates module has no backend.**

### 2.12 Partner Management

| Feature | Backend | API Server | Org Frontend | Next.js | Status |
|---------|---------|------------|--------------|---------|--------|
| Add Partner | NO | YES | YES | NO | **Dead backend** |
| All Partners | NO | YES | YES | NO | **Dead backend** |
| Partner Transactions | NO | YES | YES | NO | **Dead backend** |

### 2.13 Expense Management

| Feature | Backend | API Server | Org Frontend | Next.js | Status |
|---------|---------|------------|--------------|---------|--------|
| Voucher Head | NO | YES | YES | NO | **Dead backend** |
| Voucher Heads | NO | YES | YES | NO | **Dead backend** |
| Deposit Voucher | NO | YES | YES | NO | **Dead backend** |
| Expense Voucher | NO | YES | YES | NO | **Dead backend** |

### 2.14 Settings

| Feature | Backend | API Server | Org Frontend | Next.js | Status |
|---------|---------|------------|--------------|---------|--------|
| General Settings | NO | YES | YES | YES | **Dead backend** |
| Payment Gateway | NO | YES | YES | YES | **Dead backend** |
| Payment QR Code | NO | YES | YES | NO | **Dead backend** |
| Batch Payment QR | NO | YES | YES | NO | **Dead backend** |

### 2.15 Live Class

| Feature | Backend | API Server | Org Frontend | Next.js | Status |
|---------|---------|------------|--------------|---------|--------|
| View Live Classes | NO | YES | YES | NO | **Dead backend** |
| Live Class Setup | NO | YES | YES | NO | **Dead backend** |

### 2.16 Session Year

| Feature | Backend | API Server | Org Frontend | Next.js | Status |
|---------|---------|------------|--------------|---------|--------|
| Add Session Year | NO | YES | YES | NO | **Dead backend** |
| All Session Years | NO | YES | YES | NO | **Dead backend** |

### 2.17 User Management

| Feature | Backend | API Server | Org Frontend | Next.js | Status |
|---------|---------|------------|--------------|---------|--------|
| All Users | NO | YES | YES | NO | **Dead backend** |
| User Roles | NO | YES | YES | NO | **Dead backend** |
| Access Control | NO | YES | YES | NO | **Dead backend** |

### 2.18 Student Portal (/me)

| Feature | Backend | API Server | Org Frontend | Next.js | Status |
|---------|---------|------------|--------------|---------|--------|
| My Profile | YES (portal) | YES | YES | YES | API OK |
| My Classes | YES (portal) | YES | YES | NO | API OK |
| My Attendance | YES (portal) | YES | YES | NO | API OK |
| My Fees | YES (portal) | YES | YES | NO | API OK |
| My Results | YES (portal) | YES | YES | NO | API OK |
| My Documents | YES (portal) | YES | YES | NO | API OK |

### 2.19 Dashboard

| Feature | Backend | API Server | Org Frontend | Next.js | Status |
|---------|---------|------------|--------------|---------|--------|
| Admin Dashboard | YES | **HARDCODED ZEROS** | YES | YES | **BLOCKER** |
| Franchise Dashboard | YES | **HARDCODED ZEROS** | YES | YES | **BLOCKER** |
| Student Dashboard | YES (portal) | YES | YES | YES | API OK |

## 3. Dead / Stub Features

| Feature | Evidence |
|---------|----------|
| `backend/src/module/students/routes/student.routes.ts` | Returns "Hello World" — stub |
| Online Exam (all pages) | No backend API, Supabase-only |
| ID/Admit Cards (all pages) | No backend API, Supabase-only |
| Certificates/Marksheets (all pages) | No backend API, Supabase-only |
| Partners (all pages) | No backend API, Supabase-only |
| Expense (all pages) | No backend API, Supabase-only |
| Settings (all pages) | No backend API, Supabase-only |
| Live Class (all pages) | No backend API, Supabase-only |
| Session Year (all pages) | No backend API, Supabase-only |
| User Management (all pages) | No backend API, Supabase-only |
| Fee Types/Groups/Allocation | No backend API, Supabase-only |
| Holiday Apply | No backend API, localStorage-only reminders |
| Grade Management | No backend API, Supabase-only |
| Online Branch/Student Enquiry | No backend API, Supabase-only |

## 4. Data Flow Coverage

| User Action | Frontend State | Validation | API/Server | Business Logic | DB Read/Write | Response | Frontend Refresh | Persistence | Downstream |
|-------------|---------------|------------|------------|----------------|---------------|----------|-----------------|-------------|------------|
| Login | Loading → user | Zod on server | /auth/login | bcrypt compare | Read User | JWT + session | AuthContext update | localStorage | Route redirect |
| Create Enquiry | Form state | Required fields | POST /enquiries | audit log | Write VisitEnquiry | Created object | List refresh | Postgres | Dashboard count |
| Create Student | Multi-step form | Zod | POST /students | documentNo gen | Write Student | Created object | List refresh | Postgres | Invoice creation |
| Create Invoice | Invoice items | Zod | POST /fee-invoices | documentNo gen | Write FeeInvoice + Items | Created object | List refresh | Postgres | Payment tracking |
| Record Payment | Amount input | Paise arithmetic | POST /fee-payments | FOR UPDATE lock, status update | Write FeePayment, Update Invoice | Payment object | Invoice list refresh | Postgres | Balance recalculation |
| Mark Attendance | Date + students | Student belongs to branch | POST /attendance | upsert by student+date | Write AttendanceRecord | Updated list | List refresh | Postgres | Report generation |
| Create Batch Timing | Day + time | Clash detection | POST /timetable | dayOfWeek Int vs day String | Write BatchTiming | Created object | List refresh | Postgres | Student schedule |

**Critical gap:** Reception Item Dispatch/Receive have NO backend API — items are stored in mock arrays.
