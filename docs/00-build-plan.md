# Career Optics CCMS — Phase 0 Build Plan

**Required first response per PRD §20.2.** No application code exists yet; this document is the
proposal that must be approved before scaffolding begins.

Sources of truth:

- `Computer_Centre_Management_System_PRD.md` — functional, data and security requirements
- `Career_Optics_UI_UX_Style_Guide.docx` — visual and interaction requirements
- `Logo.jpeg` — official brand mark (source asset; production variants must be derived from it)

---

## 1. Assumptions and open decisions

### 1.1 Assumptions I will build on unless corrected

| #   | Assumption                                                                                                                                                                                                                                        | Basis                                                                                                                                                | Cost to change later                                          |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| A1  | **Multi-organisation tenancy.** `organizations` is the top-level tenant; Career Optics is seeded as the first organisation. One deployment can serve many organisations.                                                                          | PRD §9.4 mandates `organizations` and `organization_id` on all operational tables. Resolves open decision §21.2 in favour of the more general model. | Low if built now, very high if retrofitted.                   |
| A2  | **Currency is INR; money is `bigint` paise.** Single currency in V1; `currency_code` column exists but is constrained to `INR`.                                                                                                                   | PRD §9.5. Domain is Indian computer education.                                                                                                       | Low.                                                          |
| A3  | **Locale/timezone defaults:** `en-IN`, `Asia/Kolkata`, stored UTC, rendered per user preference. Dates display `dd MMM yyyy`.                                                                                                                     | Style guide §12.2 ("authentic Indian computer education environments"), PRD §9.5.                                                                    | Low.                                                          |
| A4  | **Financial year is April–March** for invoice/receipt numbering.                                                                                                                                                                                  | Indian convention.                                                                                                                                   | Medium (numbers are immutable once issued).                   |
| A5  | **Head-office approval of admissions is configurable and OFF by default** in seed config; centres self-approve admissions.                                                                                                                        | PRD §6.2 step 7 says "if head-office approval is configured".                                                                                        | Low — it is a settings flag.                                  |
| A6  | **No payment gateway in Phase 0–3.** Payments are recorded manually (cash/UPI ref/bank/cheque) with an adapter interface and a stub provider. Gateway lands in Phase 5 behind the same interface.                                                 | PRD §21.11 lists provider as undecided. Avoids blocking on credentials.                                                                              | Low — interface designed for it.                              |
| A7  | **Notifications: in-app only in V1.** Email/SMS/WhatsApp are adapter stubs that log and no-op in dev.                                                                                                                                             | PRD §7.12 ("In-app notifications mandatory; email/SMS/WhatsApp adapters optional").                                                                  | Low.                                                          |
| A8  | **MFA (TOTP) is implemented but enforced only for Super Admin, Finance Admin and Exam Controller**, and only gated on from Phase 6.                                                                                                               | PRD §11.2.                                                                                                                                           | Low.                                                          |
| A9  | **Government ID handling:** we store the last 4 digits in cleartext for display, plus a keyed HMAC-SHA256 of the full value for duplicate detection. The full ID is never stored.                                                                 | PRD §11.4 ("use encryption or irreversible hash for duplicate checks").                                                                              | Medium.                                                       |
| A10 | **Attendance is session-based** (batch + scheduled session) as the primary mode; day-based mode is a per-centre setting layered on the same tables.                                                                                               | PRD §7.5 requires both; session-based is the superset.                                                                                               | Low.                                                          |
| A11 | **PDF generation via headless Chromium on a Node runtime** (`@sparticuz/chromium` + `puppeteer-core`) invoked from a background job, not from a request handler. Output is written to `generated-private` storage.                                | PRD §9.1 requires HTML-to-PDF and explicitly says "confirm Vercel runtime compatibility". See Risk R2.                                               | Medium — templates are HTML/CSS so the renderer is swappable. |
| A12 | **Background jobs** run as Vercel Cron → authenticated internal route handlers, with a `jobs` table for queue, retry count and dead-letter visibility. No external queue service in V1.                                                           | PRD §9.1, §13.2.                                                                                                                                     | Medium.                                                       |
| A13 | **Registration numbers, receipts, invoices, orders, tickets and certificates use the default formats in §1.3 below**, stored as organisation settings and validated.                                                                              | PRD §21.4 lists these as owner decisions; PRD §20.1 says put configurable rules in settings with validated defaults.                                 | Low.                                                          |
| A14 | **Grading default:** pass mark 40%, distinction 75%, minimum attendance 75% for certificate eligibility — all per course-version, overridable.                                                                                                    | PRD §21.9 undecided; PRD §7.4 requires the fields.                                                                                                   | Low.                                                          |
| A15 | **Public site content is CMS-driven from the database** (pages, notices, gallery, courses) rather than hard-coded, from Phase 1.                                                                                                                  | PRD §7.12.                                                                                                                                           | Medium.                                                       |
| A16 | **Brand assets:** I will derive SVG/PNG production variants (full lock-up, horizontal header, app icon, compact "CO" mark, white monochrome) from `Logo.jpeg`. The JPEG is raster, so an SVG re-draw is a _derivative_, not a trace-perfect copy. | Style guide §2.2 requires five asset variants; §2.3 forbids an unapproved cropped "CO" as the final icon. See Open decision D4.                      | —                                                             |

### 1.2 Deliberate deviations from a literal reading of the documents

1. **Style guide §17 forbids inventing a palette; PRD §8.1 suggests "navy primary, blue interaction".**
   The style guide is more specific and is dated one day later. **The style guide wins** on all visual
   questions: navy surface, **orange** primary action, blue interaction/links, green success.
2. **PRD §5.1 lists separate "Centre login" and "Student login".** I will build two distinct entry
   URLs with different copy and post-login routing, backed by one Supabase Auth identity space. A user
   who lands on the wrong one is redirected, not rejected — but the pages stay separate because the
   style guide's public header depends on both buttons existing.
3. **PRD §9.1 says "Realtime where justified".** I judge only two places justified in V1: exam
   invigilation counts and the notification bell. Everything else is request/response. Realtime
   subscriptions on tenant tables are an RLS attack surface and are not free.

### 1.3 Default numbering formats (configurable per organisation)

