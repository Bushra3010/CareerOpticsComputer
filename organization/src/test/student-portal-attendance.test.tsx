import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";

/**
 * The portal asked for attendance with the login's id, while registers are
 * keyed by the student record's id -- so every student saw 0 of 0 sessions
 * and a "Below 75%" warning however many registers had been taken.
 */
const attendance = vi.fn();
let records: Array<{ id: string; date: string; status: string }> = [];

vi.mock("@/components/layout/AppLayout", () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "login-1", name: "Durga Prasad", role: "STUDENT", branchId: "b1", organizationId: "o1" } }),
}));
vi.mock("@/lib/supabase/data", () => ({
  getStudentProfile: () =>
    Promise.resolve({ success: true, data: { name: "Durga Prasad", course: "10th Bihar Board", batch: "Crash 10th", branch: "iDEAL", enrollmentNo: "APP-1", courseFee: 999 } }),
  getStudentPortalAttendance: (...args: unknown[]) => {
    attendance(...args);
    return Promise.resolve({ success: true, data: records });
  },
  getStudentPortalInvoices: () => Promise.resolve({ success: true, data: [] }),
  getStudentPortalResults: () => Promise.resolve({ success: true, data: [] }),
  getStudentPortalClasses: () => Promise.resolve({ success: true, data: [] }),
  getNotices: () => Promise.resolve({ success: true, data: [] }),
}));

const StudentDashboard = (await import("@/pages/portal/StudentDashboard")).default;
const renderPage = () => render(<MemoryRouter><StudentDashboard /></MemoryRouter>);

beforeEach(() => {
  attendance.mockReset();
  records = [];
});

describe("student dashboard attendance", () => {
  it("asks for the signed-in student's attendance by login, resolved to their record", async () => {
    renderPage();
    await waitFor(() => expect(attendance).toHaveBeenCalledWith("login-1", "b1"));
  });

  it("says no register has been taken rather than 0% and below 75%", async () => {
    renderPage();
    await waitFor(() => expect(screen.getAllByText("No register taken yet").length).toBeGreaterThan(0));
    expect(screen.queryByText("Below 75%")).toBeNull();
  });

  it("shows the percentage once registers exist", async () => {
    records = [
      { id: "a1", date: "2026-10-01", status: "PRESENT" },
      { id: "a2", date: "2026-10-02", status: "ABSENT" },
    ];
    renderPage();
    await waitFor(() => expect(screen.getAllByText("50%").length).toBeGreaterThan(0));
    expect(screen.getByText("Below 75%")).toBeInTheDocument();
  });
});
