import {
  Award,
  BarChart3,
  Building2,
  ClipboardCheck,
  GraduationCap,
  LayoutDashboard,
  LifeBuoy,
  MoreHorizontal,
  Settings,
  ShoppingCart,
  Users,
  Wallet,
} from "lucide-react";
import type { BottomNavItems, NavGroup } from "@/components/layout/nav-types";

/**
 * Platform / head-office navigation.
 *
 * Twelve flat destinations, following the owner's dashboard mockup rather than
 * the twenty-plus grouped tree in build plan §2.3. The mockup is the better
 * information architecture: §8.1 warns against more than two nested levels, and
 * a flat list of twelve is scannable in a way a grouped list of twenty-five is
 * not. The deeper routes still exist — they are reached from their section
 * landing page instead of from the sidebar.
 *
 * Labels are sentence case per §4.2, so "Exams and results" rather than the
 * mockup's "Exams & Results".
 */
export const ADMIN_NAV: NavGroup[] = [
  {
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
      {
        label: "Centre management",
        href: "/admin/centres",
        icon: Building2,
        permission: "centre.read",
        matchPrefix: true,
      },
      {
        label: "Centre approvals",
        href: "/admin/centre-applications",
        icon: ClipboardCheck,
        permission: "centre_application.read",
        matchPrefix: true,
      },
      {
        label: "Students",
        href: "/admin/students",
        icon: Users,
        permission: "student.read",
        matchPrefix: true,
      },
      {
        label: "Courses",
        href: "/admin/academics/courses",
        icon: GraduationCap,
        permission: "course.read",
        matchPrefix: true,
      },
      {
        label: "Exams and results",
        href: "/admin/exams",
        icon: ClipboardCheck,
        permission: "exam.read",
        matchPrefix: true,
      },
      {
        label: "Certificates",
        href: "/admin/certificates",
        icon: Award,
        permission: "certificate.read",
        matchPrefix: true,
      },
      {
        label: "Wallet and payments",
        href: "/admin/wallets",
        icon: Wallet,
        permission: "wallet.read",
        matchPrefix: true,
      },
      {
        label: "Shop and orders",
        href: "/admin/orders",
        icon: ShoppingCart,
        permission: "order.read",
        matchPrefix: true,
      },
      {
        label: "Support tickets",
        href: "/admin/tickets",
        icon: LifeBuoy,
        permission: "ticket.read",
        matchPrefix: true,
      },
      {
        label: "Reports",
        href: "/admin/reports",
        icon: BarChart3,
        permission: "report.read",
        matchPrefix: true,
      },
      {
        label: "Settings",
        href: "/admin/settings",
        icon: Settings,
        permission: "settings.read",
        matchPrefix: true,
      },
    ],
  },
];

/**
 * Mobile bottom navigation. Style guide §9.2 caps this at five and only names
 * the Centre and Student sets explicitly, so these five are chosen as the head
 * office's actual daily work: approvals are the job, everything else is review.
 */
export const ADMIN_BOTTOM_NAV: BottomNavItems = [
  { label: "Home", href: "/admin", icon: LayoutDashboard },
  {
    label: "Centres",
    href: "/admin/centres",
    icon: Building2,
    matchPrefix: true,
  },
  {
    label: "Approvals",
    href: "/admin/centre-applications",
    icon: ClipboardCheck,
    matchPrefix: true,
  },
  {
    label: "Students",
    href: "/admin/students",
    icon: Users,
    matchPrefix: true,
  },
  { label: "More", href: "/admin/more", icon: MoreHorizontal },
];
