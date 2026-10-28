import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlignCenter, AlignJustify, AlignLeft, AlignRight, Baseline, Bold, Code,
  Highlighter, ImagePlus, Indent, Italic, Link2, Link2Off, List, ListOrdered,
  Minus, Outdent, Quote, Redo2, RemoveFormatting, Strikethrough, Table as TableIcon,
  Underline, Undo2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { pickImage } from "@/lib/export";
import { sanitizeRichText } from "@/lib/rich-text";
import { cn } from "@/lib/utils";

/**
 * The writing editor: what a question, a model answer or any other piece of
 * prose is typed into. It is a `contentEditable` box driven by `execCommand` --
 * deprecated on paper, implemented everywhere, and the only way to get bold,
 * lists, alignment and inline images without pulling in an editor framework.
 *
 * What it stores is the same small subset of HTML `sanitizeRichText` allows.
 * Two rules keep that true: everything pasted is sanitised on the way in, and
 * everything shown is sanitised again on the way out.
 */

/** Inline images are held as data URLs -- there is no storage bucket wired up --
 *  so the same 2MB ceiling the admission uploads use applies here. */
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

const TEXT_COLORS = [
  { label: "Ink", value: "#111827" },
  { label: "Grey", value: "#6b7280" },
  { label: "Red", value: "#dc2626" },
  { label: "Amber", value: "#d97706" },
  { label: "Green", value: "#15803d" },
  { label: "Blue", value: "#1d4ed8" },
  { label: "Violet", value: "#7c3aed" },
];

const HIGHLIGHTS = [
  { label: "Yellow", value: "#fef08a" },
  { label: "Green", value: "#bbf7d0" },
  { label: "Blue", value: "#bfdbfe" },
  { label: "Pink", value: "#fbcfe8" },
  { label: "None", value: "transparent" },
];

const BLOCK_STYLES = [
  { label: "Paragraph", value: "p" },
  { label: "Heading 1", value: "h1" },
  { label: "Heading 2", value: "h2" },
  { label: "Heading 3", value: "h3" },
  { label: "Quote", value: "blockquote" },
  { label: "Code block", value: "pre" },
];

const TABLE_HTML = `<table style="border-collapse: collapse; width: 100%"><thead><tr>${
  ["Heading", "Heading", "Heading"]
    .map((h) => `<th style="border: 1px solid #d4d4d8; padding: 6px">${h}</th>`)
    .join("")
}</tr></thead><tbody>${
  [0, 1]
    .map(
      () =>
        `<tr>${[0, 1, 2]
          .map(() => `<td style="border: 1px solid #d4d4d8; padding: 6px"><br></td>`)
          .join("")}</tr>`,
    )
    .join("")
}</tbody></table><p><br></p>`;

