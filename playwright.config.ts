import { defineConfig, devices } from "@playwright/test";

/**
 * `npm run test:e2e` has been in package.json since the first commit with no
 * config and no tests behind it, so it has never done anything. This is that
 * config.
 *
 * Chromium only, deliberately. The accessibility rules axe checks are engine
 * independent, and a matrix of five browsers would triple the run time to
 * re-prove the same DOM. PRD §13.4's browser support matrix is a manual
 * checklist, not something a headless run establishes.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : [["list"]],

  // 30s is not enough for axe's colour-contrast rule on the long legal pages —
  // it walks every text node and computes an effective background for each.
  // The scan is correct there, just slow; the timeout was the only failure.
  timeout: 90_000,

  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
  },

  // The installed Google Chrome rather than Playwright's bundled Chromium.
  // Chrome is first in PRD §13.4's support matrix, and this avoids a ~150 MB
  // download of a second browser engine that would test the same DOM. CI needs
  // `npx playwright install --with-deps chrome` before `npm run test:e2e`.
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], channel: "chrome" },
    },
    // 360px is the width style guide §16 and PRD §8.4 make the floor: every
    // centre daily operation has to work there. Pixel 5 is 393; this is not.
    {
      name: "mobile-360",
      use: {
        ...devices["Desktop Chrome"],
        channel: "chrome",
        viewport: { width: 360, height: 780 },
        isMobile: false,
      },
    },
  ],

  // Reuses a dev server if one is already up, which is what happens locally.
  // The production build is closer to what ships, but `next dev` is what a
  // developer will actually have running, and axe finds the same violations
  // in both.
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
