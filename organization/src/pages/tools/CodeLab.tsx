import { useCallback, useEffect, useRef, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Code2, FilePlus2, Loader2, Maximize2, Minimize2, Save, Trash2 } from "lucide-react";
import { useFullscreen } from "@/hooks/use-fullscreen";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  CODE_LAB_URL,
  LAB_LANGUAGES,
  codeFingerprint,
  isLabLanguage,
  readSavedConfig,
  starterConfig,
  waitForLabApi,
  type LabApi,
  type LabLanguage,
} from "@/lib/codeLab";
import {
  deletePracticeFile,
  listPracticeFiles,
  savePracticeFile,
  type PracticeFile,
} from "@/lib/practiceFiles";

/**
 * The full LiveCodes app, mounted once per `key` with the file to open.
 *
 * It is self-hosted on this site, so it shows its whole UI -- the Project,
 * Settings and Help menus, templates, import/export, every language -- where
 * the SDK's embed showed a cut-down editor. Student code still runs on
 * LiveCodes' sandbox origin, not on this one.
 */
function LabPlayground({
  config,
  onReady,
  className,
}: {
  config: ReturnType<typeof starterConfig>;
  onReady: (api: LabApi) => void;
  className?: string;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  // Read once: the parent remounts this with a new key to change the config.
  const initial = useRef({ config, onReady });
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");

  const connect = () => {
    const el = frame.current;
    if (!el) return;
    waitForLabApi(el)
      .then(async (api) => {
        await api.setConfig(initial.current.config);
        setState("ready");
        initial.current.onReady(api);
      })
      .catch(() => setState("failed"));
  };

  return (
    <div className={`relative ${className ?? ""}`}>
      <iframe
        ref={frame}
        title="Code Lab"
        src={CODE_LAB_URL}
        onLoad={connect}
        allow="clipboard-read; clipboard-write; fullscreen"
        className="h-full w-full border-0"
      />
      {state !== "ready" && (
        <div className="absolute inset-0 grid place-items-center bg-[#1e1e1e] text-sm text-white/70">
          {state === "loading" ? (
            <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Opening the Code Lab…</span>
          ) : (
            <span>The Code Lab could not open. Check the internet connection and reload the page.</span>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * An online compiler, from LiveCodes, with the student's own files beside it.
 *
 * The code compiles and runs in the browser, inside LiveCodes' iframe — so a
 * program that loops forever freezes that frame and nothing else, and nothing
 * a student types is run on the institute's server.
 */
export default function CodeLab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const owner = { ownerId: user?.id ?? "", organizationId: user?.organizationId, branchId: user?.branchId };

  const playground = useRef<LabApi | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const fullscreen = useFullscreen(stage);
  /** The editors' content as last opened or saved; "unsaved" is a difference from it. */
  const baseline = useRef<string | null>(null);
  const [files, setFiles] = useState<PracticeFile[]>([]);
  const [stored, setStored] = useState(true);
  const [current, setCurrent] = useState<PracticeFile | null>(null);
  const [language, setLanguage] = useState<LabLanguage>("web");
  const [title, setTitle] = useState("Untitled");
  const [saving, setSaving] = useState(false);
  const [codeDirty, setCodeDirty] = useState(false);
  /** The name as last opened or saved, so renaming counts as unsaved too. */
  const [savedTitle, setSavedTitle] = useState("Untitled");
  const dirty = codeDirty || title.trim() !== savedTitle.trim();
  const [pendingDelete, setPendingDelete] = useState<PracticeFile | null>(null);
  // The config the playground mounts with. Changing it remounts the editor,
  // so it only changes on New and Open, never while typing.
  const [bootConfig, setBootConfig] = useState(() => starterConfig("web"));
  const [bootKey, setBootKey] = useState(0);

  const load = useCallback(async () => {
    if (!owner.ownerId) return;
    try {
      const result = await listPracticeFiles(owner, "code");
      setFiles(result.data);
      setStored(result.stored);
    } catch (error) {
      toast({
        title: "Could not load your files",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [owner.ownerId, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  // Leaving with unsaved code asks first, the way an editor does.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  // "Unsaved" is checked by comparing the editors with what was opened or
  // saved, every couple of seconds, rather than by an edit event: the app
  // also changes its code on its own (formatting, a template), and a compare
  // cannot miss a change the way a missed event would.
  useEffect(() => {
    const timer = setInterval(async () => {
      const api = playground.current;
      if (!api || baseline.current === null) return;
      try {
        setCodeDirty(codeFingerprint(await api.getCode()) !== baseline.current);
      } catch {
        /* the app is reloading; the next tick will tell */
      }
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const mount = (config: ReturnType<typeof starterConfig>) => {
    // Cleared so the file as the new editor opens it becomes the baseline.
    playground.current = null;
    baseline.current = null;
    setBootConfig(config);
    setBootKey((k) => k + 1);
    setCodeDirty(false);
  };

  const startNew = (lang: LabLanguage) => {
    setCurrent(null);
    setLanguage(lang);
    setTitle("Untitled");
    setSavedTitle("Untitled");
    mount(starterConfig(lang));
  };

  const open = (file: PracticeFile) => {
    const lang = isLabLanguage(file.language) ? file.language : "web";
    const { config, readable } = readSavedConfig(file.content, lang);
    setCurrent(file);
    setLanguage(lang);
    setTitle(file.title);
    setSavedTitle(file.title);
    mount(config);
    if (!readable) {
      toast({
        title: "That file could not be read",
        description: "It has opened as a fresh program. Save to replace what was there.",
        variant: "destructive",
      });
    }
  };

  const save = async () => {
    if (!playground.current) return;
    setSaving(true);
    try {
      // Content only: the language, the code and the title, not the editor's
      // window size or theme, which belong to whoever opens it next.
      const config = await playground.current.getConfig(true);
      baseline.current = codeFingerprint(await playground.current.getCode());
      const result = await savePracticeFile(owner, {
        id: current?.id,
        kind: "code",
        title,
        language,
        content: JSON.stringify({ ...config, title }),
      });
      setCurrent(result.data);
      setStored(result.stored);
      setSavedTitle(result.data.title);
      setTitle(result.data.title);
      setCodeDirty(false);
      toast({
        title: "Saved",
        description: result.stored ? `${result.data.title} is in your files.` : "Saved in this browser only.",
      });
      await load();
    } catch (error) {
      toast({
        title: "Could not save",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const file = pendingDelete;
    setPendingDelete(null);
    try {
      await deletePracticeFile(owner, file.id);
      if (current?.id === file.id) startNew(language);
      toast({ title: "File deleted", description: file.title });
      await load();
    } catch (error) {
      toast({
        title: "Could not delete",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Code Lab"
        description="Write, run and save programs — HTML, JavaScript, Python, C and SQL — in the browser"
        breadcrumbs={[{ label: "Code Lab" }]}
      />

      {!stored && (
        <Card className="mb-4 border-warning/40 bg-warning/5">
          <CardContent className="p-3 text-sm">
            Files are being kept <strong>in this browser only</strong> until{" "}
            <code>supabase/schema/practice-files.sql</code> is run. After that they move to your
            account on their own, and open on any computer.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
        <Card className="min-w-0">
          <CardContent className="space-y-3 p-3">
            <Select value={language} onValueChange={(v) => startNew(v as LabLanguage)}>
              <SelectTrigger aria-label="Language for a new file"><SelectValue /></SelectTrigger>
              <SelectContent>
                {LAB_LANGUAGES.map((lang) => (
                  <SelectItem key={lang.id} value={lang.id}>{lang.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" className="w-full gap-2" onClick={() => startNew(language)}>
              <FilePlus2 className="h-4 w-4" />
              New file
            </Button>

            <p className="pt-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              My files · {files.length}
            </p>
            <div className="max-h-[420px] space-y-1 overflow-y-auto">
              {files.length === 0 && (
                <p className="py-6 text-center text-xs text-muted-foreground">Nothing saved yet.</p>
              )}
              {files.map((file) => (
                <div
                  key={file.id}
                  className={`group flex items-center gap-1 rounded-lg ${current?.id === file.id ? "bg-brand/12" : "hover:bg-muted"}`}
                >
                  <button
                    type="button"
                    onClick={() => open(file)}
                    className="min-w-0 flex-1 px-2 py-2 text-left"
                  >
                    <p className="truncate text-sm font-medium">{file.title}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {LAB_LANGUAGES.find((l) => l.id === file.language)?.label ?? "Program"}
                    </p>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                    aria-label={`Delete ${file.title}`}
                    onClick={() => setPendingDelete(file)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card
          ref={stage}
          className={`min-w-0 overflow-hidden ${fullscreen.active ? "flex flex-col rounded-none border-0" : ""}`}
        >
          <div className="flex flex-wrap items-center gap-2 border-b bg-card p-3">
            <Code2 className="h-4 w-4 shrink-0 text-brand-ink" />
            <Input
              aria-label="File name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-9 min-w-0 flex-1 sm:max-w-xs"
            />
            <Badge variant="secondary" className="shrink-0">
              {LAB_LANGUAGES.find((l) => l.id === language)?.label}
            </Badge>
            {dirty && <span className="text-xs text-muted-foreground">Unsaved changes</span>}
            <div className="ml-auto flex gap-2">
              {fullscreen.supported && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={fullscreen.toggle}
                  aria-label={fullscreen.active ? "Exit full screen" : "Full screen"}
                  title={fullscreen.active ? "Exit full screen (Esc)" : "Full screen"}
                >
                  {fullscreen.active ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
              )}
              <Button className="gap-2" onClick={save} disabled={saving || !owner.ownerId}>
                <Save className="h-4 w-4" />
                {saving ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>
          <LabPlayground
            key={bootKey}
            config={bootConfig}
            className={fullscreen.active ? "min-h-0 flex-1" : "h-[calc(100vh-15rem)] min-h-[560px]"}
            onReady={async (api) => {
              playground.current = api;
              baseline.current = codeFingerprint(await api.getCode());
            }}
          />
          <p className="border-t px-3 py-2 text-[11px] text-muted-foreground">
            {LAB_LANGUAGES.find((l) => l.id === language)?.hint}. Runs in your browser — nothing
            you type is run on the institute's server.
          </p>
        </Card>
      </div>

      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {pendingDelete?.title}?</AlertDialogTitle>
            <AlertDialogDescription>The program is removed from your files.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
