/**
 * The one place a `students` row becomes the profile the portal renders.
 *
 * Six portal screens read the signed-in student's record, and each one was
 * written against the flat response the old api-server sent -- `name`,
 * `course`, `branch` -- while Supabase returns the table's own columns. Every
 * one of those screens printed blanks, and the dashboard crashed outright once
 * the course lookup started arriving as `{ name }`, because React will not
 * render an object as a child.
 *
 * So the mapping lives here and `getStudentProfile` applies it, rather than
 * each page being trusted to remember.
 */
import { format } from "date-fns";
import { amount } from "@/lib/fees";
import type { StudentProfile } from "@/data/student-portal";

/**
 * A `students` row as Supabase returns it, with the three lookups
 * `getStudentProfile` embeds.
 *
 * The columns are the table's own -- `firstName`/`lastName` rather than a
 * `name`, `streetAddress`/`city`/... rather than an `address`, and a `course`
 * that is a joined row rather than a name.
 */
export interface StudentRow {
  id: string;
  enrollmentNo?: string | null;
  applicationNo?: string | null;
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  rollNo?: string | null;
  section?: string | null;
  email?: string | null;
  phone?: string | null;
  whatsappNumber?: string | null;
  streetAddress?: string | null;
  city?: string | null;
  district?: string | null;
  block?: string | null;
  state?: string | null;
  pincode?: string | null;
  dateOfBirth?: string | null;
  bloodGroup?: string | null;
  admissionDate?: string | null;
  photo?: unknown;
  fatherName?: string | null;
  parentage?: string | null;
  fatherPhone?: string | null;
  course?: { name?: string | null; code?: string | null; baseFee?: number | string | null } | null;
  batch?: { name?: string | null } | null;
  branch?: { name?: string | null } | null;
}

const text = (value: unknown) => (value == null ? "" : String(value));

/**
 * `students.photo` is a JSONB column, so it can hold a bare data URL from an
 * older upload or an object from a newer one. The avatar needs a string or
 * nothing -- handing it an object renders `[object Object]` as the image src.
 */
function photoSrc(value: unknown): string | null {
  if (typeof value === "string") return value || null;
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    for (const key of ["url", "dataUrl", "src", "path"]) {
      const found = record[key];
      if (typeof found === "string" && found) return found;
    }
  }
  return null;
}

/** The date columns are timestamps; the profile shows a day, not an instant. */
function asDay(value: unknown): string {
  const raw = text(value);
  if (!raw) return "";
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? raw : format(parsed, "d MMM yyyy");
}

/**
 * The students row as the portal reads it.
 *
 * Which column feeds which field is the whole point of this function, so it is
 * separate and tested: `whatsappNumber` used to be mapped onto `guardianPhone`,
 * which put the student's own line under "Guardian mobile" and printed it as
 * the parent contact on their ID card, since `asIdCardStudent` reads that same
 * field.
 *
 * Every value it returns is a string, a number or null -- never a joined row.
 * That is not incidental: the portal pages drop these straight into JSX, and
 * React throws on an object child.
 */
export function toStudentProfile(row: StudentRow): StudentProfile {
  const name =
    [row.firstName, row.middleName, row.lastName].filter(Boolean).join(" ").trim() || "Student";
  const phone = text(row.phone);

  return {
    id: text(row.id),
    name,
    // A student admitted but not yet enrolled has only an application number,
    // and that is what their paperwork carries until the enrolment is issued.
    enrollmentNo: text(row.enrollmentNo) || text(row.applicationNo),
    rollNo: text(row.rollNo),
    course: text(row.course?.name),
    courseCode: text(row.course?.code),
    // The one number on the profile. The portal needs it to tell the student
    // what their course costs before any invoice has been raised against them.
    courseFee: amount(row.course?.baseFee),
    batch: text(row.batch?.name),
    section: text(row.section),
    branch: text(row.branch?.name),
    email: text(row.email),
    phone,
    // A student who left the WhatsApp box blank still uses WhatsApp on the
    // mobile they gave at admission.
    whatsapp: text(row.whatsappNumber) || phone,
    guardian: text(row.fatherName),
    parentage: text(row.parentage),
    guardianPhone: text(row.fatherPhone),
    address: [row.streetAddress, row.city, row.block, row.district, row.state, row.pincode]
      .filter(Boolean)
      .join(", "),
    dob: asDay(row.dateOfBirth),
    bloodGroup: text(row.bloodGroup),
    admissionDate: asDay(row.admissionDate),
    photo: photoSrc(row.photo),
  };
}