| Document            | Format                                 | Example                |
| ------------------- | -------------------------------------- | ---------------------- |
| Centre code         | `{ORG}-{STATE}{NN}`                    | `CO-DL01`              |
| Centre application  | `APP-{YY}-{SEQ:5}`                     | `APP-26-00417`         |
| Registration number | `{ORG}-{CENTRE}-{YY}-{COURSE}-{SEQ:5}` | `CO-DL01-26-DCA-00042` |
| Invoice             | `INV-{CENTRE}-{FY}-{SEQ:6}`            | `INV-DL01-2627-000318` |
| Receipt             | `RCP-{CENTRE}-{FY}-{SEQ:6}`            | `RCP-DL01-2627-000902` |
| Order               | `ORD-{YYMM}-{SEQ:6}`                   | `ORD-2608-000155`      |
| Ticket              | `TKT-{SEQ:7}`                          | `TKT-0004521`          |
| Certificate         | `{ORG}-CERT-{YY}-{SEQ:6}`              | `CO-CERT-26-001204`    |
| Mark sheet          | `{ORG}-MS-{YY}-{SEQ:6}`                | `CO-MS-26-003911`      |

All sequences come from a `document_sequences` table with `SELECT … FOR UPDATE` inside the issuing
transaction, keyed on `(organization_id, centre_id, doc_type, period)`. Not from Postgres `SEQUENCE`
objects — those are non-transactional and would leave gaps that auditors question.

### 1.4 Open decisions I need from you

| ID     | Decision                                                                                                                                                                                                                                                  | Why it matters                                                                                  | My default if you don't decide                                                                                                      |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **D1** | **Supabase environment.** Local Supabase CLI requires Docker, which is **not installed on this machine**. Options: (a) install Docker Desktop, (b) develop against a free hosted Supabase project, (c) both — hosted for now, Docker later for CI parity. | Blocks _all_ database work. Nothing downstream can start.                                       | (c) — but I cannot install Docker without your involvement.                                                                         |
| **D2** | **GitHub repository.** This directory is not a git repo. PRD §15 requires a private repo, protected `main`, PR-based flow and CI. Shall I `git init`, create a private repo via `gh`, and push?                                                           | Blocks CI, PR gates, and the "preview deployment approved" clause of §18.                       | `git init` locally + first commit; **no remote push without your explicit go-ahead.**                                               |
| **D3** | **Vercel + Supabase accounts.** Do these already exist, and do you want preview deployments from Phase 1?                                                                                                                                                 | Affects whether §18 Definition of Done is achievable per-phase.                                 | Build deploy-ready; defer actual deployment to Phase 1 end.                                                                         |
| **D4** | **Logo variants.** Is it acceptable for me to produce derived SVG/PNG variants from the JPEG, or will you supply official vector assets?                                                                                                                  | Style guide §2.2/§2.3 is strict about this. A derived redraw arguably violates "do not redraw". | I will produce _placeholder_ variants clearly marked as such, and use the JPEG directly where raster is acceptable.                 |
| **D5** | **Real course catalogue.** PRD §21.5 — do you have the actual Career Optics course list, codes, durations and fees?                                                                                                                                       | Seed data quality; certificate/syllabus structure.                                              | Synthetic but realistic Indian computer-academy catalogue (DCA, ADCA, Tally, DTP, O-Level-style, etc.), clearly labelled synthetic. |

I will proceed on defaults for D3–D5. **D1 is a hard blocker and D2 needs a yes/no.**

---

## 2. Final route map

Legend: `🔓` public · `🔐` authenticated · `⚙` server-only. Route groups do not appear in URLs.

### 2.1 Public — `app/(public)/`

```
🔓 /                              Home
🔓 /about                         About the academy
🔓 /courses                       Catalogue (server-paginated, filter by category/level/duration)
🔓 /courses/[slug]                Course detail + enquiry CTA
🔓 /centres                       Find a centre (search by city/state/pincode)
🔓 /centres/[code]                Centre public profile
🔓 /admissions/enquiry            Online admission enquiry form → creates a lead
🔓 /partner-with-us               Centre/franchise application entry
🔓 /partner-with-us/apply         Multi-step centre application (draft-saving, token-resumable)
🔓 /verify                        Verification hub
🔓 /verify/registration           Registration verification (reg. no. OR name+DOB)
🔓 /verify/certificate            Certificate / result verification
🔓 /verify/c/[number]             QR landing target → renders verification result directly
🔓 /gallery/photos
🔓 /gallery/videos
🔓 /notices                       Notices / news list
🔓 /notices/[slug]
🔓 /contact
🔓 /legal/privacy  /legal/terms  /legal/refund-policy
```

### 2.2 Auth — `app/(auth)/`

```
🔓 /sign-in/centre                Centre & staff sign-in
🔓 /sign-in/student               Student sign-in
🔓 /sign-in/admin                 Platform staff sign-in (unlinked from public nav)
🔓 /forgot-password
🔓 /reset-password                Token-consuming
🔓 /invite/[token]                Accept invitation, set first password
🔓 /activate/[token]              Student account activation
🔐 /mfa/challenge                 TOTP challenge
🔐 /mfa/enrol                     TOTP enrolment
🔐 /select-context                Membership picker when a user has >1 org/centre
```

### 2.3 Platform admin — `app/admin/`

```
🔐 /admin                                     Dashboard
🔐 /admin/organisations                       … /[id]  … /[id]/settings
🔐 /admin/centres                             … /[id]  … /[id]/documents  /staff  /courses  /wallet  /history
🔐 /admin/centre-applications                 … /[id]  (review, field comments, approve/reject)
🔐 /admin/users                               … /[id]
🔐 /admin/roles                               … /[id]   (role → permission matrix editor)
🔐 /admin/students                            … /[id]
🔐 /admin/admissions/approvals
🔐 /admin/academics/categories
🔐 /admin/academics/courses                   … /[id]  … /[id]/versions/[versionId]  (subjects, syllabus, rules)
🔐 /admin/academics/offerings                 Centre-course approvals
🔐 /admin/attendance                          Cross-centre read/report
🔐 /admin/exams/question-banks                … /[id]  … /[id]/questions  … /import
🔐 /admin/exams                               … /new  … /[id]  … /[id]/questions  /assignments  /monitor
🔐 /admin/exams/evaluation                    Subjective evaluation queue
🔐 /admin/results                             … /[id]  … /[id]/moderate  … /[id]/publish
🔐 /admin/certificates                        … /issue  … /[id]  … /templates  … /templates/[id]
🔐 /admin/fees/heads   /admin/fees/templates
🔐 /admin/payments                            … /[id]     /admin/payments/reconciliation
🔐 /admin/refunds                             … /[id]
🔐 /admin/wallets                             … /[centreId]  /admin/wallets/recharge-requests
🔐 /admin/commissions                         /admin/commissions/rules  /admin/commissions/payouts
🔐 /admin/products                            … /[id]  /admin/products/categories
🔐 /admin/inventory                           /admin/inventory/locations  /admin/inventory/ledger
🔐 /admin/orders                              … /[id]  … /[id]/dispatch
🔐 /admin/referrals
🔐 /admin/finance/expenses  /admin/finance/ledger  /admin/finance/periods
🔐 /admin/content/pages  /courses  /notices  /gallery  /testimonials  /seo
🔐 /admin/announcements                       … /new  … /[id]
🔐 /admin/notifications/templates
🔐 /admin/tickets                             … /[id]
🔐 /admin/reports                             … /[slug]   (saved views, export)
🔐 /admin/audit-logs
🔐 /admin/settings                            /general /numbering /security /integrations /storage /jobs
```

