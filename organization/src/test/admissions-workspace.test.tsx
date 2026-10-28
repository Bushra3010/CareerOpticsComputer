import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * `/student/add` is both the admission form and the edit screen. These cover the
 * two things that changed: `?id=` loads the whole record onto all four steps
 * (editing used to be a five-box dialog that saved nowhere), and a student can
 * be enrolled on more than one course at a time.
 */
vi.mock("@/components/layout/AppLayout", () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { branchId: "b1", organizationId: "o1" }, view: "admin" }),
}));

const updates: Array<{ id: string; body: Record<string, unknown> }> = [];
const created: Array<Record<string, unknown>> = [];
const leadUpdates: Array<{ id: string; input: Record<string, unknown> }> = [];

const STUDENT = {
  id: "s1",
  branchId: "b1",
  firstName: "Asha",
  lastName: "Verma",
  dateOfBirth: "2004-06-01T00:00:00.000Z",
  admissionDate: "2025-04-10T00:00:00.000Z",
  gender: "FEMALE",
  phone: "9876543210",
  streetAddress: "12 Mill Road",
  city: "Patna",
  state: "Bihar",
  pincode: "800001",
  fatherName: "Ram Verma",
  motherName: "Sita Verma",
  twelfthStream: "Science",
  whatsappNumber: "9000000001",
  courseId: "c1",
  courseIds: ["c1", "c2"],
};

vi.mock("@/lib/supabase/data", () => ({
  getCourses: () =>
    Promise.resolve({
      success: true,
      data: [
        { id: "c1", name: "Tally" },
        { id: "c2", name: "Advanced Excel" },
        { id: "c3", name: "Spoken English" },
        { id: "c4", name: "Photoshop" },
      ],
    }),
  // c4 exists in the catalogue but branch b1 was never given it.
  getBranchCourseIds: () => Promise.resolve(new Set(["c1", "c2", "c3"])),
  getBatches: () =>
    Promise.resolve({ success: true, data: [{ id: "bt1", name: "Morning", courseId: "c1" }] }),
  getBatchesByOrg: () =>
    Promise.resolve({ success: true, data: [{ id: "bt1", name: "Morning", courseId: "c1" }] }),
  getBranches: () => Promise.resolve({ success: true, data: [{ id: "b1", name: "Main" }] }),
  getStudent: () => Promise.resolve({ success: true, data: STUDENT }),
  updateStudent: (id: string, _branchId: string, body: Record<string, unknown>) => {
    updates.push({ id, body });
    return Promise.resolve({ success: true, data: body });
  },
  createStudent: (_branchId: string, body: Record<string, unknown>) => {
    created.push(body);
    return Promise.resolve({ success: true, data: { id: "new-student", applicationNo: "APP-1" } });
  },
  updateAdmissionLead: (id: string, input: Record<string, unknown>) => {
    leadUpdates.push({ id, input });
    return Promise.resolve({ success: true, data: {} });
  },
  getDropdownOptions: () => Promise.resolve({ success: true, data: {}, stored: true }),
  saveDropdownOptions: () => Promise.resolve({ success: true, stored: true }),
  // No sessions on file, which is what these fixtures describe. The two helpers
  // return exactly this for an empty session list, so the stubs do not claim
  // behaviour the real ones would not have.
  getSessionYears: () => Promise.resolve({ success: true, data: [], stored: false }),
  sessionYearsForDate: () => [],
  admissionDateProblem: () => null,
}));

vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: () => {} }) }));

const { default: AdmissionsWorkspace } = await import("@/pages/student/AdmissionsWorkspace");

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/student/add" element={<AdmissionsWorkspace />} />
        <Route path="/student/view" element={<div>Students list</div>} />
      </Routes>
    </MemoryRouter>,
  );

const step = (name: string) =>
  fireEvent.click(screen.getByRole("button", { name: new RegExp(`\\d\\. ${name}`) }));

beforeEach(() => {
  localStorage.clear();
  updates.length = 0;
  created.length = 0;
  leadUpdates.length = 0;
});

