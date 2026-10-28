import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Who brought an admission in.
 *
 * The office pays and chases on referrals, and the form recorded nothing about
 * them: an admission that came through a partner looked exactly like a walk-in
 * once it was filed.
 */
const toast = vi.fn();
const createStudent = vi.fn(() =>
  Promise.resolve({ success: true, data: { applicationNo: "APP-1" } }),
);

vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast }) }));
vi.mock("@/components/layout/AppLayout", () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "u1", role: "FRANCHISE", organizationId: "org1", branchId: "b1" } }),
}));
vi.mock("@/lib/supabase/data", () => ({
  getCourses: () => Promise.resolve({ success: true, data: [] }),
  getBranchCourseIds: () => Promise.resolve(new Set<string>()),
  getBatches: () => Promise.resolve({ success: true, data: [] }),
  getBranches: () => Promise.resolve({ success: true, data: [] }),
  getSessionYears: () => Promise.resolve({ success: true, data: [], stored: false }),
  sessionYearsForDate: () => [],
  admissionDateProblem: () => null,
  getDropdownOptions: () => Promise.resolve({ success: true, data: {}, stored: true }),
  saveDropdownOptions: () => Promise.resolve({ success: true, stored: true }),
  getStudent: () => Promise.resolve({ success: true, data: {} }),
  updateStudent: vi.fn(),
  getBatchesByOrg: () => Promise.resolve({ success: true, data: [] }),
  createStudent: (...args: unknown[]) => createStudent(...(args as [])),
}));

const AdmissionsWorkspace = (await import("@/pages/student/AdmissionsWorkspace")).default;

/** Every NOT NULL column filled, so submit is about the referral and nothing else. */
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

const openReferral = () => {
  render(<MemoryRouter><AdmissionsWorkspace /></MemoryRouter>);
  fireEvent.click(screen.getByRole("button", { name: /5\. Referral/ }));
};

beforeEach(() => {
  toast.mockClear();
  createStudent.mockClear();
  localStorage.clear();
});

describe("Referral information", () => {
  it("has its own step, after the documents and before the review", () => {
    render(<MemoryRouter><AdmissionsWorkspace /></MemoryRouter>);
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

  it("asks who referred them, under what code, and as what", () => {
    openReferral();
    expect(screen.getByText("Referral name")).toBeInTheDocument();
    expect(screen.getByText("Referral code")).toBeInTheDocument();
    expect(screen.getByText("Referral position")).toBeInTheDocument();
  });

  it("files the referral with the admission", async () => {
    seedCompleteDraft();
    openReferral();

    fireEvent.change(screen.getByPlaceholderText(/person or institute/i), {
      target: { value: "Ravi Kumar" },
    });
    fireEvent.change(screen.getByPlaceholderText(/REF-2026/i), {
      // Codes are quoted back over the phone, so they are stored as written.
      target: { value: "ref-2026-014" },
    });
    fireEvent.change(screen.getByPlaceholderText(/partner, staff/i), {
      target: { value: "Partner" },
    });

    fireEvent.click(screen.getByRole("button", { name: /6\. Review/ }));
    fireEvent.click(screen.getByRole("button", { name: /complete admission/i }));

    await waitFor(() => expect(createStudent).toHaveBeenCalled());
    const [, payload] = createStudent.mock.calls[0] as unknown as [string, Record<string, unknown>];
    expect(payload.referralName).toBe("Ravi Kumar");
    expect(payload.referralCode).toBe("REF-2026-014");
    expect(payload.referralPosition).toBe("Partner");
  });

  it("leaves a walk-in alone, rather than writing three empty columns", async () => {
    seedCompleteDraft();
    render(<MemoryRouter><AdmissionsWorkspace /></MemoryRouter>);
    fireEvent.click(screen.getByRole("button", { name: /6\. Review/ }));
    fireEvent.click(screen.getByRole("button", { name: /complete admission/i }));

    await waitFor(() => expect(createStudent).toHaveBeenCalled());
    const [, payload] = createStudent.mock.calls[0] as unknown as [string, Record<string, unknown>];
    expect(payload).not.toHaveProperty("referralName");
  });

  it("names the referrer on the review, so it is checked before it is filed", () => {
    seedCompleteDraft();
    openReferral();
    fireEvent.change(screen.getByPlaceholderText(/person or institute/i), {
      target: { value: "Ravi Kumar" },
    });
    fireEvent.click(screen.getByRole("button", { name: /6\. Review/ }));

    expect(screen.getByText("Referred by")).toBeInTheDocument();
    expect(screen.getByText("Ravi Kumar")).toBeInTheDocument();
  });
});
