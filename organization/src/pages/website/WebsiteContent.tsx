import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Crosshair, Eye, EyeOff, ExternalLink, Link2, Loader2, MousePointerClick, Pencil, RotateCcw, Save, Undo2, Upload } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  EMPTY_SETTINGS,
  getPageContent,
  getWebsitePages,
  getWebsiteSettings,
  isLayoutKey,
  savePageContent,
  saveWebsiteSettings,
  uploadWebsiteImage,
  type PageContent,
  type WebsiteEdit,
  type WebsitePage,
  type WebsiteSettings,
} from "@/lib/supabase/websiteContent";

/** What the page in the frame reports about an element clicked in it. */
type Selection = {
  key: string;
  tag: string;
  kind: "text" | "image" | "block";
  text: string;
  src: string | null;
  href: string | null;
  hidden: boolean;
};

/** One editable text or image, as website/public/cms.js lists it. */
type Field = {
  key: string;
  tag: string;
  kind: "text" | "image";
  label: string;
  text: string;
  /** Text split across bold, line breaks and the like: edited on the page. */
  rich: boolean;
  src: string | null;
  href: string | null;
  hidden: boolean;
};

/** A section of the page and what can be changed inside it. */
type Section = { key: string; tag: string; name: string; shared: boolean; hidden: boolean; fields: Field[] };

type Saved = { page: PageContent; layout: PageContent };
const EMPTY_SAVED: Saved = { page: { edits: {} }, layout: { edits: {} } };

const pageLabel = (p: WebsitePage) => {
  const name = p.name === "index" ? "Home" : p.name.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return p.heading && p.name !== "index" ? `${name} — ${p.heading}` : name;
};

const fieldId = (key: string) => `cms-field-${key.replace(/[^a-z0-9]/gi, "-")}`;

export default function WebsiteContent() {
  return (
    <AppLayout>
      <PageHeader
        title="Website Content"
        description="Pick a page, open a section and change its text and images. Changes go live as soon as they are saved."
        breadcrumbs={[{ label: "Main Website" }, { label: "Website Content" }]}
        actions={
          <Button variant="outline" asChild>
            <a href="/" target="_blank" rel="noopener"><ExternalLink className="mr-2 h-4 w-4" />Open website</a>
          </Button>
        }
      />
      <Tabs defaultValue="pages">
        <TabsList>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="details">Contact & announcement</TabsTrigger>
        </TabsList>
        <TabsContent value="pages"><PageEditor /></TabsContent>
        <TabsContent value="details"><SiteDetails /></TabsContent>
      </Tabs>
    </AppLayout>
  );
}

