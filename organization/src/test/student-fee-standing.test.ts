import { describe, it, expect, vi, beforeEach } from "vitest";

import { compactRupees, feeStanding, rupees } from "@/lib/fees";

/**
 * The bug this file covers: a fee collected against a student was invisible.
 *
 * The roster showed one number — the sum of `fee_invoices.totalAmount` — and
 * never what had come in against it. The student's own login was worse: every
 * page read an `amount` field the table does not have (the column is
 * `totalAmount`) and netted it against a `payments` array that was never
 * selected, so a student who had paid in full saw ₹0 billed and ₹0 paid.
 */

describe("feeStanding", () => {
  it("charges the course fee while no invoice has been raised", () => {
    // A student admitted this morning has been quoted the course fee and
    // nothing else; a blank against their name is not the answer.
    expect(feeStanding({ courseFee: 24000, invoiced: null, paid: 0 })).toEqual({
      total: 24000,
      paid: 0,
      balance: 24000,
    });
  });

  it("still charges the whole course when only part of it has been invoiced", () => {
    // The bug this rule exists for: the first instalment of a ₹24,000 course
    // was read as the whole charge, so paying it showed the student "Cleared"
    // with ₹6,000 of the course still uncollected.
    expect(feeStanding({ courseFee: 24000, invoiced: 18000, paid: 5000 })).toEqual({
      total: 24000,
      paid: 5000,
      balance: 19000,
    });
  });

  it("charges more than the course when more than it has been billed", () => {
    // A late fee or an extra charge on top is money genuinely owed.
    expect(feeStanding({ courseFee: 24000, invoiced: 25500, paid: 0 })).toEqual({
      total: 25500,
      paid: 0,
      balance: 25500,
    });
  });

  it("falls back to the invoices for a course carrying no price of its own", () => {
    expect(feeStanding({ courseFee: 0, invoiced: 4000, paid: 1000 }).total).toBe(4000);
  });

  it("never reports a negative balance, because an overpayment is not a debt", () => {
    expect(feeStanding({ courseFee: 10000, invoiced: 10000, paid: 12000 }).balance).toBe(0);
  });

  // `Number(undefined)` is NaN and NaN survives `??`, which is how the roster
  // printed a literal "₹NaN" for any course with no base fee on it.
  it("reads a missing or unparseable figure as zero rather than NaN", () => {
    const standing = feeStanding({ courseFee: undefined, invoiced: null, paid: "" });
    expect(standing).toEqual({ total: 0, paid: 0, balance: 0 });
    expect(rupees(undefined)).toBe("₹0");
    expect(rupees(2500)).toBe("₹2,500");
  });
});

describe("compactRupees", () => {
  // The fee tiles divided by a lakh unconditionally, so a branch that had
  // collected ₹2,500 was shown "₹0.0L" and read its takings as nothing.
  it("prints a small figure in full rather than rounding it away", () => {
    expect(compactRupees(2500)).toBe("₹2,500");
    expect(compactRupees(0)).toBe("₹0");
    expect(compactRupees(99_999)).toBe("₹99,999");
  });

  it("reaches for a lakh only once the number is one", () => {
    expect(compactRupees(1_00_000)).toBe("₹1L");
    expect(compactRupees(2_50_000)).toBe("₹2.5L");
  });

  it("reaches for a crore above a hundred lakh", () => {
    expect(compactRupees(1_00_00_000)).toBe("₹1Cr");
    expect(compactRupees(12_30_00_000)).toBe("₹12.3Cr");
  });

  it("keeps a refund readable as a negative", () => {
    expect(compactRupees(-2500)).toBe("-₹2,500");
  });
});

/* ---------- getStudentInvoices ---------- */

const rows: Record<string, Record<string, unknown>[]> = {};
const selects: string[] = [];
/** Set to fail the embedded select, the way a database with the relationship
 *  unexposed answers it. */
let embedFails = false;

function builder(table: string) {
  let embedded = false;
  const result = () => {
    const failed = embedded && embedFails;
    return Promise.resolve({
      data: failed ? null : (rows[table] ?? []),
      error: failed ? { message: "could not find a relationship" } : null,
    });
  };
  const chain: Record<string, unknown> = {
    select: (columns: string) => {
      selects.push(columns);
      embedded = columns.includes("fee_payments");
      return chain;
    },
    eq: () => chain,
    in: () => chain,
    neq: () => chain,
    is: () => chain,
    order: () => result(),
    then: (...args: unknown[]) => (result() as Promise<unknown>).then(...(args as [])),
  };
  return chain;
}

vi.mock("@/lib/supabase/client", () => ({
  supabase: { from: (table: string) => builder(table) },
  supabaseUrl: "https://project.supabase.co",
}));

const { getStudentInvoices } = await import("@/lib/supabase/data");

beforeEach(() => {
  selects.length = 0;
  embedFails = false;
  rows.fee_invoices = [
    {
      id: "inv-1",
      invoiceNo: "INV-1",
      studentId: "s1",
      description: "Term 1",
      totalAmount: 24000,
      paidAmount: 0,
      payments: [
        { id: "p1", amount: 10000, reversedAt: null },
        // A reversed receipt is not money in.
        { id: "p2", amount: 4000, reversedAt: "2026-02-01T00:00:00.000Z" },
      ],
    },
  ];
});

describe("getStudentInvoices", () => {
  it("hands the pages the amount and paid they actually read", async () => {
    const { data } = await getStudentInvoices("s1", "b1");

    expect(data[0].amount).toBe(24000);
    expect(data[0].paid).toBe(10000);
    expect(data[0].balance).toBe(14000);
  });

  it("fetches the receipts, without which every figure was zero", async () => {
    await getStudentInvoices("s1", "b1");
    expect(selects[0]).toContain("fee_payments");
  });

  it("falls back to paidAmount when the receipts cannot be embedded", async () => {
    embedFails = true;
    rows.fee_invoices = [
      { id: "inv-1", studentId: "s1", totalAmount: 24000, paidAmount: 9000 },
    ];

    const { data } = await getStudentInvoices("s1", "b1");
    expect(data[0].paid).toBe(9000);
    expect(data[0].balance).toBe(15000);
  });
});
