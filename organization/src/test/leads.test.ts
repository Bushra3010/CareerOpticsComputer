import { describe, it, expect } from "vitest";

import {
  followUpBucket,
  followUpQueue,
  leadProblem,
  leadSummary,
  monthlyEnquiries,
  admissionPipeline,
  pipeline as stagePipeline,
  sourceBreakdown,
} from "@/lib/leads";
import type { AdmissionLead } from "@/lib/supabase/data";

const NOW = new Date("2026-09-19T14:30:00");

const lead = (over: Partial<AdmissionLead> = {}): AdmissionLead => ({
  id: Math.random().toString(36).slice(2),
  branchId: "b1",
  studentName: "Rahul Kumar",
  parentName: "",
  phone: "9876543210",
  whatsapp: "9876543210",
  email: "",
  qualification: "",
  address: "",
  city: "",
  courseInterested: "ADCA",
  preferredBatch: "",
  source: "Walk-in",
  counsellor: "",
  expectedAdmissionAt: "",
  status: "New",
  remarks: "",
  followUpAt: "",
  followUpType: "",
  studentId: "",
  createdAt: "2026-09-10T09:00:00",
  ...over,
});

describe("followUpBucket", () => {
  // Compared as days: a call booked for 4pm today is due today, not overdue
  // because the morning has passed.
  it("calls a booking later today due today", () => {
    expect(followUpBucket("2026-09-19T16:00:00", NOW)).toBe("Today");
    expect(followUpBucket("2026-09-19T09:00:00", NOW)).toBe("Today");
  });

  it("separates overdue from upcoming", () => {
    expect(followUpBucket("2026-09-18T16:00:00", NOW)).toBe("Overdue");
    expect(followUpBucket("2026-09-20T09:00:00", NOW)).toBe("Upcoming");
  });

  it("says nothing is set rather than guessing", () => {
    expect(followUpBucket("", NOW)).toBe("None");
    expect(followUpBucket("whenever", NOW)).toBe("None");
  });
});

describe("pipeline", () => {
  it("gives every stage a column, even an empty one", () => {
    const board = admissionPipeline([lead({ status: "New" }), lead({ status: "Admission" })]);
    expect(board.map((c) => c.stage)).toEqual([
      "New", "Contacted", "Interested", "Counselling", "Demo Class", "Admission",
    ]);
    expect(board.find((c) => c.stage === "Interested")?.leads).toEqual([]);
  });

  // Lost leads are not a stage on the board; they would read as work in hand.
  it("keeps closed leads off the board", () => {
    const board = admissionPipeline([lead({ status: "Lost" }), lead({ status: "Not Interested" })]);
    expect(board.flatMap((c) => c.leads)).toEqual([]);
  });
});

/* The franchise register runs the same board over different stages, which is
   why `pipeline` is structural rather than tied to one lead type. */
describe("pipeline over any set of stages", () => {
  const stages = ["New Lead", "Site Visit", "Agreement", "Converted"] as const;

  it("groups a different lead shape by a different set of stages", () => {
    const board = stagePipeline(
      [
        { status: "Site Visit", directorName: "Raj" },
        { status: "Converted", directorName: "Priya" },
        { status: "Site Visit", directorName: "Amit" },
      ],
      stages,
    );
    expect(board.map((c) => c.stage)).toEqual([...stages]);
    expect(board[1].leads.map((l) => l.directorName)).toEqual(["Raj", "Amit"]);
    expect(board[2].leads).toEqual([]);
  });

  it("keeps a status outside the given stages off the board", () => {
    const board = stagePipeline([{ status: "Lost" }], stages);
    expect(board.flatMap((c) => c.leads)).toEqual([]);
  });
});

describe("sourceBreakdown", () => {
  it("ranks sources and works out the share", () => {
    const rows = sourceBreakdown([
      lead({ source: "Walk-in" }),
      lead({ source: "Walk-in" }),
      lead({ source: "Facebook" }),
      lead({ source: "Walk-in" }),
    ]);
    expect(rows[0]).toMatchObject({ source: "Walk-in", count: 3, percent: 75 });
    expect(rows[1]).toMatchObject({ source: "Facebook", count: 1, percent: 25 });
  });

  it("names leads with no source rather than dropping them", () => {
    const rows = sourceBreakdown([lead({ source: "" }), lead({ source: "  " })]);
    expect(rows).toEqual([{ source: "Not recorded", count: 2, percent: 100 }]);
  });

  // A percentage of nothing is nothing to show, not five bars at 0%.
  it("shows nothing at all when there are no leads", () => {
    expect(sourceBreakdown([])).toEqual([]);
  });
});

