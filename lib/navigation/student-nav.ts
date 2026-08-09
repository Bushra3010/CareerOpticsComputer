import {
  Award,
  BellRing,
  BookOpen,
  CalendarDays,
  CircleUserRound,
  ClipboardList,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LifeBuoy,
  Receipt,
  Trophy,
} from "lucide-react";
import type { BottomNavItems, NavGroup } from "@/components/layout/nav-types";

/**
 * Student portal navigation — PRD §5.4, ordered to match the owner's mockup.
 *
 * Flat for the same reason as the other two portals: §8.1 warns against more
 * than two nested levels, and twelve scannable destinations beat a tree.
 * Labels are sentence case per §4.2.
 */
export const STUDENT_NAV: NavGroup[] = [
  {
    items: [
      { label: "Dashboard", href: "/student", icon: LayoutDashboard },
      { label: "My profile", href: "/student/profile", icon: CircleUserRound },
      { label: "My course", href: "/student/course", icon: BookOpen },
      {
        label: "Attendance",
        href: "/student/attendance",
        icon: ClipboardList,
        matchPrefix: true,
      },
      {
        label: "Class schedule",
        href: "/student/timetable",
        icon: CalendarDays,
        planned: true,
      },
      {
        label: "Study materials",
        href: "/student/materials",
        icon: FileText,
        matchPrefix: true,
        planned: true,
      },
      {
        label: "Online exams",
        href: "/student/exams",
        icon: GraduationCap,
        matchPrefix: true,
      },
      {
        label: "Results",
        href: "/student/results",
        icon: Trophy,
        matchPrefix: true,
      },
      {
        label: "Fees and receipts",
        href: "/student/fees",
        icon: Receipt,
        matchPrefix: true,
      },
      {
        label: "Certificates",
        href: "/student/certificates",
        icon: Award,
        matchPrefix: true,
      },
      {
        label: "Notices",
        href: "/student/announcements",
        icon: BellRing,
        matchPrefix: true,
      },
      {
        label: "Support",
        href: "/student/support",
        icon: LifeBuoy,
        matchPrefix: true,
      },
    ],
  },
];

/**
 * Mobile bottom navigation — style guide §9.2 names these five explicitly for
 * the Student portal: Home, Classes, Exams, Results, Profile.
 */
export const STUDENT_BOTTOM_NAV: BottomNavItems = [
  { label: "Home", href: "/student", icon: LayoutDashboard },
  {
    label: "Classes",
    href: "/student/timetable",
    icon: CalendarDays,
    planned: true,
  },
  {
    label: "Exams",
    href: "/student/exams",
    icon: GraduationCap,
    matchPrefix: true,
  },
  {
    label: "Results",
    href: "/student/results",
    icon: Trophy,
    matchPrefix: true,
  },
  { label: "Profile", href: "/student/profile", icon: CircleUserRound },
];
