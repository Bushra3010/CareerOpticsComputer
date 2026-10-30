import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

vi.mock("@/components/layout/AppLayout", () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "login-1", role: "STUDENT", branchId: "b1" }, view: "student" }),
}));
vi.mock("@/lib/supabase/data", () => ({
  getStudentPortalCourses: () =>
    Promise.resolve({
      success: true,
      data: [
        {
          id: "c10",
          name: "10th Bihar Board",
          code: "BSEB10",
          category: "School",
          description: "Board preparation",
          duration: "6 months",
          fee: 999,
          eligibility: "9th pass",
          certification: "",
          batch: { name: "Crash Course 10th", startDate: "", endDate: "", teachers: ["Raunak kumar"] },
          subjects: [
            { name: "Science", teachers: ["Raunak kumar"], slots: [{ day: "MONDAY", startTime: "06:15", endTime: "07:15", room: "Hall" }] },
            { name: "Hindi", teachers: [], slots: [] },
          ],
          syllabus: {
            ready: true,
            modules: [{ id: "m1", courseId: "c10", name: "Physics", description: "", sortOrder: 1, status: "Active" }],
            chapters: [{ id: "ch1", moduleId: "m1", courseId: "c10", name: "Light", description: "", practical: "", pdfUrl: "", videoUrl: "", sortOrder: 1, status: "Active" }],
          },
        },
      ],
    }),
}));

const MyCourses = (await import("@/pages/portal/MyCourses")).default;

describe("My courses", () => {
  it("shows the course, batch, teachers, subjects with times, and syllabus", async () => {
    render(<MemoryRouter><MyCourses /></MemoryRouter>);
    expect(await screen.findByText("10th Bihar Board")).toBeInTheDocument();
    expect(screen.getByText("Crash Course 10th")).toBeInTheDocument();
    expect(screen.getAllByText("Raunak kumar").length).toBeGreaterThan(0);
    expect(screen.getByText("Science")).toBeInTheDocument();
    expect(screen.getByText(/Monday 06:15 – 07:15 · Hall/)).toBeInTheDocument();
    expect(screen.getByText("Class times not set yet.")).toBeInTheDocument();
    expect(screen.getByText("Physics")).toBeInTheDocument();
    expect(screen.getByText("1. Light")).toBeInTheDocument();
  });
});
