import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, ImagePlus, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { DceBadge, DceButton, DceInput, DcePanel, DceSelect, DceTextarea } from "@/components/dce/Dce";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { uploadWebsiteImage } from "@/lib/supabase/gallery";
import {
  BANNER_TONES,
  deleteDashboardBanner,
  listDashboardBanners,
  saveDashboardBanner,
  type BannerTone,
  type DashboardBanner,
} from "@/lib/supabase/dashboardBanners";

/**
 * The posters at the top of the dashboard, which every centre sees after
 * logging in. Each is a text slide (badge, heading, a line, a colour) or an
 * uploaded poster image, with an optional link; the dashboard rotates the
 * active ones in this order every six seconds.
 */

type Draft = Omit<DashboardBanner, "id"> & { id?: string };
const blank = (order: number): Draft => ({ kicker: "", title: "", text: "", tone: "blue", imageUrl: "", linkUrl: "", sortOrder: order, isActive: true });
const gradientOf = (tone: string) => (BANNER_TONES.find((t) => t.value === tone) ?? BANNER_TONES[0]).gradient;

function Preview({ b }: { b: Draft }) {
  if (b.imageUrl) return <img src={b.imageUrl} alt="" className="block max-h-[220px] w-full rounded-sm object-cover" />;
  return (
    <div className={`relative overflow-hidden rounded-sm bg-gradient-to-r ${gradientOf(b.tone)} px-6 py-6 text-white`}>
      <div aria-hidden className="pointer-events-none absolute -right-10 -top-16 h-44 w-44 rounded-full bg-white/10" />
      {b.kicker && <span className="inline-block rounded bg-[#fbbf24] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#1f1300]">{b.kicker}</span>}
      <p className="mt-2 text-[20px] font-extrabold leading-tight">{b.title || "Heading"}</p>
      {b.text && <p className="mt-1.5 max-w-xl text-[13px] text-white/85">{b.text}</p>}
    </div>
  );
}

