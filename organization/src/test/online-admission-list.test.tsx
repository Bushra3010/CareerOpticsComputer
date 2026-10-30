import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { storedTime } from "@/lib/storedTime";

/** The centre's list of online applications, as the admin reviews them. */
vi.mock("@/components/layout/AppLayout", () => ({ AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ user: { branchId: "b1", organizationId: "o1" }, view: "admin" }) }));
const toast = vi.fn();
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast }) }));
vi.mock("@/lib/supabase/data", () => ({
  getStudents: () =>
    Promise.resolve({
      data: [
        // A student row comes without its course's name, and with the time as
        // the database keeps it: UTC with no zone.
        { id: "s1", applicationNo: "APP-2026-0017", firstName: "TEST Online", lastName: "Applicant", phone: "9000000123", courseId: "c1", admissionStatus: "SUBMITTED", applicationSource: "ONLINE", admissionDate: "2026-10-24T16:57:42.428", documents: {} },
        // A counter admission already approved is not an application.
        { id: "s2", applicationNo: "APP-2026-0001", firstName: "Walk", lastName: "In", courseId: "c1", admissionStatus: "APPROVED" },
      ],
    }),
}));
vi.mock("@/lib/supabase/studentFee", () => ({ listInvoices: () => Promise.resolve({ data: [] }), updateStudentRow: vi.fn() }));
vi.mock("@/lib/supabase/examAttendance", () => ({
  listCourses: () => Promise.resolve([{ id: "c1", name: "ADCA" }]),
  listBatches: () => Promise.resolve([]),
}));

const { default: OnlineAdmissionList } = await import("@/pages/student/OnlineAdmissionList");

describe("online admission list", () => {
  it("shows each application with its course and the time it was made", async () => {
    render(<MemoryRouter><OnlineAdmissionList /></MemoryRouter>);
    // The table (the list also has a card view for phones).
    const row = (await screen.findAllByText("APP-2026-0017")).map((e) => e.closest("tr")).find(Boolean) as HTMLElement;
    expect(within(row).getByText("ADCA")).toBeInTheDocument();
    expect(within(row).getByText("No batch yet")).toBeInTheDocument();
    expect(within(row).getByText("9000000123")).toBeInTheDocument();
    const shown = storedTime("2026-10-24T16:57:42.428")!.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
    expect(within(row).getByText(shown)).toBeInTheDocument();
    expect(screen.queryByText("APP-2026-0001")).not.toBeInTheDocument();
  });
});

describe("storedTime", () => {
  it("reads a time with no zone as UTC and keeps one with a zone", () => {
    expect(storedTime("2026-10-24T16:57:42.428")!.toISOString()).toBe("2026-10-24T16:57:42.428Z");
    expect(storedTime("2026-10-24 16:57:42")!.toISOString()).toBe("2026-10-24T16:57:42.000Z");
    expect(storedTime("2026-10-24T22:27:42+05:30")!.toISOString()).toBe("2026-10-24T16:57:42.000Z");
    expect(storedTime("")).toBeNull();
    expect(storedTime("—")).toBeNull();
  });
});
