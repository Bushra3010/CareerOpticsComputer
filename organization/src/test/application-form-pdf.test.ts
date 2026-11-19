import { describe, it, expect } from "vitest";
import { buildAdmissionPdf, type StudentDocument } from "@/lib/documents";

/** The application form a centre prints from the student's page. */

const student: StudentDocument = {
  firstName: "Asha",
  lastName: "Kumari",
  applicationNo: "APP-2026-0042",
  enrollmentNo: "ENR-42",
  admissionDate: "2026-07-15",
  fatherName: "Ram Kumar",
  parentage: "Daughter of",
  session: "2026-27",
  course: { name: "ADCA", code: "ADCA", duration: "12 months" },
  branch: { name: "Ara Centre", code: "COCA/BR/AR/001", phone: "8252532179", email: "c@x.in", organization: { name: "x" } },
  applicant: {
    motherName: "Sita Devi",
    aadharNumber: "1234 5678 9012",
    phone: "9876543210",
    city: "Ara",
    tenthBoard: "BSEB",
    tenthPercentage: "78",
  },
  feeInvoices: [],
  examResults: [],
};

const text = (s: StudentDocument) => buildAdmissionPdf(s).output();

describe("Application form", () => {
  it("prints the particulars the admission collected", () => {
    const out = text(student);
    for (const v of ["ADMISSION / APPLICATION FORM", "APP-2026-0042", "ASHA KUMARI", "Sita Devi", "9876543210", "BSEB", "ATC Code: COCA/BR/AR/001", "Daughter of"]) {
      expect(out).toContain(v);
    }
  });

  it("prints only the last four digits of the Aadhaar number", () => {
    const out = text(student);
    expect(out).toContain("XXXX XXXX 9012");
    expect(out).not.toContain("1234 5678");
  });

  it("still prints for a record with none of the extra details", () => {
    const out = text({ ...student, applicant: undefined });
    expect(out).toContain("ASHA KUMARI");
    expect(out).toContain("Signature of Student");
  });
});
