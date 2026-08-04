import { BellRing, CalendarX, IndianRupee } from "lucide-react";
import type { ActivityItem } from "@/components/dashboard";
import type { CategoryBar } from "@/components/charts/category-bars";

/**
 * Synthetic content for the Student portal shell preview.
 *
 * Style guide §1.1: realistic synthetic data, never lorem ipsum. This student
 * is invented. The file lives under app/dev, which 404s in production.
 */

export const STUDENT = {
  name: "Rahul Kumar",
  firstName: "Rahul",
  registrationNumber: "CO-ARA-26-ADCA-00486",
  course: "ADCA",
  courseFull: "Advanced Diploma in Computer Applications",
  batch: "ADCA-25-02",
  centre: "Ara Centre",
};

/**
 * Weekly attendance. `null` is not zero — Saturday and Sunday have no scheduled
 * class, and charting them as 0% would read as two days of absence.
 */
export const WEEK_ATTENDANCE: CategoryBar[] = [
  { label: "Mon", sublabel: "26/5", value: 100, tone: "green" },
  { label: "Tue", sublabel: "27/5", value: 100, tone: "green" },
  { label: "Wed", sublabel: "28/5", value: 0, tone: "danger" },
  { label: "Thu", sublabel: "29/5", value: 100, tone: "green" },
  { label: "Fri", sublabel: "30/5", value: 100, tone: "green" },
  { label: "Sat", sublabel: "31/5", value: null },
  { label: "Sun", sublabel: "1/6", value: null },
];

export const SUBJECT_PROGRESS = [
  { subject: "Computer fundamentals", percent: 100, status: "Completed" },
  { subject: "MS Office", percent: 70, status: "In progress" },
  { subject: "Tally Prime", percent: 60, status: "In progress" },
  { subject: "Internet and email", percent: 40, status: "In progress" },
];

export const TODAYS_CLASSES = [
  {
    startTime: "09:00",
    endTime: "10:00",
    subject: "MS Office",
    room: "Room 2",
  },
  {
    startTime: "10:15",
    endTime: "11:15",
    subject: "Tally Prime",
    room: "Room 3",
  },
  {
    startTime: "11:30",
    endTime: "12:30",
    subject: "Computer fundamentals",
    room: "Room 1",
  },
];

export const UPCOMING_EXAMS = [
  {
    day: "12",
    month: "Jun",
    subject: "MS Office",
    time: "10:00 – 11:00",
    kind: "Theory",
  },
  {
    day: "20",
    month: "Jun",
    subject: "Tally Prime",
    time: "10:00 – 11:00",
    kind: "Practical",
  },
  {
    day: "28",
    month: "Jun",
    subject: "Computer fundamentals",
    time: "10:00 – 11:00",
    kind: "Theory",
  },
];

export const RECENT_RESULTS = [
  { subject: "Computer fundamentals", marks: 86, grade: "A", passed: true },
  { subject: "Internet and email", marks: 78, grade: "B+", passed: true },
  { subject: "Operating system", marks: 81, grade: "A", passed: true },
  { subject: "Digital literacy", marks: 74, grade: "B", passed: true },
];

export const STUDY_MATERIALS = [
  { title: "MS Office — notes (part 1)", size: "2.4 MB" },
  { title: "Tally Prime — practical guide", size: "3.1 MB" },
  { title: "Computer fundamentals — notes", size: "1.8 MB" },
  { title: "Internet and email — quick guide", size: "1.2 MB" },
];

export const FEE_SUMMARY = {
  totalRupees: 12000,
  paidRupees: 7500,
  balanceRupees: 4500,
};

export const NOTICES: ActivityItem[] = [
  {
    title: "Holiday notice",
    detail: "The centre is closed on Saturday 31 May 2026.",
    when: "2 days ago",
    icon: CalendarX,
    tone: "blue",
  },
  {
    title: "MS Office exam",
    detail: "Theory exam on 12 June. Revise all topics.",
    when: "3 days ago",
    icon: BellRing,
    tone: "blue",
  },
  {
    title: "Fee reminder",
    detail: "Please clear your pending fee before 15 June 2026.",
    when: "5 days ago",
    icon: IndianRupee,
    tone: "orange",
  },
];
