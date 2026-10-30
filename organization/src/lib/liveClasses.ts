/**
 * The two figures the live-class list derives rather than reads.
 *
 * A live class is one weekly `batch_timings` slot projected onto the next date
 * that day falls on, so one batch appears several times in the same list.
 */

/** What the schedule's status is called in the filter and on the row. */
export type LiveClassState = "Live now" | "Upcoming" | "Completed" | "Cancelled";

export function liveClassState(status: string): LiveClassState {
  switch (status) {
    case "active":
      return "Live now";
    case "scheduled":
      return "Upcoming";
    case "completed":
      return "Completed";
    default:
      return "Cancelled";
  }
}

/**
 * How many students the listed classes cover.
 *
 * Counted per batch, not per class: a batch running Monday, Wednesday and
 * Friday is three rows, and summing the rows would count its students three
 * times over.
 */
export const studentsOnSchedule = (
  classes: Array<{ batch: string; totalStudents: number }>,
): number =>
  [...new Map(classes.map((c) => [c.batch, c.totalStudents])).values()].reduce(
    (sum, count) => sum + count,
    0,
  );
