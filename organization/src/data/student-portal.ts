/**
 * The shapes the student portal reads its own record into, and the sums it
 * shows over them. The records themselves come from the database
 * (getStudentProfile, getStudentAttendance … in lib/supabase/data.ts).
 */
import type { StudentDocument } from "@/lib/documents";
import type { IdCardStudent } from "@/data/id-card-templates";
import type { AdmitCardStudent } from "@/data/admit-card-templates";

export interface StudentProfile {
  id: string;
  name: string;
  enrollmentNo: string;
  rollNo: string;
  course: string;
  /** `courses.code`, shown beside the name so a short course name is not
   *  mistaken for a code. */
  courseCode: string;
  /** `courses.baseFee` — what the course costs. This is the total the student
   *  is measured against until invoices are raised, and it is what lets their
   *  own login show the same three figures the branch roster shows. */
  courseFee: number;
  batch: string;
  section: string;
  branch: string;
  email: string;
  phone: string;
  /** The student's own WhatsApp number — `students.whatsappNumber`. */
  whatsapp: string;
  guardian: string;
  /** "Son of" / "Daughter of" / "Wife of", against `guardian`. */
  parentage: string;
  /** The father's / guardian's number — `students.fatherPhone`, never the student's. */
  guardianPhone: string;
  address: string;
  dob: string;
  bloodGroup: string;
  admissionDate: string;
  photo: string | null;
}

export interface AttendanceDay {
  id: string;
  /** `YYYY-MM-DD`. */
  date: string;
  subject: string;
  status: "present" | "absent" | "late" | "holiday";
}

export interface PortalInvoice {
  id: string;
  invoiceNo: string;
  description: string;
  amount: number;
  paid: number;
  dueDate: string;
  method?: string;
  paidAt?: string;
  receiptNo?: string;
}

export interface PortalResult {
  id: string;
  exam: string;
  subject: string;
  maxMarks: number;
  passMarks: number;
  marks: number;
  examDate: string;
}

export interface PortalClass {
  id: string;
  subject: string;
  topic: string;
  faculty: string;
  platform: string;
  link: string;
  /** ISO timestamp of the start. */
  startsAt: string;
  minutes: number;
  recording?: string;
}

export interface PortalRequest {
  id: string;
  kind: string;
  detail: string;
  raisedAt: string;
  status: "open" | "resolved";
}

const DAY = 86_400_000;
/** `YYYY-MM-DD`, `offset` days from today. */
const isoDate = (offset: number) => new Date(Date.now() + offset * DAY).toISOString().slice(0, 10);

export const REQUEST_KINDS = [
  "Attendance correction",
  "Fee receipt copy",
  "Bonafide certificate",
  "Batch or timing change",
  "Other",
];

/* ---------- derived summaries, shared by the dashboard and its pages ---------- */

export const attendanceSummary = (days: AttendanceDay[]) => {
  const counted = days.filter((day) => day.status !== "holiday");
  const present = counted.filter((day) => day.status === "present").length;
  const late = counted.filter((day) => day.status === "late").length;
  const absent = counted.filter((day) => day.status === "absent").length;
  // A late mark still counts as attended — it is a punctuality flag, not an absence.
  const percentage = counted.length ? Math.round(((present + late) / counted.length) * 1000) / 10 : 0;
  return { total: counted.length, present, late, absent, percentage };
};

export const feeSummary = (invoices: PortalInvoice[]) => {
  const billed = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const paid = invoices.reduce((sum, invoice) => sum + invoice.paid, 0);
  const today = isoDate(0);
  const overdue = invoices
    .filter((invoice) => invoice.paid < invoice.amount && invoice.dueDate < today)
    .reduce((sum, invoice) => sum + (invoice.amount - invoice.paid), 0);
  return { billed, paid, due: billed - paid, overdue };
};

export const resultSummary = (results: PortalResult[]) => {
  const scored = results.reduce((sum, result) => sum + result.marks, 0);
  const max = results.reduce((sum, result) => sum + result.maxMarks, 0);
  const failed = results.filter((result) => result.marks < result.passMarks).length;
  return {
    scored,
    max,
    percentage: max ? Math.round((scored / max) * 1000) / 10 : 0,
    failed,
    exams: [...new Set(results.map((result) => result.exam))],
  };
};

export const invoiceStatus = (invoice: PortalInvoice) =>
  invoice.paid >= invoice.amount
    ? "paid"
    : invoice.dueDate < isoDate(0)
      ? "overdue"
      : invoice.paid > 0
        ? "partial"
        : "pending";

export const money = (value: number) => `₹${value.toLocaleString("en-IN")}`;

export const classState = (item: PortalClass): "live" | "upcoming" | "completed" => {
  const start = new Date(item.startsAt).getTime();
  const end = start + item.minutes * 60_000;
  const now = Date.now();
  return now < start ? "upcoming" : now <= end ? "live" : "completed";
};

/* ---------- adapters onto the shapes the shared generators already take ---------- */

/** The portal reuses the staff-side PDF generators rather than growing its own. */
export const asStudentDocument = (
  profile: StudentProfile,
  invoices: PortalInvoice[],
  results: PortalResult[],
): StudentDocument => {
  const [firstName, ...rest] = profile.name.split(" ");
  return {
    firstName,
    lastName: rest.join(" "),
    enrollmentNo: profile.enrollmentNo,
    applicationNo: profile.id,
    admissionDate: profile.admissionDate,
    // The marksheet's particulars block reads these; without them a student
    // downloading their own statement of marks gets a row of dashes.
    rollNo: profile.rollNo,
    fatherName: profile.guardian,
    parentage: profile.parentage,
    dateOfBirth: profile.dob,
    photo: profile.photo,
    course: { name: profile.course, code: profile.courseCode || undefined },
    batch: { name: profile.batch },
    branch: {
      name: profile.branch,
      phone: "+91 20 4004 1100",
      email: "kothrud@careeroptics.in",
      organization: { name: "Career Optics Computer Academy" },
    },
    feeInvoices: invoices.map((invoice) => ({
      invoiceNo: invoice.invoiceNo,
      description: invoice.description,
      amount: invoice.amount,
      payments: invoice.receiptNo
        ? [{ receiptNo: invoice.receiptNo, amount: invoice.paid, method: invoice.method ?? "Cash", paidAt: invoice.paidAt ?? invoice.dueDate }]
        : [],
    })),
    examResults: results.map((result) => ({
      marks: result.marks,
      exam: {
        name: result.exam,
        subject: result.subject,
        maxMarks: result.maxMarks,
        passMarks: result.passMarks,
        examDate: result.examDate,
      },
    })),
  };
};

export const asIdCardStudent = (profile: StudentProfile): IdCardStudent => ({
  id: profile.id,
  name: profile.name,
  class: profile.course,
  section: profile.section,
  rollNo: profile.rollNo,
  photo: Boolean(profile.photo),
  dob: profile.dob,
  bloodGroup: profile.bloodGroup,
  parentContact: profile.guardianPhone,
  address: profile.address,
});

export const asAdmitCardStudent = (
  profile: StudentProfile,
  feeStatus: AdmitCardStudent["feeStatus"] = "paid",
): AdmitCardStudent => ({
  id: profile.id,
  name: profile.name,
  class: profile.course,
  section: profile.section,
  rollNo: profile.rollNo,
  feeStatus,
});
