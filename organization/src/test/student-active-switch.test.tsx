import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StudentRoster } from "@/components/student/StudentRoster";
import type { StudentRosterRow } from "@/lib/supabase/data";

/** Each student can be switched active or inactive straight from the roster. */
const row = (overrides: Partial<StudentRosterRow>): StudentRosterRow => ({
  id: "s1", name: "Rohit Kumar Sharma", initials: "RS", address: "Patna", mapQuery: "Patna",
  admissionNo: "APP-2026-0010", admissionDate: "2026-10-05", course: "DCA", courseCode: "DCA 06",
  branch: "Coder Infotech", courseFee: 3500, fatherName: "Siya Ram", fatherPhone: "", phone: "",
  whatsapp: "", email: "", fee: 3500, invoiced: 3500, paid: 0, balance: 3500, status: "Active",
  batch: "Morning", hasLogin: false, ...overrides,
});

const noop = () => undefined;

describe("student active switch", () => {
  it("switches an active student off and an inactive one on", () => {
    const toggle = vi.fn();
    render(
      <StudentRoster
        rows={[row({}), row({ id: "s2", name: "Durga Prasad", status: "Inactive" })]}
        onView={noop} onEdit={noop} onDelete={noop} onExport={noop}
        onToggleActive={toggle}
      />,
    );
    fireEvent.click(screen.getByRole("switch", { name: "Deactivate Rohit Kumar Sharma" }));
    expect(toggle).toHaveBeenCalledWith(expect.objectContaining({ id: "s1" }), false);
    fireEvent.click(screen.getByRole("switch", { name: "Activate Durga Prasad" }));
    expect(toggle).toHaveBeenCalledWith(expect.objectContaining({ id: "s2" }), true);
  });

  it("shows no switch where the caller does not allow it", () => {
    render(<StudentRoster rows={[row({})]} onView={noop} onEdit={noop} onDelete={noop} onExport={noop} />);
    expect(screen.queryByRole("switch")).toBeNull();
  });
});
