import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MemoryRouter } from "react-router-dom";

/**
 * A franchise deletes its own enquiries, batches and exams from the centre
 * panel, after confirming. An exam the head office made for every centre is
 * not the franchise's to delete, so it has no Delete button there.
 */

const m = vi.hoisted(() => ({
  toast: vi.fn(),
  deleteEnquiry: vi.fn(),
  deleteBatch: vi.fn(),
  deleteOnlineExam: vi.fn(),
  enquiries: [] as Array<Record<string, unknown>>,
}));

vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: m.toast }) }));
vi.mock("@/components/layout/AppLayout", () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "u1", role: "BRANCH_ADMIN", organizationId: "org1", branchId: "b1" },
    branchId: "b1",
    organizationId: "org1",
  }),
}));
vi.mock("@/lib/supabase/data", () => ({
  getBranches: () => Promise.resolve({ success: true, data: [] }),
  getCourses: () => Promise.resolve({ success: true, data: [{ id: "c1", name: "ADCA" }] }),
  getBatches: () =>
    Promise.resolve({ success: true, data: [{ id: "bt1", name: "Morning ADCA", branchId: "b1", courseId: "c1", isActive: true, currentStudents: 0 }] }),
  getBatchesByOrg: () => Promise.resolve({ success: true, data: [] }),
  createBatch: vi.fn(),
  updateBatch: vi.fn(),
  createEnquiry: vi.fn(),
  updateEnquiry: vi.fn(),
  deleteBatch: (...a: unknown[]) => m.deleteBatch(...a),
  deleteEnquiry: (...a: unknown[]) => m.deleteEnquiry(...a),
}));
vi.mock("@/lib/supabase/client", () => {
  const from = () => {
    const builder: Record<string, unknown> = {};
    const chain = () => builder;
    Object.assign(builder, {
      select: chain, order: chain, range: chain, eq: chain,
      then: (resolve: (v: unknown) => unknown) => resolve({ data: m.enquiries, error: null, count: m.enquiries.length }),
    });
    return builder;
  };
  return { supabase: { from } };
});
vi.mock("@/lib/supabase/questionBank", () => ({
  listCentreExams: () =>
    Promise.resolve([
      { id: "e1", title: "Centre Test", description: "", courseId: "c1", branchId: "b1", examType: "MCQ", questionCount: 10, durationMinutes: 30, status: "PUBLISHED", createdAt: "2026-11-01" },
      { id: "e2", title: "Head Office Test", description: "", courseId: "c1", branchId: "", examType: "MCQ", questionCount: 10, durationMinutes: 30, status: "PUBLISHED", createdAt: "2026-11-01" },
    ]),
}));
vi.mock("@/lib/supabase/onlineExams", () => ({
  getExamAssignments: () => Promise.resolve([]),
  getExamAttempts: () => Promise.resolve([]),
  deleteOnlineExam: (...a: unknown[]) => m.deleteOnlineExam(...a),
}));
vi.mock("@/lib/supabase/examAttendance", () => ({
  listStudents: () => Promise.resolve([]),
  studentName: () => "",
}));

const { default: CentreEnquiry } = await import("@/pages/centre/CentreEnquiry");
const { default: CentreBatches } = await import("@/pages/centre/CentreBatches");
const { default: CentreExams } = await import("@/pages/centre/CentreExams");

const show = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);
let confirm: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  m.toast.mockReset();
  m.deleteEnquiry.mockReset().mockResolvedValue({ success: true });
  m.deleteBatch.mockReset().mockResolvedValue({ success: true });
  m.deleteOnlineExam.mockReset().mockResolvedValue(undefined);
  m.enquiries = [{ id: "q1", visitorName: "Anil", phone: "9876543210", branchId: "b1", purpose: "ADMISSION", status: "NEW", createdAt: "2026-11-10" }];
  confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
});
afterEach(() => confirm.mockRestore());

describe("Franchise deletes", () => {
  it("deletes an enquiry of the centre", async () => {
    show(<CentreEnquiry />);
    fireEvent.click(await screen.findByRole("button", { name: "Delete enquiry Anil" }));
    await waitFor(() => expect(m.deleteEnquiry).toHaveBeenCalledWith("q1", "b1"));
    await waitFor(() => expect(screen.queryByText("Anil")).toBeNull());
  });

  it("deletes a batch, and keeps it when the centre cancels", async () => {
    confirm.mockReturnValueOnce(false);
    show(<CentreBatches />);
    const button = await screen.findByRole("button", { name: "Delete batch Morning ADCA" });
    fireEvent.click(button);
    expect(m.deleteBatch).not.toHaveBeenCalled();
    fireEvent.click(button);
    await waitFor(() => expect(m.deleteBatch).toHaveBeenCalledWith("bt1"));
  });

  it("shows why a batch with students cannot be deleted", async () => {
    m.deleteBatch.mockRejectedValue(new Error("2 students are still enrolled in this batch"));
    show(<CentreBatches />);
    fireEvent.click(await screen.findByRole("button", { name: "Delete batch Morning ADCA" }));
    await waitFor(() =>
      expect(m.toast).toHaveBeenCalledWith(expect.objectContaining({ description: "2 students are still enrolled in this batch", variant: "destructive" })),
    );
    expect(screen.getByText("Morning ADCA")).toBeInTheDocument();
  });

  it("deletes the centre's own exam but not the head office's", async () => {
    show(<CentreExams />);
    fireEvent.click(await screen.findByRole("button", { name: "Delete exam Centre Test" }));
    await waitFor(() => expect(m.deleteOnlineExam).toHaveBeenCalledWith("e1"));
    expect(screen.queryByRole("button", { name: "Delete exam Head Office Test" })).toBeNull();
  });
});
