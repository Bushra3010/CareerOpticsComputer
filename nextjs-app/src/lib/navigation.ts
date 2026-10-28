import {
  Users,
  Building2,
  MessageSquare,
  BookOpen,
  GraduationCap,
  CreditCard,
  ClipboardList,
  Monitor,
  Video,
  IdCard,
  Award,
  Settings,
  UserPlus,
  Package,
  Wallet,
  Bell,
  Globe,
  School,
  Calendar,
  Clock,
  ListChecks,
  Receipt,
  FileText,
  PenTool,
  LayoutTemplate,
  Printer,
  Play,
  FileCheck,
  Handshake,
  ArrowRightLeft,
  PiggyBank,
  TrendingUp,
  TrendingDown,
  Camera,
  FileBarChart,
  History,
  Shield,
  KeyRound,
  UserCog,
  Plus,
  CalendarCheck,
  IndianRupee,
  User,
} from "lucide-react";
import { VIEWS, type View } from "@/lib/roles";

export interface MenuItem {
  title: string;
  icon: React.ComponentType<any>;
  items: {
    title: string;
    url: string;
    icon?: React.ComponentType<any>;
  }[];
}

/** The full module catalogue. The admin view sees all of it; the other views
 *  are subsets of it (see `scope` below) or, for students, their own menu. */
