import { useCallback, useEffect, useRef, useState } from "react";
import { ExternalLink, Eye, EyeOff, ImagePlus, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { DceBadge, DceButton, DceInput, DcePanel, DceSelect, DceTextarea } from "@/components/dce/Dce";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { uploadWebsiteImage } from "@/lib/supabase/gallery";
import {
  BLOG_CATEGORIES,
  blogSlug,
  deleteBlogPost,
  listBlogPosts,
  parseBlogBody,
  readMinutes,
  saveBlogPost,
  type BlogDraft,
  type BlogPost,
} from "@/lib/supabase/blog";
import { MAIN_SITE_ORIGIN } from "@/lib/branchSite";

/**
 * The website's blog, written here. A saved post shows on the website's Blog
 * page at once; a hidden one stays here only.
 */

const today = () => new Date().toISOString().slice(0, 10);
const blank = (): BlogDraft => ({ slug: "", title: "", excerpt: "", category: "Courses", coverUrl: "", body: "", publishedOn: today(), isPublished: true });
const postUrl = (slug: string) => `${MAIN_SITE_ORIGIN}/blog-post.html?p=${encodeURIComponent(slug)}`;
const longDate = (iso: string) => (iso ? new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "");

function BodyPreview({ body }: { body: string }) {
  const blocks = parseBlogBody(body);
  if (!blocks.length) return <p className="text-[12.5px] text-slate-400">The post appears here as you write.</p>;
  return (
    <div className="space-y-2 text-[13.5px] leading-6 text-slate-700">
      {blocks.map((b, i) =>
        b.type === "h2" ? (
          <h3 key={i} className="border-l-4 border-orange-500 pl-2 text-[15px] font-bold text-[#0b2350]">{b.text}</h3>
        ) : b.type === "p" ? (
          <p key={i}>{b.text}</p>
        ) : b.type === "ul" ? (
          <ul key={i} className="list-disc pl-5">{b.items.map((t, j) => <li key={j}>{t}</li>)}</ul>
        ) : (
          <ol key={i} className="list-decimal pl-5">{b.items.map((t, j) => <li key={j}>{t}</li>)}</ol>
        ),
      )}
    </div>
  );
}

export default function WebsiteBlog() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rows, setRows] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [setupError, setSetupError] = useState("");
  const [draft, setDraft] = useState<BlogDraft | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const file = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await listBlogPosts(user?.organizationId ?? null));
      setSetupError("");
    } catch (e) {
      setSetupError(e instanceof Error ? e.message : "Could not load the blog.");
    } finally {
      setLoading(false);
    }
  }, [user?.organizationId]);
  useEffect(() => {
    void load();
  }, [load]);

  const set = <K extends keyof BlogDraft>(k: K, v: BlogDraft[K]) =>
    setDraft((d) => {
      if (!d) return d;
      const next = { ...d, [k]: v };
      if (k === "title" && !slugTouched && !d.id) next.slug = blogSlug(String(v));
      return next;
    });

  const open = (d: BlogDraft) => {
    setSlugTouched(Boolean(d.id));
    setDraft(d);
  };

  const save = async (p: BlogDraft) => {
    if (!user?.organizationId) return;
    setBusy(true);
    try {
      await saveBlogPost(user.organizationId, p);
      toast({ title: p.id ? "Post updated" : "Post published", description: p.isPublished ? "It is on the website's Blog page now." : "Saved as hidden." });
      setDraft(null);
      await load();
    } catch (e) {
      toast({ title: "Could not save the post", description: e instanceof Error ? e.message : undefined, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const upload = async (f: File | undefined) => {
    if (!f) return;
    setBusy(true);
    try {
      set("coverUrl", await uploadWebsiteImage(f, "blog"));
    } catch (e) {
      toast({ title: "Could not upload the picture", description: e instanceof Error ? e.message : undefined, variant: "destructive" });
    } finally {
      setBusy(false);
      if (file.current) file.current.value = "";
    }
  };

  const remove = async (p: BlogPost) => {
    if (!window.confirm(`Delete the post "${p.title}"? It leaves the website and cannot be undone.`)) return;
    setBusy(true);
    try {
      await deleteBlogPost(p.id);
      toast({ title: "Post deleted" });
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
          <h1 className="text-[15px] font-bold uppercase tracking-wide text-slate-800">Website Blog</h1>
          <p className="text-[12.5px] text-slate-500">Posts written here appear on the website's Blog page straight away.</p>
        </div>
        <DceButton tone="red" onClick={() => open(blank())} disabled={!!setupError}>
          <Plus className="h-4 w-4" /> New Post
        </DceButton>
      </div>

      {setupError && <p className="mb-4 rounded border border-amber-300 bg-amber-50 p-3 text-[13px] text-amber-800">{setupError}</p>}

      {draft && (
        <DcePanel
          title={draft.id ? "Edit post" : "New post"}
          actions={<button aria-label="Close" onClick={() => setDraft(null)} className="rounded p-1 text-white hover:bg-white/10"><X className="h-4 w-4" /></button>}
          className="mb-5"
        >
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="space-y-3">
              <label className="block text-[13px] font-semibold text-slate-700">Title
                <DceInput value={draft.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. How to get a government job with a computer diploma" />
              </label>
              <label className="block text-[13px] font-semibold text-slate-700">Link (slug)
                <DceInput
                  value={draft.slug}
                  onChange={(e) => { setSlugTouched(true); set("slug", blogSlug(e.target.value)); }}
                  placeholder="made from the title"
                />
                <span className="mt-1 block break-all text-[11.5px] font-normal text-slate-500">{postUrl(draft.slug || "…")}</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                <label className="block text-[13px] font-semibold text-slate-700">Category
                  <DceSelect value={draft.category} onChange={(e) => set("category", e.target.value)}>
                    {[...new Set([...BLOG_CATEGORIES, draft.category].filter(Boolean))].map((c) => <option key={c} value={c}>{c}</option>)}
                  </DceSelect>
                </label>
                <label className="block text-[13px] font-semibold text-slate-700">Date
                  <DceInput type="date" value={draft.publishedOn} onChange={(e) => set("publishedOn", e.target.value)} />
                </label>
                <label className="block text-[13px] font-semibold text-slate-700">Show
                  <DceSelect value={draft.isPublished ? "yes" : "no"} onChange={(e) => set("isPublished", e.target.value === "yes")}>
                    <option value="yes">Published</option>
                    <option value="no">Hidden</option>
                  </DceSelect>
                </label>
              </div>
              <label className="block text-[13px] font-semibold text-slate-700">Cover picture
                <span className="mt-1 flex items-center gap-2">
                  <DceButton type="button" tone="light" size="sm" onClick={() => file.current?.click()} disabled={busy}>
                    {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />} {draft.coverUrl ? "Change picture" : "Upload picture"}
                  </DceButton>
                  {draft.coverUrl && <DceButton type="button" tone="light" size="sm" onClick={() => set("coverUrl", "")}>Remove</DceButton>}
                </span>
                <input ref={file} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => void upload(e.target.files?.[0])} />
              </label>
              {draft.coverUrl && <img src={draft.coverUrl} alt="" className="max-h-40 rounded border object-cover" />}
              <label className="block text-[13px] font-semibold text-slate-700">Short summary
                <DceTextarea rows={2} value={draft.excerpt} onChange={(e) => set("excerpt", e.target.value)} placeholder="One or two sentences, shown on the Blog page card" />
              </label>
              <label className="block text-[13px] font-semibold text-slate-700">Post
                <DceTextarea rows={14} value={draft.body} onChange={(e) => set("body", e.target.value)} placeholder={"Write the post here.\n\n## A heading\n- a point\n- another point\n1. a numbered step"} />
                <span className="mt-1 block text-[11.5px] font-normal text-slate-500">
                  Leave an empty line between paragraphs. Start a line with <b>##</b> for a heading, <b>-</b> for a bullet, <b>1.</b> for a numbered step.
                </span>
              </label>
              <div className="flex gap-2 pt-1">
                <DceButton tone="green" onClick={() => void save(draft)} disabled={busy}>{busy ? "Saving…" : "Save post"}</DceButton>
                <DceButton tone="light" onClick={() => setDraft(null)}>Cancel</DceButton>
              </div>
            </div>
            <div>
              <p className="mb-2 text-[13px] font-semibold text-slate-700">Preview · {readMinutes(draft.body)} min read</p>
              <div className="rounded border bg-white p-4">
                {draft.coverUrl && <img src={draft.coverUrl} alt="" className="mb-3 aspect-[16/8] w-full rounded object-cover" />}
                <span className="text-[11px] font-bold uppercase tracking-wider text-orange-500">{draft.category}</span>
                <h2 className="mb-3 mt-1 text-[20px] font-extrabold leading-tight text-[#0b2350]">{draft.title || "Title"}</h2>
                <BodyPreview body={draft.body} />
              </div>
            </div>
          </div>
        </DcePanel>
      )}

      <DcePanel title={`All posts (${rows.length})`}>
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-slate-400" /></div>
        ) : rows.length === 0 ? (
          <p className="py-8 text-center text-[13px] text-slate-500">No posts yet. The website keeps showing its four built-in articles; posts you add appear above them.</p>
        ) : (
          <ul className="divide-y">
            {rows.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-3 py-3">
                {p.coverUrl ? <img src={p.coverUrl} alt="" className="h-14 w-20 rounded object-cover" /> : <div className="h-14 w-20 rounded bg-slate-100" />}
                <div className={`min-w-0 flex-1 ${p.isPublished ? "" : "opacity-60"}`}>
                  <p className="truncate text-[14px] font-semibold text-slate-800">{p.title}</p>
                  <p className="text-[12px] text-slate-500">{p.category} · {longDate(p.publishedOn)}</p>
                </div>
                <DceBadge status={p.isPublished ? "ACTIVE" : "INACTIVE"} label={p.isPublished ? "Published" : "Hidden"} />
                <div className="flex flex-wrap gap-1.5">
                  <DceButton size="sm" tone="blue" aria-label={`Edit post ${p.title}`} onClick={() => open({ ...p })}><Pencil className="h-3.5 w-3.5" /> Edit</DceButton>
                  <DceButton size="sm" tone="light" onClick={() => void save({ ...p, isPublished: !p.isPublished })} disabled={busy} title={p.isPublished ? "Hide" : "Publish"}>
                    {p.isPublished ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </DceButton>
                  {p.isPublished && (
                    <a className="inline-flex items-center rounded border px-2 text-slate-600 hover:bg-slate-50" href={postUrl(p.slug)} target="_blank" rel="noreferrer" title="Open on the website">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                  <DceButton size="sm" tone="red" aria-label={`Delete post ${p.title}`} onClick={() => void remove(p)} disabled={busy}><Trash2 className="h-3.5 w-3.5" /></DceButton>
                </div>
              </li>
            ))}
          </ul>
        )}
      </DcePanel>
    </AppLayout>
  );
}
