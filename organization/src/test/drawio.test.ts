import { describe, it, expect, vi } from "vitest";

import { DRAWIO_ORIGIN, drawioUrl, readDrawioMessage, tellDrawio } from "@/lib/drawio";

const frame = {} as Window;
const other = {} as Window;
const XML = '<mxfile><diagram name="Page-1"></diagram></mxfile>';
const from = (data: unknown, origin = DRAWIO_ORIGIN, source: unknown = frame) => ({ origin, source, data });

describe("readDrawioMessage", () => {
  it("reads draw.io's own events", () => {
    expect(readDrawioMessage(from(JSON.stringify({ event: "init" })), frame)).toEqual({ event: "init" });
    expect(readDrawioMessage(from(JSON.stringify({ event: "autosave", xml: XML })), frame)).toEqual({
      event: "autosave",
      xml: XML,
    });
  });

  // Any page can postMessage to this window.
  it("ignores a message from any other origin", () => {
    expect(readDrawioMessage(from({ event: "save", xml: XML }, "https://evil.example"), frame)).toBeNull();
    expect(readDrawioMessage(from({ event: "save", xml: XML }, "https://app.diagrams.net"), frame)).toBeNull();
  });

  // Another frame from the same origin must not write into this board.
  it("ignores a message from a frame that is not this board's", () => {
    expect(readDrawioMessage(from({ event: "save", xml: XML }, DRAWIO_ORIGIN, other), frame)).toBeNull();
    expect(readDrawioMessage(from({ event: "save", xml: XML }), null)).toBeNull();
  });

  it("refuses a save whose body is not a diagram", () => {
    expect(readDrawioMessage(from({ event: "save", xml: "<script>alert(1)</script>" }), frame)).toBeNull();
    expect(readDrawioMessage(from({ event: "save", xml: 42 }), frame)).toBeNull();
  });

  it("refuses an export that is not a data URL", () => {
    expect(readDrawioMessage(from({ event: "export", data: "https://x/y.png" }), frame)).toBeNull();
    expect(readDrawioMessage(from({ event: "export", data: "data:image/png;base64,AAA" }), frame)).toMatchObject({
      event: "export",
    });
  });

  it("ignores garbage and events it does not know", () => {
    expect(readDrawioMessage(from("not json"), frame)).toBeNull();
    expect(readDrawioMessage(from({ event: "configure" }), frame)).toBeNull();
    expect(readDrawioMessage(from(null), frame)).toBeNull();
  });
});

describe("tellDrawio", () => {
  // "*" would hand the diagram to whatever page the frame had navigated to.
  it("posts only to draw.io's origin, never to '*'", () => {
    const postMessage = vi.fn();
    tellDrawio({ postMessage } as unknown as Window, { action: "load", xml: XML });
    expect(postMessage).toHaveBeenCalledWith(JSON.stringify({ action: "load", xml: XML }), DRAWIO_ORIGIN);
  });

  it("does nothing before the frame exists", () => {
    expect(() => tellDrawio(null, { action: "load" })).not.toThrow();
  });
});

describe("drawioUrl", () => {
  it("opens the JSON embed protocol with no Exit button", () => {
    const url = new URL(drawioUrl("sketch"));
    expect(url.origin).toBe(DRAWIO_ORIGIN);
    expect(url.searchParams.get("embed")).toBe("1");
    expect(url.searchParams.get("proto")).toBe("json");
    expect(url.searchParams.get("noExitBtn")).toBe("1");
    expect(url.searchParams.get("ui")).toBe("sketch");
  });
});
