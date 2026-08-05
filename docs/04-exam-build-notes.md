# Phase 4 (exams) — notes before anyone writes the migration

**Written:** 6 August 2026. Nothing in the exam domain is built. This file
exists so the next attempt does not start where the last one did.

## What happened, so the same mistake is not repeated

A multi-agent design pass produced six long designs for the exam domain —
schema, RLS, attempt lifecycle, runner UI, implementation conventions, status
enums — roughly 300,000 words of reasoning.

**Not one of them contains a `CREATE TABLE` for a single exam table.** Not
`exams`, `exam_attempts`, `exam_answers`, `questions`, `question_options`,
`exam_questions`, `exam_assignments` or `question_banks`. Every one is
commentary on decisions about a schema none of them writes, and where they do
specify contracts, they contradict each other in ways that would not compile —
three incompatible submit signatures, two incompatible autosave signatures,
percentage in three different units, eleven `app.*` helper functions called and
one with a body.

The lesson is narrow and worth stating: **a design brief that asks for
reasoning gets reasoning.** If the artefact wanted is DDL, the brief has to
demand DDL and the review has to reject prose. The one review that was told to
check the repository rather than the text is the only part of that exercise
that produced anything usable — including a real privilege-escalation bug in
applied code (`docs/03-audit-findings.md`) and four documentation claims naming
files that do not exist.

## Facts about this repository, verified

Checked directly, not inferred. Several designs assumed the opposite of these.

| Claim                                                                                   | Status                                                                                                                                                                                            |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `supabase/tests/` exists, with a pgTAP suite                                            | **No.** Never has. `supabase/` is `config.toml`, `migrations/`, `seed.sql`, `.gitignore`.                                                                                                         |
| `public.jobs` exists for background work                                                | **No.** Any design that queues a job must create the table.                                                                                                                                       |
| `app/api/` exists                                                                       | **No.** The exam route handlers will be the first thing in it.                                                                                                                                    |
| `features/*/service.ts` exists                                                          | **No** — in none of the fifteen feature modules.                                                                                                                                                  |
| `courses` carries `organization_id`                                                     | **No.** So `courses.pass_percent` is platform-wide across every tenant today. See C7.                                                                                                             |
| `public.exam_attempt_status` already exists                                             | **Yes** — created in `0001` as `('not_started','in_progress','submitted','auto_submitted','evaluated')`. Nothing references it.                                                                   |
| A checkbox primitive exists in `components/ui`                                          | **No.** `components/tables/data-table.tsx:155` hand-rolls a `size-4` input — 16px, well under the 44px touch target style guide §16 requires. Pre-existing, and the exam runner would inherit it. |
| `record_student_result(publication_id, enrolment_id, max_marks, obtained_marks)` exists | **Yes**, `0015:158`. A graded attempt produces exactly those last two arguments.                                                                                                                  |
| `lib/navigation/centre-nav.ts` flags unbuilt exam routes                                | **Yes** — four `planned: true` entries. Clearing one is part of shipping its route.                                                                                                               |
| `docs/02-open-conflicts.md` numbering                                                   | Runs to **C8**. Designs proposed re-using C5 and C6, which are taken.                                                                                                                             |

## The blocking decisions

**C7 and C8 in `docs/02-open-conflicts.md`.** C7 — what a result publication is
scoped to — determines whether the migration is forty lines or four hundred,
and it is a question about how the academy issues results, not one the schema
can answer. C8 is five grading rules the PRD never states. Neither should be
guessed at; PRD §20.1 is explicit about that.

## The slice that should ship first — done, 6 August

Migration `0021`, `/admin/exams/question-banks`, `features/exams/`, 11
integration tests. The rest of this section is kept because it explains why it
went first, which is the part worth remembering.

Not the runner. **The question bank, admin-only** — three screens, no exams, no
attempts.

It looks like the least interesting slice and it is the right one, because it
forces the architecture that cannot be retrofitted: the answer key has to be
unreachable by `authenticated` at the privilege level (`revoke all on
public.question_options`), readable only through a `SECURITY DEFINER` function
that returns a sanitised paper. Build plan §5.2's proof test **R19** — "a
student reads `question_options.is_correct` during an attempt → denied at column
level" — is the only column-level requirement in the entire permission matrix.
Bolting it on after the runner exists means every read path already written the
other way.

