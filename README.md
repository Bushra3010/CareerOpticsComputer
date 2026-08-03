# Career Optics — Computer Centre Management System

Multi-tenant computer education, franchise and training-centre management
platform for **Career Optics Computer Academy**.

> **Status: Phase 0 — Foundation, not yet closed.** The design system,
> application shells, project tooling and the full tenancy schema with its RLS
> security model exist. There is no authentication and no feature module yet.
>
> Phase 0 closes when the RLS proof suite runs green. It is written but has
> never been executed — see [`docs/01-handover.md`](docs/01-handover.md) §2.1
> for why and how to unblock it.

**New to this repository?** Read [`CLAUDE.md`](CLAUDE.md) for the conventions,
then [`docs/01-handover.md`](docs/01-handover.md) for where the work stands.

---

## Documents

| Document                                                                               | What it governs                                                                     |
| -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| [`Computer_Centre_Management_System_PRD.md`](Computer_Centre_Management_System_PRD.md) | Functional requirements, data model, security rules                                 |
| `Career_Optics_UI_UX_Style_Guide.docx`                                                 | Visual and interaction specification — the source of truth for anything you can see |
| [`docs/00-build-plan.md`](docs/00-build-plan.md)                                       | Route map, ERD plan, permission matrix, RLS strategy, phase plan                    |
| [`docs/01-handover.md`](docs/01-handover.md)                                           | Where the work stands, what is blocked, what is next                                |
| [`docs/02-open-conflicts.md`](docs/02-open-conflicts.md)                               | Conflicts between the two documents awaiting a decision                             |
| [`CLAUDE.md`](CLAUDE.md)                                                               | Conventions and the traps that are easy to fall into                                |

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

- **The RLS proof suite has never run.** Migrations `0001`–`0005` and 25 pgTAP
  assertions covering proof tests P1, P3, P4 and P5 exist, but applying DDL
  needs a Postgres connection string or a Supabase CLI token — the anon and
  service_role API keys cannot do it. This is what keeps Phase 0 open. See
  [`docs/01-handover.md`](docs/01-handover.md) §2.1.
- **`types/database.generated.ts` is a placeholder.** A few `as never` casts in
  `lib/audit` and `lib/permissions` exist only because of it. Run
  `npm run db:types` once the database is reachable and remove them.
- **Node 20.18 compatibility.** The toolchain wants Node ≥20.19. On 20.18,
  Vitest is pinned to 3.x and jsdom to 26.x, and npm prints `EBADENGINE`
  warnings. Upgrading to Node 22.13 removes all of it. CI already uses 22.
- **Brand assets are placeholders.** Only a raster JPEG of the logo exists. The
  SVG, white monochrome and compact variants required by style guide §2.2 are
  outstanding — see conflict C2.
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

| Setting                     | Status                                                                        |
| --------------------------- | ----------------------------------------------------------------------------- |
| Visibility                  | **Public** — owner's decision, 4 Aug 2026, overriding PRD §15                 |
| Dependabot alerts           | Enabled                                                                       |
| Secret scanning             | **Not enabled** — free on public repos; switch on at Settings → Code security |
| Branch protection on `main` | **Not enabled** — free on public repos; switch on at Settings → Rules         |

PRD §15 requires a private repository, protected `main`, required reviews and
secret scanning. The repository is public by the owner's explicit choice; no
credentials are in the git history, which was scanned in full before the first
public push.

Branch protection and secret scanning are both free on public repositories and
are worth enabling now. Until they are, CI runs on every push and pull request
but cannot be _enforced_ as a merge gate.