### 2.4 Centre portal — `app/centre/`

```
🔐 /centre                                    Dashboard
🔐 /centre/profile                            … /documents
🔐 /centre/leads                              … /new  … /[id]
🔐 /centre/students/new                       Multi-step admission (Personal→Guardian→Course→Documents→Fees→Review)
🔐 /centre/students                           … /[id]  (tabs: overview, enrolment, attendance, fees, exams, documents, notes, history)
🔐 /centre/students/import                    CSV import with preview + row errors
🔐 /centre/batches                            … /new  … /[id]  … /[id]/timetable
🔐 /centre/attendance                         … /take  … /register  … /defaulters  … /corrections
🔐 /centre/fees                               … /collect  … /dues  … /receipts/[id]  … /plans/[id]
🔐 /centre/exams                              … /[id]  … /[id]/eligibility
🔐 /centre/results                            … /[id]     /centre/performance
🔐 /centre/certificates                       … /id-cards  … /dispatch
🔐 /centre/shop                               … /[productId]  … /cart  … /checkout
🔐 /centre/orders                             … /[id]
🔐 /centre/wallet                             … /statement  … /recharge
🔐 /centre/referrals
🔐 /centre/finance/income  /centre/finance/expenses  /centre/finance/summary
🔐 /centre/staff                              … /invite  … /[id]
🔐 /centre/announcements
🔐 /centre/support                            … /new  … /[id]
🔐 /centre/reports                            … /[slug]
🔐 /centre/settings
```

### 2.5 Student portal — `app/student/`

```
🔐 /student                                   Dashboard
🔐 /student/profile
🔐 /student/course
🔐 /student/timetable
🔐 /student/attendance                        … /leave  … /leave/new
🔐 /student/fees                              … /receipts/[id]
🔐 /student/materials
🔐 /student/exams                             … /[id]  (instructions + eligibility gate)
🔐 /student/results                           … /[id]
🔐 /student/certificates                      … /[id]  … /id-card
🔐 /student/announcements
🔐 /student/support                           … /new  … /[id]
🔐 /student/security
```

### 2.6 Exam runner — `app/exam/` (own root layout, no portal chrome)

```
🔐 /exam/[attemptId]                          Distraction-free attempt runner
🔐 /exam/[attemptId]/submitted                Post-submission confirmation
```

Style guide §11.5 requires no global navigation during an active attempt, so this is a sibling of the
portals rather than nested inside them.

### 2.7 API — `app/api/`

```
⚙ /api/v1/public/courses                      GET
⚙ /api/v1/public/centres                      GET
⚙ /api/v1/public/verify/registration          POST (rate-limited)
⚙ /api/v1/public/verify/certificate           POST (rate-limited)
⚙ /api/v1/public/enquiries                    POST (rate-limited + honeypot)
⚙ /api/v1/centres            /api/v1/students         /api/v1/admissions
⚙ /api/v1/attendance         /api/v1/fees             /api/v1/payments
⚙ /api/v1/wallets            /api/v1/exams            /api/v1/results
⚙ /api/v1/certificates       /api/v1/products         /api/v1/orders
⚙ /api/v1/tickets            /api/v1/reports
⚙ /api/v1/exams/attempts/[id]/answers         PUT   (idempotent autosave, high frequency)
⚙ /api/v1/exams/attempts/[id]/heartbeat       POST  (server-authoritative clock)
⚙ /api/v1/exams/attempts/[id]/submit          POST
⚙ /api/v1/webhooks/payment-provider           POST  (signature-verified, store-then-process)
⚙ /api/internal/jobs/run                      POST  (Vercel Cron, bearer-secret)
⚙ /api/internal/health                        GET
```

Everything else is a **server action** co-located with its feature module. Route handlers exist only
for webhooks, cron, high-frequency exam traffic, public unauthenticated endpoints, and anything a
future mobile app will call.

---

## 3. ERD / table plan, grouped by migration

52 tables across 12 migrations. Every mutable table carries `created_at, created_by, updated_at,
updated_by`; reference tables add `deleted_at`. All tenant tables carry `organization_id`; all
centre-scoped tables also carry `centre_id`.

