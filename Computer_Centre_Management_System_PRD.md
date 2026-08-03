# Computer Centre Management System (CCMS)

## Product Requirements Document and Claude Code Build Specification

**Version:** 1.0  
**Date:** 3 August 2026  
**Status:** Build-ready specification  
**Target stack:** Next.js, TypeScript, Supabase, Vercel, GitHub  
**Product type:** Multi-tenant computer education, franchise and training-centre management SaaS

---

## 1. Document Purpose

This document defines a complete, production-grade Computer Centre Management System. It is intended to be given directly to Claude Code as the authoritative product and technical specification.

The product should support a head office or education brand operating many computer centres, plus each centre's students, staff, fees, attendance, examinations, results, certificates, inventory orders, wallet transactions, referrals, accounting and support requests. It must also include a public marketing website and public verification tools.

The system may use the referenced WTCA website and supplied centre-dashboard screenshot only as business-domain inspiration. Do not copy its proprietary code, brand assets, text, database, personal data or visual design. Build an original, modern and secure product.

### 1.1 Evidence boundary

Observed from the public website:

- Public home, about, courses, course details, contact, photo gallery and video gallery.
- Public registration verification using student name and date of birth.
- Public result/certificate verification using registration number.
- Separate centre/client login and student login.
- Public course catalogue with pagination, duration, course code, level and enquiry-oriented pricing.

Observed from the supplied centre-dashboard screenshot:

- Dashboard, shop, orders, student registration and student viewing.
- Results, performance reports and live exams.
- Referral, wallet statement and recharge.
- Attendance, fee management, income/expense and support.
- Centre profile, student application statuses and dispatched-item status.

All additional workflows in this PRD are recommended requirements for a complete production system, not claims about private screens that were not inspected.

---

## 2. Product Vision

Create one central platform where an education organisation can:

1. Manage every branch or franchise centre from head office.
2. Let each centre operate independently without seeing another centre's data.
3. Manage the full student lifecycle from enquiry through certification.
4. Conduct secure online exams and publish results.
5. Track fees, wallets, purchases, income and expenses with auditable ledgers.
6. Let students access learning, attendance, payments, exams, results and certificates.
7. Allow anyone to verify genuine registrations and certificates without exposing sensitive student data.
8. Scale from one centre to thousands of centres using a multi-tenant architecture.

### 2.1 Success metrics

- A centre can register a valid student in under five minutes.
- Daily attendance for a batch can be recorded in under two minutes.
- Every monetary movement has an immutable ledger record and actor identity.
- No cross-centre data leakage in automated security tests.
- A certificate can be publicly verified in under three seconds.
- 95% of normal pages achieve p75 LCP under 2.5 seconds on mid-range mobile networks.
- At least 99.9% monthly application availability, excluding planned maintenance.
- All critical workflows are usable on 360px mobile screens and desktop.

---

## 3. Product Scope

### 3.1 In scope for Version 1

- Public website and course catalogue.
- Multi-tenant authentication and role-based access control.
- Super Admin/Head Office portal.
- Centre Owner/Director portal.
- Centre staff accounts with granular permissions.
- Student portal.
- Centre onboarding, approval, suspension and profile management.
- Course, subject, syllabus, batch and timetable management.
- Leads, admissions, document review and student records.
- Attendance and leave management.
- Fee plans, instalments, invoices, receipts, dues and discounts.
- Online and offline payment recording.
- Centre prepaid wallet and recharge approval.
- Question bank, exam scheduling, online exams, evaluation and results.
- Performance reports, mark sheets and verifiable certificates.
- Product catalogue, centre orders, dispatch and stock receipt.
- Referrals and commission tracking.
- Income, expenses and basic centre accounting.
- Notifications, announcements and support tickets.
- Public registration and certificate verification.
- Reports, exports and audit logs.

### 3.2 Later phases

- Native Android/iOS applications.
- Recorded learning content and full LMS.
- Biometric attendance device integration.
- WhatsApp Business API automation.
- Advanced placement/job portal.
- Payroll and full HRMS.
- GST e-invoicing or external accounting integrations.
- AI tutor, automated question generation and predictive analytics.

### 3.3 Explicitly out of scope for Version 1

- Building an unregulated banking or stored-value product.
- Direct access to another organisation's database or proprietary content.
- Automated certificate approval without authorised human review.
- Storing card numbers, CVV or online-banking credentials.

---

## 4. User Roles and Access Model

Use both role-based and tenant-scoped access. A user can hold more than one membership, but every request must resolve an active organisation and, where relevant, an active centre.

| Role                       | Scope                         | Primary capabilities                                                                                                       |
| -------------------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Platform Super Admin       | Entire platform               | Global settings, tenants, centres, courses, approvals, finance oversight, exams, certificates, products, reports, security |
| Head Office Operator       | Entire organisation           | Operational modules allowed by permission set; no security-owner actions by default                                        |
| Finance Admin              | Entire organisation           | Wallets, payments, invoices, commissions, refunds, accounting reports                                                      |
| Exam Controller            | Entire organisation           | Question banks, exams, evaluation, results, mark sheets and certificates                                                   |
| Inventory Manager          | Entire organisation           | Products, stock, orders, dispatch, shipment tracking                                                                       |
| Support Agent              | Assigned organisation/tickets | Ticket handling and knowledge-base responses; restricted student access                                                    |
| Centre Owner/Director      | One or more assigned centres  | Centre profile, staff, students, batches, attendance, fees, orders, reports                                                |
| Centre Manager             | Assigned centre               | Most centre operations excluding owner/security/settlement controls                                                        |
| Counsellor/Admission Staff | Assigned centre               | Leads, applications, admissions, documents and follow-ups                                                                  |
| Faculty                    | Assigned batches              | Timetable, attendance, learning resources, internal marks and assigned exams                                               |
| Accountant                 | Assigned centre               | Fees, receipts, dues, expenses and permitted reports                                                                       |
| Student                    | Self only                     | Profile, course, timetable, attendance, fees, exams, results, documents and support                                        |
| Public Visitor             | Public only                   | Website, courses, enquiries and verification tools                                                                         |

