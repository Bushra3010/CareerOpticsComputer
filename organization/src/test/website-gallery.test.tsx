import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import type { GalleryItem } from "@/lib/supabase/gallery";

const upload = vi.fn();
vi.mock("@/lib/supabase/client", () => ({
  supabase: { storage: { from: () => ({ upload, getPublicUrl: () => ({ data: { publicUrl: "" } }) }) } },
}));

const toast = vi.fn();
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast }) }));
vi.mock("@/components/layout/AppLayout", () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "u1", role: "ORGANIZATION_ADMIN", organizationId: "org1" }, organizationId: "org1", actingAs: null }),
}));

// Only the read is faked; everything else is the module itself.
const listGalleryItems = vi.fn();
vi.mock("@/lib/supabase/gallery", async (original) => ({
  ...(await original<typeof import("@/lib/supabase/gallery")>()),
  listGalleryItems: (...args: unknown[]) => listGalleryItems(...args),
}));

const gallery = await import("@/lib/supabase/gallery");
const WebsiteGallery = (await import("@/pages/website/WebsiteGallery")).default;

const item = (id: string, sortOrder: number, extra: Partial<GalleryItem> = {}): GalleryItem => ({
  id,
  organizationId: "org1",
  title: null,
  category: null,
  imageUrl: `https://x.supabase.co/storage/v1/object/public/website/gallery/${id}.webp`,
  sortOrder,
  isPublished: true,
  createdAt: "2026-10-01T00:00:00Z",
  updatedAt: "2026-10-01T00:00:00Z",
  ...extra,
});

describe("gallery module", () => {
  beforeEach(() => upload.mockReset());

  it("rejects a file that is not an image, before uploading anything", async () => {
    const file = new File(["hello"], "notes.txt", { type: "text/plain" });
    await expect(gallery.uploadGalleryImage(file)).rejects.toThrow(/not a JPG, PNG or WebP/);
    expect(upload).not.toHaveBeenCalled();
  });

  it("rejects an image over 8 MB", () => {
    const big = new File([new Uint8Array(gallery.MAX_UPLOAD_BYTES + 1)], "huge.jpg", { type: "image/jpeg" });
    expect(() => gallery.validateImageFile(big)).toThrow(/8 MB/);
  });

  it("swaps sortOrder with the neighbour, numbering photos that shared one", () => {
    const { items, changed } = gallery.reorderGalleryItems([item("a", 0), item("b", 0), item("c", 0)], "b", "up");
    expect(items.map((i) => [i.id, i.sortOrder])).toEqual([["b", 0], ["a", 1], ["c", 2]]);
    expect(changed.map((i) => i.id).sort()).toEqual(["a", "c"]);
  });

  it("swaps two numbered photos and saves only those two", () => {
    const { items, changed } = gallery.reorderGalleryItems([item("a", 0), item("b", 1), item("c", 2)], "b", "down");
    expect(items.map((i) => [i.id, i.sortOrder])).toEqual([["a", 0], ["c", 1], ["b", 2]]);
    expect(changed.map((i) => [i.id, i.sortOrder])).toEqual([["c", 1], ["b", 2]]);
  });

  it("moves past photos hidden by a category filter", () => {
    const list = [item("a", 0), item("b", 1), item("c", 2)];
    const { items } = gallery.reorderGalleryItems(list, "c", "up", ["a", "c"]);
    expect(items.map((i) => i.id)).toEqual(["c", "b", "a"]);
  });

  it("leaves the first photo where it is when moved up", () => {
    const list = [item("a", 0), item("b", 1)];
    expect(gallery.reorderGalleryItems(list, "a", "up").changed).toEqual([]);
  });

  it("finds the storage path of an uploaded photo", () => {
    expect(gallery.storagePathOf(item("p1", 0).imageUrl)).toBe("gallery/p1.webp");
    expect(gallery.storagePathOf("https://elsewhere.example/p.jpg")).toBeNull();
  });
});

describe("Website Gallery page", () => {
  async function renderPage(items: GalleryItem[]) {
    listGalleryItems.mockReset().mockResolvedValue(items);
    render(<MemoryRouter><WebsiteGallery /></MemoryRouter>);
  }

  it("shows the empty state when there are no photos", async () => {
    await renderPage([]);
    expect(await screen.findByText("No photos in the gallery yet")).toBeInTheDocument();
    expect(listGalleryItems).toHaveBeenCalledWith({ organizationId: "org1", includeUnpublished: true });
    expect(screen.getByText("ADD PHOTOS")).toBeInTheDocument();
  });

  it("lists the photos with their titles, categories and hidden state", async () => {
    await renderPage([
      item("a", 0, { title: "New lab", category: "Computer Lab" }),
      item("b", 1, { title: "Annual function", category: "Events", isPublished: false }),
    ]);
    expect(await screen.findByText("New lab")).toBeInTheDocument();
    expect(screen.getByText("Annual function")).toBeInTheDocument();
    expect(screen.getByText("Hidden")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Computer Lab" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Move up" })[0]).toBeDisabled();
    expect(screen.getByText("WEBSITE GALLERY (2)")).toBeInTheDocument();
  });
});