describe("admissions workspace", () => {
  // Admission Leads -> "Convert to admission" opens the form filled from the
  // lead; saving it closes the lead against the new student.
  it("closes the admission lead it was opened from", async () => {
    localStorage.setItem(
      "admission-draft",
      JSON.stringify({
        firstName: "Rahul", lastName: "Kumar", phone: "9876543210", whatsappNumber: "9876543210", city: "Patepur",
        fatherName: "Ram Kumar", branchId: "b1", dateOfBirth: "2008-05-01", gender: "MALE",
        streetAddress: "Main Road", state: "Bihar", pincode: "844114", motherName: "Sita Devi",
      }),
    );
    renderAt("/student/add?lead=L1");
    expect(await screen.findByDisplayValue("Rahul")).toBeTruthy();
    expect(screen.getAllByDisplayValue("9876543210").length).toBeGreaterThan(0);
    step("Review");
    fireEvent.click(await screen.findByRole("button", { name: /complete admission/i }));
    await waitFor(() => expect(created).toHaveLength(1));
    expect(created[0].firstName).toBe("Rahul");
    await waitFor(() => expect(leadUpdates).toEqual([{ id: "L1", input: { status: "Admission", studentId: "new-student" } }]));
  });

  it("opens as a new admission when no id is given", async () => {
    renderAt("/student/add");
    expect(await screen.findByRole("heading", { name: "New admission" })).toBeTruthy();
    expect(screen.getByRole("button", { name: /save draft/i })).toBeTruthy();
  });

  it("loads the whole record into every step when editing", async () => {
    renderAt("/student/add?id=s1");

    expect(await screen.findByRole("heading", { name: "Edit student" })).toBeTruthy();
    expect(screen.getByDisplayValue("Asha")).toBeTruthy();
    expect(screen.getByDisplayValue("Verma")).toBeTruthy();
    // Timestamps have to be cut back to yyyy-mm-dd or the picker shows nothing;
    // the calendar's trigger is what reads the day back.
    expect(screen.getByText("01 Jun 2004")).toBeTruthy();

    // Step 2 and step 3 are part of the same record - the old edit dialog
    // exposed neither.
    step("Guardian");
    expect(await screen.findByDisplayValue("Ram Verma")).toBeTruthy();
    expect(screen.getByDisplayValue("Sita Verma")).toBeTruthy();
  });

  it("saves an edit through updateStudent, with the primary course first", async () => {
    renderAt("/student/add?id=s1");
    await screen.findByDisplayValue("Asha");

    step("Review");
    fireEvent.click(await screen.findByRole("button", { name: /save changes/i }));

    await waitFor(() => expect(updates).toHaveLength(1));
    expect(updates[0].id).toBe("s1");
    expect(updates[0].body.courseIds).toEqual(["c1", "c2"]);
    expect(updates[0].body.courseId).toBe("c1");
    expect(updates[0].body.firstName).toBe("Asha");
    // Read-only columns are never written back.
    expect(updates[0].body).not.toHaveProperty("id");
    expect(updates[0].body).not.toHaveProperty("enrollmentNo");
  });

  it("clears a field the user emptied instead of leaving the old value", async () => {
    renderAt("/student/add?id=s1");
    await screen.findByDisplayValue("Asha");

    fireEvent.change(screen.getByDisplayValue("9000000001"), { target: { value: "" } });
    step("Review");
    fireEvent.click(await screen.findByRole("button", { name: /save changes/i }));

    await waitFor(() => expect(updates).toHaveLength(1));
    expect(updates[0].body.whatsappNumber).toBeNull();
  });

  it("enrols a student on several courses at once", async () => {
    renderAt("/student/add?id=s1");
    await screen.findByDisplayValue("Asha");

    step("Academic");
    const picker = await screen.findByRole("combobox", { name: "Courses" });
    expect(picker.textContent).toContain("2 selected");

    fireEvent.click(picker);
    fireEvent.click(await screen.findByRole("button", { name: /select all/i }));
    expect(picker.textContent).toContain("3 selected");

    step("Review");
    fireEvent.click(await screen.findByRole("button", { name: /save changes/i }));
    await waitFor(() => expect(updates).toHaveLength(1));
    expect(updates[0].body.courseIds).toEqual(["c1", "c2", "c3"]);
  });

  it("offers only the courses the branch has been assigned", async () => {
    renderAt("/student/add?id=s1");
    await screen.findByDisplayValue("Asha");

    step("Academic");
    fireEvent.click(await screen.findByRole("combobox", { name: "Courses" }));
    await screen.findByText("Spoken English");
    expect(screen.queryByText("Photoshop")).toBeNull();
  });
});