### 4.1 Permission principles

- Default deny: access exists only when explicitly granted.
- Tenant isolation: `organization_id` must be present on tenant-owned records.
- Centre isolation: centre users can access only centres listed in active memberships.
- Students can access only records linked to their own `student_id`.
- Privileged actions require step-up confirmation and a reason: refunds, result unlocks, certificate revocation, wallet adjustments, role changes and record deletion.
- Service-role Supabase keys are server-only and never exposed to browsers.
- RLS is mandatory on every tenant or personal-data table.

---

## 5. Information Architecture

### 5.1 Public application

- Home
- About
- Courses
- Course detail
- Centres/Find a centre
- Online admission enquiry
- Registration verification
- Result/certificate verification
- Photo gallery
- Video gallery
- Notices
- Contact
- Centre login
- Student login

### 5.2 Super Admin navigation

- Dashboard
- Organisations and centres
- Centre applications
- Users, roles and permissions
- Students and admissions
- Academic setup
- Courses and subjects
- Batches and timetables
- Attendance
- Exams and question banks
- Results, mark sheets and certificates
- Fees, payments and refunds
- Wallets and commissions
- Products, inventory and orders
- Referrals
- Income and expenses
- Content and website
- Notifications and announcements
- Support tickets
- Reports and exports
- Audit logs
- Settings and integrations

### 5.3 Centre portal navigation

- Dashboard
- Centre profile
- Leads and enquiries
- New student
- Students
- Batches and timetable
- Attendance
- Fee management
- Exams
- Results and performance
- Certificates and ID cards
- Shop
- My orders
- Wallet and recharge
- Referrals
- Income and expenses
- Staff
- Announcements
- Support
- Reports
- Settings

### 5.4 Student portal navigation

- Dashboard
- My profile
- My course and batch
- Timetable
- Attendance
- Fees and receipts
- Study materials
- Live/upcoming exams
- Results and performance
- Certificates and ID card
- Announcements
- Support
- Security and password

---

## 6. Core End-to-End Workflows

### 6.1 Centre onboarding

1. Applicant submits organisation/centre details, director identity, address, contact, tax/registration fields and documents.
2. System generates an application number and marks the application `submitted`.
3. Head office reviews documents and can request changes with field-level comments.
4. Finance/admin defines joining fee, document fee, security deposit, plan and wallet rules.
5. Authorised approver approves or rejects the application with a recorded reason.
6. On approval, system creates a unique centre code, centre owner membership and initial wallet ledger entry.
7. A secure invitation is sent to set a fresh password. Never send plaintext passwords.
8. Centre remains `active`, `suspended`, `expired` or `closed`. Suspension instantly blocks operational writes but preserves data.

Statuses: `draft`, `submitted`, `under_review`, `changes_requested`, `approved`, `rejected`, `cancelled`.

### 6.2 Lead-to-admission workflow

1. Lead arrives from website, manual entry, phone, referral or campaign.
2. Counsellor assigns course interest, source, priority, next follow-up and notes.
3. Lead progresses through `new`, `contacted`, `counselling`, `application_started`, `converted`, `lost`.
4. Application captures personal details, guardian, address, education, identity, photograph, signature, chosen course, batch and fee plan.
5. Duplicate detection checks phone, email, government-ID hash and date of birth within authorised scope.
6. Required documents are uploaded and reviewed.
7. Centre submits admission for approval if head-office approval is configured.
8. On approval, system atomically generates registration number, student account, enrolment, fee schedule and admission receipt.
9. Student receives an invitation/OTP-based activation link.

### 6.3 Registration-number format

Make format configurable per organisation, for example:

`ORG-CENTRE-YY-COURSE-SEQUENCE`

Use a database transaction or locked sequence to prevent duplicates. Registration numbers are immutable after issue. Corrections should affect student fields, not the identifier.

### 6.4 Attendance workflow

1. Faculty chooses date, batch and scheduled session.
2. Roster loads only active enrolments for that date.
3. Default status is unmarked, never automatically present.
4. Faculty marks present, absent, late, excused or leave and submits.
5. Submission records actor and timestamp. Editing after the configurable lock time requires permission and a reason.
6. Student and centre dashboards update attendance percentage.
7. Low-attendance alerts trigger at configurable thresholds.

### 6.5 Fee workflow

1. Course fee structure defines admission fee, tuition, exam, certificate, material and other components.
2. Student fee plan generates dated instalments.
3. Discounts require reason and optional approval based on amount threshold.
4. Payment can be cash, UPI, bank transfer, card via gateway, cheque or wallet where allowed.
5. Successful posting creates payment, allocations, receipt number and double-entry-style ledger rows in one transaction.
6. Partial payments allocate using configured priority or manual allocation.
7. Reversal/refund never deletes the original payment. It creates linked negative/adjustment entries after approval.
8. Receipt PDF contains organisation, centre, student, payment breakdown, transaction reference and QR verification URL.

### 6.6 Centre wallet workflow

The wallet is an internal prepaid operational ledger, not a bank account.

1. Centre requests recharge and uploads payment reference/proof, or uses an integrated payment gateway.
2. Payment success webhook or finance approval credits the wallet.
3. Eligible actions debit wallet: admission processing, exam fee, certificate fee, product order or platform charge.
4. Debit is rejected when balance is insufficient; balance must be computed from immutable ledger entries.
5. Manual adjustment requires finance permission, reason and audit log.
6. Every entry displays opening balance, credit/debit, closing balance, reference type and actor.

### 6.7 Online examination workflow

1. Exam Controller creates exam, sections, marks, duration, availability window, attempt rules and eligibility.
2. Questions come from a tagged question bank or fixed paper. Supported types: single choice, multiple choice, true/false, fill-in, short answer, long answer and file upload.
3. System generates per-student attempt tokens only for eligible active enrolments.
4. Student starts exam after server-side time validation and instructions acknowledgement.
5. Answers auto-save periodically and on navigation.
6. Objective questions auto-evaluate. Subjective answers enter evaluation queue.
7. Timeout performs server-side submission. Network recovery can resume until server deadline.
8. Result remains draft until approved and published.
9. Any result modification after publish creates a new version with reason and approver.

