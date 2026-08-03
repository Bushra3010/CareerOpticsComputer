import {
  BookOpen,
  CalendarDays,
  CircleUserRound,
  ClipboardList,
  FileBadge,
  GraduationCap,
  LayoutDashboard,
  LifeBuoy,
  Megaphone,
  Receipt,
  ShieldCheck,
  Trophy,
} from "lucide-react";
import type { BottomNavItems, NavGroup } from "@/components/layout/nav-types";

/** Student portal navigation — PRD §5.4. */
export const STUDENT_NAV: NavGroup[] = [
  {
    items: [{ label: "Dashboard", href: "/student", icon: LayoutDashboard }],
  },
  {
    label: "My learning",
    items: [
      { label: "My course and batch", href: "/student/course", icon: BookOpen },
      { label: "Timetable", href: "/student/timetable", icon: CalendarDays },
      {
        label: "Attendance",
        href: "/student/attendance",
        icon: ClipboardList,
        matchPrefix: true,
      },
      { label: "Study materials", href: "/student/materials", icon: BookOpen },
    ],
  },
  {
    label: "Assessment",
    items: [
      {
        label: "Live and upcoming exams",
        href: "/student/exams",
        icon: GraduationCap,
        matchPrefix: true,
      },
      {
        label: "Results and performance",
        href: "/student/results",
        icon: Trophy,
        matchPrefix: true,
      },
      {
        label: "Certificates and ID card",
        href: "/student/certificates",
        icon: FileBadge,
        matchPrefix: true,
      },
    ],
  },
  {
    label: "Account",
    items: [
      {
        label: "Fees and receipts",
        href: "/student/fees",
        icon: Receipt,
        matchPrefix: true,
      },
      { label: "My profile", href: "/student/profile", icon: CircleUserRound },
      {
        label: "Announcements",
        href: "/student/announcements",
        icon: Megaphone,
      },
      {
        label: "Support",
        href: "/student/support",
        icon: LifeBuoy,
        matchPrefix: true,
      },
      {
        label: "Security and password",
        href: "/student/security",
        icon: ShieldCheck,
      },
    ],
  },
];

/**
 * Mobile bottom navigation — style guide §9.2 specifies exactly these five for
 * the Student portal: Home, Classes, Exams, Results, Profile.
 */
export const STUDENT_BOTTOM_NAV: BottomNavItems = [
  { label: "Home", href: "/student", icon: LayoutDashboard },
  { label: "Classes", href: "/student/timetable", icon: CalendarDays },
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
