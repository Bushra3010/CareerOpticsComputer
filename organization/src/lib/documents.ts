import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { instituteName } from "./instituteName";
import { instituteLogo } from "./instituteLogo";
import { brandCertificatePdf, brandCertificatesPdf, brandMarksheetPdf, brandMarksheetsPdf, type CertificateExtra, type MarksheetExtra } from "./brand/brandDocuments";

export type StudentDocument = {
  firstName: string;
  lastName: string;
  enrollmentNo?: string;
  applicationNo?: string;
  admissionDate: string;
  branchId?: string;
  issueDate?: string;
  examinationDate?: string;
  /** The roll number the institute assigns, printed beside the photograph. */
  rollNo?: string;
  fatherName?: string;
  /** "Son of" / "Daughter of" / "Wife of" — how the student is named against
   *  the person below. Blank falls back to the neutral "Father/Guardian". */
  parentage?: string;
  dateOfBirth?: string;
  /** A data URL. Drawn into the marksheet's photograph box when present. */
  photo?: string | null;
  course?: { name: string; code?: string; duration?: string };
  session?: string;
  batch?: { name: string };
  /** The issued certificate's own numbers (certificate_issues), when it has been issued. */
  certificateNo?: string;
  certificateSerial?: string;
  branch: {
    name: string;
    /** The centre's code, printed as the ATC (Authorised Training Centre) code. */
    code?: string;
    phone: string;
    email: string;
    address?: string;
    /** A data URL for the institute's own mark, printed above the title. */
    logo?: string | null;
    /** The centre's own Mohar (stamp), a data URL; printed beside its signature on certificates. */
    seal?: string | null;
    /** The centre director's signature, a data URL. */
    signature?: string | null;
    organization: { name: string };
  };
  /**
   * The authority the marksheet is issued under, and the session it covers.
   *
   * Every line here is data rather than text baked into the generator. A
   * statement of marks names the body that awarded it, and an ERP that printed
   * a fixed board's name would put that claim on every institute's marksheet
   * whether or not it is affiliated to one. Unset lines are simply not printed,
   * and the body falls back to the institute's own name.
   */
  awarding?: {
    body?: string;
    scheme?: string;
    session?: string;
    examMonthYear?: string;
    /** The examination line, e.g. "Year - 1 (Annual Examination)". */
    examination?: string;
    /** Printed under the table, for pass rules and order references. */
    notes?: string[];
    /** Caption under the signature rule. */
    signatory?: string;
  };
  /**
   * The rest of what the admission form collected, for the application form:
   * the student's own particulars, address, guardians and schooling, keyed as
   * the `students` row names them. Absent where a caller has no use for it.
   */
  applicant?: Record<string, string>;
  feeInvoices: Array<{
    invoiceNo: string;
    description: string;
    amount: number;
    payments: Array<{
      receiptNo: string;
      amount: number;
      method: string;
      paidAt: string;
    }>;
  }>;
  examResults: Array<{
    marks: number;
    exam: {
      name: string;
      subject: string;
      maxMarks: number;
      passMarks: number;
      examDate: string;
      /** Which paper of a subject this is, on a term marksheet; absent for a class test. */
      paper?: "Theory" | "Practical";
      /** The subject's own name, without the "(Theory)" a two-paper subject carries. */
      base?: string;
    };
  }>;
};

/**
 * `logo` draws the institute's own mark at the left of the bar and shifts the
 * name clear of it. Left off, the bar is exactly as it was — the marksheet and
 * certificate place their mark themselves, in their own layout.
 */
const header = (doc: jsPDF, title: string, subtitle: string, logo?: string | null) => {
  doc.setFillColor(24, 24, 27);
  doc.rect(0, 0, 210, 38, "F");
  const mark = logo && logo.startsWith("data:image") ? logo : null;
  let x = 16;
  if (mark) {
    try {
      // A white tile behind it: most institute marks are drawn for a light
      // background and disappear into the bar without one.
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(14, 9, 20, 20, 3, 3, "F");
      doc.addImage(mark, 16, 11, 16, 16);
      x = 40;
    } catch {
      x = 16;
    }
  }
  doc.setTextColor(199, 255, 47);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("CAREER OPTICS COMPUTER ACADEMY", x, 17);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text("EDUCATION  |  SOFTWARE  |  SKILL DEVELOPMENT", x, 25);
  doc.setFontSize(13);
  doc.text(title, 194, 17, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(subtitle, 194, 25, { align: "right" });
  doc.setTextColor(24, 24, 27);
};
const line = (doc: jsPDF, label: string, value: string, y: number) => {
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 110);
  doc.text(label.toUpperCase(), 16, y);
  doc.setFontSize(11);
  doc.setTextColor(24, 24, 27);
  doc.text(value || "-", 16, y + 6);
};
const footer = (doc: jsPDF, branch: string) => {
  doc.setDrawColor(220);
  doc.line(16, 279, 194, 279);
  doc.setFontSize(8);
  doc.setTextColor(110);
  doc.text(
    `${branch}  |  Generated by ${instituteName()} ERP  |  Verify with institute records`,
    105,
    286,
    { align: "center" },
  );
};
const save = (doc: jsPDF, name: string) =>
  doc.save(name.replace(/[^a-z0-9._-]+/gi, "-"));