| Migration                          | Tables                                                                                                                                                                                                                                                                                                                            | Notes                                                                                                                                                                                                                    |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `0001_extensions_and_helpers`      | —                                                                                                                                                                                                                                                                                                                                 | `pgcrypto`, `citext`, `pg_trgm`. `app` schema. `set_updated_at()` trigger fn. `money_paise` domain (`bigint CHECK (>= 0)` where applicable). Enum types for every status set in PRD §6.                                  |
| `0002_identity_tenancy`            | `profiles`, `organizations`, `centres`, `memberships`, `roles`, `permissions`, `role_permissions`                                                                                                                                                                                                                                 | `memberships` is the join that RLS keys on. Unique `(user_id, organization_id, coalesce(centre_id, uuid_nil), role_id)`.                                                                                                 |
| `0003_rls_helpers_and_audit`       | `audit_logs`, `idempotency_keys`, `system_settings`, `document_sequences`                                                                                                                                                                                                                                                         | The `SECURITY DEFINER` helper functions in §5. Audit trigger factory.                                                                                                                                                    |
| `0004_centre_lifecycle`            | `centre_applications`, `centre_application_reviews`, `centre_documents`                                                                                                                                                                                                                                                           | Application workflow enum + transition guard trigger.                                                                                                                                                                    |
| `0005_academics`                   | `course_categories`, `courses`, `course_versions`, `subjects`, `centre_course_offerings`, `holidays`, `study_materials`                                                                                                                                                                                                           | An enrolment pins `course_version_id`, never `course_id` (PRD §7.4).                                                                                                                                                     |
| `0006_crm_students`                | `leads`, `lead_activities`, `students`, `student_documents`, `student_status_history`, `enrolments`, `enrolment_history`, `batches`, `batch_schedules`                                                                                                                                                                            | `students.registration_number` unique per organisation, immutable via trigger. `students.gov_id_hmac` for duplicate detection.                                                                                           |
| `0007_attendance`                  | `attendance_sessions`, `attendance_records`, `leave_requests`, `attendance_corrections`                                                                                                                                                                                                                                           | Unique `(session_id, enrolment_id)`. `attendance_records.status` has **no default** — unmarked is the absence of a row, satisfying PRD §6.4.3.                                                                           |
| `0008_fees_ledger`                 | `fee_heads`, `course_fee_templates`, `student_fee_plans`, `fee_instalments`, `invoices`, `invoice_lines`, `payments`, `payment_allocations`, `refunds`, `ledger_accounts`, `journal_entries`, `journal_lines`, `expenses`                                                                                                         | `journal_lines` check: exactly one of debit/credit > 0. Deferred constraint trigger asserting each `journal_entry` balances to zero.                                                                                     |
| `0009_wallet`                      | `wallet_accounts`, `wallet_entries`, `wallet_recharge_requests`                                                                                                                                                                                                                                                                   | `wallet_entries` has monotonic `entry_seq bigint` per account (unique) + `balance_after`. Insert-only: `REVOKE UPDATE, DELETE`. Balance function reads the max-seq row and is asserted against `SUM()` by a nightly job. |
| `0010_exams_credentials`           | `question_banks`, `questions`, `question_options`, `exams`, `exam_sections`, `exam_questions`, `exam_assignments`, `exam_attempts`, `exam_answers`, `exam_events`, `result_publications`, `student_results`, `result_components`, `document_templates`, `issued_documents`, `document_status_history`, `public_verification_logs` | `exam_attempts` unique `(exam_id, student_id, attempt_number)`. `exam_answers` unique `(attempt_id, question_id)` with UPSERT autosave. `result_publications.version` increments; publish never mutates a prior version. |
| `0011_inventory_referrals_support` | `product_categories`, `products`, `inventory_locations`, `inventory_entries`, `orders`, `order_items`, `shipments`, `shipment_items`, `referral_codes`, `referrals`, `commission_rules`, `commission_entries`, `tickets`, `ticket_messages`                                                                                       | `inventory_entries` mirrors the wallet pattern: insert-only, `balance_after`, check `balance_after >= 0`.                                                                                                                |
| `0012_platform_ops`                | `announcements`, `notifications`, `notification_templates`, `export_jobs`, `jobs`, `webhook_events`                                                                                                                                                                                                                               | `jobs` = queue with `attempts`, `next_run_at`, `dead_lettered_at`. `webhook_events` stores raw payload before processing (PRD §13.2).                                                                                    |

Storage buckets (`0013_storage_policies`): `public-assets`, `centre-private`, `student-private`,
`finance-private`, `exam-private`, `generated-private`, `support-private` — all private except the
first, all with RLS-equivalent storage policies and randomised object paths.

**Indexing baseline:** every FK; plus composite indexes on `(organization_id, centre_id, status)`,
`(centre_id, created_at DESC)`, `attendance_records(session_id)`, `wallet_entries(account_id,
entry_seq DESC)`, `payments(centre_id, posted_at DESC)`, and trigram indexes on
`students(full_name)`, `students(registration_number)`, `leads(phone)`.

---

## 4. Role / permission matrix

Permission codes are `resource.action`. Roles are rows of a `role_permissions` join — **no role is
hard-coded in application logic** except `platform_super_admin`, which is a separate flag on
`profiles` and is audited on every use.

Actions: `read` · `create` · `update` · `delete` · `approve` · `export` · plus resource-specific
(`post`, `reverse`, `publish`, `revoke`, `dispatch`, `adjust`).

| Resource group                              | Super Admin | HO Operator | Finance Admin     | Exam Controller | Inventory Mgr | Support Agent  | Centre Owner              | Centre Mgr | Counsellor  | Faculty             | Accountant       | Student            |
| ------------------------------------------- | ----------- | ----------- | ----------------- | --------------- | ------------- | -------------- | ------------------------- | ---------- | ----------- | ------------------- | ---------------- | ------------------ |
| `organization.*`                            | all         | read        | read              | read            | read          | —              | —                         | —          | —           | —                   | —                | —                  |
| `centre.*`                                  | all         | r/u/approve | read              | read            | read          | read           | r/u (own)                 | read (own) | read (own)  | —                   | read (own)       | —                  |
| `centre_application.*`                      | all         | r/u/approve | read              | —               | —             | —              | —                         | —          | —           | —                   | —                | —                  |
| `user.*` / `role.*`                         | all         | read        | —                 | —               | —             | —              | invite staff (own centre) | read       | —           | —                   | —                | —                  |
| `lead.*`                                    | all         | all         | —                 | —               | —             | read           | all (own)                 | all (own)  | all (own)   | —                   | —                | —                  |
| `student.*`                                 | all         | all         | read              | read            | —             | read (masked)  | all (own)                 | all (own)  | c/r/u (own) | read (batch)        | read (own)       | read (self)        |
| `student.export`                            | ✓           | ✓           | ✓                 | —               | —             | —              | ✓                         | —          | —           | —                   | —                | —                  |
| `course.*` / `subject.*`                    | all         | all         | —                 | read            | —             | —              | read                      | read       | read        | read                | —                | read               |
| `offering.approve`                          | ✓           | ✓           | —                 | —               | —             | —              | —                         | —          | —           | —                   | —                | —                  |
| `batch.*` / `timetable.*`                   | all         | all         | —                 | —               | —             | —              | all (own)                 | all (own)  | read        | read (own)          | —                | read (own)         |
| `attendance.*`                              | all         | read/export | —                 | —               | —             | —              | all (own)                 | all (own)  | read        | c/r/u (own batches) | read             | read (self)        |
| `attendance.correct`                        | ✓           | ✓           | —                 | —               | —             | —              | ✓                         | ✓          | —           | —                   | —                | —                  |
| `fee_plan.*`                                | all         | read        | all               | —               | —             | —              | r/u (own)                 | r/u (own)  | read        | —                   | r/u (own)        | read (self)        |
| `fee.discount.approve`                      | ✓           | —           | ✓                 | —               | —             | —              | ✓ (≤ threshold)           | —          | —           | —                   | —                | —                  |
| `payment.post`                              | ✓           | —           | ✓                 | —               | —             | —              | ✓                         | ✓          | —           | —                   | ✓                | —                  |
| `payment.reverse` / `refund.approve`        | ✓           | —           | ✓                 | —               | —             | —              | —                         | —          | —           | —                   | —                | —                  |
| `wallet.read`                               | ✓           | ✓           | ✓                 | —               | —             | —              | ✓ (own)                   | ✓ (own)    | —           | —                   | ✓ (own)          | —                  |
| `wallet.recharge.request`                   | —           | —           | —                 | —               | —             | —              | ✓                         | ✓          | —           | —                   | ✓                | —                  |
| `wallet.recharge.approve` / `wallet.adjust` | ✓           | —           | ✓                 | —               | —             | —              | —                         | —          | —           | —                   | —                | —                  |
| `question.*` / `exam.*`                     | all         | read        | —                 | all             | —             | —              | read (own)                | read (own) | —           | read (assigned)     | —                | —                  |
| `exam.attempt`                              | —           | —           | —                 | —               | —             | —              | —                         | —          | —           | —                   | —                | ✓ (self, eligible) |
| `exam.evaluate`                             | ✓           | —           | —                 | ✓               | —             | —              | —                         | —          | —           | ✓ (assigned)        | —                | —                  |
| `result.publish` / `result.unlock`          | ✓           | —           | —                 | ✓               | —             | —              | —                         | —          | —           | —                   | —                | —                  |
| `result.read`                               | ✓           | ✓           | —                 | ✓               | —             | —              | ✓ (own)                   | ✓ (own)    | —           | ✓ (batch)           | —                | ✓ (self)           |
| `certificate.issue`                         | ✓           | —           | —                 | ✓               | —             | —              | request only              | —          | —           | —                   | —                | —                  |
| `certificate.revoke`                        | ✓           | —           | —                 | ✓               | —             | —              | —                         | —          | —           | —                   | —                | —                  |
| `product.*` / `inventory.*`                 | all         | read        | read              | —               | all           | —              | read                      | read       | —           | —                   | —                | —                  |
| `order.create`                              | —           | —           | —                 | —               | —             | —              | ✓                         | ✓          | —           | —                   | ✓                | —                  |
| `order.dispatch`                            | ✓           | ✓           | —                 | —               | ✓             | —              | —                         | —          | —           | —                   | —                | —                  |
| `referral.*` / `commission.*`               | all         | read        | all               | —               | —             | —              | read (own)                | —          | —           | —                   | —                | —                  |
| `expense.*`                                 | all         | read        | all               | —               | —             | —              | all (own)                 | all (own)  | —           | —                   | all (own)        | —                  |
| `ticket.*`                                  | all         | read        | —                 | —               | —             | all (assigned) | c/r (own)                 | c/r (own)  | c/r (own)   | c/r (own)           | c/r (own)        | c/r (self)         |
| `ticket.internal_note`                      | ✓           | ✓           | —                 | —               | —             | ✓              | —                         | —          | —           | —                   | —                | —                  |
| `announcement.*`                            | all         | all         | —                 | —               | —             | —              | all (own centre)          | —          | —           | —                   | —                | read               |
| `report.read` / `report.export`             | all         | ✓           | ✓ (finance)       | ✓ (exam)        | ✓ (inventory) | ✓ (SLA)        | ✓ (own)                   | ✓ (own)    | limited     | limited             | ✓ (finance, own) | —                  |
| `audit.read`                                | ✓           | —           | ✓ (finance scope) | —               | —             | —              | ✓ (own centre)            | —          | —           | —                   | —                | —                  |
| `settings.*`                                | all         | —           | ✓ (finance)       | ✓ (exam)        | —             | —              | ✓ (own centre)            | —          | —           | —                   | —                | —                  |

