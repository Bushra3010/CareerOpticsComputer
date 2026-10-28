import { render, screen, fireEvent, within, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";

/**
 * The academic year was a free-text box beside an unconstrained date box, so an
 * admission could be filed into "2026-27" and dated 2019, and nothing would
 * notice until somebody ran a report a year later.
 *
 * The two are now the same fact: the date picks out the session it falls in,
 * the session bounds the date, and an admission dated outside the year it
 * claims is refused rather than saved.
 *
 * The pure helpers are the real ones -- only the reads and writes are stubbed
 * -- so these exercise the actual date rules rather than a restatement of them.
 */
const toast = vi.fn();
const created: Array<Record<string, unknown>> = [];

const SESSIONS = [
  {
    id: "s1",
    organizationId: "org1",
    name: "Session 2026-2027",
    startDate: "2026-04-01",
    endDate: "2027-03-31",
    status: "ACTIVE",
    isCurrent: true,
    description: "",
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "s2",
    organizationId: "org1",
    name: "Session 2025-2026",
    startDate: "2025-04-01",
    endDate: "2026-03-31",
    status: "CLOSED",
    isCurrent: false,
    description: "",
    createdAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "s3",
    organizationId: "org1",
    name: "Session 2027-2028",
    startDate: "2027-04-01",
    endDate: "2028-03-31",
    status: "UPCOMING",
    isCurrent: false,
    description: "",
    createdAt: "2026-01-01T00:00:00Z",
  },
];

vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast }) }));
vi.mock("@/components/layout/AppLayout", () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "u1", role: "FRANCHISE", organizationId: "org1", branchId: "b1" } }),
}));
// Stubbed so importing the real data module below cannot reach for a project.
vi.mock("@/lib/supabase/client", () => ({
  supabase: { from: () => ({}), auth: {}, functions: {} },
  supabaseUrl: "https://project.supabase.co",
}));
vi.mock("@/lib/supabase/data", async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    getCourses: () => Promise.resolve({ success: true, data: [] }),
  getBranchCourseIds: () => Promise.resolve(new Set<string>()),
    getBatches: () => Promise.resolve({ success: true, data: [] }),
    getBranches: () => Promise.resolve({ success: true, data: [] }),
    getStudent: () => Promise.resolve({ success: true, data: {} }),
    updateStudent: () => Promise.resolve({ success: true, data: {} }),
    createStudent: (_branchId: string, body: Record<string, unknown>) => {
      created.push(body);
      return Promise.resolve({ success: true, data: { applicationNo: "APP-1" } });
    },
    getDropdownOptions: () => Promise.resolve({ success: true, data: {}, stored: true }),
    saveDropdownOptions: () => Promise.resolve({ success: true, stored: true }),
    getSessionYears: () => Promise.resolve({ success: true, data: SESSIONS, stored: true }),
  };
});

const AdmissionsWorkspace = (await import("@/pages/student/AdmissionsWorkspace")).default;

/** Everything `REQUIRED` asks for, so submit reaches the date check. */
const COMPLETE = {
  firstName: "Asha",
  lastName: "Kumari",
  dateOfBirth: "2008-05-02",
  gender: "FEMALE",
  phone: "9876543210",
  streetAddress: "12 Boring Road",
  city: "Patna",
  state: "Bihar",
  district: "Patna",
  pincode: "800001",
  fatherName: "Ram Kumar",
  motherName: "Sita Devi",
};

const draft = (over: Record<string, unknown>) =>
  localStorage.setItem("admission-draft", JSON.stringify(over));

const renderForm = async () => {
  render(
    <MemoryRouter>
      <AdmissionsWorkspace />
    </MemoryRouter>,
  );
  // The enrolment step holds both boxes, and the sessions arrive from an effect
  // -- the field renders as free text until they do, so every assertion below
  // has to wait for the dropdown to replace that input.
  fireEvent.click(screen.getByRole("button", { name: /2\. Academic/ }));
  await waitFor(() => expect(sessionTrigger()).toBeInTheDocument());
};

/** The control under a given field label; the labels carry no `htmlFor`. */
const fieldUnder = (label: string) => {
  const labelEl = Array.from(document.querySelectorAll("label")).find(
    (el) => el.textContent?.replace("*", "").trim() === label,
  )!;
  return labelEl.parentElement!;
};

const sessionTrigger = () => within(fieldUnder("Academic session")).getByRole("combobox");
/**
 * The date is a calendar now, not a native box: open it, steer the month and
 * year dropdowns, then click the day.
 */
