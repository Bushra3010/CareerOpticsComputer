import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Session Management saved nothing at all: both pages held a hardcoded array in
 * React state, so every add, edit and delete was undone by the next render.
 *
 * These pin down the writes that replaced it, and the two rules the admission
 * form depends on — that an admission date picks out its own session, and that
 * it cannot fall outside the session it claims. The date rules are compared as
 * `yyyy-mm-dd` strings on purpose: `new Date("2026-04-01")` is UTC midnight
 * read back in local time, which in India is still the 31st of March, so a Date
 * comparison would reject an admission on the session's own opening day.
 */
type Row = Record<string, unknown>;

const rows: Record<string, Row[]> = {};
const errors: Record<string, { code?: string; message?: string } | null> = {};
const calls: Array<{
  table: string;
  op: "select" | "insert" | "update";
  filters: Record<string, unknown>;
  values?: Record<string, unknown>;
}> = [];

function builder(table: string) {
  const call: (typeof calls)[number] = { table, op: "select", filters: {} };
  calls.push(call);

  const result = () => ({ data: rows[table] ?? [], error: errors[table] ?? null });

  const chain: Record<string, unknown> = {
    select: () => chain,
    insert: (values: Record<string, unknown>) => {
      call.op = "insert";
      call.values = values;
      return chain;
    },
    update: (values: Record<string, unknown>) => {
      call.op = "update";
      call.values = values;
      return chain;
    },
    eq: (column: string, value: unknown) => {
      call.filters[column] = value;
      return chain;
    },
    is: (column: string, value: unknown) => {
      call.filters[column] = value;
      return chain;
    },
    order: () => chain,
    single: () => Promise.resolve({ data: (rows[table] ?? [])[0] ?? null, error: errors[table] ?? null }),
    maybeSingle: () =>
      Promise.resolve({ data: (rows[table] ?? [])[0] ?? null, error: errors[table] ?? null }),
    then: (resolve: (value: unknown) => unknown) => Promise.resolve(result()).then(resolve),
  };
  return chain;
}

vi.mock("@/lib/supabase/client", () => ({
  supabase: { from: (table: string) => builder(table) },
  supabaseUrl: "https://project.supabase.co",
}));

const {
  getSessionYears,
  createSessionYear,
  updateSessionYear,
  deleteSessionYear,
  setCurrentSessionYear,
  sessionYearProblem,
  sessionYearsForDate,
  admissionDateProblem,
} = await import("@/lib/supabase/data");

const session = (over: Partial<Record<string, unknown>> = {}) => ({
  id: "s1",
  organizationId: "o1",
  name: "Session 2026-2027",
  startDate: "2026-04-01",
  endDate: "2027-03-31",
  status: "ACTIVE",
  isCurrent: true,
  description: "",
  createdAt: "2026-01-01T00:00:00Z",
  ...over,
});

/** What `sessionYearsForDate` and `admissionDateProblem` take. */
const mapped = (over: Partial<Record<string, unknown>> = {}) =>
  ({ ...session(over) }) as unknown as Parameters<typeof admissionDateProblem>[0];

const writes = () => calls.filter((call) => call.op !== "select");

beforeEach(() => {
  calls.length = 0;
  for (const key of Object.keys(rows)) delete rows[key];
  for (const key of Object.keys(errors)) delete errors[key];
});

describe("getSessionYears", () => {
  it("reads the institute's own sessions, newest first", async () => {
    rows.session_years = [session()];
    const { data, stored } = await getSessionYears("o1");

    expect(stored).toBe(true);
    expect(data).toHaveLength(1);
    expect(data[0].name).toBe("Session 2026-2027");
    expect(calls[0].filters).toMatchObject({ organizationId: "o1", deletedAt: null });
  });

  it("keeps the date columns as plain days", async () => {
    // PostgREST can hand a `date` back with a time attached; the comparisons
    // downstream are string comparisons and a trailing time would break them.
    rows.session_years = [session({ startDate: "2026-04-01T00:00:00+00:00" })];
    const { data } = await getSessionYears("o1");
    expect(data[0].startDate).toBe("2026-04-01");
  });

  it("says so quietly when the table has not been created yet", async () => {
    // A database without session-years.sql answers PGRST205. The admission form
    // reads `stored: false` as "ask for the academic year as free text".
    errors.session_years = { code: "PGRST205", message: "Could not find the table" };
    const { data, stored } = await getSessionYears("o1");
    expect(data).toEqual([]);
    expect(stored).toBe(false);
  });

  it("does not swallow a real failure", async () => {
    errors.session_years = { code: "42501", message: "permission denied for table session_years" };
    await expect(getSessionYears("o1")).rejects.toThrow(/permission denied/);
  });
});

