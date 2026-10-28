/**
 * Putting students into a batch.
 *
 * The rules live here rather than in the page because they are the part worth
 * being sure about: a seat count that is wrong lets a batch overfill, and an
 * assignment that quietly moves someone out of another batch is a change
 * nobody asked for.
 */

/** A student as the assignment screen reads them. */
export interface AssignableStudent {
  id: string;
  name: string;
  code: string;
  phone: string;
  /** The batch they are in today, or "" when they are unplaced. */
  batchId: string;
  courseId: string;
  /** Every course they are enrolled on (`students.courseIds`), the main one included. */
  courseIds?: string[];
  /** The branch that admitted them. */
  branchId?: string;
}

/** The batch being filled, as far as who may join it goes. */
export interface BatchForAssignment {
  courseId?: string | null;
  branchId?: string | null;
}

/** The courses a student is enrolled on: the main one and any others. */
export const enrolledCourses = (student: AssignableStudent) =>
  [...new Set([student.courseId, ...(student.courseIds ?? [])].filter(Boolean))];

/**
 * Why this student cannot join this batch, or null when they can.
 *
 * A batch teaches one course at one branch. A student placed in a batch of a
 * course they never enrolled on gets that course's timetable on their portal
 * under the name of their own course; one placed in another branch's batch
 * is taught at a centre that did not admit them.
 */
export function eligibility(student: AssignableStudent, batch: BatchForAssignment | null | undefined): string | null {
  if (!batch) return null;
  if (batch.branchId && student.branchId && student.branchId !== batch.branchId) return "belongs to another branch";
  if (batch.courseId) {
    const courses = enrolledCourses(student);
    if (!courses.length) return "has no course yet";
    if (!courses.includes(batch.courseId)) return "is not enrolled on this batch's course";
  }
  return null;
}

export type Placement = "Unassigned" | "In this batch" | "In another batch";

export function placementOf(student: AssignableStudent, batchId: string): Placement {
  if (!student.batchId) return "Unassigned";
  return student.batchId === batchId ? "In this batch" : "In another batch";
}

/**
 * How many more will fit.
 *
 * `null` when the batch has no seat limit — unlimited is not the same as zero,
 * and treating it as zero would refuse every assignment.
 */
export function seatsLeft(capacity: number | undefined | null, taken: number): number | null {
  if (capacity === undefined || capacity === null || !Number.isFinite(capacity)) return null;
  return Math.max(0, Number(capacity) - taken);
}

/**
 * Why this selection cannot be assigned, or null when it can.
 *
 * Counted against the seats actually free, so selecting someone who is already
 * in the batch does not consume one twice.
 */
export function assignmentProblem(input: {
  batchId: string;
  selected: AssignableStudent[];
  capacity: number | undefined | null;
  taken: number;
  batch?: BatchForAssignment | null;
}): string | null {
  if (!input.batchId) return "Pick the batch to assign these students to.";
  if (!input.selected.length) return "Select at least one student.";

  const refused = input.selected
    .map((student) => ({ student, why: eligibility(student, input.batch) }))
    .filter((r): r is { student: AssignableStudent; why: string } => r.why !== null);
  if (refused.length) {
    const named = refused.slice(0, 3).map((r) => `${r.student.name} ${r.why}`).join("; ");
    const more = refused.length > 3 ? ` (and ${refused.length - 3} more)` : "";
    return `Cannot join this batch: ${named}${more}.`;
  }

  const joining = input.selected.filter((student) => student.batchId !== input.batchId);
  const free = seatsLeft(input.capacity, input.taken);
  if (free !== null && joining.length > free) {
    return free === 0
      ? "This batch is full. Free a seat or raise its capacity first."
      : `Only ${free} ${free === 1 ? "seat is" : "seats are"} left in this batch, and ${joining.length} students are selected.`;
  }
  return null;
}

/** Those who would be moved out of a batch they are already in. */
export const movingFrom = (selected: AssignableStudent[], batchId: string) =>
  selected.filter((student) => student.batchId && student.batchId !== batchId);
