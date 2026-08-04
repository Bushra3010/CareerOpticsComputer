import {
  AlertCircle,
  Award,
  CheckCircle2,
  IndianRupee,
  UserPlus,
} from "lucide-react";
import type { TrendPoint } from "@/components/charts/trend-chart";
import type { ActivityItem } from "@/components/dashboard";

/**
 * Synthetic content for the Centre portal shell preview.
 *
 * Style guide §1.1: realistic synthetic data, never lorem ipsum. Names and
 * amounts are plausible for an Indian computer academy and are invented.
 * This file lives under app/dev, which 404s in production.
 */

export const CENTRE_NAME = "Ara Centre";
export const CENTRE_SUBTITLE = "Career Optics Computer Academy — Ara Centre";
export const DEMO_DATE = "Tuesday, 27 May 2026";

/** Daily present/absent counts across the month. */
export const ATTENDANCE: TrendPoint[] = [
  { label: "1 May", line: 48, bar: 352 },
  { label: "2 May", line: 61, bar: 339 },
  { label: "3 May", line: 44, bar: 356 },
  { label: "4 May", line: 52, bar: 348 },
  { label: "5 May", line: 39, bar: 361 },
  { label: "6 May", line: 66, bar: 334 },
  { label: "7 May", line: 41, bar: 359 },
  { label: "8 May", line: 55, bar: 345 },
  { label: "9 May", line: 37, bar: 363 },
  { label: "10 May", line: 72, bar: 328 },
  { label: "11 May", line: 46, bar: 354 },
  { label: "12 May", line: 58, bar: 342 },
  { label: "13 May", line: 43, bar: 357 },
  { label: "14 May", line: 51, bar: 349 },
  { label: "15 May", line: 35, bar: 365 },
  { label: "16 May", line: 63, bar: 337 },
  { label: "17 May", line: 47, bar: 353 },
  { label: "18 May", line: 54, bar: 346 },
  { label: "19 May", line: 40, bar: 360 },
  { label: "20 May", line: 68, bar: 332 },
  { label: "21 May", line: 45, bar: 355 },
  { label: "22 May", line: 57, bar: 343 },
  { label: "23 May", line: 42, bar: 358 },
  { label: "24 May", line: 50, bar: 350 },
  { label: "25 May", line: 38, bar: 362 },
  { label: "26 May", line: 64, bar: 336 },
  { label: "27 May", line: 74, bar: 412 },
];

/** Cumulative fee collection through the month, in rupees. */
export const COLLECTION: TrendPoint[] = [
  { label: "1 May", line: 18000 },
  { label: "4 May", line: 41000 },
  { label: "7 May", line: 62000 },
  { label: "10 May", line: 88000 },
  { label: "13 May", line: 112000 },
  { label: "16 May", line: 138000 },
  { label: "19 May", line: 176000 },
  { label: "22 May", line: 214000 },
  { label: "25 May", line: 251000 },
  { label: "27 May", line: 284000 },
];

export const TODAYS_CLASSES = [
  {
    startTime: "09:00",
    endTime: "10:00",
    course: "Basic computer",
    batch: "BC-25-01",
    room: "Room 1",
  },
  {
    startTime: "10:15",
    endTime: "11:15",
    course: "Tally Prime",
    batch: "TP-25-02",
    room: "Room 2",
  },
  {
    startTime: "11:30",
    endTime: "12:30",
    course: "MS Office",
    batch: "MSO-25-01",
    room: "Room 1",
  },
  {
    startTime: "14:00",
    endTime: "15:00",
    course: "Photoshop basics",
    batch: "PS-25-01",
    room: "Room 3",
  },
];

export const RECENT_ADMISSIONS = [
  {
    name: "Rahul Kumar",
    course: "Basic computer",
    batch: "BC-25-02",
    date: "26 May",
  },
  {
    name: "Priya Sharma",
    course: "Tally Prime",
    batch: "TP-25-03",
    date: "26 May",
  },
  {
    name: "Amit Verma",
    course: "Web designing",
    batch: "WD-25-01",
    date: "25 May",
  },
  {
    name: "Sneha Gupta",
    course: "MS Office",
    batch: "MSO-25-02",
    date: "25 May",
  },
  {
    name: "Vikash Singh",
    course: "Basic computer",
    batch: "BC-25-02",
    date: "24 May",
  },
];

/** `overdue` drives an icon and label, so urgency never rests on red alone. */
export const PENDING_FEES = [
  {
    name: "Ankit Raj",
    course: "Tally Prime",
    amount: 8500,
    dueDate: "20 May",
    overdue: true,
  },
  {
    name: "Neha Kumari",
    course: "Web designing",
    amount: 6000,
    dueDate: "21 May",
    overdue: true,
  },
  {
    name: "Suresh Yadav",
    course: "Basic computer",
    amount: 5000,
    dueDate: "22 May",
    overdue: true,
  },
  {
    name: "Pooja Singh",
    course: "MS Office",
    amount: 4500,
    dueDate: "23 May",
    overdue: true,
  },
  {
    name: "Rohit Kumar",
    course: "Photoshop",
    amount: 4000,
    dueDate: "31 May",
    overdue: false,
  },
];

export const ACTIVITY: ActivityItem[] = [
  {
    title: "New admission",
    detail: "Rahul Kumar admitted to Basic computer",
    when: "26 May 2026, 10:30",
    icon: UserPlus,
    tone: "blue",
  },
  {
    title: "Attendance marked",
    detail: "BC-25-01 marked for 26 May",
    when: "26 May 2026, 10:00",
    icon: CheckCircle2,
    tone: "green",
  },
  {
    title: "Fee collected",
    detail: "₹5,500 from Priya Sharma",
    when: "26 May 2026, 09:45",
    icon: IndianRupee,
    tone: "green",
  },
  {
    title: "Fee overdue",
    detail: "Ankit Raj — ₹8,500 outstanding",
    when: "26 May 2026, 09:30",
    icon: AlertCircle,
    tone: "danger",
  },
  {
    title: "Certificate issued",
    detail: "Issued to Amit Verma",
    when: "25 May 2026, 16:15",
    icon: Award,
    tone: "blue",
  },
];
