import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, ExternalLink, Eye, EyeOff, ImagePlus, Loader2, Pencil, Trash2, Upload, X } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { DceButton, DceInput, DcePanel, DceSelect, DceBadge } from "@/components/dce/Dce";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  GALLERY_CATEGORIES,
  createGalleryItem,
  deleteGalleryItem,
  listGalleryItems,
  reorderGalleryItems,
  saveGalleryOrder,
  updateGalleryItem,
  uploadGalleryImage,
  validateImageFile,
  type GalleryItem,
  type GalleryPatch,
} from "@/lib/supabase/gallery";

/** The website's gallery is the organisation's; a branch account only looks. */
const ADMIN_ROLES = ["SUPER_ADMIN", "ORGANIZATION_ADMIN"];
const ALL = "__all__";

type Pending = { key: string; file: File; preview: string; title: string };

const errorText = (error: unknown) => (error instanceof Error ? error.message : String(error));

export default function WebsiteGallery() {
  const { toast } = useToast();
  const { user, organizationId, actingAs } = useAuth();
  // Working as a centre is the centre's view, not the organisation's.
  const isAdmin = ADMIN_ROLES.includes(String(user?.role || "").toUpperCase()) && !actingAs;
  const orgId = organizationId || user?.organizationId || null;

  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [filter, setFilter] = useState(ALL);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await listGalleryItems({ organizationId: orgId, includeUnpublished: isAdmin }));
      setLoadError("");
    } catch (error) {
      setLoadError(errorText(error));
    } finally {
      setLoading(false);
    }
  }, [orgId, isAdmin]);

  useEffect(() => {
    load();
  }, [load]);

  const categories = useMemo(() => {
    const used = items.map((i) => i.category).filter((c): c is string => !!c);
    return [...new Set(used)].sort((a, b) => a.localeCompare(b));
  }, [items]);

  const visible = useMemo(() => (filter === ALL ? items : items.filter((i) => i.category === filter)), [items, filter]);

  // The filter can outlive its last photo (deleted or recategorised).
  useEffect(() => {
    if (filter !== ALL && !categories.includes(filter)) setFilter(ALL);
  }, [categories, filter]);

  const report = (error: unknown) => toast({ title: "Something went wrong", description: errorText(error), variant: "destructive" });

  const patch = async (item: GalleryItem, change: GalleryPatch) => {
    const before = items;
    setItems((list) => list.map((i) => (i.id === item.id ? { ...i, ...change } : i)));
    try {
      await updateGalleryItem(item.id, change);
    } catch (error) {
      setItems(before);
      report(error);
    }
  };

  const move = async (item: GalleryItem, direction: "up" | "down") => {
    const before = items;
    const { items: next, changed } = reorderGalleryItems(items, item.id, direction, visible.map((i) => i.id));
    if (!changed.length) return;
    setItems(next);
    try {
      await saveGalleryOrder(changed);
    } catch (error) {
      setItems(before);
      report(error);
    }
  };

  const remove = async (item: GalleryItem) => {
    try {
      await deleteGalleryItem(item);
      setItems((list) => list.filter((i) => i.id !== item.id));
      toast({ title: "Photo deleted" });
    } catch (error) {
      report(error);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-5">
        {isAdmin && (
          <UploadPanel
            orgId={orgId}
            // New photos go in front of everything already there.
            firstOrder={items.length ? Math.min(...items.map((i) => i.sortOrder)) : 0}
            categories={categories}
            onUploaded={(created) => setItems((list) => [...created, ...list])}
          />
        )}

        <DcePanel
          title={`WEBSITE GALLERY${items.length ? ` (${items.length})` : ""}`}
          actions={
            <a
              href="/gallery.html"
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-1.5 rounded bg-[#38c3be] px-3.5 py-2 text-[13px] font-medium text-white hover:bg-[#2fa9a5]"
            >
              <ExternalLink className="h-4 w-4" />
              View on website
            </a>
          }
        >
          {!isAdmin && (
            <p className="mb-4 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] text-amber-800">
              Only the organisation admin can add or change gallery photos. You are viewing the published gallery.
            </p>
          )}

          {categories.length > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-[13px] font-semibold text-slate-700">
                Category
                <DceSelect value={filter} onChange={(e) => setFilter(e.target.value)} className="w-56" aria-label="Filter by category">
                  <option value={ALL}>All categories</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </DceSelect>
              </label>
              <span className="text-[12.5px] text-slate-500">
                {visible.length} photo{visible.length === 1 ? "" : "s"}
              </span>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-[13px] text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading photos…
            </div>
          ) : loadError ? (
            <div className="rounded border border-red-200 bg-red-50 px-4 py-6 text-center text-[13px] text-red-700">
              <p>{loadError}</p>
              <DceButton tone="light" size="sm" className="mt-3" onClick={load}>Try again</DceButton>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded border border-dashed border-slate-300 py-16 text-center">
              <ImagePlus className="h-10 w-10 text-slate-300" />
              <p className="text-[14px] font-semibold text-slate-700">No photos in the gallery yet</p>
              <p className="max-w-sm text-[12.5px] text-slate-500">
                {isAdmin
                  ? "Upload photos of classrooms, the computer lab, events and students above. They appear on the website's Gallery page and home page."
                  : "Photos added by the organisation admin will appear here."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visible.map((item, index) => (
                <PhotoCard
                  key={item.id}
                  item={item}
                  canEdit={isAdmin}
                  categories={categories}
                  first={index === 0}
                  last={index === visible.length - 1}
                  onSave={(change) => patch(item, change)}
                  onMove={(direction) => move(item, direction)}
                  onDelete={() => remove(item)}
                />
              ))}
            </div>
          )}
        </DcePanel>
      </div>
    </AppLayout>
  );
}