### 6.8 Result and certificate workflow

1. Result calculation applies course/exam grading rules.
2. Controller reviews anomalies, absent status, practical marks and moderation.
3. Publish makes result visible to student and enables mark-sheet generation.
4. Certificate issuance requires course completion, fee clearance, attendance rule and passed result unless overridden with authorised reason.
5. Generated certificate has unique certificate number, QR code and signed verification payload.
6. Public verification returns limited fields: student name (optionally masked), programme, centre, issue date, result/grade and certificate validity.
7. Certificate can be `issued`, `revoked`, `superseded` or `expired`; revocation reason is publicly summarized without sensitive internal notes.

### 6.9 Shop and order workflow

1. Head office manages catalogue items such as books, ID cards, certificate stationery, uniforms and marketing material.
2. Centre creates cart and places order.
3. Inventory is reserved only after payment/wallet authorisation.
4. Order passes through `pending_payment`, `confirmed`, `processing`, `packed`, `dispatched`, `delivered`, `cancelled` or `returned`.
5. Dispatch records courier, tracking number, package count and timestamp.
6. Centre acknowledges delivery and can raise shortage/damage issue.

### 6.10 Support workflow

1. User creates ticket with category, priority, subject, message and attachments.
2. Ticket receives human-readable number and SLA target.
3. Support agent is assigned; public replies notify requester.
4. Internal notes are never visible to centre/student users.
5. Statuses: `open`, `assigned`, `waiting_on_support`, `waiting_on_requester`, `resolved`, `closed`, `reopened`.
6. Resolution time and first-response time are reportable.

---

## 7. Functional Requirements by Module

### 7.1 Dashboards

Super Admin dashboard:

- Active, pending, suspended and expiring centres.
- Total and newly admitted students.
- Admissions awaiting approval.
- Today/month fee collections and overdue amount.
- Wallet credits/debits and low-balance centres.
- Exams today, attempts in progress and pending evaluations.
- Orders by status and low-stock products.
- Open tickets and SLA breaches.
- Trends by date, region, centre and course.
- Drill-down from every metric; no decorative numbers without accessible source lists.

Centre dashboard:

- Centre name/code/status and wallet balance.
- Students, pending applications, rejected applications and documents dispatched.
- Today attendance and low-attendance students.
- Today/month collections, dues and upcoming instalments.
- Current batches and upcoming exams.
- Recent orders and support tickets.
- Quick actions: new student, take attendance, record payment, recharge wallet, place order, create ticket.

Student dashboard:

- Course, batch and centre.
- Attendance percentage and warnings.
- Next class and upcoming exam.
- Fee due date and amount.
- Recent result and available certificates.
- Announcements and support status.

### 7.2 Centre management

- Search/filter/sort/export centres.
- Centre profile: code, legal/display name, owner/director, logo/photo, contact, address, region, joining date, plan, fees, validity and status.
- Centre documents with type, expiry, review status and reviewer notes.
- Staff invitations and permission templates.
- Centre-wise course availability and custom pricing within approved limits.
- Renewal, suspension, closure and data-retention workflow.
- Centre transfer/ownership change with approval and audit trail.

### 7.3 Student information system

- Full student profile with controlled fields and validation.
- Guardian/emergency contact.
- Address and education history.
- Documents, photo and signature.
- Enrolments, course changes, batch transfers and status history.
- Registration card and ID-card generation.
- Notes with visibility: centre private, head-office private, shared.
- Bulk import using validated CSV template with preview and row-level errors.
- Export only for authorised roles; sensitive fields can be masked.
- Archive, withdrawal, course completion and alumni status.

Student statuses: `applicant`, `pending_approval`, `active`, `on_hold`, `completed`, `withdrawn`, `cancelled`, `rejected`.

### 7.4 Academic management

- Course categories, levels, course codes and descriptions.
- Duration in days/weeks/months and total instructional hours.
- Subjects/modules with theory/practical hours and ordering.
- Syllabus versions; an enrolment must retain its assigned version.
- Eligibility, passing criteria, attendance minimum and certificate template.
- Centre-course offering approvals.
- Batches with capacity, faculty, room, start/end dates and schedule.
- Timetable recurrence with exception dates and holiday calendar.
- Study-material metadata and role-scoped downloads.

### 7.5 Attendance and leave

- Session-based and day-based modes.
- Bulk mark, individual notes and late duration.
- Holiday and centre closure support.
- Student leave request and approval.
- Monthly register, course summary, batch summary and defaulter list.
- Correction workflow and locked-period rules.
- CSV/PDF export.

### 7.6 Fees and accounting

- Configurable fee heads, tax settings and course fee templates.
- Student-specific plans and instalment rescheduling with audit.
- Invoices, receipts, credit notes, refunds and write-offs.
- Dues, ageing buckets and reminder schedule.
- Cash closing report by collector and date.
- Income/expense categories and voucher attachments.
- Centre profit summary without treating wallet movements as revenue.
- Gateway webhook reconciliation and unmatched-payment queue.
- Financial period locking.

### 7.7 Examination system

- Question bank, tags, difficulty, subject, marks and negative marks.
- Bulk question import with validation.
- Paper blueprints and randomisation rules.
- Exam eligibility, instructions, schedule, duration and attempt limits.
- Browser focus-change logging as a signal only, not automatic proof of misconduct.
- Server-authoritative timer and idempotent answer saves.
- Manual evaluation queues and moderation.
- Grace marks with permission and reason.
- Result publishing, withholding, re-evaluation and version history.
- Performance analysis by student, batch, centre, course, subject and question.

### 7.8 Certificates and documents

- Template designer based on approved HTML/CSS variables, with preview.
- Mark sheet, course certificate, provisional certificate, ID card and registration card.
- Sequential unique document numbers.
- Server-side PDF rendering.
- QR-based verification URL.
- Digital signature image is permission-restricted and server-injected.
- Reissue, correction, supersede and revoke workflows.
- Dispatch register with order/courier tracking.

