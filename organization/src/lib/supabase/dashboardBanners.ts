import { supabase } from "./client";

/**
 * The posters on the panel's dashboard (dashboard-banners.sql), edited under
 * Website -> Dashboard Posters. A poster is a text slide or, when it has an
 * image, the uploaded poster itself.
 */
export type BannerTone = "blue" | "orange" | "teal" | "red" | "purple" | "green";

export interface DashboardBanner {
  id: string;
  kicker: string;
  title: string;
  text: string;
  tone: BannerTone;
  imageUrl: string;
  linkUrl: string;
  sortOrder: number;
  isActive: boolean;
}

export const BANNER_TONES: Array<{ value: BannerTone; label: string; gradient: string }> = [
  { value: "blue", label: "Navy blue", gradient: "from-[#0b2350] via-[#163b86] to-[#1d4ed8]" },
  { value: "orange", label: "Orange", gradient: "from-[#7c2d12] via-[#c2410c] to-[#f97316]" },
  { value: "teal", label: "Teal", gradient: "from-[#134e4a] via-[#0f766e] to-[#14b8a6]" },
  { value: "red", label: "Red", gradient: "from-[#7f1d1d] via-[#b91c1c] to-[#ef4444]" },
  { value: "purple", label: "Purple", gradient: "from-[#3b0764] via-[#6d28d9] to-[#8b5cf6]" },
  { value: "green", label: "Green", gradient: "from-[#14532d] via-[#15803d] to-[#22c55e]" },
];

const toBanner = (r: Record<string, unknown>): DashboardBanner => ({
  id: String(r.id),
  kicker: String(r.kicker ?? ""),
  title: String(r.title ?? ""),
  text: String(r.text ?? ""),
  tone: (BANNER_TONES.some((t) => t.value === r.tone) ? r.tone : "blue") as BannerTone,
  imageUrl: String(r.imageUrl ?? ""),
  linkUrl: String(r.linkUrl ?? ""),
  sortOrder: Number(r.sortOrder) || 0,
  isActive: r.isActive !== false,
});

/** Every poster in display order; `activeOnly` for the dashboard. Null when the table is not set up yet. */
export async function listDashboardBanners(activeOnly = false): Promise<DashboardBanner[] | null> {
  let query = supabase.from("dashboard_banners").select("*").order("sortOrder").order("createdAt");
  if (activeOnly) query = query.eq("isActive", true);
  const { data, error } = await query;
  if (error) {
    if (error.code === "42P01" || /dashboard_banners/.test(error.message)) return null;
    throw new Error(error.message);
  }
  return (data || []).map((r) => toBanner(r as Record<string, unknown>));
}

export async function saveDashboardBanner(organizationId: string, banner: Omit<DashboardBanner, "id"> & { id?: string }) {
  const row = {
    kicker: banner.kicker.trim() || null,
    title: banner.title.trim() || null,
    text: banner.text.trim() || null,
    tone: banner.tone,
    imageUrl: banner.imageUrl.trim() || null,
    linkUrl: banner.linkUrl.trim() || null,
    sortOrder: banner.sortOrder,
    isActive: banner.isActive,
    updatedAt: new Date().toISOString(),
  };
  const { error } = banner.id
    ? await supabase.from("dashboard_banners").update(row).eq("id", banner.id)
    : await supabase.from("dashboard_banners").insert({ ...row, organizationId });
  if (error) throw new Error(error.message);
}

export async function deleteDashboardBanner(id: string) {
  const { error } = await supabase.from("dashboard_banners").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
