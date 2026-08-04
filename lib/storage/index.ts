import "server-only";

export const STUDENT_BUCKET = "student-private";

/** Matches the bucket's allowed_mime_types — kept in step deliberately. */
export const ALLOWED_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;

export const MAX_BYTES = 5 * 1024 * 1024;

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

/**
 * `{centre_id}/{student_id}/{uuid}.{ext}` — the shape the storage RLS policies
 * in migration 0019 parse. The random filename is the point: the two ids are
 * guessable, so the object name is what actually makes a path unguessable.
 *
 * The extension comes from the verified MIME type, never from the uploaded
 * filename, so a file called `photo.jpg.exe` cannot land with that name.
 */
export function studentObjectPath(
  centreId: string,
  studentId: string,
  mimeType: string,
): string {
  const ext = EXTENSIONS[mimeType] ?? "bin";
  return `${centreId}/${studentId}/${crypto.randomUUID()}.${ext}`;
}

/** How long a signed URL stays valid. Long enough to render, short enough that a leaked URL is stale quickly. */
export const SIGNED_URL_TTL_SECONDS = 60 * 5;
