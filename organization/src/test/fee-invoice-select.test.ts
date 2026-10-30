import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * The Fee Collection table printed the invoice number in its Course column,
 * because the invoice's student embed carried `courseId` and no name to show.
 *
 * Fixing that means embedding two levels deep — invoice → student → course —
 * which not every deployment exposes. So `listInvoices` steps down a ladder of
 * selects, and what this file guards is that a rejected nested embed costs
 * only the course: dropping straight to a flat select would also lose the
 * payments, and the payments are what decide whether an invoice reads as paid.
 */
const selects: string[] = [];
/** Selects the fake PostgREST refuses, matched as substrings. */
let rejected: string[] = [];

const INVOICE = {
  id: "inv-1",
  invoiceNo: "INV-MTWIRAMG-525",
  studentId: "s1",
  totalAmount: 2500,
  status: "DUE",
};

function builder() {
  let select = "";
  const result = () => {
    const refused = rejected.some((fragment) => select.includes(fragment));
    return Promise.resolve({
      data: refused ? null : [INVOICE],
      error: refused ? { message: `could not embed ${select}` } : null,
    });
  };
  const chain: Record<string, unknown> = {
    select: (columns: string) => {
      select = columns;
      selects.push(columns);
      return chain;
    },
    eq: () => chain,
    in: () => chain,
    neq: () => chain,
    is: () => chain,
    order: () => result(),
  };
  return chain;
}

vi.mock("@/lib/supabase/client", () => ({
  supabase: { from: () => builder() },
  supabaseUrl: "https://project.supabase.co",
}));

const { listInvoices } = await import("@/lib/supabase/studentFee");

beforeEach(() => {
  selects.length = 0;
  rejected = [];
});

describe("listInvoices select ladder", () => {
  it("asks for the course through the student, which the Course column needs", async () => {
    await listInvoices("b1");

    expect(selects[0]).toContain("course:courses(name,code)");
    expect(selects[0]).toContain("fee_payments");
    // One request when the database accepts the richest select.
    expect(selects).toHaveLength(1);
  });

  it("gives up the course before it gives up the payments", async () => {
    rejected = ["course:courses"];

    const { data } = await listInvoices("b1");

    expect(selects).toHaveLength(2);
    expect(selects[1]).toContain("fee_payments");
    expect(selects[1]).not.toContain("course:courses");
    expect(data[0].invoiceNo).toBe("INV-MTWIRAMG-525");
  });

  it("falls all the way to a flat select rather than failing the page", async () => {
    rejected = ["student:students"];

    const { data } = await listInvoices("b1");

    expect(selects.at(-1)).toBe("*");
    expect(data).toHaveLength(1);
  });

  it("reports the database's own error when nothing is accepted", async () => {
    rejected = ["*"];

    await expect(listInvoices("b1")).rejects.toThrow(/could not embed/);
  });
});
