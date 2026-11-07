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
export const verifyUrl = (no: string, section: "certificate" | "result" | "admit" | "enrollment") =>
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

/* ------------------------------------------------------------------ */
/* Course certificate (A4 landscape, on the designer's sheet)           */
/* ------------------------------------------------------------------ */

/** A4 landscape in pt; the certificate artwork was measured as fractions of the sheet. */
const CERT = { w: 841.9, h: 595.3 };
const cx = (f: number) => f * CERT.w;
const cy = (f: number) => f * CERT.h;

export type CertificateExtra = { certificate_no?: string; serial_no?: string };

/**
 * The course-completion certificate on the designer's landscape sheet: the
 * numbers top-left, the student's particulars on the dotted lines, the grade
 * from the final result, the photograph top-right and the QR bottom-left.
 */
export async function drawBrandCertificate(doc: jsPDF, s: StudentDocument, extra: CertificateExtra = {}) {
  await registerBrandFonts(doc, ["Poppins-SemiBold", "Poppins-Bold"]);
  await background(doc, "certificate.jpg", CERT.w, CERT.h);
  const DARK = "#1a1f4b";
  const name = fullName(s) || "-";
  const regd = s.enrollmentNo || s.applicationNo || "";
  const summary = marksheetSummary(s.examResults);
  const percentage = summary.max ? (summary.total / summary.max) * 100 : 0;
  const grade = summary.max ? marksheetGrade(percentage, summary.result === "Pass") : "";
  const V = (text: string, x: number, y: number, maxWidth: number, size = 12.5, color = DARK) =>
    put(doc, text, { x: cx(x), y: cy(y), size, font: "Poppins-SemiBold", color, maxWidth: cx(maxWidth) });

  V(extra.certificate_no || "", 0.2023, 0.3095, 0.125, 12);
  V(regd, 0.2023, 0.3447, 0.125, 12);
  V(extra.serial_no || s.rollNo || "", 0.2023, 0.3795, 0.125, 12);

  picture(doc, s.photo, cx(0.832), cy(0.288), cx(0.916 - 0.832), cy(0.434 - 0.288));

  V(name.toUpperCase(), 0.4611, 0.4725, 0.45, 13.5);
  V((s.fatherName || "").toUpperCase(), 0.3322, 0.5295, 0.58, 13);
  V((s.course?.name || "").toUpperCase(), 0.403, 0.5815, 0.51, 13);
  V((s.course?.duration || "").toUpperCase(), 0.238, 0.6305, 0.12, 12.5);
  V(grade, 0.5153, 0.6305, 0.1, 12.5);
  V(ddmmyyyy(s.dateOfBirth), 0.73, 0.6305, 0.18, 12.5);
  V((s.branch.name || s.branch.organization.name).toUpperCase(), 0.1596, 0.6875, 0.75, 13, RED);
  V(ddmmyyyy(s.admissionDate), 0.2503, 0.7345, 0.1, 12.5);
  V(ddmmyyyy(s.issueDate), 0.7794, 0.7345, 0.13, 12.5);

  const code = await qr(verifyUrl(extra.certificate_no || regd || name, "certificate"));
  picture(doc, code, cx(0.088), cy(0.788), cx(0.078), cx(0.078));
}

export async function brandCertificatePdf(s: StudentDocument, extra: CertificateExtra = {}) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  await drawBrandCertificate(doc, s, extra);
  save(doc, `certificate-${s.enrollmentNo || s.applicationNo || fullName(s) || "-"}.pdf`);
}

export async function brandCertificatesPdf(items: Array<{ student: StudentDocument; extra?: CertificateExtra }>, fileName = "certificates") {
  if (!items.length) return;
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  for (const [i, item] of items.entries()) {
    if (i) doc.addPage();
    await drawBrandCertificate(doc, item.student, item.extra);
  }
  save(doc, `${fileName}.pdf`);
}

/* ------------------------------------------------------------------ */
/* Franchise partner licence (A4 portrait, on the designer's sheet)     */
/* ------------------------------------------------------------------ */

const LIC = { w: 595.3, h: 841.9 };
const lx = (f: number) => f * LIC.w;
const ly = (f: number) => f * LIC.h;

export interface FranchiseLicence {
  /** "SUCCESS COMPUTER INSTITUTE, UTTAM NAGAR, DELHI" */
  centreName: string;
  address: string;
  directorName: string;
  branchCode: string;
  contact: string;
  issueDate: string | Date;
  /** What the QR opens: the centre's own website, else the verification page. */
  verifyLink: string;
}

export async function drawFranchiseLicence(doc: jsPDF, l: FranchiseLicence) {
  await registerBrandFonts(doc, ["Poppins-SemiBold", "Poppins-Bold", "Poppins-ExtraBold"]);
  await background(doc, "franchise-licence.jpg", LIC.w, LIC.h);
  put(doc, l.centreName.toUpperCase(), { x: lx(0.5), y: ly(0.4306), size: 19, font: "Poppins-ExtraBold", color: RED, align: "center", maxWidth: lx(0.82) });
  put(doc, l.address.toUpperCase(), { x: lx(0.5), y: ly(0.4564), size: 10, font: "Poppins-SemiBold", color: NAVY, align: "center", maxWidth: lx(0.8), charSpace: 0.4 });
  put(doc, l.directorName.toUpperCase(), { x: lx(0.5), y: ly(0.6009), size: 17, font: "Poppins-ExtraBold", color: RED, align: "center", maxWidth: lx(0.6) });
  const box = (text: string, centre: number) => put(doc, text, { x: lx(centre), y: ly(0.6689), size: 16, font: "Poppins-ExtraBold", color: NAVY, align: "center", maxWidth: lx(0.2) });
  box(l.branchCode, 0.236);
  box(l.contact, 0.5);
  box(ddmmyyyy(l.issueDate).replace(/-/g, "/"), 0.7646);
  const code = await qr(l.verifyLink);
  picture(doc, code, lx(0.437), ly(0.7445), lx(0.127), lx(0.127));
}