**Step-up confirmation required** (re-authentication + typed reason, recorded in `audit_logs`):
refunds, payment reversal, result unlock after publish, certificate revocation, wallet manual
adjustment, role/permission change, centre suspension, financial-period unlock, any hard delete.

**Suspension semantics:** a `membership.status != 'active'` or `centre.status != 'active'` denies all
write policies immediately, and denies operational reads for centre users, while leaving head-office
read policies intact (PRD §19.3).

---

## 5. RLS strategy and test matrix

### 5.1 Strategy

**Every table gets `ENABLE ROW LEVEL SECURITY` _and_ `FORCE ROW LEVEL SECURITY`.** No table is left
open "because the app checks it". The anon and authenticated roles get zero blanket grants.

Authorisation is evaluated **twice, independently**:

1. **In Postgres** via RLS — the backstop that a URL edit, a leaked anon key or a Supabase client
   query cannot get past.
2. **In the Next.js server layer** via an explicit `authorize(permission, scope)` call at the top of
   every server action and route handler — which produces the readable error and the audit event.

Helper functions live in an `app` schema, are `STABLE SECURITY DEFINER`, and every one is declared
`SET search_path = ''` with fully-qualified references (the standard Supabase privilege-escalation
footgun). `EXECUTE` is granted to `authenticated` only.

```
app.current_user_id()                      -> uuid
app.is_platform_admin()                    -> boolean
app.is_org_member(org uuid)                -> boolean   -- active membership only
app.can_access_centre(centre uuid)         -> boolean   -- active membership + active centre
app.has_permission(perm text, org uuid, centre uuid) -> boolean
app.is_current_student(student uuid)       -> boolean
app.centre_is_operational(centre uuid)     -> boolean   -- gates writes on suspension
```

**Claims are not trusted for authorisation.** Nothing role-related goes into the JWT. A JWT is valid
for its lifetime, so a suspended user with a cached token would keep their claims — unacceptable for
PRD §19.3. Helpers read `memberships` on every call. The cost is mitigated by `STABLE` (cached per
statement), a covering index on `memberships(user_id, status) INCLUDE (organization_id, centre_id,
role_id)`, and by the fact that these tables are tiny relative to the operational tables.

**Policy shape** (illustrative, `students`):

```sql
create policy students_select on public.students for select to authenticated
using (
     app.is_platform_admin()
  or app.is_current_student(id)
  or (app.has_permission('student.read', organization_id, centre_id)
      and app.can_access_centre(centre_id))
);

create policy students_insert on public.students for insert to authenticated
with check (
      app.has_permission('student.create', organization_id, centre_id)
  and app.can_access_centre(centre_id)
  and app.centre_is_operational(centre_id)
);
```

`UPDATE` policies always carry both `USING` and `WITH CHECK` so a row cannot be moved between
centres. Ledger tables (`wallet_entries`, `journal_lines`, `inventory_entries`, `audit_logs`,
`exam_events`) have **no** `UPDATE` or `DELETE` policy at all and additionally `REVOKE UPDATE, DELETE`
from `authenticated`.

**Service role** is used only in: webhook handlers, cron jobs, the invitation flow, and PDF
generation — never in a user-facing request path, never in a Client Component bundle. Every
service-role call site passes an explicit actor id into `audit_logs` so "the system did it" is never
an untraceable answer.

### 5.2 RLS test matrix (pgTAP, run in CI — PRD §11.1, §20.4)

Fixtures: two organisations, four centres, and a user per role in each.