### 7.9 Public verification

- Rate-limited, abuse-resistant public form.
- Registration verification supports registration number or configured name+DOB combination.
- Certificate/result verification supports certificate or registration number and optional DOB challenge.
- Exact-match responses reveal minimum necessary information.
- No indication whether a guessed phone/email/government ID exists.
- Every verification event is logged with privacy-preserving network metadata.
- QR payload must point to the product's own HTTPS verification route, never embed sensitive data.

### 7.10 Inventory, shop and orders

- Categories, products, SKU, images, tax, price, centre eligibility and active status.
- Stock ledger, warehouse/location, opening stock, purchase receipt, reservation, dispatch, return and adjustment.
- Cart, checkout, wallet/payment, invoice and order timeline.
- Partial dispatch and back-order support.
- Low-stock threshold and reorder report.
- Centre order history, downloadable invoice and proof of delivery.

### 7.11 Referral and commission

- Unique referral codes/links for authorised centres/users.
- Referral attribution with configurable validity window.
- Commission rule by event: centre approval, student admission, course or paid fee.
- Commission states: `pending`, `approved`, `payable`, `paid`, `reversed`.
- Self-referral and duplicate detection.
- Commission ledger and payout report.

### 7.12 Notifications and content

- In-app notifications mandatory; email/SMS/WhatsApp adapters optional.
- Notification templates with variables, language and channel.
- Event-based triggers for admission, fee due, payment, exam, result, certificate, order and support.
- User notification preferences, except mandatory security/transaction messages.
- Announcements targeted by organisation, centre, role, batch, course or student.
- Public CMS for pages, courses, news/notices, gallery, contact details and SEO metadata.

### 7.13 Reports

- Centre growth, status, geography and renewal.
- Admissions by date, centre, course, source and counsellor.
- Student active/completed/withdrawn and demographic summaries.
- Attendance percentage and defaulters.
- Collection, dues, discount, refund, cash and gateway reconciliation.
- Wallet statements and liability summary.
- Exam participation, pass rate, score distribution and pending evaluation.
- Certificates issued/revoked/reissued.
- Inventory movement, sales, dispatch and returns.
- Referral commission and support SLA.
- Every report supports saved filters, role-safe export and export audit.

---

## 8. UX and Design Requirements

### 8.1 Design direction

- Original, professional education-SaaS appearance; do not clone the reference UI.
- Desktop-first admin experience with complete mobile responsiveness.
- Collapsible left navigation on desktop and bottom/sheet navigation on mobile.
- Clear page title, breadcrumb, primary action, filter bar and data table.
- Use cards only for summarised metrics; operational data belongs in tables/lists.
- Consistent statuses with text and icons, not colour alone.
- Recommended visual system: neutral background, white surfaces, navy primary, blue interaction colour and restrained success/warning/error tones.
- Use Inter or another highly readable open-source sans-serif font.

### 8.2 Accessibility

- WCAG 2.2 AA target.
- Keyboard-accessible navigation, dialogs, tables and exam controls.
- Visible focus indicators.
- Form labels, help text and specific validation errors.
- Minimum 4.5:1 text contrast.
- Reduced-motion support.
- Screen-reader announcements for auto-save, errors and exam timer warnings.

### 8.3 Data-table standard

- Server-side pagination, filtering and sorting.
- Column chooser, density control and saved views for large modules.
- Selection must show action scope and count.
- Destructive or financial bulk actions need confirmation and permission.
- Empty, loading, error and permission-denied states are explicitly designed.

### 8.4 Mobile requirements

- All centre daily operations work at 360px width.
- Attendance uses sticky student name and tap-sized statuses.
- Tables transform into readable cards only when columns cannot remain meaningful.
- Student portal is installable as a PWA in a later minor release.

---

## 9. Technical Architecture

### 9.1 Required stack

- Next.js current stable release with App Router and TypeScript strict mode.
- React Server Components by default; Client Components only where interactive state requires them.
- Supabase Postgres, Auth, Storage, Realtime where justified, and Edge Functions or Next.js server routes.
- Vercel for web hosting, preview deployments and scheduled jobs where supported.
- GitHub for source control, pull requests, issue tracking and CI.
- Tailwind CSS plus an accessible component system such as shadcn/ui.
- Zod for shared validation.
- React Hook Form for complex forms.
- TanStack Table for large operational tables.
- Server-side PDF generation using a controlled HTML-to-PDF service/runtime; confirm Vercel runtime compatibility.

### 9.2 Recommended repository structure

- `app/(public)`: marketing, catalogue, enquiry and verification routes.
- `app/(auth)`: centre/student sign-in, reset and invitation routes.
- `app/admin`, `app/centre`, `app/student`: role-specific route groups and layouts.
- `app/api`: versioned routes, webhooks and external integrations.
- `components/ui`, `components/forms`, `components/tables`, `components/charts`: reusable presentation primitives.
- `features`: domain modules for admissions, students, attendance, fees, exams, certificates, inventory and support.
- `lib/auth`, `lib/db`, `lib/permissions`, `lib/validation`, `lib/money`, `lib/audit`, `lib/notifications`: shared server and domain infrastructure.
- `supabase/migrations`, `supabase/tests`, `supabase/seed.sql`: database history, RLS/integration tests and synthetic seed data.
- `tests/unit`, `tests/integration`, `tests/e2e`: application test suites.
- `types`: generated database types and shared contracts.
- `docs`: architecture decisions, operating guides and runbooks.

### 9.3 Application boundaries

- Browser: presentation, non-sensitive state and calls to server actions/routes.
- Next.js server: authorisation checks, business orchestration, secure document generation and third-party integrations.
- Postgres: constraints, transactions, RLS, ledgers, sequences and critical invariants.
- Supabase Storage: private files with signed, short-lived access URLs.
- Background jobs: notifications, exports, PDF generation, large imports and reconciliation.

Do not place business-critical authorisation only in UI code.