export async function franchiseLicencePdf(licences: FranchiseLicence[], fileName = "franchise-licence") {
  if (!licences.length) return;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  for (const [i, l] of licences.entries()) {
    if (i) doc.addPage();
    await drawFranchiseLicence(doc, l);
  }
  save(doc, `${fileName}.pdf`);
}

/* ------------------------------------------------------------------ */
/* Admit card (A4 portrait, on the academy's letterhead)                */
/* ------------------------------------------------------------------ */

export interface AdmitCard {
  name: string;
  enrollmentNo: string;
  rollNo: string;
  course: string;
  /** "Term 1 (Semester Examination)" */
  term: string;
  session?: string;
  /** The exam window as words: "12 Dec 2026 to 15 Dec 2026". */
  examWindow: string;
  examCentre?: string;
  schedule: Array<{ subject: string; when: string }>;
  photo?: string | null;
  fatherName?: string;
}

const ADMIT_INSTRUCTIONS = [
  "Carry this admit card and a valid photo ID to every paper. Without both, entry to the examination hall is not allowed.",
  "Reach the examination centre 30 minutes before the reporting time. Latecomers may be refused entry.",
  "Mobile phones, smart watches, calculators and written material are not permitted inside the hall.",
  "Write your roll number exactly as printed here on the answer sheet.",
  "Any unfair means will lead to cancellation of the examination.",
];

export async function drawAdmitCard(doc: jsPDF, a: AdmitCard) {
  await registerBrandFonts(doc, ["Poppins-Regular", "Poppins-Medium", "Poppins-SemiBold", "Poppins-Bold", "Poppins-ExtraBold"]);
  await background(doc, "letterhead.jpg", MS.w, MS.h);
  const left = 45.4;
  const right = 549.9;

  put(doc, "ADMIT CARD", { x: MS.w / 2, y: 236, size: 20, font: "Poppins-ExtraBold", color: NAVY, align: "center", charSpace: 2.5 });
  put(doc, [a.course, a.term, a.session].filter(Boolean).join("  ·  ").toUpperCase(), { x: MS.w / 2, y: 252, size: 8.5, font: "Poppins-SemiBold", color: ORANGE, align: "center", maxWidth: 440, charSpace: 1 });

  // Photograph and the roll number under it
  doc.setDrawColor(...rgb(ORANGE));
  doc.setLineWidth(pt(1.2));
  doc.rect(pt(465), pt(268), pt(78), pt(94));
  if (!picture(doc, a.photo, 466, 269, 76, 92)) put(doc, "Photograph", { x: 504, y: 318, size: 8, font: "Poppins-Regular", color: "#8a8fa5", align: "center" });
  put(doc, "Roll No.", { x: 504, y: 376, size: 8, font: "Poppins-Regular", color: "#4a4f63", align: "center" });
  put(doc, a.rollNo, { x: 504, y: 392, size: 14, font: "Poppins-ExtraBold", color: RED, align: "center", maxWidth: 90 });

  // Particulars
  const rows: Array<[string, string]> = [
    ["Candidate's Name", a.name.toUpperCase()],
    ["Father's / Husband's Name", (a.fatherName || "").toUpperCase()],
    ["Enrolment No.", a.enrollmentNo],
    ["Course", a.course],
    ["Examination", a.term],
    ["Exam Dates", a.examWindow],
    ["Exam Centre", a.examCentre || ""],
  ].filter(([, v]) => v) as Array<[string, string]>;
  let y = 285;
  for (const [label, value] of rows) {
    put(doc, label, { x: left, y, size: 9.5, font: "Poppins-SemiBold", color: NAVY });
    put(doc, ":", { x: left + 150, y, size: 9.5, font: "Poppins-SemiBold", color: NAVY });
    put(doc, value, { x: left + 158, y, size: 9.5, font: "Poppins-Medium", color: "#1a1a1a", maxWidth: 255 });
    doc.setDrawColor(205, 212, 230);
    doc.setLineWidth(pt(0.5));
    doc.setLineDashPattern([pt(1), pt(1.5)], 0);
    doc.line(pt(left), pt(y + 5), pt(left + 400), pt(y + 5));
    doc.setLineDashPattern([], 0);
    y += 19;
  }

  // The schedule, one paper a row
  y = Math.max(y + 14, 412);
  const cols = [left, left + 40, left + 300, right];
  doc.setFillColor(...rgb("#1f3a99"));
  doc.rect(pt(cols[0]), pt(y), pt(right - left), pt(20), "F");
  put(doc, "S. NO.", { x: (cols[0] + cols[1]) / 2, y: y + 13.5, size: 8, font: "Poppins-SemiBold", color: "#ffffff", align: "center" });
  put(doc, "PAPER / SUBJECT", { x: cols[1] + 10, y: y + 13.5, size: 8, font: "Poppins-SemiBold", color: "#ffffff", charSpace: 0.6 });
  put(doc, "DATE & TIME", { x: (cols[2] + cols[3]) / 2, y: y + 13.5, size: 8, font: "Poppins-SemiBold", color: "#ffffff", align: "center", charSpace: 0.6 });
  y += 20;
  const slots = a.schedule.length ? a.schedule : [{ subject: "Schedule to be announced", when: "" }];
  slots.slice(0, 14).forEach((slot, i) => {
    if (i % 2) {
      doc.setFillColor(238, 241, 249);
      doc.rect(pt(cols[0]), pt(y), pt(right - left), pt(18), "F");
    }
    put(doc, String(i + 1), { x: (cols[0] + cols[1]) / 2, y: y + 12.5, size: 9, font: "Poppins-Medium", color: "#1a1a1a", align: "center" });
    put(doc, slot.subject, { x: cols[1] + 10, y: y + 12.5, size: 9, font: "Poppins-Medium", color: "#1a1a1a", maxWidth: 245 });
    put(doc, slot.when, { x: (cols[2] + cols[3]) / 2, y: y + 12.5, size: 9, font: "Poppins-SemiBold", color: NAVY, align: "center", maxWidth: 190 });
    y += 18;
  });
  doc.setDrawColor(...rgb("#1f3a99"));
  doc.setLineWidth(pt(0.8));
  doc.line(pt(left), pt(y), pt(right), pt(y));

  // Instructions
  y += 22;
  put(doc, "INSTRUCTIONS TO THE CANDIDATE", { x: left, y, size: 8.5, font: "Poppins-Bold", color: ORANGE, charSpace: 1 });
  y += 14;
  doc.setFont(fontOn(doc, "Poppins-Regular"), "normal");
  doc.setFontSize(8.5);
  for (const line of ADMIT_INSTRUCTIONS) {
    const wrapped = doc.splitTextToSize(line, pt(right - left - 14)) as string[];
    put(doc, "•", { x: left, y, size: 8.5, font: "Poppins-Bold", color: ORANGE });
    wrapped.forEach((w, i) => put(doc, w, { x: left + 12, y: y + i * 11.5, size: 8.5, font: "Poppins-Regular", color: "#333333" }));
    y += wrapped.length * 11.5 + 2;
    if (y > 630) break;
  }

  // The candidate signs bottom-left; the letterhead already carries the authorised signatory bottom-right.
  doc.setDrawColor(...rgb(NAVY));
  doc.setLineWidth(pt(0.6));
  doc.line(pt(left), pt(702), pt(left + 150), pt(702));
  put(doc, "Candidate's Signature", { x: left + 75, y: 712, size: 7.5, font: "Poppins-SemiBold", color: NAVY, align: "center" });
  const code = await qr(verifyUrl(a.enrollmentNo || a.rollNo, "admit"), 300);
  picture(doc, code, 250, 650, 56, 56);
  put(doc, "Scan to verify", { x: 278, y: 715, size: 7, font: "Poppins-SemiBold", color: NAVY, align: "center" });
}

