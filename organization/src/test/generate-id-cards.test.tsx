import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

/**
 * ID cards are made branch by branch: pick the branch (searchable), narrow to
 * a course, tick the students, and generate -- in that branch's own design.
 */
const ROSTER: Record<string, unknown[]> = {
  b1: [
    { id: "s1", branchId: "b1", courseId: "c1", firstName: "Abhishek", lastName: "Gupta", enrollmentNo: "IDS/0012" },
    { id: "s2", branchId: "b1", courseId: "c2", firstName: "Sonali", lastName: "Kumari", applicationNo: "APP-0011" },
  ],
  b2: [{ id: "s3", branchId: "b2", courseId: "c1", firstName: "Rohit", lastName: "Sharma", applicationNo: "APP-0010" }],
};
const getStudents = vi.fn((branchId: unknown, ..._a: unknown[]) => Promise.resolve({ success: true, data: ROSTER[String(branchId)] ?? ROSTER.b1 }));
const printRecordsByBranch = vi.fn((..._a: unknown[]) => Promise.resolve(true));
let view = "admin";

const toast = vi.fn();
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast }) }));
vi.mock("@/components/layout/AppLayout", () => ({ AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));
vi.mock("@/components/ui/PageHeader", () => ({ PageHeader: ({ title }: { title: string }) => <h1>{title}</h1> }));
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ view, user: { id: "u1", organizationId: "org1", branchId: view === "admin" ? null : "b9" } }),
}));
vi.mock("@/lib/studentTemplateDocument", () => ({
  photoOf: () => "",
  printRecordsByBranch: (...a: unknown[]) => printRecordsByBranch(...a),
}));
vi.mock("@/lib/supabase/data", () => ({
  getBranches: () => Promise.resolve({ data: [{ id: "b1", name: "PNS COMPUTER ACADEMY" }, { id: "b2", name: "Coder Infotech Academy" }] }),
  getCourses: () => Promise.resolve({ data: [{ id: "c1", name: "ADCA" }, { id: "c2", name: "DCA" }, { id: "c3", name: "Tally" }] }),
  getBatches: () => Promise.resolve({ data: [] }),
  getStudents: (branchId: unknown, ...a: unknown[]) => getStudents(branchId, ...a),
}));

const GenerateIDCards = (await import("@/pages/cards/GenerateIDCards")).default;

const choose = async (label: string, option: string | RegExp) => {
  fireEvent.keyDown(screen.getByRole("combobox", { name: label }), { key: "Enter" });
  fireEvent.click(await screen.findByRole("option", { name: option }));
};

beforeEach(() => {
  view = "admin";
  getStudents.mockClear();
  printRecordsByBranch.mockClear();
});

describe("Generate ID Cards", () => {
  it("lists a branch's students by course and generates the ticked cards", async () => {
    render(<MemoryRouter><GenerateIDCards /></MemoryRouter>);
    expect(await screen.findByText("Select a branch to list its students.")).toBeInTheDocument();
    expect(screen.queryByText("Academic Year")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Branch" }));
    fireEvent.change(await screen.findByLabelText("Search branch…"), { target: { value: "pns" } });
    expect(screen.queryByRole("checkbox", { name: "Coder Infotech Academy" })).toBeNull();
    fireEvent.click(screen.getByRole("checkbox", { name: "PNS COMPUTER ACADEMY" }));
    await waitFor(() => expect(getStudents).toHaveBeenCalledWith("b1", 1, 2000));
    expect(await screen.findByText("Abhishek Gupta")).toBeInTheDocument();
    expect(screen.getByText("Sonali Kumari")).toBeInTheDocument();

    // Only courses the branch has students on, with their counts.
    fireEvent.keyDown(screen.getByRole("combobox", { name: "Course" }), { key: "Enter" });
    expect(await screen.findByRole("option", { name: "DCA (1)" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /Tally/ })).toBeNull();
    fireEvent.click(screen.getByRole("option", { name: "ADCA (1)" }));
    await waitFor(() => expect(screen.queryByText("Sonali Kumari")).toBeNull());

    fireEvent.click(screen.getByRole("checkbox", { name: "Select all students shown" }));
    fireEvent.click(screen.getByRole("button", { name: "Generate ID Cards (1)" }));
    await waitFor(() =>
      expect(printRecordsByBranch).toHaveBeenCalledWith("student-id", [expect.objectContaining({ id: "s1", courseName: "ADCA" })], "org1"),
    );
  });

  it("lists several branches' students together and prints them in one run", async () => {
    render(<MemoryRouter><GenerateIDCards /></MemoryRouter>);
    fireEvent.click(await screen.findByRole("button", { name: "Branch" }));
    fireEvent.click(await screen.findByRole("checkbox", { name: "All branches" }));
    await waitFor(() => expect(getStudents).toHaveBeenCalledTimes(2));
    expect(screen.getByRole("button", { name: "Branch" })).toHaveTextContent("All branches (2)");
    expect(await screen.findByText("Rohit Sharma")).toBeInTheDocument();
    expect(screen.getByText("Abhishek Gupta")).toBeInTheDocument();
    // The branch shows against each student once there is more than one.
    expect(within(screen.getByText("Rohit Sharma").closest("tr")!).getByText("Coder Infotech Academy")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("checkbox", { name: "Select all students shown" }));
    fireEvent.click(screen.getByRole("button", { name: "Generate ID Cards (3)" }));
    await waitFor(() => expect(printRecordsByBranch).toHaveBeenCalledTimes(1));
    expect((printRecordsByBranch.mock.calls[0] as unknown[])[1]).toHaveLength(3);
  });

  it("gives a centre its own students without a branch picker", async () => {
    view = "franchise";
    render(<MemoryRouter><GenerateIDCards /></MemoryRouter>);
    await waitFor(() => expect(getStudents).toHaveBeenCalledWith("b9", 1, 2000));
    expect(screen.queryByRole("button", { name: "Branch" })).toBeNull();
    const row = (await screen.findByText("Sonali Kumari")).closest("tr")!;
    expect(within(row).getByText("APP-0011")).toBeInTheDocument();
    await choose("Course", "DCA (1)");
    expect(screen.queryByText("Abhishek Gupta")).toBeNull();
  });
});
