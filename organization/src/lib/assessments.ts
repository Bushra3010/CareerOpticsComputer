/** Shared checks for marks entry and exam admit cards. */
export type ExamScope = { branchId?: string; courseId?: string; batchId?: string };
export type ExamCandidate = ExamScope & { courseIds?: string[] };

export function isExamCandidate(student: ExamCandidate, exam: ExamScope): boolean {
  return Boolean(exam.branchId && exam.courseId)
    && student.branchId === exam.branchId
    && [student.courseId, ...(student.courseIds ?? [])].includes(exam.courseId)
    && (!exam.batchId || student.batchId === exam.batchId);
}

export function validExamMarks(max: number, pass: number): boolean {
  return Number.isFinite(max) && max > 0 && Number.isFinite(pass) && pass >= 0 && pass <= max;
}

export function validScore(marks: number, max: number): boolean {
  return Number.isFinite(marks) && marks >= 0 && marks <= max;
}
