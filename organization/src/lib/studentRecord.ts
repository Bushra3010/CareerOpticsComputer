/** One student row as `getStudents` returns it, for the card and admit-card printers. */
export type StudentRecord = Record<string, unknown> & {
  id?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  enrollmentNo?: string;
  applicationNo?: string;
  rollNo?: string;
  fatherName?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  phone?: string;
  academicYear?: string;
  documents?: Record<string, { dataUrl?: string }> | null;
  photo?: unknown;
};

/** The face the admission collected, or the one an older record kept. */
export function photoOf(student: StudentRecord): string {
  const fromDocuments = student.documents?.passportPhoto?.dataUrl;
  if (fromDocuments) return fromDocuments;
  const own = student.photo;
  if (typeof own === "string") return own;
  if (own && typeof own === "object") {
    const found = (own as Record<string, unknown>).dataUrl;
    if (typeof found === "string") return found;
  }
  return "";
}
