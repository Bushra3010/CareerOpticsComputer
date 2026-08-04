import {
  Award,
  BarChart3,
  Building2,
  CalendarCheck,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  LifeBuoy,
  MoreHorizontal,
  Receipt,
  Settings,
  UserPlus,
  Users,
  UsersRound,
  Wallet,
  Wallet2,
} from "lucide-react";
import type { BottomNavItems, NavGroup } from "@/components/layout/nav-types";

/**
 * Centre portal navigation — PRD §5.3, ordered to match the owner's dashboard
 * mockup.
 *
 * Flat rather than grouped, for the same reason as the admin sidebar: §8.1
 * warns against more than two nested levels, and a scannable flat list beats a
 * tree of collapsed groups when every destination is used daily. The deeper
 * routes (receipts, defaulters, corrections, timetable) are reached from their
 * section landing page.
 *
 * Labels are sentence case per §4.2, so "Fees and receipts" rather than the
 * mockup's "Fees & Receipts".
 */
export const CENTRE_NAV: NavGroup[] = [
  {
    items: [
      { label: "Dashboard", href: "/centre", icon: LayoutDashboard },
      {
        label: "Centre profile",
        href: "/centre/profile",
        icon: Building2,
        permission: "centre.read",
        matchPrefix: true,
      },
      {
        label: "Students",
        href: "/centre/students",
        icon: Users,
        permission: "student.read",
        matchPrefix: true,
      },
      {
        label: "New admission",
        href: "/centre/students/new",
        icon: UserPlus,
        permission: "student.create",
      },
      {
        label: "Attendance",
        href: "/centre/attendance",
        icon: CalendarCheck,
        permission: "attendance.read",
        matchPrefix: true,
      },
      {
        label: "Fees and receipts",
        href: "/centre/fees",
        icon: Receipt,
        permission: "fee_plan.read",
        matchPrefix: true,
      },
      {
        label: "Courses and batches",
        href: "/centre/batches",
        icon: ClipboardList,
        permission: "batch.read",
        matchPrefix: true,
      },
      {
        label: "Exams and results",
        href: "/centre/exams",
        icon: GraduationCap,
        permission: "exam.read",
        matchPrefix: true,
      },
      {
        label: "Certificates",
        href: "/centre/certificates",
        icon: Award,
        permission: "certificate.read",
        matchPrefix: true,
      },
      {
        label: "Staff",
        href: "/centre/staff",
        icon: UsersRound,
        permission: "user.read",
        matchPrefix: true,
      },
      {
        label: "Income and expense",
        href: "/centre/finance/expenses",
        icon: Wallet2,
        permission: "expense.read",
        matchPrefix: true,
      },
      {
        label: "Wallet",
        href: "/centre/wallet",
        icon: Wallet,
        permission: "wallet.read",
        matchPrefix: true,
      },
      {
        label: "Support",
        href: "/centre/support",
        icon: LifeBuoy,
        matchPrefix: true,
      },
      {
        label: "Reports",
        href: "/centre/reports",
        icon: BarChart3,
        permission: "report.read",
        matchPrefix: true,
      },
      {
        label: "Settings",
        href: "/centre/settings",
        icon: Settings,
        matchPrefix: true,
      },
    ],
  },
];

/**
 * Mobile bottom navigation — style guide §9.2 names these five explicitly for
 * the Centre portal: Home, Students, Attendance, Fees, More.
 */
export const CENTRE_BOTTOM_NAV: BottomNavItems = [
  { label: "Home", href: "/centre", icon: LayoutDashboard },
  {
    label: "Students",
    href: "/centre/students",
    icon: Users,
    matchPrefix: true,
  },
  {
    label: "Attendance",
    href: "/centre/attendance",
    icon: CalendarCheck,
    matchPrefix: true,
  },
  { label: "Fees", href: "/centre/fees", icon: Receipt, matchPrefix: true },
  { label: "More", href: "/centre/more", icon: MoreHorizontal },
];
