import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { documentArtwork, fontOn, pt, registerBrandFonts, rgb, type BrandFont } from "./pdfAssets";
import type { StudentDocument } from "../documents";
import { marksheetGrade, marksheetRows, marksheetSummary } from "../documents";

/** A marksheet row with the pass mark the design's "MIN. MARKS" column asks for. */
function rowsWithMinimum(results: StudentDocument["examResults"]) {
  const rows = marksheetRows(results);
  // Pass marks are summed per subject the same way marksheetRows sums the papers.
  const minimum = new Map<string, number>();
  for (const r of results) {
    const label = String(r.exam.subject || r.exam.name || "");
    const subject = (r.exam.base || label.replace(/\s*\((Theory|Practical)\)\s*$/i, "") || "-").toLowerCase();
    minimum.set(subject, (minimum.get(subject) || 0) + (Number(r.exam.passMarks) || 0));
  }
  return rows.map((row) => ({
    subject: row.subject,
    max: row.total.max,
    obtained: row.total.marks,
    pass: minimum.get(row.subject.toLowerCase()) ?? 0,
  }));
}

/**
 * Drops the leading parts of a comma-separated value until it fits: a long
 * address on a card keeps its town, district and state rather than shrinking
 * to nothing.
 */
function fitSegments(doc: jsPDF, value: string, font: BrandFont, size: number, maxWidthPt: number): string {
  doc.setFont(fontOn(doc, font), "normal");
  doc.setFontSize(size);
  const parts = value.split(/,\s*/).filter(Boolean);
  while (parts.length > 1 && doc.getTextWidth(parts.join(", ")) > pt(maxWidthPt)) parts.shift();
  return parts.join(", ");
}

/**
 * The academy's printed documents, on the artwork its designer supplied.
 *
 * Each design was measured once (in PDF points) and the values below are
 * those measurements: where the designer left a dotted line for the name,
 * that is where the name goes. The artwork itself -- header, seals, labels,
 * footer -- is a blank background image under public/documents, so nothing
 * here redraws the design and nothing in the ERP can change it.
 *
 * Fonts: the designs are set in Poppins and Great Vibes, registered on the
 * document from public/fonts (see pdfAssets.ts).
 */

/* ------------------------------------------------------------------ */
/* Shared helpers                                                       */
/* ------------------------------------------------------------------ */

const NAVY = "#14266b";
const INK = "#1a1a1a";
const RED = "#c62828";
const GREEN = "#3c9a3c";
const ORANGE = "#f28a1b";

type Align = "left" | "center" | "right";

interface TextSpec {
  x: number; // pt
  y: number; // baseline, pt
  size: number;
  font: BrandFont;
  color?: string;
  align?: Align;
  /** Shrink the text until it fits this width (pt); never below 60% of `size`. */
  maxWidth?: number;
  /** Extra space between letters, in pt, as the designs' spaced labels have. */
  charSpace?: number;
}

/** Writes one line at a measured spot; shrinks long values to the room the design left them. */
function put(doc: jsPDF, text: string, spec: TextSpec) {
  const value = (text ?? "").toString().trim();
  if (!value) return;
  doc.setFont(fontOn(doc, spec.font), "normal");
  doc.setTextColor(...rgb(spec.color || INK));
  let size = spec.size;
  doc.setFontSize(size);
  if (spec.maxWidth) {
    const floor = spec.size * 0.6;
    const spacing = pt(spec.charSpace || 0) * Math.max(0, value.length - 1);
    while (size > floor && doc.getTextWidth(value) + spacing > pt(spec.maxWidth)) {
      size -= 0.25;
      doc.setFontSize(size);
    }
  }
  if (spec.charSpace && spec.align && spec.align !== "left") {
    // jsPDF centres on the unspaced width, so a spaced label would drift right: place it ourselves.
    const spacing = pt(spec.charSpace) * Math.max(0, value.length - 1);
    const width = doc.getTextWidth(value) + spacing;
    const left = spec.align === "center" ? pt(spec.x) - width / 2 : pt(spec.x) - width;
    doc.text(value, left, pt(spec.y), { charSpace: pt(spec.charSpace) });
    return;
  }
  doc.text(value, pt(spec.x), pt(spec.y), { align: spec.align || "left", charSpace: spec.charSpace ? pt(spec.charSpace) : undefined });
}

