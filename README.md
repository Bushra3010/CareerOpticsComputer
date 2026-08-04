# Career Optics — Computer Centre Management System

Multi-tenant computer education, franchise and training-centre management
platform for **Career Optics Computer Academy**.

> **Status: Phase 1 substantially complete, running against a hosted Supabase
> project.** Migrations `0001`–`0016`. Working end to end: the public site and
> course catalogue, admission enquiries, the centre franchise application and
> its head-office review, authentication for three portals, student admission,
> attendance, fees with an insert-only payment ledger, results with immutable
> publication, certificates, and public credential verification.
>
> Not built yet: exams (question banks, attempts, the exam runner), inventory,
> wallets, referrals, notifications and reporting. Known defects and an
> unverified audit backlog are in
> [`docs/03-audit-findings.md`](docs/03-audit-findings.md) — read it before
> treating any of this as production-ready. See
> [`docs/00-build-plan.md`](docs/00-build-plan.md) for the full phase plan.

---

## Documents

| Document                                                                               | What it governs                                                                     |
| -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| [`Computer_Centre_Management_System_PRD.md`](Computer_Centre_Management_System_PRD.md) | Functional requirements, data model, security rules                                 |
| `Career_Optics_UI_UX_Style_Guide.docx`                                                 | Visual and interaction specification — the source of truth for anything you can see |
| [`docs/00-build-plan.md`](docs/00-build-plan.md)                                       | Route map, ERD plan, permission matrix, RLS strategy, phase plan                    |
| [`docs/02-open-conflicts.md`](docs/02-open-conflicts.md)                               | Conflicts between the two documents awaiting a decision                             |

Where the PRD and the style guide disagree on a visual question, **the style
guide wins**. That resolution and its reasoning are recorded as C3 in the
conflicts document.

---

## Requirements

