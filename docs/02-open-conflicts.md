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
