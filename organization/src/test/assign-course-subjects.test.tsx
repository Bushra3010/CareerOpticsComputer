import { render, screen, waitFor, within } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

/**
 * Subjects picked in Assign Course to Batch were kept on the screen alone and
 * were gone on reload, so no student ever saw what they study. They are saved
 * on the batch now, and the list is read back from the batches.
 */
const toastApi = { toast: vi.fn() };
vi.mock("@/hooks/use-toast", () => ({ useToast: () => toastApi }));
vi.mock("@/components/layout/AppLayout", () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "u1", role: "ORGANIZATION_ADMIN", organizationId: "org1" }, view: "admin" }),
}));
vi.mock("@/lib/supabase/data", () => ({
  getCourses: () => Promise.resolve({ success: true, data: [{ id: "c10", name: "10th Bihar Board", code: "BSEB10", isActive: true }] }),
  getBranches: () => Promise.resolve({ success: true, data: [{ id: "b1", name: "iDEAL Coaching Classes" }] }),
  getBatches: () => Promise.resolve({ success: true, data: [] }),
  getBatchesByOrg: () =>
    Promise.resolve({
      success: true,
      data: [
        { id: "bt1", name: "Crash Course 10th", courseId: "c10", branchId: "b1", instructor: "Raunak kumar", subjects: ["Science", "Math"] },
        { id: "bt2", name: "Evening 10th", courseId: "c10", branchId: "b1", instructor: "", subjects: [] },
      ],
    }),
  getInstructorUsage: () => Promise.resolve({ success: true, data: [] }),
  getBranchCourseIds: () => Promise.resolve(new Set<string>()),
  setBranchCourseOffered: vi.fn(),
  updateBatch: vi.fn(),
  renameInstructor: vi.fn(),
  getDropdownOptions: () => Promise.resolve({ success: true, data: {}, stored: true }),
  saveDropdownOptions: () => Promise.resolve({ success: true, stored: true }),
}));

const AssignCourseToBatch = (await import("@/pages/course/AssignCourseToBatch")).default;

describe("Assign Course to Batch", () => {
  it("lists what is saved on the batches, so assignments survive a reload", async () => {
    render(<MemoryRouter><AssignCourseToBatch /></MemoryRouter>);
    const table = await screen.findByRole("table");
    await waitFor(() => expect(within(table).getByText("Crash Course 10th")).toBeInTheDocument());
    expect(within(table).getByText(/Science/)).toBeInTheDocument();
    // A batch with no subjects is not an assignment yet.
    expect(within(table).queryByText("Evening 10th")).toBeNull();
  });
});
