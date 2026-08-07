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

All seven are addressed in `supabase/migrations/20260804000012_security_fixes.sql`,
and the same probe was re-run afterwards: every attack is now blocked, attendance
re-saves and persists the correction, and `audit_logs` fills.

**0012 shipped with a regression.** Its linkage guard in `post_payment` used
`SELECT ... FOR UPDATE` on `fee_plans`, and under RLS a row can only be locked
by someone who could also UPDATE it — `fee_plans` has SELECT and INSERT policies
but no UPDATE policy, so the guard rejected _every_ legitimate payment.
`20260804000013_fix_payment_lock.sql` keeps the guard, drops the unlockable
lock, and moves the serialising lock onto `fee_instalments`, which is what the
allocation loop actually mutates and which does have an UPDATE policy.

The lesson worth keeping: 0012 was written from a passing security probe alone.
A fix migration needs the happy path re-probed too, not just the attack.

## Confirmed later, by reading rather than probing

### An organisation-level permission check accepted a centre-scoped grant

**Found:** 6 August 2026 · **Fixed:** migration `0020` · **Severity:** privilege
escalation, latent

`app.has_permission(perm, org, centre)` decides every RLS policy and every
`authorize()` call. Its predicate, unchanged since migration `0003`, was:

```sql
and (centre is null or m.centre_id is null or m.centre_id = centre)
```

The first disjunct is the bug. Asking the **organisation-level** question —
`has_permission('centre.create', org)` with no centre — makes `centre is null`
true, the predicate short-circuits, and every membership row matches whatever
centre it belongs to. A user scoped to one centre answers "yes" to a question
about authority across the whole organisation.

Five applied policies ask that question: `centres_write_platform`
(`centre.create`), `audit_logs_select` (`audit.read`), `system_settings_write`
(`settings.update`, twice), and the two `leads` policies (`lead.read`,
`lead.create`).

**It was never exploitable, by luck rather than design.** None of those five
permission codes is granted to any role — checked against the live
`role_permissions` table, not inferred from the seed file. The bug arms itself
the first time somebody does the obvious thing and grants `lead.read` to
counsellors, at which point every counsellor at every centre reads every lead in
the organisation and the policy still reads as correct.

Fixed by distinguishing the two questions: a null centre now requires an
org-level membership (`m.centre_id is null`); a given centre is satisfied by an
org-level membership or one at exactly that centre. Head office reaching every
centre is deliberate and kept. No application code depended on the old
behaviour — every `authorize()` call site passes a real `context.centreId`.
Proof test **P1c** in `tests/integration/rls-proof.test.ts` fails against the
old function and passes against the new one.

**How it was found matters.** Not by this audit's six auditors, and not by
review. It came out of an automated review of the Phase 4 exam designs whose
brief was to check claims against the repository rather than against the prose —
the same pass that found four documentation claims naming files that do not
exist. The lesson generalises: this file's unverified backlog below was produced
by reading code for _smells_; this finding came from reading it for _facts_.

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

---

## Confirmed and fixed — 2026-08-07/08

A separate pass, months after the audit above and covering a different
question entirely: does the super-admin portal's CRUD coverage match what RLS
already permits? Not a six-auditor exercise — one reviewer, reading the
permission matrix and the actual policies against what screens existed, then
reproducing each finding against the live database before treating it as real.

### A suspended centre could reactivate itself

The one finding here that is a security defect rather than a missing screen.
`centres_update` gated on `centre.update` at row level, with no column
restriction, and `centre_owner` holds `centre.update` to edit their own
centre's profile. Combined: a suspended centre's own owner could clear the
suspension.

Reproduced live before it was believed: head office suspended a seeded centre
via the service role; the centre's own owner then issued a direct
`PATCH /centres?id=eq.<id> {"status":"active"}`, and RLS raised no objection.
PRD §19.3 and build plan §4's step-up list both treat suspension as a
head-office act; it was worth nothing.

**Fixed** in migration `0029`, the same shape as R19's answer-key fix — split
by privilege, not by policy. `centre.update` now grants columns
(`name, address, city, state, pincode`) only; `status` is reachable solely
through `set_centre_status()`, gated on `app.is_platform_admin()` or the new
organisation-level `centre.manage`. Permanently guarded by
`tests/integration/centre-lifecycle.test.ts`, whose first test is the exploit
itself.

### Gaps that were missing screens, not defects

RLS already permitted all of the following; nothing on top of it had ever been
built to use it.

| Gap                                                                        | Where it stood                                                              | Closed by                                                        |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| No way to suspend/close/reactivate a centre                                | `centres_update` allowed it row-wise; no UI                                 | `/admin/centres`, migration `0029`                               |
| No course create/update anywhere                                           | `features/academics/` had queries only                                      | `/admin/academics/courses`, `features/academics/actions.ts`      |
| Question banks/questions: update and delete legal under RLS, never exposed | `question_banks_write`/`questions_write` are `for all`                      | Retire/reactivate buttons — not hard delete; see below           |
| Exams: only publish was ever exposed as an update                          | `exams_write`/`exam_questions_write`/`exam_assignments_write` are `for all` | Cancel, delete-if-draft, remove-question, unassign-centre        |
| Leads captured, never read back beyond a count                             | `leads_platform_write`/`leads_platform_read` already `is_platform_admin()`  | `/admin/leads`                                                   |
| `issue_certificate()` had no revoke mirror                                 | `revoked_at`/`revoked_by`/`revoked_reason` unused since migration `0016`    | `revoke_certificate()` (migration `0029`), `/admin/certificates` |

**Retire, not delete, for question banks and questions; cancel, not delete,
for a published exam.** `exam_attempts.exam_id` cascades from `exams`
(migration `0024`) — deleting a published exam with attempts not yet imported
into a result would silently destroy student answers and scores. A **draft**
exam is the one case a hard delete is provably safe (`start_exam_attempt`
requires `status = 'published'`, so a draft cannot have an attempt to lose),
and that is the only delete this pass added.

**A second, smaller mistake caught by its own test.** Migration `0029` seeded
`certificate.revoke` and granted it to nobody but a platform admin, mirroring
`centre.manage`'s posture. That was wrong — revoking a certificate a centre
issued in error is the same authority as issuing it. Migration `0030` grants
it to `centre_owner`, matching `certificate.issue` exactly. Found because the
integration test written alongside `0029` assumed the grant existed and
failed until it did.