describe("createSessionYear", () => {
  it("files the session against the organisation", async () => {
    rows.session_years = [session()];
    await createSessionYear("o1", {
      name: "  Session 2026-2027  ",
      startDate: "2026-04-01",
      endDate: "2027-03-31",
      status: "ACTIVE",
      description: "  ",
    });

    expect(writes()[0].values).toMatchObject({
      organizationId: "o1",
      name: "Session 2026-2027",
      startDate: "2026-04-01",
      endDate: "2027-03-31",
      status: "ACTIVE",
      // A cleared note is stored as null, not as an empty string.
      description: null,
    });
  });

  it("refuses a session that ends before it starts", async () => {
    await expect(
      createSessionYear("o1", { name: "Backwards", startDate: "2027-03-31", endDate: "2026-04-01" }),
    ).rejects.toThrow(/end after it starts/i);
    expect(writes()).toHaveLength(0);
  });

  it("refuses a session with no name", async () => {
    await expect(
      createSessionYear("o1", { name: "   ", startDate: "2026-04-01", endDate: "2027-03-31" }),
    ).rejects.toThrow(/name/i);
    expect(writes()).toHaveLength(0);
  });

  it("explains a missing table instead of reporting a bare error", async () => {
    errors.session_years = { code: "PGRST205", message: "Could not find the table" };
    await expect(
      createSessionYear("o1", { name: "Session", startDate: "2026-04-01", endDate: "2027-03-31" }),
    ).rejects.toThrow(/session-years\.sql/);
  });
});

describe("updateSessionYear", () => {
  it("saves the session that was edited", async () => {
    rows.session_years = [{ id: "s1" }];
    await updateSessionYear("s1", {
      name: "Session 2026-2027",
      startDate: "2026-04-01",
      endDate: "2027-03-31",
      status: "CLOSED",
    });

    expect(writes()[0].filters).toEqual({ id: "s1" });
    expect(writes()[0].values).toMatchObject({ status: "CLOSED" });
  });

  it("reports failure when the write matched no row", async () => {
    // PostgREST answers an update that matched nothing with 200 and an empty
    // body, which is how this screen used to report success and change nothing.
    rows.session_years = [];
    await expect(
      updateSessionYear("s1", { name: "Session", startDate: "2026-04-01", endDate: "2027-03-31" }),
    ).rejects.toThrow(/not saved/i);
  });

  it("will not save a range it would refuse to create", async () => {
    rows.session_years = [{ id: "s1" }];
    await expect(
      updateSessionYear("s1", { name: "Session", startDate: "2027-04-01", endDate: "2026-03-31" }),
    ).rejects.toThrow(/end after it starts/i);
    expect(writes()).toHaveLength(0);
  });
});

describe("deleteSessionYear", () => {
  it("soft-deletes and gives up being the current session", async () => {
    rows.session_years = [{ id: "s1" }];
    await deleteSessionYear("s1");
    expect(writes()[0].values).toHaveProperty("deletedAt");
    // A deleted row holding the flag would leave the institute with a current
    // session nobody can see, and the unique index would block the next one.
    expect(writes()[0].values).toHaveProperty("isCurrent", false);
  });

  it("reports failure when nothing was removed", async () => {
    rows.session_years = [];
    await expect(deleteSessionYear("s1")).rejects.toThrow(/not removed/i);
  });
});

