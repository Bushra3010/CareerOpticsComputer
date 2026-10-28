import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";

/**
 * The admission form collected everything about a student except their
 * paperwork. This covers the Documents step: what it attaches, what it refuses,
 * and -- the decision worth pinning down -- that a missing document is reported
 * rather than used to turn an applicant away at the counter.
 */
const toast = vi.fn();
const createStudent = vi.fn(() => Promise.resolve({ success: true, data: { applicationNo: "APP-1" } }));
let picked: unknown = null;
const pickImage = vi.fn(() => Promise.resolve(picked));

vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast }) }));
vi.mock("@/components/layout/AppLayout", () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "u1", role: "FRANCHISE", organizationId: "org1", branchId: "b1" } }),
}));
vi.mock("@/lib/export", () => ({ pickImage: (...args: unknown[]) => pickImage(...(args as [])) }));
vi.mock("@/lib/supabase/data", () => ({
  getStudent: () => Promise.resolve({ success: true, data: {} }),
  updateStudent: () => Promise.resolve({ success: true, data: {} }),
  getDropdownOptions: () => Promise.resolve({ success: true, data: {}, stored: true }),
  saveDropdownOptions: () => Promise.resolve({ success: true, stored: true }),
  getCourses: () => Promise.resolve({ success: true, data: [] }),
  getBranchCourseIds: () => Promise.resolve(new Set<string>()),
  getBatches: () => Promise.resolve({ success: true, data: [] }),
  getBranches: () => Promise.resolve({ success: true, data: [] }),
  createStudent: (...args: unknown[]) => createStudent(...(args as [])),
  // No sessions on file, which is what these fixtures describe. The two helpers
  // return exactly this for an empty session list, so the stubs do not claim
  // behaviour the real ones would not have.
  getSessionYears: () => Promise.resolve({ success: true, data: [], stored: false }),
  sessionYearsForDate: () => [],
  admissionDateProblem: () => null,
}));

const AdmissionsWorkspace = (await import("@/pages/student/AdmissionsWorkspace")).default;

const FILE = { name: "tenth-marksheet.pdf", dataUrl: "data:application/pdf;base64,JVBER" };

/** Every NOT NULL column filled, so submit is about documents and nothing else. */
const seedCompleteDraft = () =>
  localStorage.setItem(
    "admission-draft",
    JSON.stringify({
      firstName: "Krishna",
      lastName: "Singh",
      dateOfBirth: "2007-03-12",
      gender: "Male",
      phone: "9822041100",
      streetAddress: "24 Shivaji Nagar",
      city: "Patna",
      state: "Bihar",
      pincode: "800001",
      fatherName: "Ram Singh",
      motherName: "Sita Singh",
    }),
  );

beforeEach(() => {
  toast.mockClear();
  createStudent.mockClear();
  pickImage.mockClear();
  picked = FILE;
  localStorage.clear();
});

const openDocuments = () => {
  render(
    <MemoryRouter>
      <AdmissionsWorkspace />
    </MemoryRouter>,
  );
  fireEvent.click(screen.getByRole("button", { name: /4\. Documents/ }));
};

/** The card for one document kind, found by its label. */
const card = (label: string) => screen.getByText(label).closest("div.rounded-xl") as HTMLElement;