### 9.4 Multi-tenancy model

- `organizations` is the top-level tenant.
- `centres` belongs to one organisation.
- `profiles` maps one-to-one to Supabase Auth users.
- `memberships` links users to organisation and optionally centre with role and status.
- All operational tables contain `organization_id`; centre-owned tables also contain `centre_id`.
- RLS uses helper functions such as `is_org_member`, `has_permission`, `can_access_centre` and `is_current_student` implemented as stable, security-definer functions with carefully fixed `search_path`.
- Global platform staff are stored separately from tenant roles and audited heavily.

### 9.5 Server-side invariants

- Money stored as integer paise (`bigint`) plus ISO currency code; never floating point.
- Immutable ledger entries; corrections use reversals.
- Unique registration, receipt, invoice, order, ticket and certificate numbers enforced by database constraints.
- Every state transition validates the previous state.
- Admission approval, payment posting, wallet debit, inventory reservation, result publication and certificate issuance run inside transactions.
- All create/payment/webhook endpoints support idempotency keys.
- Use database timestamps in UTC and render in user-configured timezone.

---

## 10. Supabase Database Blueprint

All primary keys use UUID unless a ledger benefits from an additional monotonically increasing sequence. Every mutable table should include `created_at`, `created_by`, `updated_at`, `updated_by`; soft-deletable reference records include `deleted_at`.

### 10.1 Identity and tenancy

| Table                        | Key fields and purpose                                                                                |
| ---------------------------- | ----------------------------------------------------------------------------------------------------- |
| `profiles`                   | `id = auth.users.id`, name, phone, avatar, locale, timezone, status                                   |
| `organizations`              | legal/display name, slug, branding, default currency/timezone, status                                 |
| `centres`                    | organisation, unique code, name, director, contacts, address, geo, plan, joining/expiry dates, status |
| `memberships`                | user, organisation, optional centre, role, status, invited/accepted timestamps                        |
| `roles`                      | organisation or platform scope, name, system flag                                                     |
| `permissions`                | stable permission code and description                                                                |
| `role_permissions`           | role-to-permission mapping                                                                            |
| `centre_documents`           | centre, type, storage path, dates, status, reviewer, notes                                            |
| `centre_applications`        | applicant data, workflow status, submitted/reviewed/approved fields                                   |
| `centre_application_reviews` | field/group, decision, comment, reviewer, timestamp                                                   |

### 10.2 CRM, student and academics

| Table                     | Key fields and purpose                                                                                     |
| ------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `leads`                   | centre, name, contacts, source, interested course, owner, stage, next follow-up                            |
| `lead_activities`         | lead, type, note, outcome, next action, actor                                                              |
| `students`                | centre, optional auth user, registration number, personal/guardian/address fields, photo/signature, status |
| `student_documents`       | student, type, storage path, status, reviewer and expiry                                                   |
| `student_status_history`  | student, from/to status, reason, actor                                                                     |
| `course_categories`       | name, slug, order, status                                                                                  |
| `courses`                 | category, code, title, description, level, duration, hours, eligibility, status                            |
| `course_versions`         | course, version, syllabus, passing/attendance rules, effective dates                                       |
| `subjects`                | course version, code, name, theory/practical hours, order                                                  |
| `centre_course_offerings` | centre, course version, approval, capacity, local price rules                                              |
| `batches`                 | centre, offering, code, faculty, capacity, dates, status                                                   |
| `batch_schedules`         | batch, weekday/date rule, start/end time, room, faculty                                                    |
| `enrolments`              | student, centre, course version, batch, dates, status, completion fields                                   |
| `enrolment_history`       | enrolment changes and reasons                                                                              |
| `holidays`                | organisation/centre scope, date range, name                                                                |
| `study_materials`         | course/subject/batch scope, title, type, storage/URL, visibility                                           |

### 10.3 Attendance

| Table                    | Key fields and purpose                                                           |
| ------------------------ | -------------------------------------------------------------------------------- |
| `attendance_sessions`    | centre, batch, date, schedule, topic, start/end, status, submitted/locked fields |
| `attendance_records`     | session, student/enrolment, status, late minutes, note, marked by/time           |
| `leave_requests`         | student, date range, reason, attachment, decision and approver                   |
| `attendance_corrections` | record, old/new values, reason, requester, approver                              |

Unique constraint: one attendance record per session and enrolment.

### 10.4 Fees, payments and wallet

| Table                      | Key fields and purpose                                                             |
| -------------------------- | ---------------------------------------------------------------------------------- |
| `fee_heads`                | organisation, code, name, tax settings, status                                     |
| `course_fee_templates`     | offering/course version, fee head, amount, due rule                                |
| `student_fee_plans`        | enrolment, total, discount, net, status, approved by                               |
| `fee_instalments`          | plan, sequence, due date, amount, status                                           |
| `invoices`                 | centre, student, number, dates, subtotal, tax, total, balance, status              |
| `invoice_lines`            | invoice, fee head/item, quantity, unit amount, tax and total                       |
| `payments`                 | centre, student, receipt no., amount, method, gateway/ref, state, posted time      |
| `payment_allocations`      | payment, invoice/instalment, amount                                                |
| `refunds`                  | payment, amount, reason, status, approvals, gateway ref                            |
| `wallet_accounts`          | owner type/id, currency, status                                                    |
| `wallet_entries`           | account, sequence, credit/debit, amount, balance_after, reference, idempotency key |
| `wallet_recharge_requests` | centre account, amount, method, proof, status, reviewer                            |
| `ledger_accounts`          | scoped chart of accounts                                                           |
| `journal_entries`          | number, date, source, memo, status                                                 |
| `journal_lines`            | journal entry, account, debit/credit amount, centre/reference                      |
| `expenses`                 | centre, category, date, amount, payee, method, voucher, status                     |

Database constraint ensures exactly one of debit or credit is positive on wallet/journal lines as applicable.

### 10.5 Exams and credentials