describe("monthlyEnquiries", () => {
  it("returns one bucket per month, oldest first", () => {
    const months = monthlyEnquiries([], 6, NOW);
    expect(months).toHaveLength(6);
    expect(months.at(-1)?.label).toMatch(/Sep/);
  });

  it("counts a lead into the month it was created", () => {
    const months = monthlyEnquiries(
      [
        lead({ createdAt: "2026-09-02T10:00:00" }),
        lead({ createdAt: "2026-09-18T10:00:00" }),
        lead({ createdAt: "2026-08-11T10:00:00" }),
      ],
      6,
      NOW,
    );
    expect(months.at(-1)?.count).toBe(2);
    expect(months.at(-2)?.count).toBe(1);
  });

  it("ignores a lead older than the window, and an unparseable date", () => {
    const months = monthlyEnquiries(
      [lead({ createdAt: "2019-01-01T10:00:00" }), lead({ createdAt: "nonsense" })],
      6,
      NOW,
    );
    expect(months.reduce((sum, m) => sum + m.count, 0)).toBe(0);
  });
});

describe("leadSummary", () => {
  it("counts the month, the stages and the closed ones", () => {
    const summary = leadSummary(
      [
        lead({ createdAt: "2026-09-02T10:00:00", status: "Counselling" }),
        lead({ createdAt: "2026-08-02T10:00:00", status: "Demo Class" }),
        lead({ createdAt: "2026-09-18T10:00:00", status: "Admission" }),
        // Dated out of the month on purpose, so `newThisMonth` is about the
        // two above it and not about however the factory happens to default.
        lead({ createdAt: "2026-07-01T10:00:00", status: "Lost" }),
        lead({ createdAt: "2026-07-02T10:00:00", status: "Not Interested" }),
      ],
      NOW,
    );
    expect(summary).toMatchObject({
      total: 5,
      newThisMonth: 2,
      counselling: 1,
      demo: 1,
      admissions: 1,
      lost: 2,
    });
  });

  // Overdue calls are due too — leaving them out is how they stay missed.
  it("counts overdue calls as due, not as past", () => {
    const summary = leadSummary(
      [
        lead({ followUpAt: "2026-09-18T10:00:00" }),
        lead({ followUpAt: "2026-09-19T16:00:00" }),
        lead({ followUpAt: "2026-09-25T10:00:00" }),
        lead({ followUpAt: "" }),
      ],
      NOW,
    );
    expect(summary.followUpsDue).toBe(2);
  });
});

describe("followUpQueue", () => {
  it("puts overdue before today, and orders each by the time it is due", () => {
    const queue = followUpQueue(
      [
        lead({ studentName: "Today late", followUpAt: "2026-09-19T17:00:00" }),
        lead({ studentName: "Tomorrow", followUpAt: "2026-09-20T09:00:00" }),
        lead({ studentName: "Overdue old", followUpAt: "2026-09-15T09:00:00" }),
        lead({ studentName: "Today early", followUpAt: "2026-09-19T09:00:00" }),
        lead({ studentName: "Overdue new", followUpAt: "2026-09-18T09:00:00" }),
      ],
      NOW,
    );
    expect(queue.map((l) => l.studentName)).toEqual([
      "Overdue old",
      "Overdue new",
      "Today early",
      "Today late",
    ]);
  });
});

describe("leadProblem", () => {
  it("passes a named lead with a real number", () => {
    expect(leadProblem({ studentName: "Rahul", phone: "+91 98765 43210" })).toBeNull();
  });

  it("names what is missing", () => {
    expect(leadProblem({ studentName: "  ", phone: "9876543210" })).toMatch(/name/i);
    expect(leadProblem({ studentName: "Rahul", phone: "98765" })).toMatch(/10 digits/i);
  });
});