Then: exams and assignment; the runner; and last a ~40-line bridge from a graded
attempt to the existing `record_student_result()`.

## Load-bearing — do not defer these

1. **Server-authoritative `deadline_at`**, computed once at attempt creation as
   `least(now() + duration, closes_at)`. PRD §19.6. A client-authoritative timer
   is a different product.
2. **`exam_attempts` unique `(exam_id, student_id, attempt_number)`** with an
   idempotent create path. A refresh must return the _same_ attempt.
3. **`exam_answers` unique `(attempt_id, question_id)`** — it is the `ON
CONFLICT` target, so it is the mechanism, not an optimisation.
4. **A client sequence number** on autosave, with `where existing.client_seq <
excluded.client_seq`. Build plan R6. Retrofitting leaves every earlier answer
   at zero with no ordering evidence.
5. **`INSERT`/`UPDATE` revoked on `exam_attempts` from `authenticated`**, with
   no policy. A student must never be able to write their own deadline. This is
   a privilege, not a policy.
6. **`REVOKE UPDATE, DELETE ON public.exam_events`** at the privilege level.
   CLAUDE.md rule 4 — adding it later does not repair rows already mutated.
7. **The deadline sweep**, with a partial index on `(deadline_at) where status =
'in_progress'` and `FOR UPDATE SKIP LOCKED`. Without it an abandoned attempt
   blocks that student forever.

## Safe to cut from the first slice

Sections and question shuffling; every question type except the three
auto-gradable ones; the whole subjective-evaluation queue and the `exam-private`
bucket; grace marks, re-evaluation and result unlock; realtime invigilation;
device fingerprinting and IP hashing. A flat, ordered, objective-only paper is a
complete exam.

## Mistakes the designs made that would have shipped broken

Recorded because they are the plausible kind, not the silly kind.

- An auto-grader that reads only `answer -> 'option_ids'` while the answer shape
  for single-choice is `{"option_id": …}` and for true/false is `{"value":
true}` — both would score zero, or take the negative mark, every time.
- `(v ->> 0)::uuid` over `jsonb_array_elements`: `->>` with an integer index on
  a JSON _string_ returns NULL, so multiple-choice never matches. Needs `v #>>
'{}'`.
- A grader branching on `when answer is null then 0` to implement "no penalty
  for a blank", against a column declared `not null default '{}'` — the branch
  is unreachable, so a **cleared** answer takes the full negative mark. The exact
  inverse of the intended rule, and the rule C8(c) says matters.
- New `app.*` functions default to `PUBLIC EXECUTE`. The blanket revoke in
  `0003:101` covered only functions existing then; `0014:49` is the house
  pattern of explicit grant and revoke per function.
- Every new RPC must be hand-added to `types/database.generated.ts`, because
  that file is hand-maintained and `npm run verify` runs `tsc --noEmit`. It is a
  merge gate, not a nicety.

## What will not be verifiable on merge

**This section improved on 6 August and the improvement is worth understanding.**
`SUPABASE_DB_URL` is now configured over the session pooler, the CLI's migration
history is repaired, and `supabase db push` works — so exam migrations can be
applied and tested the day they are written rather than merged untested. All
twenty existing migrations are applied and the integration suite runs green
against the live project.

What has _not_ changed: Docker is still absent, so `npm run db:test` still runs
against a directory with no pgTAP suites.

The real harness is `tests/integration/*.test.ts` over PostgREST with anon-key
sessions, and it is excluded from `npm run verify`, so **CI runs none of it**.
Two things cannot be expressed there at all: `set local role` with forged JWT
claims, and `EXPLAIN (ANALYZE, BUFFERS)` for build plan R3's per-row RLS cost on
the highest-QPS path in the product — exam autosave.

That last point is the one to fix before Phase 4: autosave is the highest-QPS
authenticated path in the product, and R3's per-row RLS cost is the risk nobody
has measured.
