import { supabase } from "./client";

/**
 * The online admission form (supabase/schema/online-admission.sql): an
 * applicant with no login picks a centre and course, gives their details and
 * documents, and the application waits as SUBMITTED for that centre's admin.
 */

const SETUP_HINT = "Online admission is not set up yet. Run supabase/schema/online-admission.sql in Supabase.";
const missing = (error: { code?: string; message?: string } | null) =>
  error?.code === "PGRST202" || error?.code === "42P01" || /does not exist|schema cache/i.test(error?.message || "");
const readable = (error: { code?: string; message?: string }) =>
  missing(error) ? SETUP_HINT : (error.message || "Request failed").replace(/^.*INVALID:\s*/, "");

export interface PublicCentre {
  id: string;
  name: string;
  city: string | null;
  district: string | null;
  state: string | null;
}

export async function getPublicCentres(): Promise<PublicCentre[]> {
  const { data, error } = await supabase.rpc("public_centres");
  if (error) throw new Error(readable(error));
  return (data || []) as PublicCentre[];
}

export async function getPublicCourses(branchId: string): Promise<Array<{ id: string; name: string }>> {
  const { data, error } = await supabase.rpc("public_branch_courses", { p_branch_id: branchId });
  if (error) throw new Error(readable(error));
  return (data || []) as Array<{ id: string; name: string }>;
}

/** The slots an applicant can fill; the first two are required. */
export const ADMISSION_DOCUMENTS = [
  { key: "passportPhoto", label: "Passport-size photo", required: true, accept: "image/*" },
  { key: "aadharCardFront", label: "Aadhaar card (front)", required: true, accept: "image/*,application/pdf" },
  { key: "aadharCardBack", label: "Aadhaar card (back)", required: false, accept: "image/*,application/pdf" },
  { key: "tenthMarksheet", label: "10th marksheet", required: false, accept: "image/*,application/pdf" },
  { key: "twelfthMarksheet", label: "12th marksheet", required: false, accept: "image/*,application/pdf" },
  { key: "paymentProof", label: "Fee payment screenshot", required: false, accept: "image/*,application/pdf" },
] as const;

export type AdmissionDocumentKey = (typeof ADMISSION_DOCUMENTS)[number]["key"];

export interface OnlineApplicant {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  fatherName: string;
  motherName: string;
  streetAddress: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
}

export async function submitOnlineAdmission(
  branchId: string,
  courseId: string | null,
  applicant: OnlineApplicant,
  documents: Partial<Record<AdmissionDocumentKey, { name: string; dataUrl: string }>>,
) {
  const { data, error } = await supabase.rpc("submit_online_admission", {
    p_branch_id: branchId,
    p_course_id: courseId,
    p_student: applicant,
    p_documents: documents,
  });
  if (error) throw new Error(readable(error));
  return data as { applicationNo: string; centre: string; duplicate: boolean };
}

export interface ApplicationStatus {
  status: "NOT_FOUND" | "DRAFT" | "SUBMITTED" | "PENDING_PAYMENT" | "APPROVED" | "REJECTED";
  applicationNo?: string;
  name?: string;
  centre?: string;
  note?: string | null;
  requested?: string | null;
}

export async function getApplicationStatus(applicationNo: string, phone: string): Promise<ApplicationStatus> {
  const { data, error } = await supabase.rpc("online_admission_status", { p_application_no: applicationNo, p_phone: phone });
  if (error) throw new Error(readable(error));
  return data as ApplicationStatus;
}

/**
 * A picked file as the form sends it. Photos are shrunk to 1200 px and saved
 * as JPEG -- a phone camera's 4 MB picture becomes a few hundred KB -- and a
 * PDF is kept as it is, up to 2 MB.
 */
export async function readDocument(file: File): Promise<{ name: string; dataUrl: string }> {
  const asDataUrl = (blob: Blob) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Could not read the file."));
      reader.readAsDataURL(blob);
    });
  if (file.type === "application/pdf") {
    if (file.size > 2 * 1024 * 1024) throw new Error("Keep a PDF under 2 MB, or upload a photo of it instead.");
    return { name: file.name, dataUrl: await asDataUrl(file) };
  }
  if (!file.type.startsWith("image/")) throw new Error("Upload a photo or a PDF.");
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("That photo could not be opened."));
      i.src = url;
    });
    const scale = Math.min(1, 1200 / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return { name: file.name, dataUrl: await asDataUrl(file) };
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return { name: file.name.replace(/\.[^.]+$/, "") + ".jpg", dataUrl: canvas.toDataURL("image/jpeg", 0.82) };
  } finally {
    URL.revokeObjectURL(url);
  }
}
