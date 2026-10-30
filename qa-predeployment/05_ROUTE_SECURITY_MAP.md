# Route Security Map

Generated: 2026-09-07

## Backend Route Map (`backend/src/module/core/core.routes.ts` + `auth.routes.ts`)

Prefix: `/api/v1`

### Public Routes (No Auth Required)

| Method | Path | Purpose | Auth | Validation |
|--------|------|---------|------|------------|
| GET | /health/live | Liveness probe | None | None |
| GET | /health/ready | Readiness probe | None | DB ping |
| POST | /auth/bootstrap | First org creation | BOOTSTRAP_TOKEN header | Zod schema |
| POST | /auth/login | User login | None (rate limited) | Zod schema |
| POST | /auth/refresh | Token refresh | None (validates refresh token) | Zod schema |
| POST | /auth/logout | Session revocation | None (validates refresh token) | Zod schema |
| GET | /auth/me | Current user info | **authenticate** middleware | None |

### Protected Routes (Authenticated + Role-Gated)

| Method | Path | Allowed Roles | Business Logic | Data Access |
|--------|------|---------------|----------------|-------------|
| GET | /dashboard | SUPER_ADMIN, ORGANIZATION_ADMIN, BRANCH_ADMIN, ACCOUNTANT, RECEPTIONIST, TEACHER, STAFF | Aggregates by branch | Read-only |
| GET/POST | /batches | SUPER_ADMIN, ORGANIZATION_ADMIN, BRANCH_ADMIN, TEACHER, STAFF | Course ownership validation | CRUD |
| GET/POST | /timetable | SUPER_ADMIN, ORGANIZATION_ADMIN, BRANCH_ADMIN, TEACHER, STAFF | Clash detection | CRUD |
| GET/POST | /attendance | SUPER_ADMIN, ORGANIZATION_ADMIN, BRANCH_ADMIN, TEACHER, STAFF | Student-branch validation | CRUD with upsert |
| GET/POST/PATCH | /enquiries | SUPER_ADMIN, ORGANIZATION_ADMIN, BRANCH_ADMIN, RECEPTIONIST | Status transitions | CRUD |
| GET/POST | /students | SUPER_ADMIN, ORGANIZATION_ADMIN, BRANCH_ADMIN, RECEPTIONIST, TEACHER | documentNo gen, admissionStatus | CRUD |
| GET/POST | /courses | SUPER_ADMIN, ORGANIZATION_ADMIN | None | CRUD |
| GET/POST | /fee-invoices | SUPER_ADMIN, ORGANIZATION_ADMIN, BRANCH_ADMIN, ACCOUNTANT | documentNo gen | CRUD |
| POST | /fee-payments | SUPER_ADMIN, ORGANIZATION_ADMIN, BRANCH_ADMIN, ACCOUNTANT, RECEPTIONIST | Paise arithmetic, FOR UPDATE lock | Write + Update |
| GET/POST | /exams | SUPER_ADMIN, ORGANIZATION_ADMIN, BRANCH_ADMIN, TEACHER | passMarks <= maxMarks | CRUD |
| POST | /exam-results | SUPER_ADMIN, ORGANIZATION_ADMIN, BRANCH_ADMIN, TEACHER | Marks validation, publish flag | Upsert |
| GET | /documents/student/:id | SUPER_ADMIN, ORGANIZATION_ADMIN, BRANCH_ADMIN, TEACHER, STAFF | None | Read |
| GET | /portal/profile | STUDENT | Own profile only | Read |
| GET | /portal/attendance | STUDENT | Own records only | Read |
| GET | /portal/invoices | STUDENT | Own invoices only | Read |
| GET | /portal/results | STUDENT | Own results only | Read |
| GET | /portal/classes | STUDENT | Own classes only | Read |
| GET | /portal/requests | STUDENT | Own requests only | Read |
| GET | /notices | All authenticated | None | Read |

### Security Observations

1. **Authentication is properly applied** via `authenticate` middleware on all protected routes.
2. **RBAC is properly applied** via `permit(...roles)` on each route group.
3. **Input validation**: Zod schemas on all POST/PATCH endpoints.
4. **Rate limiting**: 200 req/min globally, 10 login attempts per 15 min.
5. **Missing**: No request body size limit on API routes (only global 1MB JSON limit).
6. **Missing**: No audit logging on write operations (audit util exists but is not called in routes).

