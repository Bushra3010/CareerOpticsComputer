import { describe, it, expect, beforeEach } from "vitest";
import {
  BACKGROUND_DEFAULTS,
  DESIGN_STORAGE_KEY,
  designHtml,
  loadDesigns,
  starterDesign,
  styleText,
  watermarkStyle,
  type DocumentDesign,
} from "@/lib/documentDesigner";

/**
 * A certificate's mark was pinned to the middle of the page, filling it, fully
 * opaque, with nothing anywhere to change any of that.
 */
const design = (overrides: Partial<DocumentDesign> = {}): DocumentDesign => ({
  ...starterDesign("certificate"),
  backgroundImage: "data:image/png;base64,AAAA",
  ...overrides,
});

beforeEach(() => {
  localStorage.clear();
});

describe("watermarkStyle", () => {
  it("leaves a design that was never tuned looking exactly as it did", () => {
    const style = watermarkStyle(design());
    expect(style.backgroundSize).toBe("cover");
    expect(style.backgroundPosition).toBe("50% 50%");
    expect(style.opacity).toBe(1);
    expect(style.transform).toBe("rotate(0deg) scale(1)");
  });

  it("scales the mark", () => {
    expect(watermarkStyle(design({ backgroundScale: 250 })).transform).toContain("scale(2.5)");
  });

  it("turns it", () => {
    expect(watermarkStyle(design({ backgroundRotate: -30 })).transform).toContain("rotate(-30deg)");
  });

  it("fades it, which is what makes it a watermark", () => {
    expect(watermarkStyle(design({ backgroundOpacity: 0.12 })).opacity).toBe(0.12);
  });

  it("moves it off centre", () => {
    const style = watermarkStyle(design({ backgroundX: 20, backgroundY: 80 }));
    expect(style.backgroundPosition).toBe("20% 80%");
  });

  it("fits the whole image inside the page when asked to", () => {
    expect(watermarkStyle(design({ backgroundFit: "contain" })).backgroundSize).toBe("contain");
  });

  it("forces it to the page when stretched", () => {
    expect(watermarkStyle(design({ backgroundFit: "stretch" })).backgroundSize).toBe("100% 100%");
  });

  it("repeats a tile, sizing it rather than transforming it", () => {
    // Scaling a repeating layer with a transform would grow the gaps as well.
    const style = watermarkStyle(design({ backgroundFit: "tile", backgroundScale: 200 }));
    expect(style.backgroundRepeat).toBe("repeat");
    expect(style.backgroundSize).toBe("50% auto");
    expect(style.transform).not.toContain("scale");
  });

  it("never swallows a click meant for an element beneath the pointer", () => {
    expect(watermarkStyle(design()).pointerEvents).toBe("none");
    expect(watermarkStyle(design()).zIndex).toBe(0);
  });

  it("refuses a scale of zero, which would make the mark vanish with no way back", () => {
    expect(watermarkStyle(design({ backgroundScale: 0 })).transform).toContain("scale(1)");
  });
});

describe("styleText", () => {
  it("writes camelCase properties the way CSS spells them", () => {
    expect(styleText({ backgroundSize: "cover", zIndex: 0 })).toBe("background-size:cover;z-index:0");
  });
});

describe("designHtml", () => {
  it("prints the mark as a layer of its own", () => {
    // It cannot be the canvas background: fading that would take every element
    // standing on it down with the mark.
    const html = designHtml("certificate", design({ backgroundOpacity: 0.1 }), {});
    expect(html).toContain("opacity:0.1");
    expect(html).toContain("background-image:url('data:image/png;base64,AAAA')");
  });

  it("draws no layer at all when there is no mark", () => {
    const html = designHtml("certificate", design({ backgroundImage: "" }), {});
    expect(html).not.toContain("background-image");
  });

  it("keeps the canvas colour underneath", () => {
    expect(designHtml("certificate", design({ background: "#fff7ed" }), {})).toContain(
      "background:#fff7ed",
    );
  });
});

describe("loadDesigns", () => {
  it("opens a design saved before any of these controls existed", () => {
    localStorage.setItem(
      DESIGN_STORAGE_KEY,
      JSON.stringify({
        certificate: { elements: [], background: "#ffffff", backgroundImage: "data:image/png;base64,AAAA" },
      }),
    );
    const loaded = loadDesigns().certificate;
    expect(loaded).toMatchObject(BACKGROUND_DEFAULTS);
  });

  it("keeps the settings of one that was tuned", () => {
    localStorage.setItem(
      DESIGN_STORAGE_KEY,
      JSON.stringify({
        certificate: {
          elements: [],
          background: "#ffffff",
          backgroundImage: "data:image/png;base64,AAAA",
          backgroundOpacity: 0.2,
          backgroundFit: "tile",
        },
      }),
    );
    const loaded = loadDesigns().certificate;
    expect(loaded?.backgroundOpacity).toBe(0.2);
    expect(loaded?.backgroundFit).toBe("tile");
    // An opacity of 0 is a real setting and must survive the migration.
    expect(loaded?.backgroundScale).toBe(BACKGROUND_DEFAULTS.backgroundScale);
  });

  it("does not overwrite a fully transparent mark with the default", () => {
    localStorage.setItem(
      DESIGN_STORAGE_KEY,
      JSON.stringify({ certificate: { elements: [], backgroundOpacity: 0 } }),
    );
    expect(loadDesigns().certificate?.backgroundOpacity).toBe(0);
  });
});
