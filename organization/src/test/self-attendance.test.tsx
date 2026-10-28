import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import QRCodeLib from "qrcode";
import jsQR from "jsqr";

/**
 * Students mark their own attendance: by scanning the centre's QR, or a
 * selfie. The centre's screen shows a code that changes every minute.
 */
const rpc = vi.fn();
const fromRows: Record<string, unknown[]> = { attendance_checkins: [] };
vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    rpc: (...a: unknown[]) => rpc(...a),
    from: (table: string) => {
      // Every builder step returns the query, which resolves like PostgREST does.
      const q: Record<string, unknown> = {};
      for (const step of ["select", "eq", "order", "is", "in"]) q[step] = () => q;
      q.then = (resolve: (v: unknown) => unknown) => resolve({ data: fromRows[table] ?? [], error: null });
      return q;
    },
  },
}));

const { codeFromQr, qrPayload, studentCheckIn, newAttendanceQr } = await import("@/lib/supabase/selfAttendance");

beforeEach(() => rpc.mockReset());

describe("the attendance QR", () => {
  it("is read back by the scanner the student portal uses", () => {
    // Drawn the way the centre's screen draws it, read the way the phone reads it.
    const qr = QRCodeLib.create(qrPayload("A1B2C3D4E5"), { errorCorrectionLevel: "M" });
    const size = qr.modules.size;
    const scale = 6;
    const margin = 4;
    const side = (size + margin * 2) * scale;
    const pixels = new Uint8ClampedArray(side * side * 4).fill(255);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (!qr.modules.get(y, x)) continue;
        for (let dy = 0; dy < scale; dy++) {
          for (let dx = 0; dx < scale; dx++) {
            const i = (((y + margin) * scale + dy) * side + (x + margin) * scale + dx) * 4;
            pixels[i] = pixels[i + 1] = pixels[i + 2] = 0;
          }
        }
      }
    }
    const found = jsQR(pixels, side, side);
    expect(found?.data).toBe("CAREEROPTICS-ATTENDANCE:A1B2C3D4E5");
    expect(codeFromQr(found!.data)).toBe("A1B2C3D4E5");
    // Some other QR -- a payment code, a website -- is not an attendance code.
    expect(codeFromQr("upi://pay?pa=x@y")).toBeNull();
  });

  it("asks the database to mark today and passes on its reasons in plain words", async () => {
    rpc.mockResolvedValueOnce({ data: { date: "2026-10-24", status: "PRESENT", alreadyMarked: false }, error: null });
    await expect(studentCheckIn("QR", { code: "A1B2", latitude: 25.9, longitude: 85.3 })).resolves.toMatchObject({ status: "PRESENT" });
    expect(rpc).toHaveBeenCalledWith("student_check_in", { p_method: "QR", p_code: "A1B2", p_photo: null, p_latitude: 25.9, p_longitude: 85.3 });

    rpc.mockResolvedValueOnce({ data: null, error: { message: "INVALID: This QR has expired or is not your centre's." } });
    await expect(studentCheckIn("QR", { code: "OLD" })).rejects.toThrow("This QR has expired or is not your centre's.");

    rpc.mockResolvedValueOnce({ data: { date: "2026-10-24", status: "PRESENT", alreadyMarked: false }, error: null });
    await studentCheckIn("SELFIE", { photo: "data:image/jpeg;base64,/9j/" });
    expect(rpc.mock.calls.at(-1)?.[1]).toMatchObject({ p_method: "SELFIE", p_photo: { dataUrl: "data:image/jpeg;base64,/9j/" } });

    rpc.mockResolvedValueOnce({ data: null, error: { code: "PGRST202", message: "Could not find the function" } });
    await expect(newAttendanceQr("b1")).rejects.toThrow(/self-attendance.sql/);
  });
});

/* ---------- the student portal ---------- */

const toast = vi.fn();
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast }) }));
vi.mock("@/components/layout/AppLayout", () => ({ AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "u1", name: "Rahul", branchId: "b1", organizationId: "org1" }, view: "student" }),
}));
let attendanceDays: unknown[] = [];
vi.mock("@/lib/supabase/data", () => ({
  getStudentPortalAttendance: () => Promise.resolve({ data: attendanceDays }),
  getPortalRequests: () => Promise.resolve({ data: [] }),
  submitPortalRequest: vi.fn(),
  getBranches: () => Promise.resolve({ data: [] }),
}));

const { default: MyAttendance } = await import("@/pages/portal/MyAttendance");

describe("My Attendance", () => {
  it("offers today's check-in, and a photo instead when the camera cannot open", async () => {
    attendanceDays = [];
    render(<MemoryRouter><MyAttendance /></MemoryRouter>);
    expect(await screen.findByText("Today's attendance")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Scan QR" }));
    expect(await screen.findByText("Scan the centre's QR")).toBeInTheDocument();
    // jsdom has no camera, as an old phone would not.
    expect(await screen.findByText(/cannot open the camera/)).toBeInTheDocument();
    expect(screen.getByLabelText("Photo of the QR")).toHaveAttribute("capture", "environment");
  });

  it("shows today as marked instead of the buttons", async () => {
    const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
    attendanceDays = [{ id: "a1", date: today, status: "PRESENT" }];
    render(<MemoryRouter><MyAttendance /></MemoryRouter>);
    expect(await screen.findByText("Marked present for today.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Scan QR" })).toBeNull();
  });
});

/* ---------- the centre's screen ---------- */

vi.mock("@/lib/supabase/examAttendance", () => ({
  listStudents: () => Promise.resolve([{ id: "s1", firstName: "Rahul", lastName: "Kumar", enrollmentNo: "E1" }]),
}));

describe("QR Attendance", () => {
  it("shows the centre a fresh QR and today's check-ins with their selfies", async () => {
    rpc.mockResolvedValue({ data: { code: "A1B2C3D4E5", validUntil: new Date(Date.now() + 90000).toISOString() }, error: null });
    fromRows.attendance_checkins = [
      { id: "c1", studentId: "s1", date: "2026-10-24", method: "SELFIE", photo: { dataUrl: "data:image/jpeg;base64,/9j/" }, latitude: 25.9, longitude: 85.3, createdAt: "2026-10-24T04:00:00Z" },
    ];
    const { default: AttendanceQr } = await import("@/pages/attendance/AttendanceQr");
    // A centre login: its own centre, no picker.
    render(<MemoryRouter><AttendanceQr /></MemoryRouter>);
    await waitFor(() => expect(rpc).toHaveBeenCalledWith("new_attendance_qr", { p_branch_id: "b1", p_by: "Rahul" }));
    expect(await screen.findByRole("img", { name: "Attendance QR" })).toHaveAttribute("src", expect.stringMatching(/^data:image\/png/));
    expect(await screen.findByText("Rahul Kumar")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Selfie of Rahul Kumar" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Where Rahul Kumar checked in" })).toHaveAttribute("href", "https://www.google.com/maps?q=25.9,85.3");
  });
});
