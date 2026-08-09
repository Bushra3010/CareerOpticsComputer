import {
  Banknote,
  BarChart3,
  Building2,
  CalendarCheck,
  ClipboardList,
  FileBadge,
  GraduationCap,
  LayoutDashboard,
  LifeBuoy,
  Megaphone,
  MoreHorizontal,
  Package,
  Receipt,
  Settings,
  Share2,
  ShoppingBag,
  Trophy,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import type { BottomNavItems, NavGroup } from "@/components/layout/nav-types";

/**
 * Centre portal navigation — PRD §5.3, with permission codes from the build
 * plan's role matrix (docs/00-build-plan.md §4).
 *
 * Items are filtered by permission at render time in Phase 1; the codes are
 * declared here now so the route map and the permission registry stay in step.
 */
export const CENTRE_NAV: NavGroup[] = [
  {
    items: [{ label: "Dashboard", href: "/centre", icon: LayoutDashboard }],
  },
  {
    label: "Admissions",
    items: [
      {
        label: "Leads",
        href: "/centre/leads",
        planned: true,
        icon: ClipboardList,
        permission: "lead.read",
        matchPrefix: true,
      },
      {
        label: "New student",
        href: "/centre/students/new",
        icon: UserPlus,
        permission: "student.create",
      },
      {
        label: "Students",
        href: "/centre/students",
        icon: Users,
        permission: "student.read",
        matchPrefix: true,
      },
    ],
  },
  {
    label: "Academics",
    items: [
      {
        label: "Batches and timetable",
        href: "/centre/batches",
        planned: true,
        icon: CalendarCheck,
        permission: "batch.read",
        matchPrefix: true,
      },
      {
        label: "Attendance",
        href: "/centre/attendance",
        icon: ClipboardList,
        permission: "attendance.read",
        matchPrefix: true,
      },
      {
        label: "Exams",
        href: "/centre/exams",
        icon: GraduationCap,
        permission: "exam.read",
        matchPrefix: true,
      },
      {
        label: "Results and performance",
        href: "/centre/results",
        icon: Trophy,
        permission: "result.read",
        matchPrefix: true,
      },
      {
        label: "Certificates and ID cards",
        href: "/centre/certificates",

        icon: FileBadge,
        permission: "certificate.read",
        matchPrefix: true,
      },
    ],
  },
  {
    label: "Money",
    items: [
      {
        label: "Fee management",
        href: "/centre/fees",
        icon: Receipt,
        permission: "fee.read",
        matchPrefix: true,
      },
      {
        label: "Wallet and recharge",
        href: "/centre/wallet",
        icon: Wallet,
        permission: "wallet.read",
        matchPrefix: true,
      },
      {
        label: "Income and expenses",
        href: "/centre/finance/expenses",
        planned: true,
        icon: Banknote,
        permission: "expense.read",
      },
      {
        label: "Referrals",
        href: "/centre/referrals",
        icon: Share2,
        permission: "referral.read",
      },
    ],
  },
  {
    label: "Supplies",
    items: [
      {
        label: "Shop",
        href: "/centre/shop",
        icon: ShoppingBag,
        permission: "product.read",
        matchPrefix: true,
      },
      {
        label: "My orders",
        href: "/centre/orders",
        icon: Package,
        permission: "order.read",
        matchPrefix: true,
      },
    ],
  },
  {
    label: "Centre",
    items: [
      {
        label: "Centre profile",
        href: "/centre/profile",

        icon: Building2,
        permission: "centre.read",
        matchPrefix: true,
      },
      {
        label: "Staff",
        href: "/centre/staff",
        icon: Users,
        permission: "staff.read",
        matchPrefix: true,
      },
      {
        label: "Announcements",
        href: "/centre/announcements",
        icon: Megaphone,
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
        planned: true,
        icon: BarChart3,
        permission: "report.read",
        matchPrefix: true,
      },
      {
        label: "Settings",
        href: "/centre/settings",
        icon: Settings,
        planned: true,
      },
    ],
  },
];

/**
 * Mobile bottom navigation — style guide §9.2 specifies exactly these five for
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
  { label: "More", href: "/centre/more", icon: MoreHorizontal, planned: true },
];
