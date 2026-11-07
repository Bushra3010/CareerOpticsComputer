import type { jsPDF } from "jspdf";

/**
 * The fonts and background artwork the academy's printed documents are set
 * in. The designs (marksheet, ID cards, verification letter) were made in
 * Poppins and Great Vibes; jsPDF only ships the standard PDF fonts, so these
 * are fetched from /fonts once, kept in memory, and registered on every
 * document that prints.
 *
 * Everything here is loaded lazily: a page that never prints never downloads
 * a font.
 */

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

/** Served from public/fonts. The key is the jsPDF font name; the style is always "normal". */
const FONT_FILES = {
  "Poppins-Regular": "Poppins-Regular.ttf",
  "Poppins-Medium": "Poppins-Medium.ttf",
  "Poppins-SemiBold": "Poppins-SemiBold.ttf",
  "Poppins-Bold": "Poppins-Bold.ttf",
  "Poppins-ExtraBold": "Poppins-ExtraBold.ttf",
  "GreatVibes-Regular": "GreatVibes-Regular.ttf",
} as const;

export type BrandFont = keyof typeof FONT_FILES;

const fontCache = new Map<BrandFont, Promise<string>>();
const imageCache = new Map<string, Promise<string>>();

/** Reads a public file as base64 (fonts) or as a data URL (images), once. */
async function fetchBase64(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not load ${url} (${res.status})`);
  const bytes = new Uint8Array(await res.arrayBuffer());
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

function fontData(name: BrandFont): Promise<string> {
  let p = fontCache.get(name);
  if (!p) {
    p = fetchBase64(`${BASE}/fonts/${FONT_FILES[name]}`);
    fontCache.set(name, p);
  }
  return p;
}

/**
 * Registers the brand fonts on a document. Safe to call more than once on
 * the same document; jsPDF keeps one copy per font name. A font that cannot
 * be fetched (offline, or a test with no server) is skipped, and the text
 * set in it falls back to Helvetica -- the document still prints.
 */
export async function registerBrandFonts(doc: jsPDF, names: BrandFont[] = Object.keys(FONT_FILES) as BrandFont[]) {
  const loaded = await Promise.all(
    names.map(async (name) => {
      try {
        return [name, await fontData(name)] as const;
      } catch {
        fontCache.delete(name);
        return null;
      }
    }),
  );
  const have = new Set(Object.keys(doc.getFontList()));
  for (const entry of loaded) {
    if (!entry) continue;
    const [name, data] = entry;
    if (have.has(name)) continue;
    doc.addFileToVFS(FONT_FILES[name], data);
    doc.addFont(FONT_FILES[name], name, "normal");
  }
}

/** The font to set: the brand font when the document has it, else Helvetica. */
export function fontOn(doc: jsPDF, name: BrandFont): string {
  return name in doc.getFontList() ? name : "helvetica";
}

/**
 * A background artwork from public/documents, as a data URL jsPDF can draw;
 * null when it cannot be fetched, so the document prints its data on a
 * plain page rather than not at all.
 */
export function documentArtwork(file: string): Promise<string | null> {
  let p = imageCache.get(file);
  if (!p) {
    const type = file.endsWith(".png") ? "image/png" : "image/jpeg";
    p = fetchBase64(`${BASE}/documents/${file}`).then((b64) => `data:${type};base64,${b64}`);
    imageCache.set(file, p);
  }
  return p.catch(() => {
    imageCache.delete(file);
    return null;
  });
}

/** Points, as the designs were measured, to millimetres, as jsPDF is driven. */
export const pt = (points: number) => (points * 25.4) / 72;

/** "#14266b" → [20, 38, 107]. */
export const rgb = (hex: string): [number, number, number] => {
  const v = hex.replace("#", "");
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
};
