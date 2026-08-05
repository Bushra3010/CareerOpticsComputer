# Open design conflicts

Style guide §17 instructs: _"Whenever this style guide and an ad-hoc page mockup
conflict, pause and request a decision rather than silently creating a third
style."_ This file is that pause. Each entry names the conflict, states what is
currently implemented, and asks for a decision.

Nothing here is a blocker for Phase 0 — the specified behaviour is implemented
in every case. They are logged so they cannot be forgotten.

---

## C1 — Primary button fails the contrast requirement

**Status:** open · **Raised:** 4 August 2026 · **Severity:** will fail the
accessibility gate at Phase 0 exit

**The conflict.** Style guide §10.1 specifies the primary button as _"Orange
fill, white text."_ Style guide §14 requires _"Normal text contrast at least
4.5:1."_

**The measurement.** White (`#FFFFFF`) on brand-orange-500 (`#EF6605`) is
**3.19:1**. Button labels are 14px semibold, which WCAG treats as normal-size
text, so the 4.5:1 threshold applies — 3:1 would only be enough at 18.66px bold
or larger.

The hover colour is no better: white on brand-orange-600 (`#D95600`) is
**3.98:1**, still short.

**What is implemented.** Exactly what §10.1 specifies — orange-500 fill, white
label. See `components/ui/button.tsx`. The showcase page carries a visible
warning so no reviewer can approve the palette without seeing this.

**Options.**

| Option                                                                           | Result                                                                                                    | Cost                                                                                                                                     |
| -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **A. Navy label on orange fill**                                                 | **4.93:1 — passes.** Keeps orange as the primary-action colour, which §3.4 treats as the point of orange. | Changes the look of every primary button. Navy-on-orange is a legitimate, confident pairing but it is not what the guide's words say.    |
| **B. Navy fill, white label for primary; orange reserved for accent/indicators** | 16.5:1 — passes comfortably.                                                                              | Contradicts §10.1 more directly, and weakens the orange-identifies-action rule in §3.4.                                                  |
| **C. Darken the orange until it passes**                                         | Needs roughly `#B44A00` to reach 4.5:1 — visibly brown, no longer the logo orange.                        | Invents a colour, which §17 forbids. Not recommended.                                                                                    |
| **D. Accept the exception deliberately**                                         | Ships as specified.                                                                                       | Fails the WCAG 2.2 AA target stated in §14 and PRD §8.2, and will be flagged by the automated accessibility scan in the CI quality gate. |

**Recommendation: A.** It satisfies both sections at once, keeps orange as the
action colour, and requires only a token change.

**Decision needed from:** brand owner.

---

## C2 — No compact logo mark or white monochrome variant exists

**Status:** open · **Raised:** 4 August 2026 · **Severity:** cosmetic now,
blocking before public launch

**The conflict.** Style guide §2.2 requires five production assets: full logo
(SVG), horizontal header lock-up, app icon (512×512 + maskable), compact
icon/avatar for the collapsed sidebar and favicon, and a white monochrome
version for navy backgrounds.

The only supplied asset is `Logo.jpeg` — a raster circular seal on a white
field. §2.2 also warns that at small sizes the complete circular logo becomes
unreadable, and §2.3 forbids using _"an unapproved cropped 'CO' as the final
production icon."_

**What is implemented.**

- The JPEG is used directly wherever a light surface is available.
- On the navy sidebar and footer, the mark sits on a solid white rounded
  surface — the treatment §2.3 explicitly sanctions — with the wordmark set in
  white type beside it. Nothing is recoloured, stretched or cropped.
- Favicon and PWA icons are straight downscales of the full seal. They are
  legible as a coloured circle but the lettering is not readable, which is
  exactly the failure mode §2.2 warns about.

**What is needed.**

1. A vector (SVG) of the full logo.
2. A white monochrome variant for navy surfaces.
3. An approved compact mark — a designed "CO" monogram or the graduation-cap
   element — that reads at 32px. This is the one that cannot be derived; it is a
   design decision, not a conversion.

**Decision needed from:** brand owner. Until then the placeholders stand and are
marked as such in `components/brand/logo.tsx`.

---

## C3 — PRD and style guide differ on the primary colour role

**Status:** resolved · **Resolved:** 4 August 2026

