import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import QRCode from "qrcode";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Copy,
  Droplet,
  Image as ImageIcon,
  Minus,
  Plus,
  Printer,
  QrCode,
  Redo2,
  RotateCcw,
  Save,
  Square,
  Trash2,
  Type,
  Undo2,
  User,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { TemplateLibrary } from "@/components/documents/TemplateLibrary";
import { photoOf, tokensFor, type StudentRecord } from "@/lib/studentTemplateDocument";
import { printDesignPages } from "@/lib/export";
import type { StudentDocument } from "@/lib/documents";
import { getStudents, getCourses, getStudentDocument } from "@/lib/supabase/data";
import {
  instituteName as readInstituteName,
  loadInstituteName,
  saveInstituteName,
} from "@/lib/instituteName";
import {
  BACKGROUND_DEFAULTS,
  BACKGROUND_FITS,
  DOCUMENT_KINDS,
  KIND_ORDER,
  type BackgroundFit,
  type DocElement,
  type DocumentDesign,
  type DocumentKind,
  SAMPLE_DATA,
  marksTableHtml,
  TOKEN_LABELS,
  type TokenData,
  canvasSize,
  designHtml,
  designOrientation,
  element,
  loadDesigns,
  replaceTokens,
  saveDesigns,
  reorient,
  starterDesign,
  usedTokens,
  type Orientation,
  watermarkStyle,
} from "@/lib/documentDesigner";

/**
 * The eight grips around a selected element, as Canva and every other canvas
 * editor places them: corners resize both ways, edges resize one.
 */
const HANDLES = [
  { id: "nw", left: "0%", top: "0%", cursor: "nwse-resize" },
  { id: "n", left: "50%", top: "0%", cursor: "ns-resize" },
  { id: "ne", left: "100%", top: "0%", cursor: "nesw-resize" },
  { id: "e", left: "100%", top: "50%", cursor: "ew-resize" },
  { id: "se", left: "100%", top: "100%", cursor: "nwse-resize" },
  { id: "s", left: "50%", top: "100%", cursor: "ns-resize" },
  { id: "sw", left: "0%", top: "100%", cursor: "nesw-resize" },
  { id: "w", left: "0%", top: "50%", cursor: "ew-resize" },
] as const;

type HandleId = (typeof HANDLES)[number]["id"];

/** A box smaller than this cannot be caught by its own handles again. */
const MIN_SIZE = 16;

/** So `/certificate/template` and `/marksheet/template` open on the right one. */
function kindFromPath(pathname: string, param: string | null): DocumentKind {
  if (param && (KIND_ORDER as string[]).includes(param)) return param as DocumentKind;
  if (pathname.startsWith("/marksheet")) return "marksheet";
  if (pathname.startsWith("/cards/admit")) return "admit-card";
  if (pathname.startsWith("/cards/id")) return "student-id";
  return "certificate";
}

interface StudentRow {
  id: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  fatherName?: string;
  motherName?: string;
  enrollmentNo?: string;
  applicationNo?: string;
  phone?: string;
  bloodGroup?: string;
  dateOfBirth?: string;
  courseId?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  pincode?: string;
  /** The admission's own uploads, passport photo among them. */
  documents?: Record<string, { name?: string; dataUrl?: string }> | null;
  /** The older single-photo column, kept for records filed before the
   *  admission collected its documents as a set. */
  photo?: { dataUrl?: string } | string | null;
}