/** Suggestions for the free-text category: the standard ones plus any in use. */
function CategoryList({ id, extra }: { id: string; extra: string[] }) {
  const all = [...new Set([...GALLERY_CATEGORIES, ...extra])];
  return (
    <datalist id={id}>
      {all.map((c) => (
        <option key={c} value={c} />
      ))}
    </datalist>
  );
}

function UploadPanel({
  orgId,
  firstOrder,
  categories,
  onUploaded,
}: {
  orgId: string | null;
  firstOrder: number;
  categories: string[];
  onUploaded: (items: GalleryItem[]) => void;
}) {
  const { toast } = useToast();
  const input = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<Pending[]>([]);
  const [category, setCategory] = useState("");
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  // Previews are object URLs, which hold the file in memory until revoked.
  const pendingRef = useRef(pending);
  pendingRef.current = pending;
  useEffect(() => () => pendingRef.current.forEach((p) => URL.revokeObjectURL(p.preview)), []);

  const pick = (files: FileList | null) => {
    if (!files?.length) return;
    const accepted: Pending[] = [];
    const rejected: string[] = [];
    for (const file of Array.from(files)) {
      try {
        validateImageFile(file);
        accepted.push({ key: `${file.name}-${file.size}-${Math.random()}`, file, preview: URL.createObjectURL(file), title: "" });
      } catch (error) {
        rejected.push(errorText(error));
      }
    }
    if (rejected.length) toast({ title: "Some files were skipped", description: rejected.join(" "), variant: "destructive" });
    setPending((list) => [...list, ...accepted]);
    if (input.current) input.current.value = "";
  };

  const drop = (key: string) =>
    setPending((list) => {
      const gone = list.find((p) => p.key === key);
      if (gone) URL.revokeObjectURL(gone.preview);
      return list.filter((p) => p.key !== key);
    });

  const upload = async () => {
    if (!orgId) {
      toast({ title: "No organisation", description: "Your account is not linked to an organisation.", variant: "destructive" });
      return;
    }
    const queue = pending;
    const created: GalleryItem[] = [];
    const failed: Pending[] = [];
    setProgress({ done: 0, total: queue.length });
    // One at a time: a classroom's uplink is often a phone hotspot.
    for (const [index, p] of queue.entries()) {
      try {
        const imageUrl = await uploadGalleryImage(p.file);
        created.push(
          await createGalleryItem({
            organizationId: orgId,
            imageUrl,
            title: p.title,
            category,
            sortOrder: firstOrder - queue.length + index,
          }),
        );
        URL.revokeObjectURL(p.preview);
      } catch (error) {
        failed.push(p);
        toast({ title: `Could not upload ${p.file.name}`, description: errorText(error), variant: "destructive" });
      }
      setProgress({ done: index + 1, total: queue.length });
    }
    setProgress(null);
    setPending(failed);
    if (created.length) {
      onUploaded(created);
      toast({ title: `${created.length} photo${created.length === 1 ? "" : "s"} added to the gallery` });
    }
  };

  const busy = progress !== null;

  return (
    <DcePanel title="ADD PHOTOS">
      <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold text-slate-700">Photos</span>
          <input
            ref={input}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            disabled={busy}
            aria-label="Choose photos"
            onChange={(e) => pick(e.target.files)}
            className="block w-full rounded border border-slate-300 bg-white text-[13px] text-slate-700 file:mr-3 file:border-0 file:bg-[#3d4451] file:px-3 file:py-2 file:text-white"
          />
          <span className="mt-1 block text-[11.5px] text-slate-500">JPG, PNG or WebP, up to 8 MB each. Large photos are resized before upload.</span>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold text-slate-700">Category for these photos</span>
          <DceInput
            list="gallery-upload-categories"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Computer Lab"
            disabled={busy}
          />
          <CategoryList id="gallery-upload-categories" extra={categories} />
        </label>
        <DceButton tone="green" onClick={upload} disabled={busy || pending.length === 0}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {busy ? `Uploading ${Math.min(progress.done + 1, progress.total)} of ${progress.total}…` : `Upload${pending.length ? ` ${pending.length}` : ""}`}
        </DceButton>
      </div>

      {pending.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {pending.map((p) => (
            <div key={p.key} className="overflow-hidden rounded border border-slate-200 bg-slate-50">
              <div className="relative aspect-[4/3] bg-slate-200">
                <img src={p.preview} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => drop(p.key)}
                  disabled={busy}
                  aria-label={`Remove ${p.file.name}`}
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="p-2">
                <DceInput
                  value={p.title}
                  onChange={(e) => setPending((list) => list.map((x) => (x.key === p.key ? { ...x, title: e.target.value } : x)))}
                  placeholder="Title (optional)"
                  aria-label={`Title for ${p.file.name}`}
                  disabled={busy}
                  className="px-2 py-1 text-[12px]"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </DcePanel>
  );
}

function PhotoCard({
  item,
  canEdit,
  categories,
  first,
  last,
  onSave,
  onMove,
  onDelete,
}: {
  item: GalleryItem;
  canEdit: boolean;
  categories: string[];
  first: boolean;
  last: boolean;
  onSave: (change: GalleryPatch) => Promise<void>;
  onMove: (direction: "up" | "down") => void;
  onDelete: () => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(item.title ?? "");
  const [category, setCategory] = useState(item.category ?? "");
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const startEdit = () => {
    setTitle(item.title ?? "");
    setCategory(item.category ?? "");
    setEditing(true);
  };

  const save = async () => {
    setEditing(false);
    await onSave({ title: title.trim() || null, category: category.trim() || null });
  };

  const listId = `gallery-cat-${item.id}`;

  return (
    <div className={`flex flex-col overflow-hidden rounded border bg-white ${item.isPublished ? "border-slate-200" : "border-dashed border-slate-300"}`}>
      <a href={item.imageUrl} target="_blank" rel="noopener" className="relative block aspect-[4/3] bg-slate-100">
        <img
          src={item.imageUrl}
          alt={item.title || item.category || "Gallery photo"}
          loading="lazy"
          className={`h-full w-full object-cover ${item.isPublished ? "" : "opacity-50"}`}
        />
        {!item.isPublished && (
          <span className="absolute left-2 top-2">
            <DceBadge status="INACTIVE" label="Hidden" />
          </span>
        )}
      </a>

      <div className="flex flex-1 flex-col gap-2 p-3">
        {editing ? (
          <>
            <DceInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" aria-label="Title" className="px-2 py-1.5" />
            <DceInput list={listId} value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" aria-label="Category" className="px-2 py-1.5" />
            <CategoryList id={listId} extra={categories} />
            <div className="flex gap-2">
              <DceButton size="sm" tone="green" onClick={save}>Save</DceButton>
              <DceButton size="sm" tone="light" onClick={() => setEditing(false)}>Cancel</DceButton>
            </div>
          </>
        ) : (
          <div className="min-h-[38px]">
            <p className="truncate text-[13px] font-semibold text-slate-800" title={item.title || undefined}>
              {item.title || <span className="font-normal italic text-slate-400">Untitled</span>}
            </p>
            <p className="truncate text-[12px] text-slate-500">{item.category || "No category"}</p>
          </div>
        )}

        {canEdit && !editing && (
          <div className="mt-auto flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-2">
            {confirming ? (
              <>
                <span className="text-[12px] font-semibold text-red-700">Delete this photo?</span>
                <DceButton
                  size="sm"
                  tone="red"
                  disabled={deleting}
                  onClick={async () => {
                    setDeleting(true);
                    await onDelete();
                    setDeleting(false);
                    setConfirming(false);
                  }}
                >
                  {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}Yes, delete
                </DceButton>
                <DceButton size="sm" tone="light" disabled={deleting} onClick={() => setConfirming(false)}>No</DceButton>
              </>
            ) : (
              <>
                <DceButton size="sm" tone="light" onClick={startEdit} aria-label="Edit title and category" title="Edit">
                  <Pencil className="h-3.5 w-3.5" />
                </DceButton>
                <DceButton
                  size="sm"
                  tone={item.isPublished ? "teal" : "light"}
                  onClick={() => onSave({ isPublished: !item.isPublished })}
                  aria-label={item.isPublished ? "Hide from website" : "Publish on website"}
                  title={item.isPublished ? "Published — click to hide" : "Hidden — click to publish"}
                >
                  {item.isPublished ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                </DceButton>
                <DceButton size="sm" tone="light" onClick={() => onMove("up")} disabled={first} aria-label="Move up" title="Move up">
                  <ArrowUp className="h-3.5 w-3.5" />
                </DceButton>
                <DceButton size="sm" tone="light" onClick={() => onMove("down")} disabled={last} aria-label="Move down" title="Move down">
                  <ArrowDown className="h-3.5 w-3.5" />
                </DceButton>
                <DceButton size="sm" tone="red" className="ml-auto" onClick={() => setConfirming(true)} aria-label="Delete photo" title="Delete">
                  <Trash2 className="h-3.5 w-3.5" />
                </DceButton>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