export async function brandAdmitCardsPdf(cards: AdmitCard[], fileName = "admit-cards") {
  if (!cards.length) return;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  for (const [i, card] of cards.entries()) {
    if (i) doc.addPage();
    await drawAdmitCard(doc, card);
  }
  save(doc, `${fileName}.pdf`);
}

/* ------------------------------------------------------------------ */
/* Computer typing certificate (A4 portrait, on the letterhead)         */
/* ------------------------------------------------------------------ */

export interface TypingCertificate {
  certificateNo: string;
  /** The printed serial number, under the registration number. */
  serialNo?: string;
  name: string;
  fatherName?: string;
  registrationNo: string;
  course: string;
  duration: string;
  centre: string;
  centreCode?: string;
  issueDate: string | Date;
  /** Words per minute in each language; a language left blank is not printed. */
  englishWpm?: number | string;
  hindiWpm?: number | string;
  accuracy?: number | string;
  photo?: string | null;
}

/**
 * The computer typing certificate, on the certificate artwork the licence
 * uses (typing-certificate.jpg: the same design with the licence's wording
 * lifted). The student's name sits where the centre name goes, the three
 * boxes carry the typing speeds, and the QR opens the verification page.
 */
export async function drawTypingCertificate(doc: jsPDF, t: TypingCertificate) {
  await registerBrandFonts(doc, ["Poppins-Regular", "Poppins-Medium", "Poppins-SemiBold", "Poppins-Bold", "Poppins-ExtraBold", "GreatVibes-Regular"]);
  await background(doc, "typing-certificate.jpg", LIC.w, LIC.h);

  put(doc, "of Computer Typing Course", { x: lx(0.5), y: ly(0.357), size: 27, font: "GreatVibes-Regular", color: NAVY, align: "center" });
  // Registration number at the left, certificate number above the photograph at the right
  put(doc, `Reg. No. : ${t.registrationNo}`, { x: lx(0.11), y: ly(0.378), size: 8.5, font: "Poppins-Bold", color: NAVY, charSpace: 0.3 });
  if (t.serialNo) put(doc, `Sl. No. : ${t.serialNo}`, { x: lx(0.11), y: ly(0.393), size: 8, font: "Poppins-SemiBold", color: NAVY, charSpace: 0.3 });
  put(doc, `Certificate No. : ${t.certificateNo}`, { x: lx(0.91), y: ly(0.378), size: 8, font: "Poppins-SemiBold", color: RED, align: "right", charSpace: 0.3 });

  // Photograph, right of the name
  doc.setDrawColor(...rgb(ORANGE));
  doc.setLineWidth(pt(1.2));
  doc.rect(pt(lx(0.81)), pt(ly(0.386)), pt(lx(0.1)), pt(ly(0.085)));
  if (!picture(doc, t.photo, lx(0.81) + 1, ly(0.386) + 1, lx(0.1) - 2, ly(0.085) - 2)) put(doc, "Photo", { x: lx(0.86), y: ly(0.432), size: 7.5, font: "Poppins-Regular", color: "#8a8fa5", align: "center" });

  put(doc, t.name.toUpperCase(), { x: lx(0.5), y: ly(0.4306), size: 19, font: "Poppins-ExtraBold", color: RED, align: "center", maxWidth: lx(0.58) });
  if (t.fatherName) put(doc, `Son / Daughter of  ${t.fatherName.toUpperCase()}`, { x: lx(0.5), y: ly(0.4564), size: 10.5, font: "Poppins-SemiBold", color: NAVY, align: "center", maxWidth: lx(0.6), charSpace: 0.3 });

  // The statement, centred over three lines where the licence's wording was
  const statement = `has successfully completed the ${t.course} course${t.duration ? ` of ${t.duration}` : ""} at the study centre named below and has attained the computer typing speed recorded in the assessment conducted by the Academy.`;
  doc.setFont(fontOn(doc, "Poppins-Medium"), "normal");
  doc.setFontSize(10.5);
  const lines = doc.splitTextToSize(statement, pt(lx(0.74))) as string[];
  lines.slice(0, 3).forEach((line, k) => put(doc, line, { x: lx(0.5), y: ly(0.4875) + k * 15, size: 10.5, font: "Poppins-Medium", color: "#1f2340", align: "center" }));

  // The centre, highlighted: name in red, code beside it
  put(doc, "STUDY CENTRE", { x: lx(0.5), y: ly(0.552), size: 7.5, font: "Poppins-SemiBold", color: ORANGE, align: "center", charSpace: 1.6 });
  put(doc, t.centre.toUpperCase(), { x: lx(0.5), y: ly(0.571), size: 13, font: "Poppins-ExtraBold", color: RED, align: "center", maxWidth: lx(0.8) });
  if (t.centreCode) put(doc, `CENTRE CODE : ${t.centreCode}`, { x: lx(0.5), y: ly(0.587), size: 9, font: "Poppins-Bold", color: NAVY, align: "center", charSpace: 0.6 });

  put(doc, "TYPING PERFORMANCE", { x: lx(0.5), y: ly(0.618), size: 13, font: "Poppins-ExtraBold", color: NAVY, align: "center", charSpace: 3 });

  // The three boxes: label on the band row, value below
  const cell = (label: string, value: string, centre: number) => {
    put(doc, label, { x: lx(centre), y: ly(0.6415), size: 7.5, font: "Poppins-SemiBold", color: ORANGE, align: "center", charSpace: 1.6 });
    put(doc, value, { x: lx(centre), y: ly(0.6689), size: 16, font: "Poppins-ExtraBold", color: NAVY, align: "center", maxWidth: lx(0.2) });
  };
  const wpm = (v: number | string | undefined) => (v === undefined || v === "" ? "—" : `${v} WPM`);
  cell("ENGLISH TYPING SPEED", wpm(t.englishWpm), 0.236);
  cell("HINDI TYPING SPEED", wpm(t.hindiWpm), 0.5);
  cell("DATE OF ISSUE", ddmmyyyy(t.issueDate).replace(/-/g, "/"), 0.7646);
  if (t.accuracy !== undefined && t.accuracy !== "") {
    put(doc, `Accuracy : ${`${t.accuracy}`.replace(/%?$/, "%")}`, { x: lx(0.5), y: ly(0.705), size: 10, font: "Poppins-Bold", color: RED, align: "center" });
  }

  const code = await qr(verifyUrl(t.certificateNo, "certificate"));
  picture(doc, code, lx(0.437), ly(0.7445), lx(0.127), lx(0.127));
}

