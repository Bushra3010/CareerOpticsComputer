/**
 * The weekly timetable's model, over the table the database actually has.
 *
 * `batch_timings` stores one row per day: a batch taught Monday, Wednesday and
 * Friday at the same hour is three rows. A timetable is read the other way
 * round — one class, taught on these days — so the rows are grouped back into
 * timings here, and a timing is saved back out as one row per day.
 *
 * Grouping on everything except the day is deliberate. Two slots that differ
 * only in trainer, room or mode are genuinely two classes and must not be
 * folded into one, or editing either would silently rewrite both.
 */

export const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"] as const;
export type Day = (typeof DAYS)[number];

export const DAY_SHORT: Record<string, string> = {
  MONDAY: "Mon", TUESDAY: "Tue", WEDNESDAY: "Wed",
  THURSDAY: "Thu", FRIDAY: "Fri", SATURDAY: "Sat", SUNDAY: "Sun",
};

export const CLASS_MODES = ["Offline", "Online", "Hybrid"] as const;
export type ClassMode = (typeof CLASS_MODES)[number];

/** Grid colours. Named rather than free hex so the palette stays legible. */
export const TIMING_COLOURS = ["blue", "green", "purple", "amber", "cyan"] as const;
export type TimingColour = (typeof TIMING_COLOURS)[number];

/** One row of `batch_timings`, as the screen reads it. */
export interface TimingRow {
  id: string;
  batchId: string;
  day: string;
  startTime: string;
  endTime: string;
  subject?: string | null;
  instructor?: string | null;
  roomNo?: string | null;
  classMode?: string | null;
  breakStart?: string | null;
  breakEnd?: string | null;
  colour?: string | null;
  description?: string | null;
  status?: string | null;
}

/** One class, and the days of the week it runs on. */
export interface Timing {
  /** The grouping key — stable across renders, and what edits address. */
  key: string;
  /** Every row this timing was assembled from, so a save can replace them. */
  ids: string[];
  batchId: string;
  days: Day[];
  startTime: string;
  endTime: string;
  subject: string;
  instructor: string;
  roomNo: string;
  classMode: ClassMode;
  breakStart: string;
  breakEnd: string;
  colour: TimingColour;
  notes: string;
  active: boolean;
}

const text = (value: unknown) => String(value ?? "").trim();

/** A slot is off only when it says so; anything unset is a running class. */
export const isActive = (status: unknown) => text(status).toLowerCase() !== "inactive";

const asMode = (value: unknown): ClassMode => {
  const raw = text(value);
  return (CLASS_MODES as readonly string[]).includes(raw) ? (raw as ClassMode) : "Offline";
};

const asColour = (value: unknown): TimingColour => {
  const raw = text(value).toLowerCase();
  return (TIMING_COLOURS as readonly string[]).includes(raw) ? (raw as TimingColour) : "blue";
};

/** Everything but the day: two classes differing in trainer are two classes. */
export function timingKey(row: TimingRow): string {
  return [
    row.batchId,
    row.startTime,
    row.endTime,
    text(row.subject),
    text(row.instructor),
    text(row.roomNo),
    asMode(row.classMode),
  ].join("|");
}

const dayOrder = (day: string) => {
  const index = (DAYS as readonly string[]).indexOf(String(day).toUpperCase());
  return index < 0 ? DAYS.length : index;
};

export function groupIntoTimings(rows: TimingRow[]): Timing[] {
  const byKey = new Map<string, Timing>();

  for (const row of rows) {
    const key = timingKey(row);
    const day = String(row.day).toUpperCase() as Day;
    const existing = byKey.get(key);
    if (existing) {
      existing.ids.push(row.id);
      if (!existing.days.includes(day)) existing.days.push(day);
      continue;
    }
    byKey.set(key, {
      key,
      ids: [row.id],
      batchId: row.batchId,
      days: [day],
      startTime: text(row.startTime),
      endTime: text(row.endTime),
      subject: text(row.subject),
      instructor: text(row.instructor),
      roomNo: text(row.roomNo),
      classMode: asMode(row.classMode),
      breakStart: text(row.breakStart),
      breakEnd: text(row.breakEnd),
      colour: asColour(row.colour),
      notes: text(row.description),
      active: isActive(row.status),
    });
  }

  const timings = [...byKey.values()];
  for (const timing of timings) timing.days.sort((a, b) => dayOrder(a) - dayOrder(b));
  // Earliest class first, which is the order a timetable is read in.
  return timings.sort(
    (a, b) => a.startTime.localeCompare(b.startTime) || a.subject.localeCompare(b.subject),
  );
}

/** The timings that run on one day, earliest first. */
export function timingsOnDay(timings: Timing[], day: Day): Timing[] {
  return timings
    .filter((timing) => timing.days.includes(day))
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
}

/** "08:00" → "8:00 am". Left alone when it is not a time at all. */
export function formatTime(value: string): string {
  const match = /^(\d{1,2}):(\d{2})/.exec(value ?? "");
  if (!match) return value || "—";
  const [, hour, minute] = match;
  const date = new Date();
  date.setHours(Number(hour), Number(minute), 0, 0);
  return date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
}

export const formatRange = (start: string, end: string) =>
  `${formatTime(start)} – ${formatTime(end)}`;

/**
 * Why a timing cannot be saved, or null when it can.
 *
 * Returned rather than thrown so the form can say the one thing that is wrong
 * instead of failing on whichever the database happened to reject first.
 */
export function timingProblem(draft: {
  batchId: string;
  days: string[];
  startTime: string;
  endTime: string;
}): string | null {
  if (!draft.batchId) return "Pick the batch this class belongs to.";
  if (!draft.days.length) return "Choose at least one day for the class to run on.";
  if (!draft.startTime || !draft.endTime) return "A class needs a start and an end time.";
  if (draft.endTime <= draft.startTime) return "The class has to end after it starts.";
  return null;
}
