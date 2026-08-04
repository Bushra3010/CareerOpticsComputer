import { describe, expect, it } from "vitest";

import { businessDate, financialYear, monthRangeUtc } from "@/lib/dates";

/**
 * Build plan R13 asks specifically for "unit tests around midnight and
 * financial-year boundaries" — the two places a naive UTC date silently files
 * a record against the wrong day or the wrong financial year.
 */

describe("businessDate", () => {
  it("uses the IST calendar day, not the UTC one, just after local midnight", () => {
    // 19:00Z is 00:30 the NEXT day in IST. The naive
    // `toISOString().slice(0, 10)` this module replaces would say 2026-08-04.
    const instant = new Date("2026-08-04T19:00:00Z");

    expect(instant.toISOString().slice(0, 10)).toBe("2026-08-04");
    expect(businessDate(instant)).toBe("2026-08-05");
  });

  it("holds the same day through the last minute of the IST evening", () => {
    // 18:29Z = 23:59 IST — still the 4th locally.
    expect(businessDate(new Date("2026-08-04T18:29:00Z"))).toBe("2026-08-04");
  });

  it("rolls over exactly at IST midnight", () => {
    // 18:30Z = 00:00 IST on the 5th.
    expect(businessDate(new Date("2026-08-04T18:30:00Z"))).toBe("2026-08-05");
  });
});

describe("financialYear", () => {
  it("is the previous FY on the last day of March", () => {
    // 31 March 2026, 23:00 IST.
    expect(financialYear(new Date("2026-03-31T17:30:00Z"))).toBe("2526");
  });

  it("rolls to the new FY at IST midnight on 1 April, while UTC is still March", () => {
    // 19:00Z on 31 March = 00:30 IST on 1 April. UTC-based logic would keep
    // issuing last year's receipt numbers for another five and a half hours.
    const instant = new Date("2026-03-31T19:00:00Z");

    expect(instant.getUTCMonth()).toBe(2); // still March in UTC
    expect(financialYear(instant)).toBe("2627");
  });

  it("does not roll at the calendar new year", () => {
    expect(financialYear(new Date("2026-12-31T12:00:00Z"))).toBe("2627");
    expect(financialYear(new Date("2027-01-01T12:00:00Z"))).toBe("2627");
  });

  it("spans to the end of the following March", () => {
    expect(financialYear(new Date("2027-03-31T06:00:00Z"))).toBe("2627");
    expect(financialYear(new Date("2027-04-01T06:00:00Z"))).toBe("2728");
  });

  it("pads single-digit years", () => {
    // FY 2009-10.
    expect(financialYear(new Date("2009-06-01T06:00:00Z"))).toBe("0910");
  });
});

describe("monthRangeUtc", () => {
  it("brackets the local month as UTC instants", () => {
    const { startUtc, endUtc } = monthRangeUtc(
      new Date("2026-08-15T06:00:00Z"),
    );

    // 1 Aug 00:00 IST and 1 Sep 00:00 IST, both expressed in UTC.
    expect(startUtc).toBe("2026-07-31T18:30:00.000Z");
    expect(endUtc).toBe("2026-08-31T18:30:00.000Z");
  });

  it("puts an instant that is next month locally into the next month's range", () => {
    // 31 Aug 19:00Z = 1 Sep 00:30 IST.
    const { startUtc } = monthRangeUtc(new Date("2026-08-31T19:00:00Z"));

    expect(startUtc).toBe("2026-08-31T18:30:00.000Z"); // September's range
  });

  it("is a half-open range so the final instant of the month is included", () => {
    const { startUtc, endUtc } = monthRangeUtc(
      new Date("2026-08-15T06:00:00Z"),
    );
    // The last payment of the month: 31 Aug 23:59:59.999 IST.
    const lastInstant = new Date("2026-08-31T18:29:59.999Z");

    expect(lastInstant >= new Date(startUtc)).toBe(true);
    expect(lastInstant < new Date(endUtc)).toBe(true);
  });
});