describe("setCurrentSessionYear", () => {
  it("clears the old current session before setting the new one", async () => {
    rows.session_years = [{ id: "s1" }];
    await setCurrentSessionYear("o1", "s2");

    const [clear, set] = writes();
    // This order is required, not incidental: a unique index allows one current
    // session per organisation, so setting first would be refused.
    expect(clear.values).toMatchObject({ isCurrent: false });
    expect(clear.filters).toMatchObject({ isCurrent: true, organizationId: "o1" });
    expect(set.values).toMatchObject({ isCurrent: true });
    expect(set.filters).toEqual({ id: "s2" });
  });

  it("scopes the clear to the promoted session's own organisation", async () => {
    // A SUPER_ADMIN carries no organizationId of their own. Taking the scope
    // from the caller would leave the filter off entirely and clear the
    // current session for every institute in the database.
    rows.session_years = [{ id: "s2", organizationId: "o9" }];
    await setCurrentSessionYear(null, "s2");
    expect(writes()[0].filters).toMatchObject({ organizationId: "o9" });
  });

  it("reports failure when the session it was pointed at is gone", async () => {
    rows.session_years = [];
    await expect(setCurrentSessionYear("o1", "s2")).rejects.toThrow(/no longer exists/i);
  });
});

describe("sessionYearProblem", () => {
  it("passes a session that makes sense", () => {
    expect(
      sessionYearProblem({ name: "Session", startDate: "2026-04-01", endDate: "2027-03-31" }),
    ).toBeNull();
  });

  it("refuses a session of zero length", () => {
    expect(
      sessionYearProblem({ name: "Session", startDate: "2026-04-01", endDate: "2026-04-01" }),
    ).toMatch(/end after it starts/i);
  });

  it("names the box that is empty", () => {
    expect(sessionYearProblem({ name: "Session", endDate: "2027-03-31" })).toMatch(/starts/i);
    expect(sessionYearProblem({ name: "Session", startDate: "2026-04-01" })).toMatch(/ends/i);
  });
});

describe("sessionYearsForDate", () => {
  const all = [
    mapped({ id: "s1", name: "Session 2026-2027", startDate: "2026-04-01", endDate: "2027-03-31" }),
    mapped({ id: "s2", name: "Session 2025-2026", startDate: "2025-04-01", endDate: "2026-03-31" }),
  ] as never[];

  it("finds the session an admission date falls in", () => {
    expect(sessionYearsForDate(all, "2026-07-15").map((s) => s.name)).toEqual(["Session 2026-2027"]);
  });

  it("counts the opening and closing days as inside", () => {
    // The timezone bug this guards against: a Date comparison puts the opening
    // day one day early anywhere behind UTC and rejects it.
    expect(sessionYearsForDate(all, "2026-04-01").map((s) => s.id)).toEqual(["s1"]);
    expect(sessionYearsForDate(all, "2027-03-31").map((s) => s.id)).toEqual(["s1"]);
    expect(sessionYearsForDate(all, "2026-03-31").map((s) => s.id)).toEqual(["s2"]);
  });

  it("finds nothing for a date outside every session", () => {
    expect(sessionYearsForDate(all, "2030-01-01")).toEqual([]);
  });

  it("offers both when the institute overlaps two sessions", () => {
    const overlapping = [
      ...all,
      mapped({ id: "s3", name: "Bridging 2026", startDate: "2026-06-01", endDate: "2026-08-31" }),
    ] as never[];
    expect(sessionYearsForDate(overlapping, "2026-07-15")).toHaveLength(2);
  });

  it("finds nothing before a date has been picked", () => {
    expect(sessionYearsForDate(all, "")).toEqual([]);
  });
});

describe("admissionDateProblem", () => {
  const year = mapped();

  it("refuses an admission dated before its academic year", () => {
    expect(admissionDateProblem(year, "2026-03-31")).toMatch(/cannot be dated before/i);
  });

  it("refuses an admission dated after the session ended", () => {
    expect(admissionDateProblem(year, "2027-04-01")).toMatch(/ended/i);
  });

  it("allows the first and last day of the session", () => {
    expect(admissionDateProblem(year, "2026-04-01")).toBeNull();
    expect(admissionDateProblem(year, "2027-03-31")).toBeNull();
  });

  it("has nothing to say before both boxes are filled in", () => {
    expect(admissionDateProblem(year, "")).toBeNull();
    expect(admissionDateProblem(null, "2026-07-15")).toBeNull();
  });

  it("names the session and its start, so the message says what to do", () => {
    expect(admissionDateProblem(year, "2026-01-01")).toContain("Session 2026-2027");
    expect(admissionDateProblem(year, "2026-01-01")).toContain("2026-04-01");
  });
});