| #   | Test                                                                                                          | Expect                                    |
| --- | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| R01 | anon `SELECT` on each of the 52 tables                                                                        | 0 rows / denied                           |
| R02 | Centre-A owner selects Centre-B students                                                                      | 0 rows                                    |
| R03 | Centre-A owner updates a Centre-B student                                                                     | denied                                    |
| R04 | Centre-A owner inserts a student with `centre_id = B`                                                         | denied by `WITH CHECK`                    |
| R05 | Student A selects Student B `students` / `fee_instalments` / `payments` / `exam_answers` / `issued_documents` | 0 rows each                               |
| R06 | Centre manager updates own `memberships.role_id`                                                              | denied                                    |
| R07 | Centre manager inserts into `role_permissions`                                                                | denied                                    |
| R08 | Suspended membership inserts a student                                                                        | denied                                    |
| R09 | Suspended **centre**, active membership, inserts attendance / posts payment / starts exam                     | denied                                    |
| R10 | Suspended centre, head-office user reads historical students                                                  | allowed                                   |
| R11 | Org-1 head office selects Org-2 anything                                                                      | 0 rows                                    |
| R12 | Faculty selects attendance for an unassigned batch                                                            | 0 rows                                    |
| R13 | Counsellor posts a payment                                                                                    | denied                                    |
| R14 | Any non-platform user `UPDATE`s `wallet_entries`                                                              | denied                                    |
| R15 | Any user `DELETE`s from `audit_logs`                                                                          | denied                                    |
| R16 | Support agent reads student government-ID column                                                              | denied / masked                           |
| R17 | Student reads `ticket_messages` where `is_internal = true`                                                    | 0 rows                                    |
| R18 | Centre user reads `exam_questions` before the exam window opens                                               | 0 rows                                    |
| R19 | Student reads `question_options.is_correct` during an attempt                                                 | denied (column-level)                     |
| R20 | Student reads an unpublished `result_publication`                                                             | 0 rows                                    |
| R21 | anon reads `public_verification_logs`                                                                         | denied                                    |
| R22 | anon reads `courses` where `status = 'published'`                                                             | allowed (the one intentional public read) |
| R23 | Centre user reads another centre's storage object path                                                        | denied                                    |
| R24 | Search-path injection attempt against each `SECURITY DEFINER` helper                                          | no escalation                             |

### 5.3 Mandatory early proof (PRD §20.4) — the six tests that gate Phase 1

| #   | Test                                                        | Method                                                                                                                          |
| --- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| P1  | Centre A cannot select Centre B students                    | R02 above                                                                                                                       |
| P2  | Student A cannot select Student B fees                      | R05 above                                                                                                                       |
| P3  | Centre staff cannot change their role                       | R06 above                                                                                                                       |
| P4  | Suspended membership cannot create a student                | R08 above                                                                                                                       |
| P5  | Concurrent registration-number generation is unique         | 50 parallel `pgbench`-style admissions against one centre+course; assert 50 distinct numbers, zero gaps, zero deadlock failures |
| P6  | Duplicate idempotency key cannot double-post a wallet debit | Same `Idempotency-Key` fired twice concurrently; assert one `wallet_entries` row, both responses identical, balance moved once  |

**These run before any feature UI is built.** If P1–P6 do not pass, Phase 1 does not start.

---

## 6. Phase 0 and Phase 1 implementation plan

### Phase 0 — Foundation (no business features)

**Objective:** a deployable, typed, tested skeleton where the security model is proven before any
feature depends on it.

| Step | Deliverable                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0.1  | `create-next-app` (current stable, App Router, TS strict, Tailwind, ESLint). `tsconfig` strict + `noUncheckedIndexedAccess`. Prettier, ESLint flat config, Husky + lint-staged.                                                                                                                                                                                                                                                                     |
| 0.2  | Repo, `.gitignore`, `.env.example`, `README.md`, ADR folder, CODEOWNERS, PR template, Conventional Commits check.                                                                                                                                                                                                                                                                                                                                   |
| 0.3  | **Design tokens**: Tailwind v4 `@theme` block mapping every token from style guide §3–§5 and §15 to CSS variables. Typography scale, spacing scale, radii, shadows, Inter via `next/font` with tabular-numeral utility.                                                                                                                                                                                                                             |
| 0.4  | **Brand assets**: derived logo variants + PWA manifest + favicon set (subject to decision D4).                                                                                                                                                                                                                                                                                                                                                      |
| 0.5  | **Component foundation** — style guide §17 requires these _demonstrated before feature pages_: Button (5 variants × 5 states), Input/Select/Textarea/DatePicker/FileUpload, Card, KPI card, DataTable (desktop) + MobileList (its designed mobile equivalent), StatusBadge, Dialog + BottomSheet, Tabs, Toast/InlineAlert/Banner, Empty/Loading/Error/PermissionDenied states. Rendered on an internal `/dev/components` showcase route (dev-only). |
| 0.6  | **Three shells**: desktop portal shell (256/72px navy sidebar, 64px top bar), mobile app shell (56px header, 64px bottom nav, safe-area insets), public site header/footer. Verified at 360, 390, 768, 1024, 1440px.                                                                                                                                                                                                                                |
| 0.7  | Supabase clients: browser, server (RSC), server action, route handler, and an isolated service-role client that is `import`-guarded against client bundles.                                                                                                                                                                                                                                                                                         |
| 0.8  | Migrations `0001`–`0003`: extensions, identity/tenancy, RLS helpers, audit framework, `document_sequences`, `idempotency_keys`.                                                                                                                                                                                                                                                                                                                     |
| 0.9  | Audit framework: generic trigger writing before/after diffs, plus an app-layer `recordAudit()` for reason-carrying actions.                                                                                                                                                                                                                                                                                                                         |
| 0.10 | `lib/money` (integer paise, formatting, allocation), `lib/permissions` (`authorize()`), `lib/validation` (Zod base schemas), `lib/audit`, `lib/errors` (JSON error envelope + request ID).                                                                                                                                                                                                                                                          |
| 0.11 | **Test harness**: Vitest (unit), pgTAP + Supabase CLI (RLS/DB), Playwright (E2E). CI workflow running all 8 jobs from PRD §15.                                                                                                                                                                                                                                                                                                                      |
| 0.12 | **Proof tests P1–P6 green.**                                                                                                                                                                                                                                                                                                                                                                                                                        |

**Phase 0 exit criteria:** CI green · P1–P6 pass · component showcase reviewed and visually approved
by you · shells verified at all five breakpoints · `.env.example` complete · README runnable by
someone else from a clean machine.

### Phase 1 — Public site, auth, centre management

**Objective:** a real user can find the academy publicly, a centre can be onboarded and approved, and
its owner can sign in to a dashboard backed by real queries.

