import { describe, it, expect } from "vitest";

import {
  DAYS,
  formatRange,
  formatTime,
  groupIntoTimings,
  isActive,
  timingKey,
  timingProblem,
  timingsOnDay,
  type TimingRow,
} from "@/lib/batchSchedule";

/**
 * `batch_timings` stores one row per day — a class taught Mon/Wed/Fri is three
 * rows. A timetable is read the other way round, one class across days, so the
 * rows are grouped back. What must not happen is two genuinely different
 * classes being folded into one, because editing either would rewrite both.
 */
const row = (over: Partial<TimingRow> & { id: string; day: string }): TimingRow => ({
  batchId: "b1",
  startTime: "08:00",
  endTime: "10:00",
  subject: "Trade Theory",
  instructor: "Computer Faculty",
  roomNo: "Lab-01",
  classMode: "Offline",
  ...over,
});

describe("groupIntoTimings", () => {
  it("folds one class taught on several days into a single timing", () => {
    const timings = groupIntoTimings([
      row({ id: "1", day: "MONDAY" }),
      row({ id: "2", day: "WEDNESDAY" }),
      row({ id: "3", day: "FRIDAY" }),
    ]);

    expect(timings).toHaveLength(1);
    expect(timings[0].days).toEqual(["MONDAY", "WEDNESDAY", "FRIDAY"]);
    // Every row is kept, so a save can replace exactly what it came from.
    expect(timings[0].ids).toEqual(["1", "2", "3"]);
  });

  it("puts the days back in week order, whatever order they arrived in", () => {
    const timings = groupIntoTimings([
      row({ id: "1", day: "SATURDAY" }),
      row({ id: "2", day: "TUESDAY" }),
      row({ id: "3", day: "MONDAY" }),
    ]);

    expect(timings[0].days).toEqual(["MONDAY", "TUESDAY", "SATURDAY"]);
  });

  it("keeps two classes apart when only the trainer differs", () => {
    const timings = groupIntoTimings([
      row({ id: "1", day: "MONDAY", instructor: "Amit" }),
      row({ id: "2", day: "MONDAY", instructor: "Priya" }),
    ]);

    expect(timings).toHaveLength(2);
  });

  it("keeps them apart on room and on mode too", () => {
    expect(
      groupIntoTimings([
        row({ id: "1", day: "MONDAY", roomNo: "Lab-01" }),
        row({ id: "2", day: "MONDAY", roomNo: "Lab-02" }),
      ]),
    ).toHaveLength(2);

    expect(
      groupIntoTimings([
        row({ id: "1", day: "MONDAY", classMode: "Offline" }),
        row({ id: "2", day: "MONDAY", classMode: "Online" }),
      ]),
    ).toHaveLength(2);
  });

  it("reads the earliest class first", () => {
    const timings = groupIntoTimings([
      row({ id: "1", day: "MONDAY", startTime: "16:00", subject: "Evening" }),
      row({ id: "2", day: "MONDAY", startTime: "08:00", subject: "Morning" }),
    ]);

    expect(timings.map((t) => t.subject)).toEqual(["Morning", "Evening"]);
  });

  it("falls back where the schedule columns have not been migrated yet", () => {
    // classMode, colour and description are null until the migration runs.
    const [timing] = groupIntoTimings([
      { id: "1", batchId: "b1", day: "MONDAY", startTime: "08:00", endTime: "10:00" },
    ]);

    expect(timing.classMode).toBe("Offline");
    expect(timing.colour).toBe("blue");
    expect(timing.notes).toBe("");
    expect(timing.active).toBe(true);
  });

  it("ignores a repeated day rather than listing it twice", () => {
    const [timing] = groupIntoTimings([
      row({ id: "1", day: "MONDAY" }),
      row({ id: "2", day: "monday" }),
    ]);

    expect(timing.days).toEqual(["MONDAY"]);
    expect(timing.ids).toEqual(["1", "2"]);
  });
});

describe("timingKey", () => {
  it("ignores the day, since that is what is being grouped over", () => {
    expect(timingKey(row({ id: "1", day: "MONDAY" }))).toBe(
      timingKey(row({ id: "2", day: "FRIDAY" })),
    );
  });
});

describe("isActive", () => {
  // A slot is off only when it says so; the column is null on most rows.
  it("treats anything unset as a running class", () => {
    expect(isActive(null)).toBe(true);
    expect(isActive("")).toBe(true);
    expect(isActive("scheduled")).toBe(true);
    expect(isActive("Inactive")).toBe(false);
    expect(isActive("INACTIVE")).toBe(false);
  });
});

describe("timingsOnDay", () => {
  it("gives one day's classes, earliest first", () => {
    const timings = groupIntoTimings([
      row({ id: "1", day: "MONDAY", startTime: "16:00", subject: "Evening" }),
      row({ id: "2", day: "MONDAY", startTime: "08:00", subject: "Morning" }),
      row({ id: "3", day: "TUESDAY", startTime: "09:00", subject: "Other" }),
    ]);

    expect(timingsOnDay(timings, "MONDAY").map((t) => t.subject)).toEqual(["Morning", "Evening"]);
    expect(timingsOnDay(timings, "SATURDAY")).toEqual([]);
  });

  it("covers Monday to Saturday", () => {
    expect(DAYS).toHaveLength(6);
    expect(DAYS).not.toContain("SUNDAY");
  });
});

describe("formatTime", () => {
  it("reads a 24-hour time back as the clock", () => {
    expect(formatTime("08:00")).toMatch(/8:00/);
    expect(formatTime("16:30")).toMatch(/4:30/);
  });

  it("leaves something that is not a time alone", () => {
    expect(formatTime("")).toBe("—");
    expect(formatTime("later")).toBe("later");
  });

  it("prints a range", () => {
    expect(formatRange("08:00", "10:00")).toMatch(/8:00.*10:00/);
  });
});

describe("timingProblem", () => {
  const ok = { batchId: "b1", days: ["MONDAY"], startTime: "08:00", endTime: "10:00" };

  it("passes a complete timing", () => {
    expect(timingProblem(ok)).toBeNull();
  });

  it("names the one thing that is wrong", () => {
    expect(timingProblem({ ...ok, batchId: "" })).toMatch(/batch/i);
    expect(timingProblem({ ...ok, days: [] })).toMatch(/day/i);
    expect(timingProblem({ ...ok, endTime: "" })).toMatch(/start and an end/i);
  });

  // The class has to end after it starts — including not at the same minute.
  it("refuses a class that ends before or when it starts", () => {
    expect(timingProblem({ ...ok, startTime: "10:00", endTime: "08:00" })).toMatch(/end after/i);
    expect(timingProblem({ ...ok, startTime: "10:00", endTime: "10:00" })).toMatch(/end after/i);
  });
});
