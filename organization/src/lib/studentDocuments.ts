/**
 * The files on a student's record, ready to show.
 *
 * The admission form keeps every upload in `students.documents` (jsonb), one
 * entry per slot: { name, dataUrl, uploadedAt }. Older records keep some of
 * them in columns of their own (`photo`, `aadharFront`, …), as a bare data URL
 * or an object holding one. This reads both, so a record is shown whole
 * whichever way it was filed.
 */

export interface StudentFile {
  key: string;
  label: string;
  /** The file's own name, when the upload kept one. */
  name: string;
  /** A data: or http(s): URL. */
  url: string;
  uploadedAt: string;
  kind: "image" | "pdf" | "other";
}

/** The admission form's slots, in the order it asks for them. */
export const DOCUMENT_SLOTS: Array<{ key: string; label: string }> = [
  { key: "passportPhoto", label: "Passport Photo" },
  { key: "tenthMarksheet", label: "10th Marksheet" },
  { key: "twelfthMarksheet", label: "12th Marksheet" },
  { key: "transferCertificate", label: "Transfer Certificate" },
  { key: "aadharCardFront", label: "Aadhar Card (Front)" },
  { key: "aadharCardBack", label: "Aadhar Card (Back)" },
  { key: "admissionForm", label: "Admission Form" },
  { key: "casteCertificate", label: "Caste Certificate" },
];

/** Older records' own columns, with the slot each stands for. */
const LEGACY_COLUMNS: Array<{ column: string; key: string; label: string }> = [
  { column: "photo", key: "passportPhoto", label: "Passport Photo" },
  { column: "aadharFront", key: "aadharCardFront", label: "Aadhar Card (Front)" },
  { column: "aadharBack", key: "aadharCardBack", label: "Aadhar Card (Back)" },
  { column: "tenthMarksheet", key: "tenthMarksheet", label: "10th Marksheet" },
  { column: "twelfthMarksheet", key: "twelfthMarksheet", label: "12th Marksheet" },
  { column: "transferCertificate", key: "transferCertificate", label: "Transfer Certificate" },
  { column: "apaarCard", key: "apaarCard", label: "APAAR Card" },
  { column: "casteCertificate", key: "casteCertificate", label: "Caste Certificate" },
  { column: "admissionForm", key: "admissionForm", label: "Admission Form" },
];

const labelFor = (key: string) =>
  DOCUMENT_SLOTS.find((s) => s.key === key)?.label ??
  key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase());

export function fileKind(url: string, name = ""): StudentFile["kind"] {
  const head = url.slice(0, 40).toLowerCase();
  if (head.startsWith("data:image/") || /\.(png|jpe?g|webp|gif)(\?|$)/i.test(name || url)) return "image";
  if (head.startsWith("data:application/pdf") || /\.pdf(\?|$)/i.test(name || url)) return "pdf";
  return "other";
}

/** A stored value -- a URL string, or an object carrying one -- as a file, or null. */
export function asFile(key: string, label: string, value: unknown): StudentFile | null {
  let url = "";
  let name = "";
  let uploadedAt = "";
  if (typeof value === "string") url = value.trim();
  else if (value && typeof value === "object") {
    const v = value as Record<string, unknown>;
    for (const k of ["dataUrl", "url", "src", "path"]) {
      if (typeof v[k] === "string" && v[k]) {
        url = String(v[k]).trim();
        break;
      }
    }
    name = typeof v.name === "string" ? v.name : "";
    uploadedAt = typeof v.uploadedAt === "string" ? v.uploadedAt : "";
  }
  if (!url || !/^(data:|https?:|blob:)/i.test(url)) return null;
  return { key, label, name, url, uploadedAt, kind: fileKind(url, name) };
}

/** Every file on the record, in the admission form's order, newest filing winning. */
export function studentFiles(row: Record<string, unknown> | null | undefined): StudentFile[] {
  if (!row) return [];
  const found = new Map<string, StudentFile>();
  let docs = row.documents;
  if (typeof docs === "string") {
    try {
      docs = JSON.parse(docs);
    } catch {
      docs = null;
    }
  }
  if (docs && typeof docs === "object" && !Array.isArray(docs)) {
    for (const [key, value] of Object.entries(docs as Record<string, unknown>)) {
      const file = asFile(key, labelFor(key), value);
      if (file) found.set(key, file);
    }
  }
  for (const { column, key, label } of LEGACY_COLUMNS) {
    if (found.has(key)) continue;
    const file = asFile(key, label, row[column]);
    if (file) found.set(key, file);
  }
  const order = (key: string) => {
    const i = DOCUMENT_SLOTS.findIndex((s) => s.key === key);
    return i < 0 ? 99 : i;
  };
  return [...found.values()].sort((a, b) => order(a.key) - order(b.key));
}

/**
 * A data URL as an object URL. Browsers refuse to open a data: PDF in a new
 * tab or a frame, so it is shown and downloaded through a blob instead.
 */
export function toObjectUrl(url: string): string {
  if (!url.startsWith("data:")) return url;
  const [meta, body = ""] = url.split(",", 2);
  const mime = /data:([^;,]+)/.exec(meta)?.[1] || "application/octet-stream";
  const bytes = meta.includes(";base64") ? atob(body) : decodeURIComponent(body);
  const buffer = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i += 1) buffer[i] = bytes.charCodeAt(i);
  return URL.createObjectURL(new Blob([buffer], { type: mime }));
}

/** A sensible file name to save a document under. */
export function downloadName(file: StudentFile, student = "student") {
  if (file.name) return file.name;
  const ext = file.kind === "pdf" ? "pdf" : /data:image\/(\w+)/.exec(file.url)?.[1]?.replace("jpeg", "jpg") || "file";
  return `${student}-${file.label}`.replace(/[^a-z0-9]+/gi, "-").toLowerCase() + `.${ext}`;
}
