import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * The axe scan build plan §6 step 10 asks for and Phase 1 never ran.
 *
 * Only unauthenticated routes are covered here. The portals need a real
 * session against the hosted Supabase project, and a scan that silently
 * redirects to /sign-in and passes would be worse than no scan at all — it
 * would report green for pages it never loaded. `assertOnPage` below exists
 * to make that failure loud if anyone adds a portal route to the list.
 *
 * PRD §8.1 requires WCAG 2.2 AA, so the tags are wcag2a/wcag2aa/wcag21a/
 * wcag21aa/wcag22aa. `best-practice` is deliberately excluded: it flags
 * opinions, not conformance failures, and mixing the two makes a real
 * violation easy to skim past.
 */
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

const PUBLIC_ROUTES = [
  { path: "/", name: "home" },
  { path: "/about", name: "about" },
  { path: "/courses", name: "course catalogue" },
  { path: "/centres", name: "centre finder" },
  { path: "/contact", name: "contact" },
  { path: "/admissions/enquiry", name: "admission enquiry" },
  { path: "/partner-with-us", name: "partner with us" },
  { path: "/partner-with-us/apply", name: "centre application" },
  { path: "/verify", name: "verification landing" },
  { path: "/verify/certificate", name: "certificate verification" },
  { path: "/verify/registration", name: "registration verification" },
  { path: "/legal/terms", name: "terms" },
  { path: "/legal/privacy", name: "privacy" },
  { path: "/legal/refund-policy", name: "refund policy" },
  { path: "/sign-in/student", name: "student sign-in" },
  { path: "/sign-in/centre", name: "centre sign-in" },
  { path: "/forgot-password", name: "forgot password" },
];

/** A redirect to sign-in would otherwise scan the wrong page and pass. */
async function assertOnPage(page: Page, path: string): Promise<void> {
  const landed = new URL(page.url()).pathname;
  expect(landed, `expected to stay on ${path}, landed on ${landed}`).toBe(path);
}

for (const route of PUBLIC_ROUTES) {
  test(`${route.name} has no WCAG violations`, async ({ page }) => {
    await page.goto(route.path);
    await assertOnPage(page, route.path);

    const results = await new AxeBuilder({ page })
      .withTags(WCAG_TAGS)
      // C1 in docs/02-open-conflicts.md: white on brand-orange measures 3.19:1
      // against the 4.5:1 requirement. It is implemented exactly as style guide
      // §10.1 specifies and is awaiting a brand decision, so failing every page
      // on it would drown out every other finding. The dedicated test below
      // measures it directly instead, so it cannot be quietly forgotten.
      .disableRules(["color-contrast"])
      .analyze();

    expect(
      results.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        help: v.help,
        nodes: v.nodes.map((n) => n.target.join(" ")),
      })),
    ).toEqual([]);
  });
}

/**
 * The contrast failures still open in docs/02-open-conflicts.md: C1 and C5,
 * both brand-orange being too light to carry 4.5:1 — against white on the
 * primary button, and as text on the light surface. Only the brand owner can
 * resolve either.
 *
 * This is an allowlist, not a mute, and it is kept short deliberately. C6 was
 * here for a few hours and has been removed because it is fixed; an entry for
 * something that no longer happens would hide the regression when it returns.
 * Any contrast failure that is not C1 or C5 fails this test.
 */
const KNOWN_CONTRAST_FAILURES = [
  { conflict: "C1", foreground: "#ffffff", background: "#ef6605" },
  { conflict: "C5", foreground: "#ef6605", background: "#f7f9fc" },
];

function isKnown(summary: string): boolean {
  const s = summary.toLowerCase();
  return KNOWN_CONTRAST_FAILURES.some(
    (k) => s.includes(k.foreground) && s.includes(k.background),
  );
}

for (const route of PUBLIC_ROUTES) {
  test(`${route.name} has no contrast failure beyond the recorded ones`, async ({
    page,
  }) => {
    await page.goto(route.path);
    await assertOnPage(page, route.path);

    const results = await new AxeBuilder({ page })
      .withTags(WCAG_TAGS)
      .withRules(["color-contrast"])
      .analyze();

    const unexpected = results.violations
      .flatMap((v) => v.nodes)
      .filter((n) => !isKnown(n.failureSummary ?? ""));

    expect(
      unexpected.map((n) => ({
        target: n.target.join(" "),
        summary: n.failureSummary,
      })),
    ).toEqual([]);
  });
}

const OVERFLOW_PROBE = () => {
  // Measured on in-flow content, not on documentElement.scrollWidth.
  //
  // Two reasons. A `position: fixed` element cannot scroll the page on a phone
  // — the viewport will not move for it — so it is not what "the page scrolls
  // sideways" means. And headless Chrome reserves a classic scrollbar, which
  // makes `window.innerWidth` wider than `clientWidth`; a fixed `inset-x-0`
  // element lays out to the wider figure and reports 37px of overflow that no
  // real device has. Walking in-flow boxes answers the question actually being
  // asked.
  const limit = document.documentElement.clientWidth;
  const worst = [];
  for (const el of document.querySelectorAll("body *")) {
    const style = getComputedStyle(el);
    if (style.position === "fixed" || style.display === "none") continue;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0) continue;
    if (rect.right > limit + 1) {
      worst.push({
        tag: el.tagName.toLowerCase(),
        cls: String(el.className || "").slice(0, 60),
        over: Math.round(rect.right - limit),
      });
    }
  }
  return { limit, worst: worst.slice(0, 5) };
};

test("the public site never scrolls sideways at 360px", async ({ page }) => {
  // Style guide §16 and CLAUDE.md: wide content scrolls inside its own
  // container, the page body never does. Checked here rather than by eye
  // because it regresses the moment someone adds a fixed-width element.
  test.skip(
    test.info().project.name !== "mobile-360",
    "only meaningful at the 360px floor",
  );

  for (const route of PUBLIC_ROUTES) {
    await page.goto(route.path);
    const { worst } = await page.evaluate(OVERFLOW_PROBE);
    expect(worst, `${route.path} has in-flow content past 360px`).toEqual([]);
  }
});
