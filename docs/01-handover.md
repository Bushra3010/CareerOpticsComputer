# Handover — current state

**Last updated:** 5 August 2026
**Phase:** 1 (substantially complete), Phase 4 (exams) in design
**Newest work:** on `main` — PR #1 merged, then the feature build merged on top

Read `CLAUDE.md` first for the conventions. This file is only about _where the
work stands_ and _what to do next_.

> **Note for anyone who read the 4 August version of this file.** It described
> Phase 0 with five migrations and a placeholder types file. That was accurate
> for the `feature/phase-0-database-foundation` branch it was written on. A
> separate line of work was happening in parallel and has since merged, so the
> numbers below are much larger. Nothing in the old version was wrong when
> written; it was describing a different tip. Sections 2.1 to 2.3 in particular
> were **resolved** by that merge and are marked as such rather than deleted,
> because how they were unblocked is worth knowing.

---

## 1. What exists and works

| Area             | State                                                                                                                                                                       | Where                         |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| Tooling          | Next.js 16 · React 19 · TS strict · Tailwind v4 · Vitest · Playwright · ESLint · Prettier · Husky · CI                                                                      | root configs                  |
| Design tokens    | Complete, mapped 1:1 from style guide §3–§5                                                                                                                                 | `app/globals.css`             |
| Components       | Button, Input/Select/Textarea, Field, Card, KpiCard, StatusBadge, Dialog, ConfirmDialog, BottomSheet, Tabs, Alert, ErrorSummary, DataTable, MobileList, and the four states | `components/`                 |
| Shells           | Desktop portal (§8), mobile app (§9), public header/footer (§7)                                                                                                             | `components/layout/`          |
| Showcase         | `/dev/components`, `/dev/shell/centre`, `/dev/shell/public`                                                                                                                 | `app/dev/`                    |
| Money            | `Paise` branded type, 18 passing unit tests                                                                                                                                 | `lib/money/`                  |
| Supabase clients | Browser, server (anon key), service-role (guarded + audited)                                                                                                                | `lib/db/`                     |
| Authorisation    | `authorize()`, `hasPermission()`, step-up registry                                                                                                                          | `lib/permissions/`            |
| Audit            | App-layer writer alongside the DB trigger                                                                                                                                   | `lib/audit/`                  |
| Migrations       | 19 files, applied through `0018`; `0019` written and not yet applied                                                                                                        | `supabase/migrations/`        |
| Dashboards       | Super Admin, Centre Admin and Student, from the owner's mockups                                                                                                             | `app/{admin,centre,student}/` |

**Also working end to end** (added after this file was first written): the
public site and course catalogue, admission enquiries, the centre franchise
application and its atomic head-office approval, authentication for three
portals, five centre roles with staff invitations, student admission and the
student portal, private file storage for photographs and identity documents,
attendance, fees with an insert-only payment ledger, results with immutable
publication, certificates with printable A4 documents and QR codes, and public
credential verification. `README.md` carries the current inventory.

**Verified:** `npm run verify` passes — 0 lint errors, 0 type errors, 29 unit
tests green, production build clean. Responsive behaviour checked in a real
browser at 360/390/1024/1440px: no horizontal overflow, sidebar 256px navy at
desktop, bottom nav 65px and app header 57px at mobile, every touch target ≥44px.

---

## 2. What was blocked, and how it was unblocked

### 2.1 ~~The RLS proof suite has never run~~ — RESOLVED, differently than planned

**Outcome:** P1–P6 are green. They did not run as pgTAP.

None of options A, B or C below worked out: no database connection string was
ever obtained, no CLI access token, and Docker is still not installed. What
happened instead was that the proofs were rewritten as **Vitest integration
tests running against the hosted project over PostgREST**, signing in as real
users with real anon-key sessions:

```bash
npm run test:integration     # needs the three Supabase env vars
```

Two suites live there — `tests/integration/rls-proof.test.ts` (the P1–P6 gate)
and `tests/integration/feature-invariants.test.ts` (24 tests), plus
`storage.test.ts` for the private bucket. They build and tear down their own
tenant, so they are safe to re-run. They are deliberately **excluded from
`npm run verify`** so CI without those secrets does not fail — which also means
**CI does not run them**. That is the remaining gap: the proofs pass on a
developer machine and nowhere else.

This is arguably a better test than pgTAP would have been, because it exercises
the same PostgREST path the application uses rather than a superuser SQL
session. It is worse in one way: it cannot test anything RLS does to a role the
anon key cannot assume.

