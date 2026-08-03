# Handover — current state

**Last updated:** 4 August 2026
**Phase:** 0 (Foundation) — not yet closed
**Branch with the newest work:** `feature/phase-0-database-foundation` (PR #1)

Read `CLAUDE.md` first for the conventions. This file is only about _where the
work stands_ and _what to do next_.

---

## 1. What exists and works

| Area             | State                                                                                                                                                                       | Where                  |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| Tooling          | Next.js 16 · React 19 · TS strict · Tailwind v4 · Vitest · Playwright · ESLint · Prettier · Husky · CI                                                                      | root configs           |
| Design tokens    | Complete, mapped 1:1 from style guide §3–§5                                                                                                                                 | `app/globals.css`      |
| Components       | Button, Input/Select/Textarea, Field, Card, KpiCard, StatusBadge, Dialog, ConfirmDialog, BottomSheet, Tabs, Alert, ErrorSummary, DataTable, MobileList, and the four states | `components/`          |
| Shells           | Desktop portal (§8), mobile app (§9), public header/footer (§7)                                                                                                             | `components/layout/`   |
| Showcase         | `/dev/components`, `/dev/shell/centre`, `/dev/shell/public`                                                                                                                 | `app/dev/`             |
| Money            | `Paise` branded type, 18 passing unit tests                                                                                                                                 | `lib/money/`           |
| Supabase clients | Browser, server (anon key), service-role (guarded + audited)                                                                                                                | `lib/db/`              |
| Authorisation    | `authorize()`, `hasPermission()`, step-up registry                                                                                                                          | `lib/permissions/`     |
| Audit            | App-layer writer alongside the DB trigger                                                                                                                                   | `lib/audit/`           |
| Migrations       | 5 files, 15 tables, full RLS policy set, 75 permissions, 10 role templates                                                                                                  | `supabase/migrations/` |

**Verified:** `npm run verify` passes — 0 lint errors, 0 type errors, 18 unit
tests green, production build clean. Responsive behaviour checked in a real
browser at 360/390/1024/1440px: no horizontal overflow, sidebar 256px navy at
desktop, bottom nav 65px and app header 57px at mobile, every touch target ≥44px.

---

## 2. What is blocked, and on what

### 2.1 The RLS proof suite has never run — this is what keeps Phase 0 open

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

### 2.2 Migrations were applied by hand

Because of 2.1, the schema was applied through the Supabase SQL editor rather
than the CLI. Two generated helper files support that path and are **gitignored**
(regenerate from `supabase/migrations/` if needed):

- `apply-phase-0.sql` — all five migrations concatenated, plus the
  `supabase_migrations.schema_migrations` rows so the CLI stays in sync
- `verify-phase-0.sql` — 14 structural assertions, returns one PASS/FAIL table

The committed copy of the verification script is
`supabase/tests/verify-structure-sqleditor.sql`.

**Status of that application: not yet confirmed.** Ask the project owner whether
`verify-phase-0.sql` returned 14 PASS rows before assuming the schema is live.

### 2.3 `types/database.generated.ts` is a placeholder

It declares empty table maps so the client modules type-check honestly rather
than pretending to know the schema. Queries are `unknown`-shaped, and a few
calls in `lib/audit` and `lib/permissions` carry `as never` casts that exist
**only** because of this. Run `npm run db:types` once the database is reachable
and remove those casts.

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

---

## 5. Repository facts

- **Public** repository. The owner chose this on 4 August 2026, overriding
  PRD §15's "private during development". No credentials are in the history —
  every commit was scanned before the first public push.
- `.env.example` is committed; `.env.local` never is.
- Branch protection and required reviews are **not** enabled. CI runs on every
  push and PR but cannot be enforced as a merge gate. PRD §15 wants this; raise
  it before anything ships to a real environment.
- Secret scanning and push protection are free on public repositories and should
  be switched on under Settings → Code security.

### If you are the owner reading this

The Supabase `service_role` key for project `kabxcwrcfjtmacykqajl` was pasted
into a chat transcript on 4 August 2026 and has not been rotated. That key
bypasses all row-level security. The project holds no real data yet, so the
current exposure is worthless — but rotate it before any student record exists.
PRD §11.3 requires it.