/* ============================
   APPLICATION FORM
   ============================

   The student's admission form as the centre files it: the academy's
   heading and the centre under it, the photograph, the particulars in ruled
   sections, the schooling table, the declaration and three signatures. */

const titleWord = (v: string | undefined) =>
  String(v || "")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

/** Only the last four digits of an Aadhaar number go on paper. */
const maskedAadhar = (v: string | undefined) => {
  const d = String(v || "").replace(/\D/g, "");
  return d.length >= 4 ? `XXXX XXXX ${d.slice(-4)}` : "";
};

const day = (v: string | undefined) => {
  if (!v) return "";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? v : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

/** Builds the form; `admissionPdf` saves it. Kept apart so a test can read the pages. */
export function buildAdmissionPdf(s: StudentDocument): jsPDF {
  const doc = new jsPDF();
  const a = s.applicant || {};
  const W = 210;
  const L = 14;
  const R = W - 14;
  const navy = BRAND_NAVY;

  // Frame: navy outer, gold inner.
  doc.setDrawColor(navy);
  doc.setLineWidth(0.8);
  doc.rect(6, 6, W - 12, 285);
  doc.setDrawColor(BRAND_GOLD);
  doc.setLineWidth(0.3);
  doc.rect(8, 8, W - 16, 281);

  // Heading: logo, the academy, the centre; photograph on the right.
  tryImage(doc, s.branch.logo, L, 13, 24, 24);
  doc.setTextColor(navy);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("CAREER OPTICS COMPUTER ACADEMY", 101, 19, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(70);
  doc.text("A unit of Career Optics Education Service Pvt. Ltd.", 101, 24, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(20);
  doc.text(doc.splitTextToSize(`Study Centre: ${s.branch.name || "-"}`, 128)[0], 101, 30, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(70);
  const contact = [s.branch.code && `ATC Code: ${s.branch.code}`, s.branch.address, s.branch.phone && `Ph: ${s.branch.phone}`, s.branch.email]
    .filter(Boolean)
    .join("  |  ");
  doc.splitTextToSize(contact, 116).slice(0, 3).forEach((t: string, i: number) => doc.text(t, 101, 35 + i * 3.6, { align: "center" }));

  const px = R - 30;
  doc.setDrawColor(120);
  doc.setLineWidth(0.3);
  doc.rect(px, 12, 30, 36);
  if (!tryImage(doc, s.photo, px + 0.5, 12.5, 29, 35)) {
    doc.setFontSize(7);
    doc.setTextColor(140);
    doc.text(["Affix recent", "passport size", "photograph"], px + 15, 27, { align: "center" });
  }

  // Title band.
  let y = 52;
  doc.setFillColor(navy);
  doc.rect(L, y, R - L, 9, "F");
  doc.setTextColor(255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("ADMISSION / APPLICATION FORM", 105, y + 6.2, { align: "center" });
  y += 13;

  // Reference strip: four boxes.
  const refs: Array<[string, string]> = [
    ["Application No.", s.applicationNo || "-"],
    ["Enrollment No.", s.enrollmentNo || "Pending"],
    ["Admission Date", day(s.admissionDate) || "-"],
    ["Session", s.session || "-"],
  ];
  const rw = (R - L) / refs.length;
  refs.forEach(([k, v], i) => {
    const x = L + i * rw;
    doc.setDrawColor(190);
    doc.setFillColor("#f4f6fb");
    doc.rect(x, y, rw, 11, "FD");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.8);
    doc.setTextColor(90);
    doc.text(k.toUpperCase(), x + 2, y + 4);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(20);
    doc.text(doc.splitTextToSize(v, rw - 4)[0], x + 2, y + 9);
  });
  y += 15;

  /** A section: a navy caption, then label/value cells two to a row. */
  const section = (title: string, rows: Array<[string, string] | [string, string, "wide"]>) => {
    doc.setFillColor(BRAND_GOLD);
    doc.rect(L, y, 2.2, 6.5, "F");
    doc.setFillColor("#e8edf7");
    doc.rect(L + 2.2, y, R - L - 2.2, 6.5, "F");
    doc.setTextColor(navy);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(title.toUpperCase(), L + 5, y + 4.6);
    y += 6.5;
    const half = (R - L) / 2;
    const h = 7.2;
    let col = 0;
    for (const row of rows) {
      const wide = row[2] === "wide";
      if (wide && col === 1) {
        y += h;
        col = 0;
      }
      const x = L + col * half;
      const w = wide ? R - L : half;
      doc.setDrawColor(200);
      doc.setLineWidth(0.2);
      doc.rect(x, y, w, h);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(95);
      doc.text(row[0], x + 2, y + 4.7);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.8);
      doc.setTextColor(20);
      const lw = wide ? 34 : 34;
      doc.text(doc.splitTextToSize(row[1] || "-", w - lw - 3)[0], x + lw, y + 4.7);
      if (wide || col === 1) {
        y += h;
        col = 0;
      } else col = 1;
    }
    if (col === 1) y += h;
    y += 3.5;
  };

  section("Course details", [
    ["Course", s.course?.name || "Not assigned", "wide"],
    ["Course code", s.course?.code || "-"],
    ["Duration", s.course?.duration || "-"],
    ["Batch", s.batch?.name || "Not assigned"],
    ["Roll No.", s.rollNo || "-"],
  ]);

  section("Personal details", [
    ["Student's name", `${s.firstName} ${s.lastName}`.trim().toUpperCase(), "wide"],
    [s.parentage ? `${s.parentage}` : "Father's name", s.fatherName || "-"],
    ["Mother's name", a.motherName || "-"],
    ["Date of birth", s.dateOfBirth || "-"],
    ["Gender", titleWord(a.gender) || "-"],
    ["Category", (a.category || "-").toUpperCase()],
    ["Religion", titleWord(a.religion) || "-"],
    ["Nationality", titleWord(a.nationality) || "Indian"],
    ["Blood group", a.bloodGroup || "-"],
    ["Aadhaar No.", maskedAadhar(a.aadharNumber) || "-"],
    ["Mobile", a.phone || "-"],
    ["WhatsApp", a.whatsappNumber || a.phone || "-"],
    ["Email", a.email || "-"],
  ]);

  const address = [a.streetAddress, a.block, a.city, a.district, a.state, a.pincode && `PIN ${a.pincode}`].filter(Boolean).join(", ");
  section("Address & guardian", [
    ["Address", address || "-", "wide"],
    ["Guardian", [a.localGuardianName, a.localGuardianRelation && `(${titleWord(a.localGuardianRelation)})`].filter(Boolean).join(" ") || "-"],
    ["Guardian mobile", a.localGuardianPhone || a.fatherPhone || "-"],
  ]);

  // Schooling: a small table.
  doc.setFillColor(BRAND_GOLD);
  doc.rect(L, y, 2.2, 6.5, "F");
  doc.setFillColor("#e8edf7");
  doc.rect(L + 2.2, y, R - L - 2.2, 6.5, "F");
  doc.setTextColor(navy);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("EDUCATIONAL QUALIFICATION", L + 5, y + 4.6);
  y += 6.5;
  const cols: Array<[string, number]> = [["Examination", 28], ["Board / University", 46], ["School / College", 60], ["Year", 20], ["% / Grade", R - L - 154]];
  const tableRow = (cells: string[], head: boolean) => {
    let x = L;
    cells.forEach((c, i) => {
      const w = cols[i][1];
      if (head) {
        doc.setFillColor(navy);
        doc.rect(x, y, w, 6.5, "F");
        doc.setTextColor(255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.8);
      } else {
        doc.setDrawColor(200);
        doc.rect(x, y, w, 6.5);
        doc.setTextColor(20);
        doc.setFont("helvetica", i === 0 ? "bold" : "normal");
        doc.setFontSize(8.2);
      }
      doc.text(doc.splitTextToSize(c || "-", w - 3)[0], x + 1.6, y + 4.4);
      x += w;
    });
    y += 6.5;
  };
  tableRow(cols.map(([c]) => c), true);
  tableRow(["10th", a.tenthBoard, a.tenthSchoolName, a.tenthYearOfPassing, a.tenthPercentage && `${a.tenthPercentage}`], false);
  tableRow([`12th${a.twelfthStream ? ` (${titleWord(a.twelfthStream)})` : ""}`, a.twelfthBoard, a.twelfthSchoolName, a.twelfthYearOfPassing, a.twelfthPercentage && `${a.twelfthPercentage}`], false);
  y += 5;

  // Declaration.
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(navy);
  doc.text("DECLARATION", L, y);
  y += 4.5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(40);
  const declaration =
    "I hereby declare that the information given above is true and correct to the best of my knowledge. " +
    "I will abide by the rules and regulations of the institute. I understand that the admission may be cancelled " +
    "if any information is found incorrect, and that fees once paid are not refundable.";
  const lines = doc.splitTextToSize(declaration, R - L);
  doc.text(lines, L, y);
  y += lines.length * 3.8 + 4;

  // Signatures, at the foot of the page.
  const sy = Math.max(y + 16, 262);
  const third = (R - L) / 3;
  const sign = (i: number, caption: string) => {
    const x = L + i * third + 6;
    doc.setDrawColor(90);
    doc.setLineWidth(0.3);
    doc.line(x, sy, x + third - 12, sy);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(30);
    doc.text(caption, x + (third - 12) / 2, sy + 4.5, { align: "center" });
  };
  tryImage(doc, s.branch.seal, L + 2 * third + 4, sy - 22, 20, 20);
  tryImage(doc, s.branch.signature, L + 2 * third + 22, sy - 14, 28, 12);
  sign(0, "Signature of Student");
  sign(1, "Signature of Parent / Guardian");
  sign(2, "Centre Director (Seal & Sign)");

  // Office line.
  doc.setDrawColor(220);
  doc.line(L, 278, R, 278);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(110);
  doc.text(`Place: ${a.city || "__________"}     Date: ${day(s.admissionDate) || "__________"}`, L, 283);
  doc.text(`Generated from the ${instituteName()} ERP`, R, 283, { align: "right" });
  doc.setTextColor(20);
  return doc;
}

export function admissionPdf(s: StudentDocument) {
  save(buildAdmissionPdf(s), `application-form-${s.enrollmentNo || s.applicationNo || "student"}.pdf`);
}

/* ============================
   MARKSHEET
   ============================

   A statement of marks, laid out the way an institute's examination body
   prints one: photograph and roll number on the left, the issuing block
   centred, a verification code on the right, the candidate's particulars on
   dotted rules, and the assessment table under them.

   Everything naming an authority is data (see `awarding` on StudentDocument),
   so the generator lays out a marksheet rather than asserting who awarded it. */

/* ---------- the institute's print identity ---------- */

const BRAND_NAVY = "#0b2350";
const BRAND_GOLD = "#c9a227";
const BRAND_GOLD_DARK = "#8a6d14";

/**
 * A faint mark behind the page. Drawn inside its own graphics state so the
 * transparency never leaks onto the text laid over it; a mark that will not
 * decode is simply left out.
 */
const watermark = (doc: jsPDF, data: string | null | undefined, x: number, y: number, size: number) => {
  if (!data || !data.startsWith("data:image")) return;
  const g = doc as unknown as { GState: new (o: { opacity: number }) => unknown; setGState: (s: unknown) => void };
  try {
    doc.saveGraphicsState();
    g.setGState(new g.GState({ opacity: 0.06 }));
    doc.addImage(data, x, y, size, size);
  } catch {
    /* no mark */
  }
  try {
    doc.restoreGraphicsState();
  } catch {
    /* nothing was saved */
  }
};

/** Nested triangles in one corner, outermost first: the classic certificate corner. */
const corner = (doc: jsPDF, x: number, y: number, dx: number, dy: number, layers: Array<[number, string]>) => {
  for (const [size, color] of layers) {
    doc.setFillColor(color);
    doc.triangle(x, y, x + dx * size, y, x, y + dy * size, "F");
  }
};

/**
 * The double rule every certificate-grade document carries: a navy line with
 * a gold one inside it, and ornamental corners that sit over both. `scale`
 * shrinks the corners for a portrait sheet that has less room to give them.
 */
const frame = (doc: jsPDF, w: number, h: number, scale = 1) => {
  doc.setDrawColor(BRAND_NAVY);
  doc.setLineWidth(1.1);
  doc.rect(7, 7, w - 14, h - 14);
  doc.setDrawColor(BRAND_GOLD);
  doc.setLineWidth(0.35);
  doc.rect(10, 10, w - 20, h - 20);
  const navy: Array<[number, string]> = [[30 * scale, BRAND_NAVY], [24 * scale, BRAND_GOLD], [18 * scale, BRAND_NAVY]];
  const gold: Array<[number, string]> = [[20 * scale, BRAND_GOLD], [15 * scale, "#ffffff"], [10 * scale, BRAND_GOLD]];
  corner(doc, 0, 0, 1, 1, navy);
  corner(doc, w, h, -1, -1, navy);
  corner(doc, w, 0, -1, 1, gold);
  corner(doc, 0, h, 1, -1, gold);
};

/** The institute's seal: two gold rings around its mark. */
const seal = (doc: jsPDF, cx: number, cy: number, r: number, logo: string | null | undefined) => {
  doc.setFillColor("#fffaf0");
  doc.setDrawColor(BRAND_GOLD);
  doc.setLineWidth(0.9);
  doc.circle(cx, cy, r, "FD");
  doc.setLineWidth(0.3);
  doc.circle(cx, cy, r - 1.8);
  const inner = (r - 3.5) * 2;
  if (!tryImage(doc, logo, cx - inner / 2, cy - inner / 2, inner, inner)) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6);
    doc.setTextColor(BRAND_GOLD_DARK);
    doc.text("SEAL", cx, cy + 2, { align: "center" });
  }
};

const MARKSHEET = {
  /** A4 portrait, in mm: the sheet an institute files and hands over. */
  width: 210,
  height: 297,
  margin: 12,
} as const;

/** A dotted rule from `x` to `x2`, the leader a filled-in form is written on. */
const dotted = (doc: jsPDF, x: number, x2: number, y: number) => {
  doc.setDrawColor(70);
  doc.setLineWidth(0.2);
  doc.setLineDashPattern([0.6, 0.6], 0);
  doc.line(x, y, x2, y);
  doc.setLineDashPattern([], 0);
};

/**
 * `label   value` written over a dotted rule, the way the particulars block of
 * a statement of marks reads. Returns nothing; the caller owns the geometry.
 */
const particular = (
  doc: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number,
  width: number,
) => {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(20);
  doc.text(label, x, y);
  const labelWidth = doc.getTextWidth(label) + 2;
  doc.setFont("helvetica", "normal");
  // Clipped to the space it has: a long institute name must not run into the
  // column beside it, which is where the next particular begins.
  const room = width - labelWidth;
  let text = value || "-";
  while (text.length > 1 && doc.getTextWidth(text) > room) text = text.slice(0, -1);
  doc.text(text, x + labelWidth, y);
  dotted(doc, x + labelWidth, x + width, y + 1.2);
};

/** Draws a data-URL image, and leaves the box empty if it will not decode. */
const tryImage = (doc: jsPDF, data: string | null | undefined, x: number, y: number, w: number, h: number) => {
  if (!data || !data.startsWith("data:image")) return false;
  try {
    doc.addImage(data, x, y, w, h);
    return true;
  } catch {
    return false;
  }
};

/**
 * What the table totals to, and whether it is a pass.
 *
 * Separate from the drawing because it is the only judgement the marksheet
 * makes: each paper carries its own minimum, so clearing the aggregate is not
 * a pass -- a candidate can total well above the sum of the minimums and still
 * have failed a paper.
 */
export function marksheetSummary(results: StudentDocument["examResults"]) {
  const total = results.reduce((sum, r) => sum + (Number(r.marks) || 0), 0);
  const max = results.reduce((sum, r) => sum + (Number(r.exam.maxMarks) || 0), 0);
  const result = !results.length
    ? "Awaited"
    : results.every((r) => (Number(r.marks) || 0) >= (Number(r.exam.passMarks) || 0))
      ? "Pass"
      : "Fail";
  return { total: Math.round(total * 100) / 100, max, result };
}

/** The assessment table's column edges, left to right. */
const MARK_COLUMNS = [12, 24, 102, 134, 166, 198];

type Paper = { marks: number; max: number };
/** One subject on the marksheet: its theory and practical papers side by side. */
export interface MarksheetRow {
  subject: string;
  theory?: Paper;
  practical?: Paper;
  total: Paper;
}

const PAPER_SUFFIX = /\s*\((Theory|Practical)\)\s*$/i;

/**
 * The papers folded into one row per subject. A subject sat in theory and
 * practical arrives as two papers; the sheet reads them across one line, the
 * way the institute's printed marksheets do. A paper of no stated kind (an old
 * class test) shows only its total.
 */
export function marksheetRows(results: StudentDocument["examResults"]): MarksheetRow[] {
  const rows = new Map<string, MarksheetRow>();
  for (const r of results) {
    const label = String(r.exam.subject || r.exam.name || "");
    const kind = r.exam.paper || (label.match(PAPER_SUFFIX)?.[1] as string | undefined);
    const subject = r.exam.base || label.replace(PAPER_SUFFIX, "") || "-";
    const key = `${r.exam.name}\u0000${subject.toLowerCase()}`;
    const row = rows.get(key) || { subject, total: { marks: 0, max: 0 } };
    const paper = { marks: Number(r.marks) || 0, max: Number(r.exam.maxMarks) || 0 };
    const slot = kind?.toLowerCase() === "practical" ? "practical" : kind?.toLowerCase() === "theory" ? "theory" : null;
    if (slot) {
      const was = row[slot] || { marks: 0, max: 0 };
      row[slot] = { marks: was.marks + paper.marks, max: was.max + paper.max };
    }
    row.total = { marks: row.total.marks + paper.marks, max: row.total.max + paper.max };
    rows.set(key, row);
  }
  return [...rows.values()];
}

/** The grade the percentage earns; a failed paper is an F whatever the aggregate. */
export const marksheetGrade = (percentage: number, passed: boolean) =>
  !passed ? "F" : percentage >= 85 ? "A+" : percentage >= 75 ? "A" : percentage >= 60 ? "B" : percentage >= 45 ? "C" : "D";

const shownMarks = (n: number) => String(Math.round(n * 100) / 100);

/** "(Out of 50)" when every subject's paper carries the same maximum, else nothing: each cell then says its own. */
function outOf(maxes: number[]): number | null {
  const set = [...new Set(maxes)];
  return set.length === 1 ? set[0] : null;
}

function marksheetTableHeader(doc: jsPDF, y: number, outs: Array<number | null>): number {
  const [c0, c1, c2, c3, c4, c5] = MARK_COLUMNS;
  const h = 13;
  doc.setFillColor(BRAND_NAVY);
  doc.rect(c0, y, c5 - c0, h, "F");
  doc.setDrawColor(BRAND_NAVY);
  doc.setLineWidth(0.3);
  doc.rect(c0, y, c5 - c0, h);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text("S.No.", (c0 + c1) / 2, y + 8, { align: "center" });
  doc.text("Subject", c1 + 4, y + 8);
  const heads: Array<[string, number, number]> = [["Theory Marks", c2, c3], ["Practical Marks", c3, c4], ["Total Marks", c4, c5]];
  heads.forEach(([label, from, to], i) => {
    const out = outs[i];
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(label, (from + to) / 2, out == null ? y + 8 : y + 5.8, { align: "center" });
    if (out != null) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(`(Out of ${shownMarks(out)})`, (from + to) / 2, y + 10.4, { align: "center" });
    }
  });
  doc.setDrawColor(255, 255, 255);
  for (const x of [c1, c2, c3, c4]) doc.line(x, y, x, y + h);
  doc.setTextColor(20);
  return y + h;
}