export const menuItems: MenuItem[] = [
  {
    title: "Reception",
    icon: Users,
    items: [
      { title: "Visitors & Enquiries", url: "/reception/enquiry", icon: UserPlus },
      { title: "Item Movement", url: "/reception/dispatch", icon: Package },
    ],
  },
  {
    title: "Branch Management",
    icon: Building2,
    items: [
      { title: "Create Branch", url: "/branch/create", icon: Building2 },
      { title: "View Branch", url: "/branch/view", icon: Building2 },
      { title: "Wallet Recharge", url: "/branch/wallet", icon: Wallet },
      { title: "Branch Transactions", url: "/branch/transactions", icon: Receipt },
      { title: "Notice Board", url: "/branch/notice-board", icon: Bell },
      { title: "Website Settings", url: "/branch/website-settings", icon: Globe },
    ],
  },
  {
    title: "Enquiry Management",
    icon: MessageSquare,
    items: [
      { title: "Branch Enquiry", url: "/enquiry/branch", icon: MessageSquare },
      { title: "Online Branch Enquiry", url: "/enquiry/online-branch", icon: Globe },
      { title: "Online Student Enquiry", url: "/enquiry/online-student", icon: GraduationCap },
    ],
  },
  {
    title: "Course Management",
    icon: BookOpen,
    items: [
      { title: "Create Course", url: "/course/create", icon: BookOpen },
      { title: "View Course", url: "/course/view", icon: BookOpen },
      { title: "Create Batch", url: "/course/batch/create", icon: School },
      { title: "Batch Timing", url: "/course/batch/timing", icon: Clock },
      { title: "Assign Course to Batch", url: "/course/batch/assign", icon: ListChecks },
    ],
  },
  {
    title: "Student Management",
    icon: GraduationCap,
    items: [
      { title: "Admission Form", url: "/student/admission-form", icon: FileText },
      { title: "View Students", url: "/student/view", icon: Users },
      { title: "Online Admission List", url: "/student/online-admissions", icon: Globe },
    ],
  },
  {
    title: "Fee Management",
    icon: CreditCard,
    items: [
      { title: "Fee Types", url: "/fee/types", icon: FileText },
      { title: "Fee Groups", url: "/fee/groups", icon: ListChecks },
      { title: "Fee Allocation", url: "/fee/allocation", icon: Calendar },
      { title: "Fee Collection", url: "/fee/collection", icon: Receipt },
      { title: "Due Fee Collection", url: "/fee/due-collection", icon: CreditCard },
    ],
  },
  {
    title: "Exam & Marks",
    icon: ClipboardList,
    items: [
      { title: "Assessments & Results", url: "/exam/marks-list", icon: FileCheck },
    ],
  },
  {
    title: "Online Exam",
    icon: Monitor,
    items: [
      { title: "Create Exam", url: "/online-exam/create", icon: PenTool },
      { title: "Question Paper Builder", url: "/online-exam/question-paper-builder", icon: FileText },
      { title: "Add Questions", url: "/online-exam/add-questions", icon: ListChecks },
      { title: "Online Exam Marks", url: "/online-exam/marks", icon: FileCheck },
    ],
  },
  {
    title: "Live Class",
    icon: Video,
    items: [
      { title: "View Live Classes", url: "/live-class/view", icon: Play },
      { title: "Live Class Setup", url: "/live-class/setup", icon: Settings },
    ],
  },
  {
    title: "ID & Admit Card",
    icon: IdCard,
    items: [
      { title: "ID Card Template", url: "/cards/id-template", icon: LayoutTemplate },
      { title: "Generate ID Cards", url: "/cards/generate-id", icon: Printer },
      { title: "Admit Card Template", url: "/cards/admit-template", icon: LayoutTemplate },
      { title: "Generate Admit Cards", url: "/cards/generate-admit", icon: Printer },
    ],
  },
  {
    title: "Certificate & Marksheet",
    icon: Award,
    items: [
      { title: "Student Documents", url: "/certificate/generate", icon: Printer },
    ],
  },
  {
    title: "System Settings",
    icon: Settings,
    items: [
      { title: "General Settings", url: "/settings/general", icon: Settings },
      { title: "Payment Gateway", url: "/settings/payment-gateway", icon: CreditCard },
      { title: "Payment QR Code", url: "/settings/payment-qr", icon: FileText },
      { title: "Batch Payment QR", url: "/settings/batch-qr", icon: FileText },
    ],
  },
  {
    title: "Partner Management",
    icon: Handshake,
    items: [
      { title: "Add Partner", url: "/partners/add", icon: UserPlus },
      { title: "All Partners", url: "/partners/all", icon: Users },
      { title: "Partner Transactions", url: "/partners/transactions", icon: ArrowRightLeft },
    ],
  },
  {
    title: "Expense Management",
    icon: PiggyBank,
    items: [
      { title: "Voucher Head", url: "/expense/voucher-head", icon: FileText },
      { title: "All Voucher Heads", url: "/expense/voucher-heads", icon: ListChecks },
      { title: "Deposit Voucher", url: "/expense/deposit-voucher", icon: TrendingUp },
      { title: "Expense Voucher", url: "/expense/expense-voucher", icon: TrendingDown },
    ],
  },
  {
    title: "Attendance Management",
    icon: Camera,
    items: [
      { title: "Mark Attendance", url: "/attendance/mark", icon: Camera },
      { title: "Attendance Report", url: "/attendance/report", icon: FileBarChart },
      { title: "Attendance Logs", url: "/attendance/logs", icon: History },
    ],
  },
  {
    title: "User Management",
    icon: Shield,
    items: [
      { title: "All Users", url: "/user/all", icon: Users },
      { title: "User Roles", url: "/user/roles", icon: UserCog },
      { title: "Access Control", url: "/user/access-control", icon: KeyRound },
    ],
  },
  {
    title: "Session Year",
    icon: Calendar,
    items: [
      { title: "Add Session Year", url: "/session/add", icon: Plus },
      { title: "All Session Years", url: "/session/all", icon: ListChecks },
    ],
  },
];

/**
 * Narrow one catalogue group to the pages a view is authorised for. Anything
 * not listed simply never renders, so a franchise cannot even see the entry
 * point to an organisation-level screen.
 */
function scope(title: string, urls: string[], rename?: string): MenuItem[] {
  const group = menuItems.find((item) => item.title === title);
  if (!group) return [];
  const items = group.items.filter((item) => urls.includes(item.url));
  return items.length ? [{ ...group, title: rename ?? group.title, items }] : [];
}

/**
 * A franchise runs one branch. It admits and teaches students and collects
 * their fees, but the organisation owns the catalogue, the templates, the
 * partner network, the user accounts and the session calendar.
 */
