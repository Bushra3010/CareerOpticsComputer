// Address auto-fill helpers.
//
// India Post's public PIN directory is the only complete source for
// block / city / post-office data — there are ~19,000 PIN codes and ~155,000
// post offices, far more than can be shipped as a static table. Both services
// below are free, keyless and CORS-enabled, and every caller degrades to plain
// manual entry when a lookup fails, so the form still works offline.

const PINCODE_API = "https://api.postalpincode.in/pincode";
const GEOCODE_API = "https://nominatim.openstreetmap.org/search";

export interface PostalPlace {
  /** Post office name — used as the City suggestion. */
  name: string;
  block: string;
  district: string;
  state: string;
  pincode: string;
}

interface PostOfficeRow {
  Name?: string;
  Block?: string;
  District?: string;
  State?: string;
  Pincode?: string;
}

/** Look up every post office under a 6-digit PIN. Returns [] on any failure. */
export async function lookupPincode(pincode: string): Promise<PostalPlace[]> {
  if (!/^\d{6}$/.test(pincode)) return [];
  try {
    const res = await fetch(`${PINCODE_API}/${pincode}`);
    if (!res.ok) return [];
    const body = (await res.json()) as Array<{
      Status?: string;
      PostOffice?: PostOfficeRow[] | null;
    }>;
    const rows = body?.[0]?.Status === "Success" ? body[0].PostOffice ?? [] : [];
    return rows.map((row) => ({
      name: row.Name ?? "",
      // "NA" is India Post's placeholder for an unmapped block.
      block: row.Block && row.Block !== "NA" ? row.Block : "",
      district: row.District ?? "",
      state: row.State ?? "",
      pincode: row.Pincode ?? pincode,
    }));
  } catch {
    return [];
  }
}

/** Best-effort coordinates for a free-text address. Returns null on failure. */
export async function geocode(query: string): Promise<{ lat: string; lon: string } | null> {
  const q = query.trim();
  if (!q) return null;
  try {
    const res = await fetch(
      `${GEOCODE_API}?format=json&limit=1&countrycodes=in&q=${encodeURIComponent(q)}`
    );
    if (!res.ok) return null;
    const body = (await res.json()) as Array<{ lat?: string; lon?: string }>;
    const hit = body?.[0];
    if (!hit?.lat || !hit?.lon) return null;
    return { lat: hit.lat, lon: hit.lon };
  } catch {
    return null;
  }
}

/** Unique, sorted, blank-free list. */
export const uniqueSorted = (values: string[]) =>
  Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