export async function typingCertificatesPdf(items: TypingCertificate[], fileName = "typing-certificate") {
  if (!items.length) return;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  for (const [i, item] of items.entries()) {
    if (i) doc.addPage();
    await drawTypingCertificate(doc, item);
  }
  save(doc, `${fileName}.pdf`);
}

/* ------------------------------------------------------------------ */
/* Enrollment slip (A4 portrait, on the letterhead)                     */
/* ------------------------------------------------------------------ */

export interface EnrollmentSlip {
  enrollmentNo: string;
  centreCode?: string;
  admissionDate: string | Date;
  name: string;
  dateOfBirth?: string;
  fatherName?: string;
  motherName?: string;
  mobile?: string;
  course: string;
  duration?: string;
  session?: string;
  centreName: string;
  centreAddress?: string;
  photo?: string | null;
}

/** A5 landscape, as the slip is handed over and filed: 210 × 148 mm. */
const SLIP = { w: 595.3, h: 419.5 };

/**
 * The enrollment slip: the academy's confirmation of a student's enrolment,
 * handed over at admission. A half-page slip on its own artwork
 * (enrollment-slip.jpg: the letterhead's header, watermark, seal, signatory,
 * logos and footer, composed for A5 landscape), with a bordered table of
 * the particulars, the course and the centre, and a QR that opens the
 * enrolment check.
 */