export default function DashboardPosters() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rows, setRows] = useState<DashboardBanner[] | null>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const file = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await listDashboardBanners(false));
    } catch (e) {
      toast({ title: "Could not load the posters", description: e instanceof Error ? e.message : undefined, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);
  useEffect(() => {
    void load();
  }, [load]);

  const list = rows ?? [];
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => (d ? { ...d, [k]: v } : d));

  const save = async (b: Draft) => {
    if (!user?.organizationId) return;
    if (!b.imageUrl && !b.title.trim()) return toast({ title: "Add a heading or upload a poster image", variant: "destructive" });
    if (b.linkUrl.trim() && !/^(https:\/\/|\/)/.test(b.linkUrl.trim())) {
      return toast({ title: "Link must start with https:// or /", description: "e.g. /branch/wallet or https://www.careeropticscomputer.in", variant: "destructive" });
    }
    setBusy(true);
    try {
      await saveDashboardBanner(user.organizationId, b);
      toast({ title: b.id ? "Poster updated" : "Poster added", description: "Every dashboard shows it on the next visit." });
      setDraft(null);
      await load();
    } catch (e) {
      toast({ title: "Could not save the poster", description: e instanceof Error ? e.message : undefined, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const upload = async (f: File | undefined) => {
    if (!f) return;
    setBusy(true);
    try {
      const url = await uploadWebsiteImage(f, "dashboard-posters");
      set("imageUrl", url);
    } catch (e) {
      toast({ title: "Could not upload the image", description: e instanceof Error ? e.message : undefined, variant: "destructive" });
    } finally {
      setBusy(false);
      if (file.current) file.current.value = "";
    }
  };

  const move = async (k: number, dir: -1 | 1) => {
    const a = list[k];
    const b = list[k + dir];
    if (!a || !b) return;
    setBusy(true);
    try {
      await saveDashboardBanner(user!.organizationId!, { ...a, sortOrder: b.sortOrder === a.sortOrder ? a.sortOrder + dir : b.sortOrder });
      await saveDashboardBanner(user!.organizationId!, { ...b, sortOrder: a.sortOrder });
      await load();
    } catch (e) {
      toast({ title: "Could not reorder", description: e instanceof Error ? e.message : undefined, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const remove = async (b: DashboardBanner) => {
    if (!window.confirm(`Delete the poster "${b.title || b.kicker || "image"}"? This cannot be undone.`)) return;
    setBusy(true);
    try {
      await deleteDashboardBanner(b.id);
      await load();
    } catch (e) {
      toast({ title: "Could not delete", description: e instanceof Error ? e.message : undefined, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppLayout>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-[15px] font-bold uppercase tracking-wide text-slate-800">Dashboard Posters</h1>
          <p className="text-[12.5px] text-slate-500">The slides at the top of the dashboard — the admin's and every centre's. Active posters rotate in this order.</p>
        </div>
        <DceButton tone="red" onClick={() => setDraft(blank((list.at(-1)?.sortOrder ?? 0) + 1))} disabled={rows === null}>
          <Plus className="h-4 w-4" /> Add Poster
        </DceButton>
      </div>

      {rows === null && (
        <p className="mb-4 rounded border border-amber-300 bg-amber-50 p-3 text-[13px] text-amber-800">
          Posters are not set up in the database yet. Run supabase/schema/dashboard-banners.sql in Supabase.
        </p>
      )}

      {draft && (
        <DcePanel
          title={draft.id ? "Edit poster" : "New poster"}
          actions={<button aria-label="Close" onClick={() => setDraft(null)} className="rounded p-1 text-white hover:bg-white/10"><X className="h-4 w-4" /></button>}
          className="mb-5"
        >
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="space-y-3">
              <label className="block text-[13px] font-semibold text-slate-700">Poster image (optional)
                <span className="mt-1 flex items-center gap-2">
                  <DceButton type="button" tone="light" size="sm" onClick={() => file.current?.click()} disabled={busy}>
                    {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />} {draft.imageUrl ? "Change image" : "Upload image"}
                  </DceButton>
                  {draft.imageUrl && <DceButton type="button" tone="light" size="sm" onClick={() => set("imageUrl", "")}>Remove image</DceButton>}
                </span>
                <input ref={file} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => void upload(e.target.files?.[0])} />
                <span className="mt-1 block text-[11.5px] font-normal text-slate-500">A wide image, about 1600 × 320 px. With an image the poster shows only the image; leave it out for a text slide.</span>
              </label>
              <label className="block text-[13px] font-semibold text-slate-700">Badge
                <DceInput value={draft.kicker} onChange={(e) => set("kicker", e.target.value)} placeholder="e.g. Admission Open 2026–27" />
              </label>
              <label className="block text-[13px] font-semibold text-slate-700">Heading
                <DceInput value={draft.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Recharge your centre wallet" />
              </label>
              <label className="block text-[13px] font-semibold text-slate-700">Line below
                <DceTextarea rows={2} value={draft.text} onChange={(e) => set("text", e.target.value)} placeholder="One or two short sentences" />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-[13px] font-semibold text-slate-700">Colour
                  <DceSelect value={draft.tone} onChange={(e) => set("tone", e.target.value as BannerTone)}>
                    {BANNER_TONES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </DceSelect>
                </label>
                <label className="block text-[13px] font-semibold text-slate-700">Show
                  <DceSelect value={draft.isActive ? "yes" : "no"} onChange={(e) => set("isActive", e.target.value === "yes")}>
                    <option value="yes">Active</option>
                    <option value="no">Hidden</option>
                  </DceSelect>
                </label>
              </div>
              <label className="block text-[13px] font-semibold text-slate-700">Link when clicked (optional)
                <DceInput value={draft.linkUrl} onChange={(e) => set("linkUrl", e.target.value)} placeholder="/branch/wallet  or  https://…" />
              </label>
              <div className="flex gap-2 pt-1">
                <DceButton tone="green" onClick={() => void save(draft)} disabled={busy}>{busy ? "Saving…" : "Save poster"}</DceButton>
                <DceButton tone="light" onClick={() => setDraft(null)}>Cancel</DceButton>
              </div>
            </div>
            <div>
              <p className="mb-2 text-[13px] font-semibold text-slate-700">Preview</p>
              <Preview b={draft} />
            </div>
          </div>
        </DcePanel>
      )}

      <DcePanel title={`All posters (${list.length})`}>
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-slate-400" /></div>
        ) : list.length === 0 ? (
          <p className="py-8 text-center text-[13px] text-slate-500">No posters yet. The dashboard shows the wallet-recharge slide until you add one.</p>
        ) : (
          <ul className="space-y-4">
            {list.map((b, k) => (
              <li key={b.id} className="grid gap-4 rounded border p-3 md:grid-cols-[minmax(0,1fr)_220px]">
                <div className={b.isActive ? "" : "opacity-50"}><Preview b={b} /></div>
                <div className="flex flex-col gap-2 text-[13px]">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700">#{k + 1}</span>
                    <DceBadge status={b.isActive ? "ACTIVE" : "INACTIVE"} label={b.isActive ? "Active" : "Hidden"} />
                    {b.imageUrl && <span className="text-[11.5px] text-slate-500">Image poster</span>}
                  </div>
                  {b.linkUrl && <span className="truncate text-[11.5px] text-slate-500">Link: {b.linkUrl}</span>}
                  <div className="mt-auto flex flex-wrap gap-1.5">
                    <DceButton size="sm" tone="blue" onClick={() => setDraft({ ...b })}><Pencil className="h-3.5 w-3.5" /> Edit</DceButton>
                    <DceButton size="sm" tone="light" onClick={() => void save({ ...b, isActive: !b.isActive })} disabled={busy} title={b.isActive ? "Hide" : "Show"}>
                      {b.isActive ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </DceButton>
                    <DceButton size="sm" tone="light" onClick={() => void move(k, -1)} disabled={busy || k === 0} title="Move up"><ArrowUp className="h-3.5 w-3.5" /></DceButton>
                    <DceButton size="sm" tone="light" onClick={() => void move(k, 1)} disabled={busy || k === list.length - 1} title="Move down"><ArrowDown className="h-3.5 w-3.5" /></DceButton>
                    <DceButton size="sm" tone="red" onClick={() => void remove(b)} disabled={busy} title="Delete"><Trash2 className="h-3.5 w-3.5" /></DceButton>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </DcePanel>
    </AppLayout>
  );
}
