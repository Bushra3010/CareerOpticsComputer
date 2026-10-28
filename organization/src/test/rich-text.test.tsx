import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import {
  isRichTextEmpty,
  plainToRichText,
  richTextToPlain,
  sanitizeRichText,
} from "@/lib/rich-text";

/**
 * The writing editor stores HTML, and stored HTML is put on screen with
 * `dangerouslySetInnerHTML`. That is only safe while the sanitiser holds, so
 * this file pins down what survives it and what does not.
 */
describe("sanitizeRichText", () => {
  it("keeps the formatting the toolbar can produce", () => {
    const html =
      '<h2>Heading</h2><p style="text-align: center"><strong>Bold</strong> and <em>italic</em></p>' +
      "<ul><li>One</li><li>Two</li></ul><blockquote>Quoted</blockquote><hr>";
    expect(sanitizeRichText(html)).toBe(html);
  });

  it("drops a script tag along with everything inside it", () => {
    const clean = sanitizeRichText('<p>Before</p><script>alert("x")</script><p>After</p>');
    expect(clean).toBe("<p>Before</p><p>After</p>");
    expect(clean).not.toContain("alert");
  });

  it("strips event handlers from a tag it otherwise keeps", () => {
    expect(sanitizeRichText('<p onclick="steal()">Wording</p>')).toBe("<p>Wording</p>");
    expect(sanitizeRichText('<img src="https://x.test/a.png" onerror="steal()">')).toBe(
      '<img src="https://x.test/a.png">',
    );
  });

  it("refuses a javascript: link but keeps the words it was written on", () => {
    expect(sanitizeRichText('<a href="javascript:steal()">Click me</a>')).toBe("Click me");
  });

  it("sends a real link to a new tab, without handing it this one", () => {
    const clean = sanitizeRichText('<a href="https://example.com">Example</a>');
    expect(clean).toContain('href="https://example.com"');
    expect(clean).toContain('rel="noopener noreferrer"');
  });

  it("allows a pasted-in picture only as raster data or over http", () => {
    const png = "data:image/png;base64,iVBORw0KGgo=";
    expect(sanitizeRichText(`<img src="${png}">`)).toContain(png);
    // SVG and text data URLs can carry script, so they are not pictures here.
    expect(sanitizeRichText('<img src="data:text/html;base64,PHNjcmlwdD4=">')).toBe("");
    expect(sanitizeRichText('<img src="data:image/svg+xml;base64,PHN2Zz4=">')).toBe("");
  });

  it("unwraps a tag it does not know rather than losing the wording", () => {
    expect(sanitizeRichText("<section><p>Kept</p></section>")).toBe("<p>Kept</p>");
  });

  it("keeps the style properties that are formatting, and no others", () => {
    const clean = sanitizeRichText(
      '<p style="text-align: right; position: fixed; background: url(http://x.test/a)">Aligned</p>',
    );
    expect(clean).toBe('<p style="text-align: right">Aligned</p>');
  });

  it("leaves plain text exactly as it was written", () => {
    // The bank holds questions saved before any of this existed.
    expect(sanitizeRichText("If 2x + 6 = 18, what is x?")).toBe("If 2x + 6 = 18, what is x?");
  });
});

describe("richTextToPlain", () => {
  it("reads the wording out of the markup", () => {
    expect(richTextToPlain("<p><strong>Name</strong> the noble gases.</p>")).toBe(
      "Name the noble gases.",
    );
  });

  it("keeps a word boundary where a block or a break was", () => {
    expect(richTextToPlain("<p>one</p><p>two</p>")).toBe("one two");
    expect(richTextToPlain("one<br>two")).toBe("one two");
  });
});

describe("isRichTextEmpty", () => {
  it("is empty for nothing, and for what an emptied box leaves behind", () => {
    expect(isRichTextEmpty("")).toBe(true);
    expect(isRichTextEmpty("<p><br></p>")).toBe(true);
  });

  it("is not empty for a question that is only a diagram", () => {
    expect(isRichTextEmpty('<img src="https://x.test/graph.png">')).toBe(false);
  });
});

describe("plainToRichText", () => {
  it("escapes what would otherwise be read as a tag", () => {
    expect(plainToRichText("2 < 3 & 4 > 1")).toBe("2 &lt; 3 &amp; 4 &gt; 1");
    expect(richTextToPlain(plainToRichText("2 < 3"))).toBe("2 < 3");
  });
});

/* ---------- the editor ---------- */

