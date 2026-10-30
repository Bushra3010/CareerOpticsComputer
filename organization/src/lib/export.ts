/** Shared file-producing helpers for the Export / Download / Print buttons. */

const save = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const cell = (value: unknown) => {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

/**
 * Export an array of records as CSV, deriving headers from the first row.
 * Generic rather than `Record<string, unknown>[]`: an interface without an index
 * signature is not assignable to that, so every caller passing a typed row
 * (`AttendanceDay[]`, `PortalResult[]`, ...) would otherwise have to cast.
 */
export function downloadCsv<T extends object>(
  filename: string,
  rows: readonly T[],
  headers?: string[],
) {
  const keys = headers ?? Object.keys(rows[0] ?? {});
  const csv = [
    keys.join(","),
    ...rows.map((row) => keys.map((k) => cell((row as Record<string, unknown>)[k])).join(",")),
  ].join("\n");
  save(new Blob([csv], { type: "text/csv;charset=utf-8" }), filename);
}

/** Parse CSV text into records keyed by the header row — the inverse of `downloadCsv`. */
export function parseCsv(text: string): Array<Record<string, string>> {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char !== '"') value += char;
      else if (text[i + 1] === '"') (value += '"'), i++;
      else quoted = false;
      continue;
    }
    if (char === '"') quoted = true;
    else if (char === ",") (row.push(value), (value = ""));
    else if (char === "\n") (row.push(value), rows.push(row), (row = []), (value = ""));
    else if (char !== "\r") value += char;
  }
  if (value !== "" || row.length) (row.push(value), rows.push(row));

  const [headers, ...body] = rows.filter((r) => r.some((c) => c.trim() !== ""));
  if (!headers) return [];
  return body.map((r) =>
    Object.fromEntries(headers.map((h, i) => [h.trim(), (r[i] ?? "").trim()])),
  );
}

export function downloadJson(filename: string, data: unknown) {
  save(
    new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
    filename,
  );
}

/** Open the browser print dialog for a titled, self-contained fragment. */
export function printHtml(title: string, bodyHtml: string) {
  const frame = document.createElement("iframe");
  frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0";
  document.body.appendChild(frame);
  const doc = frame.contentDocument;
  if (!doc) return;
  doc.write(
    `<!doctype html><title>${title}</title><style>
      body{font-family:ui-sans-serif,system-ui,sans-serif;margin:32px;color:#111}
      h1{font-size:20px;margin:0 0 16px}
      table{border-collapse:collapse;width:100%}
      td,th{border:1px solid #ccc;padding:8px;text-align:left;font-size:13px}
      img{max-width:100%}
      blockquote{margin:8px 0;padding-left:12px;border-left:3px solid #ccc;color:#444}
      .card{border:1px solid #ccc;border-radius:12px;padding:16px;margin-bottom:12px}
    </style><h1>${title}</h1>${bodyHtml}`,
  );
  doc.close();
  frame.contentWindow?.focus();
  frame.contentWindow?.print();
  setTimeout(() => frame.remove(), 1000);
}

/**
 * Print designed pages -- certificates drawn in the Document Designer -- one
 * per sheet, each scaled to fill an A4 page in its own orientation.
 *
 * `printHtml` suits reports but not these: its margin and heading push a
 * 1000px-wide certificate off the right edge of a portrait sheet, and Chrome
 * leaves out background colours and watermarks unless a page asks for them.
 */