| Step | Deliverable                                                                                                                                                                                                                                                              |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1.1  | Migrations `0004` (centre lifecycle) + the CMS subset of `0012`.                                                                                                                                                                                                         |
| 1.2  | Public site: home, about, courses list/detail, centre finder, gallery, notices, contact, legal. Server-rendered, cached, SEO metadata, sitemap, structured data.                                                                                                         |
| 1.3  | Enquiry form → `leads` (rate-limited, honeypot, no enumeration).                                                                                                                                                                                                         |
| 1.4  | Centre application: public multi-step form, draft resume by token, document upload to `centre-private`, submission → `APP-` number.                                                                                                                                      |
| 1.5  | Head-office review: application list, detail, field-level comments, changes-requested loop, approve/reject with reason, and the **atomic approval transaction** (centre + code + owner membership + wallet account + opening ledger entry + invitation, all-or-nothing). |
| 1.6  | Auth: sign-in (centre/student/admin), invitation acceptance, password reset, session revocation, last-login, generic error messages, rate limiting. **No admin-set passwords anywhere.**                                                                                 |
| 1.7  | Membership context resolution + `/select-context` for multi-membership users; middleware-enforced route protection per portal.                                                                                                                                           |
| 1.8  | Centre profile + documents + staff invitations with permission templates.                                                                                                                                                                                                |
| 1.9  | Roles/permissions admin UI backed by `role_permissions`.                                                                                                                                                                                                                 |
| 1.10 | Three dashboards with **real query-backed data only** (PRD §20.1 forbids fake-data scaffolding). Empty states where there is genuinely nothing yet.                                                                                                                      |
| 1.11 | Seed: 1 organisation, 2 centres, ~12 courses, staff for every role, synthetic students. Clearly synthetic, no real personal data.                                                                                                                                        |
| 1.12 | E2E: centre onboarding → approval → first login → dashboard. Accessibility scan on public home, sign-in, application form, dashboard.                                                                                                                                    |

**Phase 1 exit criteria:** E2E green · axe scan clean on the four primary flows · preview deployment
approved · all Definition-of-Done items in PRD §18 satisfied per screen.

Phases 2–6 follow the PRD §17 sequence; I will re-plan each one at its start rather than
speculatively detailing it now.

---

## 7. Proposed directory structure

```
career-optics/
├─ app/
│  ├─ (public)/…                     marketing, catalogue, verification
│  ├─ (auth)/…                       sign-in, invite, reset, mfa
│  ├─ admin/          layout.tsx + route tree (§2.3)
│  ├─ centre/         layout.tsx + route tree (§2.4)
│  ├─ student/        layout.tsx + route tree (§2.5)
│  ├─ exam/           own root layout, no portal chrome
│  ├─ api/
│  │  ├─ v1/{public,centres,students,…}/route.ts
│  │  ├─ v1/webhooks/payment-provider/route.ts
│  │  └─ internal/{jobs,health}/route.ts
│  ├─ dev/components/                dev-only component showcase
│  ├─ layout.tsx  ·  error.tsx  ·  not-found.tsx  ·  globals.css
│  └─ manifest.ts  ·  sitemap.ts  ·  robots.ts
├─ components/
│  ├─ ui/            primitives (button, input, dialog, sheet, badge, tabs, toast…)
│  ├─ forms/         field wrappers, stepper, upload, RHF+Zod bindings
│  ├─ tables/        DataTable, columns, filters, MobileList, saved views
│  ├─ charts/        thin wrappers enforcing style-guide §12.3 series order
│  ├─ layout/        DesktopShell, MobileShell, Sidebar, TopBar, BottomNav, PublicHeader/Footer
│  └─ states/        Empty, Loading, ErrorState, PermissionDenied, Skeletons
├─ features/
│  ├─ admissions/  students/  academics/  attendance/  fees/  wallet/
│  ├─ exams/  results/  certificates/  inventory/  orders/  referrals/
│  ├─ support/  notifications/  reports/  centres/  cms/
│  └─ <each>: actions.ts · queries.ts · schema.ts · service.ts · components/ · __tests__/
├─ lib/
│  ├─ auth/          clients, session, context resolution, mfa, invitations
│  ├─ db/            typed query helpers, transaction wrapper, service-role guard
│  ├─ permissions/   authorize(), permission registry, step-up
│  ├─ validation/    shared Zod schemas, Indian phone/pincode/PAN/Aadhaar-hash
│  ├─ money/         paise arithmetic, allocation, formatting
│  ├─ audit/         recordAudit, diffing, redaction
│  ├─ numbering/     sequence issuance per §1.3
│  ├─ idempotency/   key capture and replay
│  ├─ notifications/ dispatcher + channel adapters (in-app, email, sms, whatsapp stubs)
│  ├─ pdf/           template rendering, chromium runner, storage write
│  ├─ jobs/          queue, handlers, retry, dead-letter
│  ├─ storage/       signed URLs, path generation, MIME/size validation
│  ├─ rate-limit/    public endpoint and auth throttling
│  └─ dates/         UTC ↔ Asia/Kolkata, academic/financial periods
├─ supabase/
│  ├─ migrations/    timestamped, forward-only
│  ├─ tests/         pgTAP RLS + invariant suites
│  ├─ functions/     edge functions (only where justified)
│  └─ seed.sql
├─ tests/
│  ├─ unit/  integration/  e2e/  fixtures/
├─ types/            database.generated.ts, domain contracts
├─ docs/             ADRs, ERD, runbooks, user guides, this plan
├─ public/           brand assets, icons, manifest icons
└─ .github/workflows/ci.yml, CODEOWNERS, PR template
```

---

## 8. Environment variables

`.env.example` will ship with every key present and empty.