function PageEditor() {
  const { toast } = useToast();
  const { user } = useAuth();
  const frame = useRef<HTMLIFrameElement>(null);
  const [pages, setPages] = useState<WebsitePage[]>([]);
  const [page, setPage] = useState("index");
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [frameKey, setFrameKey] = useState(0);
  const [saved, setSaved] = useState<Saved>(EMPTY_SAVED);
  const [pending, setPending] = useState<Record<string, WebsiteEdit | null>>({});
  const [texts, setTexts] = useState<Record<string, string>>({});
  const [title, setTitle] = useState<string | null>(null);
  const [outline, setOutline] = useState<Section[] | null>(null);
  const [openSection, setOpenSection] = useState("");
  const [activeField, setActiveField] = useState<string | null>(null);
  const [block, setBlock] = useState<Selection | null>(null);
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState("");

  const changeCount = Object.keys(pending).length + (title !== null ? 1 : 0);
  const dirty = changeCount > 0;
  // Read by the message handler, which is registered once.
  const pendingRef = useRef(pending);
  pendingRef.current = pending;
  const outlineRef = useRef(outline);
  outlineRef.current = outline;

  useEffect(() => {
    getWebsitePages().then(setPages).catch(() => setPages([{ name: "index", heading: "" }]));
  }, []);

  const loadSaved = useCallback(async (name: string) => {
    try {
      setSaved(await getPageContent(name));
      setLoadError("");
    } catch (error) {
      setSaved(EMPTY_SAVED);
      setLoadError(error instanceof Error ? error.message : "Could not load the saved content.");
    }
  }, []);

  useEffect(() => { void loadSaved(page); }, [page, loadSaved]);

  const post = useCallback((msg: Record<string, unknown>) =>
    frame.current?.contentWindow?.postMessage({ source: "cms-editor", ...msg }, window.location.origin), []);

  /** Opens the section holding a key and brings its field into view. */
  const reveal = useCallback((key: string) => {
    const section = outlineRef.current?.find((s) => s.key === key || s.fields.some((f) => f.key === key));
    if (!section) return false;
    setOpenSection(section.key);
    setActiveField(key);
    setTimeout(() => document.getElementById(fieldId(key))?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 250);
    return true;
  }, []);

  // Messages from website/public/cms.js running in the frame.
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.source !== frame.current?.contentWindow) return;
      const m = e.data;
      if (!m || m.source !== "cms-page") return;
      if (m.type === "ready") {
        setOutline(m.outline ?? []);
        // A reloaded frame shows what is saved; lay the unsaved edits back on.
        for (const [key, edit] of Object.entries(pendingRef.current)) {
          if (edit) post({ type: "apply", key, tag: edit.tag, patch: edit });
        }
      }
      if (m.type === "select") {
        if (!m.key) { setBlock(null); setActiveField(null); return; }
        const isField = outlineRef.current?.some((s) => s.fields.some((f) => f.key === m.key));
        setBlock(isField ? null : (m as Selection));
        reveal(m.key);
      }
      if (m.type === "change") {
        setPending((p) => ({ ...p, [m.key]: { ...p[m.key], tag: m.tag, ...m.patch } }));
        if (typeof m.text === "string") setTexts((t) => ({ ...t, [m.key]: m.text }));
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [post, reveal]);

  /** Records a change to one element and shows it in the frame at once. */
  const change = (key: string, tag: string, patch: WebsiteEdit) => {
    setPending((p) => ({ ...p, [key]: { ...p[key], tag, ...patch } }));
    post({ type: "apply", key, tag, patch });
    if (block?.key === key) setBlock({ ...block, ...patch } as Selection);
  };

  const setText = (field: Field, text: string) => {
    setTexts((t) => ({ ...t, [field.key]: text }));
    post({ type: "setText", key: field.key, text }); // the frame answers with the new HTML
  };

  const isEdited = (key: string) => key in pending || key in saved.page.edits || key in saved.layout.edits;
  const isHidden = (key: string, fallback: boolean) => pending[key]?.hidden ?? fallback;

  const confirmLeave = () => !dirty || window.confirm("You have unsaved changes on this page. Discard them?");

  const reset = () => {
    setPending({});
    setTexts({});
    setTitle(null);
    setBlock(null);
    setActiveField(null);
    setOutline(null);
    setFrameKey((k) => k + 1);
  };

  const switchPage = (name: string) => {
    if (name === page || !confirmLeave()) return;
    setPage(name);
    setOpenSection("");
    reset();
  };

  // In preview the visitor may follow links; keep the picker on the page shown.
  const onFrameLoad = () => {
    try {
      const path = frame.current?.contentWindow?.location.pathname ?? "";
      const name = path.split("/").pop()?.replace(/\.html$/, "") || "index";
      if (mode === "preview" && name !== page && pages.some((p) => p.name === name)) setPage(name);
    } catch { /* another origin: nothing to sync */ }
  };

  const save = async () => {
    setBusy(true);
    try {
      const nextSaved = title !== null ? { ...saved, page: { ...saved.page, title: title.trim() || undefined } } : saved;
      const merged = await savePageContent(page, nextSaved, pending, user?.id);
      setSaved(merged);
      toast({ title: "Website updated", description: `${changeCount} change(s) are live now.` });
      reset();
    } catch (error) {
      toast({ title: "Could not save", description: error instanceof Error ? error.message : undefined, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  /** Puts one element back to what the page file says. */
  const revert = (key: string) => {
    const hasSaved = key in saved.page.edits || key in saved.layout.edits;
    setPending((p) => {
      const next = { ...p };
      if (hasSaved) next[key] = null;
      else delete next[key];
      return next;
    });
    setTexts((t) => { const next = { ...t }; delete next[key]; return next; });
    setBlock(null);
    if (hasSaved) toast({ title: "Will go back to the original", description: "Save to apply it. The preview refreshes after saving." });
    else { setOutline(null); setFrameKey((k) => k + 1); } // reload; the other unsaved edits are laid back on
  };

  const uploadImage = (field: Field) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "File too large", description: "Images must be 5MB or smaller.", variant: "destructive" });
        return;
      }
      setBusy(true);
      try {
        change(field.key, field.tag, { src: await uploadWebsiteImage(file) });
      } catch (error) {
        toast({ title: "Upload failed", description: error instanceof Error ? error.message : undefined, variant: "destructive" });
      } finally {
        setBusy(false);
      }
    };
    input.click();
  };

  const locate = (key: string) => { setActiveField(key); post({ type: "focus", key }); };

  const sortedPages = useMemo(() => [...pages].sort((a, b) => (a.name === "index" ? -1 : b.name === "index" ? 1 : pageLabel(a).localeCompare(pageLabel(b)))), [pages]);
  const editedIn = (section: Section) => section.fields.filter((f) => isEdited(f.key)).length + (isEdited(section.key) ? 1 : 0);

  const renderField = (field: Field) => {
    const hidden = isHidden(field.key, field.hidden);
    const value = texts[field.key] ?? field.text;
    const src = pending[field.key]?.src ?? field.src ?? "";
    const href = pending[field.key]?.href ?? field.href;
    return (
      <div
        key={field.key}
        id={fieldId(field.key)}
        className={`space-y-2 rounded-lg border p-3 transition-colors ${activeField === field.key ? "border-primary bg-primary/5" : "bg-card"} ${hidden ? "opacity-60" : ""}`}
        onFocus={() => { if (activeField !== field.key) locate(field.key); }}
      >
        <div className="flex items-center gap-1">
          <span className="text-xs font-medium text-muted-foreground">{field.label}</span>
          {isEdited(field.key) && <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">Edited</Badge>}
          {hidden && <Badge variant="outline" className="h-5 px-1.5 text-[10px]">Hidden</Badge>}
          <div className="ml-auto flex">
            <Button type="button" size="icon" variant="ghost" className="h-7 w-7" title="Show on page" aria-label={`Show ${field.label} on page`} onClick={() => locate(field.key)}><Crosshair className="h-3.5 w-3.5" /></Button>
            <Button type="button" size="icon" variant="ghost" className="h-7 w-7" title={hidden ? "Show again" : "Hide from website"} aria-label={hidden ? `Show ${field.label} again` : `Hide ${field.label}`} onClick={() => change(field.key, field.tag, { hidden: !hidden })}>{hidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}</Button>
            {isEdited(field.key) && <Button type="button" size="icon" variant="ghost" className="h-7 w-7" title="Back to original" aria-label={`Reset ${field.label}`} onClick={() => revert(field.key)}><RotateCcw className="h-3.5 w-3.5" /></Button>}
          </div>
        </div>

        {field.kind === "image" ? (
          <div className="flex gap-3">
            {src && <img src={src} alt="" className="h-16 w-20 shrink-0 rounded-md border bg-muted object-contain" />}
            <div className="min-w-0 flex-1 space-y-2">
              <Button type="button" size="sm" variant="outline" className="w-full" disabled={busy} onClick={() => uploadImage(field)}><Upload className="mr-2 h-3.5 w-3.5" />Change image</Button>
              <Input aria-label="Image URL" className="h-8 text-xs" value={src} onChange={(e) => change(field.key, field.tag, { src: e.target.value })} />
            </div>
          </div>
        ) : field.rich ? (
          <div className="space-y-2">
            <p className="line-clamp-3 text-sm">{field.text}</p>
            <Button type="button" size="sm" variant="outline" onClick={() => { locate(field.key); toast({ title: "Edit it on the page", description: "This text has bold words or line breaks. Click the highlighted text in the preview and type." }); }}><MousePointerClick className="mr-2 h-3.5 w-3.5" />Edit on page</Button>
          </div>
        ) : value.length > 70 || field.tag === "p" ? (
          <Textarea aria-label={field.label} rows={Math.min(6, Math.max(2, Math.ceil(value.length / 45)))} value={value} onChange={(e) => setText(field, e.target.value.replace(/\n/g, " "))} />
        ) : (
          <Input aria-label={field.label} value={value} onChange={(e) => setText(field, e.target.value)} />
        )}

        {field.kind === "text" && href !== null && (
          <div className="flex items-center gap-2">
            <Link2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <Input aria-label="Link goes to" className="h-8 text-xs" value={href} onChange={(e) => change(field.key, field.tag, { href: e.target.value })} />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={page} onValueChange={switchPage}>
          <SelectTrigger className="w-full sm:w-80" aria-label="Page"><SelectValue /></SelectTrigger>
          <SelectContent className="max-h-80">
            {sortedPages.map((p) => <SelectItem key={p.name} value={p.name}>{pageLabel(p)}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex rounded-lg border p-0.5">
          <Button size="sm" variant={mode === "edit" ? "default" : "ghost"} onClick={() => { if (mode !== "edit" && confirmLeave()) { setMode("edit"); reset(); } }}><Pencil className="mr-1.5 h-3.5 w-3.5" />Edit</Button>
          <Button size="sm" variant={mode === "preview" ? "default" : "ghost"} onClick={() => { if (mode !== "preview" && confirmLeave()) { setMode("preview"); reset(); } }}><Eye className="mr-1.5 h-3.5 w-3.5" />Preview</Button>
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" disabled={!dirty || busy} onClick={reset}><Undo2 className="mr-2 h-4 w-4" />Discard</Button>
          <Button disabled={!dirty || busy} onClick={save}>{busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}{dirty ? `Save (${changeCount})` : "Save"}</Button>
        </div>
      </div>

      {loadError && <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{loadError}</p>}

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_400px]">
        <div className="overflow-hidden rounded-xl border bg-white">
          <iframe
            key={`${page}-${mode}-${frameKey}`}
            ref={frame}
            title="Website page"
            src={`/${page}.html${mode === "edit" ? "?cms-edit=1" : ""}`}
            onLoad={onFrameLoad}
            className="h-[calc(100vh-15rem)] min-h-[480px] w-full"
          />
        </div>

        <Card className="flex max-h-[calc(100vh-15rem)] min-h-[480px] flex-col overflow-hidden">
          <CardHeader className="space-y-3 border-b pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Sections</CardTitle>
              {outline && <span className="text-xs text-muted-foreground">{outline.length} on this page</span>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cms-title" className="text-xs text-muted-foreground">Browser tab title</Label>
              <Input id="cms-title" className="h-8" placeholder="Same as the page file" value={title ?? saved.page.title ?? ""} onChange={(e) => setTitle(e.target.value)} />
            </div>
            {block && (
              <div className="flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/5 p-2 text-xs">
                <span className="min-w-0 flex-1 truncate">Selected block on the page</span>
                <Button size="sm" variant="outline" className="h-7" onClick={() => change(block.key, block.tag, { hidden: !isHidden(block.key, block.hidden) })}>{isHidden(block.key, block.hidden) ? "Show again" : "Hide"}</Button>
                {isEdited(block.key) && <Button size="sm" variant="ghost" className="h-7" onClick={() => revert(block.key)}>Original</Button>}
              </div>
            )}
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-3">
            {mode === "preview" ? (
              <p className="p-2 text-sm text-muted-foreground">Preview shows the page as visitors see it. Switch to Edit to change it.</p>
            ) : !outline ? (
              <p className="flex items-center gap-2 p-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Reading the page…</p>
            ) : (
              <Accordion type="single" collapsible value={openSection} onValueChange={setOpenSection} className="space-y-2">
                {outline.map((section, i) => {
                  const hidden = isHidden(section.key, section.hidden);
                  const edited = editedIn(section);
                  return (
                    <AccordionItem key={section.key} value={section.key} className={`rounded-lg border px-3 ${hidden ? "opacity-60" : ""}`}>
                      <AccordionTrigger className="py-3 hover:no-underline" onClick={() => post({ type: "focus", key: section.key })}>
                        <div className="flex min-w-0 flex-1 items-center gap-2 pr-2 text-left">
                          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-muted text-[11px] font-semibold text-muted-foreground">{i + 1}</span>
                          <span className="min-w-0 truncate text-sm font-medium">{section.name}</span>
                          {section.shared && <Badge variant="outline" className="h-5 shrink-0 px-1.5 text-[10px]">All pages</Badge>}
                          {edited > 0 && <Badge variant="secondary" className="h-5 shrink-0 px-1.5 text-[10px]">{edited} edited</Badge>}
                          {hidden && <Badge variant="outline" className="h-5 shrink-0 px-1.5 text-[10px]">Hidden</Badge>}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-2 pb-3">
                        <div className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2">
                          <span className="text-xs text-muted-foreground">{section.shared ? "Shown on every page" : "Show this section on the website"}</span>
                          <Switch aria-label={`Show ${section.name}`} checked={!hidden} onCheckedChange={(on) => change(section.key, section.tag, { hidden: !on })} />
                        </div>
                        {section.fields.length === 0 && <p className="text-xs text-muted-foreground">Nothing to edit in this section.</p>}
                        {section.fields.map(renderField)}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SiteDetails() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [form, setForm] = useState<WebsiteSettings>(EMPTY_SETTINGS);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getWebsiteSettings()
      .then(setForm)
      .catch((error) => toast({ title: "Could not load", description: error instanceof Error ? error.message : undefined, variant: "destructive" }));
  }, [toast]);

  const set = <K extends keyof WebsiteSettings>(key: K, value: WebsiteSettings[K]) => setForm((f) => ({ ...f, [key]: value }));
  const setAnnouncement = (patch: Partial<WebsiteSettings["announcement"]>) =>
    setForm((f) => ({ ...f, announcement: { ...f.announcement, ...patch } }));

  const save = async () => {
    setBusy(true);
    try {
      await saveWebsiteSettings(form, user?.id);
      toast({ title: "Website updated", description: "The new details are live on every page." });
    } catch (error) {
      toast({ title: "Could not save", description: error instanceof Error ? error.message : undefined, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contact details</CardTitle>
          <CardDescription>Replaces the call, WhatsApp and email links on every page. Leave a field empty to keep what the page has.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label htmlFor="site-phone">Phone number</Label><Input id="site-phone" inputMode="tel" placeholder="e.g. 8084510393" value={form.phone} onChange={(e) => set("phone", e.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="site-whatsapp">WhatsApp number</Label><Input id="site-whatsapp" inputMode="tel" placeholder="e.g. 8084510393" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} /></div>
          <div className="space-y-2"><Label htmlFor="site-email">Email</Label><Input id="site-email" type="email" placeholder="e.g. info@careeroptics.in" value={form.email} onChange={(e) => set("email", e.target.value)} /></div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Announcement bar</CardTitle>
          <CardDescription>A strip across the top of every page — admissions open, a new batch, a holiday.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-3"><Label htmlFor="site-ann-on">Show the announcement</Label><Switch id="site-ann-on" checked={form.announcement.enabled} onCheckedChange={(v) => setAnnouncement({ enabled: v })} /></div>
          <div className="space-y-2"><Label htmlFor="site-ann-text">Text</Label><Input id="site-ann-text" placeholder="Admissions open for the new session — enrol today!" value={form.announcement.text} onChange={(e) => setAnnouncement({ text: e.target.value })} /></div>
          <div className="space-y-2"><Label htmlFor="site-ann-link">Link (optional)</Label><Input id="site-ann-link" placeholder="e.g. /franchise.html" value={form.announcement.link} onChange={(e) => setAnnouncement({ link: e.target.value })} /></div>
        </CardContent>
      </Card>
      <div className="lg:col-span-2 flex justify-end">
        <Button onClick={save} disabled={busy}>{busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Save details</Button>
      </div>
    </div>
  );
}
