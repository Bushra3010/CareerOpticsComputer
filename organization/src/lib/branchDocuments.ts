import { asFile, type StudentFile } from "@/lib/studentDocuments";

/**
 * The documents a centre is registered with. Each lives in a jsonb column of
 * its own -- the centre's on `branches`, its director's on `branch_directors`
 * -- as { name, dataUrl, uploadedAt }, the shape a student's documents take,
 * so the same viewer shows both.
 */
export interface BranchDocumentSlot {
  key: string;
  label: string;
  table: "branches" | "branch_directors";
  column: string;
  /** What the picker accepts: photos are images, papers may be PDFs. */
  accept: string;
}

const IMAGE = "image/*";
const PAPER = "image/*,application/pdf";

export const BRANCH_DOCUMENT_SLOTS: BranchDocumentSlot[] = [
  { key: "branchMohar", label: "Branch Mohar (Stamp)", table: "branches", column: "branchMohar", accept: IMAGE },
  { key: "branchPhoto", label: "Branch Photo", table: "branches", column: "branchPhoto", accept: IMAGE },
  { key: "labPhoto", label: "Lab Photo", table: "branches", column: "labPhoto", accept: IMAGE },
  { key: "statusDocument", label: "Status Document", table: "branches", column: "statusDocument", accept: PAPER },
  { key: "branchLogo", label: "Branch Logo", table: "branches", column: "branchLogo", accept: IMAGE },
  { key: "directorPhoto", label: "Director Photo", table: "branch_directors", column: "photo", accept: IMAGE },
  { key: "directorSignature", label: "Director Signature", table: "branch_directors", column: "signature", accept: IMAGE },
  { key: "aadharFront", label: "Director Aadhar (Front)", table: "branch_directors", column: "aadharFront", accept: PAPER },
  { key: "aadharBack", label: "Director Aadhar (Back)", table: "branch_directors", column: "aadharBack", accept: PAPER },
];

/** A centre's record as getBranchDetails returns it: the branch row with its director. */
export type BranchRecord = Record<string, unknown> & { director?: Record<string, unknown> | null };

/** What is on file for each slot, in the registration form's order; null where nothing is. */
export function branchDocuments(record: BranchRecord | null | undefined): Array<{ slot: BranchDocumentSlot; file: StudentFile | null }> {
  return BRANCH_DOCUMENT_SLOTS.map((slot) => {
    const source = slot.table === "branches" ? record : record?.director;
    return { slot, file: source ? asFile(slot.key, slot.label, source[slot.column]) : null };
  });
}

/** An upload as a column stores it. */
export const storedFile = (picked: { name: string; dataUrl: string }) => ({
  name: picked.name,
  dataUrl: picked.dataUrl,
  uploadedAt: new Date().toISOString(),
});
