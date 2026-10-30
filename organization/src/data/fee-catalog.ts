/**
 * The fee catalogue shared by /fee/types and /fee/groups: a group is built out
 * of fee types, so both screens have to read the same persisted lists or a fee
 * type added on one page is invisible on the other.
 */

export interface FeeType {
  id: string;
  name: string;
  code: string;
  category: string;
  defaultAmount: number;
  frequency: string;
  applicableTo: string[];
  description: string;
  status: "active" | "inactive";
}

export interface FeeGroup {
  id: string;
  name: string;
  description: string;
  feeTypes: string[];
  totalAmount: number;
  courses: string[];
  studentsCount: number;
  status: "active" | "inactive";
}

export const FEE_TYPES_KEY = "erp-fee-types";
export const FEE_GROUPS_KEY = "erp-fee-groups";

export const FEE_TYPE_SEED: FeeType[] = [
  { id: "1", name: "Tuition Fee", code: "TF001", category: "Academic", defaultAmount: 50000, frequency: "Yearly", applicableTo: ["All Courses"], description: "Main academic tuition fee", status: "active" },
  { id: "2", name: "Admission Fee", code: "AF001", category: "One-time", defaultAmount: 5000, frequency: "One-time", applicableTo: ["All Courses"], description: "One-time admission processing fee", status: "active" },
  { id: "3", name: "Exam Fee", code: "EF001", category: "Academic", defaultAmount: 2000, frequency: "Per Semester", applicableTo: ["All Courses"], description: "Examination and assessment fee", status: "active" },
  { id: "4", name: "Lab Fee", code: "LF001", category: "Academic", defaultAmount: 3000, frequency: "Yearly", applicableTo: ["Computer Science", "Engineering", "Science"], description: "Laboratory equipment and materials", status: "active" },
  { id: "5", name: "Library Fee", code: "LIB001", category: "Facility", defaultAmount: 2000, frequency: "Yearly", applicableTo: ["All Courses"], description: "Library access and resources", status: "active" },
  { id: "6", name: "Sports Fee", code: "SF001", category: "Facility", defaultAmount: 1500, frequency: "Yearly", applicableTo: ["All Courses"], description: "Sports facilities and activities", status: "active" },
  { id: "7", name: "Transport Fee", code: "TRF001", category: "Optional", defaultAmount: 12000, frequency: "Yearly", applicableTo: ["All Courses"], description: "School bus transportation", status: "active" },
  { id: "8", name: "Hostel Fee", code: "HF001", category: "Optional", defaultAmount: 60000, frequency: "Yearly", applicableTo: ["All Courses"], description: "Hostel accommodation charges", status: "inactive" },
  { id: "9", name: "Re-Exam Fee", code: "REF001", category: "Academic", defaultAmount: 500, frequency: "Per Exam", applicableTo: ["All Courses"], description: "Fee for re-examination attempts", status: "active" },
  { id: "10", name: "Re-Admission Fee", code: "RAF001", category: "One-time", defaultAmount: 2500, frequency: "One-time", applicableTo: ["All Courses"], description: "Fee for re-admission after discontinuation", status: "active" },
];

export const FEE_GROUP_SEED: FeeGroup[] = [
  { id: "1", name: "Standard Fee Package", description: "Regular student fee structure", feeTypes: ["Tuition Fee", "Admission Fee", "Exam Fee", "Library Fee"], totalAmount: 59000, courses: ["All Courses"], studentsCount: 450, status: "active" },
  { id: "2", name: "Science Stream Package", description: "Fee structure for science students", feeTypes: ["Tuition Fee", "Admission Fee", "Exam Fee", "Library Fee", "Lab Fee"], totalAmount: 62000, courses: ["Computer Science", "Engineering", "Science"], studentsCount: 280, status: "active" },
  { id: "3", name: "Hostel Student Package", description: "Complete package with hostel", feeTypes: ["Tuition Fee", "Admission Fee", "Exam Fee", "Library Fee", "Hostel Fee"], totalAmount: 119000, courses: ["All Courses"], studentsCount: 85, status: "active" },
  { id: "4", name: "Day Scholar with Transport", description: "Day scholar with bus facility", feeTypes: ["Tuition Fee", "Admission Fee", "Exam Fee", "Library Fee", "Transport Fee"], totalAmount: 71000, courses: ["All Courses"], studentsCount: 120, status: "active" },
  { id: "5", name: "Merit Scholarship Package", description: "Reduced fee for merit students", feeTypes: ["Tuition Fee", "Exam Fee", "Library Fee"], totalAmount: 54000, courses: ["All Courses"], studentsCount: 25, status: "active" },
];

export const FEE_CATEGORIES = ["Academic", "Facility", "One-time", "Optional"];

export const FEE_FREQUENCIES = [
  "One-time",
  "Monthly",
  "Quarterly",
  "Per Semester",
  "Yearly",
  "Per Exam",
];

export const COURSE_OPTIONS = [
  "All Courses",
  "Computer Science",
  "Engineering",
  "Commerce",
  "Science",
];

/** "Tuition Fee" → "TF"; used when a new fee type needs a code suggestion. */
export const suggestCode = (name: string, existing: FeeType[]) => {
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word[0]?.toUpperCase() ?? "")
      .join("")
      .slice(0, 3) || "FEE";
  let counter = 1;
  let code = `${initials}${String(counter).padStart(3, "0")}`;
  while (existing.some((f) => f.code.toUpperCase() === code)) {
    counter += 1;
    code = `${initials}${String(counter).padStart(3, "0")}`;
  }
  return code;
};
