import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Loads .env.local the way `next dev` does, so `npm run test:integration`
// works from a clean shell. Without this the credentials are absent, every
// suite skips, and the run reports success having tested nothing — which is
// exactly what happened the first time these were run against a live database.
// Anything already in the environment wins, so CI secrets are not overridden.
function loadEnvLocal(): void {
  let raw: string;
  try {
    raw = readFileSync(new URL("./.env.local", import.meta.url), "utf8");
  } catch {
    return;
  }
  for (const line of raw.split("\n")) {
    const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  }
}
loadEnvLocal();

// Separate from vitest.config.mts on purpose: these tests hit the live
// Supabase project over the network and need service-role credentials, so
// they must never run as part of `npm run test` / `npm run verify` in an
// environment (like CI without secrets) that doesn't have them.
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/integration/**/*.test.ts"],
    testTimeout: 30000,
    hookTimeout: 30000,
    globals: true,
  },
  resolve: {
    alias: { "@": fileURLToPath(new URL("./", import.meta.url)) },
  },
});
