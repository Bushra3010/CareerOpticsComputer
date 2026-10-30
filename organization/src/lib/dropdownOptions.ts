/**
 * User-editable option lists for the pickers around the app.
 *
 * Every list here used to be a hard-coded array, so an institute that admits a
 * category, board or stream the code never heard of had no way to record it.
 * Each list is now `defaults` plus whatever the organisation has saved in
 * `dropdown_options`, and admins add, rename and remove entries from the picker
 * itself.
 *
 * Only free-text columns are listed. `admissionStatus` and friends are Postgres
 * enums - Postgres rejects anything outside the type with 22P02 - so they stay
 * fixed and are deliberately absent.
 *
 * Edits survive a database that has not run
 * `supabase/schema/add-multi-course-and-dropdowns.sql` yet: they are mirrored
 * into localStorage, which is also where they stay until the table exists.
 */
import { useCallback, useEffect, useSyncExternalStore } from "react";
import { getDropdownOptions, saveDropdownOptions } from "@/lib/supabase/data";

export const DROPDOWN_DEFAULTS = {
  gender: ["MALE", "FEMALE", "OTHER"],
  bloodGroup: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
  studentCategory: ["General", "OBC", "SC", "ST", "EWS"],
  religion: ["Hindu", "Muslim", "Christian", "Sikh", "Buddhist", "Jain", "Other"],
  board: ["CBSE", "ICSE", "State Board", "NIOS", "Other"],
  stream: ["Science", "Commerce", "Arts", "Vocational"],
  guardianRelation: ["Uncle", "Aunt", "Grandparent", "Sibling", "Family friend", "Other"],
  /* How the student is named on their own paperwork -- "Krishna Singh, S/o Ram
     Singh". Not `guardianRelation`, which is the local guardian's relation to
     the student and answers a different question. */
  parentage: ["Son of", "Daughter of", "Wife of"],
  maritalStatus: ["Single", "Married"],
  enquiryPurpose: [
    "Admission Enquiry",
    "Fee Related",
    "Meeting",
    "Complaint",
    "Delivery",
    "Interview",
    "Other",
  ],
  department: ["Administration", "Academics", "Accounts", "HR", "IT", "Library"],
  idType: ["Aadhaar", "PAN", "DL", "Voter ID", "Passport"],
  enquirySource: [
    "Walk-in",
    "Phone",
    "Website",
    "Social Media",
    "Referral",
    "Advertisement",
    "Other",
  ],
  feeCategory: ["Academic", "Facility", "One-time", "Optional"],
  feeFrequency: [
    "One-time",
    "Monthly",
    "Quarterly",
    "Per Semester",
    "Yearly",
    "Per Exam",
  ],
  /* What a batch is taught. These used to be a hard-coded array plus whatever
     was typed in the session, so a subject created on Assign Course was gone on
     the next reload -- and could not be renamed or removed at all. */
  subject: [
    "Data Structures",
    "Algorithms",
    "Database Systems",
    "Web Development",
    "Operating Systems",
    "Computer Networks",
    "Software Engineering",
    "Machine Learning",
  ],
  /* The teachers the office offers. Empty by default: most of the list is
     read off the batches, which is where a teacher's name is actually kept. */
  teacher: [] as string[],
  courseCategory: [
    "COMPUTER",
    "VOCATIONAL",
    "ACADEMIC",
    "LANGUAGE",
    "PROFESSIONAL",
    "SKILL_DEVELOPMENT",
    "OTHER",
  ],
} satisfies Record<string, string[]>;

export type DropdownKey = keyof typeof DROPDOWN_DEFAULTS;

/** Human titles for the "Manage <name>" dialog. */
export const DROPDOWN_TITLES: Record<DropdownKey, string> = {
  gender: "Gender",
  parentage: "Parentage",
  maritalStatus: "Marital status",
  bloodGroup: "Blood group",
  studentCategory: "Category",
  religion: "Religion",
  board: "Board",
  stream: "Stream",
  guardianRelation: "Guardian relation",
  courseCategory: "Course category",
  enquiryPurpose: "Purpose of visit",
  department: "Department",
  idType: "ID type",
  enquirySource: "Enquiry source",
  feeCategory: "Fee category",
  feeFrequency: "Fee frequency",
  subject: "Subject",
  teacher: "Teacher",
};

/** COMPUTER -> "Computer", SKILL_DEVELOPMENT -> "Skill development", A+ -> "A+". */
export function optionLabel(value: string): string {
  if (!value) return "";
  if (!/^[A-Z][A-Z0-9_]*$/.test(value) || value.length < 3) return value;
  const [first, ...rest] = value.toLowerCase().split("_");
  return first.charAt(0).toUpperCase() + first.slice(1) + (rest.length ? ` ${rest.join(" ")}` : "");
}

const STORAGE_KEY = "dropdown-options";

function readLocal(): Record<string, string[]> {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return parsed && typeof parsed === "object" ? (parsed as Record<string, string[]>) : {};
  } catch {
    return {};
  }
}

/* A module-level store rather than a context: the pickers are scattered across
   a dozen unrelated pages, and every one of them wants the same single fetch. */
let overrides: Record<string, string[]> = readLocal();
let loadedFor: string | null | undefined;
const listeners = new Set<() => void>();

const snapshot = () => overrides;
const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
const publish = (next: Record<string, string[]>) => {
  overrides = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* a full or disabled store is not worth failing an edit over */
  }
  for (const fn of listeners) fn();
};

/** Exported for tests, which need each case to start from a clean store. */
export function resetDropdownOptions() {
  loadedFor = undefined;
  publish({});
}

export interface DropdownStore {
  /** The live list for `key`: the organisation's own, or the built-in default. */
  options: (key: DropdownKey) => string[];
  /** Replace a list. Resolves once it has been persisted (or mirrored locally). */
  save: (key: DropdownKey, values: string[]) => Promise<{ stored: boolean }>;
}

export function useDropdownOptions(organizationId: string | null | undefined): DropdownStore {
  const current = useSyncExternalStore(subscribe, snapshot, snapshot);

  useEffect(() => {
    if (loadedFor === organizationId) return;
    loadedFor = organizationId;
    getDropdownOptions(organizationId ?? null)
      // The saved lists win over the mirror, which may be a different browser's.
      .then((result) => publish({ ...overrides, ...result.data }))
      .catch(() => {
        /* keep whatever the mirror holds */
      });
  }, [organizationId]);

  const options = useCallback(
    (key: DropdownKey) => {
      const saved = current[key];
      return saved && saved.length ? saved : DROPDOWN_DEFAULTS[key];
    },
    [current],
  );

  const save = useCallback(
    async (key: DropdownKey, values: string[]) => {
      const cleaned = [...new Set(values.map((v) => v.trim()).filter(Boolean))];
      publish({ ...overrides, [key]: cleaned });
      try {
        const result = await saveDropdownOptions(organizationId ?? null, key, cleaned);
        return { stored: result.stored };
      } catch {
        return { stored: false };
      }
    },
    [organizationId],
  );

  return { options, save };
}
