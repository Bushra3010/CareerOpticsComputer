/**
 * The institute's own mark, for printing on generated documents.
 *
 * Same shape as [instituteName]: the PDF builders in `documents.ts` are
 * synchronous and run far from any React tree, so the branch's saved logo is
 * mirrored into localStorage and read back from there. A branch that has
 * uploaded one on the website settings page gets its own mark; one that has
 * not falls back to the mark bundled with the app.
 *
 * `branch_settings.logo` holds a data URL, which is what jsPDF's `addImage`
 * wants — no fetch happens while a document is being drawn.
 */
import { getBranchSettings } from "@/lib/supabase/data";

const STORAGE_KEY = "institute-logo";
const BUNDLED_LOGO = `${import.meta.env.BASE_URL}career-optics-logo.png`;

/** The mark to print right now, or null when there is none to print. */
export function instituteLogo(): string | null {
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    return cached?.startsWith("data:image") ? cached : null;
  } catch {
    return null;
  }
}

export function cacheInstituteLogo(dataUrl: string | null) {
  try {
    if (dataUrl?.startsWith("data:image")) localStorage.setItem(STORAGE_KEY, dataUrl);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* a full or disabled store just means documents print without a mark */
  }
}

/**
 * An older upload wrote a bare data URL and a newer one writes an object, so
 * the stored value is unwrapped rather than assumed. Handing jsPDF an object
 * draws nothing and reports no reason.
 */
function asDataUrl(value: unknown): string | null {
  if (typeof value === "string") return value.startsWith("data:image") ? value : null;
  if (value && typeof value === "object") {
    for (const key of ["url", "dataUrl", "src"]) {
      const found = (value as Record<string, unknown>)[key];
      if (typeof found === "string" && found.startsWith("data:image")) return found;
    }
  }
  return null;
}

/** The bundled mark, read once and kept as a data URL so PDFs stay synchronous. */
async function bundledLogo(): Promise<string | null> {
  try {
    const response = await fetch(BUNDLED_LOGO);
    if (!response.ok) return null;
    const blob = await response.blob();
    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/**
 * Pull the branch's saved mark into the mirror, falling back to the bundled
 * one. Quietly keeps whatever is already mirrored on failure — a document that
 * prints without a logo is better than one that fails to print.
 */
export async function loadInstituteLogo(branchId: string | null | undefined): Promise<string | null> {
  try {
    if (branchId) {
      const { data } = await getBranchSettings(branchId);
      const saved = asDataUrl((data as { logo?: unknown } | null)?.logo);
      if (saved) {
        cacheInstituteLogo(saved);
        return saved;
      }
    }
    if (!instituteLogo()) {
      const bundled = await bundledLogo();
      if (bundled) cacheInstituteLogo(bundled);
      return bundled;
    }
  } catch {
    /* offline, or the branch has no settings row yet */
  }
  return instituteLogo();
}
