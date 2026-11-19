import { describe, it, expect, vi } from "vitest";
import { jsPDF } from "jspdf";
import type { StudentDocument } from "@/lib/documents";

/**
 * The student's application form is the academy's own admission form with
 * the student's details written in. No artwork or fonts are served here, so
 * the text lands in Helvetica and can be read back from the file.
 */
vi.stubGlobal("fetch", async () => ({ ok: false, status: 404, arrayBuffer: async () => new ArrayBuffer(0), blob: async () => new Blob([]) }));

const { drawAdmissionForm } = await import("@/lib/brand/brandDocuments");

const student: StudentDocument = {
  firstName: "MOHAN",
  lastName: "KUMAR",
  enrollmentNo: "COCA/2026/00103",
  admissionDate: "2026-11-19",
  fatherName: "RAM KUMAR",
  parentage: "Son of",
  dateOfBirth: "12 Feb 2015",
  course: { name: "Diploma in Computer Application", duration: "6 months" },
  branch: { name: "Ara Centre", code: "COCA/BR/AR/001", phone: "", email: "", organization: { name: "x" } },
  applicant: { gender: "MALE", category: "OBC", phone: "9876543210", aadharNumber: "123456789012", district: "Bhojpur", motherName: "MOTI DEVI", tenthBoard: "BSEB" },
  feeInvoices: [],
  examResults: [],
};

const render = async (s?: StudentDocument) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  await drawAdmissionForm(doc, { centreName: "Ara Centre", centreCode: "COCA/BR/AR/001", student: s });
  return doc.output();
};

describe("Application form", () => {
  it("fills the academy's admission form with the student's details", async () => {
    const out = await render(student);
    for (const v of ["Diploma in Computer Application", "COCA/2026/00103", "19/11/2026", "6 months", "MOHAN KUMAR", "Bhojpur", "BSEB", "Son of :"]) {
      expect(out).toContain(v);
    }
    // One letter to a box, the date of birth and mobile one digit to a box.
    expect(out).toContain("(M)");
    expect(out).toContain("(9)");
  });

  it("prints only the last four digits of the Aadhaar number", async () => {
    const out = await render(student);
    expect(out).toContain("XXXX XXXX 9012");
    expect(out).not.toContain("123456789012");
  });

  it("is still the blank form when no student is given", async () => {
    const out = await render();
    expect(out).toContain("Paste recent");
    expect(out).not.toContain("COCA/2026/00103");
  });
});