| Table                      | Key fields and purpose                                                                  |
| -------------------------- | --------------------------------------------------------------------------------------- |
| `question_banks`           | organisation/course/subject and access scope                                            |
| `questions`                | bank, type, body, marks, negative marks, difficulty, explanation, status                |
| `question_options`         | question, label/body, correct flag, order                                               |
| `exams`                    | organisation, course/subject, title, mode, window, duration, marks, rules, status       |
| `exam_sections`            | exam, title, order, rules and marks                                                     |
| `exam_questions`           | exam/section, question, order, marks override                                           |
| `exam_assignments`         | exam, centre/batch/student scope, eligibility status                                    |
| `exam_attempts`            | exam, student, started/submitted/deadline, status, score, attempt number                |
| `exam_answers`             | attempt, question, answer JSON, saved time, awarded marks, evaluator                    |
| `exam_events`              | attempt, event type, server time, safe metadata                                         |
| `result_publications`      | exam/scope, version, status, published by/time                                          |
| `student_results`          | publication, student, marks, percentage, grade, pass state, rank optional               |
| `result_components`        | student result, subject/section, marks and grade                                        |
| `document_templates`       | type, version, HTML/CSS, variable schema, status                                        |
| `issued_documents`         | student, type, unique number, template version, storage path, hash, issue/status fields |
| `document_status_history`  | issued document, from/to status, reason, actor                                          |
| `public_verification_logs` | type, query hash, result category, rate-limit metadata, timestamp                       |

### 10.6 Inventory, referrals, support and platform

| Table                    | Key fields and purpose                                                      |
| ------------------------ | --------------------------------------------------------------------------- |
| `product_categories`     | name, code, order, status                                                   |
| `products`               | SKU, name, description, images, price, tax, status                          |
| `inventory_locations`    | organisation, name, type                                                    |
| `inventory_entries`      | location, product, quantity delta, balance after, reason/reference          |
| `orders`                 | centre, number, totals, payment, fulfilment and status                      |
| `order_items`            | order, product snapshot, quantity, price, tax, fulfilment quantity          |
| `shipments`              | order, courier, tracking, dispatch/delivery, status                         |
| `shipment_items`         | shipment, order item, quantity                                              |
| `referral_codes`         | owner, code, validity, status                                               |
| `referrals`              | code, referred entity, attribution, qualifying event, status                |
| `commission_rules`       | event, amount/percentage, conditions, effective dates                       |
| `commission_entries`     | beneficiary, referral, amount, status, payout ref                           |
| `tickets`                | number, requester, centre, category, priority, assignee, status, SLA fields |
| `ticket_messages`        | ticket, sender, body, internal flag, attachments                            |
| `announcements`          | author, scope filters, title/body, publish/expiry dates                     |
| `notifications`          | recipient, event, channel, template, payload, read/delivery state           |
| `notification_templates` | event, channel, locale, subject/body, variables, status                     |
| `audit_logs`             | actor, scope, action, entity, before/after diffs, reason, request metadata  |
| `idempotency_keys`       | scope, key, request hash, response ref, expiry                              |
| `export_jobs`            | requester, report, filters, status, private storage path, expiry            |
| `system_settings`        | scoped key, validated JSON value, version                                   |

### 10.7 Storage buckets

- `public-assets`: approved website images only.
- `centre-private`: centre documents and branding drafts.
- `student-private`: photos, signatures and documents.
- `finance-private`: proofs, vouchers and reconciliations.
- `exam-private`: protected question imports and subjective uploads.
- `generated-private`: receipts, reports, mark sheets and certificates; public verification never exposes raw bucket paths.
- `support-private`: ticket attachments.

Use unpredictable object paths, MIME/size validation and signed URLs. Never make personal-document buckets public.

---

## 11. RLS and Security Requirements

### 11.1 RLS test cases are mandatory

For every table, automated tests must prove:

- Anonymous user cannot read private records.
- Student A cannot read Student B.
- Centre A cannot read or mutate Centre B.
- Centre staff cannot self-promote permissions.
- Suspended membership cannot perform protected reads/writes.
- Head-office role can access only authorised organisation data.
- Service operations still validate business rules and are audited.

### 11.2 Authentication

- Supabase Auth email/password or phone OTP based on configured tenant policy.
- Invite flow for centre/staff; no admin-created shared passwords.
- Password reset, session revocation and last-login display.
- MFA required for platform super admins and finance/exam-controller roles before production launch.
- Rate-limit login, reset, verification and exam-start endpoints.
- Generic authentication errors prevent username enumeration.

### 11.3 Application security

- Validate all inputs with Zod on server boundaries.
- Protect state-changing routes against CSRF as applicable to chosen auth pattern.
- Sanitize rich text and template HTML.
- Content Security Policy, secure headers and strict transport security.
- Virus/malware scanning integration point for uploads.
- Secrets stored only in Vercel/Supabase environment management, never Git.
- Rotate compromised credentials immediately.
- Dependency scanning, secret scanning and branch protection enabled.
- Use OWASP ASVS-inspired review for auth, access, file upload, payments and exams.

### 11.4 Privacy and retention

- Data minimisation and purpose-based collection.
- Mask government IDs and store only where legally necessary; use encryption or irreversible hash for duplicate checks.
- Configurable retention for rejected applications, logs, exports and support attachments.
- User data export/correction workflow and controlled deletion/anonymisation where legally allowed.
- Audit exports and signed URLs expire automatically.

---

## 12. API and Integration Requirements

Use server actions for tightly coupled form operations and versioned route handlers for external/webhook/mobile-facing APIs.

Recommended API groups:

- `/api/v1/public/courses`
- `/api/v1/public/verify/registration`
- `/api/v1/public/verify/certificate`
- `/api/v1/centres`
- `/api/v1/students`
- `/api/v1/admissions`
- `/api/v1/attendance`
- `/api/v1/fees`
- `/api/v1/payments`
- `/api/v1/wallets`
- `/api/v1/exams`
- `/api/v1/results`
- `/api/v1/certificates`
- `/api/v1/products`
- `/api/v1/orders`
- `/api/v1/tickets`
- `/api/v1/reports`
- `/api/v1/webhooks/payment-provider`

