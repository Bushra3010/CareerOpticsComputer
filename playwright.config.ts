import { readFileSync } from "node:fs";

import { defineConfig, devices } from "@playwright/test";

// The instructions below say "put the password in .env.local" — which only
// works if something actually reads it into the test process. Next.js loads
// the file for the dev server, not for Playwright, so without this the
// journey spec and the auth projects silently skipped for anyone who
// followed the instructions to the letter. Values already exported in the
// shell win, matching Next's own precedence.
try {
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
    if (m && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
} catch {
  // No .env.local — CI provides real env vars instead.
}

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
type Project = NonNullable<
  Parameters<typeof defineConfig>[0]["projects"]
>[number];

/** Drops the sign-in projects when E2E_PASSWORD is absent, with a reason. */
function portalProjects(all: Project[]): Project[] {
  if (process.env.E2E_PASSWORD) return all;
  const needsAuth = new Set(["setup", "desktop-auth", "mobile-360-auth"]);
  console.warn(
    "[playwright] E2E_PASSWORD is not set — running the public scan only. " +
      "Run `npm run db:seed:dev` and put the printed password in .env.local.",
  );
  return all.filter((p) => !needsAuth.has(p.name ?? ""));
}

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
    // Without this, headless Chrome reserves a 34px classic scrollbar, so
    // `window.innerWidth` is 34px wider than `documentElement.clientWidth`.
    // A `position: fixed; inset-x-0` element — the mobile bottom navigation —
    // then lays out to the wider figure and the overflow check reports 37px of
    // horizontal scroll that does not exist on a real phone, where scrollbars
    // are overlays and the two measurements agree. Hiding them makes the
    // measurement mean what it says.
    launchOptions: { args: ["--hide-scrollbars"] },
  },

  // The portal projects are only defined when there is a password to sign in
  // with. Defining them unconditionally would not skip cleanly: `storageState`
  // is resolved when the browser context is created, before any test body
  // runs, so a missing auth file is a hard error rather than a skip. CI
  // without the secret should run the public scan and say why it stopped
  // there, not fail on a file it was never going to have.
  //
  // The installed Google Chrome rather than Playwright's bundled Chromium.
  // Chrome is first in PRD §13.4's support matrix, and this avoids a ~150 MB
  // download of a second browser engine that would test the same DOM. CI needs
  // `npx playwright install --with-deps chrome` before `npm run test:e2e`.
  projects: portalProjects([
    // Signs in once per role and hands the session to the portal projects.
    { name: "setup", testMatch: /auth\.setup\.ts/, use: { channel: "chrome" } },

    {
      name: "desktop",
      testIgnore: /portal\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], channel: "chrome" },
    },
    {
      name: "desktop-auth",
      testMatch: /portal\.spec\.ts/,
      dependencies: ["setup"],
      use: { ...devices["Desktop Chrome"], channel: "chrome" },
    },
    {
      name: "mobile-360-auth",
      testMatch: /portal\.spec\.ts/,
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Chrome"],
        channel: "chrome",
        viewport: { width: 360, height: 780 },
        isMobile: false,
      },
    },
    // 360px is the width style guide §16 and PRD §8.4 make the floor: every
    // centre daily operation has to work there. Pixel 5 is 393; this is not.
    // The onboarding journey is excluded here: it proves a flow, not a
    // viewport, and re-running four sign-ins at 360px would double the
    // slowest spec to re-prove what the axe scan already covers.
    {
      name: "mobile-360",
      testIgnore: /portal\.spec\.ts|journey\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        channel: "chrome",
        viewport: { width: 360, height: 780 },
        isMobile: false,
      },
    },
  ]),

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
