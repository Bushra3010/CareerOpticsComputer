import { describe, expect, it } from "vitest";
import {
  ZERO,
  add,
  allocate,
  formatPaise,
  fromRupees,
  MoneyError,
  multiply,
  paise,
  percentOf,
  split,
  subtract,
  toRupeeString,
} from "@/lib/money";

describe("fromRupees", () => {
  it("converts whole and fractional rupees exactly", () => {
    expect(fromRupees("4500")).toBe(450000);
    expect(fromRupees("4500.50")).toBe(450050);
    expect(fromRupees("0.01")).toBe(1);
    expect(fromRupees("0.1")).toBe(10);
    expect(fromRupees("-250.25")).toBe(-25025);
  });

  it("is exact where floating point is not", () => {
    // The bug this module exists to prevent: 0.07 * 100 === 7.000000000000001
    expect(fromRupees("0.07")).toBe(7);
    expect(fromRupees("1.15")).toBe(115);
    // 2.675 cannot be represented exactly in binary floating point, so it is
    // rejected outright rather than rounded to a value the user did not type.
    expect(() => fromRupees("2.675")).toThrow(MoneyError);
  });

  it("rejects more than two decimal places rather than rounding silently", () => {
    expect(() => fromRupees("100.999")).toThrow(MoneyError);
    expect(() => fromRupees("abc")).toThrow(MoneyError);
    expect(() => fromRupees("")).toThrow(MoneyError);
    expect(() => fromRupees("1,000")).toThrow(MoneyError);
  });
});

describe("paise", () => {
  it("rejects non-integers", () => {
    expect(() => paise(100.5)).toThrow(MoneyError);
    expect(() => paise(Number.NaN)).toThrow(MoneyError);
  });
});

describe("toRupeeString", () => {
  it("round-trips with fromRupees", () => {
    for (const v of ["0.00", "0.01", "1.00", "99999.99", "-45.05"]) {
      expect(toRupeeString(fromRupees(v))).toBe(v);
    }
  });

  it("always pads to two decimal places", () => {
    expect(toRupeeString(paise(5))).toBe("0.05");
    expect(toRupeeString(paise(50))).toBe("0.50");
    expect(toRupeeString(paise(100))).toBe("1.00");
  });
});

describe("formatPaise", () => {
  it("uses Indian digit grouping", () => {
    // 4,82,150 — not 482,150
    expect(
      formatPaise(fromRupees("482150"), { showDecimals: false }),
    ).toContain("4,82,150");
  });
});

describe("arithmetic", () => {
  it("adds and subtracts without drift", () => {
    const tenPaise = fromRupees("0.10");
    let total = ZERO;
    for (let i = 0; i < 10; i++) total = add(total, tenPaise);
    expect(total).toBe(100); // exactly ₹1.00
    expect(toRupeeString(total)).toBe("1.00");
    expect(subtract(total, fromRupees("0.30"))).toBe(70);
  });

  it("rounds multiplication to the nearest paisa", () => {
    expect(multiply(fromRupees("100"), 0.185)).toBe(1850);
    expect(multiply(paise(3), 0.5)).toBe(2); // 1.5 rounds to 2
  });

  it("computes percentages", () => {
    expect(percentOf(fromRupees("1000"), 18)).toBe(18000);
    // 99999 paise × 18% = 17,999.82 paise, rounded half-up to 18,000.
    expect(percentOf(fromRupees("999.99"), 18)).toBe(18000);
  });
});

describe("split", () => {
  it("never loses or invents a paisa", () => {
    for (const [amount, parts] of [
      [10000, 3],
      [10001, 3],
      [1, 4],
      [99999, 7],
      [450000, 12],
    ] as const) {
      const parts_ = split(paise(amount), parts);
      expect(parts_).toHaveLength(parts);
      expect(parts_.reduce<number>((a, b) => a + b, 0)).toBe(amount);
    }
  });

  it("distributes the remainder to the earliest instalments", () => {
    expect(split(paise(10000), 3)).toEqual([3334, 3333, 3333]);
    expect(split(paise(10), 4)).toEqual([3, 3, 2, 2]);
  });

  it("handles negative amounts symmetrically", () => {
    const parts = split(paise(-10000), 3);
    expect(parts.reduce<number>((a, b) => a + b, 0)).toBe(-10000);
  });

  it("rejects invalid part counts", () => {
    expect(() => split(paise(100), 0)).toThrow(MoneyError);
    expect(() => split(paise(100), 2.5)).toThrow(MoneyError);
  });
});

describe("allocate", () => {
  it("applies a payment to dues oldest first", () => {
    const { allocations, unallocated } = allocate(fromRupees("5000"), [
      fromRupees("2000"),
      fromRupees("2000"),
      fromRupees("2000"),
    ]);
    expect(allocations).toEqual([200000, 200000, 100000]);
    expect(unallocated).toBe(0);
  });

  it("returns the surplus when the payment exceeds all dues", () => {
    const { allocations, unallocated } = allocate(fromRupees("5000"), [
      fromRupees("1000"),
      fromRupees("1500"),
    ]);
    expect(allocations).toEqual([100000, 150000]);
    expect(unallocated).toBe(250000);
  });

  it("conserves the total in every case", () => {
    const payment = fromRupees("3333.33");
    const { allocations, unallocated } = allocate(payment, [
      fromRupees("1111.11"),
      fromRupees("2222.22"),
      fromRupees("500"),
    ]);
    expect(add(...allocations, unallocated)).toBe(payment);
  });

  it("refuses negative payments", () => {
    expect(() => allocate(paise(-100), [paise(100)])).toThrow(MoneyError);
  });
});
