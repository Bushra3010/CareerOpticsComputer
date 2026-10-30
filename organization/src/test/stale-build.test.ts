import { describe, expect, it, vi } from "vitest";
import { isStaleChunkError, reloadForNewBuild } from "@/lib/staleBuild";

/** A tab left open across a deploy reloads once, instead of showing a blank page. */
describe("stale build", () => {
  it("knows the errors a missing page file gives", () => {
    expect(isStaleChunkError(new TypeError("Failed to fetch dynamically imported module: https://x/assets/PrintApprovals-i8sNn8Uj.js"))).toBe(true);
    expect(isStaleChunkError("Importing a module script failed.")).toBe(true);
    expect(isStaleChunkError(new Error("Network request failed"))).toBe(false);
  });

  it("reloads once, then not again for half a minute", () => {
    const store = new Map<string, string>();
    const storage = { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v) };
    const reload = vi.fn();
    expect(reloadForNewBuild(storage, reload)).toBe(true);
    expect(reloadForNewBuild(storage, reload)).toBe(false);
    expect(reload).toHaveBeenCalledTimes(1);
  });
});
