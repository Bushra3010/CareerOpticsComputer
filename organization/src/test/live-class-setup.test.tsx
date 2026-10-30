import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";

/**
 * Live Class Setup asked for a subject before anything it depends on, filled
 * its subject list from a student lookup that never matched an admin (so it
 * was always empty), had no branch, and saved the class to this browser
 * alone, where no list and no student ever read it.
 */
const toastApi = { toast: vi.fn() };
const createBatchTiming = vi.fn();
vi.mock("@/hooks/use-toast", () => ({ useToast: () => toastApi }));
vi.mock("@/components/layout/AppLayout", () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/components/ui/date-picker", () => ({
  DatePicker: ({ value, onChange, id }: { value: string; onChange: (v: string) => void; id?: string }) => (
    <input id={id} aria-label="Date" value={value} onChange={(e) => onChange(e.target.value)} />
  ),
}));
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "u1", role: "ORGANIZATION_ADMIN", organizationId: "org1" }, view: "admin" }),
}));
vi.mock("@/lib/dropdownOptions", () => ({
  useDropdownOptions: () => ({ options: (field: string) => (field === "teacher" ? ["Ms. Sinha"] : ["English"]) }),
}));
vi.mock("@/lib/supabase/data", () => ({
  getBranches: () =>
    Promise.resolve({ success: true, data: [{ id: "b1", name: "iDEAL Coaching Classes" }, { id: "b2", name: "PNS Computer Academy" }] }),
  getCourses: (_org: string, branch: string) =>
    Promise.resolve({ success: true, data: branch === "b1" ? [{ id: "c10", name: "10th Bihar Board" }] : [] }),
  getBatches: () =>
    Promise.resolve({
      success: true,
      data: [{ id: "bt1", name: "Crash Course 10th", courseId: "c10", branchId: "b1", instructor: "Raunak kumar", subjects: ["Science", "Math"], currentStudents: 12 }],
    }),
  getBatchTimings: () => Promise.resolve({ success: true, data: [{ batchId: "bt1", subject: "Science", instructor: "Raunak kumar" }] }),
  createBatchTiming: (input: unknown) => {
    createBatchTiming(input);
    return Promise.resolve({ success: true, data: input });
  },
}));

const LiveClassSetup = (await import("@/pages/live-class/LiveClassSetup")).default;

const pick = async (trigger: HTMLElement, option: string) => {
  fireEvent.keyDown(trigger, { key: "Enter" });
  fireEvent.click(await screen.findByRole("option", { name: option }));
};
const field = (id: string) => document.getElementById(id) as HTMLElement;

beforeEach(() => createBatchTiming.mockReset());

describe("Live Class Setup", () => {
  it("asks branch, course, batch, subject, instructor, title -- in that order", () => {
    render(<MemoryRouter><LiveClassSetup /></MemoryRouter>);
    const labels = ["1. Branch *", "2. Course *", "3. Batch *", "4. Subject *", "5. Instructor *", "6. Class Title *"];
    const positions = labels.map((label) => screen.getByText(label)).map((el) => el.compareDocumentPosition(screen.getByText("6. Class Title *")));
    expect(positions.slice(0, -1).every((p) => p & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true);
    // Nothing further down can be chosen before what it depends on.
    expect(field("course")).toBeDisabled();
    expect(field("subject")).toBeDisabled();
  });

  it("offers the batch's own subjects, and saves the class on the batch's timetable", async () => {
    render(<MemoryRouter><LiveClassSetup /></MemoryRouter>);
    await pick(field("branch"), "iDEAL Coaching Classes");
    await waitFor(() => expect(field("course")).not.toBeDisabled());
    await pick(field("course"), "10th Bihar Board");
    await pick(field("batch"), "Crash Course 10th · 12 students");

    fireEvent.keyDown(field("subject"), { key: "Enter" });
    const subjects = (await screen.findAllByRole("option")).map((o) => o.textContent);
    expect(subjects).toEqual(["Math", "Science"]);
    fireEvent.click(screen.getByRole("option", { name: "Science" }));
    await pick(field("instructor"), "Raunak kumar");
    expect(field("title")).toHaveValue("Science class");

    // A Monday well in the future.
    fireEvent.change(screen.getByLabelText("Date"), { target: { value: "2030-01-07" } });
    fireEvent.change(field("time"), { target: { value: "06:15" } });
    await pick(field("platform"), "Google Meet");
    fireEvent.click(screen.getByRole("button", { name: "Schedule Class" }));

    await waitFor(() => expect(createBatchTiming).toHaveBeenCalled());
    expect(createBatchTiming.mock.calls[0][0]).toMatchObject({
      batchId: "bt1",
      day: "MONDAY",
      startTime: "06:15",
      endTime: "07:15",
      subject: "Science",
      instructor: "Raunak kumar",
      title: "Science class",
      platform: "Google Meet",
    });
  });
});
