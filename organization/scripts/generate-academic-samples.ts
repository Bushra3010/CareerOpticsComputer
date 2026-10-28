/** Sample PDFs built with the application's generators and synthetic data. */
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import QRCode from "qrcode";
import { certificatePdf, marksheetPdf, type StudentDocument } from "../src/lib/documents";
import { admitCardsPdf } from "../src/lib/admit-card-pdf";
async function main() {
  const output = resolve(process.cwd(), "../output/pdf"); mkdirSync(output, { recursive: true }); process.chdir(output);
  const student: StudentDocument = {
    firstName: "Asha", lastName: "Verma", enrollmentNo: "SAMPLE-2026-001", rollNo: "101",
    admissionDate: "2026-01-01", issueDate: "2026-10-12", examinationDate: "2026-10-01",
    fatherName: "Raj Verma", parentage: "Daughter of", session: "2026-27",
    course: { name: "Advanced Diploma in Computer Applications", code: "ADCA", duration: "12 months" },
    batch: { name: "Morning Batch" },
    branch: { name: "Demo Training Centre, Patna", phone: "", email: "", address: "Patna, Bihar", organization: { name: "Demo Training Institute" } },
    feeInvoices: [], examResults: [
      { marks: 85, exam: { name: "Final Examination", subject: "Computer Fundamentals - Theory", maxMarks: 100, passMarks: 40, examDate: "2026-10-01" } },
      { marks: 45, exam: { name: "Final Examination", subject: "Office Applications - Practical", maxMarks: 50, passMarks: 20, examDate: "2026-10-02" } },
    ],
  };
  await certificatePdf(student); await marksheetPdf(student);
  admitCardsPdf({ id: "sample", name: "Sample admit card", exam: "e1", status: "active", size: "a4",
    showQr: true, showPhoto: true, showSchedule: true, elements: ["Student Name", "Roll Number", "Class & Section", "Exam Name", "Exam Date", "Instructions"],
    institute: { name: student.branch.organization.name, address: student.branch.address! },
    liveExam: { value: "e1", label: "Final Examination", window: "01 Oct 2026", schedule: [{ subject: "Computer Fundamentals - Theory", when: "01 Oct 2026" }] },
  }, [{ id: "s1", name: "Asha Verma", class: "Morning Batch", section: "A", rollNo: "101", feeStatus: "paid", qr: await QRCode.toDataURL("enrollment:SAMPLE-2026-001") }], "sample-admit-card.pdf");
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
