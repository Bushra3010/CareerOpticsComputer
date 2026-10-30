import { describe, it, expect } from "vitest";
import { admissionFunnel, belowAttendance, monthlyFees, todaysBatches, weekActivity } from "@/lib/dashboardCharts";

// Thursday 15 October 2026, mid-morning.
const NOW = new Date(2026, 9, 15, 10, 0, 0);

describe("dashboard charts, from real rows", () => {
  it("sums payments by the month received and dues by the month they fall due, in ₹ thousand", () => {
    const fees = monthlyFees(
      [
        { amount: 5000, paidAt: "2026-10-02T10:00:00Z" },
        { amount: 2500, paidAt: "2026-10-03T10:00:00Z" },
        { amount: 9000, paidAt: "2026-10-04T10:00:00Z", reversedAt: "2026-10-05T10:00:00Z" },
        { amount: 1000, paidAt: "2026-06-10T10:00:00Z" },
        { amount: 7000, paidAt: "2026-01-10T10:00:00Z" }, // older than the chart
      ],
      [{ totalAmount: 4000, paidAmount: 1000, dueDate: "2026-10-20" }],
      NOW,
    );
    expect(fees.map((f) => f.m)).toEqual(["Jun", "Jul", "Aug", "Sep", "Oct"]);
    expect(fees[4]).toEqual({ m: "Oct", collected: 7.5, due: 3 });
    expect(fees[0].collected).toBe(1);
  });

  it("gives this week's attendance per day, leaving out days with no register", () => {
    const week = weekActivity(
      [
        { date: "2026-10-12", status: "PRESENT" },
        { date: "2026-10-12", status: "ABSENT" },
        { date: "2026-10-13", status: "LATE" },
      ],
      [],
      NOW,
    );
    expect(week.map((d) => d.day)).toEqual(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
    expect(week[0].attendance).toBe(50);
    expect(week[1].attendance).toBe(100);
    expect(week[2].attendance).toBeNull();
  });

  it("lists only batches with a class today, with their real strength and faculty", () => {
    const list = todaysBatches(
      [
        { batchId: "b1", day: "THURSDAY", startTime: "11:30:00", endTime: "13:00:00", instructor: "Raj Sir" },
        { batchId: "b2", day: "THURSDAY", startTime: "09:30:00", endTime: "11:00:00" },
        { batchId: "b1", day: "MONDAY", startTime: "09:00:00" },
      ],
      [
        { id: "b1", name: "Morning A", courseName: "ADCA" },
        { id: "b2", name: "Tally B", instructor: "Ms. Sinha" },
      ],
      [{ id: "s1", batchId: "b1" }, { id: "s2", batchId: "b1" }, { id: "s3", batchId: "b2" }],
      NOW,
    );
    expect(list.map((b) => b.name)).toEqual(["Tally B", "Morning A · ADCA"]);
    expect(list[0]).toMatchObject({ time: "09:30 – 11:00", faculty: "Ms. Sinha", strength: 1 });
    expect(list[1]).toMatchObject({ faculty: "Raj Sir", strength: 2 });
  });

  it("counts the admissions pipeline from enquiries and students", () => {
    const f = admissionFunnel(
      [
        { status: "NEW", createdAt: "2026-10-03" },
        { status: "NEW", createdAt: "2026-09-03" },
        { status: "CONTACTED", followUpDate: "2026-10-14" },
        { status: "CLOSED", followUpDate: "2026-10-01" },
      ],
      [
        { id: "s1", admissionStatus: "SUBMITTED", admissionDate: "2026-09-01" },
        { id: "s2", admissionStatus: "APPROVED", admissionDate: "2026-10-05" },
      ],
      NOW,
    );
    expect(f).toEqual({ newEnquiries: 1, followUpDue: 1, onlineApplications: 1, admittedThisMonth: 1 });
  });

  it("counts students below 75% attendance", () => {
    expect(
      belowAttendance([
        { studentId: "a", date: "2026-10-01", status: "PRESENT" },
        { studentId: "a", date: "2026-10-02", status: "ABSENT" },
        { studentId: "b", date: "2026-10-01", status: "PRESENT" },
      ]),
    ).toBe(1);
  });
});