export async function drawEnrollmentSlip(doc: jsPDF, e: EnrollmentSlip) {
  await registerBrandFonts(doc, ["Poppins-Regular", "Poppins-Medium", "Poppins-SemiBold", "Poppins-Bold", "Poppins-ExtraBold", "GreatVibes-Regular"]);
  await background(doc, "enrollment-slip.jpg", SLIP.w, SLIP.h);
  const left = 24;
  const right = SLIP.w - 24;
  const W = right - left;
  const line = (x1: number, y1: number, x2: number, y2: number) => doc.line(pt(x1), pt(y1), pt(x2), pt(y2));

  // Header: logo, name, registrations; photograph at the right
  const logo = await documentArtwork("../career-optics-logo.png");
  if (logo) picture(doc, logo, left + 2, 14, 62, 62);
  put(doc, "CAREER OPTICS", { x: SLIP.w / 2, y: 34, size: 22, font: "Poppins-ExtraBold", color: NAVY, align: "center", charSpace: 1 });
  doc.setFillColor(...rgb(ORANGE));
  doc.roundedRect(pt(SLIP.w / 2 - 95), pt(39), pt(190), pt(13), pt(2), pt(2), "F");
  put(doc, "COMPUTER ACADEMY", { x: SLIP.w / 2, y: 48.5, size: 8.5, font: "Poppins-Bold", color: "#ffffff", align: "center", charSpace: 2.2 });
  put(doc, "Learn · Grow · Succeed", { x: SLIP.w / 2, y: 64, size: 13, font: "GreatVibes-Regular", color: GREEN, align: "center" });
  put(doc, "Run under: Career Optics Education Service Private Limited", { x: SLIP.w / 2, y: 74, size: 6.3, font: "Poppins-SemiBold", color: "#1a1a1a", align: "center" });
  put(doc, "Incorporated under the Companies Act, 2013 (Ministry of Corporate Affairs, Govt. of India)  |  CIN: U85500BR2026PTC085770", { x: SLIP.w / 2, y: 82, size: 5.8, font: "Poppins-Regular", color: "#1a1a1a", align: "center" });
  put(doc, "An ISO 9001:2015 Certified Institute  |  MSME Registered  |  DPIIT Recognised Startup", { x: SLIP.w / 2, y: 90, size: 5.8, font: "Poppins-SemiBold", color: RED, align: "center" });
  doc.setDrawColor(...rgb(ORANGE));
  doc.setLineWidth(pt(1));
  doc.rect(pt(right - 66), pt(14), pt(66), pt(80));
  if (!picture(doc, e.photo, right - 65, 15, 64, 78)) put(doc, "Photograph", { x: right - 33, y: 56, size: 6.5, font: "Poppins-Regular", color: "#8a8fa5", align: "center" });

  // Title pill
  doc.setFillColor(...rgb(NAVY));
  doc.roundedRect(pt(SLIP.w / 2 - 72), pt(97), pt(144), pt(14), pt(3), pt(3), "F");
  put(doc, "ENROLLMENT SLIP", { x: SLIP.w / 2, y: 107, size: 9.5, font: "Poppins-ExtraBold", color: "#ffffff", align: "center", charSpace: 1.8 });

  // Row of three: enrolment number, centre code, date of admission
  doc.setDrawColor(...rgb(NAVY));
  doc.setLineWidth(pt(0.7));
  let y = 114;
  const cw = W / 3;
  doc.setFillColor(232, 236, 246);
  doc.rect(pt(left), pt(y), pt(W), pt(11), "F");
  ["Enrollment No.", "Institute / Centre Code", "Date of Admission"].forEach((h, k) => put(doc, h, { x: left + cw * k + cw / 2, y: y + 8.2, size: 7, font: "Poppins-Bold", color: NAVY, align: "center" }));
  [e.enrollmentNo, e.centreCode || "—", ddmmyyyy(e.admissionDate).replace(/-/g, "/")].forEach((v, k) => put(doc, v, { x: left + cw * k + cw / 2, y: y + 20.5, size: 8.8, font: "Poppins-Bold", color: "#1a1a1a", align: "center", maxWidth: cw - 8 }));
  doc.rect(pt(left), pt(y), pt(W), pt(24));
  line(left + cw, y, left + cw, y + 24);
  line(left + 2 * cw, y, left + 2 * cw, y + 24);
  y += 24;

  // Particulars
  const rows: Array<[string, string]> = [
    ["Name of Student", e.name.toUpperCase()],
    ["Date of Birth", e.dateOfBirth ? ddmmyyyy(e.dateOfBirth).replace(/-/g, "/") : ""],
    ["Father's Name", (e.fatherName || "").toUpperCase()],
    ["Mother's Name", (e.motherName || "").toUpperCase()],
    ["Mobile / Session", [e.mobile, e.session].filter(Boolean).join("   ·   ")],
  ];
  const blockH = 60;
  doc.rect(pt(left), pt(y), pt(W), pt(blockH));
  doc.setDrawColor(...rgb(NAVY));
  doc.setLineWidth(pt(0.7));
  let ry = y + 12;
  for (const [label, value] of rows) {
    put(doc, label, { x: left + 8, y: ry, size: 7.6, font: "Poppins-Bold", color: NAVY });
    put(doc, ":", { x: left + 84, y: ry, size: 7.6, font: "Poppins-Bold", color: NAVY });
    put(doc, value || "—", { x: left + 90, y: ry, size: 8, font: "Poppins-SemiBold", color: "#1a1a1a", maxWidth: W - 98 });
    ry += 11.6;
  }
  y += blockH;

  // Course
  doc.setFillColor(232, 236, 246);
  doc.rect(pt(left), pt(y), pt(W), pt(10), "F");
  doc.rect(pt(left), pt(y), pt(W), pt(10));
  put(doc, "COURSE", { x: SLIP.w / 2, y: y + 7.5, size: 7.2, font: "Poppins-Bold", color: NAVY, align: "center", charSpace: 0.8 });
  y += 10;
  doc.rect(pt(left), pt(y), pt(W), pt(19));
  put(doc, e.course.toUpperCase(), { x: SLIP.w / 2, y: y + 9, size: 8.8, font: "Poppins-Bold", color: "#1a1a1a", align: "center", maxWidth: W - 16 });
  put(doc, [e.duration ? `Duration : ${e.duration}` : "", e.session ? `Session : ${e.session}` : ""].filter(Boolean).join("     ·     "), { x: SLIP.w / 2, y: y + 16.5, size: 6.4, font: "Poppins-Medium", color: "#4a4f63", align: "center" });
  y += 19;

  // Centre
  const addr = e.centreAddress ? (doc.splitTextToSize(e.centreAddress, pt(W - 118)) as string[]).slice(0, 1) : [];
  const ch = 14 + addr.length * 9 + 1;
  doc.rect(pt(left), pt(y), pt(W), pt(ch));
  line(left + 104, y, left + 104, y + ch);
  put(doc, "Name of Institute / Centre", { x: left + 8, y: y + ch / 2 + 2.5, size: 7.2, font: "Poppins-Bold", color: NAVY, maxWidth: 92 });
  put(doc, e.centreName.toUpperCase(), { x: left + 112, y: y + 10, size: 8.4, font: "Poppins-Bold", color: RED, maxWidth: W - 120 });
  addr.forEach((l, k) => put(doc, l, { x: left + 112, y: y + 19 + k * 9, size: 6.8, font: "Poppins-Medium", color: "#333333" }));
  y += ch;

  // The artwork carries the seal (left) and the signatory (right); the QR sits between them
  const code = await qr(verifyUrl(e.enrollmentNo, "enrollment"), 240);
  picture(doc, code, SLIP.w / 2 - 18, 262, 36, 36);
  put(doc, "Scan to verify", { x: SLIP.w / 2, y: 305, size: 5.8, font: "Poppins-SemiBold", color: NAVY, align: "center" });
}