export function printDesignPages(title: string, pages: string[], width: number, height: number) {
  const landscape = width > height;
  // A4 at 96dpi, less a 5mm margin all round.
  const [pageW, pageH] = landscape ? [1085, 756] : [756, 1085];
  const scale = Math.min(pageW / width, pageH / height);
  const sheets = pages
    .map(
      (page) =>
        `<div class="sheet" style="width:${width * scale}px;height:${height * scale}px">` +
        `<div style="width:${width}px;height:${height}px;transform:scale(${scale});transform-origin:0 0">${page}</div></div>`,
    )
    .join("");

  const frame = document.createElement("iframe");
  frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0";
  document.body.appendChild(frame);
  const doc = frame.contentDocument;
  if (!doc) return;
  doc.write(
    `<!doctype html><title>${title}</title><style>
      @page{size:A4 ${landscape ? "landscape" : "portrait"};margin:5mm}
      html,body{margin:0;padding:0;font-family:ui-sans-serif,system-ui,sans-serif}
      *{-webkit-print-color-adjust:exact;print-color-adjust:exact}
      .sheet{overflow:hidden;margin:0 auto;page-break-after:always;break-after:page}
      .sheet:last-child{page-break-after:auto;break-after:auto}
    </style>${sheets}`,
  );
  doc.close();
  // Images inside the design (logos, the watermark) have to be in before the
  // dialog snapshots the page.
  const loaded = (img: HTMLImageElement) =>
    img.complete
      ? Promise.resolve()
      : new Promise<void>((resolve) => {
          img.addEventListener("load", () => resolve(), { once: true });
          img.addEventListener("error", () => resolve(), { once: true });
        });
  Promise.all(Array.from(doc.images).map(loaded)).then(() => {
    frame.contentWindow?.focus();
    frame.contentWindow?.print();
    setTimeout(() => frame.remove(), 1000);
  });
}

/** Save a titled HTML fragment as a standalone file — the "Download report" twin of `printHtml`. */
export function downloadHtml(filename: string, title: string, bodyHtml: string) {
  save(
    new Blob(
      [
        `<!doctype html><meta charset="utf-8"><title>${title}</title>` +
          `<style>body{font-family:ui-sans-serif,system-ui,sans-serif;margin:32px;color:#111}` +
          `h1{font-size:20px;margin:0 0 16px}table{border-collapse:collapse;width:100%}` +
          `td,th{border:1px solid #ccc;padding:8px;text-align:left;font-size:13px}</style>` +
          `<h1>${title}</h1>${bodyHtml}`,
      ],
      { type: "text/html;charset=utf-8" },
    ),
    filename,
  );
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c >>> 0;
  }
  return table;
})();

const crc32 = (bytes: Uint8Array) => {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};

/**
 * Store-only (uncompressed) ZIP writer. Everything we bundle is already-
 * compressed PNG, so deflate would buy nothing and pulling in a zip dependency
 * for that is not worth it.
 */
export function downloadZip(filename: string, files: Array<{ name: string; data: Uint8Array }>) {
  const encoder = new TextEncoder();
  const locals: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;

  for (const file of files) {
    const name = encoder.encode(file.name);
    const crc = crc32(file.data);

    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 0x04034b50, true);
    local.setUint16(4, 20, true); // version needed
    local.setUint16(8, 0, true); // method: store
    local.setUint32(14, crc, true);
    local.setUint32(18, file.data.length, true);
    local.setUint32(22, file.data.length, true);
    local.setUint16(26, name.length, true);
    locals.push(new Uint8Array(local.buffer), name, file.data);

    const entry = new DataView(new ArrayBuffer(46));
    entry.setUint32(0, 0x02014b50, true);
    entry.setUint16(4, 20, true);
    entry.setUint16(6, 20, true);
    entry.setUint16(10, 0, true);
    entry.setUint32(16, crc, true);
    entry.setUint32(20, file.data.length, true);
    entry.setUint32(24, file.data.length, true);
    entry.setUint16(28, name.length, true);
    entry.setUint32(42, offset, true);
    central.push(new Uint8Array(entry.buffer), name);

    offset += 30 + name.length + file.data.length;
  }

  const centralSize = central.reduce((sum, part) => sum + part.length, 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true);
  end.setUint16(8, files.length, true);
  end.setUint16(10, files.length, true);
  end.setUint32(12, centralSize, true);
  end.setUint32(16, offset, true);

  save(
    new Blob([...locals, ...central, new Uint8Array(end.buffer)] as BlobPart[], { type: "application/zip" }),
    filename,
  );
}

/** Decode a `data:...;base64,` URL into raw bytes, for zipping generated images. */
export function dataUrlToBytes(dataUrl: string) {
  const binary = atob(dataUrl.slice(dataUrl.indexOf(",") + 1));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/** Prompt for a file and hand back its text, for the Import / Upload buttons. */
export function pickFile(accept: string): Promise<{ name: string; text: string } | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.onchange = async () => {
      const file = input.files?.[0];
      resolve(file ? { name: file.name, text: await file.text() } : null);
    };
    input.oncancel = () => resolve(null);
    input.click();
  });
}

