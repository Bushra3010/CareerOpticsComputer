import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Online admission: a student applies at their centre with documents; the
 * application waits for that centre's admin, who approves it.
 */
const rpc = vi.fn();
vi.mock("@/lib/supabase/client", () => ({ supabase: { rpc: (...a: unknown[]) => rpc(...a) } }));
// jsdom cannot decode images, so the photo shrink is stood in for.
vi.mock("@/lib/supabase/onlineAdmission", async (importOriginal) => {
  const real = await importOriginal<typeof import("@/lib/supabase/onlineAdmission")>();
  return {
    ...real,
    readDocument: async (file: File) =>
      file.type === "application/pdf"
        ? { name: file.name, dataUrl: "data:application/pdf;base64,AQID" }
        : { name: file.name.replace(/\.[^.]+$/, "") + ".jpg", dataUrl: "data:image/jpeg;base64,AQID" },
  };
});

const { default: OnlineAdmission } = await import("@/pages/public/OnlineAdmission");

const respond = (fn: string, body: Record<string, unknown>) => {
  if (fn === "public_centres") return { data: [{ id: "b1", name: "Digi skill Hub PVT LTD", city: "Rasidpur", district: "Begusarai", state: "Bihar" }], error: null };
  if (fn === "public_branch_courses") return { data: [{ id: "c1", name: "ADCA" }], error: null };
  if (fn === "submit_online_admission") return { data: { applicationNo: "APP-2026-0020", centre: "Digi skill Hub PVT LTD", duplicate: false }, error: null };
  if (fn === "online_admission_status") return { data: { status: "SUBMITTED", applicationNo: body.p_application_no, name: "Rahul Kumar", centre: "Digi skill Hub PVT LTD" }, error: null };
  return { data: null, error: { message: "unexpected" } };
};

beforeEach(() => {
  rpc.mockReset();
  rpc.mockImplementation((fn: string, body: Record<string, unknown>) => Promise.resolve(respond(fn, body)));
});

const type = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
const choose = async (label: string, option: string) => {
  fireEvent.keyDown(screen.getByRole("combobox", { name: label }), { key: "Enter" });
  fireEvent.click(await screen.findByRole("option", { name: option }));
};
const upload = async (label: string, name: string, type: string) => {
  const file = new File([new Uint8Array([1, 2, 3])], name, { type });
  fireEvent.change(screen.getByLabelText(`Upload ${label}`), { target: { files: [file] } });
  await screen.findByText(name.replace(/\.(png|jpeg)$/, ".jpg"));
};

describe("online admission form", () => {
  it("takes an application with its documents to the chosen centre", async () => {
    // From the website: centre, course, name and mobile already filled.
    render(<MemoryRouter initialEntries={["/apply?centre=b1&course=ADCA&name=Rahul%20Kumar&phone=9876543210"]}><OnlineAdmission /></MemoryRouter>);
    await waitFor(() => expect(screen.getByRole("combobox", { name: "Course" })).toHaveTextContent("ADCA"));
    expect(screen.getByRole("combobox", { name: "Centre" })).toHaveTextContent("Digi skill Hub PVT LTD");
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    expect((screen.getByLabelText("First name") as HTMLInputElement).value).toBe("Rahul");
    expect((screen.getByLabelText("Last name") as HTMLInputElement).value).toBe("Kumar");
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Enter your date of birth.");
    type("Date of birth", "2007-05-01");
    await choose("Gender", "Male");
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    type("Father's name", "Ram Kumar");
    type("Mother's name", "Sita Devi");
    type("Address (house, street, village)", "Main Road");
    type("City / town", "Begusarai");
    type("Pincode", "851101");
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    // The photo and Aadhaar are required.
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Passport-size photo, Aadhaar card (front)");
    await upload("Passport-size photo", "me.png", "image/png");
    await upload("Aadhaar card (front)", "aadhaar.pdf", "application/pdf");
    await upload("Fee payment screenshot", "upi.png", "image/png");
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    expect(screen.getByText("Passport-size photo, Aadhaar card (front), Fee payment screenshot")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Submit application" }));
    expect(await screen.findByText("APP-2026-0020")).toBeInTheDocument();
    expect(screen.getByText(/will check your documents and confirm your admission/)).toBeInTheDocument();

    const [, args] = rpc.mock.calls.find(([fn]) => fn === "submit_online_admission") as [string, Record<string, unknown>];
    expect(args).toMatchObject({
      p_branch_id: "b1",
      p_course_id: "c1",
      p_student: expect.objectContaining({ firstName: "Rahul", lastName: "Kumar", dateOfBirth: "2007-05-01", gender: "MALE", phone: "9876543210", fatherName: "Ram Kumar", state: "Bihar", pincode: "851101" }),
    });
    const docs = args.p_documents as Record<string, { name: string; dataUrl: string }>;
    expect(Object.keys(docs).sort()).toEqual(["aadharCardFront", "passportPhoto", "paymentProof"]);
    expect(docs.aadharCardFront.dataUrl).toMatch(/^data:application\/pdf;base64,/);
  });

  it("shows an applicant where their application stands", async () => {
    render(<MemoryRouter initialEntries={["/apply"]}><OnlineAdmission /></MemoryRouter>);
    type("Application number", "APP-2026-0020");
    type("Mobile number used", "9876543210");
    fireEvent.click(screen.getByRole("button", { name: /Check/ }));
    expect(await screen.findByText("Submitted — your centre is checking your documents.")).toBeInTheDocument();
    expect(screen.getByText("Rahul Kumar · APP-2026-0020 · Digi skill Hub PVT LTD")).toBeInTheDocument();
  });
});