/**
 * The statement of marks, on the academy's own sheet (lib/brand). Kept here
 * so the pages that print marksheets keep one import.
 */
export async function marksheetPdf(s: StudentDocument, extra: MarksheetExtra = {}) {
  await brandMarksheetPdf(s, extra);
}

/** Several students' marksheets in one file, each on a sheet of its own. */
export async function marksheetsPdf(students: StudentDocument[], fileName = "marksheets", extras: MarksheetExtra[] = []) {
  await brandMarksheetsPdf(students.map((student, i) => ({ student, extra: extras[i] })), fileName);
}

/** The course-completion certificate, on the academy's own sheet (lib/brand). */
export async function certificatePdf(s: StudentDocument, extra: CertificateExtra = {}) {
  await brandCertificatePdf(s, extra);
}

/** Several students' certificates in one file, a page each, for one print run. */
export async function certificatesPdf(students: StudentDocument[], fileName = "certificates", extras: CertificateExtra[] = []) {
  await brandCertificatesPdf(students.map((student, i) => ({ student, extra: extras[i] })), fileName);
}

export function feeStatementPdf(record: {
  studentName: string;
  rollNo: string;
  feeType: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  dueDate: string;
}) {
  const doc = new jsPDF();
  header(doc, "FEE STATEMENT", record.rollNo);
  line(doc, "Student", record.studentName, 55);
  line(doc, "Fee description", record.feeType, 72);
  line(
    doc,
    "Due date",
    new Date(record.dueDate).toLocaleDateString("en-IN"),
    89,
  );
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(16, 108, 178, 54, 3, 3, "F");
  line(
    doc,
    "Total fee",
    `INR ${record.totalAmount.toLocaleString("en-IN")}`,
    119,
  );
  line(doc, "Paid", `INR ${record.paidAmount.toLocaleString("en-IN")}`, 136);
  line(
    doc,
    "Balance due",
    `INR ${record.dueAmount.toLocaleString("en-IN")}`,
    153,
  );
  footer(doc, instituteName());
  save(doc, `fee-statement-${record.rollNo}.pdf`);
}

