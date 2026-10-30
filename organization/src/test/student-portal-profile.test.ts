import { describe, it, expect } from "vitest";

import { asIdCardStudent } from "@/data/student-portal";
import { toStudentProfile, type StudentRow } from "@/lib/student-profile";

/** A students row shaped the way Supabase actually returns one. */
const row = (overrides: Partial<StudentRow> = {}): StudentRow =>
  ({
    id: "s1",
    enrollmentNo: "PNS/2026/001",
    applicationNo: "APP-2026-0001",
    firstName: "Aarav",
    middleName: null,
    lastName: "Sharma",
    rollNo: "2201",
    section: "A",
    email: "aarav@example.com",
    phone: "+91 98220 41100",
    whatsappNumber: "+91 90000 00001",
    streetAddress: "24 Shivaji Nagar",
    city: "Pune",
    district: null,
    state: "Maharashtra",
    pincode: "411005",
    dateOfBirth: "2007-03-12T00:00:00.000Z",
    bloodGroup: "B+",
    admissionDate: "2026-01-04T00:00:00.000Z",
    photo: null,
    fatherName: "Rajesh Sharma",
    fatherPhone: "+91 98220 41199",
    course: { name: "ADCA" },
    batch: { name: "2026-A" },
    branch: { name: "Kothrud" },
    ...overrides,
  }) as StudentRow;

describe("toStudentProfile", () => {
  it("keeps the student's numbers on the student and the father's on the guardian", () => {
    const profile = toStudentProfile(row());

    expect(profile.phone).toBe("+91 98220 41100");
    expect(profile.whatsapp).toBe("+91 90000 00001");
    // The regression this guards: whatsappNumber used to be written here.
    expect(profile.guardianPhone).toBe("+91 98220 41199");
    expect(profile.guardian).toBe("Rajesh Sharma");
  });

  it("falls back to the mobile when the student never filled the WhatsApp box", () => {
    expect(toStudentProfile(row({ whatsappNumber: "" })).whatsapp).toBe("+91 98220 41100");
  });

  it("leaves the guardian number blank rather than borrowing the student's", () => {
    expect(toStudentProfile(row({ fatherPhone: "" })).guardianPhone).toBe("");
  });

  it("prints the father on the ID card, which reads the guardian field", () => {
    const card = asIdCardStudent(toStudentProfile(row()));
    expect(card.parentContact).toBe("+91 98220 41199");
  });

  // The bug this file now covers: the row was typed as the old api-server's
  // flat response, so `name` came back undefined and the page died rendering
  // the avatar initials.
  it("builds the name from the row's own name columns", () => {
    expect(toStudentProfile(row()).name).toBe("Aarav Sharma");
    expect(toStudentProfile(row({ middleName: "Kumar" })).name).toBe("Aarav Kumar Sharma");
  });

  it("never returns an empty name, so the avatar initials cannot throw", () => {
    const profile = toStudentProfile(row({ firstName: null, middleName: null, lastName: null }));
    expect(profile.name).toBe("Student");
  });

  it("resolves course, batch and branch through the embedded lookups", () => {
    const profile = toStudentProfile(row());
    expect(profile.course).toBe("ADCA");
    expect(profile.batch).toBe("2026-A");
    expect(profile.branch).toBe("Kothrud");
  });

  it("carries the course fee, which is what the portal measures a balance against", () => {
    expect(toStudentProfile(row({ course: { name: "ADCA", baseFee: 24000 } })).courseFee).toBe(24000);
    // A course with no fee on it is zero, never NaN -- that reached the page as "₹NaN".
    expect(toStudentProfile(row({ course: { name: "ADCA" } })).courseFee).toBe(0);
    expect(toStudentProfile(row({ course: null })).courseFee).toBe(0);
  });

  it("leaves them blank rather than printing ids when nothing is assigned", () => {
    const profile = toStudentProfile(row({ course: null, batch: null, branch: null }));
    expect(profile.course).toBe("");
    expect(profile.batch).toBe("");
  });

  // The dashboard drops these fields straight into JSX, and React throws
  // "Objects are not valid as a React child" on any one of them that is still
  // a joined row -- which is how the student portal went down: `course` reached
  // it as `{ name: "ADCA" }` and took the whole page with it.
  it("returns nothing a page could not render, for every field", () => {
    const profile = toStudentProfile(row());

    // Strings and numbers both render; a joined row is what killed the page.
    for (const [key, value] of Object.entries(profile)) {
      expect(
        value === null || typeof value === "string" || typeof value === "number",
        `${key} is a ${typeof value}, which React cannot render`,
      ).toBe(true);
    }
  });

  it("joins the address out of the columns the row actually has", () => {
    expect(toStudentProfile(row()).address).toBe("24 Shivaji Nagar, Pune, Maharashtra, 411005");
  });

  it("shows the timestamps as days", () => {
    const profile = toStudentProfile(row());
    expect(profile.dob).toBe("12 Mar 2007");
    expect(profile.admissionDate).toBe("4 Jan 2026");
  });

  it("falls back to the application number until an enrolment number is issued", () => {
    expect(toStudentProfile(row({ enrollmentNo: null })).enrollmentNo).toBe("APP-2026-0001");
  });

  // photo is JSONB, so it can arrive as either shape; the avatar needs a string.
  it("reads a photo out of either the string or the object form", () => {
    expect(toStudentProfile(row({ photo: "data:image/png;base64,AAA" })).photo).toBe(
      "data:image/png;base64,AAA",
    );
    expect(toStudentProfile(row({ photo: { url: "https://cdn/x.png" } })).photo).toBe(
      "https://cdn/x.png",
    );
    expect(toStudentProfile(row({ photo: { name: "x.png" } })).photo).toBeNull();
  });
});
