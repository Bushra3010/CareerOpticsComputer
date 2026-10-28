import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

/**
 * An organisation admin belongs to no branch, so creating an exam failed with
 * "Branch ID required to create exam". The admin now picks the branch first,
 * gets that branch's courses and batches, and the exam is filed under it.
 */
const auth = { user: { id: "u1", role: "ORGANIZATION_ADMIN", organizationId: "org" }, view: "admin" };
const createExam = vi.fn((..._args: unknown[]) => Promise.resolve({ success: true, data: {} }));
vi.mock("@/components/layout/AppLayout", () => ({ AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));
// One toast for every render: the page reloads whenever `toast` changes.
const toastApi = { toast: vi.fn() };
vi.mock("@/hooks/use-toast", () => ({ useToast: () => toastApi }));
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => auth,
}));
vi.mock("@/components/ui/date-picker", () => ({
  DatePicker: ({ value, onChange, id }: { value: string; onChange: (v: string) => void; id?: string }) => (
    <input id={id} aria-label="Exam date" value={value} onChange={(e) => onChange(e.target.value)} />
  ),
}));
vi.mock("@/lib/supabase/data", () => ({
  getExams: () => Promise.resolve({ success: true, data: [] }),
  getStudents: () => Promise.resolve({ success: true, data: [] }),
  getBranches: () => Promise.resolve({ success: true, data: [{ id: "b1", name: "Coder Infotech" }, { id: "b2", name: "PNS" }] }),
  getCourses: (_org: string, branch: string | null) =>
    Promise.resolve({ success: true, data: branch === "b1" ? [{ id: "c10", name: "10th Bihar Board", code: "CRASH 03" }] : [] }),
  getBatches: () => Promise.resolve({ success: true, data: [] }),
  createExam: (...args: unknown[]) => createExam(...args),
  submitExamResults: vi.fn(),
  getStudentDocument: vi.fn(),
}));

const { default: AssessmentsWorkspace } = await import("@/pages/exam/AssessmentsWorkspace");

const pick = async (trigger: string, option: string) => {
  fireEvent.keyDown(screen.getByRole("combobox", { name: trigger }), { key: "Enter" });
  fireEvent.click(await screen.findByRole("option", { name: option }));
};

describe("creating an exam as an organisation admin", () => {
  it("asks for the branch first, then files the exam under it", async () => {
    render(<MemoryRouter initialEntries={["/exam/create"]}><AssessmentsWorkspace /></MemoryRouter>);
    expect(await screen.findByRole("combobox", { name: "Course" })).toBeDisabled();

    await pick("Branch", "Coder Infotech");
    await waitFor(() => expect(screen.getByRole("combobox", { name: "Course" })).not.toBeDisabled());
    await pick("Course", "10th Bihar Board · CRASH 03");

    fireEvent.change(screen.getByLabelText("Exam name *"), { target: { value: "demo" } });
    fireEvent.change(screen.getByLabelText("Subject *"), { target: { value: "math" } });
    fireEvent.change(screen.getByLabelText("Exam date"), { target: { value: "2026-10-07" } });
    fireEvent.click(screen.getByRole("button", { name: /create exam/i }));

    await waitFor(() => expect(createExam).toHaveBeenCalled());
    const [branch, payload] = createExam.mock.calls[0] as [string, Record<string, unknown>];
    expect(branch).toBe("b1");
    expect(payload).toMatchObject({ courseId: "c10", name: "demo", subject: "math", maxMarks: 100, passMarks: 40 });
  });
});
