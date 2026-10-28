/**
 * The institute name printed on certificates, marksheets and ID cards.
 *
 * It used to be the literal "Career Optics Computer Centre" in `documentDesigner.ts` and
 * "CAREER OPTICS COMPUTER CENTRE" in `documents.ts`, so every certificate any institute
 * generated carried our name - including the `{{institute}}` watermark, which
 * could be moved and restyled but never actually renamed.
 *
 * It lives on `branch_settings.siteName`. The PDF builders in `documents.ts`
 * are synchronous and run far from any React tree, so the saved value is also
 * mirrored into localStorage and read from there.
 */
import { getBranchSettings, updateBranchSettings } from "@/lib/supabase/data";

export const DEFAULT_INSTITUTE_NAME = "Career Optics Computer Centre";

const STORAGE_KEY = "institute-name";

const listeners = new Set<() => void>();

/** The name to print right now. Safe to call from anywhere, including PDFs. */
export function instituteName(): string {
  try {
    return localStorage.getItem(STORAGE_KEY)?.trim() || DEFAULT_INSTITUTE_NAME;
  } catch {
    return DEFAULT_INSTITUTE_NAME;
  }
}

/** Update the mirror only. `saveInstituteName` is what writes it to the branch. */
export function cacheInstituteName(name: string) {
  try {
    localStorage.setItem(STORAGE_KEY, name.trim());
  } catch {
    /* a full or disabled store still leaves the default in place */
  }
  for (const fn of listeners) fn();
}

export function subscribeToInstituteName(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Pull the branch's saved name into the mirror. Quietly keeps the mirror on failure. */
export async function loadInstituteName(branchId: string | null | undefined): Promise<string> {
  if (!branchId) return instituteName();
  try {
    const { data } = await getBranchSettings(branchId);
    const saved = (data as { siteName?: string } | null)?.siteName?.trim();
    if (saved) cacheInstituteName(saved);
  } catch {
    /* offline, or the branch has no settings row yet */
  }
  return instituteName();
}

/**
 * Persist the name. `stored: false` means it is in this browser only - there is
 * no branch to hang it off, or the write was refused.
 */
export async function saveInstituteName(
  branchId: string | null | undefined,
  name: string,
): Promise<{ stored: boolean }> {
  const trimmed = name.trim() || DEFAULT_INSTITUTE_NAME;
  cacheInstituteName(trimmed);
  if (!branchId) return { stored: false };
  try {
    await updateBranchSettings(branchId, { siteName: trimmed });
    return { stored: true };
  } catch {
    return { stored: false };
  }
}