/**
 * Prompt for an image and hand back a data URL, for the "Choose File" / logo /
 * banner uploads. Returns `"too-large"` rather than throwing so callers can
 * show their own message.
 */
export function pickImage(
  accept = "image/*",
  maxBytes = 5 * 1024 * 1024,
): Promise<{ name: string; dataUrl: string } | "too-large" | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return resolve(null);
      if (file.size > maxBytes) return resolve("too-large");
      const reader = new FileReader();
      reader.onload = () => resolve({ name: file.name, dataUrl: String(reader.result) });
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    };
    input.oncancel = () => resolve(null);
    input.click();
  });
}

/** A CR80 card -- the size of an ID card -- in mm, long side first. */
const CARD_MM = { long: 85.6, short: 54 };
const PX_PER_MM = 96 / 25.4;

/**
 * Lays designed cards out at their real size, as many to an A4 sheet as fit
 * (ten landscape or nine portrait cards), with a light cut line round each.
 * Each card is `{ html, width, height }` in the designer's pixels; the
 * orientation is read from its own shape, so branches with differently
 * turned designs share a sheet.
 */
export function printCardSheets(title: string, cards: Array<{ html: string; width: number; height: number }>) {
  const page = { w: 210 - 12, h: 297 - 12 }; // A4 less a 6mm margin
  const gap = 3;
  const sized = cards.map((card) => {
    const landscape = card.width >= card.height;
    const w = landscape ? CARD_MM.long : CARD_MM.short;
    const h = landscape ? CARD_MM.short : CARD_MM.long;
    return { ...card, w, h, scale: (w * PX_PER_MM) / card.width };
  });

  // Rows across, sheets down: a card that does not fit the row starts the next
  // row, and a row that does not fit the sheet starts the next sheet.
  type Placed = (typeof sized)[number];
  const sheets: Placed[][][] = [[[]]];
  let rowW = 0;
  let usedH = 0;
  let rowH = 0;
  for (const card of sized) {
    let rows = sheets[sheets.length - 1];
    if (rows[rows.length - 1].length && rowW + gap + card.w > page.w) {
      // A new row: on this sheet if it fits below, else at the top of the next.
      if (usedH + rowH + gap + card.h > page.h) {
        sheets.push([[]]);
        usedH = 0;
      } else {
        usedH += rowH + gap;
        rows.push([]);
      }
      rows = sheets[sheets.length - 1];
      rowW = 0;
      rowH = 0;
    }
    rows[rows.length - 1].push(card);
    rowW += (rowW ? gap : 0) + card.w;
    rowH = Math.max(rowH, card.h);
  }

  const cardHtml = (card: Placed) =>
    `<div class="card" style="width:${card.w}mm;height:${card.h}mm">` +
    `<div style="width:${card.width}px;height:${card.height}px;transform:scale(${card.scale});transform-origin:0 0">${card.html}</div></div>`;
  const body = sheets
    .map((rows) => `<div class="sheet">${rows.map((row) => `<div class="row">${row.map(cardHtml).join("")}</div>`).join("")}</div>`)
    .join("");

  const frame = document.createElement("iframe");
  frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0";
  document.body.appendChild(frame);
  const doc = frame.contentDocument;
  if (!doc) return;
  doc.write(
    `<!doctype html><title>${title}</title><style>
      @page{size:A4 portrait;margin:6mm}
      html,body{margin:0;padding:0;font-family:ui-sans-serif,system-ui,sans-serif}
      *{-webkit-print-color-adjust:exact;print-color-adjust:exact}
      .sheet{display:flex;flex-direction:column;gap:${gap}mm;page-break-after:always;break-after:page}
      .sheet:last-child{page-break-after:auto;break-after:auto}
      .row{display:flex;gap:${gap}mm;justify-content:center}
      .card{overflow:hidden;outline:0.2mm dashed #bbb;break-inside:avoid}
    </style>${body}`,
  );
  doc.close();
  const loaded = (img: HTMLImageElement) =>
    img.complete
      ? Promise.resolve()
      : new Promise<void>((resolve) => {
          img.addEventListener("load", () => resolve(), { once: true });
          img.addEventListener("error", () => resolve(), { once: true });
        });
  Promise.all(Array.from(doc.images).map(loaded)).then(() => {
    frame.contentWindow?.focus();
    frame.contentWindow?.print();
    setTimeout(() => frame.remove(), 1000);
  });
}
