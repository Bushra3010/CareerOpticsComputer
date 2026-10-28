import { useCallback, useEffect, useRef, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
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
import { Download, FilePlus2, Maximize2, Minimize2, PenTool, Save, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useFullscreen } from "@/hooks/use-fullscreen";
import {
  EMPTY_DIAGRAM,
  drawioUrl,
  readDrawioMessage,
  tellDrawio,
  type DrawioTheme,
} from "@/lib/drawio";
import {
  deletePracticeFile,
  listPracticeFiles,
  savePracticeFile,
  type PracticeFile,
} from "@/lib/practiceFiles";

const THEMES: Array<{ id: DrawioTheme; label: string }> = [
  { id: "sketch", label: "Whiteboard (hand-drawn)" },
  { id: "kennedy", label: "Diagram (full toolbar)" },
  { id: "min", label: "Minimal" },
  { id: "dark", label: "Dark" },
];

/**
 * draw.io, embedded, with the user's own boards beside it.
 *
 * Flowcharts are on the computer fundamentals syllabus and every class needs
 * something to draw on. The diagram stays in the browser: draw.io hands the
 * XML to this page by postMessage and this page keeps it, so nothing is sent
 * to diagrams.net to be stored.
 */
export default function Whiteboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const owner = { ownerId: user?.id ?? "", organizationId: user?.organizationId, branchId: user?.branchId };

  const frame = useRef<HTMLIFrameElement | null>(null);
  /** The board and its toolbar, which is what goes full screen. */
  const stage = useRef<HTMLDivElement>(null);
  const fullscreen = useFullscreen(stage);
  /** The diagram as draw.io last reported it — what Save writes. */
  const latest = useRef<string>(EMPTY_DIAGRAM);
  /** What to hand draw.io when it announces it is ready. */
  const toLoad = useRef<string>(EMPTY_DIAGRAM);

  const [files, setFiles] = useState<PracticeFile[]>([]);
  const [stored, setStored] = useState(true);
  const [current, setCurrent] = useState<PracticeFile | null>(null);
  const [title, setTitle] = useState("Untitled board");
  const [savedTitle, setSavedTitle] = useState("Untitled board");
  const [changed, setChanged] = useState(false);
  const [theme, setTheme] = useState<DrawioTheme>("sketch");
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<PracticeFile | null>(null);
  const dirty = changed || title.trim() !== savedTitle.trim();

  const load = useCallback(async () => {
    if (!owner.ownerId) return;
    try {
      const result = await listPracticeFiles(owner, "board");
      setFiles(result.data);
      setStored(result.stored);
    } catch (error) {
      toast({
        title: "Could not load your boards",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [owner.ownerId, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  /* The listener is registered once, and reads these refs, so it always calls
     the save and download of the current render rather than of whichever
     render happened to register it. */
  const saveRef = useRef<() => void>(() => undefined);
  const downloadRef = useRef<(dataUrl: string) => void>(() => undefined);

  // The whole conversation with draw.io, through the checks in readDrawioMessage.
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const message = readDrawioMessage(event, frame.current?.contentWindow);
      if (!message) return;
      switch (message.event) {
        case "init":
          setReady(true);
          // autosave: every change comes back, so Save writes the board as
          // it is on screen rather than as it was when last opened.
          tellDrawio(frame.current?.contentWindow, { action: "load", xml: toLoad.current, autosave: 1 });
          break;
        case "autosave":
          latest.current = message.xml;
          setChanged(message.xml !== toLoad.current);
          break;
        case "save":
          // draw.io's own Save button (or Ctrl+S) inside the board.
          latest.current = message.xml;
          saveRef.current();
          break;
        case "export":
          downloadRef.current(message.data);
          break;
        default:
          break;
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  /** Reload the frame with this diagram; draw.io asks for it on `init`. */
  const openDiagram = (xml: string) => {
    toLoad.current = xml;
    latest.current = xml;
    setChanged(false);
    if (ready) {
      tellDrawio(frame.current?.contentWindow, { action: "load", xml, autosave: 1 });
    }
  };

  const startNew = () => {
    setCurrent(null);
    setTitle("Untitled board");
    setSavedTitle("Untitled board");
    openDiagram(EMPTY_DIAGRAM);
  };

  const open = (file: PracticeFile) => {
    setCurrent(file);
    setTitle(file.title);
    setSavedTitle(file.title);
    // A body that is not a diagram opens blank rather than handing draw.io
    // something it would reject with an error inside the frame.
    const readable = file.content.includes("<mxfile");
    openDiagram(readable ? file.content : EMPTY_DIAGRAM);
    if (!readable) {
      toast({
        title: "That board could not be read",
        description: "It has opened blank. Save to replace what was there.",
        variant: "destructive",
      });
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const result = await savePracticeFile(owner, {
        id: current?.id,
        kind: "board",
        title,
        language: "",
        content: latest.current,
      });
      setCurrent(result.data);
      setStored(result.stored);
      setTitle(result.data.title);
      setSavedTitle(result.data.title);
      toLoad.current = latest.current;
      setChanged(false);
      // Clears draw.io's own "unsaved changes" marker inside the frame.
      tellDrawio(frame.current?.contentWindow, { action: "status", message: "Saved", modified: false });
      toast({
        title: "Board saved",
        description: result.stored ? `${result.data.title} is in your boards.` : "Saved in this browser only.",
      });
      await load();
    } catch (error) {
      toast({
        title: "Could not save the board",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const exportPng = () =>
    // xmlpng: a PNG with the diagram embedded, so it opens back up as an
    // editable board in draw.io, not just as a picture.
    tellDrawio(frame.current?.contentWindow, { action: "export", format: "xmlpng", spinKey: "saving" });

  const download = (dataUrl: string) => {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `${(title.trim() || "board").replace(/[^\w.-]+/g, "-")}.png`;
    link.click();
  };

  saveRef.current = () => void save();
  downloadRef.current = download;

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const file = pendingDelete;
    setPendingDelete(null);
    try {
      await deletePracticeFile(owner, file.id);
      if (current?.id === file.id) startNew();
      toast({ title: "Board deleted", description: file.title });
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
        title="Whiteboard"
        description="Draw flowcharts, diagrams and class notes — powered by draw.io"
        breadcrumbs={[{ label: "Whiteboard" }]}
      />

      {!stored && (
        <Card className="mb-4 border-warning/40 bg-warning/5">
          <CardContent className="p-3 text-sm">
            Boards are being kept <strong>in this browser only</strong> until{" "}
            <code>supabase/schema/practice-files.sql</code> is run. After that they move to your
            account on their own, and open on any computer.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
        <Card className="min-w-0">
          <CardContent className="space-y-3 p-3">
            <Button variant="outline" className="w-full gap-2" onClick={startNew}>
              <FilePlus2 className="h-4 w-4" />
              New board
            </Button>
            <Select
              value={theme}
              onValueChange={(v) => {
                // Changing the look reloads draw.io; what is on the board is
                // carried across by the next `init`.
                toLoad.current = latest.current;
                setReady(false);
                setTheme(v as DrawioTheme);
              }}
            >
              <SelectTrigger aria-label="Board style"><SelectValue /></SelectTrigger>
              <SelectContent>
                {THEMES.map((t) => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>

            <p className="pt-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              My boards · {files.length}
            </p>
            <div className="max-h-[420px] space-y-1 overflow-y-auto">
              {files.length === 0 && (
                <p className="py-6 text-center text-xs text-muted-foreground">No boards saved yet.</p>
              )}
              {files.map((file) => (
                <div
                  key={file.id}
                  className={`flex items-center gap-1 rounded-lg ${current?.id === file.id ? "bg-brand/12" : "hover:bg-muted"}`}
                >
                  <button type="button" onClick={() => open(file)} className="min-w-0 flex-1 px-2 py-2 text-left">
                    <p className="truncate text-sm font-medium">{file.title}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {file.updatedAt ? new Date(file.updatedAt).toLocaleDateString("en-IN") : "Board"}
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
          <div className="flex flex-wrap items-center gap-2 border-b p-3">
            <PenTool className="h-4 w-4 shrink-0 text-brand-ink" />
            <Input
              aria-label="Board name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-9 min-w-0 flex-1 sm:max-w-xs"
            />
            {dirty && <span className="text-xs text-muted-foreground">Unsaved changes</span>}
            <div className="ml-auto flex gap-2">
              <Button variant="outline" className="gap-2" onClick={exportPng} disabled={!ready}>
                <Download className="h-4 w-4" />
                PNG
              </Button>
              <Button className="gap-2" onClick={save} disabled={saving || !ready || !owner.ownerId}>
                <Save className="h-4 w-4" />
                {saving ? "Saving…" : "Save"}
              </Button>
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
            </div>
          </div>
          <iframe
            key={theme}
            ref={frame}
            title="Whiteboard"
            src={drawioUrl(theme)}
            className={`block w-full border-0 ${fullscreen.active ? "min-h-0 flex-1" : "h-[640px]"}`}
            // draw.io needs scripts and its own storage; it does not need to
            // navigate this page, open popups onto it, or submit forms here.
            sandbox="allow-scripts allow-same-origin allow-popups allow-downloads"
          />
          <p className="border-t px-3 py-2 text-[11px] text-muted-foreground">
            Your board stays in your browser and your account — draw.io is not sent a copy.
          </p>
        </Card>
      </div>

      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {pendingDelete?.title}?</AlertDialogTitle>
            <AlertDialogDescription>The board is removed from your boards.</AlertDialogDescription>
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