const toast = vi.fn();
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast }) }));
const pickImage = vi.fn();
vi.mock("@/lib/export", () => ({ pickImage: (...args: unknown[]) => pickImage(...(args as [])) }));

const { RichTextEditor } = await import("@/components/ui/rich-text-editor");

/** Drives the box the way a browser does: the caret writes into the DOM, and
 *  the editor reads it back on `input`. */
const type = (box: HTMLElement, html: string) => {
  box.innerHTML = html;
  fireEvent.input(box);
};

const Editor = ({ onChange = vi.fn(), value = "" }: { onChange?: (v: string) => void; value?: string }) => (
  <RichTextEditor label="Question text" placeholder="Write here..." value={value} onChange={onChange} />
);

beforeEach(() => {
  toast.mockClear();
  pickImage.mockReset();
});

describe("RichTextEditor", () => {
  it("offers the formatting the page is expected to do", () => {
    render(<Editor />);
    for (const name of [
      /^Bold$/, /^Italic$/, /^Underline$/, /^Strikethrough$/,
      /bullet list/i, /numbered list/i, /increase indent/i, /decrease indent/i,
      /align left/i, /align centre/i, /align right/i, /^Justify$/,
      /^Quote$/, /code block/i, /horizontal rule/i,
      /^Link$/, /^Unlink$/, /clear formatting/i,
      /text colour/i, /^Highlight$/, /^Upload$/, /image url/i, /insert table/i,
    ]) {
      expect(screen.getByRole("button", { name })).toBeInTheDocument();
    }
    expect(screen.getByLabelText(/paragraph style/i)).toBeInTheDocument();
  });

  it("hands back what was written", () => {
    const onChange = vi.fn();
    render(<Editor onChange={onChange} />);
    type(screen.getByRole("textbox", { name: /question text/i }), "<p>Define <b>osmosis</b>.</p>");
    expect(onChange).toHaveBeenCalledWith("<p>Define <b>osmosis</b>.</p>");
  });

  it("reports an emptied box as empty, not as the stray break left in it", () => {
    const onChange = vi.fn();
    render(<Editor onChange={onChange} />);
    type(screen.getByRole("textbox", { name: /question text/i }), "<br>");
    expect(onChange).toHaveBeenCalledWith("");
  });

  it("sanitises what is pasted in, rather than what is saved out", () => {
    const onChange = vi.fn();
    render(<Editor onChange={onChange} />);
    const box = screen.getByRole("textbox", { name: /question text/i });
    fireEvent.paste(box, {
      clipboardData: {
        getData: (kind: string) =>
          kind === "text/html" ? '<p onclick="steal()">Pasted</p><script>steal()</script>' : "Pasted",
      },
    });
    expect(box.innerHTML).toBe("<p>Pasted</p>");
    expect(onChange).toHaveBeenCalledWith("<p>Pasted</p>");
  });

  it("puts a table into the text", () => {
    render(<Editor />);
    fireEvent.click(screen.getByRole("button", { name: /insert table/i }));
    const box = screen.getByRole("textbox", { name: /question text/i });
    expect(box.querySelectorAll("th")).toHaveLength(3);
    expect(box.querySelectorAll("tbody tr")).toHaveLength(2);
  });

  it("takes a picture by address", () => {
    render(<Editor />);
    fireEvent.click(screen.getByRole("button", { name: /image url/i }));
    fireEvent.change(screen.getByLabelText(/image address/i), {
      target: { value: "https://x.test/diagram.png" },
    });
    fireEvent.click(screen.getByRole("button", { name: /add image/i }));

    const image = screen
      .getByRole("textbox", { name: /question text/i })
      .querySelector("img");
    expect(image?.getAttribute("src")).toBe("https://x.test/diagram.png");
  });

  it("takes an uploaded picture into the text itself", async () => {
    pickImage.mockResolvedValue({ name: "graph.png", dataUrl: "data:image/png;base64,iVBORw0KGgo=" });
    render(<Editor />);
    fireEvent.click(screen.getByRole("button", { name: /^Upload$/ }));

    await waitFor(() =>
      expect(
        screen.getByRole("textbox", { name: /question text/i }).querySelector("img"),
      ).toBeTruthy(),
    );
  });

  it("refuses a picture too large to keep inside the text", async () => {
    pickImage.mockResolvedValue("too-large");
    render(<Editor />);
    fireEvent.click(screen.getByRole("button", { name: /^Upload$/ }));

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: "Image too large" })),
    );
  });
});
