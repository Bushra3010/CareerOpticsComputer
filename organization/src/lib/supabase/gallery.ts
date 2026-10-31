/**
 * The public website's photo gallery, kept in `gallery_items` and shown by
 * website/pages/gallery.tsx and the home page. See
 * supabase/schema/website-gallery.sql.
 *
 * The images go to the public `website` bucket under gallery/, the same
 * bucket Website Content uploads to, so the website shows them by plain URL.
 */
import { supabase } from "@/lib/supabase/client";

export type GalleryItem = {
  id: string;
  organizationId: string;
  title: string | null;
  category: string | null;
  imageUrl: string;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export type GalleryPatch = Partial<Pick<GalleryItem, "title" | "category" | "isPublished" | "sortOrder">>;

/** Offered as suggestions; any other category can be typed. */
export const GALLERY_CATEGORIES = ["Classroom", "Computer Lab", "Events", "Students", "Certificates", "Campus"];

const BUCKET = "website";
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
/** Before compression: a phone photo is often 4-6 MB, and it shrinks a lot. */
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
/** Wide enough for the lightbox on a large screen, small enough to load on 4G. */
const MAX_SIDE = 1600;
const QUALITY = 0.82;

/** A missing table or bucket is the failure worth explaining: the SQL has not been run. */
function describe(error: { code?: string; message: string }) {
  if (error.code === "42P01" || error.code === "PGRST205" || (/gallery_items/.test(error.message) && /exist|schema cache/.test(error.message))) {
    return "The gallery_items table is missing. Run supabase/schema/website-gallery.sql in the Supabase SQL editor.";
  }
  if (/bucket/i.test(error.message)) {
    return "The website image bucket is missing. Run supabase/schema/website-content.sql in the Supabase SQL editor.";
  }
  return error.message;
}

/** Throws the reason a file cannot go into the gallery. */
export function validateImageFile(file: File) {
  if (!ACCEPTED.includes(file.type)) throw new Error(`"${file.name}" is not a JPG, PNG or WebP image.`);
  if (file.size > MAX_UPLOAD_BYTES) throw new Error(`"${file.name}" is larger than 8 MB.`);
}

async function decode(file: File): Promise<{ source: CanvasImageSource; width: number; height: number; close: () => void }> {
  if (typeof createImageBitmap === "function") {
    const bitmap = await createImageBitmap(file);
    return { source: bitmap, width: bitmap.width, height: bitmap.height, close: () => bitmap.close() };
  }
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.src = url;
  await img.decode();
  return { source: img, width: img.naturalWidth, height: img.naturalHeight, close: () => URL.revokeObjectURL(url) };
}

const toBlob = (canvas: HTMLCanvasElement, type: string) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, QUALITY));

/**
 * Scales the photo down to MAX_SIDE and re-encodes it as WebP, or JPEG where
 * the browser cannot write WebP (it hands back PNG instead, which would be
 * larger than the original). If the browser cannot draw it at all, the
 * original goes up unchanged rather than failing the upload.
 */
export async function compressImage(file: File): Promise<Blob> {
  let image: Awaited<ReturnType<typeof decode>>;
  try {
    image = await decode(file);
  } catch {
    return file;
  }
  try {
    const scale = Math.min(1, MAX_SIDE / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    // A transparent PNG would turn black as a JPEG.
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image.source, 0, 0, canvas.width, canvas.height);
    let blob = await toBlob(canvas, "image/webp");
    if (!blob || blob.type !== "image/webp") blob = await toBlob(canvas, "image/jpeg");
    // Re-encoding an already small, already compressed file can grow it.
    return blob && (blob.size < file.size || scale < 1) ? blob : file;
  } finally {
    image.close();
  }
}

const EXT: Record<string, string> = { "image/webp": "webp", "image/jpeg": "jpg", "image/png": "png" };