export async function enrollmentSlipsPdf(slips: EnrollmentSlip[], fileName = "enrollment-slip") {
  if (!slips.length) return;
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a5" });
  for (const [i, slip] of slips.entries()) {
    if (i) doc.addPage();
    await drawEnrollmentSlip(doc, slip);
  }
  save(doc, `${fileName}.pdf`);
}

/* ------------------------------------------------------------------ */
/* Admission form (A4 portrait, blank, for the centre to print)         */
/* ------------------------------------------------------------------ */

export interface AdmissionFormCentre {
  centreName: string;
  centreCode?: string;
  address?: string;
  phone?: string;
  /** The centre's own logo, shown beside the academy's. */
  logo?: string | null;
}

/**
 * The blank admission form a centre prints and the student fills by hand:
 * the academy's header with the centre named beneath it, character boxes
 * for the names and address, tick boxes for gender and category, the last
 * qualification, a declaration and signatures, then the office's
 * acknowledgement slip below a cut line. On admission-form.jpg, which
 * carries the watermark, the recognition logos and the footer.
 */
export async function drawAdmissionForm(doc: jsPDF, c: AdmissionFormCentre) {
  await registerBrandFonts(doc, ["Poppins-Regular", "Poppins-Medium", "Poppins-SemiBold", "Poppins-Bold", "Poppins-ExtraBold", "GreatVibes-Regular"]);
  await background(doc, "admission-form.jpg", MS.w, MS.h);

  // A double frame around the page, above the footer band: navy outside, orange inside
  const frameBottom = MS.h - 22;
  doc.setDrawColor(...rgb(NAVY));
  doc.setLineWidth(pt(2.4));
  doc.rect(pt(12), pt(12), pt(MS.w - 24), pt(frameBottom - 12));
  doc.setDrawColor(...rgb(ORANGE));
  doc.setLineWidth(pt(0.9));
  doc.rect(pt(17), pt(17), pt(MS.w - 34), pt(frameBottom - 22));
  // Corner marks, as printed forms carry
  doc.setDrawColor(...rgb(NAVY));
  doc.setLineWidth(pt(1.4));
  const corner = (x: number, y: number, dx: number, dy: number) => {
    doc.line(pt(x), pt(y), pt(x + dx * 14), pt(y));
    doc.line(pt(x), pt(y), pt(x), pt(y + dy * 14));
  };
  corner(22, 22, 1, 1);
  corner(MS.w - 22, 22, -1, 1);
  corner(22, frameBottom - 10, 1, -1);
  corner(MS.w - 22, frameBottom - 10, -1, -1);

  const left = 36;
  const right = MS.w - 36;
  const W = right - left;
  const cx = MS.w / 2;
  const line = (x1: number, y1: number, x2: number, y2: number) => doc.line(pt(x1), pt(y1), pt(x2), pt(y2));
  const rect = (x: number, y: number, w: number, h: number, style?: "F" | "FD") => doc.rect(pt(x), pt(y), pt(w), pt(h), style);

  // Header: the academy, then the centre
  const logo = await documentArtwork("../career-optics-logo.png");
  if (logo) picture(doc, logo, left, 22, 70, 70);
  put(doc, "CAREER OPTICS", { x: cx, y: 44, size: 25, font: "Poppins-ExtraBold", color: NAVY, align: "center", charSpace: 1 });
  doc.setFillColor(...rgb(ORANGE));
  doc.roundedRect(pt(cx - 100), pt(50), pt(200), pt(14), pt(2), pt(2), "F");
  put(doc, "COMPUTER ACADEMY", { x: cx, y: 60, size: 9, font: "Poppins-Bold", color: "#ffffff", align: "center", charSpace: 2.4 });
  put(doc, "Learn · Grow · Succeed", { x: cx, y: 77, size: 14, font: "GreatVibes-Regular", color: GREEN, align: "center" });
  // The company lines, as every certificate carries them
  const run = "Run under: ";
  const company = "Career Optics Education Service Private Limited";
  const runW = measure(doc, run, "Poppins-Bold", 7) + measure(doc, company, "Poppins-Regular", 7);
  put(doc, run, { x: cx - runW / 2, y: 86, size: 7, font: "Poppins-Bold", color: "#1a1a1a" });
  put(doc, company, { x: cx - runW / 2 + measure(doc, run, "Poppins-Bold", 7), y: 86, size: 7, font: "Poppins-Regular", color: "#1a1a1a" });
  put(doc, "Incorporated under the Companies Act, 2013 (Ministry of Corporate Affairs, Govt. of India)  |  CIN: U85500BR2026PTC085770", { x: cx, y: 94, size: 6.5, font: "Poppins-Regular", color: "#1a1a1a", align: "center" });
  put(doc, "An ISO 9001:2015 Certified Institute  |  MSME Registered  |  DPIIT Recognised Startup", { x: cx, y: 102, size: 6.5, font: "Poppins-SemiBold", color: RED, align: "center" });
  if (c.logo) {
    doc.setDrawColor(...rgb(ORANGE));
    doc.setLineWidth(pt(0.8));
    rect(right - 70, 22, 70, 70);
    picture(doc, c.logo, right - 68, 24, 66, 66);
  }
  doc.setDrawColor(...rgb(ORANGE));
  doc.setLineWidth(pt(1.2));
  line(left, 108, right, 108);
  put(doc, c.centreName.toUpperCase(), { x: cx, y: 123, size: 14, font: "Poppins-ExtraBold", color: RED, align: "center", maxWidth: W });
  put(doc, [c.address, c.phone ? `Ph: ${c.phone}` : ""].filter(Boolean).join("   ·   "), { x: cx, y: 135, size: 8.5, font: "Poppins-Medium", color: NAVY, align: "center", maxWidth: W });
  put(doc, `AUTHORISED STUDY CENTRE OF CAREER OPTICS COMPUTER ACADEMY${c.centreCode ? `   ·   CENTRE CODE : ${c.centreCode}` : ""}`, { x: cx, y: 146, size: 7.5, font: "Poppins-Bold", color: ORANGE, align: "center", charSpace: 0.8, maxWidth: W });

  // Title and photograph
  doc.setFillColor(...rgb(NAVY));
  doc.roundedRect(pt(cx - 70), pt(153), pt(140), pt(17), pt(3), pt(3), "F");
  put(doc, "ADMISSION FORM", { x: cx, y: 165, size: 10.5, font: "Poppins-ExtraBold", color: "#ffffff", align: "center", charSpace: 2 });
  doc.setDrawColor(...rgb(NAVY));
  doc.setLineWidth(pt(0.8));
  doc.setLineDashPattern([pt(2), pt(1.5)], 0);
  rect(right - 78, 153, 78, 94);
  doc.setLineDashPattern([], 0);
  ["Paste recent", "passport size", "photograph"].forEach((t, i) => put(doc, t, { x: right - 39, y: 193 + i * 10, size: 7, font: "Poppins-Regular", color: "#8a8fa5", align: "center" }));

  // Top lines: course, centre code / reg. no., date / duration
  const ul = (label: string, x: number, y: number, w: number, value = "") => {
    put(doc, label, { x, y, size: 9, font: "Poppins-SemiBold", color: NAVY });
    const lx0 = x + measure(doc, label, "Poppins-SemiBold", 9) + 4;
    doc.setDrawColor(120, 130, 160);
    doc.setLineWidth(pt(0.5));
    line(lx0, y + 2, x + w, y + 2);
    if (value) put(doc, value, { x: lx0 + 4, y, size: 9, font: "Poppins-Bold", color: "#1a1a1a", maxWidth: x + w - lx0 - 6 });
  };
  const formW = W - 90;
  let y = 185;
  ul("Course Name :", left, y, formW);
  y += 20;
  ul("Centre Code :", left, y, formW / 2 - 6, c.centreCode || "");
  ul("Reg. No. :", left + formW / 2 + 6, y, formW / 2 - 6);
  y += 20;
  ul("Date of Admission :", left, y, formW / 2 - 6);
  ul("Duration :", left + formW / 2 + 6, y, formW / 2 - 6);
  y += 18;

  // Character boxes
  const labelW = 92;
  const boxes = (label: string, rows: number) => {
    const n = 26;
    const bw = (W - labelW) / n;
    const bh = 17;
    put(doc, label, { x: left, y: y + 12, size: 9, font: "Poppins-SemiBold", color: NAVY });
    doc.setDrawColor(...rgb(NAVY));
    doc.setLineWidth(pt(0.5));
    for (let r = 0; r < rows; r++) {
      for (let i = 0; i < n; i++) rect(left + labelW + i * bw, y + r * (bh + 2), bw, bh);
    }
    y += rows * (bh + 2) + 7;
  };
  boxes("Student's Name :", 1);
  boxes("Father's Name :", 1);
  boxes("Mother's Name :", 1);

  // DOB / gender / category / mobile
  const bh = 17;
  put(doc, "Date of Birth :", { x: left, y: y + 11, size: 9, font: "Poppins-SemiBold", color: NAVY });
  doc.setDrawColor(...rgb(NAVY));
  doc.setLineWidth(pt(0.5));
  const dob = ["D", "D", "M", "M", "Y", "Y", "Y", "Y"];
  dob.forEach((ch, i) => {
    rect(left + labelW + i * 16, y, 16, bh);
    put(doc, ch, { x: left + labelW + i * 16 + 8, y: y + 10.5, size: 8, font: "Poppins-Regular", color: "#b4b9c9", align: "center" });
  });
  const tick = (label: string, x: number) => {
    rect(x, y + 2, 11, 11);
    put(doc, label, { x: x + 15, y: y + 11, size: 8.5, font: "Poppins-Medium", color: "#1a1a1a" });
    return x + 15 + measure(doc, label, "Poppins-Medium", 8.5) + 10;
  };
  let tx = left + labelW + 8 * 16 + 14;
  put(doc, "Gender :", { x: tx, y: y + 11, size: 9, font: "Poppins-SemiBold", color: NAVY });
  tx += 42;
  tx = tick("Male", tx);
  tx = tick("Female", tx);
  tick("Other", tx);
  y += bh + 9;
  put(doc, "Category :", { x: left, y: y + 11, size: 9, font: "Poppins-SemiBold", color: NAVY });
  tx = left + labelW;
  for (const cat of ["GEN", "OBC", "SC", "ST", "EWS"]) tx = tick(cat, tx);
  put(doc, "Mobile :", { x: tx + 6, y: y + 11, size: 9, font: "Poppins-SemiBold", color: NAVY });
  const mob0 = tx + 6 + 40;
  for (let i = 0; i < 10; i++) rect(mob0 + i * 14, y, 14, bh);
  y += bh + 10;
  ul("Aadhaar No. :", left, y + 9, W / 2 - 8);
  ul("Email :", left + W / 2 + 8, y + 9, W / 2 - 8);
  y += 24;
  boxes("Address :", 2);
  ul("District :", left + labelW, y + 9, (W - labelW) / 3 - 6);
  ul("State :", left + labelW + (W - labelW) / 3, y + 9, (W - labelW) / 3 - 6);
  ul("PIN :", left + labelW + (2 * (W - labelW)) / 3, y + 9, (W - labelW) / 3);
  y += 24;

  // Last qualification table
  put(doc, "Last Qualification :", { x: left, y: y + 11, size: 9, font: "Poppins-SemiBold", color: NAVY });
  const cols = ["Examination", "Board / University", "Passing Year", "Percentage", "Division / CGPA"];
  const cw = (W - labelW) / cols.length;
  doc.setFillColor(232, 236, 246);
  rect(left + labelW, y, W - labelW, 14, "F");
  cols.forEach((h, i) => {
    rect(left + labelW + i * cw, y, cw, 14);
    put(doc, h, { x: left + labelW + i * cw + cw / 2, y: y + 10, size: 7.5, font: "Poppins-SemiBold", color: NAVY, align: "center" });
    rect(left + labelW + i * cw, y + 14, cw, 18);
    rect(left + labelW + i * cw, y + 32, cw, 18);
  });
  y += 50 + 12;

  // Declaration and signatures
  doc.setDrawColor(...rgb(NAVY));
  rect(left, y + 1, 10, 10);
  put(doc, "I declare that the information given above is true and I agree to abide by the rules and regulations of the Academy and the centre.", { x: left + 15, y: y + 9, size: 8, font: "Poppins-Regular", color: "#1a1a1a", maxWidth: W - 15 });
  y += 34;
  const sig = (label: string, x: number) => {
    doc.setLineWidth(pt(0.6));
    line(x, y, x + 130, y);
    put(doc, label, { x: x + 65, y: y + 9, size: 7.5, font: "Poppins-SemiBold", color: NAVY, align: "center" });
  };
  sig("Signature of Student", left);
  sig("Signature of Parent / Guardian", cx - 65);
  sig("Centre Director (with seal)", right - 130);
  y += 24;

  // Cut line: a bold dashed red rule across the frame, with a scissors mark and "cut here" on both ends
  doc.setDrawColor(...rgb(RED));
  doc.setLineWidth(pt(1.3));
  doc.setLineDashPattern([pt(5), pt(3)], 0);
  line(20, y, MS.w - 20, y);
  doc.setLineDashPattern([], 0);
  const scissors = (x: number) => {
    // two blades and two rings, drawn as lines and circles in the rule's colour
    doc.setLineWidth(pt(1));
    doc.line(pt(x - 5), pt(y - 4), pt(x + 4), pt(y + 2));
    doc.line(pt(x - 5), pt(y + 4), pt(x + 4), pt(y - 2));
    doc.circle(pt(x - 7), pt(y - 4.5), pt(1.8));
    doc.circle(pt(x - 7), pt(y + 4.5), pt(1.8));
  };
  scissors(left + 6);
  scissors(right - 6);
  doc.setFillColor(255, 255, 255);
  doc.rect(pt(cx - 34), pt(y - 5), pt(68), pt(10), "F");
  put(doc, "CUT HERE", { x: cx, y: y + 2.6, size: 7, font: "Poppins-Bold", color: RED, align: "center", charSpace: 1.4 });
  y += 14;
  put(doc, "FOR OFFICE USE ONLY", { x: left, y: y + 2, size: 7.5, font: "Poppins-Bold", color: ORANGE, charSpace: 1 });
  put(doc, "STUDENT'S ACKNOWLEDGEMENT SLIP", { x: cx, y: y + 2, size: 9, font: "Poppins-ExtraBold", color: NAVY, align: "center", charSpace: 1 });
  put(doc, "Date : ____ / ____ / ________", { x: right, y: y + 2, size: 8, font: "Poppins-Medium", color: "#1a1a1a", align: "right" });
  y += 18;
  const half = W / 2 - 8;
  ul("Student's Name :", left, y, half);
  ul("Reg. No. :", left + half + 16, y, half);
  y += 19;
  ul("Centre Name :", left, y, half, c.centreName);
  ul("Centre Code :", left + half + 16, y, half, c.centreCode || "");
  y += 19;
  ul("Course :", left, y, half);
  ul("Duration :", left + half + 16, y, half);
  y += 19;
  const third = W / 3 - 8;
  ul("Admission Fee :", left, y, third);
  ul("Course Fee :", left + third + 12, y, third);
  ul("Exam Fee :", left + 2 * (third + 12), y, third);
  y += 19;
  ul("Total Fee :", left, y, third);
  ul("Discount :", left + third + 12, y, third);
  ul("Amount Paid :", left + 2 * (third + 12), y, third);
  y += 19;
  ul("Receipt No. :", left, y, half);
  doc.setLineWidth(pt(0.6));
  line(right - 150, y + 2, right, y + 2);
  put(doc, "Centre Director Signature & Stamp", { x: right - 75, y: y + 11, size: 7.5, font: "Poppins-SemiBold", color: NAVY, align: "center" });
}

/** Text width in pt, in the brand font (or Helvetica when it is missing). */
function measure(doc: jsPDF, text: string, font: BrandFont, size: number): number {
  doc.setFont(fontOn(doc, font), "normal");
  doc.setFontSize(size);
  return doc.getTextWidth(text) / pt(1);
}

export async function admissionFormPdf(centre: AdmissionFormCentre, fileName = "admission-form") {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  await drawAdmissionForm(doc, centre);
  save(doc, `${fileName}.pdf`);
}