### RBAC Matrix

| Feature | SUPER_ADMIN | ORG_ADMIN | BRANCH_ADMIN | ACCOUNTANT | RECEPTIONIST | TEACHER | STAFF | STUDENT |
|----------|-------------|-----------|--------------|------------|--------------|---------|-------|---------|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ (portal) |
| Branch CRUD | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Course CRUD | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Batch CRUD | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ |
| Timetable | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ |
| Student CRUD | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Enquiries | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Invoices | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Payments | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Exams | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Attendance | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ |
| Notices | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Documents | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Portal (own) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## Organization Frontend Route Map

Prefix: `/` (React Router v7)

### Public Routes

| Path | Component | Purpose |
|------|-----------|---------|
| /login | Login.tsx | Supabase auth sign-in |

### Admin-Only Routes

All routes accessible to SUPER_ADMIN and ORGANIZATION_ADMIN (view: "admin"), except `/me/*`:

| Path | Module | Backend API |
|------|--------|-------------|
| / | Dashboard (Index) | /dashboard |
| /reception/enquiry | Reception | /enquiries |
| /reception/dispatch | Reception | **NONE (mock)** |
| /branch/create | Branch | /batches (indirect) |
| /branch/view | Branch | — |
| /branch/wallet | Branch | — |
| /branch/transactions | Branch | — |
| /branch/notice-board | Branch | /notices |
| /branch/website-settings | Branch | — |
| /enquiry/branch | Enquiry | /enquiries |
| /enquiry/online-branch | Enquiry | **NONE** |
| /enquiry/online-student | Enquiry | **NONE** |
| /course/create | Course | /courses |
| /course/view | Course | /courses |
| /course/batch/create | Course | /batches |
| /course/batch/timing | Course | /timetable |
| /course/batch/assign | Course | — |
| /student/admission-form | Student | /students |
| /student/view | Student | /students |
| /student/online-admissions | Student | **NONE** |
| /fee/types | Fee | **NONE** |
| /fee/groups | Fee | **NONE** |
| /fee/allocation | Fee | **NONE** |
| /fee/collection | Fee | /fee-invoices |
| /fee/due-collection | Fee | /fee-payments |
| /exam/marks-list | Exam | /exams, /exam-results |
| /exam/create | Exam | /exams |
| /exam/schedule | Exam | — |
| /exam/assign-marks | Exam | /exam-results |
| /exam/grade-management | Exam | **NONE** |
| /online-exam/create | Online Exam | **NONE** |
| /online-exam/question-paper-builder | Online Exam | **NONE** |
| /online-exam/add-questions | Online Exam | **NONE** |
| /online-exam/marks | Online Exam | **NONE** |
| /live-class/view | Live Class | **NONE** |
| /live-class/setup | Live Class | **NONE** |
| /cards/id-template | Cards | **NONE** |
| /cards/generate-id | Cards | **NONE** |
| /cards/admit-template | Cards | **NONE** |
| /cards/generate-admit | Cards | **NONE** |
| /documents/designer | Documents | **NONE** |
| /certificate/template | Certificate | **NONE** |
| /certificate/generate | Certificate | **NONE** |
| /marksheet/template | Marksheet | **NONE** |
| /marksheet/generate | Marksheet | **NONE** |
| /settings/general | Settings | **NONE** |
| /settings/payment-gateway | Settings | **NONE** |
| /settings/payment-qr | Settings | **NONE** |
| /settings/batch-qr | Settings | **NONE** |
| /partners/add | Partners | **NONE** |
| /partners/all | Partners | **NONE** |
| /partners/transactions | Partners | **NONE** |
| /expense/voucher-head | Expense | **NONE** |
| /expense/voucher-heads | Expense | **NONE** |
| /expense/deposit-voucher | Expense | **NONE** |
| /expense/expense-voucher | Expense | **NONE** |
| /attendance/mark | Attendance | /attendance |
| /attendance/report | Attendance | /attendance |
| /attendance/logs | Attendance | /attendance |
| /attendance/holiday-apply | Attendance | **NONE** |
| /user/all | User Mgmt | **NONE** |
| /user/roles | User Mgmt | **NONE** |
| /user/access-control | User Mgmt | **NONE** |
| /session/add | Session | **NONE** |
| /session/all | Session | **NONE** |