PRD §8.1 suggests _"navy primary, blue interaction colour."_ Style guide §3.1
and §10.1 assign the primary action to **orange**, with navy as chrome and blue
as links/interaction.

**Resolution:** the style guide governs all visual questions. It is more
specific, is dated one day later, and §17 designates it _"the visual source of
truth."_ Recorded here rather than in a code comment so the divergence from the
PRD is traceable. No decision needed unless you disagree.

---

## C4 — Dashboard mockups vs the style guide

**Status:** open · **Raised:** 4 August 2026 · **Owner supplied a mockup**

The owner supplied three dashboard mockups — Super Admin, Centre Admin and the
Student portal — and asked for each panel to be built like them. Its **layout and information architecture were followed exactly**
— greeting, four KPIs, two trend charts, three summary panels plus quick
actions, transactions with a platform summary, and a recent-activity strip. That
structure is good and matches §11.1's prescribed order.

Four **visual** details in the mockup contradict the style guide. Each was built
the guide's way, because §17 says the guide is the visual source of truth and
tells us to raise a conflict rather than invent a third style. Each is a small
change if you prefer the mockup.

| #   | Mockup                                                               | Style guide                                                                                                        | Built as                                                                                    |
| --- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| a   | 64px solid-filled circular icons on the KPI cards, one per brand hue | §10.3 "Avoid giant icons"; §3.4 "Do not create dashboards with every card in a different bright colour"            | 40px tinted disc — icon coloured, background a pale tint, so the saturated area stays small |
| b   | Four Quick Action buttons, each a different solid colour             | §10.1 "One most important action per region"; §3.4 orange stays "below approximately 10%" of visual area           | One orange primary ("Add centre"), three secondary                                          |
| c   | Green fill on "Approve centre", orange fill on "Recharge wallet"     | §3.4 "Green should appear only when the meaning is positive or successful" — a button is an intent, not an outcome | Secondary style; green kept for success states and the Active-centres KPI                   |
| d   | Sidebar logo block roughly 200px tall with the full circular seal    | §8.1 "Logo area: 64–72px high"                                                                                     | 68px lock-up: compact mark plus "Career Optics / Super Admin"                               |

**Also worth knowing:** the mockup's flat twelve-item sidebar was preferred over
the twenty-five-item grouped tree in build plan §2.3. §8.1 warns against more
than two nested levels, and twelve flat destinations are more scannable. The
deeper routes still exist and are reached from their section landing pages.

Labels use sentence case per §4.2, so "Exams and results" rather than the
mockup's "Exams & Results".

### Centre Admin and Student mockups — same four, plus three more

| #   | Mockup                                                   | Style guide                                                                  | Built as                                                           |
| --- | -------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| e   | Red icon disc on the "Pending fees" KPI                  | §3.3 red is the destructive/error colour; §10.5 maps pending to warning gold | Warning gold, with a warning-triangle icon                         |
| f   | Due dates in the pending-fees panel rendered in red text | §3.4 and §14: "Never communicate status using colour alone"                  | Red plus a warning icon and a screen-reader-only "Overdue:" prefix |

The Student mockup shows a photograph in the identity card. Student photographs
are personal data held in the private `student-private` bucket behind
short-lived signed URLs (PRD §10.7), so list and summary views show initials
until a real signed URL exists. Not a conflict, but worth knowing before someone
files it as a missing feature.

Both donuts follow the mockup as drawn. §12.3 forbids "decorative donuts for one
number", but neither is one: fee collection is collected against pending, and
staff attendance is 22 present against 2 absent. Each is a genuine part-to-whole
with a summary in the centre, which is the legitimate use.

**Decision needed from:** brand owner. Reply with the letters you want switched
to the mockup treatment, or "keep as built". The decision applies to both
dashboards — they share the same components.

---

## C5 — Orange body text fails contrast on a light surface

**Status:** open · **Raised:** 5 August 2026 · **Severity:** same gate as C1

