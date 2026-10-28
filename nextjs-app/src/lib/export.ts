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

/** Export an array of records as CSV, deriving headers from the first row. */
export function downloadCsv(
  filename: string,
  rows: Array<Record<string, unknown>>,
  headers?: string[],
) {
  const keys = headers ?? Object.keys(rows[0] ?? {});
  const csv = [
    keys.join(","),
    ...rows.map((row) => keys.map((k) => cell(row[k])).join(",")),
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
      .card{border:1px solid #ccc;border-radius:12px;padding:16px;margin-bottom:12px}
    </style><h1>${title}</h1>${bodyHtml}`,
  );
  doc.close();
  frame.contentWindow?.focus();
  frame.contentWindow?.print();
  setTimeout(() => frame.remove(), 1000);
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
    new Blob([...locals, ...central, new Uint8Array(end.buffer)] as any, { type: "application/zip" }),
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