/** Checks, compresses and uploads one photo; returns its public URL. */
export async function uploadGalleryImage(file: File): Promise<string> {
  validateImageFile(file);
  const blob = await compressImage(file);
  const type = blob.type || file.type;
  const path = `gallery/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${EXT[type] || "jpg"}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: type, upsert: false, cacheControl: "31536000" });
  if (error) throw new Error(describe(error));
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

/** The object's path inside the bucket, or null for an image hosted elsewhere. */
export function storagePathOf(imageUrl: string): string | null {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const at = imageUrl.indexOf(marker);
  return at < 0 ? null : decodeURIComponent(imageUrl.slice(at + marker.length).split("?")[0]);
}

const byDisplayOrder = (a: GalleryItem, b: GalleryItem) =>
  a.sortOrder - b.sortOrder || b.createdAt.localeCompare(a.createdAt);

/**
 * The gallery in display order -- the order the website uses. An admin also
 * gets hidden photos, which RLS returns only for their own organisation; the
 * organisation filter keeps another organisation's published photos out.
 */
export async function listGalleryItems(opts: { organizationId?: string | null; includeUnpublished?: boolean } = {}): Promise<GalleryItem[]> {
  let query = supabase.from("gallery_items").select("*");
  if (opts.organizationId) query = query.eq("organizationId", opts.organizationId);
  if (!opts.includeUnpublished) query = query.eq("isPublished", true);
  const { data, error } = await query.order("sortOrder", { ascending: true }).order("createdAt", { ascending: false });
  if (error) throw new Error(describe(error));
  return ((data ?? []) as GalleryItem[]).slice().sort(byDisplayOrder);
}

export async function createGalleryItem(item: {
  organizationId: string;
  imageUrl: string;
  title?: string | null;
  category?: string | null;
  sortOrder?: number;
  isPublished?: boolean;
}): Promise<GalleryItem> {
  const { data, error } = await supabase
    .from("gallery_items")
    .insert({
      organizationId: item.organizationId,
      imageUrl: item.imageUrl,
      title: item.title?.trim() || null,
      category: item.category?.trim() || null,
      sortOrder: item.sortOrder ?? 0,
      isPublished: item.isPublished ?? true,
    })
    .select()
    .single();
  if (error) throw new Error(describe(error));
  return data as GalleryItem;
}

export async function updateGalleryItem(id: string, patch: GalleryPatch): Promise<void> {
  const row: Record<string, unknown> = { ...patch, updatedAt: new Date().toISOString() };
  if ("title" in patch) row.title = patch.title?.trim() || null;
  if ("category" in patch) row.category = patch.category?.trim() || null;
  const { error } = await supabase.from("gallery_items").update(row).eq("id", id);
  if (error) throw new Error(describe(error));
}

/**
 * Removes the row, then its image. The row goes first: an orphaned file costs
 * a little storage, but a row whose image is gone shows a broken photo on
 * the website.
 */
export async function deleteGalleryItem(item: Pick<GalleryItem, "id" | "imageUrl">): Promise<void> {
  const { error } = await supabase.from("gallery_items").delete().eq("id", item.id);
  if (error) throw new Error(describe(error));
  const path = storagePathOf(item.imageUrl);
  if (path) await supabase.storage.from(BUCKET).remove([path]);
}

/**
 * Moves one photo a place up or down. Photos start out sharing sortOrder 0
 * (ordered by date), where swapping two equal numbers would change nothing,
 * so the whole list is numbered afresh. Returns the new list and the rows
 * whose number changed -- the ones to save.
 *
 * `visible` is the ids on screen when a category filter is on: the photo
 * trades places with its neighbour there, not with a hidden one in between.
 */
export function reorderGalleryItems(items: GalleryItem[], id: string, direction: "up" | "down", visible?: string[]) {
  const shown = visible ?? items.map((i) => i.id);
  const at = shown.indexOf(id);
  const neighbour = shown[direction === "up" ? at - 1 : at + 1];
  const from = items.findIndex((i) => i.id === id);
  const to = items.findIndex((i) => i.id === neighbour);
  if (at < 0 || from < 0 || to < 0) return { items, changed: [] as GalleryItem[] };
  const list = items.slice();
  [list[from], list[to]] = [list[to], list[from]];
  const changed: GalleryItem[] = [];
  const next = list.map((item, index) => {
    if (item.sortOrder === index) return item;
    const moved = { ...item, sortOrder: index };
    changed.push(moved);
    return moved;
  });
  return { items: next, changed };
}

/** Saves the numbers reorderGalleryItems changed. */
export async function saveGalleryOrder(changed: Pick<GalleryItem, "id" | "sortOrder">[]): Promise<void> {
  await Promise.all(changed.map((item) => updateGalleryItem(item.id, { sortOrder: item.sortOrder })));
}
