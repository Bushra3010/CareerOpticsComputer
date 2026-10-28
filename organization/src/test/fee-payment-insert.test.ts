import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * "null value in column receivedById of relation fee_payments violates
 * not-null constraint" — every fee collection failed on this, at the counter
 * and from the student's own portal. The column is NOT NULL with no default,
 * and nothing was filling it.
 */
const inserts: Record<string, Record<string, unknown>[]> = {};
const updates: Record<string, Record<string, unknown>[]> = {};
let session: { user: { id: string } } | null = { user: { id: "auth-staff-1" } };
/** The invoice `addPayment` reads before delegating. */
let invoiceRow: Record<string, unknown> | null = null;

function builder(table: string) {
  const done = (data: unknown) => Promise.resolve({ data, error: null });
  const chain: Record<string, unknown> = {
    insert: (payload: Record<string, unknown>) => {
      (inserts[table] ||= []).push(payload);
      return chain;
    },
    update: (payload: Record<string, unknown>) => {
      (updates[table] ||= []).push(payload);
      return chain;
    },
    select: () => chain,
    eq: () => chain,
    single: () => done({ id: "row-1" }),
    maybeSingle: () => done(invoiceRow),
  };
  return chain;
}

vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    from: (table: string) => builder(table),
    auth: { getSession: () => Promise.resolve({ data: { session } }) },
  },
  supabaseUrl: "https://project.supabase.co",
}));

const { recordPayment } = await import("@/lib/supabase/studentFee");
const { addPayment } = await import("@/lib/supabase/data");

const INVOICE = {
  id: "inv-1",
  invoiceNo: "INV-1",
  totalAmount: 2500,
  paidAmount: 0,
  status: "DUE",
};

beforeEach(() => {
  for (const key of Object.keys(inserts)) delete inserts[key];
  for (const key of Object.keys(updates)) delete updates[key];
  session = { user: { id: "auth-staff-1" } };
  invoiceRow = { ...INVOICE, payments: [] };
});

describe("recordPayment", () => {
  it("books the receipt against whoever is signed in", async () => {
    await recordPayment(INVOICE, { amount: 2500, method: "CASH" });

    const payment = inserts.fee_payments[0];
    expect(payment.receivedById).toBe("auth-staff-1");
  });

  it("fills the other columns the table requires and no caller passes", async () => {
    await recordPayment(INVOICE, { amount: 2500 });

    const payment = inserts.fee_payments[0];
    // NOT NULL, no default, and lib/id.ts says callers supply it.
    expect(payment.id).toBeTruthy();
    expect(payment.receiptNo).toMatch(/^RCP-/);
    expect(payment.paidAt).toBeTruthy();
  });

  it("lets a caller name a different receiver", async () => {
    await recordPayment(INVOICE, { amount: 500, receivedById: "auth-cashier-9" });

    expect(inserts.fee_payments[0].receivedById).toBe("auth-cashier-9");
  });

  it("says the session expired rather than quoting a constraint at the branch", async () => {
    session = null;

    await expect(recordPayment(INVOICE, { amount: 2500 })).rejects.toThrow(/session has expired/i);
    // Nothing was written on the way to failing.
    expect(inserts.fee_payments).toBeUndefined();
  });

  it("rolls the invoice forward to PAID once it is settled", async () => {
    await recordPayment(INVOICE, { amount: 2500 });

    expect(updates.fee_invoices[0]).toMatchObject({ paidAmount: 2500, status: "PAID" });
  });

  it("marks a part payment PARTIAL, not PAID", async () => {
    await recordPayment(INVOICE, { amount: 1000 });

    expect(updates.fee_invoices[0]).toMatchObject({ paidAmount: 1000, status: "PARTIAL" });
  });
});

describe("addPayment, the student's own portal", () => {
  it("fills the same columns, which it never used to", async () => {
    await addPayment("inv-1", { amount: 2500, method: "UPI" });

    const payment = inserts.fee_payments[0];
    expect(payment.receivedById).toBe("auth-staff-1");
    expect(payment.receiptNo).toMatch(/^RCP-/);
    expect(payment.invoiceId).toBe("inv-1");
  });

  // The old version inserted and stopped, so a student could pay in full and
  // the invoice stayed DUE for its whole value.
  it("rolls the invoice forward too", async () => {
    await addPayment("inv-1", { amount: 2500 });

    expect(updates.fee_invoices[0]).toMatchObject({ paidAmount: 2500, status: "PAID" });
  });

  it("counts what was already paid rather than starting from zero", async () => {
    invoiceRow = { ...INVOICE, payments: [{ id: "p1", amount: 1000, reversedAt: null }] };

    await addPayment("inv-1", { amount: 1500 });

    expect(updates.fee_invoices[0]).toMatchObject({ paidAmount: 2500, status: "PAID" });
  });

  it("names a deleted invoice rather than failing on a null row", async () => {
    invoiceRow = null;

    await expect(addPayment("inv-gone", { amount: 100 })).rejects.toThrow(/no longer exists/i);
  });
});