### Franchise-Only Routes

Accessible to BRANCH_ADMIN, FRANCHISE, ACCOUNTANT, RECEPTIONIST, TEACHER, STAFF:

| Path | Module | Backend API |
|------|--------|-------------|
| / | FranchiseDashboard | /dashboard |
| /reception/enquiry | Reception | /enquiries |
| /reception/dispatch | Reception | **NONE (mock)** |
| /enquiry/branch | Enquiry | /enquiries |
| /enquiry/online-student | Enquiry | **NONE** |
| /student/admission-form | Student | /students |
| /student/view | Student | /students |
| /student/online-admissions | Student | **NONE** |
| /course/view | Course | /courses |
| /course/batch/create | Course | /batches |
| /course/batch/timing | Course | /timetable |
| /course/batch/assign | Course | — |
| /fee/collection | Fee | /fee-invoices |
| /fee/due-collection | Fee | /fee-payments |
| /exam/marks-list | Exam | /exams |
| /live-class/view | Live Class | **NONE** |
| /cards/generate-id | Cards | **NONE** |
| /cards/generate-admit | Cards | **NONE** |
| /certificate/generate | Certificate | **NONE** |
| /branch/wallet | Branch | — |
| /branch/transactions | Branch | — |
| /branch/notice-board | Branch | /notices |
| /branch/website-settings | Branch | — |
| /expense/deposit-voucher | Expense | **NONE** |
| /expense/expense-voucher | Expense | **NONE** |
| /attendance/mark | Attendance | /attendance |
| /attendance/report | Attendance | /attendance |
| /attendance/logs | Attendance | /attendance |

### Student Portal Routes

Accessible to STUDENT only:

| Path | Purpose | Backend API |
|------|---------|-------------|
| /me | StudentDashboard | /portal/* |
| /me/classes | MyClasses | /portal/classes |
| /me/attendance | MyAttendance | /portal/attendance |
| /me/fees | MyFees | /portal/invoices |
| /me/results | MyResults | /portal/results |
| /me/documents | MyDocuments | /portal/documents |
| /me/profile | MyProfile | /portal/profile |

---

## API Server Route Map (`api-server/src/routes/`)

Prefix: `/api/v1`

### Route Security Issues

**CRITICAL: No authentication middleware is applied to any route.**

| Path | Method | Auth Applied | Data Exposure |
|------|--------|-------------|---------------|
| /auth/bootstrap | POST | None | Can initialize any org |
| /auth/login | POST | None | No rate limiting |
| /core/dashboard | GET | None | All org data visible |
| /core/batches | GET/POST | None | Unauthorized CRUD |
| /core/attendance | GET/POST | None | Unauthorized CRUD |
| /core/enquiries | GET/POST/PATCH | None | Unauthorized CRUD |
| /core/students | GET/POST | None | Unauthorized CRUD |
| /core/courses | GET/POST | None | Unauthorized CRUD |
| /core/exams | GET/POST | None | Unauthorized CRUD |
| /core/fees | GET/POST | None | Unauthorized CRUD |
| /core/timetable | GET/POST | None | Unauthorized CRUD |
| /core/notices | GET | None | All notices visible |

---

## Security Gaps Summary

| Gap | Severity | Impact |
|-----|----------|--------|
| api-server routes unauthenticated | P0-BLOCKER | All Supabase data exposed |
| No audit logging on writes | P2-HIGH | No traceability |
| api-server no rate limiting | P2-HIGH | Brute force / DoS |
| api-server no helmet headers | P2-HIGH | Missing security headers |
| api-server wildcard CORS | P2-HIGH | CSRF risk |
| Backend missing body size limits per route | P3-MEDIUM | Potential memory issues |
| No CSRF tokens | P3-MEDIUM | State-changing requests vulnerable |
| JWT secret hardcoded in api-server .env.example | P3-MEDIUM | Credential leakage risk |
