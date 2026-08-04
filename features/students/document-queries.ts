import { createClient } from "@/lib/db/server";
import { SIGNED_URL_TTL_SECONDS, STUDENT_BUCKET } from "@/lib/storage";

export interface StudentDocument {
  id: string;
  kind: "photo" | "id_proof" | "other";
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedOn: string;
  /** Short-lived; null if the object could not be signed (missing or not readable). */
  url: string | null;
}

const KIND_LABELS: Record<StudentDocument["kind"], string> = {
  photo: "Photograph",
  id_proof: "Identity proof",
  other: "Other document",
};

export function documentKindLabel(kind: StudentDocument["kind"]): string {
  return KIND_LABELS[kind];
}

/**
 * A student's documents with a freshly signed URL for each.
 *
 * The rows and the signing both run as the caller, so RLS decides what comes
 * back — staff get their own centre's, a student gets their own, and neither
 * needs the query to know which case it is in. URLs are re-signed on every
 * render rather than stored, so nothing durable ever points at a private file.
 */
export async function listStudentDocuments(
  studentId: string,
): Promise<StudentDocument[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("student_documents")
    .select(
      "id, kind, original_name, mime_type, size_bytes, uploaded_at, storage_path",
    )
    .eq("student_id", studentId)
    .order("uploaded_at", { ascending: false });

  const rows = data ?? [];
  if (rows.length === 0) return [];

  const { data: signed } = await supabase.storage
    .from(STUDENT_BUCKET)
    .createSignedUrls(
      rows.map((r) => r.storage_path),
      SIGNED_URL_TTL_SECONDS,
    );

  const urlByPath = new Map<string, string>();
  for (const s of signed ?? []) {
    if (s.path && s.signedUrl) urlByPath.set(s.path, s.signedUrl);
  }

  return rows.map((r) => ({
    id: r.id,
    kind: r.kind,
    originalName: r.original_name,
    mimeType: r.mime_type,
    sizeBytes: r.size_bytes,
    uploadedOn: r.uploaded_at.slice(0, 10),
    url: urlByPath.get(r.storage_path) ?? null,
  }));
}

/**
 * The student's photograph as a data URI, for the printed certificate.
 *
 * A signed URL would work on screen but not reliably on paper: the browser
 * would have to fetch it while the print dialogue is opening, and the URL
 * expires. Inlining costs bytes — the bucket's 5 MB cap bounds the worst case
 * at roughly 6.7 MB of base64 — which is the argument for storing a downscaled
 * rendition at upload time later. Until then, correctness on paper wins.
 *
 * Returns null when there is no photograph, so the certificate keeps its
 * current layout rather than printing a gap.
 */
export async function getStudentPhotoDataUri(
  studentId: string,
): Promise<string | null> {
  const supabase = await createClient();

  const { data: row } = await supabase
    .from("student_documents")
    .select("storage_path, mime_type")
    .eq("student_id", studentId)
    .eq("kind", "photo")
    .maybeSingle();

  // The bucket accepts PDFs, so a row tagged 'photo' is not certainly an image.
  if (!row || !row.mime_type.startsWith("image/")) return null;

  const { data: blob } = await supabase.storage
    .from(STUDENT_BUCKET)
    .download(row.storage_path);
  if (!blob) return null;

  const base64 = Buffer.from(await blob.arrayBuffer()).toString("base64");
  return `data:${row.mime_type};base64,${base64}`;
}
