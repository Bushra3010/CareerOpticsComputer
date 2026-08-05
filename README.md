# Career Optics — Computer Centre Management System

Multi-tenant computer education, franchise and training-centre management
platform for **Career Optics Computer Academy**.

> **Status: Phase 1 substantially complete, running against a hosted Supabase
> project.** Migrations `0001`–`0019`. Working end to end: the public site and
> course catalogue, admission enquiries, the centre franchise application and
> its atomic head-office approval, authentication for three portals, five
> centre roles with staff invitations, student admission and the student
> portal, private file storage for student photographs and identity proofs,
> attendance, fees with an insert-only payment ledger, results with immutable
> publication, certificates with printable A4 documents and QR codes, and
> public credential verification.
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
| [`docs/01-handover.md`](docs/01-handover.md)                                           | Where the work stands and what to do next                                           |
| [`docs/02-open-conflicts.md`](docs/02-open-conflicts.md)                               | Conflicts between the two documents awaiting a decision                             |
| [`docs/03-audit-findings.md`](docs/03-audit-findings.md)                               | Confirmed defects and the unverified audit backlog                                  |

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

| Command               | Purpose                                                                   |
| --------------------- | ------------------------------------------------------------------------- |
| `npm run dev`         | Development server                                                        |
| `npm run build`       | Production build                                                          |
| `npm run verify`      | Format check, lint, type-check and unit tests — run before pushing        |
| `npm run typecheck`   | `tsc --noEmit`                                                            |
| `npm run test`        | Unit tests (Vitest)                                                       |
| `npm run test:e2e`    | Accessibility scan over the public routes (Playwright + axe)              |
| `npm run db:start`    | Start local Supabase (requires Docker)                                    |
| `npm run db:reset`    | Drop and re-apply every migration from scratch                            |
| `npm run db:test`     | `supabase test db` — no pgTAP suite is written yet, so this finds nothing |
| `npm run db:types`    | Regenerate `types/database.generated.ts`                                  |
| `npm run db:seed:dev` | Fill an empty database with development data (see below)                  |

## Architecture

```
app/(public)      Marketing site, course catalogue, public verification
app/(auth)        Sign-in, invitation, password reset, MFA
app/admin         Platform / head-office portal
app/centre        Centre portal
app/student       Student portal
app/exam          Distraction-free exam runner (no portal chrome, by design)
app/api           Versioned route handlers, webhooks, cron

                  app/exam and app/api are PLANNED, not present. They are here
                  because the build plan's route map puts them here; the exam
                  route handlers will be the first thing in app/api.

components/ui     Primitives    components/layout  Shells
components/tables Data table + its designed mobile equivalent
components/states Empty, loading, error, permission-denied

features/         Domain modules. In practice: actions.ts, queries.ts, and
                  components/ — schema.ts where there is a form worth
                  validating. No module has grown a service.ts yet; when one
                  does, that is the signal an action has too much in it.
lib/              audit · auth · brand · dates · db · errors · money ·
                  navigation · notifications · permissions · qr · rate-limit ·
                  storage · utils · validation
                  Planned but absent: numbering, idempotency, pdf, jobs.
supabase/         migrations · seed        (no pgTAP suite exists — see below)
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

### Student files

Photographs and identity documents live in a **private** Supabase Storage
bucket (`student-private`, migration `0019`), never a public one. Objects are
keyed `{centre_id}/{student_id}/{uuid}.{ext}`; the storage policies parse the
first two segments to decide access, and the random filename is what makes a
path unguessable even to someone who knows both ids. Reads go through signed
URLs minted per render and valid for five minutes, so nothing durable ever
points at a private file. Uploads run as the signed-in user rather than the
service role, so a centre cannot write into another centre's folder despite
controlling the path string.

Two things a reader should not have to discover the hard way:

- **A student can read their own documents but never upload one.** A
  photograph that ends up on a certificate has to come from the centre that
  verified the identity.
- **The certificate inlines the photograph as a data URI**, like the QR code,
  because a signed URL would have to be fetched while the print dialogue opens
  and expires besides. The bucket's 5 MB cap bounds the worst case at roughly
  6.7 MB of base64 — storing a downscaled rendition at upload time is the
  outstanding fix.

Uploaded files are **not scanned for malware.** `MALWARE_SCAN_URL` exists in
`.env.example` and nothing calls it; the MIME allow-list and the 5 MB cap are
the only checks. Treat that as a gap before real files from the public arrive.

### Seeing the portals with something in them

`supabase/seed.sql` creates the organisation, permissions, roles and the course
catalogue — and no centres and no students. On a fresh database every dashboard
therefore renders its empty state, which reads as broken rather than new. That
was build plan §6 step 9 and it was never finished.

```bash
npm run db:seed:dev            # 18 centres, ~580 students, fees, payments,
                               # applications, leads, results, certificates