describe("Admission documents", () => {
  it("sits between the guardian details and the review", () => {
    render(
    <MemoryRouter>
      <AdmissionsWorkspace />
    </MemoryRouter>,
  );
    const labels = screen
      .getAllByRole("button")
      .map((b) => b.textContent)
      .filter((t) => t && /^\d\. /.test(t));
    expect(labels).toEqual([
      "1. Personal",
      "2. Academic",
      "3. Guardian",
      "4. Documents",
      "5. Referral",
      "6. Review",
    ]);
  });

  it("lists the paperwork an admission collects, both sides of the Aadhar among it", () => {
    openDocuments();
    for (const label of [
      "10th Marksheet",
      "12th Marksheet",
      "Transfer Certificate",
      "Aadhar Card (Front)",
      "Aadhar Card (Back)",
      "Passport Photo",
      "Admission Form",
    ]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    expect(within(card("Passport Photo")).getByText("Required")).toBeInTheDocument();
    expect(within(card("Admission Form")).getByText("Required")).toBeInTheDocument();
  });

  it("shows the attached file by name, so the right scan is seen in the right slot", async () => {
    openDocuments();
    fireEvent.click(within(card("10th Marksheet")).getByRole("button", { name: /upload/i }));

    await waitFor(() =>
      expect(within(card("10th Marksheet")).getByText("tenth-marksheet.pdf")).toBeInTheDocument(),
    );
    // Once held, the action is to replace it rather than upload again.
    expect(within(card("10th Marksheet")).getByRole("button", { name: /replace/i })).toBeInTheDocument();
  });

  it("counts the required documents as they are attached", async () => {
    openDocuments();
    expect(screen.getByText(/0 of 7 required documents attached/i)).toBeInTheDocument();

    fireEvent.click(within(card("Aadhar Card (Front)")).getByRole("button", { name: /upload/i }));
    await waitFor(() => expect(screen.getByText(/1 of 7 required/i)).toBeInTheDocument());

    // Each side of the Aadhar is its own slot, so the back counts separately.
    fireEvent.click(within(card("Aadhar Card (Back)")).getByRole("button", { name: /upload/i }));
    await waitFor(() => expect(screen.getByText(/2 of 7 required/i)).toBeInTheDocument());
  });

  // The list of slots changed once already; a draft saved against the old one
  // must not carry keys the form no longer shows into the students row.
  it("forgets an autosaved upload whose slot the form no longer asks for", () => {
    localStorage.setItem(
      "admission-draft-documents",
      JSON.stringify({ apaarCard: { name: "apaar.pdf", dataUrl: "data:,x" } }),
    );
    openDocuments();
    expect(screen.getByText(/0 of 7 required documents attached/i)).toBeInTheDocument();
    expect(screen.queryByText("apaar.pdf")).not.toBeInTheDocument();
  });

  it("takes a wrongly attached document back off", async () => {
    openDocuments();
    fireEvent.click(within(card("Aadhar Card (Front)")).getByRole("button", { name: /upload/i }));
    await waitFor(() =>
      expect(within(card("Aadhar Card (Front)")).getByText(FILE.name)).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole("button", { name: /remove aadhar card \(front\)/i }));
    await waitFor(() =>
      expect(within(card("Aadhar Card (Front)")).getByText("Required")).toBeInTheDocument(),
    );
  });

  it("refuses an oversized scan and says what to do about it", async () => {
    picked = "too-large";
    openDocuments();
    fireEvent.click(within(card("10th Marksheet")).getByRole("button", { name: /upload/i }));

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: "File too large" })),
    );
    expect(within(card("10th Marksheet")).getByText("Required")).toBeInTheDocument();
  });

  it("asks only for PDFs and images, within the size a row can carry", async () => {
    openDocuments();
    fireEvent.click(within(card("Passport Photo")).getByRole("button", { name: /upload/i }));

    expect(pickImage).toHaveBeenCalledWith("application/pdf,image/png,image/jpeg", 2 * 1024 * 1024);
  });

  it("puts the uploads on the student record, under the column that holds them", async () => {
    seedCompleteDraft();
    openDocuments();
    fireEvent.click(within(card("10th Marksheet")).getByRole("button", { name: /upload/i }));
    await waitFor(() => expect(within(card("10th Marksheet")).getByText(FILE.name)).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: /6\. Review/ }));
    fireEvent.click(screen.getByRole("button", { name: /complete admission/i }));

    await waitFor(() => expect(createStudent).toHaveBeenCalled());
    const [, payload] = createStudent.mock.calls[0] as unknown as [string, Record<string, unknown>];
    const documents = payload.documents as Record<string, { name: string; dataUrl: string }>;
    expect(documents.tenthMarksheet.name).toBe(FILE.name);
    expect(documents.tenthMarksheet.dataUrl).toBe(FILE.dataUrl);
  });

  it("leaves the column out entirely when nothing was attached", async () => {
    seedCompleteDraft();
    render(
    <MemoryRouter>
      <AdmissionsWorkspace />
    </MemoryRouter>,
  );
    fireEvent.click(screen.getByRole("button", { name: /6\. Review/ }));
    fireEvent.click(screen.getByRole("button", { name: /complete admission/i }));

    await waitFor(() => expect(createStudent).toHaveBeenCalled());
    const [, payload] = createStudent.mock.calls[0] as unknown as [string, Record<string, unknown>];
    // Rather than an empty object, so the column reads as null.
    expect(payload).not.toHaveProperty("documents");
  });

  // The decision this file exists to pin down: a scan that is not to hand today
  // is chased tomorrow, not a reason to turn an applicant away at the counter.
  it("completes an admission whose documents are still outstanding", async () => {
    seedCompleteDraft();
    render(
    <MemoryRouter>
      <AdmissionsWorkspace />
    </MemoryRouter>,
  );
    fireEvent.click(screen.getByRole("button", { name: /6\. Review/ }));

    expect(screen.getByText(/documents outstanding/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /complete admission/i }));

    await waitFor(() => expect(createStudent).toHaveBeenCalled());
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: "Admission completed" }));
  });

  it("names what is still outstanding rather than hiding it", async () => {
    openDocuments();
    expect(screen.getByText(/still to collect/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Transfer Certificate, Aadhar Card \(Front\), Aadhar Card \(Back\)/),
    ).toBeInTheDocument();
  });
});