- **Node 22.13.0** or later. `.nvmrc` pins it and CI uses it.
  Node 20.18 will run the app but forces older Vitest and jsdom; see
  [Known limitations](#known-limitations).
- npm 10+
- A Supabase project (hosted or local). Local Supabase needs Docker.

## Getting started

```bash
npm ci
cp .env.example .env.local   # then fill in the Supabase values
npm run dev
```

Open <http://localhost:3000>.

### Review the design system

The internal component showcase is the artefact to review before any feature
page is built — style guide §17 requires it:

| Route               | What it shows                                                                                                                                |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `/dev/components`   | Every primitive: buttons, inputs, cards, tables, badges, dialogs, sheets, tabs, alerts, and the empty/loading/error/permission-denied states |
| `/dev/shell/centre` | Desktop portal shell (§8) and mobile app shell (§9)                                                                                          |
| `/dev/shell/public` | Public site header and footer (§7)                                                                                                           |

These routes 404 when `NEXT_PUBLIC_APP_ENV=production`. They are the only place
synthetic demo content is allowed to live.

Review each at **360, 390, 768, 1024 and 1440px** — that is the checklist in
style guide §16.

## Scripts

| Command             | Purpose                                                            |
| ------------------- | ------------------------------------------------------------------ |
| `npm run dev`       | Development server                                                 |
| `npm run build`     | Production build                                                   |
| `npm run verify`    | Format check, lint, type-check and unit tests — run before pushing |
| `npm run typecheck` | `tsc --noEmit`                                                     |
| `npm run test`      | Unit tests (Vitest)                                                |
| `npm run test:e2e`  | End-to-end tests (Playwright)                                      |
| `npm run db:start`  | Start local Supabase (requires Docker)                             |
| `npm run db:reset`  | Drop and re-apply every migration from scratch                     |
| `npm run db:test`   | pgTAP RLS and integration suites                                   |
| `npm run db:types`  | Regenerate `types/database.generated.ts`                           |

## Architecture

```
app/(public)      Marketing site, course catalogue, public verification
app/(auth)        Sign-in, invitation, password reset, MFA
app/admin         Platform / head-office portal
app/centre        Centre portal
app/student       Student portal
app/exam          Distraction-free exam runner (no portal chrome, by design)
app/api           Versioned route handlers, webhooks, cron

components/ui     Primitives    components/layout  Shells
components/tables Data table + its designed mobile equivalent
components/states Empty, loading, error, permission-denied

features/         Domain modules (actions, queries, schema, service, tests)
lib/              auth · db · permissions · validation · money · audit ·
                  numbering · idempotency · notifications · pdf · jobs · storage
supabase/         migrations · pgTAP tests · seed
```

Full route map and table plan: [`docs/00-build-plan.md`](docs/00-build-plan.md)
§2 and §3.

### Non-negotiables

These are enforced by review, tests and CI — not by convention:

1. **Money is integer paise.** `lib/money` uses a branded `Paise` type so a raw
   rupee float cannot be passed where paise are expected. Never `number` rupees.
2. **RLS is enabled and forced on every table.** Authorisation is checked twice:
   in Postgres as the backstop, and in the server layer for the readable error
   and the audit event. Never disable RLS for convenience.
3. **The service-role key is server-only.** It never appears in a Client
   Component, and every call site records an actor in `audit_logs`.
4. **Ledgers are insert-only.** Wallet, journal, inventory and audit rows are
   never updated or deleted. Corrections are reversals.
5. **No fake data on a production path.** Synthetic content lives under `/dev`
   and nowhere else.
6. **Status is never colour alone.** Every badge carries an icon and text.

## Known limitations

- **Database types are hand-maintained.** `types/database.generated.ts` is
  written by hand, not generated, because `npm run db:types` needs a reachable
  Postgres connection (`SUPABASE_DB_URL`), which isn't configured yet — only
  the REST-facing anon/service-role keys are. Once the DB URL is available,
  regenerate it and delete `lib/db/rpc.ts`'s `callRpc` escape hatch, which
  exists only because postgrest-js's RPC generics need the fully generated
  shape to type-check.
- **P6 (idempotent wallet debit) is proven against `idempotency_keys`, not
  `wallet_entries`** — the wallet ledger lands in migration `0009` (Phase 3).
  Re-point `tests/integration/rls-proof.test.ts` at it then.
- **No local Supabase / pgTAP.** Docker isn't available on the dev machine, so
  the database tests run as Vitest integration tests against the hosted project
  (`npm run test:integration`) instead of pgTAP in CI. Two suites live there:
  `rls-proof.test.ts` (the P1–P6 gate from build plan §5.3) and
  `feature-invariants.test.ts` (24 tests total), which covers the role matrix
  including proof test R13, attendance re-save and cross-centre marking, the
  fee split and allocation arithmetic, overpayment rollback, result
  publication immutability, and certificate issuance and public verification.
  They create and tear down their own tenant, so they are safe to re-run. This needs
  `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and
  `SUPABASE_SERVICE_ROLE_KEY` in the environment and is intentionally excluded
  from `npm run verify` so CI without those secrets doesn't fail.
- **Node 20.18 compatibility.** The toolchain wants Node ≥20.19. On 20.18,
  Vitest is pinned to 3.x and jsdom to 26.x, and npm prints `EBADENGINE`
  warnings. Upgrading to Node 22.13 removes all of it. CI already uses 22.
- **Brand assets are placeholders.** Only a raster JPEG of the logo exists. The
  SVG, white monochrome and compact variants required by style guide §2.2 are
  outstanding — see conflict C2.
- **Certificate numbers are enumerable, by design of the spec.** Build plan
  §1.3 specifies sequential certificate numbers and §2.1 requires a QR code to
  resolve `/verify/c/[number]` directly, so anyone can walk the number space
  and read holder names. The public payload is therefore the minimum an
  employer needs — name, course, centre, outcome, issue date, and nothing
  else — every lookup is written to `public_verification_logs`, and the app
  rate-limits by IP. Preventing enumeration outright means requiring name +
  number (confirm rather than reveal) and dropping the bare-number QR route;
  that is a product decision. See migration 0016.
- **Primary-button contrast.** White on brand-orange measures 3.19:1 against a
  4.5:1 requirement. Implemented as the style guide specifies, pending a brand
  decision — see conflict C1.

## Contributing

- Protected `main`; work on `feature/<issue>-<name>`, `fix/…` or `chore/…`.
- Every change goes through a pull request linked to an acceptance criterion.
- Conventional Commits where practical.
- **Never rewrite an applied migration.** Add a new forward migration.
- Run `npm run verify` before pushing.

## Repository configuration

| Setting                     | Status                                                                                              |
| --------------------------- | --------------------------------------------------------------------------------------------------- |
| Visibility                  | Private                                                                                             |
| Dependabot alerts           | Enabled                                                                                             |
| Secret scanning             | **Not enabled** — needs GitHub Advanced Security, unavailable on a private repo on the current plan |
| Branch protection on `main` | **Not enabled** — needs GitHub Pro for private repos                                                |

PRD §15 requires protected `main`, required reviews and secret scanning. Both
need a GitHub Pro plan (or a public repository). Until then, the CI workflow
still runs on every push and pull request — it just cannot be _enforced_ as a
merge gate. Raise this before Phase 1 ships anything to a real environment.
