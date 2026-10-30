import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";

/**
 * The centre panel's student list and registration form. The list's fee
 * columns come from each student's own invoices, and the type tabs narrow
 * the query; the registration form must not reach the database with a
 * mobile number that is not ten digits.
 */

const { tables, toast, createStudent } = vi.hoisted(() => ({
  tables: {} as Record<string, Array<Record<string, unknown>>>,
  toast: vi.fn(),
  createStudent: vi.fn(),
}));

vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast }) }));
vi.mock("@/components/layout/AppLayout", () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "u1", role: "BRANCH_ADMIN", organizationId: "org1", branchId: "b1" },
    branchId: "b1",
    organizationId: "org1",
    view: "franchise",
  }),
}));
vi.mock("@/lib/supabase/data", () => ({
  getBranches: () => Promise.resolve({ success: true, data: [{ id: "b1", name: "Patna" }] }),
  getCourses: () => Promise.resolve({ success: true, data: [{ id: "c1", name: "ADCA", baseFee: 6000, durationValue: 12, durationUnit: "MONTHS" }] }),
  getBatches: () => Promise.resolve({ success: true, data: [] }),
  createStudent,
}));

/**
 * A stand-in for the supabase query builder that honours the filters the
 * pages use, so a tab that sends the wrong filter shows the wrong students.
 */
vi.mock("@/lib/supabase/client", () => {
  const from = (table: string) => {
    let rows = [...(tables[table] || [])];
    const builder: Record<string, unknown> = {};
    const chain = (fn?: () => void) => () => {
      fn?.();
      return builder;
    };
    Object.assign(builder, {
      select: chain(),
      order: chain(),
      range: chain(),
      limit: chain(),
      or: chain(),
      eq: (col: string, val: unknown) => chain(() => (rows = rows.filter((r) => r[col] === val)))(),
      neq: (col: string, val: unknown) => chain(() => (rows = rows.filter((r) => r[col] !== val)))(),
      in: (col: string, vals: unknown[]) => chain(() => (rows = rows.filter((r) => vals.includes(r[col]))))(),
      is: (col: string, val: unknown) => chain(() => (rows = rows.filter((r) => (r[col] ?? null) === val)))(),
      not: (col: string, _op: string, list: string) =>
        chain(() => {
          const vals = list.replace(/[()]/g, "").split(",");
          rows = rows.filter((r) => !vals.includes(String(r[col])));
        })(),
      maybeSingle: () => Promise.resolve({ data: rows[0] ?? null, error: null }),
      then: (resolve: (v: unknown) => unknown) => resolve({ data: rows, error: null, count: rows.length }),
    });
    return builder;
  };
  return { supabase: { from } };
});

const { default: CentreStudents } = await import("@/pages/centre/CentreStudents");
const { default: CentreAddStudent } = await import("@/pages/centre/CentreAddStudent");

const student = (id: string, firstName: string, extra: Record<string, unknown> = {}) => ({
  id,
  branchId: "b1",
  firstName,
  lastName: "Kumar",
  fatherName: `${firstName} Sr`,
  phone: "9876543210",
  enrollmentNo: `ENR-${id}`,
  admissionDate: "2026-09-01T00:00:00.000Z",
  admissionStatus: "APPROVED",
  isActive: true,
  deletedAt: null,
  course: { id: "c1", name: "ADCA" },
  ...extra,
});

beforeEach(() => {
  toast.mockReset();
  createStudent.mockReset();
  tables.students = [
    student("s1", "Raj"),
    student("s2", "Sita", { admissionStatus: "SUBMITTED", applicationSource: "ONLINE", enrollmentNo: null, applicationNo: "APP-2026-0002" }),
    student("s3", "Mohan", { isActive: false }),
  ];
  tables.fee_invoices = [
    { studentId: "s1", totalAmount: 6000, paidAmount: 0, status: "PARTIAL", payments: [{ amount: 2500, reversedAt: null }, { amount: 500, reversedAt: "2026-09-05" }] },
    { studentId: "s1", totalAmount: 1000, paidAmount: 0, status: "VOID", payments: [] },
  ];
});