The original unblocking options, still valid if you want real pgTAP:

<details>
<summary>Original section 2.1, kept for the record</summary>

`supabase/tests/00_tenancy_rls.sql` holds 25 assertions covering the mandatory
early proofs from PRD §20.4:

- **P1** Centre A cannot select Centre B's data
- **P3** Centre staff cannot change their own role
- **P4** A suspended membership cannot create records
- **P5** Concurrent registration numbering produces unique results (single-session half)

The build plan makes P1–P6 the Phase 0 exit gate. They are **written but not
executed**.

**Why:** applying DDL needs either a Postgres connection string or a Supabase
personal access token. The anon and service_role API keys cannot run DDL —
Supabase exposes no generic SQL endpoint — and local Supabase needs Docker,
which is not installed on the original development machine.

**To unblock**, either:

```bash
# Option A — connection string
# Supabase dashboard → Project Settings → Database → Connection string → URI
echo 'SUPABASE_DB_URL=postgresql://...' >> .env.local
npx supabase db push --db-url "$SUPABASE_DB_URL"
npm run db:test

# Option B — CLI access token
# supabase.com/dashboard/account/tokens → Generate new token (sbp_...)
export SUPABASE_ACCESS_TOKEN=sbp_...
npx supabase link --project-ref <ref>
npx supabase db push
npm run db:test

# Option C — Docker, for full local parity
npm run db:start && npm run db:reset && npm run db:test
```

Then regenerate types: `npm run db:types`.

</details>

### 2.2 Migrations were applied by hand — STILL TRUE

Because of 2.1, the schema was applied through the Supabase SQL editor rather
than the CLI. Two generated helper files support that path and are **gitignored**
(regenerate from `supabase/migrations/` if needed):

- `apply-phase-0.sql` — all five migrations concatenated, plus the
  `supabase_migrations.schema_migrations` rows so the CLI stays in sync
- `verify-phase-0.sql` — 14 structural assertions, returns one PASS/FAIL table

The committed copy of the verification script is
`supabase/tests/verify-structure-sqleditor.sql`.

**Status of that application: confirmed for `0001`–`0018`.** Not by reading the
verification script's output, but by querying the live database directly during
the feature build — every table, policy and function those migrations create has
been exercised by the integration suite. **`0019` (private student files) is
written and has NOT been applied**, so nothing in the storage slice has run
against the live project.

The hand-application habit is the standing risk here. Nineteen migrations have
now been pasted into the SQL editor one at a time, and the only thing keeping
`supabase_migrations.schema_migrations` honest is a human remembering to do it.
Getting `SUPABASE_DB_URL` populated is worth more now than it was at five
migrations.

### 2.3 ~~`types/database.generated.ts` is a placeholder~~ — RESOLVED by hand

It is now a full hand-written type map covering every table through `0019`,
because `npm run db:types` still needs the database connection 2.1 never got.
The `as never` casts are gone.

Two things it left behind. `lib/db/rpc.ts` exports a `callRpc` escape hatch that
exists **only** because postgrest-js's RPC generics need the genuinely generated
shape to type-check against, and a hand-written map does not reproduce it. And
embedded-resource selects (`students(full_name)`) need a small `one<T>(rel:
unknown)` helper, duplicated in a few query modules, for the same reason. Once
`npm run db:types` can run, regenerate, delete `callRpc`, and the `one<T>`
helpers should collapse too.

---

## 3. Decisions the owner still needs to make

Tracked in `docs/00-build-plan.md` §1.4 and `docs/02-open-conflicts.md`.

| ID     | Decision                                                                                                                                 | Blocks                                    |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| **C1** | White on brand-orange-500 is 3.19:1 against §14's 4.5:1 requirement. Built as §10.1 specifies.                                           | The accessibility scan at Phase 0 exit    |
| **C2** | Only a raster JPEG logo exists. §2.2 needs SVG, white monochrome and a compact mark; §2.3 forbids a cropped "CO" as the production icon. | Favicon, PWA icon, 72px collapsed sidebar |
| **D5** | Real course catalogue — names, codes, durations, fees. Owner said they will supply it.                                                   | Phase 2 seed data                         |
| —      | Head office address, phone and email (currently "to be confirmed" in the footer)                                                         | Public site launch                        |

Assumptions already made and safe to build on are listed in build plan §1.1 —
multi-organisation tenancy, INR/paise, `Asia/Kolkata`, April–March financial
year, no payment gateway before Phase 5, in-app notifications only in V1.

