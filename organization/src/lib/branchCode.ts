/**
 * A new centre's code, made for it rather than typed: the academy's prefix,
 * the state's two-letter code, the first two letters of the city, and the
 * next number after every code already given -- COCA/BR/AR/002.
 *
 * The number runs across all centres, so two centres in different towns never
 * share it and the code stays unique even if two towns abbreviate alike.
 */

export const CODE_PREFIX = "COCA";

/** The two-letter codes used on Indian vehicle plates, which most people know. */
const STATE_CODES: Record<string, string> = {
  "andaman and nicobar islands": "AN", "andhra pradesh": "AP", "arunachal pradesh": "AR", assam: "AS", bihar: "BR",
  chandigarh: "CH", chhattisgarh: "CG", "dadra and nagar haveli and daman and diu": "DD", delhi: "DL", goa: "GA",
  gujarat: "GJ", haryana: "HR", "himachal pradesh": "HP", "jammu and kashmir": "JK", jharkhand: "JH", karnataka: "KA",
  kerala: "KL", ladakh: "LA", lakshadweep: "LD", "madhya pradesh": "MP", maharashtra: "MH", manipur: "MN",
  meghalaya: "ML", mizoram: "MZ", nagaland: "NL", odisha: "OD", puducherry: "PY", punjab: "PB", rajasthan: "RJ",
  sikkim: "SK", "tamil nadu": "TN", telangana: "TS", tripura: "TR", "uttar pradesh": "UP", uttarakhand: "UK",
  "west bengal": "WB",
};

const letters = (text: string) => text.toUpperCase().replace(/[^A-Z]/g, "");

export function stateCode(state: string): string {
  const key = state.trim().toLowerCase().replace(/\s+/g, " ").replace(/&/g, "and");
  return STATE_CODES[key] || letters(state).slice(0, 2).padEnd(2, "X");
}

/** The highest number at the end of the codes given so far. */
export function lastSerial(codes: string[]): number {
  return codes.reduce((max, code) => {
    const m = /(\d+)\s*$/.exec(String(code || ""));
    return m ? Math.max(max, Number(m[1])) : max;
  }, 0);
}

export function nextBranchCode(state: string, city: string, existingCodes: string[]): string {
  const serial = String(lastSerial(existingCodes) + 1).padStart(3, "0");
  const town = letters(city).slice(0, 2).padEnd(2, "X");
  return `${CODE_PREFIX}/${stateCode(state)}/${town}/${serial}`;
}

/** The centre's login ID from its code: COCA/BR/AR/002 → coca-br-ar-002. */
export const loginIdFromCode = (code: string) => code.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** The start of a new centre's code, before its number: "COCA/BR/AR/". */
export const codePrefix = (state: string, city: string) =>
  `${CODE_PREFIX}/${stateCode(state)}/${letters(city).slice(0, 2).padEnd(2, "X")}/`;
