import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

/** Sample Certificate: every course, its price, and a demo certificate and marksheet. */

const m = vi.hoisted(() => ({ certificatePdf: vi.fn(), marksheetPdf: vi.fn(), toast: vi.fn() }));

vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: m.toast }) }));
vi.mock("@/components/layout/AppLayout", () => ({ AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ user: { id: "u1", name: "Ara Centre" }, branchId: "b1", organizationId: "org1" }) }));
vi.mock("@/lib/instituteLogo", () => ({ loadInstituteLogo: () => Promise.resolve(null) }));
vi.mock("@/lib/documents", () => ({ certificatePdf: m.certificatePdf, marksheetPdf: m.marksheetPdf }));
vi.mock("@/lib/supabase/examWorkflow", () => ({
  getCourseSubjects: () =>
    Promise.resolve([
      { id: "s1", courseId: "c1", term: 1, code: "", name: "MS Office", subjectType: "BOTH", theoryMax: 70, theoryMin: 28, practicalMax: 30, practicalMin: 12, sortOrder: 1 },
    ]),
}));
vi.mock("@/lib/supabase/data", () => ({
  getCourses: () =>
    Promise.resolve({
      success: true,
      data: [
        { id: "c1", name: "ADCA", code: "ADCA-12", baseFee: 12000, durationValue: 12, durationUnit: "MONTHS" },
        { id: "c2", name: "Old Course", code: "OLD", baseFee: 100, isActive: false },
      ],
    }),
  getCentreRates: () => Promise.resolve(new Map([["*", { CERTIFICATE: 200 }]])),
  effectiveRate: () => 200,
}));

const { default: SampleCertificates } = await import("@/pages/centre/SampleCertificates");

describe("Sample Certificate", () => {
  it("lists active courses with fee, duration and franchise price", async () => {
    render(<SampleCertificates />);
    const row = (await screen.findByText("ADCA")).closest("tr")!;
    expect(within(row).getByText("ADCA-12")).toBeInTheDocument();
    expect(within(row).getByText("12,000.00")).toBeInTheDocument();
    expect(within(row).getByText("12 Months")).toBeInTheDocument();
    expect(within(row).getByText("200")).toBeInTheDocument();
    expect(screen.queryByText("Old Course")).toBeNull();
  });

  it("prints a sample certificate and marksheet with a made-up student", async () => {
    render(<SampleCertificates />);
    fireEvent.click(await screen.findByRole("button", { name: "Sample certificate for ADCA" }));
    await waitFor(() => expect(m.certificatePdf).toHaveBeenCalled());
    const [doc, extra] = m.certificatePdf.mock.calls[0];
    expect(doc).toMatchObject({ firstName: "Sample", lastName: "Student", course: { name: "ADCA", code: "ADCA-12" } });
    expect(extra).toEqual({ certificate_no: "SAMPLE", serial_no: "SAMPLE" });

    fireEvent.click(screen.getByRole("button", { name: "Sample marksheet for ADCA" }));
    await waitFor(() => expect(m.marksheetPdf).toHaveBeenCalled());
    const marks = m.marksheetPdf.mock.calls[0][0].examResults;
    expect(marks.map((r: { exam: { paper: string } }) => r.exam.paper)).toEqual(["Theory", "Practical"]);
  });
});
