import { jsPDF } from "jspdf";
import {
  AdmitCardStudent,
  AdmitCardTemplate,
  INSTITUTE,
  INSTRUCTIONS,
  fieldValue,
  findExam,
} from "@/data/admit-card-templates";

/** Page sizes in millimetres, keyed by the template's `size`. */
const PAGES = {
  a4: { width: 210, height: 297 },
  a5: { width: 148, height: 210 },
  letter: { width: 216, height: 279 },
};

const MARGIN = 14;

function drawCard(
  doc: jsPDF,
  template: AdmitCardTemplate,
  student: AdmitCardStudent,
  page: { width: number; height: number },
) {
  const exam = template.liveExam || findExam(template.exam);
  const institute = template.institute || INSTITUTE;
  const left = MARGIN;
  const right = page.width - MARGIN;
  const width = right - left;
  let y = MARGIN;

  doc.setDrawColor(200);
  doc.roundedRect(left, y, width, page.height - 2 * MARGIN, 3, 3);

  y += 12;
  doc.setTextColor(24, 24, 27);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(institute.name, page.width / 2, y, { align: "center" });
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(110);
  doc.text(institute.address, page.width / 2, y, { align: "center" });

  y += 5;
  doc.setDrawColor(225);
  doc.line(left + 6, y, right - 6, y);

  y += 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(24, 24, 27);
  doc.text("ADMIT CARD", page.width / 2, y, { align: "center" });

  y += 8;
  let textX = left + 8;
  if (template.showPhoto) {
    doc.setDrawColor(200);
    doc.rect(left + 8, y, 26, 32);
    doc.setFontSize(7);
    doc.setTextColor(150);
    if (student.photo) {
      try { doc.addImage(student.photo, left + 8, y, 26, 32); } catch { doc.text("PHOTO", left + 21, y + 17, { align: "center" }); }
    } else doc.text("PHOTO", left + 21, y + 17, { align: "center" });
    textX = left + 42;
  }

  let cursor = y + 5;
  doc.setFontSize(10);
  for (const label of template.elements) {
    const value = fieldValue(label, student, exam);
    if (value === null) continue;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(110);
    doc.text(`${label}:`, textX, cursor);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(24, 24, 27);
    const valueWidth = right - 8 - textX - 34;
    const lines = doc.splitTextToSize(value, valueWidth);
    doc.text(lines, textX + 34, cursor);
    cursor += Math.max(6, lines.length * 4.5);
  }

  y = Math.max(cursor, y + 38) + 6;

  if (template.showSchedule && exam) {
    doc.setDrawColor(210);
    const height = 10 + exam.schedule.length * 5.5;
    doc.roundedRect(left + 8, y, width - 16, height, 2, 2);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(24, 24, 27);
    doc.text("EXAM SCHEDULE", left + 12, y + 6.5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    let row = y + 12.5;
    for (const slot of exam.schedule) {
      doc.text(slot.subject, left + 12, row);
      doc.text(slot.when, right - 12, row, { align: "right" });
      row += 5.5;
    }
    y += height + 8;
  }

  if (template.elements.includes("Instructions")) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(110);
    const lines = doc.splitTextToSize(INSTRUCTIONS, width - 16);
    doc.text(lines, left + 8, y);
    y += lines.length * 4.5;
  }

  const footerY = page.height - MARGIN - 18;
  if (template.showQr) {
    doc.setDrawColor(200);
    doc.rect(left + 8, footerY - 8, 20, 20);
    doc.setFontSize(7);
    doc.setTextColor(150);
    if (student.qr) doc.addImage(student.qr, "PNG", left + 8, footerY - 8, 20, 20);
    else doc.text("QR", left + 18, footerY + 3, { align: "center" });
  }
  doc.setDrawColor(60);
  doc.line(right - 50, footerY + 6, right - 8, footerY + 6);
  doc.setFontSize(8);
  doc.setTextColor(110);
  doc.text("Principal's Signature", right - 29, footerY + 10, { align: "center" });
}

/** One admit card per page, in the template's paper size. */
export function admitCardsPdf(
  template: AdmitCardTemplate,
  students: AdmitCardStudent[],
  filename = "admit-cards.pdf",
) {
  const page = PAGES[template.size] ?? PAGES.a4;
  const doc = new jsPDF({ format: template.size in PAGES ? template.size : "a4" });

  students.forEach((student, index) => {
    if (index > 0) doc.addPage();
    drawCard(doc, template, student, page);
  });

  doc.save(filename.replace(/[^a-z0-9._-]+/gi, "-"));
  return { pages: students.length };
}
