import { jsPDF } from "jspdf";
import {
  IdCardStudent,
  IdCardTemplate,
  fieldValue,
} from "@/data/id-card-templates";

/** CR80 card, in millimetres. */
const CARD = { long: 85.6, short: 54 };
const PAGE = { width: 210, height: 297, margin: 12, gap: 6 };

const rgb = (hex: string): [number, number, number] => {
  const value = hex.replace("#", "");
  return [
    parseInt(value.slice(0, 2), 16) || 0,
    parseInt(value.slice(2, 4), 16) || 0,
    parseInt(value.slice(4, 6), 16) || 0,
  ];
};

function drawCard(
  doc: jsPDF,
  template: IdCardTemplate,
  student: IdCardStudent,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const [r, g, b] = rgb(template.accent);

  doc.setDrawColor(210);
  doc.roundedRect(x, y, width, height, 2, 2);

  doc.setFillColor(r, g, b);
  doc.roundedRect(x, y, width, 12, 2, 2, "F");
  doc.rect(x, y + 8, width, 4, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(template.instituteName, x + 3, y + 5.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.5);
  doc.text(template.instituteAddress, x + 3, y + 9.5);

  let textX = x + 3;
  const bodyTop = y + 16;

  if (template.showPhoto) {
    doc.setDrawColor(200);
    doc.rect(x + 3, bodyTop, 16, 20);
    doc.setFontSize(5);
    doc.setTextColor(150);
    doc.text(student.photo ? "PHOTO" : "NO PHOTO", x + 11, bodyTop + 10.5, { align: "center" });
    textX = x + 22;
  }

  let cursor = bodyTop + 3;
  doc.setTextColor(24, 24, 27);

  if (template.fields.includes("Student Name")) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(student.name, textX, cursor);
    cursor += 4.5;
  }

  doc.setFontSize(5.5);
  for (const label of template.fields.filter((field) => field !== "Student Name")) {
    if (cursor > y + height - 10) break;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120);
    doc.text(`${label}:`, textX, cursor);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(24, 24, 27);
    doc.text(fieldValue(label, student, template), textX + 20, cursor);
    cursor += 3.6;
  }

  const footerY = y + height - 4;
  if (template.showQr) {
    doc.setDrawColor(200);
    doc.rect(x + 3, footerY - 10, 10, 10);
    doc.setFontSize(4.5);
    doc.setTextColor(150);
    doc.text("QR", x + 8, footerY - 4.5, { align: "center" });
  }
  if (template.showSignature) {
    doc.setDrawColor(60);
    doc.line(x + width - 25, footerY - 3, x + width - 5, footerY - 3);
    doc.setFontSize(4.5);
    doc.setTextColor(120);
    doc.text("Principal", x + width - 15, footerY, { align: "center" });
  }
}

/** Lay the selected students out as a printable sheet of ID cards. */
export function idCardsPdf(
  template: IdCardTemplate,
  students: IdCardStudent[],
  filename = "id-cards.pdf",
) {
  const doc = new jsPDF();
  const width = template.orientation === "portrait" ? CARD.short : CARD.long;
  const height = template.orientation === "portrait" ? CARD.long : CARD.short;

  const columns = Math.max(1, Math.floor((PAGE.width - 2 * PAGE.margin + PAGE.gap) / (width + PAGE.gap)));
  const rows = Math.max(1, Math.floor((PAGE.height - 2 * PAGE.margin + PAGE.gap) / (height + PAGE.gap)));
  const perPage = columns * rows;

  students.forEach((student, index) => {
    if (index > 0 && index % perPage === 0) doc.addPage();
    const slot = index % perPage;
    const x = PAGE.margin + (slot % columns) * (width + PAGE.gap);
    const y = PAGE.margin + Math.floor(slot / columns) * (height + PAGE.gap);
    drawCard(doc, template, student, x, y, width, height);
  });

  doc.save(filename.replace(/[^a-z0-9._-]+/gi, "-"));
  return { pages: Math.max(1, Math.ceil(students.length / perPage)), perPage };
}
