# Security and correctness audit — 2026-08-04

Snapshot audit of everything built through commit `2bb07b4` (migrations
`0001`–`0011`, eight feature modules, the public site, auth and three portals).

## Method, and what it is worth

Six parallel auditors read the codebase, one per risk dimension (RLS/tenancy,
server-action authorization, money/ledger, data integrity, Next.js correctness,
UI states and accessibility). They produced **79 candidate findings**.

An adversarial verification pass was meant to try to refute each one. **It did
not run** — the agents hit a session limit and 223 of 244 failed. Two findings
happened to complete verification before the limit hit; that is an artefact of
where the failure landed, **not** evidence that the other 77 were refuted.

So the findings below fall into two very different buckets, and the distinction
matters:

- **Confirmed** — reproduced by hand against the live Supabase project. These
  are facts.
- **Unverified backlog** — one auditor's reading, not checked by anyone. Some
  will be wrong. Treat each as a lead to investigate, not a defect to fix.

## Confirmed by live probe

A script created two centres (A and B) with their own owners, students and
enrolments, then had A attempt each operation. Results:

| Probe                                             | Result                                                                      |
| ------------------------------------------------- | --------------------------------------------------------------------------- |
| Re-save an attendance session                     | **Fails** — `new row violates row-level security policy (USING expression)` |
| A marks B's enrolment inside A's own session      | **Succeeded** — cross-centre write                                          |
| A calls `next_document_number` with B's centre id | **Succeeded** — burns B's receipt sequence                                  |
| A attaches a fee plan to B's enrolment            | **Succeeded** — and the unique index makes it permanent                     |
| A writes an arbitrary audit row                   | **Succeeded**                                                               |
| A admits a student into B's centre                | Blocked — `students_insert` RLS held                                        |
| `audit_logs` row count after a full CRUD run      | **0** from the system                                                       |

Notes on severity:

1. **Attendance could never be corrected.** The first save of a day worked and
   every save after it failed. Migration 0010 gave `attendance_sessions` INSERT
   and SELECT policies but no UPDATE policy, while the action upserts with
   merge-duplicates (`ON CONFLICT DO UPDATE`). This was missed during the
   original feature verification because that test only ever clicked Save once.
2. **`enrolment_id` was entirely attacker-chosen.** It arrives as raw form field
   names (`status_<uuid>`), and the record policies proved only that the
   _session_ belonged to the caller's centre, never the enrolment.
3. **The fee-plan squat is not just a stray row.** `fee_plans` has a unique
   index on `enrolment_id`, so one centre planting a plan on another centre's
   enrolment permanently blocks the rightful centre from ever creating one.
4. **Nothing was audited.** `app.audit_trigger()` was written in migration 0003
   and attached to zero tables, so non-negotiable #3 ("every service-role call
   site records an actor") had no backing record for ordinary CRUD at all.

All seven are addressed in `supabase/migrations/20260804000012_security_fixes.sql`.

## Unverified backlog

Not reproduced. Ordered by the auditors' claimed severity within each group.

### Money and ledger

- `post_payment` does not tie `p_student_id` / `p_fee_plan_id` / `p_centre_id`
  together, so a payment can be booked against one student while settling
  another's instalments. _(Addressed in 0012 — the only backlog item fixed
  ahead of verification, because the tables are insert-only and a wrong row
  cannot be corrected.)_
- `getStudentFeeDetail` sums every payment a student ever made against a single
  plan's total, so paid/due are wrong once a student has more than one plan.
- `listStudentFeeSummaries` keeps one arbitrary plan per student while summing
  all their payments; unbounded selects may also be silently truncated by
  PostgREST's row limit.
- `getStudentFeeDetail` resolves the plan only through an `active` enrolment, so
  a completed enrolment hides an outstanding balance and its receipts.
- `receipt_number` is globally unique but built from an org-scoped centre code,
  so two organisations sharing a centre code would collide.
- `lib/money`'s tested `split()`/`allocate()` are unused; the split that ships
  is the untested SQL in `create_fee_plan`, and it distributes the remainder
  differently.

### Transactions and data integrity

- `approveCentreApplication` is a seven-step non-atomic mutation. A failure
  partway leaves an active centre with a still-pending application, and the
  results of the profile and membership inserts are discarded, so it can report
  success when the owner has no membership. The centre code is also derived
  from a non-atomic `COUNT`.
- `rejectCentreApplication` has no status guard — an already-approved
  application can be flipped to rejected while its centre stays live.
- No idempotency anywhere; the `idempotency_keys` table is never written to.
- `getCurrentCentreContext` picks an arbitrary membership with no `ORDER BY`.
- Several `ON DELETE CASCADE` paths would destroy fee schedules and history.
- `types/database.generated.ts` is hand-written and omits 11 of 13 Postgres
  enums, silently weakening type safety.

### RLS and authorization

- `app.has_permission` treats a NULL centre argument as "any membership in the
  org qualifies", so a centre-scoped user satisfies org-wide policy checks.
- `payments_insert` permits a direct PostgREST insert with a forged
  `receipt_number`, `posted_by` and `posted_at`, bypassing `post_payment`
  entirely.
- No constraint requires `centre_id` to belong to `organization_id` on any
  tenant-scoped table.
- `admit_student`, `create_fee_plan` and `post_payment` were never revoked from
  `PUBLIC`.
- Rate limits are keyed on client-controlled values (`x-forwarded-for`, the
  submitted email) and live in the Node process, so the anon-granted SQL RPCs
  bypass them entirely. Email-keyed sign-in limiting also enables targeted
  account lockout.

### Next.js and UX

- **No error boundary anywhere.** Queries throw raw `Error` carrying Postgres
  messages, and that is the app's only error state.
- No `loading.tsx` or Suspense on any route; `/centre/attendance` issues up to
  21 sequential queries before rendering.
- No `app/not-found.tsx`, while `notFound()` is called and the public nav links
  to routes that don't exist yet.
- Seven raw `<table>` blocks scroll sideways on a phone instead of using the
  `DataTable` + `MobileList` pair the design system provides; they also lack
  `scope` and captions.
- Attendance status dropdowns have no accessible name.
- Portals ship with no navigation and no skip link.
- Success panels replace their form permanently, with no `aria-live` region and
  no focus management.
- `/admin/centre-applications` has no platform-admin check and shows an
  RLS-produced empty list as though it were real data.
- Instalment status `waived` is missing from `STATUS_TONES` and renders as an
  anonymous grey chip, violating "status is never colour alone".
- Payment method and due dates are printed as raw enum values and ISO dates.

## What this audit did not cover

- **No penetration testing of auth itself** — sessions, JWT handling and the
  password-reset token flow were read, not attacked.
- **Concurrency was reasoned about, not observed.** The one lock added in 0012
  (`for update` on the fee plan) is argued from the code, not proven under load.
  Proof test P5 covers concurrent numbering; nothing covers concurrent payment.
- **No load or query-plan work.** Build plan R3 asks for `EXPLAIN (ANALYZE,
BUFFERS)` on the ten heaviest queries against seeded volume; that has not been
  done, and the RLS helpers run per row.
- **The UI was not exercised by a screen reader**, and no axe scan has been run.
- **Only the live hosted project was probed**, with a handful of rows. Nothing
  here says how the system behaves at realistic volume.
