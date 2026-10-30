import {
  ClipboardCheck,
  QrCode,
  Code2,
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
import type { Permissions } from "@/lib/permissions";

export interface MenuItem {
  title: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  items: {
    title: string;
    url: string;
    icon?: React.ComponentType<{ className?: string }>;
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
      { title: "Branch Leads", url: "/branch/leads", icon: Building2 },
      { title: "View Branch", url: "/branch/view", icon: Building2 },
      { title: "Wallet Recharge", url: "/branch/wallet", icon: Wallet },
      { title: "Centre Charges", url: "/branch/charges", icon: Wallet },
      { title: "Branch Transactions", url: "/branch/transactions", icon: Receipt },
      { title: "Notice Board", url: "/branch/notice-board", icon: Bell },
      { title: "Website Settings", url: "/branch/website-settings", icon: Globe },
      { title: "Website View", url: "/branch/website-view", icon: Globe },
    ],
  },
  {
    title: "Enquiry Management",
    icon: MessageSquare,
    items: [
      { title: "Branch Enquiry", url: "/enquiry/branch", icon: MessageSquare },
      { title: "Admission Leads", url: "/enquiry/admission-leads", icon: MessageSquare },
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
      { title: "Assign Students", url: "/course/batch/assign-students", icon: ListChecks },
      { title: "Course Syllabus", url: "/course/syllabus", icon: BookOpen },
      { title: "Course Subjects", url: "/course/subjects", icon: ListChecks },
    ],
  },
  {
    title: "Student Management",
    icon: GraduationCap,
    items: [
      { title: "Admission Form", url: "/student/admission-form", icon: FileText },
      { title: "View Students", url: "/student/view", icon: Users },
      { title: "Online Admission List", url: "/student/online-admissions", icon: Globe },
      { title: "Passout Students", url: "/student/passout", icon: GraduationCap },
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
    // In the order the work happens; the guide at the top walks a new office
    // or centre through it.
    items: [
      { title: "How Exams Work", url: "/exam/guide", icon: BookOpen },
      { title: "Exam Centres", url: "/exam/centres", icon: School },
      { title: "Exam Schedule", url: "/exam/schedule", icon: Calendar },
      { title: "Admit Cards", url: "/exam/admit-cards", icon: IdCard },
      { title: "Results & Marksheets", url: "/exam/results", icon: FileCheck },
      { title: "Class Tests", url: "/exam/marks-list", icon: ListChecks },
    ],
  },
  {
    title: "Online Exam",
    icon: Monitor,
    items: [
      { title: "Exams", url: "/online-exam/create", icon: PenTool },
      { title: "Assign Exam", url: "/online-exam/assign", icon: ListChecks },
      { title: "Student Exams", url: "/online-exam/marks", icon: FileCheck },
      { title: "Question Bank", url: "/online-exam/add-questions", icon: ListChecks },
      { title: "Question Paper Builder", url: "/online-exam/question-paper-builder", icon: FileText },
    ],
  },
  {
    title: "Live Class",
    icon: Video,
    items: [
      { title: "View Live Classes", url: "/live-class/view", icon: Play },
      { title: "Live Class Setup", url: "/live-class/setup", icon: Settings },
      { title: "Code Lab", url: "/tools/code-lab", icon: Code2 },
      { title: "Whiteboard", url: "/tools/whiteboard", icon: PenTool },
    ],
  },
  {
    title: "Certificate & Marksheet",
    icon: Award,
    // Issuing first, designing second: the pages used every day sit above the
    // ones set up once. Admit cards are issued under Exam & Marks.
    items: [
      { title: "Certificates", url: "/certificate/issue", icon: Award },
      // The head office's queue of centres' certificates and marksheets.
      { title: "Print Approvals", url: "/certificate/approvals", icon: ClipboardCheck },
      { title: "Centre Certificate", url: "/certificate/centre", icon: Award },
      { title: "Document Designer", url: "/documents/designer", icon: LayoutTemplate },
      { title: "Certificate Format", url: "/certificate/template", icon: LayoutTemplate },
      { title: "Marksheet Format", url: "/marksheet/template", icon: LayoutTemplate },
      { title: "Generate ID Cards", url: "/cards/generate-id", icon: IdCard },
      // The older class-test documents, kept for records made before the
      // Results & Marksheets flow.
      { title: "Student Documents", url: "/certificate/generate", icon: Printer },
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
      // The centre's screen students scan to mark themselves present.
      { title: "QR Attendance", url: "/attendance/qr", icon: QrCode },
      { title: "Attendance Report", url: "/attendance/report", icon: FileBarChart },
      { title: "Attendance Logs", url: "/attendance/logs", icon: History },
      { title: "Holiday Apply", url: "/attendance/holiday-apply", icon: CalendarCheck },
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
  {
    // The organisation's public website at the site root, not a branch's
    // mini-site (that is "Website Settings" under Branch Management).
    title: "Main Website",
    icon: Globe,
    items: [{ title: "Website Content", url: "/website/content", icon: LayoutTemplate }],
  },
  {
    // The centre panel, laid out like the classic franchise panel (see
    // lib/classicMenu.ts for the sidebar it becomes).
    title: "Centre Panel",
    icon: Building2,
    items: [
      { title: "Student Enquiry", url: "/centre/enquiry", icon: MessageSquare },
      { title: "All Students", url: "/centre/students", icon: Users },
      { title: "Add New Student", url: "/centre/student-add", icon: UserPlus },
      { title: "Admission Forms", url: "/centre/admission-forms", icon: Globe },
      { title: "Sample Certificate", url: "/centre/sample-certificates", icon: Award },
      { title: "Downloads", url: "/centre/downloads", icon: FileText },
      { title: "Question Bank", url: "/centre/questions", icon: ListChecks },
      { title: "Exams", url: "/centre/exams", icon: ClipboardList },
      { title: "Batch", url: "/centre/batches", icon: School },
      { title: "Attendance", url: "/centre/attendance", icon: CalendarCheck },
      { title: "Order Certificates", url: "/centre/orders", icon: Printer },
      { title: "Awards", url: "/centre/awards", icon: Award },
      { title: "Wallet History", url: "/centre/wallet", icon: Wallet },
      { title: "Help & Support", url: "/centre/tickets", icon: MessageSquare },
      { title: "Expanses", url: "/centre/expenses", icon: TrendingDown },
      { title: "Marketing Expanses", url: "/centre/marketing-expenses", icon: TrendingUp },
      { title: "My Profile", url: "/centre/profile", icon: User },
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
  ...scope("Centre Panel", [
    "/centre/enquiry",
    "/centre/students",
    "/centre/student-add",
    "/centre/admission-forms",
    "/centre/sample-certificates",
    "/centre/downloads",
    "/centre/questions",
    "/centre/exams",
    "/centre/batches",
    "/centre/attendance",
    "/centre/orders",
    "/centre/awards",
    "/centre/wallet",
    "/centre/tickets",
    "/centre/expenses",
    "/centre/marketing-expenses",
    "/centre/profile",
  ]),
  ...scope("Reception", ["/reception/enquiry", "/reception/dispatch"]),
  ...scope("Enquiry Management", [
    "/enquiry/branch",
    "/enquiry/admission-leads",
    "/enquiry/online-student",
  ]),
  ...scope("Student Management", [
    "/student/admission-form",
    "/student/view",
    "/student/online-admissions",
    "/student/passout",
  ]),
  ...scope("Course Management", [
    "/course/view",
    "/course/batch/create",
    "/course/batch/timing",
    "/course/batch/assign",
    "/course/batch/assign-students",
    "/course/syllabus",
    "/course/subjects",
  ], "Courses & Batches"),
  ...scope("Fee Management", ["/fee/collection", "/fee/due-collection"]),
  ...scope("Attendance Management", [
    "/attendance/mark",
    "/attendance/qr",
    "/attendance/report",
    "/attendance/logs",
  ]),
  ...scope("Exam & Marks", ["/exam/guide", "/exam/schedule", "/exam/admit-cards", "/exam/results", "/exam/marks-list"]),
  // A centre sees the exams the head office gave it, puts its own students
  // on them and reads their results; the exams themselves are set upstairs.
  ...scope("Online Exam", ["/online-exam/create", "/online-exam/assign", "/online-exam/marks"]),
  ...scope("Live Class", ["/live-class/view", "/live-class/setup", "/tools/code-lab", "/tools/whiteboard"]),
  ...scope("Certificate & Marksheet", [
    "/certificate/issue",
    "/certificate/centre",
    "/cards/generate-id",
    "/certificate/generate",
  ]),
  ...scope("Branch Management", [
    "/branch/wallet",
    "/branch/charges",
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
      { title: "My Courses", url: "/me/courses", icon: BookOpen },
      { title: "Live Classes", url: "/me/classes", icon: Video },
      { title: "Code Lab", url: "/tools/code-lab", icon: Code2 },
      { title: "Whiteboard", url: "/tools/whiteboard", icon: PenTool },
      { title: "My Attendance", url: "/me/attendance", icon: CalendarCheck },
    ],
  },
  {
    title: "Assessments",
    icon: ClipboardList,
    items: [
      { title: "Results & Marksheets", url: "/me/results", icon: FileCheck },
      { title: "Online Exams", url: "/me/exams", icon: Monitor },
    ],
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

/** A view's landing page, which every role of it keeps. */
const LANDING: Record<View, string[]> = {
  admin: ["/"],
  franchise: ["/"],
  // "/" is allowed so a student who lands on the root is redirected to their
  // own dashboard rather than told they are not authorised for it.
  student: ["/", "/me"],
};

/**
 * Routes a view may open that its sidebar does not list, each mapped to the
 * menu page it belongs to: `/student/add` is what Admission Form's New
 * admission button opens, `/exam/create` a tab of Exam Schedule. A role gets
 * one of these only when its page was ticked, and keeps that page's actions
 * on it -- so no URL opens more than the Super Admin granted.
 */
const SHARED_SIBLINGS: Record<string, string | string[]> = {
  "/reception/visitors": "/reception/enquiry",
  "/reception/receive": "/reception/dispatch",
  // New admission, and Edit on View Students: either page's tick opens it.
  "/student/add": ["/student/admission-form", "/student/view"],
  "/exam/create": "/exam/schedule",
  "/exam/assign-marks": "/exam/results",
  "/exam/grade-management": "/exam/results",
  "/marksheet/generate": "/exam/results",
  // Pages the centre panel opens from its lists.
  "/centre/student-payments": "/centre/students",
  "/centre/exam-create": "/centre/exams",
  "/centre/batch-students": "/centre/batches",
};
const SIBLINGS: Record<View, Record<string, string | string[]>> = {
  admin: {
    ...SHARED_SIBLINGS,
    "/cards/id-template": "/cards/generate-id",
    "/cards/admit-template": "/exam/admit-cards",
    // The older admit card page now opens the Admit Cards page.
    "/cards/generate-admit": "/exam/admit-cards",
  },
  franchise: {
    ...SHARED_SIBLINGS,
    // The organisation's formats, which a branch opens from Student Documents.
    "/certificate/template": "/certificate/generate",
    "/marksheet/template": "/certificate/generate",
    "/documents/designer": "/certificate/generate",
  },
  student: {},
};

const normalise = (pathname: string) => (pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname);

/**
 * The menu page a nested path belongs to: `/me/exams/<id>` (the exam room)
 * is a page of `/me/exams`. Only one level, and only when that page is in
 * the view's menu, so no URL reaches a page by looking like one.
 */
const parentMenuPath = (view: View, path: string): string | null => {
  const cut = path.lastIndexOf("/");
  if (cut <= 0) return null;
  const parent = path.slice(0, cut);
  return MENU_PATHS[view].has(parent) ? parent : null;
};

/** The menu pages whose tick and actions a path follows: itself, or its parents. */
export const pagePermissionPaths = (view: View, pathname: string): string[] => {
  const path = normalise(pathname);
  const parent = SIBLINGS[view][path];
  if (parent) return [parent].flat();
  const nested = parentMenuPath(view, path);
  return nested ? [nested] : [path];
};

/**
 * The role's action limits with every sibling path carrying its page's, so a
 * button on `/exam/create` obeys what was ticked for Exam Schedule. A sibling
 * of two pages gets whatever either granted page allows.
 */
export function permissionsForView(
  view: View,
  permissions: Permissions,
  allowed?: string[] | null,
): Permissions {
  const out: Permissions = { ...permissions };
  for (const path of Object.keys(SIBLINGS[view])) {
    if (permissions[path]) continue;
    const parents = pagePermissionPaths(view, path).filter((p) => !allowed?.length || allowed.includes(p));
    if (!parents.length) continue;
    // A parent with no entry keeps every action, and so does the sibling.
    if (parents.some((p) => !permissions[p])) continue;
    out[path] = [...new Set(parents.flatMap((p) => permissions[p]))];
  }
  return out;
}

/** Every path that is a menu item of a view, which is what a tick refers to. */
const MENU_PATHS: Record<View, Set<string>> = {
  admin: new Set(),
  franchise: new Set(),
  student: new Set(),
};

const ALLOWED: Record<View, Set<string>> = {
  admin: new Set(),
  franchise: new Set(),
  student: new Set(),
};
(Object.keys(MENUS) as View[]).forEach((view) => {
  MENUS[view].forEach((group) =>
    group.items.forEach((item) => {
      ALLOWED[view].add(item.url);
      MENU_PATHS[view].add(item.url);
    }),
  );
  LANDING[view].forEach((path) => ALLOWED[view].add(path));
  Object.keys(SIBLINGS[view]).forEach((path) => {
    if (pagePermissionPaths(view, path).some((parent) => MENU_PATHS[view].has(parent))) ALLOWED[view].add(path);
  });
});

/**
 * The admin view is authorised for the whole ERP but not for the student
 * portal — those pages read one student's own record, and an administrator
 * has the staff-side equivalent of every one of them.
 */
export function canAccess(view: View, pathname: string): boolean {
  const path = normalise(pathname);
  if (view === "admin") return !path.startsWith("/me");
  return ALLOWED[view].has(path) || parentMenuPath(view, path) !== null;
}

export const homeFor = (view: View) => VIEWS[view].home;

/**
 * Every page a view can open, as the permission picker lists them: grouped the
 * way the sidebar groups them, so an administrator ticking boxes is looking at
 * the menu they are building.
 */
export const modulesForView = (view: View): Array<{ group: string; items: Array<{ title: string; url: string }> }> =>
  MENUS[view].map((group) => ({
    group: group.title,
    items: group.items.map((item) => ({ title: item.title, url: item.url })),
  }));

/**
 * The menu a person actually gets: their view's menu, narrowed to the pages
 * their role was granted.
 *
 * An empty `allowed` means the role has been given no list of its own, which is
 * how every account behaved before roles existed -- so it gets the whole view.
 * A group with nothing left in it disappears rather than sitting there empty.
 */
export function menuFor(view: View, allowed?: string[] | null): MenuItem[] {
  const menu = MENUS[view];
  if (!allowed || allowed.length === 0) return menu;
  const granted = new Set(allowed);
  return menu
    .map((group) => ({ ...group, items: group.items.filter((item) => granted.has(item.url)) }))
    .filter((group) => group.items.length > 0);
}

/**
 * The gate `ProtectedRoute` runs, narrowed by the role's own list.
 *
 * The view is still the outer boundary: a role cannot be granted a page its
 * view was never authorised for, because that is the line the database keeps
 * too. Within the view, a role that was never given a list keeps the whole
 * view -- the behaviour before roles existed. Once it has a list, it opens
 * exactly the pages ticked there (and their sibling paths), plus its landing
 * page: nothing reaches a page by knowing the URL.
 */
export function canAccessWithRole(
  view: View,
  pathname: string,
  allowed?: string[] | null,
): boolean {
  if (!canAccess(view, pathname)) return false;
  if (!allowed || allowed.length === 0) return true;
  const path = normalise(pathname);
  if (LANDING[view].includes(path)) return true;
  return pagePermissionPaths(view, path).some((page) => allowed.includes(page));
}

/** Where a module opens: its list or overview page, else its first page. */
export function groupEntry(group: MenuItem) {
  return group.items.find((item) => /view|all|list|report|collection|transactions|enquiry/.test(item.url)) || group.items[0];
}

/** A module's name short enough for a home-screen tile. */
export function shortGroupTitle(title: string) {
  return title
    .replace(" Management", "")
    .replace("Certificate & Marksheet", "Certificates")
    .replace("Courses & Batches", "Courses")
    .replace("System Settings", "Settings")
    .replace("Main Website", "Website")
    .replace("Session Year", "Session");
}