const inr = (n: number) =>
  `INR ${Math.round(n).toLocaleString("en-IN")}`;
const asDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString("en-IN") : "-";

export type InvoiceDocument = {
  invoiceNo: string;
  issuedOn?: string | null;
  dueDate?: string | null;
  billTo: {
    name: string;
    rollNo?: string;
    course?: string;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
  };
  items: Array<{ description: string; amount: number }>;
  /** Overrides the branch's saved mark. Left off, whatever is configured prints. */
  logo?: string | null;
  discount?: number;
  lateFee?: number;
  paidAmount: number;
  payments?: Array<{
    receiptNo?: string | null;
    paidAt?: string | null;
    method?: string | null;
    amount: number;
  }>;
  notes?: string | null;
};

/**
 * The invoice itself — the demand for payment, as against the receipt that
 * acknowledges one and the statement that summarises a balance.
 *
 * It is the document a student or their employer is asked to pay against, so
 * it carries what makes one payable: who it is billed to, what is being
 * charged line by line, what has already been paid against it, and what is
 * still owed by when. The fee pages could previously print a receipt and a
 * statement but had nothing to issue up front.
 */
export function feeInvoicePdf(invoice: InvoiceDocument) {
  const doc = new jsPDF();
  const discount = invoice.discount ?? 0;
  const lateFee = invoice.lateFee ?? 0;
  const subtotal = invoice.items.reduce((sum, item) => sum + item.amount, 0);
  const total = subtotal - discount + lateFee;
  const balance = Math.max(0, total - invoice.paidAmount);
  const overdue =
    balance > 0 && !!invoice.dueDate && new Date(invoice.dueDate) < new Date();
  const status =
    balance <= 0 ? "PAID IN FULL" : overdue ? "OVERDUE" : invoice.paidAmount > 0 ? "PART PAID" : "UNPAID";

  header(doc, "INVOICE", invoice.invoiceNo, invoice.logo ?? instituteLogo());

  // Billed party on the left, the invoice's own particulars on the right, so
  // the two blocks that get read first sit side by side.
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 110);
  doc.text("BILL TO", 16, 52);
  doc.setFontSize(13);
  doc.setTextColor(24, 24, 27);
  doc.setFont("helvetica", "bold");
  doc.text(invoice.billTo.name || "-", 16, 60);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(90, 90, 100);
  const billLines = [
    invoice.billTo.rollNo && `Roll no. ${invoice.billTo.rollNo}`,
    invoice.billTo.course,
    invoice.billTo.phone,
    invoice.billTo.email,
    invoice.billTo.address,
  ].filter(Boolean) as string[];
  billLines.forEach((text, i) => doc.text(text, 16, 67 + i * 5));

  const meta: Array<[string, string]> = [
    ["INVOICE NO", invoice.invoiceNo],
    ["INVOICE DATE", asDate(invoice.issuedOn ?? new Date().toISOString())],
    ["DUE DATE", asDate(invoice.dueDate)],
    ["STATUS", status],
  ];
  meta.forEach(([label, value], i) => {
    const y = 52 + i * 12;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 110);
    doc.text(label, 194, y, { align: "right" });
    doc.setFontSize(10);
    const unsettled = label === "STATUS" && balance > 0;
    doc.setTextColor(unsettled ? 180 : 24, unsettled ? 60 : 24, unsettled ? 60 : 27);
    doc.text(value, 194, y + 5, { align: "right" });
  });

  // Line items.
  let y = Math.max(100, 67 + billLines.length * 5 + 8);
  doc.setFillColor(24, 24, 27);
  doc.rect(16, y, 178, 9, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("DESCRIPTION", 20, y + 6);
  doc.text("AMOUNT", 190, y + 6, { align: "right" });
  doc.setFont("helvetica", "normal");
  y += 9;

  doc.setTextColor(24, 24, 27);
  doc.setFontSize(10);
  invoice.items.forEach((item, i) => {
    if (i % 2 === 1) {
      doc.setFillColor(248, 248, 248);
      doc.rect(16, y, 178, 9, "F");
    }
    // A long fee description would otherwise run under the amount column.
    const [text] = doc.splitTextToSize(item.description || "-", 128) as string[];
    doc.text(text, 20, y + 6);
    doc.text(inr(item.amount), 190, y + 6, { align: "right" });
    y += 9;
  });
  doc.setDrawColor(220);
  doc.line(16, y, 194, y);

  // Totals, ending on what is actually owed.
  y += 8;
  const totals: Array<[string, string]> = [
    ["Subtotal", inr(subtotal)],
    ...(discount ? ([["Discount", `- ${inr(discount)}`]] as Array<[string, string]>) : []),
    ...(lateFee ? ([["Late fee", inr(lateFee)]] as Array<[string, string]>) : []),
    ["Total", inr(total)],
    ["Amount paid", `- ${inr(invoice.paidAmount)}`],
  ];
  doc.setFontSize(10);
  totals.forEach(([label, value]) => {
    doc.setTextColor(90, 90, 100);
    doc.text(label, 150, y, { align: "right" });
    doc.setTextColor(24, 24, 27);
    doc.text(value, 190, y, { align: "right" });
    y += 7;
  });

  doc.setFillColor(245, 245, 245);
  doc.roundedRect(110, y - 2, 84, 14, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(24, 24, 27);
  doc.text("Balance due", 150, y + 7, { align: "right" });
  doc.text(inr(balance), 190, y + 7, { align: "right" });
  doc.setFont("helvetica", "normal");
  y += 22;

  const received = (invoice.payments ?? []).filter((p) => p.amount > 0);
  if (received.length) {
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 110);
    doc.text("PAYMENTS RECEIVED", 16, y);
    y += 6;
    doc.setFontSize(9);
    doc.setTextColor(24, 24, 27);
    received.forEach((payment) => {
      // Runs off the page once an invoice has been paid in many instalments.
      if (y > 265) {
        doc.addPage();
        y = 24;
      }
      doc.text(asDate(payment.paidAt), 20, y);
      doc.text(payment.receiptNo || "Provisional", 60, y);
      doc.text((payment.method || "-").replace(/_/g, " "), 115, y);
      doc.text(inr(payment.amount), 190, y, { align: "right" });
      y += 6;
    });
    y += 4;
  }

  if (invoice.notes?.trim()) {
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 110);
    doc.text("NOTES", 16, y);
    doc.setFontSize(9);
    doc.setTextColor(24, 24, 27);
    doc
      .splitTextToSize(invoice.notes.trim(), 178)
      .slice(0, 4)
      .forEach((text: string, i: number) => doc.text(text, 16, y + 6 + i * 5));
  }

  if (balance > 0) {
    doc.setFontSize(8);
    doc.setTextColor(110);
    doc.text(
      `Please settle ${inr(balance)} by ${asDate(invoice.dueDate)}. Quote invoice ${invoice.invoiceNo} with the payment.`,
      16,
      272,
    );
  }

  footer(doc, instituteName());
  save(doc, `invoice-${invoice.invoiceNo}.pdf`);
}

