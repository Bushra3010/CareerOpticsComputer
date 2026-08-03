# Working in this repository

Context for anyone — human or AI agent — picking this project up. Read this
before your first change. It covers the decisions that are easy to violate by
accident, not the things you would work out from the code.

---

## What this is

A multi-tenant SaaS for **Career Optics Computer Academy**: one head office
running many franchise computer-training centres, each with students, fees,
attendance, exams, certificates, inventory and support.

Two documents govern everything, and they are the source of truth — not this
file, not the code:

| Document                                   | Governs                                                 |
| ------------------------------------------ | ------------------------------------------------------- |
| `Computer_Centre_Management_System_PRD.md` | Function, data model, security rules                    |
| `Career_Optics_UI_UX_Style_Guide.docx`     | Anything you can see                                    |
| `docs/00-build-plan.md`                    | Route map, ERD, permission matrix, RLS strategy, phases |
| `docs/01-handover.md`                      | Where the work currently stands and what is next        |
| `docs/02-open-conflicts.md`                | Contradictions awaiting a human decision                |

**Where the PRD and the style guide disagree on a visual question, the style
guide wins.** It is the more specific and later document. That resolution is
recorded as C3 in the conflicts file.

**Where they disagree and neither is obviously right, stop and ask.** Style
guide §17 is explicit about this: _"Whenever this style guide and an ad-hoc page
mockup conflict, pause and request a decision rather than silently creating a
third style."_ Two such conflicts are already open (C1, C2). Add to that file
rather than inventing a resolution.

---

## The six things that are easy to get wrong

### 1. Money is integer paise, never a float

`lib/money` exports a branded `Paise` type. `4500` means ₹45.00. There is no
rupee `number` anywhere in the system, because `0.1 + 0.2 !== 0.3` and this
application posts financial ledgers.

```ts
const fee: Paise = toPaise(4500); // ₹45.00
const wrong = 45.0; // will not type-check where Paise is wanted
```

### 2. Authorisation is checked twice, on purpose

```
Postgres RLS          → the backstop a crafted request cannot get past
authorize() in server → the readable error, the audit event, the UI state
```

Neither replaces the other. Skip `authorize()` and users get silent empty
results instead of an explanation. Skip RLS and a URL edit gets the data.

`lib/permissions` deliberately calls the same `has_permission()` function the
RLS policies call rather than reimplementing the rules in TypeScript. Do not
"optimise" that into a local check — a second implementation is a second thing
to get wrong.

### 3. The service-role key bypasses all RLS

`lib/db/service-role.ts` is `server-only` and demands a typed reason. Legitimate
callers are exactly four: webhooks, cron jobs, the invitation flow, and PDF
rendering — all places where no user session exists.

**If you want it inside a page or a form action, the RLS policy is wrong.** Fix
the policy. Every use writes an `audit_logs` row; "the system did it" must never
be an untraceable answer.

### 4. Ledgers are insert-only

`wallet_entries`, `journal_lines`, `inventory_entries`, `audit_logs` and
`exam_events` have `UPDATE` and `DELETE` revoked at the **privilege** level, not
just omitted from a policy. Corrections are reversals — a new compensating row,
never an edit. A wallet balance is always `SUM()` of its entries, never a stored
mutable field.

### 5. Never rewrite an applied migration

Add a forward migration. Migrations are timestamped and run in filename order.
This holds even for a typo in a comment once the migration has been applied
anywhere.

### 6. Status is never colour alone

Every `StatusBadge` carries an icon _and_ text. `STATUS_TONES` in
`components/ui/badge.tsx` is the canonical status → colour map; add to it rather
than choosing a colour in a page. Pending uses **warning gold**, never orange,
so it can never be confused with the orange primary action.

---

## Design system

Tokens live in `app/globals.css` as a Tailwind v4 `@theme` block, mapped
one-to-one from style guide §3–§5.

**Do not introduce a colour that is not in that block.** The only additions are
white-alpha levels over navy for sidebar states, which are transparencies rather
than new hues, and they are commented as such. Style guide §17 forbids inventing
a palette.

There is **no dark mode** and that is deliberate: the style guide specifies a
single light system with navy chrome, so a speculative dark theme would be an
invented palette.

Review any new screen at **360, 390, 768, 1024 and 1440px** — that is the
checklist in style guide §16, not a suggestion.

### Mobile is a different composition, not a narrow desktop

Style guide §9 is emphatic. The mobile shell has a 56px app header and 64px
bottom navigation, no sidebar, no breadcrumb, and never shows the desktop page
title and description together.

Wide tables become `MobileList` cards below `lg`, via `ResponsiveCollection`.
They do **not** scroll sideways. Both compositions render server-side and are
swapped with CSS, so there is no hydration mismatch.

---

## Layout of the code

```
app/(public)   marketing, catalogue, public verification
app/(auth)     sign-in, invitation, reset, MFA
app/admin      platform / head office     app/centre   centre portal
app/student    student portal             app/exam     exam runner, no chrome
app/api        route handlers, webhooks, cron
app/dev        component showcase — 404s in production, the ONLY place
               synthetic demo content is allowed

components/ui  primitives      components/layout  the three shells
components/tables  DataTable + MobileList     components/states  the four states

features/<domain>/  actions.ts · queries.ts · schema.ts · service.ts · components/
lib/           db · permissions · audit · money · validation · numbering · …
supabase/      migrations · tests (pgTAP)
```

Server actions are the default. Route handlers exist only for webhooks, cron,
high-frequency exam autosave, public unauthenticated endpoints, and anything a
future mobile app will call.

---

## Commands

```bash
npm run dev            # development server
npm run verify         # format, lint, typecheck, unit tests — run before pushing
npm run db:test        # pgTAP RLS suite (needs a database connection)
npm run db:types       # regenerate types/database.generated.ts after a migration
```

`npm run verify` is what CI runs. If it passes locally it should pass there.

---

## Conventions

- **Comments explain why, not what.** The code says what it does. A comment
  earns its place by recording a decision, a constraint, or a trap — a spec
  section reference, a reason a simpler approach fails.
- **Conventional Commits.** `feat(db):`, `fix(auth):`, `chore:`.
- **Branch from `main`**, open a PR. Never commit directly.
- **British English** in user-facing copy and identifiers: `organisation` in
  prose, but note the database uses `organization_id` — that spelling is fixed
  by the PRD's schema and is not worth a migration to change.
- **Sentence case** for buttons, tabs and headings. No all-caps navigation.

---

## Definition of done

From PRD §18 — a feature is not done until all of these hold:

- Empty, loading, error and permission-denied states exist
- Server validation and authorisation are implemented
- RLS policies and tests exist
- An audit event exists for sensitive actions
- Mobile and desktop layouts are verified
- No placeholder data on a production path

A screen without its four states is visibly incomplete, which is why
`components/states` exports them as components rather than leaving it to a
checklist.