/** A picture into a box; false when jsPDF cannot read it, so the caller can leave the frame. */
function picture(doc: jsPDF, src: string | null | undefined, x: number, y: number, w: number, h: number): boolean {
  if (!src || !/^data:image\//.test(src)) return false;
  try {
    doc.addImage(src, pt(x), pt(y), pt(w), pt(h));
    return true;
  } catch {
    return false;
  }
}

/** The whole page is the designer's artwork; everything else is laid on top of it. */
async function background(doc: jsPDF, file: string, widthPt: number, heightPt: number, x = 0, y = 0) {
  const art = await documentArtwork(file);
  if (!art) return;
  const format = file.endsWith(".png") ? "PNG" : "JPEG";
  try {
    doc.addImage(art, format, pt(x), pt(y), pt(widthPt), pt(heightPt), undefined, "FAST");
  } catch {
    /* an artwork jsPDF cannot decode leaves a plain page; the data still prints */
  }
}

async function qr(text: string, sizePx = 420): Promise<string> {
  return QRCode.toDataURL(text, { margin: 0, width: sizePx, errorCorrectionLevel: "M", color: { dark: "#14266b", light: "#ffffff" } });
}

const origin = () => (typeof window !== "undefined" && window.location ? window.location.origin : "https://www.careeropticscomputer.in");

/** The verification page for a record, as the QR codes point to it. */
export const verifyUrl = (no: string, section: "certificate" | "result" | "admit") =>
  `${origin()}/verification.html?no=${encodeURIComponent(no)}#${section}`;

/** DD-MM-YYYY, as every design prints a date; a string that is not a date is shown as it is. */
export function ddmmyyyy(value: string | Date | null | undefined): string {
  if (!value) return "";
  if (typeof value === "string" && /^\d{2}-\d{2}-\d{4}$/.test(value)) return value;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}-${mm}-${d.getFullYear()}`;
}

const fullName = (s: { firstName: string; lastName: string }) => [s.firstName, s.lastName].filter(Boolean).join(" ").trim();

const save = (doc: jsPDF, name: string) => doc.save(name.replace(/[^a-z0-9._-]+/gi, "-"));

/* ------------------------------------------------------------------ */
/* Statement of marks (A4 portrait, 595 x 842 pt)                       */
/* ------------------------------------------------------------------ */

const MS = { w: 595, h: 842 };

/** The marks table: column edges and the rows the design drew. */
const MS_TABLE = {
  cols: [45.8, 91.5, 336.8, 407.2, 478.5, 549.0],
  bodyTop: 391.0,
  bodyBottom: 521.0,
  rowPitch: 18.75,
  designRows: 7,
  totalBaseline: 537.7,
};

export type MarksheetExtra = { marksheet_no?: string; serial_no?: string; term?: string; session?: string };

/**
 * One statement of marks on the designer's sheet. Up to seven subjects sit in
 * the rows the design drew; more are fitted in by tightening the rows, with
 * the table body repainted so the design's seven-row shading does not show
 * through.
 */
export async function drawBrandMarksheet(doc: jsPDF, s: StudentDocument, extra: MarksheetExtra = {}) {
  await registerBrandFonts(doc, ["Poppins-Medium", "Poppins-SemiBold", "Poppins-Bold", "Poppins-ExtraBold"]);
  await background(doc, "marksheet.jpg", MS.w, MS.h);

  const name = fullName(s) || "-";
  const regd = s.enrollmentNo || s.applicationNo || "";
  const serial = extra.serial_no || s.rollNo || "";
  const summary = marksheetSummary(s.examResults);
  const rows = rowsWithMinimum(s.examResults);
  const percentage = summary.max ? (summary.total / summary.max) * 100 : 0;
  const grade = summary.max ? marksheetGrade(percentage, summary.result === "Pass") : "";

  // Numbers across the top
  put(doc, extra.marksheet_no || "", { x: 83.0, y: 210.6, size: 8.5, font: "Poppins-SemiBold", maxWidth: 150 });
  put(doc, serial, { x: 429.3, y: 210.6, size: 8.5, font: "Poppins-SemiBold", maxWidth: 70 });

  // Photograph, inside the frame the design drew
  picture(doc, s.photo, 477.6, 157.4, 70.8, 85.0);

  // Particulars: the values sit on the dotted lines after each label
  const V = (text: string, x: number, y: number, maxWidth: number, color = INK) =>
    put(doc, text, { x, y, size: 9.6, font: "Poppins-SemiBold", color, maxWidth });
  V(regd, 182.8, 233.9, 360);
  V(name.toUpperCase(), 182.8, 252.7, 360);
  V((s.fatherName || "").toUpperCase(), 177.0, 271.4, 365);
  V((s.course?.name || "").toUpperCase(), 182.8, 290.9, 360);
  V((s.course?.duration || "").toUpperCase(), 182.8, 309.7, 120);
  V(ddmmyyyy(s.dateOfBirth), 410.2, 309.7, 130);
  V(extra.session || s.session || "", 182.8, 328.4, 120);
  V(ddmmyyyy(s.admissionDate), 434.0, 328.4, 110);
  V(`${s.branch.name || s.branch.organization.name}`.toUpperCase(), 182.8, 347.9, 360, RED);

  // The marks table
  const [c0, c1, c2, c3, c4, c5] = MS_TABLE.cols;
  const bodyHeight = MS_TABLE.bodyBottom - MS_TABLE.bodyTop;
  const n = rows.length;
  let pitch = MS_TABLE.rowPitch;
  let fontSize = 9.1;
  if (n > MS_TABLE.designRows) {
    pitch = bodyHeight / n;
    fontSize = Math.max(6.2, Math.min(9.1, pitch * 0.5));
    // Repaint the body white and shade alternate rows ourselves, to our pitch.
    doc.setFillColor(255, 255, 255);
    doc.rect(pt(c0 + 0.6), pt(MS_TABLE.bodyTop), pt(c5 - c0 - 1.2), pt(bodyHeight), "F");
    doc.setFillColor(238, 241, 249);
    for (let i = 1; i < n; i += 2) doc.rect(pt(c0 + 0.6), pt(MS_TABLE.bodyTop + i * pitch), pt(c5 - c0 - 1.2), pt(pitch), "F");
    doc.setDrawColor(205, 212, 230);
    doc.setLineWidth(pt(0.4));
    for (const x of [c1, c2, c3, c4]) doc.line(pt(x), pt(MS_TABLE.bodyTop), pt(x), pt(MS_TABLE.bodyBottom));
  }
  rows.forEach((row, i) => {
    const baseline = MS_TABLE.bodyTop + i * pitch + pitch * 0.5 + fontSize * 0.36;
    const cell = (text: string, x: number, align: Align, font: BrandFont = "Poppins-Medium", color = INK, maxWidth?: number) =>
      put(doc, text, { x, y: baseline, size: fontSize, font, color, align, maxWidth });
    cell(String(i + 1), (c0 + c1) / 2, "center");
    cell(row.subject, c1 + 12, "left", "Poppins-Medium", INK, c2 - c1 - 18);
    cell(String(row.max), (c2 + c3) / 2, "center");
    cell(String(row.pass), (c3 + c4) / 2, "center");
    cell(String(row.obtained), (c4 + c5) / 2, "center", "Poppins-Bold", NAVY);
  });
  // Grand total figures, in the design's own total row
  put(doc, summary.max ? String(summary.max) : "", { x: (c2 + c3) / 2, y: MS_TABLE.totalBaseline, size: 9.6, font: "Poppins-Bold", color: NAVY, align: "center" });
  put(doc, summary.max ? String(summary.total) : "", { x: (c4 + c5) / 2, y: MS_TABLE.totalBaseline, size: 9.6, font: "Poppins-Bold", color: NAVY, align: "center" });

  // The four result boxes
  const figure = (text: string, cx: number, color: string) =>
    put(doc, text, { x: cx, y: 593.5, size: 14.2, font: "Poppins-ExtraBold", color, align: "center", maxWidth: 110 });
  if (summary.max) {
    figure(`${summary.total} / ${summary.max}`, 105.0, NAVY);
    figure(`${percentage.toFixed(2)}%`, 233.2, ORANGE);
    figure(grade, 361.8, NAVY);
    figure(summary.result.toUpperCase(), 490.1, summary.result === "Pass" ? GREEN : RED);
  } else {
    figure("AWAITED", 490.1, ORANGE);
  }

  // Verification code and the date of issue
  const code = await qr(verifyUrl(regd || name, "result"));
  picture(doc, code, 48.5, 614.5, 60.0, 60.0);
  put(doc, ddmmyyyy(s.issueDate), { x: 280.6, y: 678.7, size: 9.4, font: "Poppins-SemiBold", align: "center" });
}

export async function brandMarksheetPdf(s: StudentDocument, extra: MarksheetExtra = {}) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  await drawBrandMarksheet(doc, s, extra);
  save(doc, `marksheet-${s.enrollmentNo || s.applicationNo || fullName(s) || "-"}.pdf`);
}

export async function brandMarksheetsPdf(items: Array<{ student: StudentDocument; extra?: MarksheetExtra }>, fileName = "marksheets") {
  if (!items.length) return;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  for (const [i, item] of items.entries()) {
    if (i) doc.addPage();
    await drawBrandMarksheet(doc, item.student, item.extra);
  }
  save(doc, `${fileName}.pdf`);
}

/* ------------------------------------------------------------------ */
/* Identity cards (CR80, 153.1 x 242.9 pt, portrait)                    */
/* ------------------------------------------------------------------ */

const CARD = { w: 153.12, h: 242.88 };

export interface StudentCard {
  name: string;
  /** "CO/ST/26/0142" -- the enrolment or application number. */
  studentId: string;
  course?: string;
  session?: string;
  fatherName?: string;
  dob?: string;
  mobile?: string;
  address?: string;
  validTill?: string;
  photo?: string | null;
}

export interface StaffCard {
  name: string;
  /** "CENTER DIRECTOR", "FACULTY" ... printed on the band. */
  role: string;
  idNo: string;
  phone?: string;
  centre: string;
  validTill?: string;
  photo?: string | null;
}

/** Letter-spaced capitals, the way the designs set their bands: "A D C A  ·  S E S S I O N". */
const spaced = (text: string) => text.toUpperCase();

async function drawStudentCardFront(doc: jsPDF, c: StudentCard, x0: number, y0: number) {
  await background(doc, "student-id-front.png", CARD.w, CARD.h, x0, y0);
  const X = (x: number) => x0 + x;
  const Y = (y: number) => y0 + y;
  picture(doc, c.photo, X(55.3), Y(74.4), 42.5, 50.7);
  put(doc, c.name.toUpperCase(), { x: X(76.5), y: Y(138.7), size: 9.6, font: "Poppins-ExtraBold", color: NAVY, align: "center", maxWidth: 128 });
  const band = [c.course, c.session ? `SESSION ${c.session}` : ""].filter(Boolean).join("  ·  ");
  put(doc, spaced(band), { x: X(76.1), y: Y(148.9), size: 4.8, font: "Poppins-SemiBold", color: "#ffffff", align: "center", maxWidth: 110, charSpace: 1.1 });
  const row = (text: string, y: number, color = "#222222") =>
    put(doc, text, { x: X(52.1), y: Y(y), size: 4.9, font: "Poppins-SemiBold", color, maxWidth: 90 });
  row(c.studentId, 158.6, RED);
  row(c.fatherName || "", 166.8);
  row(ddmmyyyy(c.dob), 175.8);
  row(c.mobile || "", 184.8);
  row(fitSegments(doc, c.address || "", "Poppins-SemiBold", 4.9, 90), 193.1);
  put(doc, ddmmyyyy(c.validTill), { x: X(43.1), y: Y(223.8), size: 4.7, font: "Poppins-Bold", color: NAVY });
  const code = await qr(verifyUrl(c.studentId, "result"), 300);
  picture(doc, code, X(12.4), Y(201.4), 24.0, 24.0);
}

async function drawStaffCardFront(doc: jsPDF, c: StaffCard, x0: number, y0: number) {
  await background(doc, "staff-id-front.png", CARD.w, CARD.h, x0, y0);
  const X = (x: number) => x0 + x;
  const Y = (y: number) => y0 + y;
  picture(doc, c.photo, X(53.4), Y(73.6), 46.2, 55.3);
  put(doc, c.name.toUpperCase(), { x: X(76.4), y: Y(144.0), size: 10.5, font: "Poppins-ExtraBold", color: NAVY, align: "center", maxWidth: 128 });
  put(doc, spaced(c.role), { x: X(76.0), y: Y(154.1), size: 5.2, font: "Poppins-SemiBold", color: "#ffffff", align: "center", maxWidth: 100, charSpace: 1.2 });
  put(doc, c.idNo, { x: X(46.8), y: Y(165.4), size: 5.4, font: "Poppins-SemiBold", color: RED, maxWidth: 90 });
  put(doc, c.phone || "", { x: X(46.8), y: Y(175.1), size: 5.4, font: "Poppins-SemiBold", color: "#222222", maxWidth: 90 });
  // The centre's name may take two lines, as the design allows.
  doc.setFont(fontOn(doc, "Poppins-SemiBold"), "normal");
  doc.setFontSize(5.4);
  const lines = (doc.splitTextToSize(c.centre, pt(90)) as string[]).slice(0, 2);
  lines.forEach((line, i) => put(doc, line, { x: X(46.8), y: Y(185.6 + i * 6.8), size: 5.4, font: "Poppins-SemiBold", color: "#222222" }));
  put(doc, ddmmyyyy(c.validTill), { x: X(43.7), y: Y(223.1), size: 4.8, font: "Poppins-Bold", color: NAVY });
  const code = await qr(verifyUrl(c.idNo, "result"), 300);
  picture(doc, code, X(12.2), Y(199.2), 25.0, 25.0);
}

/**
 * Cards laid on A4 sheets, each card's front beside its back, three cards a
 * page -- cut along the card edges and fold or laminate back to back.
 */
async function cardSheet<T>(
  items: T[],
  front: (doc: jsPDF, item: T, x: number, y: number) => Promise<void>,
  backFile: string,
  fileName: string,
) {
  if (!items.length) return { pages: 0, perPage: 3 };
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  await registerBrandFonts(doc, ["Poppins-SemiBold", "Poppins-Bold", "Poppins-ExtraBold"]);
  const perPage = 3;
  const gapX = 6;
  const gapY = 6;
  const cardW = CARD.w;
  const cardH = CARD.h;
  const totalW = cardW * 2 + gapX;
  const left = (MS.w - totalW) / 2;
  const top = (MS.h - (cardH * perPage + gapY * (perPage - 1))) / 2;
  for (const [i, item] of items.entries()) {
    if (i && i % perPage === 0) doc.addPage();
    const row = i % perPage;
    const y = top + row * (cardH + gapY);
    await front(doc, item, left, y);
    await background(doc, backFile, cardW, cardH, left + cardW + gapX, y);
    // Faint cut marks around the pair
    doc.setDrawColor(190);
    doc.setLineWidth(0.15);
    doc.rect(pt(left), pt(y), pt(cardW), pt(cardH));
    doc.rect(pt(left + cardW + gapX), pt(y), pt(cardW), pt(cardH));
  }
  save(doc, fileName);
  return { pages: Math.ceil(items.length / perPage), perPage };
}

export const studentCardsPdf = (cards: StudentCard[], fileName = "student-id-cards.pdf") =>
  cardSheet(cards, drawStudentCardFront, "student-id-back.png", fileName);

export const staffCardsPdf = (cards: StaffCard[], fileName = "staff-id-cards.pdf") =>
  cardSheet(cards, drawStaffCardFront, "staff-id-back.png", fileName);

/* ------------------------------------------------------------------ */
/* Student education verification letter (A4 portrait)                  */
/* ------------------------------------------------------------------ */

export interface VerificationLetter {
  refNo: string;
  date: string | Date;
  /** "The Concerned Verification Officer", "Bihar Secretariat, Government of Bihar." */
  addressee: string[];
  studentName: string;
  /** "Mr." / "Ms." -- how the letter addresses the student. */
  honorific?: string;
  /** "his" / "her" / "their". */
  pronoun?: string;
  institution: string;
  course: string;
  enrollmentNo: string;
  session: string;
  duration: string;
}

type Run = { text: string; bold?: boolean };

/** Writes runs of regular and bold text, wrapping at `maxX`, returning the next baseline. */
function paragraph(doc: jsPDF, runs: Run[], x: number, y: number, maxX: number, size: number, leading: number): number {
  const words: Array<{ w: string; bold: boolean }> = [];
  for (const run of runs) {
    for (const w of run.text.split(/(\s+)/)) if (w) words.push({ w, bold: !!run.bold });
  }
  let cx = x;
  let cy = y;
  for (const { w, bold } of words) {
    const font: BrandFont = bold ? "Poppins-Bold" : "Poppins-Regular";
    doc.setFont(fontOn(doc, font), "normal");
    doc.setFontSize(size);
    const width = doc.getTextWidth(w) / (25.4 / 72); // back to pt
    if (/^\s+$/.test(w)) {
      cx += width;
      continue;
    }
    if (cx + width > maxX && cx > x) {
      cx = x;
      cy += leading;
    }
    put(doc, w, { x: cx, y: cy, size, font, color: "#222222" });
    cx += width;
  }
  return cy + leading;
}

export async function drawVerificationLetter(doc: jsPDF, v: VerificationLetter) {
  await registerBrandFonts(doc, ["Poppins-Regular", "Poppins-Medium", "Poppins-SemiBold", "Poppins-Bold"]);
  await background(doc, "verification-letter.jpg", MS.w, MS.h);

  put(doc, v.refNo, { x: 86.6, y: 219.6, size: 8.8, font: "Poppins-Medium", color: "#222222", maxWidth: 110 });
  put(doc, ddmmyyyy(v.date), { x: 450.7, y: 219.6, size: 8.8, font: "Poppins-Medium", color: "#222222" });

  const left = 45.4;
  const right = 549.9;
  const size = 9.5;
  const leading = 15.0;
  const title = `${v.honorific ? `${v.honorific} ` : ""}${v.studentName}`.trim();
  const his = v.pronoun || "their";

  let y = 275.1;
  put(doc, "To,", { x: left, y, size, font: "Poppins-Regular", color: "#222222" });
  y += leading;
  for (const line of v.addressee) {
    put(doc, line, { x: left, y, size, font: "Poppins-Regular", color: "#222222", maxWidth: 400 });
    y += leading;
  }
  // "Subject:" is on the artwork at baseline 327.6; its text follows it.
  put(doc, `Verification of Educational Record of ${title}`, { x: 88.5, y: 327.6, size, font: "Poppins-SemiBold", color: "#222222", maxWidth: right - 90 });
  y = 350.1;
  put(doc, "Respected Sir/Madam,", { x: left, y, size, font: "Poppins-Regular", color: "#222222" });
  y = 373.4;
  y = paragraph(doc, [{ text: "This is to certify that " }, { text: title, bold: true }, { text: " has been associated with " }, { text: v.institution, bold: true }, { text: " as a student." }], left, y, right, size, leading);
  y += leading * 0.5;
  y = paragraph(doc, [{ text: `As per the institutional records available with us, the student has pursued ${his} studies/training at our institution.` }], left, y, right, size, leading);
  y += leading * 0.5;
  paragraph(doc, [{ text: `The details of ${his} academic record are as follows:` }], left, y, right, size, leading);

  // The table the artwork drew: values in its right column
  const V = (text: string, baseline: number) => put(doc, text, { x: 229.2, y: baseline, size: 9.2, font: "Poppins-Regular", color: "#222222", maxWidth: 300 });
  V(v.studentName, 476.1);
  V(v.institution, 500.1);
  V(v.course, 524.1);
  V(v.enrollmentNo, 548.1);
  V(v.session, 572.1);
  V(v.duration, 596.1);
}

export async function verificationLetterPdf(v: VerificationLetter) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  await drawVerificationLetter(doc, v);
  save(doc, `verification-letter-${v.enrollmentNo || v.studentName}.pdf`);
}