| Variable                                                      | Scope           | Purpose                                                                   |
| ------------------------------------------------------------- | --------------- | ------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`                                    | client          | Supabase project URL                                                      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`                               | client          | Anon key — RLS-constrained                                                |
| `SUPABASE_SERVICE_ROLE_KEY`                                   | **server only** | Webhooks, cron, invitations, PDF. Never imported into a Client Component. |
| `SUPABASE_DB_URL`                                             | server/CI       | Direct connection for migrations and pgTAP                                |
| `SUPABASE_JWT_SECRET`                                         | server          | Token verification where needed                                           |
| `NEXT_PUBLIC_APP_URL`                                         | client          | Canonical URL for QR/verification links                                   |
| `NEXT_PUBLIC_APP_ENV`                                         | client          | `local` · `preview` · `staging` · `production`                            |
| `GOV_ID_HMAC_KEY`                                             | server          | Keyed hash for duplicate detection (A9)                                   |
| `INVITE_TOKEN_SECRET`                                         | server          | Invitation/activation token signing                                       |
| `CERTIFICATE_SIGNING_KEY`                                     | server          | Signed verification payload                                               |
| `CRON_SECRET`                                                 | server          | Bearer secret for `/api/internal/jobs/run`                                |
| `PAYMENT_PROVIDER`                                            | server          | `none` \| `razorpay` \| `stripe`                                          |
| `PAYMENT_PROVIDER_KEY_ID` / `_KEY_SECRET` / `_WEBHOOK_SECRET` | server          | Gateway credentials                                                       |
| `EMAIL_PROVIDER` / `EMAIL_API_KEY` / `EMAIL_FROM`             | server          | Transactional email                                                       |
| `SMS_PROVIDER` / `SMS_API_KEY` / `SMS_SENDER_ID`              | server          | OTP and alerts                                                            |
| `WHATSAPP_API_KEY` / `WHATSAPP_PHONE_ID`                      | server          | Phase-5 adapter                                                           |
| `PDF_RENDERER`                                                | server          | `chromium` \| `external`                                                  |
| `PDF_SERVICE_URL` / `PDF_SERVICE_TOKEN`                       | server          | If external renderer                                                      |
| `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN`                       | both            | Error monitoring                                                          |
| `RATE_LIMIT_PROVIDER` / `UPSTASH_REDIS_REST_URL` / `_TOKEN`   | server          | Distributed rate limiting (in-memory fallback locally)                    |
| `MALWARE_SCAN_URL` / `MALWARE_SCAN_TOKEN`                     | server          | Upload scanning integration point                                         |

Secrets live only in Vercel/Supabase environment management. GitHub secret scanning and push
protection on from the first commit.

---

## 9. Risks and mitigations

| #       | Risk                                                                                                                                                                     | Severity    | Mitigation                                                                                                                                                                                                                                                                                                                           |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **R1**  | **Docker is not installed**, so the Supabase CLI cannot run a local stack. Migrations, pgTAP and the P1–P6 proofs have nowhere to run.                                   | **Blocker** | Decision D1. Preferred: hosted Supabase dev project now + Docker for CI parity later. CI can run Supabase in GitHub Actions regardless of this machine.                                                                                                                                                                              |
| **R2**  | Headless Chromium PDF on Vercel is fragile — bundle size limits, cold starts, and it will not run on the Edge runtime. Certificates and receipts are core, not optional. | High        | Generate in a background job on the Node runtime, never in a request. Templates are plain HTML/CSS so the renderer is swappable to an external service behind `PDF_RENDERER`. Prototype this in Phase 0, not Phase 4 — a late failure here is expensive.                                                                             |
| **R3**  | RLS helper functions run per-row and could dominate query cost on 10M attendance rows.                                                                                   | High        | `STABLE` + covering index on `memberships`. Benchmark the ten heaviest dashboard/report queries with `EXPLAIN (ANALYZE, BUFFERS)` at Phase 0 exit against seeded volume, not at launch. Pre-filter by `centre_id` in the query so RLS is a check, not a scan.                                                                        |
| **R4**  | `SECURITY DEFINER` + mutable `search_path` is the classic Postgres privilege-escalation hole.                                                                            | High        | Every helper declared `SET search_path = ''` with schema-qualified identifiers. Test R24 attacks this explicitly.                                                                                                                                                                                                                    |
| **R5**  | Wallet/ledger drift — `balance_after` disagreeing with `SUM(entries)`.                                                                                                   | High        | Insert-only tables, `REVOKE UPDATE/DELETE`, unique monotonic `entry_seq`, and a nightly reconciliation job that alerts on any mismatch (PRD §13.3 requires a ledger-imbalance alert).                                                                                                                                                |
| **R6**  | Exam integrity: clock tampering, duplicate attempts, lost answers on flaky mobile networks.                                                                              | High        | Server-authoritative deadline stored at attempt creation; client timer is display only. Unique `(exam_id, student_id, attempt_number)`. Idempotent UPSERT autosave keyed on `(attempt_id, question_id)` with a client sequence number to reject stale writes. Heartbeat endpoint. Server-side submission on deadline via cron sweep. |
| **R7**  | Concurrent number issuance producing duplicates or gaps under load.                                                                                                      | High        | `document_sequences` with `SELECT … FOR UPDATE` inside the same transaction as the entity insert, plus a `UNIQUE` constraint as the real guarantee. Proof test P5.                                                                                                                                                                   |
| **R8**  | Scope. This PRD is a multi-year enterprise product; 52 tables and 20+ modules will not land in one pass.                                                                 | High        | Strict phase gating with approval between phases, per PRD §20.1. Vertical slices only — no screen ships without its server validation, RLS policy, tests and mobile layout. I will say plainly when a phase is slipping rather than shipping half-wired screens.                                                                     |
| **R9**  | Two documents that can conflict on visual questions.                                                                                                                     | Medium      | Style guide wins on visuals (§1.2 above). Style guide §17 requires me to **pause and ask** rather than invent a third style — I will.                                                                                                                                                                                                |
| **R10** | Supabase free-tier limits (connections, storage, 7-day pause on inactivity) during a long build.                                                                         | Medium      | Use a connection pooler, keep seed data small, plan the Pro upgrade before Phase 3 when financial data appears.                                                                                                                                                                                                                      |
| **R11** | Personal data: photos, signatures, government IDs, minors' guardian details.                                                                                             | Medium-High | Private buckets, unpredictable paths, short-lived signed URLs, HMAC for ID duplicate checks, retention config, export/erasure workflow, and no personal data in logs (PRD §13.3).                                                                                                                                                    |
| **R12** | Logo asset fidelity — the only source is a raster JPEG, but the style guide demands SVG and forbids redrawing.                                                           | Medium      | Decision D4. Placeholder variants clearly marked until you supply or approve production vectors.                                                                                                                                                                                                                                     |
| **R13** | `Asia/Kolkata` is UTC+5:30; a naive date boundary puts attendance and receipts on the wrong day for evening batches.                                                     | Medium      | Store UTC, but compute every business date (attendance date, receipt date, financial period) in the organisation's timezone explicitly. Unit tests around midnight and financial-year boundaries.                                                                                                                                    |
| **R14** | Node 20.18 on this machine; some current tooling expects Node 22+.                                                                                                       | Low         | Verify at scaffold time; `.nvmrc` pins the version and CI matches it.                                                                                                                                                                                                                                                                |

---

## Approval requested

Per PRD §20.2, I will not create the project until this is approved. Please confirm:

1. This plan, or the changes you want to it.
2. **D1** — how I get a database (this is blocking).
3. **D2** — git init locally, and whether to create/push a private GitHub repo.