/**
 * Receipt for a single payment. `receiptNo` is omitted while the payment has
 * only been keyed in — the sheet then prints as provisional so a counter copy
 * can never pass for a collected one.
 */
export function feeReceiptPdf(payment: {
  studentName: string;
  rollNo: string;
  feeType: string;
  amount: number;
  method: string;
  remarks?: string;
  receiptNo?: string;
  balanceAfter: number;
}) {
  const doc = new jsPDF();
  const provisional = !payment.receiptNo;
  header(
    doc,
    provisional ? "PROVISIONAL RECEIPT" : "FEE RECEIPT",
    payment.receiptNo ?? "Not yet collected",
  );
  line(doc, "Student", payment.studentName, 55);
  line(doc, "Roll number", payment.rollNo, 72);
  line(doc, "Fee description", payment.feeType, 89);
  line(doc, "Received on", new Date().toLocaleString("en-IN"), 106);

  doc.setFillColor(245, 245, 245);
  doc.roundedRect(16, 125, 178, 54, 3, 3, "F");
  line(doc, "Amount received", `INR ${payment.amount.toLocaleString("en-IN")}`, 136);
  line(doc, "Payment method", payment.method.replace(/_/g, " "), 153);
  line(doc, "Balance after payment", `INR ${payment.balanceAfter.toLocaleString("en-IN")}`, 170);

  if (payment.remarks?.trim()) line(doc, "Remarks", payment.remarks.trim(), 190);

  if (provisional) {
    doc.setFontSize(9);
    doc.setTextColor(180, 60, 60);
    doc.text(
      "Provisional — valid only once the payment is collected and a receipt number is issued.",
      16,
      provisional && payment.remarks?.trim() ? 208 : 190,
    );
  }

  footer(doc, instituteName());
  save(doc, `fee-receipt-${payment.receiptNo ?? payment.rollNo}.pdf`);
}