export default function DocumentDesigner() {
  const { toast } = useToast();
  const { user, view } = useAuth();
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  // The URL is the only source of truth for the type. Holding it in state meant
  // the sidebar's own links could not change it: React Router reuses this
  // component between /certificate/template and /marksheet/template, so the
  // state initialiser never ran again and the canvas stayed on the old type.
  const kind = kindFromPath(location.pathname, params.get("type"));
  const setKind = (next: DocumentKind) => setParams({ type: next }, { replace: true });
  // Every kind is seeded up front. Falling back to `starterDesign(kind)` during
  // render instead handed each pass a fresh set of element ids, so whatever was
  // selected stopped existing the moment anything re-rendered.
  const [designs, setDesigns] = useState<Record<DocumentKind, DocumentDesign>>(() => {
    const stored = loadDesigns();
    return Object.fromEntries(
      KIND_ORDER.map((k) => [k, stored[k] ?? starterDesign(k)]),
    ) as Record<DocumentKind, DocumentDesign>;
  });
  const design = designs[kind];
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(0.6);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [courses, setCourses] = useState<Array<{ id: string; name: string }>>([]);
  const [studentId, setStudentId] = useState("");
  // The name behind `{{institute}}` - and so behind the watermark, which was
  // stuck reading "Career Optics Computer Centre" on every certificate this app produced.
  // Saved on the branch so the PDF builders in documents.ts print it too.
  const [institute, setInstitute] = useState(readInstituteName);
  const [savingInstitute, setSavingInstitute] = useState(false);
  const [qrByElement, setQrByElement] = useState<Record<string, string>>({});
  // Per-kind history, so undo after a type switch cannot resurrect a foreign layout.
  const history = useRef<Record<string, { stack: string[]; index: number }>>({});
  const canvasRef = useRef<HTMLDivElement>(null);

  const meta = DOCUMENT_KINDS[kind];
  const size = canvasSize(kind, design);
  const orientation = designOrientation(kind, design);
  const selected = design.elements.find((e) => e.id === selectedId) ?? null;

  /** This kind's undo stack, seeded with the state before its first edit. */
  const entryFor = useCallback(
    (before: DocumentDesign) => {
      const entry = history.current[kind] ?? {
        stack: [JSON.stringify(before)],
        index: 0,
      };
      history.current[kind] = entry;
      return entry;
    },
    [kind],
  );

  /** Make `next` the undoable step that follows `before`. */
  const record = useCallback(
    (next: DocumentDesign, before: DocumentDesign) => {
      const entry = entryFor(before);
      entry.stack = entry.stack.slice(0, entry.index + 1);
      entry.stack.push(JSON.stringify(next));
      if (entry.stack.length > 40) entry.stack.shift();
      entry.index = entry.stack.length - 1;
    },
    [entryFor],
  );

  /** Store a design without adding a step - what undo and redo themselves do. */
  const apply = useCallback(
    (next: DocumentDesign) => setDesigns((prev) => ({ ...prev, [kind]: next })),
    [kind],
  );

  const commit = useCallback(
    (next: DocumentDesign) => {
      record(next, design);
      apply(next);
    },
    [record, apply, design],
  );

  // A slider fires on every movement. Dragging one through `commit` would push
  // forty steps and flush the whole history, so the watermark sliders write
  // straight through and leave a single step behind when the drag ends - the
  // same bargain the canvas drag and resize gestures already make.
  const backgroundBefore = useRef<DocumentDesign | null>(null);

  const tuneBackground = (patch: Partial<DocumentDesign>) => {
    backgroundBefore.current ??= design;
    apply({ ...design, ...patch });
  };

  const settleBackground = () => {
    const before = backgroundBefore.current;
    backgroundBefore.current = null;
    if (before && JSON.stringify(before) !== JSON.stringify(design)) record(design, before);
  };

  // Only a change of type drops the selection. This used to depend on `designs`
  // too, which deselected the element on every keystroke: the properties panel
  // closed after a single typed character, so a name could not be edited.
  useEffect(() => {
    setSelectedId(null);
  }, [kind]);

  useEffect(() => {
    const branchId = user?.branchId ?? null;
    getStudents(branchId, 1, 100)
      .then((r) => setStudents((r.data || []) as StudentRow[]))
      .catch(() => setStudents([]));
    getCourses(user?.organizationId, branchId)
      .then((r) => setCourses(r.data as Array<{ id: string; name: string }>))
      .catch(() => setCourses([]));
    loadInstituteName(branchId).then(setInstitute);
  }, [user?.branchId, user?.organizationId]);

  const persistInstitute = async () => {
    setSavingInstitute(true);
    const { stored } = await saveInstituteName(user?.branchId ?? null, institute);
    setSavingInstitute(false);
    setInstitute(readInstituteName());
    toast({
      title: "Institute name saved",
      description: stored
        ? "Every certificate, marksheet and watermark now carries it."
        : "Saved in this browser only \u2014 no branch settings row to write it to.",
    });
  };

  const [previewRecord, setPreviewRecord] = useState<StudentDocument | null>(null);
  useEffect(() => {
    let cancelled = false;
    setPreviewRecord(null);
    if (studentId) getStudentDocument(studentId, user?.branchId || null)
      .then(({ data }) => { if (!cancelled) setPreviewRecord(data); })
      .catch(() => { if (!cancelled) toast({ title: "Could not load preview record", variant: "destructive" }); });
    return () => { cancelled = true; };
  }, [studentId, user?.branchId, toast]);
  const data: TokenData = useMemo(() => {
    if (!studentId) return { ...SAMPLE_DATA, institute };
    if (previewRecord) return tokensFor(previewRecord, { institute });
    return Object.fromEntries(Object.keys(SAMPLE_DATA).map((key) => [key, ""]));
  }, [studentId, previewRecord, institute]);

  // QR images are async, so they are rendered once per (element, payload) pair
  // and cached - regenerating inside render would loop forever.
  useEffect(() => {
    const qrs = design.elements.filter((e) => e.type === "qr");
    if (!qrs.length) return;
    let cancelled = false;
    const payload = data.certificate_id || data.enrollment_no || data.student_name;
    Promise.all(
      qrs.map((el) =>
        QRCode.toDataURL(`verify:${payload}`, {
          width: Math.max(64, Math.round(el.width)),
          margin: 0,
        })
          .then((src) => [el.id, src] as const)
          .catch(() => [el.id, ""] as const),
      ),
    ).then((pairs) => {
      if (!cancelled) setQrByElement(Object.fromEntries(pairs));
    });
    return () => {
      cancelled = true;
    };
  }, [design.elements, data]);

  const update = (patch: Partial<DocElement>) => {
    if (!selected) return;
    commit({
      ...design,
      elements: design.elements.map((e) =>
        e.id === selected.id ? { ...e, ...patch } : e,
      ),
    });
  };

  const add = (el: DocElement) => {
    commit({ ...design, elements: [...design.elements, el] });
    setSelectedId(el.id);
  };

  const remove = () => {
    if (!selected) return;
    commit({ ...design, elements: design.elements.filter((e) => e.id !== selected.id) });
    setSelectedId(null);
  };

  // Delete removes the selected element and Escape lets it go, the way every
  // canvas editor behaves -- but never while something is being typed, or a
  // Backspace in the Text box would take the element the text belongs to.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable
      ) {
        return;
      }
      if (event.key === "Escape") setSelectedId(null);
      if (selected && (event.key === "Delete" || event.key === "Backspace")) {
        event.preventDefault();
        remove();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const duplicate = () => {
    if (!selected) return;
    // `id` is dropped so the copy gets a fresh one - keeping it would leave two
    // elements sharing a key and only one of them selectable.
    const { id: _ignored, ...rest } = selected;
    add(element(selected.type, { ...rest, x: selected.x + 20, y: selected.y + 20 }));
  };

  const step = (direction: -1 | 1) => {
    const entry = entryFor(design);
    const next = entry.index + direction;
    if (next < 0 || next >= entry.stack.length) return;
    entry.index = next;
    apply(JSON.parse(entry.stack[next]) as DocumentDesign);
  };

  const startDrag = (event: React.PointerEvent, el: DocElement) => {
    event.preventDefault();
    setSelectedId(el.id);
    const startX = event.clientX;
    const startY = event.clientY;
    const originX = el.x;
    const originY = el.y;
    const before = design;
    let latest = { x: originX, y: originY };
    let moved = false;
    const move = (ev: PointerEvent) => {
      moved = true;
      latest = {
        x: Math.round(originX + (ev.clientX - startX) / zoom),
        y: Math.round(originY + (ev.clientY - startY) / zoom),
      };
      // Dragging is recorded once on release; recording every pointermove would
      // fill the undo stack with a pixel of movement per entry.
      apply({
        ...before,
        elements: before.elements.map((e) => (e.id === el.id ? { ...e, ...latest } : e)),
      });
    };
    const stop = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
      // A plain click only selects, so it must not leave an undo step behind.
      if (!moved) return;
      record(
        {
          ...before,
          elements: before.elements.map((e) => (e.id === el.id ? { ...e, ...latest } : e)),
        },
        before,
      );
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop);
  };

  /**
   * Resize by dragging a handle, rather than typing a width into the panel.
   *
   * The maths is done in canvas pixels -- the pointer moves in screen pixels,
   * so every delta is divided by the zoom -- and a west or north handle moves
   * the box's own corner as well as its size, which is what makes the opposite
   * corner stay where it is.
   */
  const startResize = (event: React.PointerEvent, el: DocElement, handle: HandleId) => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedId(el.id);
    const startX = event.clientX;
    const startY = event.clientY;
    const origin = { x: el.x, y: el.y, width: el.width, height: el.height };
    const before = design;
    let latest = { ...origin };
    let moved = false;

    const move = (ev: PointerEvent) => {
      moved = true;
      const dx = (ev.clientX - startX) / zoom;
      const dy = (ev.clientY - startY) / zoom;
      const box = { ...origin };

      if (handle.includes("e")) box.width = origin.width + dx;
      if (handle.includes("s")) box.height = origin.height + dy;
      if (handle.includes("w")) {
        box.width = origin.width - dx;
        box.x = origin.x + dx;
      }
      if (handle.includes("n")) {
        box.height = origin.height - dy;
        box.y = origin.y + dy;
      }
      // A box dragged past its own opposite edge stops there rather than
      // turning inside out.
      if (box.width < MIN_SIZE) {
        if (handle.includes("w")) box.x = origin.x + origin.width - MIN_SIZE;
        box.width = MIN_SIZE;
      }
      if (box.height < MIN_SIZE) {
        if (handle.includes("n")) box.y = origin.y + origin.height - MIN_SIZE;
        box.height = MIN_SIZE;
      }

      latest = {
        x: Math.round(box.x),
        y: Math.round(box.y),
        width: Math.round(box.width),
        height: Math.round(box.height),
      };
      apply({
        ...before,
        elements: before.elements.map((e) => (e.id === el.id ? { ...e, ...latest } : e)),
      });
    };

    const stop = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
      // As with dragging: one undo step for the whole gesture, not one a pixel.
      if (!moved) return;
      record(
        {
          ...before,
          elements: before.elements.map((e) => (e.id === el.id ? { ...e, ...latest } : e)),
        },
        before,
      );
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop);
  };

  /** Shared by the add / replace / canvas-background pickers. */
  const readImage = (
    event: React.ChangeEvent<HTMLInputElement>,
    then: (src: string) => void,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => then(String(reader.result));
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const uploadImage = (event: React.ChangeEvent<HTMLInputElement>) =>
    readImage(event, (src) =>
      add(element("image", { x: 340, y: 240, width: 180, height: 180, src })),
    );

  /**
   * The canvas is kept on this device as a draft, so a half-drawn template
   * survives a reload. It is not the save that matters -- a template only
   * reaches a branch through the library.
   */
  useEffect(() => {
    const timer = setTimeout(() => saveDesigns(designs), 400);
    return () => clearTimeout(timer);
  }, [designs]);

  // Turning the page is one undoable step, like any other edit.
  const turn = (next: Orientation) => {
    if (next !== orientation) commit(reorient(kind, design, next));
  };

  const reset = () => {
    // The starter layout, on the page the way it is turned now.
    const fresh = reorient(kind, starterDesign(kind), orientation);
    commit(fresh);
    setSelectedId(null);
  };

  const print = () => {
    if (studentId && !previewRecord) return toast({ title: "Wait for the student record to load", variant: "destructive" });
    // Its own sheet, turned to match: a portrait certificate on a portrait A4.
    printDesignPages(meta.label, [designHtml(kind, design, data, qrByElement)], size.width, size.height);
  };

  // Text, colour, weight and alignment apply to every box that draws text, and
  // that includes shapes - a shape's own label had no editor at all before.
  const writes = !!selected && (selected.type === "text" || selected.type === "shape");

  const unfilled = usedTokens(design.elements).filter((t) => !data[t]);

  return (
    <AppLayout>
      <PageHeader
        title="Document Designer"
        description="One designer for certificates, marksheets, ID cards and admit cards. Drag the boxes, and {{tokens}} fill from the student record."
        breadcrumbs={[{ label: "Documents" }, { label: meta.label }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => step(-1)}>
              <Undo2 className="mr-2 h-4 w-4" />
              Undo
            </Button>
            <Button variant="outline" onClick={() => step(1)}>
              <Redo2 className="mr-2 h-4 w-4" />
              Redo
            </Button>
            <Button variant="outline" onClick={print}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            {/* Saving is the library's, on the right: a design saved to this
                browser is one no branch could ever print. What is on the canvas
                is kept here as a draft, automatically. */}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
        {/* -------- left: type, elements, tokens -------- */}
        <div className="space-y-4 xl:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Document type</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select
                value={kind}
                onValueChange={(v) => setKind(v as DocumentKind)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {KIND_ORDER.map((k) => (
                    <SelectItem key={k} value={k}>
                      {DOCUMENT_KINDS[k].icon} {DOCUMENT_KINDS[k].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Orientation">
                {(["landscape", "portrait"] as const).map((o) => (
                  <Button
                    key={o}
                    type="button"
                    role="radio"
                    aria-checked={orientation === o}
                    variant={orientation === o ? "default" : "outline"}
                    size="sm"
                    onClick={() => turn(o)}
                  >
                    <span
                      aria-hidden
                      className="mr-2 inline-block rounded-[2px] border-2 border-current"
                      style={o === "landscape" ? { width: 16, height: 11 } : { width: 11, height: 16 }}
                    />
                    {o === "landscape" ? "Landscape" : "Portrait"}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Canvas {size.width} × {size.height} px
              </p>
              <Button variant="outline" size="sm" className="w-full" onClick={reset}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset to starter layout
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Elements</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <ElementButton
                icon={Type}
                label="Text"
                onClick={() =>
                  add(element("text", { x: 350, y: 250, width: 300, height: 50, text: "New text" }))
                }
              />
              <ElementButton
                icon={Type}
                label="Heading"
                onClick={() =>
                  add(
                    element("text", {
                      x: 300,
                      y: 150,
                      width: 400,
                      height: 70,
                      text: "HEADING",
                      fontSize: 38,
                      fontWeight: "800",
                    }),
                  )
                }
              />
              <ElementButton
                icon={Square}
                label="Shape"
                onClick={() =>
                  add(
                    element("shape", {
                      x: 300,
                      y: 200,
                      width: 300,
                      height: 150,
                      border: "2px solid #334155",
                      background: "#f8fafc",
                      radius: 10,
                    }),
                  )
                }
              />
              <ElementButton
                icon={User}
                label="Photo box"
                onClick={() =>
                  // A `photo` element, not a grey rectangle: this box is filled
                  // with the student's own passport photograph when the card is
                  // printed, and shows the placeholder until then.
                  add(
                    element("photo", {
                      x: 80,
                      y: 180,
                      width: 190,
                      height: 240,
                      background: "#cbd5e1",
                      radius: 12,
                      text: "Photo",
                    }),
                  )
                }
              />
              {kind === "marksheet" && <ElementButton icon={Square} label="Marks table" onClick={() => add(element("marks-table", { x: 70, y: 420, width: 650, height: 320, fontSize: 16 }))} />}
              <ElementButton
                icon={QrCode}
                label="QR code"
                onClick={() => add(element("qr", { x: 750, y: 480, width: 120, height: 120 }))}
              />
              <ElementButton
                icon={Droplet}
                label="Text watermark"
                onClick={() =>
                  add(
                    element("text", {
                      x: 250,
                      y: 300,
                      width: 500,
                      height: 100,
                      text: "{{institute}}",
                      fontSize: 42,
                      fontWeight: "800",
                      color: "#94a3b8",
                      opacity: 0.15,
                      rotate: -25,
                      z: 1,
                    }),
                  )
                }
              />
              {/* The only watermark on offer was that faint line of text. A
                  crest or a seal had to go in as the canvas background, which
                  lived in another panel and could not be faded or scaled. */}
              <label>
                <span className="flex cursor-pointer flex-col items-center gap-1 rounded-xl border bg-muted/30 p-3 text-xs font-semibold transition hover:bg-muted">
                  <ImageIcon className="h-4 w-4" />
                  Image watermark
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    readImage(e, (backgroundImage) =>
                      commit({
                        ...design,
                        backgroundImage,
                        ...BACKGROUND_DEFAULTS,
                        backgroundFit: "contain",
                        backgroundScale: 60,
                        backgroundOpacity: 0.12,
                      }),
                    )
                  }
                />
              </label>
              <label className="col-span-2">
                <span className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border bg-muted/40 p-3 text-xs font-semibold hover:bg-muted">
                  <ImageIcon className="h-4 w-4" />
                  Upload image / logo / signature
                </span>
                <input type="file" accept="image/*" className="hidden" onChange={uploadImage} />
              </label>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Dynamic data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Click to drop the token on the canvas.
              </p>
              <div className="max-h-72 space-y-1 overflow-y-auto pr-1">
                {Object.entries(TOKEN_LABELS).map(([token, label]) => (
                  <button
                    key={token}
                    onClick={() =>
                      add(
                        element("text", {
                          x: 300,
                          y: 250,
                          width: 320,
                          height: 45,
                          text: `{{${token}}}`,
                          fontSize: 22,
                        }),
                      )
                    }
                    className="flex w-full items-center justify-between gap-2 rounded-lg border bg-muted/30 px-2.5 py-2 text-xs hover:bg-muted"
                  >
                    <span>{label}</span>
                    <code className="text-[10px] text-brand">{`{{${token}}}`}</code>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* -------- centre: canvas -------- */}
        <div className="space-y-4 xl:col-span-2">
          <Card>
            <CardContent className="flex flex-wrap items-center justify-between gap-2 p-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Zoom</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setZoom((z) => Math.max(0.2, +(z - 0.1).toFixed(2)))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center text-xs font-semibold">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setZoom((z) => Math.min(1.2, +(z + 0.1).toFixed(2)))}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={duplicate} disabled={!selected}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </Button>
                <Button variant="outline" size="sm" onClick={remove} disabled={!selected}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="overflow-auto rounded-2xl border bg-muted/40 p-6">
            <div
              style={{
                width: size.width * zoom,
                height: size.height * zoom,
                margin: "0 auto",
              }}
            >
              <div
                ref={canvasRef}
                onPointerDown={(e) => {
                  if (e.target === canvasRef.current) setSelectedId(null);
                }}
                style={{
                  position: "relative",
                  width: size.width,
                  height: size.height,
                  background: design.background,
                  transform: `scale(${zoom})`,
                  transformOrigin: "top left",
                  overflow: "hidden",
                  boxShadow: "0 20px 60px rgba(15,23,42,.18)",
                }}
              >
                {/* The same layer the printed document gets, so what is
                    dragged and scaled here is what comes out. */}
                {design.backgroundImage && (
                  <div style={watermarkStyle(design) as React.CSSProperties} />
                )}

                {[...design.elements]
                  .sort((a, b) => a.z - b.z)
                  .map((el) => {
                    const chosen = el.id === selectedId;
                    return (
                      <div
                        key={el.id}
                        onPointerDown={(e) => startDrag(e, el)}
                        style={{
                          position: "absolute",
                          left: el.x,
                          top: el.y,
                          width: el.width,
                          height: el.height,
                          transform: `rotate(${el.rotate}deg)`,
                          opacity: el.opacity,
                          // A selected element is worked on, so it comes above
                          // its neighbours -- its grips are unreachable under
                          // anything stacked over them.
                          zIndex: chosen ? el.z + 1000 : el.z,
                          cursor: "move",
                          userSelect: "none",
                          outline: chosen ? "2px solid hsl(var(--brand))" : undefined,
                          outlineOffset: 3,
                        }}
                      >
                        <ElementBody el={el} data={data} qr={qrByElement[el.id]} />

                        {/* The grips and the cross are drawn inside a canvas
                            that is scaled by the zoom, so every size here is
                            divided by it: they stay the same on screen at 50%
                            as at 100%, which is the only size a finger or a
                            pointer can actually catch. */}
                        {chosen && (
                          <>
                            {HANDLES.map((handle) => (
                              <div
                                key={handle.id}
                                aria-label={`Resize ${handle.id}`}
                                onPointerDown={(e) => startResize(e, el, handle.id)}
                                style={{
                                  position: "absolute",
                                  left: handle.left,
                                  top: handle.top,
                                  width: 10 / zoom,
                                  height: 10 / zoom,
                                  marginLeft: -5 / zoom,
                                  marginTop: -5 / zoom,
                                  borderRadius: 3 / zoom,
                                  background: "#fff",
                                  border: `${1.5 / zoom}px solid hsl(var(--brand))`,
                                  boxShadow: `0 ${1 / zoom}px ${3 / zoom}px rgba(15,23,42,.25)`,
                                  cursor: handle.cursor,
                                  touchAction: "none",
                                }}
                              />
                            ))}
                            <button
                              type="button"
                              aria-label="Delete element"
                              title="Delete"
                              onPointerDown={(e) => e.stopPropagation()}
                              onClick={(e) => {
                                e.stopPropagation();
                                remove();
                              }}
                              style={{
                                position: "absolute",
                                left: "100%",
                                top: 0,
                                width: 22 / zoom,
                                height: 22 / zoom,
                                marginLeft: 8 / zoom,
                                marginTop: -11 / zoom,
                                display: "grid",
                                placeItems: "center",
                                borderRadius: "50%",
                                background: "hsl(var(--destructive))",
                                color: "#fff",
                                fontSize: 13 / zoom,
                                lineHeight: 1,
                                border: "none",
                                cursor: "pointer",
                                boxShadow: `0 ${1 / zoom}px ${4 / zoom}px rgba(15,23,42,.3)`,
                              }}
                            >
                              ×
                            </button>
                          </>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {unfilled.length > 0 && (
            <p className="text-xs text-muted-foreground">
              No value yet for {unfilled.map((t) => `{{${t}}}`).join(", ")} — these
              print as written until the record or the sample data supplies them.
            </p>
          )}
        </div>

        {/* -------- right: properties + data -------- */}
        <div className="space-y-4 xl:col-span-1">
          {/* The library first: which template is open decides what everything
              below it is editing. */}
          <TemplateLibrary
            kind={kind}
            design={design}
            organizationId={user?.organizationId ?? null}
            canManage={view === "admin"}
            onOpen={(opened) => {
              // Straight onto the canvas as one undoable step, so opening a
              // template can be taken back like any other edit.
              commit(opened);
              setSelectedId(null);
            }}
          />
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Live data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="institute-name">Institute name</Label>
                <div className="flex gap-2">
                  <Input
                    id="institute-name"
                    value={institute}
                    onChange={(e) => setInstitute(e.target.value)}
                  />
                  <Button
                    variant="outline"
                    className="shrink-0"
                    disabled={savingInstitute || institute.trim() === readInstituteName()}
                    onClick={persistInstitute}
                  >
                    {savingInstitute ? "Saving…" : "Save"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Fills {"{{institute}}"} everywhere it appears, watermark included,
                  and the certificates generated outside the designer.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Preview with student</Label>
                <Select value={studentId} onValueChange={setStudentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sample data" />
                  </SelectTrigger>
                  <SelectContent searchable searchPlaceholder="Search student or enrollment…">
                    {students.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {[s.firstName, s.lastName].filter(Boolean).join(" ") || s.id}
                        {(s.enrollmentNo || s.applicationNo) ? ` · ${s.enrollmentNo || s.applicationNo}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {students.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No students on this branch yet — the sample values are used.
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Background colour</Label>
                <Input
                  type="color"
                  value={design.background}
                  onChange={(e) => commit({ ...design, background: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Background image / watermark</Label>
                <div className="flex gap-2">
                  <label className="flex-1">
                    <span className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border bg-muted/40 p-2.5 text-xs font-semibold hover:bg-muted">
                      <ImageIcon className="h-4 w-4" />
                      {design.backgroundImage ? "Change image" : "Upload image"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        readImage(e, (backgroundImage) =>
                          commit({ ...design, backgroundImage }),
                        )
                      }
                    />
                  </label>
                  {design.backgroundImage && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => commit({ ...design, backgroundImage: "" })}
                    >
                      Remove
                    </Button>
                  )}
                </div>
                {!design.backgroundImage && (
                  <p className="text-xs text-muted-foreground">
                    Upload a crest, seal or letterhead to sit behind the design.
                  </p>
                )}
              </div>

              {/* The mark used to be pinned to the middle of the page, filling
                  it, fully opaque, with nothing to change any of that. */}
              {design.backgroundImage && (
                <div className="space-y-3 rounded-xl border bg-muted/30 p-3">
                  <div className="space-y-2">
                    <Label>How it sits</Label>
                    <Select
                      value={design.backgroundFit}
                      onValueChange={(v) =>
                        commit({ ...design, backgroundFit: v as BackgroundFit })
                      }
                    >
                      <SelectTrigger aria-label="Watermark fit">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {BACKGROUND_FITS.map((fit) => (
                          <SelectItem key={fit.value} value={fit.value}>
                            {fit.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {BACKGROUND_FITS.find((f) => f.value === design.backgroundFit)?.hint}
                    </p>
                  </div>

                  <RangeField
                    label={
                      design.backgroundFit === "tile"
                        ? `Tile size — ${Math.round(design.backgroundScale)}%`
                        : `Scale — ${Math.round(design.backgroundScale)}%`
                    }
                    min={25}
                    max={400}
                    step={5}
                    value={design.backgroundScale}
                    onChange={(backgroundScale) => tuneBackground({ backgroundScale })}
                    onSettle={settleBackground}
                  />
                  <RangeField
                    label={`Opacity — ${Math.round(design.backgroundOpacity * 100)}%`}
                    min={0}
                    max={1}
                    step={0.05}
                    value={design.backgroundOpacity}
                    onChange={(backgroundOpacity) => tuneBackground({ backgroundOpacity })}
                    onSettle={settleBackground}
                  />
                  <RangeField
                    label={`Rotation — ${Math.round(design.backgroundRotate)}°`}
                    min={-180}
                    max={180}
                    step={5}
                    value={design.backgroundRotate}
                    onChange={(backgroundRotate) => tuneBackground({ backgroundRotate })}
                    onSettle={settleBackground}
                  />
                  <RangeField
                    label={`Across — ${Math.round(design.backgroundX)}%`}
                    min={0}
                    max={100}
                    step={1}
                    value={design.backgroundX}
                    onChange={(backgroundX) => tuneBackground({ backgroundX })}
                    onSettle={settleBackground}
                  />
                  <RangeField
                    label={`Down — ${Math.round(design.backgroundY)}%`}
                    min={0}
                    max={100}
                    step={1}
                    value={design.backgroundY}
                    onChange={(backgroundY) => tuneBackground({ backgroundY })}
                    onSettle={settleBackground}
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        commit({ ...design, ...BACKGROUND_DEFAULTS, backgroundOpacity: 0.12 })
                      }
                    >
                      <Droplet className="mr-2 h-4 w-4" />
                      Watermark it
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => commit({ ...design, ...BACKGROUND_DEFAULTS })}
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Reset
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Properties</CardTitle>
            </CardHeader>
            <CardContent>
              {!selected ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Select an element on the canvas.
                </p>
              ) : (
                <div className="space-y-3">
                  {writes && (
                    <div className="space-y-2">
                      <Label>Text</Label>
                      <Textarea
                        rows={3}
                        value={selected.text}
                        onChange={(e) => update({ text: e.target.value })}
                      />
                    </div>
                  )}
                  {selected.type === "image" && (
                    <label className="block">
                      <span className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border bg-muted/40 p-3 text-xs font-semibold hover:bg-muted">
                        <ImageIcon className="h-4 w-4" />
                        Replace image
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => readImage(e, (src) => update({ src }))}
                      />
                    </label>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <NumberField label="X" value={selected.x} onChange={(x) => update({ x })} />
                    <NumberField label="Y" value={selected.y} onChange={(y) => update({ y })} />
                    <NumberField
                      label="Width"
                      value={selected.width}
                      onChange={(width) => update({ width })}
                    />
                    <NumberField
                      label="Height"
                      value={selected.height}
                      onChange={(height) => update({ height })}
                    />
                    <NumberField
                      label="Rotate"
                      value={selected.rotate}
                      onChange={(rotate) => update({ rotate })}
                    />
                    <NumberField
                      label="Font size"
                      value={selected.fontSize}
                      onChange={(fontSize) => update({ fontSize })}
                    />
                  </div>
                  {writes && (
                    <>
                      <div className="space-y-2">
                        <Label>Colour</Label>
                        <Input
                          type="color"
                          value={selected.color}
                          onChange={(e) => update({ color: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <Label>Weight</Label>
                          <Select
                            value={selected.fontWeight}
                            onValueChange={(fontWeight) => update({ fontWeight })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {["400", "600", "700", "800"].map((w) => (
                                <SelectItem key={w} value={w}>
                                  {w}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Align</Label>
                          <Select
                            value={selected.align}
                            onValueChange={(v) =>
                              update({ align: v as DocElement["align"] })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="left">Left</SelectItem>
                              <SelectItem value="center">Centre</SelectItem>
                              <SelectItem value="right">Right</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </>
                  )}
                  {selected.type !== "qr" && (
                    <div className="space-y-3 rounded-xl border bg-muted/20 p-3">
                      <div className="space-y-2">
                        <Label>Fill</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            className="flex-1"
                            value={
                              selected.background === "transparent"
                                ? "#ffffff"
                                : selected.background
                            }
                            onChange={(e) => update({ background: e.target.value })}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => update({ background: "transparent" })}
                          >
                            None
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <NumberField
                          label="Border width"
                          value={borderOf(selected.border).width}
                          onChange={(width) =>
                            update({ border: cssBorder(width, borderOf(selected.border).color) })
                          }
                        />
                        <div className="space-y-1">
                          <Label className="text-xs">Border colour</Label>
                          <Input
                            type="color"
                            value={borderOf(selected.border).color}
                            onChange={(e) =>
                              update({
                                border: cssBorder(
                                  Math.max(1, borderOf(selected.border).width),
                                  e.target.value,
                                ),
                              })
                            }
                          />
                        </div>
                      </div>
                      <NumberField
                        label="Corner radius"
                        value={selected.radius}
                        onChange={(radius) => update({ radius })}
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>Opacity — {Math.round(selected.opacity * 100)}%</Label>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      className="w-full"
                      value={selected.opacity}
                      onChange={(e) => update({ opacity: Number(e.target.value) })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        update({
                          z: design.elements.reduce((top, e) => Math.max(top, e.z), 1) + 1,
                        })
                      }
                    >
                      Bring front
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => update({ z: 1 })}>
                      Send back
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

function ElementBody({
  el,
  data,
  qr,
}: {
  el: DocElement;
  data: TokenData;
  qr?: string;
}) {
  if (el.type === "marks-table") return <div style={{ fontSize: el.fontSize, color: el.color, overflow: "hidden", height: "100%" }} dangerouslySetInnerHTML={{ __html: marksTableHtml(data, el.width, el.fontSize) }} />;
  if (el.type === "image") {
    return (
      <img
        src={el.src}
        alt=""
        style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: el.radius }}
      />
    );
  }
  if (el.type === "photo") {
    // Filled from the student being previewed; the placeholder is what the box
    // looks like on a card whose student has no photograph on file.
    return data.photo ? (
      <img
        src={data.photo}
        alt=""
        style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: el.radius }}
      />
    ) : (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "grid",
          placeItems: "center",
          background: el.background || "#e2e8f0",
          borderRadius: el.radius,
          fontSize: el.fontSize,
          color: el.color,
        }}
      >
        {el.text || "Photo"}
      </div>
    );
  }
  if (el.type === "qr") {
    return qr ? (
      <img src={qr} alt="QR" style={{ width: "100%", height: "100%", background: "#fff" }} />
    ) : (
      <div style={{ width: "100%", height: "100%", background: "#fff", border: "1px solid #cbd5e1" }} />
    );
  }
  const justify =
    el.align === "left" ? "flex-start" : el.align === "right" ? "flex-end" : "center";
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: justify,
        fontSize: el.fontSize,
        fontWeight: el.fontWeight as never,
        color: el.color,
        background: el.background,
        border: el.border,
        borderRadius: el.radius,
        textAlign: el.align,
        padding: 4,
        overflow: "hidden",
      }}
    >
      {replaceTokens(el.text, data)}
    </div>
  );
}

/** The model stores a CSS border string; the panel edits a width and a colour. */
function borderOf(value: string) {
  const match = /^\s*(\d+(?:\.\d+)?)px\s+solid\s+(.+?)\s*$/.exec(value || "");
  return match
    ? { width: Number(match[1]), color: match[2] }
    : { width: 0, color: "#334155" };
}

function cssBorder(width: number, color: string) {
  return width > 0 ? `${Math.round(width)}px solid ${color}` : "none";
}

function ElementButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Type;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 rounded-xl border bg-muted/30 p-3 text-xs font-semibold transition hover:bg-muted"
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

/**
 * A labelled slider. `onChange` fires all through the drag so the canvas moves
 * under the pointer; `onSettle` fires once at the end, for the undo step.
 */
function RangeField({
  label,
  min,
  max,
  step,
  value,
  onChange,
  onSettle,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  onSettle: () => void;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        className="w-full"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        onPointerUp={onSettle}
        onKeyUp={onSettle}
        onBlur={onSettle}
      />
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}