const pickDate = async (fieldLabel: string, iso: string) => {
  fireEvent.click(within(fieldUnder(fieldLabel)).getByRole("button"));
  const [year, month, day] = iso.split("-").map(Number);
  const selects = document.querySelectorAll("select");
  fireEvent.change(selects[1], { target: { value: String(year) } });
  fireEvent.change(selects[0], { target: { value: String(month - 1) } });
  const cell = Array.from(document.querySelectorAll('button[name="day"]')).find(
    (button) => button.textContent === String(day) && !button.hasAttribute("disabled"),
  )!;
  fireEvent.click(cell);
};

/** What the trigger reads, which is the value the form holds. */
const dateText = (fieldLabel: string) =>
  within(fieldUnder(fieldLabel)).getByRole("button").textContent ?? "";

beforeEach(() => {
  toast.mockClear();
  created.length = 0;
  localStorage.clear();
});

describe("Admission session", () => {
  it("offers only the session the admission date falls inside", async () => {
    draft({ admissionDate: "2026-07-15", academicYear: "Session 2026-2027" });
    await renderForm();

    fireEvent.keyDown(sessionTrigger(), { key: "Enter" });
    await waitFor(() => expect(screen.getByRole("listbox")).toBeInTheDocument());
    const options = within(screen.getByRole("listbox"))
      .getAllByRole("option")
      .map((option) => option.textContent);

    expect(options).toHaveLength(1);
    expect(options[0]).toContain("Session 2026-2027");
  });

  it("follows the admission date into the session that contains it", async () => {
    draft({ admissionDate: "2026-07-15", academicYear: "Session 2026-2027" });
    await renderForm();

    // A date in the previous session: the academic year is that session now,
    // without the user having to change the second box to match the first.
    await pickDate("Admission date", "2025-07-15");
    await waitFor(() => expect(sessionTrigger()).toHaveTextContent("Session 2025-2026"));
  });

  it("reads the date back the way a person writes one", async () => {
    draft({ admissionDate: "2026-07-15", academicYear: "Session 2026-2027" });
    await renderForm();

    // The native box showed the browser's own format, which differed from
    // machine to machine; the calendar's trigger shows the day as written here.
    expect(dateText("Admission date")).toContain("15 Jul 2026");
  });

  it("says so when the date falls before the academic year began", async () => {
    draft({ admissionDate: "2026-07-15", academicYear: "Session 2026-2027" });
    await renderForm();

    // Before every session on file, so no session claims it and the one already
    // chosen stays -- which is exactly the contradiction being reported.
    await pickDate("Admission date", "2020-01-01");
    await waitFor(() =>
      expect(screen.getByText(/cannot be dated before its academic year/i)).toBeInTheDocument(),
    );
    expect(within(fieldUnder("Admission date")).getByRole("button")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("refuses to file an admission dated outside the session it claims", async () => {
    draft({ ...COMPLETE, admissionDate: "2026-07-15", academicYear: "Session 2026-2027" });
    await renderForm();

    await pickDate("Admission date", "2020-01-01");
    await waitFor(() => expect(dateText("Admission date")).toContain("01 Jan 2020"));

    fireEvent.click(screen.getByRole("button", { name: /6\. Review/ }));
    fireEvent.click(screen.getByRole("button", { name: /complete admission/i }));

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Check the admission date" }),
      ),
    );
    // The point of the check: nothing was written.
    expect(created).toHaveLength(0);
  });

  it("moves an out-of-range date with the session it was given", async () => {
    draft({ admissionDate: "2026-07-15", academicYear: "Session 2026-2027" });
    await renderForm();

    // A date only ever belongs to one session here, so clear it to reach the
    // case where the session is picked first and every open one is offered.
    fireEvent.click(within(fieldUnder("Admission date")).getByRole("button"));
    fireEvent.click(screen.getByRole("button", { name: /^clear$/i }));
    fireEvent.keyDown(sessionTrigger(), { key: "Enter" });
    await waitFor(() => expect(screen.getByRole("listbox")).toBeInTheDocument());
    fireEvent.click(within(screen.getByRole("listbox")).getByText(/Session 2027-2028/));

    // Today is outside next year's session, so the date lands on its first day
    // rather than on a value the form would then refuse to save.
    await waitFor(() => expect(dateText("Admission date")).toContain("01 Apr 2027"));
    expect(screen.queryByText(/cannot be dated before/i)).not.toBeInTheDocument();
  });

  it("files a completed admission on a date its session accepts", async () => {
    draft({ ...COMPLETE, admissionDate: "2026-07-15", academicYear: "Session 2026-2027" });
    await renderForm();

    fireEvent.click(screen.getByRole("button", { name: /6\. Review/ }));
    fireEvent.click(screen.getByRole("button", { name: /complete admission/i }));

    await waitFor(() => expect(created).toHaveLength(1));
    // The session's name is what `students.academicYear` holds, which is what
    // every other screen already reads out of that column.
    expect(created[0].academicYear).toBe("Session 2026-2027");
    expect(String(created[0].admissionDate)).toContain("2026-07-15");
  });
});
