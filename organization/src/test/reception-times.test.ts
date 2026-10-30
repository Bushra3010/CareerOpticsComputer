import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/client", () => ({ supabase: {} }));
const { formatDateTime, isToday, toIsoTimestamp } = await import("@/lib/supabase/reception");

/**
 * The visit columns are `timestamp without time zone`, written as UTC. A
 * stored value with no zone is UTC: a 9:36 pm visit in India must not show as
 * the previous evening, nor fall out of "Visitors today".
 */
describe("reception times", () => {
  afterEach(() => vi.useRealTimers());

  it("reads a stored visit as UTC and shows it on the local clock", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-24T16:12:00Z")); // 9:42 pm in India
    const stored = "2026-10-24 16:06:00";
    const shown = new Date(`${stored.replace(" ", "T")}Z`);
    expect(isToday(stored)).toBe(true);
    expect(formatDateTime(stored)).toBe(shown.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }));
    // A value that carries its zone is read as given.
    expect(isToday("2026-10-24T16:06:00+00:00")).toBe(true);
  });

  it("saves the form's date and time as the local clock reads them", () => {
    const iso = toIsoTimestamp("2026-10-24", "21:36");
    expect(new Date(iso).getTime()).toBe(new Date(2026, 9, 24, 21, 36).getTime());
  });
});