---

## 4. What to do next

Steps 1–9 of the old Phase 1 list below are **done**. What is actually next, in
priority order:

1. **Apply migration `0019`** in the SQL editor, then `npm run test:integration`
   to run the eight storage checks. Until that happens the private-file slice is
   code that has never touched the database it was written for.
2. **Rotate the `service_role` key** (see §5). This has been outstanding since
   4 August and the repository is public.
3. **Switch on secret scanning and push protection.** Free on a public
   repository; `README.md`'s old claim that they needed Advanced Security was
   wrong.
4. **Get `SUPABASE_DB_URL` populated.** It unblocks `npm run db:types`, real
   `supabase db push`, pgTAP, and it retires the hand-application habit in §2.2.
5. **Integration tests in CI.** They pass locally and run nowhere else, which is
   the same as not having them the day somebody else pushes.
6. **Phase 4 — exams.** The largest unbuilt vertical: question banks, exam
   setup, the distraction-free attempt runner at `app/exam/`, autosave and
   heartbeat route handlers, auto-grading and the evaluation queue. It carries
   the one High risk with no mitigation yet built (build plan R6: clock
   tampering, duplicate attempts, lost answers on flaky networks) and a genuine
   schema conflict with the already-shipped `0015` — see the exam entries in
   `docs/02-open-conflicts.md`.
7. **E2E.** `npm run test:e2e` exists and has no exam or admission flow behind
   it yet, and no axe scan has run.

Still unbuilt beyond exams: wallet, inventory and orders, notifications,
reports, CMS, referrals, support tickets, the leads UI, batches and timetable,
the admin portal beyond its dashboard and applications, the MFA / invite /
activate pages, and `app/api` (empty — the exam route handlers will be the first
things in it).

<details>
<summary>The original Phase 1 list, for the record — steps 1–9 are complete</summary>

**Immediately:** unblock 2.1, run `npm run db:test`, confirm 25/25 pass. That
closes Phase 0.

**Then Phase 1** — public site, auth, centre management. Full step list in
`docs/00-build-plan.md` §6. In order:

1. Migration `0006` — centre applications, reviews, documents
2. Public site: home, about, courses, centre finder, gallery, notices, contact
3. Enquiry form → `leads` (rate-limited, honeypot, no enumeration)
4. Centre application: public multi-step form, token-resumable draft
5. Head-office review with field-level comments, and the **atomic approval
   transaction** — centre + code + owner membership + wallet account + opening
   ledger entry + invitation, all-or-nothing
6. Auth: sign-in, invitation acceptance, reset, rate limiting, generic errors
7. Membership context resolution and `/select-context`
8. Three dashboards backed by **real queries only** — PRD §20.1 forbids
   scaffolding screens with fake data
9. Seed: 1 organisation, 2 centres, staff for every role, synthetic students
10. E2E: onboarding → approval → first login → dashboard, plus an axe scan

Phase 1 does not start until P1–P6 pass.

</details>

Step 10 is the one that did not happen. There is no E2E flow and no axe scan.

---

## 5. Repository facts

- **Public** repository — re-confirmed against the GitHub API on 5 August 2026.
  The owner chose this on 4 August 2026, overriding PRD §15's "private during
  development". No credentials are in the history: every blob in every commit
  has since been searched for the live anon and service-role tokens and for
  JWT- and `sbp_`-shaped strings in general, and nothing matched.
- `.env.example` is committed; `.env.local` never is.
- Branch protection and required reviews are **not** enabled. CI runs on every
  push and PR but cannot be enforced as a merge gate. PRD §15 wants this; raise
  it before anything ships to a real environment.
- Secret scanning and push protection are free on public repositories and should
  be switched on under Settings → Code security.

### If you are the owner reading this

The Supabase `service_role` key for project `kabxcwrcfjtmacykqajl` was pasted
into a chat transcript on 4 August 2026 and **has still not been rotated** as of
5 August. It was pasted into a second transcript during the feature build. That
key bypasses all row-level security — it is the one credential in the system for
which RLS is not a backstop, and this repository being public means the project
ref it belongs to is not a secret either.

The project holds no real student data, so today's exposure is worth nothing.
Rotate it anyway, now rather than at the moment it starts to matter:
Supabase dashboard → Project Settings → API → `service_role` → Rotate, then
update `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` and in any deployment
environment. PRD §11.3 requires it.
