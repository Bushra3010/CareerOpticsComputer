import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { CENTRE_STATE, STUDENT_STATE } from "./auth-state";

/**
 * The other half of the accessibility scan.
 *
 * `accessibility.spec.ts` covers the seventeen unauthenticated routes. Most of
 * the interface is not there — it is behind a sign-in, in the three portals,
 * and until `npm run db:seed:dev` produced logins there was no way to reach it
 * from a test at all.
 *
 * Same rules as the public scan: WCAG 2.2 AA, contrast checked against the
 * recorded conflicts rather than muted, and every page asserts it is still on
 * the URL it asked for before scanning — an expired session that redirects to
 * sign-in would otherwise scan the sign-in page and report green.
 */
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

const KNOWN_CONTRAST_FAILURES = [
  { conflict: "C1", foreground: "#ffffff", background: "#ef6605" },
  { conflict: "C5", foreground: "#ef6605", background: "#f7f9fc" },
  { conflict: "C6", foreground: "#8a94a6", background: "#f7f9fc" },
  { conflict: "C6", foreground: "#8a94a6", background: "#ffffff" },
];

function isKnownContrast(summary: string): boolean {
  const s = summary.toLowerCase();
  return KNOWN_CONTRAST_FAILURES.some(
    (k) => s.includes(k.foreground) && s.includes(k.background),
  );
}

async function scan(page: Page, path: string): Promise<void> {
  await page.goto(path);
  const landed = new URL(page.url()).pathname;
  expect(landed, `expected ${path}, landed on ${landed}`).toBe(path);

  const results = await new AxeBuilder({ page })
    .withTags(WCAG_TAGS)
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

  const contrast = await new AxeBuilder({ page })
    .withTags(WCAG_TAGS)
    .withRules(["color-contrast"])
    .analyze();

  const unexpected = contrast.violations
    .flatMap((v) => v.nodes)
    .filter((n) => !isKnownContrast(n.failureSummary ?? ""));

  expect(
    unexpected.map((n) => ({
      target: n.target.join(" "),
      summary: n.failureSummary,
    })),
  ).toEqual([]);
}

const CENTRE_ROUTES = [
  "/centre",
  "/centre/students",
  "/centre/students/new",
  "/centre/attendance",
  "/centre/attendance/take",
  "/centre/fees",
  "/centre/results",
  "/centre/certificates",
  "/centre/staff",
  "/centre/profile",
];

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

test.describe("centre portal", () => {
  test.use({ storageState: CENTRE_STATE });

  for (const path of CENTRE_ROUTES) {
    test(`${path} has no WCAG violations`, async ({ page }) => {
      await scan(page, path);
    });
  }

  test("the dashboard shows the signed-in centre, not a generic shell", async ({
    page,
  }) => {
    // A dashboard that renders but reads zeros everywhere looks identical to a
    // working one at a glance, and that is exactly how an empty database gets
    // mistaken for a broken page. Assert real content, not just a 200.
    await page.goto("/centre");
    // Scoped to #main: the mobile composition also puts an <h1> in the app
    // header, so an unscoped level-1 lookup matches two elements at 360px and
    // none at 1440px.
    const main = page.locator("#main");
    await expect(main.getByRole("heading", { level: 1 })).toContainText(
      "Career Optics",
    );
    await expect(page.getByText("Active students")).toBeVisible();
  });

  test("no sideways scroll anywhere at 360px", async ({ page }) => {
    test.skip(
      test.info().project.name !== "mobile-360-auth",
      "only meaningful at the 360px floor",
    );

    for (const path of CENTRE_ROUTES) {
      await page.goto(path);
      const { worst } = await page.evaluate(OVERFLOW_PROBE);
      expect(worst, `${path} has in-flow content past 360px`).toEqual([]);
    }
  });
});

test.describe("student portal", () => {
  test.use({ storageState: STUDENT_STATE });

  test("/student has no WCAG violations", async ({ page }) => {
    await scan(page, "/student");
  });
});