API conventions:

- JSON error envelope with stable code, message, field errors and request ID.
- Cursor pagination for high-volume logs/ledgers; page pagination acceptable for small catalogues.
- Idempotency key for financial/order/admission writes.
- Optimistic concurrency/version field for sensitive edits.
- Webhook signature verification and replay protection.
- OpenAPI documentation generated or maintained for external endpoints.

---

## 13. Non-Functional Requirements

### 13.1 Performance and scale

- Initial design target: 2,000 centres, 500,000 students, 10 million attendance rows and 5 million ledger rows.
- Index all tenant/scope foreign keys and frequent composite filters.
- Use query plans to validate dashboard and report queries.
- Never load unbounded tables into the browser.
- Cache public catalogue/CMS content; do not cache personalised or financial data across users.
- Use materialized views or scheduled aggregates only when measured queries justify them.

### 13.2 Reliability

- Financial and identifier-generating transactions are atomic.
- Background jobs are retryable and idempotent with dead-letter visibility.
- Webhook events stored before processing.
- Daily database backup policy and documented point-in-time recovery depending on Supabase plan.
- Quarterly restore drill for production.
- Graceful read-only behaviour where possible during downstream notification outages.

### 13.3 Observability

- Structured server logs with request ID, actor ID, organisation and centre IDs where safe.
- Error monitoring integration such as Sentry.
- Metrics for latency, error rate, job failures, webhook lag, exam auto-save failures and payment reconciliation.
- Alerts for RLS/permission errors spikes, repeated failed logins, negative-stock attempts and ledger imbalance.
- Do not log passwords, access tokens, full IDs, answer content or sensitive document URLs.

### 13.4 Browser support

- Latest two stable versions of Chrome, Edge, Firefox and Safari.
- Android Chrome and iOS Safari responsive support.
- Exam experience performs a compatibility check but provides clear fallback/error guidance.

---

## 14. Testing Strategy

### 14.1 Unit tests

- Permission decisions.
- Fee, discount, tax, allocation and balance calculations.
- Grade/result calculation.
- Registration/document numbering.
- State transition guards.
- Date/timezone and attendance percentage logic.

### 14.2 Integration/database tests

- RLS isolation for every tenant table.
- Atomic admission creation.
- Concurrent receipt/registration/certificate numbering.
- Wallet credits, debits, insufficient balance and reversals.
- Payment webhook idempotency.
- Inventory reservation and dispatch.
- Result publication versioning.

### 14.3 End-to-end tests

- Centre onboarding approval to first login.
- Lead conversion to active student.
- Attendance marking and correction.
- Fee payment to receipt and student balance.
- Recharge request to wallet credit.
- Exam creation, student attempt, evaluation, publish and certificate issue.
- Product order to dispatch and delivery.
- Public verification for valid, revoked and unknown documents.
- Cross-centre access denial.

### 14.4 Quality gates

- Type checking, linting and unit tests on every pull request.
- Supabase migration and RLS tests in CI.
- End-to-end smoke suite on preview deployments.
- Accessibility scan on primary flows.
- No merge when critical/high security findings remain.

---

## 15. GitHub Workflow

- Repository is private during development.
- Branches: protected `main`; short-lived `feature/<issue>-<name>`, `fix/...` and `chore/...` branches.
- Every change uses a pull request linked to an issue/acceptance criterion.
- Require at least one review, passing CI and up-to-date migration checks.
- Use Conventional Commits where practical.
- Never rewrite an applied production migration. Add a new forward migration.
- Maintain `README.md`, `.env.example`, architecture decision records and deployment runbook.
- Enable GitHub secret scanning, dependency alerts and CODEOWNERS for auth/database/finance areas.

Suggested CI jobs:

1. Install with locked dependencies.
2. Format/lint.
3. Type-check.
4. Unit tests with coverage.
5. Build Next.js.
6. Start local Supabase and apply migrations.
7. Run RLS/integration tests.
8. Run selected Playwright smoke tests.

---

## 16. Environments and Deployment

### 16.1 Environments

- Local: Supabase CLI and local seeded dataset.
- Preview: one Vercel preview per pull request; connect to isolated/non-production data.
- Staging: stable branch/domain with production-like configuration and anonymised seed data.
- Production: protected Vercel project and production Supabase project.

Never connect preview deployments to the production database.

### 16.2 Environment variables

Minimum categories:

- Public Supabase URL and anon key.
- Server-only Supabase service-role key.
- Application URL and environment name.
- Payment provider keys and webhook secrets.
- Email/SMS provider keys.
- PDF/signing configuration.
- Error-monitoring DSN.

Document exact variables in `.env.example` with empty safe placeholders.

### 16.3 Release process

1. PR passes all gates and preview acceptance.
2. Migration reviewed for locks, indexes, RLS and rollback/forward-fix plan.
3. Merge to main deploys staging or production according to chosen pipeline.
4. Run smoke tests for login, dashboard, student view and verification.
5. Monitor errors, payment webhooks and database load.
6. Roll back application deployment if needed; use forward database migrations for data/schema corrections.

---

## 17. Delivery Phases

### Phase 0: Foundation

- Confirm product brand, tenant model, roles and numbering rules.
- Create repository, CI, environments and coding standards.
- Implement design tokens, layout shell, Supabase clients and audit framework.
- Deliver schema baseline, migrations and RLS test harness.

### Phase 1: Public, auth and centre management

- Public website/CMS, course catalogue and enquiry form.
- Authentication, profiles, memberships and permissions.
- Centre applications, approval, profile and staff invitations.
- Dashboards with real query-backed data.

### Phase 2: Admissions and academics

- Leads, applications, documents and approvals.
- Student records, enrolments, courses, subjects, batches and timetable.
- Registration/ID cards and public registration verification.

### Phase 3: Attendance and fees

- Attendance sessions, correction and reports.
- Fee templates, plans, instalments, payments, receipts, dues and reminders.
- Income/expense and basic accounting.

### Phase 4: Exams and credentials