npm run db:seed:dev:remove     # take all of it back out
```

It also creates seven logins — the five centre roles at the flagship centre, a
second centre's owner so cross-centre isolation is something you can _see_ by
signing in as the wrong person, and one student. The password is generated per
run and printed once; it is deliberately not a constant in the repository,
because this is a public repository and a working credential for a live project
does not belong in it. Set `SEED_PASSWORD` to choose your own.

The data is deterministic, so the script is its own manifest — removal deletes
exactly what creation made, with no marker column to keep in step and nothing
synthetic leaking into the UI. It refuses to run when `NEXT_PUBLIC_APP_ENV` is
`production`, and it reports what is still in the database afterwards rather
than asserting success.

It deliberately does **not** reproduce the mockup's 128 centres and 12,840
students. Inserting thirteen thousand rows so a screenshot matches would be
dressing the database to flatter a picture. The aim is enough shape that the
growth chart curves, the top-performer table has an order, and two centres are
suspended or closed so those states are visible at all.

**The design is not the same thing as the data.** If a dashboard looks empty,
check the row counts before changing the page — the three shells under
[`/dev/shell/admin`](http://localhost:3000/dev/shell/admin),
`/dev/shell/centre` and `/dev/shell/student` render the same layouts against
synthetic content and will look right even when the database is bare.

### Accessibility

`npm run test:e2e` runs an axe scan over every unauthenticated route at desktop
and at 360px, against WCAG 2.2 AA. It needs a dev server, which it starts
itself, and the Supabase values in `.env.local`, because the course catalogue
and centre finder read from the database.

Three things about how it is written:

- It **asserts it is still on the URL it asked for** before scanning. A scan
  that silently follows a redirect to `/sign-in` and reports green is worse
  than no scan. That assertion is what caught the middleware bug where
  `startsWith("/centre")` also matched `/centres` and sent every visitor to the
  public centre finder into the staff sign-in page.
- Contrast is checked against an **allowlist**, not muted. C1 and C5 in
  [`docs/02-open-conflicts.md`](docs/02-open-conflicts.md) are known and
  awaiting a brand decision; any contrast failure that is not one of those
  fails the run.
- **The portals are covered too**, once there is a session to use. Put the
  password `npm run db:seed:dev` prints into `.env.local` as `E2E_PASSWORD`
  and the run adds the centre portal's ten routes and the student portal at
  both breakpoints — 96 checks in total. Without it the portal projects are
  not defined at all and the run covers the public routes only, saying so on
  the way past. They cannot merely be skipped: Playwright resolves
  `storageState` when it creates the browser context, before any test body
  runs, so a missing auth file is a hard error rather than a skip.

What the scan found on its first runs: the `/centres` middleware redirect, nine
portal pages scrolling a raw table sideways at 360px against CLAUDE.md's
explicit rule, a `<thead>` whose column order did not match its `<tbody>`, and
two unrecorded contrast failures. All fixed except C5, which needs a brand
decision. None of them came from review.

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
  A third, `storage.test.ts`, covers the private student bucket: cross-centre
  read and write denial against a known-good object path, the one-photograph
  rule, a student reading their own files but never uploading, and the bucket
  refusing an unsigned public URL.
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
- **`notFound()` inside a portal route returns a soft 404.** The portal
  segments have a `loading.tsx`, which makes Next stream the shell immediately;
  by the time a page calls `notFound()` the response has already committed 200,
  so the styled not-found page renders with the wrong status. Confirmed by
  removing `app/centre/loading.tsx`, after which the same URL returns 404.
  Kept as-is deliberately: these routes are authenticated and `noindex`, no
  crawler or API consumer reads the status, and the loading state is worth
  more on pages that run several queries. The public routes, which have no
  `loading.tsx`, return a correct 404.
- **Certificate numbers are enumerable, by design of the spec.**
- **PDF is the browser's, not the server's.** Certificates and receipts are
  laid out for A4 with print CSS and saved via the browser's own print dialogue,
  rather than rendered by headless Chromium — build plan R2 flags Chromium on
  Vercel as fragile (bundle limits, cold starts, no Edge runtime). The
  templates are plain HTML and CSS, which is R2's own suggested mitigation, so
  a server-side renderer can be added behind the same markup. What is missing
  until then: no PDF is generated on the server, so nothing can be emailed or
  archived automatically. Build plan
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

| Setting                     | Status                                                                                   |
| --------------------------- | ---------------------------------------------------------------------------------------- |
| Visibility                  | **Public** — confirmed against the GitHub API on 5 August 2026                           |
| Dependabot alerts           | Enabled                                                                                  |
| Secret scanning             | **Not enabled** — but it is free on a public repository, so switch it on                 |
| Push protection             | **Not enabled** — also free here, and the one that stops a leak rather than reporting it |
| Branch protection on `main` | **Not enabled** — free on a public repository too                                        |

An earlier version of this table said the repository was private and that
secret scanning therefore needed GitHub Advanced Security. That was wrong on
both counts. PRD §15 requires protected `main`, required reviews and secret
scanning; on a public repository all three are available at no cost, so the
only thing standing between here and PRD §15 is somebody opening
**Settings → Code security** and **Settings → Branches**. Until then CI runs on
every push and pull request but cannot be enforced as a merge gate.

### Credentials

No key has ever been committed — `.env.local` is gitignored, and every blob in
the history has been searched for the live anon and service-role tokens as well
as for JWT- and `sbp_`-shaped strings generally. Nothing matched.

That is not the same as saying nothing is exposed. **The `service_role` key for
project `kabxcwrcfjtmacykqajl` has been pasted into chat transcripts and has
not been rotated.** It bypasses row-level security completely — it is the one
credential in the system for which RLS is not a backstop. Rotate it in the
Supabase dashboard (Project Settings → API → service_role → Rotate) before any
real student record exists. PRD §11.3 requires it, and `docs/01-handover.md`
has been carrying the same warning since 4 August 2026.
