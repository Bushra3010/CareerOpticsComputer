/**
 * The draw.io embed protocol, as the Whiteboard speaks it.
 *
 * draw.io runs in an iframe from embed.diagrams.net and talks to the page by
 * postMessage: it announces `init` when ready, the page answers with `load`
 * and the diagram's XML, and every change comes back as `autosave`. The
 * diagram never leaves the browser to reach diagrams.net — the XML is handed
 * to this page, and this page decides where it is kept.
 */

export const DRAWIO_ORIGIN = "https://embed.diagrams.net";

/** The editor's look. "sketch" is the hand-drawn whiteboard; the rest are draw.io's own. */
export type DrawioTheme = "kennedy" | "sketch" | "dark" | "min";

export function drawioUrl(theme: DrawioTheme = "kennedy"): string {
  const params = new URLSearchParams({
    embed: "1",
    proto: "json",
    spin: "1",
    // Every shape library, since the point of draw.io here is its feature set.
    libraries: "1",
    // This is a page, not a modal to be dismissed: no Exit, no Save & Exit.
    noExitBtn: "1",
    saveAndExit: "0",
    ui: theme,
  });
  return `${DRAWIO_ORIGIN}/?${params.toString()}`;
}

/** A diagram with nothing on it, which is what a new board opens as. */
export const EMPTY_DIAGRAM =
  '<mxfile><diagram name="Page-1"><mxGraphModel><root><mxCell id="0"/><mxCell id="1" parent="0"/></root></mxGraphModel></diagram></mxfile>';

export type DrawioEvent =
  | { event: "init" }
  | { event: "autosave"; xml: string }
  | { event: "save"; xml: string }
  | { event: "export"; data: string; format?: string }
  | { event: "exit"; modified?: boolean };

/**
 * What a message from draw.io says, or null if it is not one to act on.
 *
 * Three checks, all required. The origin, because any page can postMessage to
 * this window. The source, because two whiteboards open at once — or any other
 * frame from the same origin — must not be able to write into this one. And
 * the shape, because a board that saved whatever `xml` a message carried would
 * store a string it never checked was a diagram.
 */
export function readDrawioMessage(
  message: { origin: string; source: unknown; data: unknown },
  frame: Window | null | undefined,
): DrawioEvent | null {
  if (message.origin !== DRAWIO_ORIGIN) return null;
  if (!frame || message.source !== frame) return null;

  let data: unknown = message.data;
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch {
      return null;
    }
  }
  if (!data || typeof data !== "object") return null;
  const payload = data as Record<string, unknown>;

  switch (payload.event) {
    case "init":
      return { event: "init" };
    case "autosave":
    case "save":
      return typeof payload.xml === "string" && payload.xml.includes("<mxfile")
        ? { event: payload.event, xml: payload.xml }
        : null;
    case "export":
      return typeof payload.data === "string" && payload.data.startsWith("data:")
        ? { event: "export", data: payload.data, format: typeof payload.format === "string" ? payload.format : undefined }
        : null;
    case "exit":
      return { event: "exit", modified: Boolean(payload.modified) };
    default:
      return null;
  }
}

/** Send one action to the editor — only ever to draw.io's own origin, never "*". */
export function tellDrawio(frame: Window | null | undefined, action: Record<string, unknown>) {
  frame?.postMessage(JSON.stringify(action), DRAWIO_ORIGIN);
}
