import { AdmitCardStudent, AdmitCardTemplate, findExam } from "@/data/admit-card-templates";
import { brandAdmitCardsPdf, type AdmitCard } from "@/lib/brand/brandDocuments";

/**
 * Admit cards as PDF, on the academy's letterhead (lib/brand). The template
 * only names the exam now; the layout is the academy's own.
 */
export function admitCardOf(template: AdmitCardTemplate, student: AdmitCardStudent): AdmitCard {
  const exam = template.liveExam || findExam(template.exam);
  const schedule = exam?.schedule ?? [];
  const centre = schedule.find((s) => s.subject === "Exam centre");
  return {
    name: student.name,
    enrollmentNo: student.id,
    rollNo: student.rollNo,
    course: student.class,
    term: student.section,
    examWindow: exam?.window ?? "To be announced",
    examCentre: centre?.when,
    schedule: schedule.filter((s) => s !== centre),
    photo: student.photo || null,
  };
}

/** One admit card per page. */
export async function admitCardsPdf(template: AdmitCardTemplate, students: AdmitCardStudent[], filename = "admit-cards.pdf") {
  await brandAdmitCardsPdf(students.map((s) => admitCardOf(template, s)), filename.replace(/\.pdf$/i, ""));
  return { pages: students.length };
}