const renderList = (type: string) =>
  render(
    <MemoryRouter initialEntries={[`/centre/students?type=${type}`]}>
      <CentreStudents />
    </MemoryRouter>,
  );

describe("Centre students list", () => {
  it("shows dues, paid and total fees from the student's own invoices", async () => {
    renderList("all");
    const row = (await screen.findByText("Raj Kumar")).closest("tr")!;
    // ₹6,000 billed (the void invoice is not a charge), ₹2,500 in (the reversed ₹500 is not money in).
    expect(within(row).getByText("₹6,000")).toBeInTheDocument();
    expect(within(row).getByText("₹2,500")).toBeInTheDocument();
    expect(within(row).getByText("₹3,500")).toBeInTheDocument();
    expect(within(row).getByText("Raj Sr")).toBeInTheDocument();
    expect(within(row).getByText("ENR-s1")).toBeInTheDocument();
    expect(within(row).getByRole("link", { name: "Payments" })).toHaveAttribute("href", "/centre/student-payments?id=s1");
    expect(screen.getByText("MANAGE Students - ALL")).toBeInTheDocument();
    expect(screen.getByText("Sita Kumar")).toBeInTheDocument();
    expect(screen.getByText("Mohan Kumar")).toBeInTheDocument();
  });

  it("lists only online requests on the online tab", async () => {
    renderList("online");
    expect(await screen.findByText("Sita Kumar")).toBeInTheDocument();
    expect(screen.getByText("APP-2026-0002")).toBeInTheDocument();
    expect(screen.queryByText("Raj Kumar")).not.toBeInTheDocument();
    expect(screen.queryByText("Mohan Kumar")).not.toBeInTheDocument();
    expect(screen.getByText("MANAGE Students - ONLINE")).toBeInTheDocument();
  });

  it("lists only deactivated students on the deactivated tab", async () => {
    renderList("deactivated");
    expect(await screen.findByText("Mohan Kumar")).toBeInTheDocument();
    expect(screen.queryByText("Raj Kumar")).not.toBeInTheDocument();
    expect(screen.queryByText("Sita Kumar")).not.toBeInTheDocument();
  });

  it("lists approved students on the approved tab", async () => {
    renderList("approved");
    expect(await screen.findByText("Raj Kumar")).toBeInTheDocument();
    expect(screen.queryByText("Sita Kumar")).not.toBeInTheDocument();
  });
});

describe("Centre add student", () => {
  it("does not submit with a mobile number that is not ten digits", async () => {
    render(
      <MemoryRouter>
        <CentreAddStudent />
      </MemoryRouter>,
    );
    fireEvent.change(screen.getByLabelText("Applicant Name"), { target: { value: "Raj Kumar" } });
    fireEvent.change(screen.getByLabelText("Mobile"), { target: { value: "98765" } });
    fireEvent.click(screen.getByRole("button", { name: "Submit Form" }));

    expect(await screen.findAllByText("Enter a valid 10-digit mobile number")).not.toHaveLength(0);
    await waitFor(() => expect(toast).toHaveBeenCalledWith(expect.objectContaining({ variant: "destructive" })));
    expect(createStudent).not.toHaveBeenCalled();
  });

  it("offers the branch's courses with their duration and fills the fee", async () => {
    render(
      <MemoryRouter>
        <CentreAddStudent />
      </MemoryRouter>,
    );
    const course = await screen.findByRole("option", { name: "ADCA (12 months)" });
    fireEvent.change(screen.getByLabelText("Select Course"), { target: { value: (course as HTMLOptionElement).value } });
    expect(screen.getByLabelText("Fees")).toHaveValue(6000);
  });
});
