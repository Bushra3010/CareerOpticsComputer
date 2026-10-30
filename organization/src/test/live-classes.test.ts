import { describe, it, expect } from "vitest";

/**
 * A live class is one weekly `batch_timings` slot projected onto the next date
 * that day falls on. Two things the list gets from its batch rather than from
 * the slot: which branch runs it, and how many students are on it.
 */

import { liveClassState, studentsOnSchedule } from "@/lib/liveClasses";

describe("students on the schedule", () => {
  // A batch running Mon/Wed/Fri is three classes; summing the rows would count
  // the same students three times.
  it("counts a batch's students once, however many classes it runs", () => {
    expect(
      studentsOnSchedule([
        { batch: "ADCA Morning", totalStudents: 20 },
        { batch: "ADCA Morning", totalStudents: 20 },
        { batch: "ADCA Morning", totalStudents: 20 },
        { batch: "DCA Evening", totalStudents: 12 },
      ]),
    ).toBe(32);
  });

  it("is zero for an empty schedule", () => {
    expect(studentsOnSchedule([])).toBe(0);
  });
});

describe("status labels", () => {
  it("says what a person would say", () => {
    expect(liveClassState("active")).toBe("Live now");
    expect(liveClassState("scheduled")).toBe("Upcoming");
    expect(liveClassState("completed")).toBe("Completed");
    expect(liveClassState("cancelled")).toBe("Cancelled");
  });

  it("does not invent a fifth state for something unrecognised", () => {
    expect(liveClassState("")).toBe("Cancelled");
  });
});
