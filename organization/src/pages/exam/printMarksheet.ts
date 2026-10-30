import { marksheetPdf, marksheetsPdf } from "@/lib/documents";
import { asExamResults, termLabel, termPlan, type CourseTermSource } from "@/lib/examWorkflow";
import { printFromTemplate, printMarksheetsFromTemplate } from "@/lib/studentTemplateDocument";
import { getStudentDocument } from "@/lib/supabase/data";
import type { MarksheetRecord } from "@/lib/supabase/examWorkflow";

type MarksheetOptions = {
  course: CourseTermSource | null | undefined;
  rollNo?: string;
  examinationDate?: string;
  organizationId: string | null;
  ownBranch: string | null;
};

/** One term's result as the document a marksheet prints, with the tokens a design reads. */
async function marksheetDocument(sheet: MarksheetRecord, opts: MarksheetOptions) {
  const { data } = await getStudentDocument(sheet.studentId, opts.ownBranch);
  const type = termPlan(opts.course).type;
  const doc = {
    ...data,
    rollNo: opts.rollNo || data.rollNo,
    issueDate: sheet.issueDate,
    examinationDate: opts.examinationDate || sheet.issueDate,
    session: sheet.session || data.session,
    examResults: asExamResults([sheet], type),
  };
  const extra = { marksheet_no: sheet.marksheetNo, term: termLabel(type, sheet.term), session: sheet.session };
  return { doc, extra };
}

/**
 * Prints one term's result as the marksheet: the branch's marksheet design
 * where it has one, else the built-in sheet. Results and Certificates both
 * print through here, so the two never disagree about what a marksheet says.
 */
export async function printMarksheet(sheet: MarksheetRecord, opts: MarksheetOptions) {
  const { doc, extra } = await marksheetDocument(sheet, opts);
  const printed = await printFromTemplate("marksheet", doc, opts.organizationId, sheet.branchId, extra);
  if (!printed) await marksheetPdf(doc);
}

/** Many results printed together: one print run in the branches' designs, else one PDF file. */
export async function printMarksheets(
  items: Array<{ sheet: MarksheetRecord; opts: Omit<MarksheetOptions, "organizationId" | "ownBranch"> }>,
  organizationId: string | null,
  ownBranch: string | null,
) {
  const built = [];
  for (const { sheet, opts } of items) {
    const { doc, extra } = await marksheetDocument(sheet, { ...opts, organizationId, ownBranch });
    built.push({ student: doc, extra, branchId: sheet.branchId });
  }
  const printed = await printMarksheetsFromTemplate(built, organizationId);
  if (!printed) await marksheetsPdf(built.map((b) => b.student), `marksheets-${built.length}`);
}
