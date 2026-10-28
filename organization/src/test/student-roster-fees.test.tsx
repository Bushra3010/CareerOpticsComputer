import { render, screen, within, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { StudentRoster } from "@/components/student/StudentRoster";
import type { StudentRosterRow } from "@/lib/supabase/data";

/**
 * The roster showed one money column — what the student had been invoiced —
 * and nothing about what had come in against it, so a fee collected from a
 * student left no mark on the page the branch actually works from.
 */
const student = (overrides: Partial<StudentRosterRow> = {}): StudentRosterRow => ({
  id: "s1",
  name: "Raj Shekhar",
  initials: "RS",
  address: "Patna, Bihar",
  mapQuery: "Patna, Bihar",
  admissionNo: "APP-2026-0003",
  admissionDate: "2026-09-11T00:00:00.000Z",
  course: "ADCA AI",
  courseCode: "ADCA-AI",
  branch: "Kothrud",
  courseFee: 2500,
  fatherName: "Ram Shekhar",
  fatherPhone: "+91 62057 86818",
  phone: "+91 62057 86818",
  whatsapp: "+91 62057 86818",
  email: "raj@example.com",
  fee: 2500,
  invoiced: 2500,
  paid: 1000,
  balance: 1500,
  status: "Active",
  batch: "Not assigned",
  hasLogin: true,
  ...overrides,
});

const noop = () => undefined;

const roster = (rows: StudentRosterRow[]) =>
  render(
    <StudentRoster
      rows={rows}
      onView={noop}
      onEdit={noop}
      onDelete={noop}
      onExport={noop}
      onSetLogin={noop}
    />,
  );

describe("StudentRoster money columns", () => {
  it("shows what the course costs, what was paid and what is left", () => {
    roster([student()]);

    const row = screen.getByText("Raj Shekhar").closest("tr")!;
    expect(within(row).getByText("₹2,500")).toBeInTheDocument();
    expect(within(row).getByText("₹1,000")).toBeInTheDocument();
    expect(within(row).getByText("₹1,500")).toBeInTheDocument();

    for (const heading of ["Course fee", "Paid", "Balance"]) {
      expect(screen.getByText(heading)).toBeInTheDocument();
    }
  });

  it("says a student is cleared rather than printing a zero balance", () => {
    roster([student({ paid: 2500, balance: 0 })]);

    const row = screen.getByText("Raj Shekhar").closest("tr")!;
    expect(within(row).getByText("Cleared")).toBeInTheDocument();
  });

  it("shows the course price, with what has been billed so far under it", () => {
    // The first instalment of a ₹2,500 course. The fee column is the course's
    // own price -- billing ₹1,800 of it does not make the course cost ₹1,800 --
    // and what has actually been invoiced is named underneath.
    roster([student({ fee: 2500, courseFee: 2500, invoiced: 1800, paid: 300, balance: 2200 })]);

    const row = screen.getByText("Raj Shekhar").closest("tr")!;
    expect(within(row).getByText("₹2,500")).toBeInTheDocument();
    expect(within(row).getByText(/₹1,800 invoiced/)).toBeInTheDocument();
    expect(within(row).getByText("₹2,200")).toBeInTheDocument();
  });

  it("leaves the second line off when every rupee of the course is invoiced", () => {
    roster([student({ fee: 2500, courseFee: 2500, invoiced: 2500 })]);

    const row = screen.getByText("Raj Shekhar").closest("tr")!;
    expect(within(row).queryByText(/invoiced/)).toBeNull();
  });

  it("says nothing rather than \"₹0 invoiced\" for a student with no invoice yet", () => {
    roster([student({ fee: 2500, courseFee: 2500, invoiced: 0, paid: 0, balance: 2500 })]);

    const row = screen.getByText("Raj Shekhar").closest("tr")!;
    expect(within(row).queryByText(/invoiced/)).toBeNull();
    // What is owed is still the whole course: the fee column and the balance.
    expect(within(row).getAllByText("₹2,500")).toHaveLength(2);
  });

  it("prints the course as a name with its code under it, not as a bare tag", () => {
    roster([student()]);

    const row = screen.getByText("Raj Shekhar").closest("tr")!;
    expect(within(row).getByText("ADCA AI")).toBeInTheDocument();
    expect(within(row).getByText("ADCA-AI")).toBeInTheDocument();
  });

  it("gives the branch a column of its own", () => {
    roster([student()]);

    // An organisation admin sees every branch's students in one list, where
    // nothing on the row said which branch a student belonged to.
    expect(screen.getByRole("columnheader", { name: "Branch" })).toBeInTheDocument();
    const row = screen.getByText("Raj Shekhar").closest("tr")!;
    expect(within(row).getByText("Kothrud")).toBeInTheDocument();
  });

  it("falls back to a dash for a student with no branch on the record", () => {
    roster([student({ branch: "" })]);

    const row = screen.getByText("Raj Shekhar").closest("tr")!;
    expect(within(row).getByText("—")).toBeInTheDocument();
  });

  it("leaves the code line out for a course that has none", () => {
    roster([student({ courseCode: "" })]);

    const row = screen.getByText("Raj Shekhar").closest("tr")!;
    expect(within(row).getByText("ADCA AI")).toBeInTheDocument();
    expect(within(row).queryByText("ADCA-AI")).toBeNull();
  });
});

describe("StudentRoster branch filter", () => {
  it("lists the branches, searches them, and narrows the roster to the one picked", async () => {
    roster([
      student({ id: "s1", name: "Durga Prasad", branch: "iDEAL Coaching Classes" }),
      student({ id: "s2", name: "Krishna Singh", branch: "PNS COMPUTER ACADEMY" }),
    ]);

    fireEvent.keyDown(screen.getByLabelText("Filter by branch"), { key: "Enter" });
    // The list carries a search box; typing narrows the centres offered.
    fireEvent.change(await screen.findByLabelText("Search centre…"), { target: { value: "pns" } });
    expect(screen.queryByRole("option", { name: "iDEAL Coaching Classes" })).toBeNull();
    fireEvent.click(screen.getByRole("option", { name: "PNS COMPUTER ACADEMY" }));

    expect(screen.queryByText("Durga Prasad")).toBeNull();
    expect(screen.getByText("Krishna Singh")).toBeInTheDocument();
    expect(screen.getByText(/Showing/).textContent).toMatch(/1\s*student\b/);

    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByText("Durga Prasad")).toBeInTheDocument();
  });

  it("does not offer a choice of one, as on a branch's own roster", () => {
    roster([student({ branch: "PNS COMPUTER ACADEMY" })]);
    expect(screen.queryByLabelText("Filter by branch")).toBeNull();
  });
});
