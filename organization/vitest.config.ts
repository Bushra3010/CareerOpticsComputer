import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    /**
     * Vitest defaults to five seconds, which most of these tests clear in
     * well under one. The ones that do not are the page tests: they mount a
     * real screen and jsdom lays it out, and on a loaded machine a dozen of
     * them tip over the default together. That failure says nothing about the
     * code -- the same run passes on a quiet machine -- so it is noise that
     * teaches the reader to ignore a red suite.
     *
     * Thirty seconds is long enough that only a genuine hang reaches it.
     */
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
});
