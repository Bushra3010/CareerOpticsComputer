import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

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