- Question bank, exam setup, online attempts and evaluation.
- Results, performance analytics, mark sheets, certificate issue/revoke and public verification.

### Phase 5: Wallet, shop, referrals and support

- Wallet ledger/recharge.
- Products, inventory, orders and dispatch.
- Referrals/commission.
- Ticketing, announcements and notifications.

### Phase 6: Hardening and launch

- Full RLS/security review, load tests, accessibility and browser tests.
- Data migration tools where needed.
- Backups, recovery runbook, monitoring and support process.
- Production launch and post-launch observation.

Each phase must end with working software, tests, seed/demo data and updated documentation.

---

## 18. Definition of Done

A feature is done only when:

- Acceptance criteria pass.
- Empty, loading, error and permission states exist.
- Server validation and authorisation are implemented.
- Relevant RLS policies and tests exist.
- Audit event exists for sensitive actions.
- Mobile and desktop layouts are verified.
- Accessibility basics are verified.
- Unit/integration/E2E coverage is added according to risk.
- No placeholder data is shown in production paths.
- Documentation and migrations are committed.
- Preview deployment is approved.

---

## 19. Global Acceptance Criteria

1. A user assigned only to Centre A cannot read, search, export or mutate Centre B data by changing URL, request body or Supabase query.
2. A student cannot access another student's profile, fees, attendance, exam answers, result or documents.
3. Suspending a centre prevents new admissions, attendance, financial posting and exams while authorised head office can still review historical records.
4. Posting a fee payment updates allocations, receipt and accounting records atomically; duplicate submission cannot double-post.
5. Wallet balance always equals the ordered sum of immutable ledger entries and cannot become negative unless a specifically designed overdraft feature is later approved.
6. Starting an exam creates one authorised attempt; refreshing does not reset server time or create extra attempts.
7. Published results are versioned and cannot be silently edited.
8. Every issued certificate verifies publicly and revoked certificates clearly show invalid status.
9. Financial reversals preserve the original transaction.
10. Every privileged action is attributable to an authenticated actor with timestamp and reason where required.
11. All exported personal/financial files are private, access-controlled and expire.
12. Public verification is rate-limited and reveals only minimum necessary data.

---

## 20. Claude Code Execution Instructions

Use this section as the direct implementation prompt.

### 20.1 Operating rules

- Treat this PRD as the source of truth. If a requirement is ambiguous, document the assumption before coding.
- Build in vertical slices; do not scaffold all screens with fake data.
- Start with Phase 0 and wait for approval after each phase/milestone.
- Before each milestone, provide: objective, pages, schema changes, permissions, APIs, tests and manual verification steps.
- After each milestone, provide: changed files, migrations, test output, setup commands, known limitations and exact user testing checklist.
- Never use production credentials in code, logs, commits or screenshots.
- Do not disable RLS for convenience.
- Do not expose the Supabase service-role key to client code.
- Do not represent financial values as JavaScript floating-point rupees; use integer paise.
- Do not silently invent business rules. Put configurable rules in organisation settings with validated defaults.
- Prefer small, reviewable commits and maintain a working build.

### 20.2 First response required from Claude Code

Before writing application code, return:

1. Assumptions and open decisions.
2. Final route map for public, admin, centre and student apps.
3. ERD/table plan grouped by migration.
4. Role/permission matrix.
5. RLS strategy and test matrix.
6. Phase 0 and Phase 1 implementation plan.
7. Proposed directory structure.
8. Environment-variable list.
9. Risks and mitigations.

Then create the project only after approval.

### 20.3 Initial project commands and standards

- Create a current stable Next.js TypeScript application with App Router, Tailwind and ESLint.
- Enable TypeScript strict mode and fail CI on type errors.
- Install only justified dependencies and commit the lockfile.
- Configure Supabase local development and timestamped migrations.
- Provide seed data for one demo organisation, two centres, staff roles, courses, batches and synthetic students. Never include real personal data from the reference.
- Add a polished sign-in page and role-aware application shell only after auth/RLS foundation exists.

### 20.4 Mandatory early proof

Before building the complete UI, implement and demonstrate these tests:

- Centre A cannot select Centre B students.
- Student A cannot select Student B fees.
- Centre staff cannot change their role.
- Suspended membership cannot create a student.
- Concurrent registration-number generation produces unique results.
- Duplicate idempotency key cannot post a wallet debit twice.

### 20.5 UI quality instruction

Build a modern original interface suitable for a professional education organisation. Use realistic synthetic content. Avoid generic AI-style gradients, oversized empty hero areas, excessive glassmorphism and decorative charts without operational value. Make tables, filters, forms and mobile workflows genuinely usable.

### 20.6 Completion handover

At project completion provide:

- Production README.
- Architecture and ERD documentation.
- Role/permission and RLS documentation.
- Environment setup guide.
- Deployment and rollback runbook.
- Backup/restore procedure.
- Admin, centre and student user guides.
- Test report and known limitations.
- Data import templates.
- Final Vercel deployment URLs and GitHub repository/branch status as authorised by the owner.

---

## 21. Product Decisions Required Before Phase 1 Completion

The build can start with documented defaults, but the owner should confirm:

1. Product/organisation brand name, logo and primary colours.
2. Whether one deployment serves one organisation or many independent organisations.
3. Exact centre approval and renewal policy.
4. Registration, invoice, receipt, order and certificate numbering formats.
5. Courses and initial syllabus data.
6. Admission document requirements.
7. Fee heads, tax/GST rules and refund policy.
8. Wallet debit rules and recharge approval process.
9. Exam pass, grading, attendance and re-evaluation rules.
10. Certificate/mark-sheet designs and authorised signatories.
11. Payment gateway and communication providers.
12. Data-retention and privacy policy.

Until confirmed, store these as configuration and use clearly labelled synthetic defaults in development.

---

## 22. Final Build Principle

The finished system must not merely resemble a dashboard. It must be an auditable operating platform: tenant-safe, transactionally correct, mobile-usable, testable, maintainable and deployable. Correct permissions, ledgers, state transitions and verification integrity take precedence over decorative UI.