const franchiseMenu: MenuItem[] = [
  ...scope("Reception", ["/reception/enquiry", "/reception/dispatch"]),
  ...scope("Enquiry Management", ["/enquiry/branch", "/enquiry/online-student"]),
  ...scope("Student Management", [
    "/student/admission-form",
    "/student/view",
    "/student/online-admissions",
  ]),
  ...scope("Course Management", [
    "/course/view",
    "/course/batch/create",
    "/course/batch/timing",
    "/course/batch/assign",
  ], "Courses & Batches"),
  ...scope("Fee Management", ["/fee/collection", "/fee/due-collection"]),
  ...scope("Attendance Management", [
    "/attendance/mark",
    "/attendance/report",
    "/attendance/logs",
  ]),
  ...scope("Exam & Marks", ["/exam/marks-list"]),
  ...scope("Live Class", ["/live-class/view"]),
  ...scope("ID & Admit Card", ["/cards/generate-id", "/cards/generate-admit"]),
  ...scope("Certificate & Marksheet", ["/certificate/generate"]),
  ...scope("Branch Management", [
    "/branch/wallet",
    "/branch/transactions",
    "/branch/notice-board",
    "/branch/website-settings",
  ], "My Branch"),
  ...scope("Expense Management", [
    "/expense/deposit-voucher",
    "/expense/expense-voucher",
  ]),
];

/** A student only ever sees their own record — every page here is self-service. */
const studentMenu: MenuItem[] = [
  {
    title: "Learning",
    icon: GraduationCap,
    items: [
      { title: "Live Classes", url: "/me/classes", icon: Video },
      { title: "My Attendance", url: "/me/attendance", icon: CalendarCheck },
    ],
  },
  {
    title: "Assessments",
    icon: ClipboardList,
    items: [{ title: "Results & Marksheets", url: "/me/results", icon: FileCheck }],
  },
  {
    title: "Fees",
    icon: CreditCard,
    items: [{ title: "Fees & Receipts", url: "/me/fees", icon: IndianRupee }],
  },
  {
    title: "Documents",
    icon: IdCard,
    items: [{ title: "ID & Admit Card", url: "/me/documents", icon: Printer }],
  },
  {
    title: "Account",
    icon: User,
    items: [{ title: "My Profile", url: "/me/profile", icon: User }],
  },
];

const MENUS: Record<View, MenuItem[]> = {
  admin: menuItems,
  franchise: franchiseMenu,
  student: studentMenu,
};

export const menuForView = (view: View): MenuItem[] => MENUS[view];

/**
 * Routes a view may open that its sidebar does not list — sibling URLs of a
 * page it already has (the reception, admissions and assessments workspaces
 * each answer to several paths) plus the view's landing page.
 */
const EXTRA_PATHS: Record<View, string[]> = {
  admin: ["/"],
  franchise: [
    "/",
    "/reception/visitors",
    "/reception/receive",
    "/student/add",
    "/exam/create",
    "/exam/schedule",
    "/exam/assign-marks",
    "/exam/grade-management",
    "/certificate/template",
    "/marksheet/template",
    "/marksheet/generate",
  ],
  // "/" is allowed so a student who lands on the root is redirected to their
  // own dashboard rather than told they are not authorised for it.
  student: ["/", "/me"],
};

const ALLOWED: Record<View, Set<string>> = {
  admin: new Set(),
  franchise: new Set(),
  student: new Set(),
};
(Object.keys(MENUS) as View[]).forEach((view) => {
  MENUS[view].forEach((group) =>
    group.items.forEach((item) => ALLOWED[view].add(item.url)),
  );
  EXTRA_PATHS[view].forEach((path) => ALLOWED[view].add(path));
});

/**
 * The admin view is authorised for the whole ERP but not for the student
 * portal — those pages read one student's own record, and an administrator
 * has the staff-side equivalent of every one of them.
 */
export function canAccess(view: View, pathname: string): boolean {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  if (view === "admin") return !path.startsWith("/me");
  return ALLOWED[view].has(path);
}

export const homeFor = (view: View) => VIEWS[view].home;
