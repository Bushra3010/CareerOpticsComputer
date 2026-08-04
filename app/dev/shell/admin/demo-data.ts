import {
  Award,
  BadgeIndianRupee,
  Building2,
  CheckCircle2,
  FileText,
  GraduationCap,
  LifeBuoy,
  Megaphone,
  Wallet,
} from "lucide-react";
import type { TrendPoint } from "@/components/charts/trend-chart";

/**
 * Synthetic dashboard content for the shell preview.
 *
 * Style guide §1.1: "Use realistic synthetic data during development; never use
 * meaningless lorem ipsum." Names, districts and amounts are plausible for an
 * Indian computer-academy franchise and are invented — none are real people.
 *
 * This file exists only under app/dev, which 404s in production.
 */

export const DEMO_DATE = "Tuesday, 27 May 2026";

/** Compact Indian notation: 245000 → ₹2.45L, 18600000 → ₹1.86Cr. */
export function lakh(rupees: number): string {
  if (rupees >= 10000000)
    return `₹${(rupees / 10000000).toFixed(2).replace(/\.00$/, "")}Cr`;
  if (rupees >= 100000)
    return `₹${(rupees / 100000).toFixed(2).replace(/\.00$/, "")}L`;
  if (rupees >= 1000) return `₹${(rupees / 1000).toFixed(0)}K`;
  return `₹${rupees}`;
}

/* Centre growth: a rising total with daily new-centre bars. */
export const CENTRE_GROWTH: TrendPoint[] = [
  { label: "1 May", line: 79, bar: 2 },
  { label: "2 May", line: 81, bar: 2 },
  { label: "3 May", line: 83, bar: 2 },
  { label: "4 May", line: 84, bar: 1 },
  { label: "5 May", line: 87, bar: 3 },
  { label: "6 May", line: 89, bar: 2 },
  { label: "7 May", line: 90, bar: 1 },
  { label: "8 May", line: 93, bar: 3 },
  { label: "9 May", line: 97, bar: 4 },
  { label: "10 May", line: 99, bar: 2 },
  { label: "11 May", line: 100, bar: 1 },
  { label: "12 May", line: 102, bar: 2 },
  { label: "13 May", line: 105, bar: 3 },
  { label: "14 May", line: 106, bar: 1 },
  { label: "15 May", line: 108, bar: 2 },
  { label: "16 May", line: 111, bar: 3 },
  { label: "17 May", line: 112, bar: 1 },
  { label: "18 May", line: 114, bar: 2 },
  { label: "19 May", line: 116, bar: 2 },
  { label: "20 May", line: 117, bar: 1 },
  { label: "21 May", line: 119, bar: 2 },
  { label: "22 May", line: 120, bar: 1 },
  { label: "23 May", line: 122, bar: 2 },
  { label: "24 May", line: 123, bar: 1 },
  { label: "25 May", line: 125, bar: 2 },
  { label: "26 May", line: 126, bar: 1 },
  { label: "27 May", line: 128, bar: 2 },
];

/* Cumulative revenue in rupees. */
export const REVENUE: TrendPoint[] = [
  { label: "1 May", line: 120000 },
  { label: "3 May", line: 260000 },
  { label: "5 May", line: 385000 },
  { label: "7 May", line: 520000 },
  { label: "9 May", line: 660000 },
  { label: "11 May", line: 790000 },
  { label: "13 May", line: 905000 },
  { label: "15 May", line: 1040000 },
  { label: "17 May", line: 1165000 },
  { label: "19 May", line: 1290000 },
  { label: "21 May", line: 1400000 },
  { label: "23 May", line: 1530000 },
  { label: "25 May", line: 1680000 },
  { label: "27 May", line: 1860000 },
];

export const APPLICATIONS = [
  {
    centre: "Digital Future Academy",
    owner: "Amit Verma",
    district: "Lucknow",
  },
  { centre: "Bright Tech Institute", owner: "Neha Sharma", district: "Kanpur" },
  {
    centre: "Vision Computer Centre",
    owner: "Rohit Kumar",
    district: "Varanasi",
  },
  { centre: "NextGen Computer Hub", owner: "Pooja Singh", district: "Agra" },
  {
    centre: "Smart Learning Point",
    owner: "Suresh Yadav",
    district: "Prayagraj",
  },
];

export const TOP_CENTRES = [
  { name: "Career Optics Hazratganj", students: 1245, revenue: 245000 },
  { name: "Career Optics Alambagh", students: 1102, revenue: 210000 },
  { name: "Career Optics Indiranagar", students: 987, revenue: 186000 },
  { name: "Career Optics Gorakhpur", students: 876, revenue: 165000 },
  { name: "Career Optics Civil Lines", students: 765, revenue: 142000 },
];

export const APPROVALS = [
  { name: "Digital Future Academy", type: "Centre", appliedOn: "27 May 2026" },
  { name: "Bright Tech Institute", type: "Centre", appliedOn: "27 May 2026" },
  { name: "Neha Sharma", type: "Owner", appliedOn: "26 May 2026" },
  { name: "Vision Computer Centre", type: "Centre", appliedOn: "26 May 2026" },
  { name: "Rohit Kumar", type: "Owner", appliedOn: "25 May 2026" },
];

export const TRANSACTIONS = [
  {
    id: "TXN-260527-001",
    centre: "Career Optics Hazratganj",
    type: "Commission payout",
    amount: 24500,
    when: "27 May, 10:30",
  },
  {
    id: "TXN-260527-002",
    centre: "Digital Future Academy",
    type: "Wallet recharge",
    amount: 10000,
    when: "27 May, 09:45",
  },
  {
    id: "TXN-260526-011",
    centre: "Career Optics Alambagh",
    type: "Course purchase",
    amount: 6800,
    when: "26 May, 18:20",
  },
  {
    id: "TXN-260526-002",
    centre: "Bright Tech Institute",
    type: "Wallet recharge",
    amount: 5000,
    when: "26 May, 16:05",
  },
  {
    id: "TXN-260526-003",
    centre: "Career Optics Indiranagar",
    type: "Commission payout",
    amount: 18750,
    when: "26 May, 11:05",
  },
];

export const PLATFORM_SUMMARY = [
  { label: "Total courses", value: "256", icon: GraduationCap },
  { label: "Total exams", value: "845", icon: Award },
  { label: "Certificates issued", value: "5,842", icon: FileText },
  { label: "Support tickets", value: "132", icon: LifeBuoy },
];

export const ACTIVITY = [
  {
    title: "New centre application",
    detail: "Digital Future Academy applied",
    when: "27 May 2026, 10:15",
    icon: Building2,
    tone: "blue" as const,
  },
  {
    title: "Centre approved",
    detail: "Success World Computer Centre",
    when: "27 May 2026, 09:30",
    icon: CheckCircle2,
    tone: "green" as const,
  },
  {
    title: "Wallet recharged",
    detail: "Career Optics Alambagh",
    when: "27 May 2026, 09:00",
    icon: Wallet,
    tone: "orange" as const,
  },
  {
    title: "Commission paid",
    detail: "Career Optics Hazratganj",
    when: "27 May 2026, 08:45",
    icon: BadgeIndianRupee,
    tone: "blue" as const,
  },
  {
    title: "Notice published",
    detail: "New course discounts notice",
    when: "26 May 2026, 18:30",
    icon: Megaphone,
    tone: "blue" as const,
  },
];
