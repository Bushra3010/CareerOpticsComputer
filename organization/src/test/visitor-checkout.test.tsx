import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * When a visitor left.
 *
 * `visit_enquiries.check_out` was read, shown in the log and written into the
 * CSV -- but no screen could ever set it. The front desk could check somebody
 * in and never out, so "On premises" only counted up and the column was empty
 * on every row the office had ever exported.
 */
const toast = vi.fn();
const updateEnquiry = vi.fn();
const getEnquiries = vi.fn();

vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast }) }));
vi.mock("@/components/layout/AppLayout", () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "u1", role: "BRANCH_ADMIN", organizationId: "org1", branchId: "b1" },
    organizationId: "org1",
    branchId: "b1",
    view: "franchise",
  }),
}));
vi.mock("@/lib/supabase/data", () => ({
  getEnquiries: (...args: unknown[]) => getEnquiries(...(args as [])),
  updateEnquiry: (...args: unknown[]) => updateEnquiry(...(args as [])),
  createEnquiry: vi.fn(),
  deleteEnquiry: vi.fn(),
  getBranches: () => Promise.resolve({ success: true, data: [{ id: "b1", name: "Main" }] }),
}));

const EnquiriesWorkspace = (await import("@/pages/reception/EnquiriesWorkspace")).default;

/** One visitor, checked in at 10:00 this morning and still inside. */
const arrival = new Date();
arrival.setHours(10, 0, 0, 0);

const VISITOR = {
  id: "vis-1",
  branchId: "b1",
  visitorName: "Sunita Rao",
  phone: "9822041100",
  purpose: "ADMISSION",
  personToMeet: "Reception",
  department: "ADMINISTRATION",
  status: "NEW",
  visitDate: arrival.toISOString(),
  visitTime: "10:00",
  createdAt: arrival.toISOString(),
  check_out: null,
};

const open = () => render(<MemoryRouter><EnquiriesWorkspace /></MemoryRouter>);

const rowMenu = async () => {
  const row = (await screen.findAllByText("Sunita Rao"))[0].closest("tr")!;
  const trigger = within(row).getAllByRole("button").at(-1)!;
  fireEvent.keyDown(trigger, { key: "Enter" });
};

beforeEach(() => {
  toast.mockClear();
  updateEnquiry.mockReset();
  updateEnquiry.mockResolvedValue({ success: true, data: {} });
  getEnquiries.mockResolvedValue({ success: true, data: [VISITOR] });
});

describe("where a visit has got to", () => {
  // The bug: marking a visitor changed a status the table never showed, so
  // every one of those menu items looked like it had done nothing at all.
  it("shows the status on the row it belongs to", async () => {
    open();
    await waitFor(() => expect(getEnquiries).toHaveBeenCalled());
    const row = (await screen.findAllByText("Sunita Rao"))[0].closest("tr")!;
    expect(within(row).getByText("Checked in")).toBeInTheDocument();
  });

  it("moves the row to the status that was marked", async () => {
    open();
    await rowMenu();
    fireEvent.click(await screen.findByText(/mark as converted/i));

    await waitFor(() => expect(updateEnquiry).toHaveBeenCalled());
    const [, , payload] = updateEnquiry.mock.calls[0] as [string, string, Record<string, unknown>];
    expect(payload.status).toBe("CONVERTED");

    const row = (await screen.findAllByText("Sunita Rao"))[0].closest("tr")!;
    expect(within(row).getByText("Converted")).toBeInTheDocument();
  });

  it("asks when to call back before putting anyone on the follow-up list", async () => {
    // A follow-up list with no dates on it is not a list anyone can work.
    open();
    await rowMenu();
    fireEvent.click(await screen.findByText(/mark as follow-up/i));

    // Tomorrow, which is what a front desk means by "follow up".
    const tomorrow = new Date(Date.now() + 86400000);
    const trigger = await screen.findByLabelText(/follow-up date/i);
    expect(trigger.textContent).toContain(String(tomorrow.getDate()).padStart(2, "0"));

    // The calendar: steer its month and year, then click the day.
    fireEvent.click(trigger);
    const selects = document.querySelectorAll("select");
    fireEvent.change(selects[1], { target: { value: "2026" } });
    fireEvent.change(selects[0], { target: { value: "8" } });
    fireEvent.click(
      Array.from(document.querySelectorAll('button[name="day"]')).find(
        (button) => button.textContent === "25",
      )!,
    );
    fireEvent.change(screen.getByLabelText(/^note$/i), { target: { value: "Wants the fee split" } });
    fireEvent.click(screen.getByRole("button", { name: /save follow-up/i }));

    await waitFor(() => expect(updateEnquiry).toHaveBeenCalled());
    const [, , payload] = updateEnquiry.mock.calls[0] as [string, string, Record<string, unknown>];
    expect(payload.status).toBe("CONTACTED");
    // Stored as the instant local midnight falls on, which is what the rest of
    // the app writes and what the column reads back as that day.
    expect(new Date(String(payload.followUpDate)).getDate()).toBe(25);
    expect(payload.followUpNotes).toBe("Wants the fee split");

    const row = (await screen.findAllByText("Sunita Rao"))[0].closest("tr")!;
    expect(within(row).getByText("Follow-up")).toBeInTheDocument();
  });

  it("calls the end of a visit what the office calls it", async () => {
    open();
    await rowMenu();
    // "Mark completed" said nothing about what had completed; "admission
    // completed" claimed an admission for every visitor who left.
    expect(await screen.findByText(/mark as visit completed/i)).toBeInTheDocument();
  });
});

describe("checking a visitor out", () => {
  it("counts a visitor who has not been stamped out as still on the premises", async () => {
    open();
    await waitFor(() => expect(getEnquiries).toHaveBeenCalled());
    const tile = screen.getByText("On premises").closest("div")!;
    expect(within(tile).getByText("1")).toBeInTheDocument();
  });

  it("stamps the time they left, and closes the visit with it", async () => {
    open();
    await rowMenu();
    fireEvent.click(await screen.findByText("Check out now"));

    // The dialog opens on now, which is the answer most of the time: the
    // calendar shows today's date and the time field is filled.
    const day = await screen.findByLabelText(/out time/i);
    expect(day).not.toHaveTextContent(/select date/i);
    const time = screen.getByLabelText("Time") as HTMLInputElement;
    expect(time.value).not.toBe("");
    fireEvent.change(time, { target: { value: "15:30" } });
    fireEvent.click(screen.getByRole("button", { name: /save out time/i }));

    await waitFor(() => expect(updateEnquiry).toHaveBeenCalled());
    const [, , payload] = updateEnquiry.mock.calls[0] as [string, string, Record<string, unknown>];
    // snake_case, as the live schema spells it, and a visit that is over.
    const stamped = new Date(String(payload.check_out));
    expect([stamped.getHours(), stamped.getMinutes()]).toEqual([15, 30]);
    expect(payload.status).toBe("CLOSED");
  });

  it("takes a check-out back off, for one stamped by mistake", async () => {
    getEnquiries.mockResolvedValue({
      success: true,
      data: [{ ...VISITOR, check_out: new Date().toISOString(), status: "CLOSED" }],
    });
    open();
    await rowMenu();
    fireEvent.click(await screen.findByText("Clear check-out"));

    await waitFor(() => expect(updateEnquiry).toHaveBeenCalled());
    const [, , payload] = updateEnquiry.mock.calls[0] as [string, string, Record<string, unknown>];
    expect(payload.check_out).toBeNull();
    // Clearing it must not quietly reopen a visit that was completed on purpose.
    expect(payload).not.toHaveProperty("status");
  });
});