**The conflict.** Same root cause as [C1](#c1--primary-button-fails-the-contrast-requirement),
opposite direction. C1 is white **on** orange; this is orange **as** the text.

**The measurement.** Brand-orange-500 (`#EF6605`) on the light surface
(`#F7F9FC`) is **3.02:1** at 13px semibold. WCAG treats that as normal-size
text — 3:1 would only be enough at 18.66px bold or larger — so the 4.5:1
threshold in style guide §14 applies. Orange-600 (`#D95600`) reaches only
**3.77:1**, so the hover token does not rescue it either.

**Where.** The eyebrow label above the home-page headline,
`app/(public)/page.tsx:21`, and the same pattern in the showcase at
`app/dev/components/page.tsx:186`. Found by the axe scan added on 5 August,
not by review — which is the point of having the scan.

**Why this is not just C1 again.** C1 is a conflict because §10.1 explicitly
specifies "orange fill, white text", so the guide's own words produce the
failure and only the brand owner can resolve it. Here the guide says something
weaker: §3.4 makes orange **the action colour**. An eyebrow label is not an
action. So it is at least arguable that orange was the wrong token for this
element regardless of contrast, and that option A below is a fix rather than a
new style.

**Options.**

| Option                                              | Result                          | Cost                                                                                                                                |
| --------------------------------------------------- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **A. Use `text-text-secondary` for eyebrow labels** | Passes comfortably.             | Loses the orange accent above the headline. Arguably closer to §3.4 than what is there now, since the label is not an action.       |
| **B. Set eyebrow labels at 18.66px bold or larger** | 3:1 threshold applies — passes. | Changes the type scale for one element; an eyebrow that large stops reading as an eyebrow.                                          |
| **C. Whatever resolves C1**                         | Depends.                        | If C1 is resolved by darkening the brand orange, this resolves with it. If C1 is resolved by changing the button only, it does not. |
| **D. Accept deliberately, as C1 option D**          | Ships as built.                 | Two AA failures instead of one.                                                                                                     |

**Recommendation: A**, and it does not need to wait for C1. If the guide does
specify orange for eyebrow labels somewhere this file has not accounted for,
say so and this becomes a genuine C1-style conflict instead.

**What is implemented.** Unchanged — orange, as built. Style guide §17 says to
pause rather than silently create a third style, and the scan now asserts that
this and C1 are the _only_ contrast failures on any public page, so a third one
fails the build rather than joining them quietly.

**Decision needed from:** brand owner.

---

## C6 — The muted text token fails contrast wherever it carries meaning

**Status:** open · **Raised:** 5 August 2026 · **Severity:** same gate as C1 and
C5, but this one is not a brand question

**The measurement.** `--color-text-muted` (`#8A94A6`) measures **2.90:1** on the
light surface (`#F7F9FC`) and **3.06:1** on white. Style guide §14 wants 4.5:1
for normal text. It is used in 25 places, mostly at 13px, which is nowhere near
the 18.66px-bold threshold where 3:1 would be enough.

`--color-text-secondary` (`#5E687B`) measures **5.32:1** on the same surface and
already exists in the `@theme` block.

**Why this differs from C1 and C5.** Those two are brand questions: the guide
specifies orange, orange is too light, and only the brand owner can choose
between changing the guide and accepting the failure. This one is not. Nothing
in the guide says "use the lightest grey for this label" — `text-muted` was
picked page by page, and a token that passes is sitting right next to it.

**The one legitimate use.** WCAG 2.2 exempts disabled controls and purely
decorative text from contrast. Where `text-muted` marks something genuinely
inert — a disabled field, a placeholder — it is correct and should stay. Where
it renders a value someone has to read, it is a defect.

**Options.**

| Option                                                                       | Result                   | Cost                                                                                                         |
| ---------------------------------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------ |
| **A. Audit the 25 uses; switch informational ones to `text-text-secondary`** | Passes.                  | An hour of judgement, one call per site. No token changes, no visual system change.                          |
| **B. Darken `--color-text-muted` until it passes**                           | Needs roughly `#6B7484`. | Then it is barely distinguishable from `text-secondary`, and the scale loses a step it was meant to provide. |
| **C. Delete the token and keep two greys**                                   | Passes, simplest system. | Loses the disabled/placeholder tier that WCAG actually permits.                                              |

**Recommendation: A.** It needs no brand decision — only someone deciding, per
site, whether the text is information or decoration.

**What is implemented.** Unchanged. Found by the axe scan on 5 August, which
now asserts contrast against an allowlist of exactly C1, C5 and this, so a
fourth failure fails the run.

**Decision needed from:** nobody, strictly — this is a defect with an obvious
fix. Recorded here rather than fixed in the same commit because the audit is
the work, and doing it blind would replace one unconsidered token with another.