const escapeText = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  /** Labels the writing area itself, since the toolbar buttons have their own. */
  label: string;
  id?: string;
  minHeight?: number;
  className?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  label,
  id,
  minHeight = 160,
  className,
}: RichTextEditorProps) {
  const { toast } = useToast();
  const editorRef = useRef<HTMLDivElement>(null);
  /** Where the caret was before the toolbar took focus. */
  const selectionRef = useRef<Range | null>(null);
  /** The last HTML this editor emitted, so the value it is given back does not
   *  get written over the DOM mid-keystroke and throw the caret to the start. */
  const emittedRef = useRef<string>("");
  const [prompt, setPrompt] = useState<null | "link" | "image">(null);
  const [promptValue, setPromptValue] = useState("");

  useEffect(() => {
    const el = editorRef.current;
    if (!el || value === emittedRef.current) return;
    el.innerHTML = sanitizeRichText(value);
    emittedRef.current = value;
  }, [value]);

  const emit = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    // An emptied box leaves a stray <br> behind; report it as empty so a
    // required field is not satisfied by pressing and deleting one character.
    const html = el.innerHTML === "<br>" ? "" : el.innerHTML;
    emittedRef.current = html;
    onChange(html);
  }, [onChange]);

  const rememberSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    if (editorRef.current?.contains(range.commonAncestorContainer)) {
      selectionRef.current = range.cloneRange();
    }
  }, []);

  const restoreSelection = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    const range = selectionRef.current;
    const selection = window.getSelection();
    if (!range || !selection || !el.contains(range.commonAncestorContainer)) return;
    selection.removeAllRanges();
    selection.addRange(range);
  }, []);

  const exec = useCallback(
    (command: string, argument?: string) => {
      restoreSelection();
      // Colours as CSS rather than <font>, which nothing else understands.
      document.execCommand?.("styleWithCSS", false, "true");
      document.execCommand?.(command, false, argument);
      rememberSelection();
      emit();
    },
    [emit, rememberSelection, restoreSelection],
  );

  /** Inserts at the caret with the Range API rather than `insertHTML`, so a
   *  table or an image lands in the same place in every browser. */
  const insertHtml = useCallback(
    (html: string) => {
      const el = editorRef.current;
      if (!el) return;
      restoreSelection();
      const selection = window.getSelection();
      let range: Range;
      if (
        selection?.rangeCount &&
        el.contains(selection.getRangeAt(0).commonAncestorContainer)
      ) {
        range = selection.getRangeAt(0);
      } else {
        range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
      }
      range.deleteContents();
      const holder = document.createElement("div");
      holder.innerHTML = sanitizeRichText(html);
      const fragment = document.createDocumentFragment();
      while (holder.firstChild) fragment.appendChild(holder.firstChild);
      const last = fragment.lastChild;
      range.insertNode(fragment);
      if (last && selection) {
        range.setStartAfter(last);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        selectionRef.current = range.cloneRange();
      }
      emit();
    },
    [emit, restoreSelection],
  );

  const uploadImage = async () => {
    const picked = await pickImage("image/png,image/jpeg,image/webp,image/gif", MAX_IMAGE_BYTES);
    if (picked === "too-large") {
      toast({
        title: "Image too large",
        description: "Pictures are kept inside the text, so they have to be under 2MB.",
        variant: "destructive",
      });
      return;
    }
    if (!picked) return;
    insertHtml(
      `<img src="${picked.dataUrl}" alt="${escapeText(picked.name)}" style="max-width: 100%" />`,
    );
  };

  const applyPrompt = () => {
    const entered = promptValue.trim();
    if (entered) {
      if (prompt === "image") insertHtml(`<img src="${entered}" alt="" style="max-width: 100%" />`);
      else exec("createLink", entered);
    }
    setPrompt(null);
    setPromptValue("");
  };

  const openPrompt = (which: "link" | "image") => {
    rememberSelection();
    setPromptValue("");
    setPrompt((open) => (open === which ? null : which));
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    // The clipboard is where markup this editor never wrote comes from.
    event.preventDefault();
    const html = event.clipboardData.getData("text/html");
    const text = event.clipboardData.getData("text/plain");
    if (html) insertHtml(html);
    else if (text) insertHtml(escapeText(text).replace(/\r?\n/g, "<br>"));
  };

  const empty = !value || value === "<br>";

  return (
    <div className={cn("rounded-xl border bg-background", className)}>
      <div className="flex flex-wrap items-center gap-1 border-b p-2">
        <select
          aria-label="Paragraph style"
          className="h-8 rounded-md border border-input bg-background px-2 text-xs"
          value=""
          onChange={(e) => {
            if (e.target.value) exec("formatBlock", `<${e.target.value}>`);
            e.target.value = "";
          }}
        >
          <option value="">Style</option>
          {BLOCK_STYLES.map((style) => (
            <option key={style.value} value={style.value}>
              {style.label}
            </option>
          ))}
        </select>

        <Divider />
        <ToolButton label="Undo" onClick={() => exec("undo")}><Undo2 /></ToolButton>
        <ToolButton label="Redo" onClick={() => exec("redo")}><Redo2 /></ToolButton>

        <Divider />
        <ToolButton label="Bold" onClick={() => exec("bold")}><Bold /></ToolButton>
        <ToolButton label="Italic" onClick={() => exec("italic")}><Italic /></ToolButton>
        <ToolButton label="Underline" onClick={() => exec("underline")}><Underline /></ToolButton>
        <ToolButton label="Strikethrough" onClick={() => exec("strikeThrough")}>
          <Strikethrough />
        </ToolButton>

        <Divider />
        <ToolButton label="Bullet list" onClick={() => exec("insertUnorderedList")}><List /></ToolButton>
        <ToolButton label="Numbered list" onClick={() => exec("insertOrderedList")}>
          <ListOrdered />
        </ToolButton>
        <ToolButton label="Decrease indent" onClick={() => exec("outdent")}><Outdent /></ToolButton>
        <ToolButton label="Increase indent" onClick={() => exec("indent")}><Indent /></ToolButton>

        <Divider />
        <ToolButton label="Align left" onClick={() => exec("justifyLeft")}><AlignLeft /></ToolButton>
        <ToolButton label="Align centre" onClick={() => exec("justifyCenter")}><AlignCenter /></ToolButton>
        <ToolButton label="Align right" onClick={() => exec("justifyRight")}><AlignRight /></ToolButton>
        <ToolButton label="Justify" onClick={() => exec("justifyFull")}><AlignJustify /></ToolButton>

        <Divider />
        <ToolButton label="Quote" onClick={() => exec("formatBlock", "<blockquote>")}>
          <Quote />
        </ToolButton>
        <ToolButton label="Code block" onClick={() => exec("formatBlock", "<pre>")}><Code /></ToolButton>
        <ToolButton label="Horizontal rule" onClick={() => insertHtml("<hr />")}><Minus /></ToolButton>

        <Divider />
        <ToolButton label="Link" onClick={() => openPrompt("link")}><Link2 /></ToolButton>
        <ToolButton label="Unlink" onClick={() => exec("unlink")}><Link2Off /></ToolButton>
        <ToolButton label="Clear formatting" onClick={() => exec("removeFormat")}>
          <RemoveFormatting />
        </ToolButton>

        <Divider />
        <SwatchMenu
          label="Text colour"
          icon={<Baseline />}
          swatches={TEXT_COLORS}
          onPick={(colour) => exec("foreColor", colour)}
          onOpen={rememberSelection}
        />
        <SwatchMenu
          label="Highlight"
          icon={<Highlighter />}
          swatches={HIGHLIGHTS}
          onPick={(colour) => exec("hiliteColor", colour)}
          onOpen={rememberSelection}
        />

        <Divider />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 px-2 text-xs"
          onMouseDown={(e) => e.preventDefault()}
          onClick={uploadImage}
        >
          <ImagePlus className="h-3.5 w-3.5" />
          Upload
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 px-2 text-xs"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => openPrompt("image")}
        >
          <Link2 className="h-3.5 w-3.5" />
          Image URL
        </Button>
        <ToolButton label="Insert table" onClick={() => insertHtml(TABLE_HTML)}>
          <TableIcon />
        </ToolButton>
      </div>

      {prompt && (
        <div className="flex items-center gap-2 border-b bg-muted/40 p-2">
          <Input
            autoFocus
            className="h-8 text-xs"
            aria-label={prompt === "link" ? "Link address" : "Image address"}
            placeholder={prompt === "link" ? "https://example.com" : "https://example.com/photo.jpg"}
            value={promptValue}
            onChange={(e) => setPromptValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyPrompt();
              }
              if (e.key === "Escape") setPrompt(null);
            }}
          />
          <Button type="button" size="sm" className="h-8 px-3 text-xs" onClick={applyPrompt}>
            {prompt === "link" ? "Add link" : "Add image"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-xs"
            onClick={() => setPrompt(null)}
          >
            Cancel
          </Button>
        </div>
      )}

      <div
        id={id}
        ref={editorRef}
        role="textbox"
        aria-multiline="true"
        aria-label={label}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        data-empty={empty || undefined}
        style={{ minHeight }}
        className="rich-text rich-text-editor w-full px-3 py-2 text-sm focus-visible:outline-none"
        onInput={emit}
        onBlur={emit}
        onPaste={handlePaste}
        onKeyUp={rememberSelection}
        onMouseUp={rememberSelection}
      />
    </div>
  );
}

const Divider = () => <span className="mx-0.5 h-5 w-px bg-border" aria-hidden />;

function ToolButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-8 w-8 [&_svg]:size-4"
      title={label}
      aria-label={label}
      // Keeps the caret where it was: the button never takes focus.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

function SwatchMenu({
  label,
  icon,
  swatches,
  onPick,
  onOpen,
}: {
  label: string;
  icon: React.ReactNode;
  swatches: Array<{ label: string; value: string }>;
  onPick: (value: string) => void;
  onOpen: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (next) onOpen();
        setOpen(next);
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 [&_svg]:size-4"
          title={label}
          aria-label={label}
          onMouseDown={(e) => e.preventDefault()}
        >
          {icon}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-2"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex gap-1">
          {swatches.map((swatch) => (
            <button
              key={swatch.value}
              type="button"
              title={swatch.label}
              aria-label={`${label}: ${swatch.label}`}
              className="h-6 w-6 rounded-md border"
              style={{ background: swatch.value }}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onPick(swatch.value);
                setOpen(false);
              }}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
