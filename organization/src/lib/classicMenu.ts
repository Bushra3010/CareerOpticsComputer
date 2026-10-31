import {
  Award,
  BookOpen,
  ClipboardList,
  Download,
  Handshake,
  Settings,
  Globe,
  Megaphone,
  Printer,
  Trophy,
  GraduationCap,
  Headphones,
  IndianRupee,
  LayoutDashboard,
  MonitorPlay,
  Receipt,
  School,
  Store,
  Users,
  Wallet,
} from "lucide-react";
import type { View } from "@/lib/roles";
import { menuFor, type MenuItem } from "@/lib/navigation";

/**
 * The sidebar as a classic franchise panel lays it out: a short list of
 * top-level entries, some opening straight to a page, some unfolding into
 * their pages.
 *
 * It never grants anything. Every page listed here is looked up in the
 * view's own menu (`menuFor`, already narrowed to the role's pages), and a
 * page the role cannot open is simply left out -- as is a heading left empty.
 */
export interface ClassicLink {
  title: string;
  url: string;
}

export interface ClassicEntry {
  title: string;
  icon: MenuItem["icon"];
  /** Opens straight to this page. */
  url?: string;
  /** Or unfolds into these. */
  items?: ClassicLink[];
}

/** Head office helpline, as printed on the website. */
export const SUPPORT_PHONE = "8252532179";
export const SUPPORT_WHATSAPP = `https://wa.me/91${SUPPORT_PHONE}`;

type Plan = Array<{ title: string; icon: MenuItem["icon"]; urls: Array<string | [string, string]> }>;

/**
 * The centre's panel, in the classic franchise-panel order. An entry with one
 * page opens it directly; the rest unfold. The older modules a centre also
 * runs (fees, courses, certificates, live class) follow under their own names.
 */
const FRANCHISE_PLAN: Plan = [
  {
    title: "Students",
    icon: GraduationCap,
    urls: [
      "/centre/enquiry",
      ["/centre/students?type=all", "All Students"],
      ["/centre/students?type=registered", "Registered Students"],
      ["/centre/students?type=request", "Requested Students"],
      ["/centre/students?type=approved", "Approved Students"],
      ["/centre/students?type=online", "Online Students"],
      ["/centre/students?type=deactivated", "Deactivated Students"],
      "/centre/student-add",
      ["/student/passout", "Passout Students"],
    ],
  },
  { title: "Admission Forms", icon: Globe, urls: ["/centre/admission-forms"] },
  { title: "Sample Certificate", icon: Award, urls: ["/centre/sample-certificates"] },
  { title: "Downloads", icon: Download, urls: ["/centre/downloads", ["/certificate/centre", "Authorization Letter"]] },
  { title: "Exam & Questions", icon: ClipboardList, urls: [["/centre/questions", "Question Bank"], "/centre/exams"] },
  { title: "Batch & Attendance", icon: School, urls: ["/centre/batches", "/centre/attendance"] },
  { title: "Order Certificates", icon: Printer, urls: ["/centre/orders"] },
  { title: "Awards", icon: Trophy, urls: ["/centre/awards"] },
  { title: "Wallet History", icon: Wallet, urls: ["/centre/wallet"] },
  { title: "Help & Support", icon: Headphones, urls: ["/centre/tickets"] },
  { title: "Expanses", icon: Receipt, urls: ["/centre/expenses"] },
  { title: "Marketing Expanses", icon: Megaphone, urls: ["/centre/marketing-expenses"] },
  {
    title: "Fees",
    icon: IndianRupee,
    urls: [["/fee/collection", "Fee Collection"], ["/fee/due-collection", "Due Collection"]],
  },
  {
    title: "Courses",
    icon: BookOpen,
    urls: [["/course/view", "All Courses"], "/course/syllabus", "/course/subjects"],
  },
  {
    title: "Certificates & Cards",
    icon: Award,
    urls: ["/certificate/issue", "/certificate/generate", "/cards/generate-id", "/exam/admit-cards", "/exam/results"],
  },
  {
    title: "Live Class",
    icon: MonitorPlay,
    urls: ["/live-class/view", "/live-class/setup", "/tools/code-lab", "/tools/whiteboard"],
  },
  {
    title: "My Centre",
    icon: Store,
    urls: ["/centre/profile", "/branch/notice-board", "/branch/website-settings"],
  },
];

/**
 * The head office's panel: the same classic entries as a centre's, seeing
 * every centre, plus what only the head office runs -- franchises, the course
 * catalogue, users and settings. The older module screens the centre panel
 * replaced (reception, the old student, exam and expense pages) stay reachable
 * by address but leave the menu.
 */
const ADMIN_PLAN: Plan = [
  {
    title: "Franchise",
    icon: Store,
    urls: [
      ["/branch/create", "Add Franchise"],
      ["/branch/view", "All Franchises"],
      ["/branch/leads", "Franchise Leads"],
      ["/branch/transactions", "Wallet Requests"],
      "/branch/charges",
      "/branch/notice-board",
      ["/certificate/centre", "Authorization Letter"],
    ],
  },
  {
    title: "Courses",
    icon: BookOpen,
    urls: ["/course/create", ["/course/view", "All Courses"], "/course/syllabus", "/course/subjects"],
  },
  {
    title: "Students",
    icon: GraduationCap,
    urls: [
      "/centre/enquiry",
      ["/centre/students?type=all", "All Students"],
      ["/centre/students?type=registered", "Registered Students"],
      ["/centre/students?type=request", "Requested Students"],
      ["/centre/students?type=approved", "Approved Students"],
      ["/centre/students?type=online", "Online Students"],
      ["/centre/students?type=deactivated", "Deactivated Students"],
      "/centre/student-add",
      ["/enquiry/admission-leads", "Admission Leads"],
      ["/student/passout", "Passout Students"],
    ],
  },
  { title: "Admission Forms", icon: Globe, urls: ["/centre/admission-forms"] },
  { title: "Sample Certificate", icon: Award, urls: ["/centre/sample-certificates"] },
  {
    title: "Exam & Questions",
    icon: ClipboardList,
    urls: [["/centre/questions", "Question Bank"], "/centre/exams", "/exam/centres", "/exam/schedule", "/exam/admit-cards", "/exam/results"],
  },
  { title: "Batch & Attendance", icon: School, urls: ["/centre/batches", "/centre/attendance"] },
  {
    title: "Certificates",
    icon: Printer,
    urls: ["/centre/orders", "/certificate/approvals", "/certificate/issue", "/cards/generate-id", "/certificate/generate", "/documents/designer"],
  },
  { title: "Awards", icon: Trophy, urls: ["/centre/awards"] },
  { title: "Help & Support", icon: Headphones, urls: ["/centre/tickets"] },
  { title: "Expanses", icon: Receipt, urls: ["/centre/expenses"] },
  { title: "Marketing Expanses", icon: Megaphone, urls: ["/centre/marketing-expenses"] },
  {
    title: "Fees",
    icon: IndianRupee,
    urls: ["/fee/collection", ["/fee/due-collection", "Due Collection"], "/fee/types", "/fee/groups", "/fee/allocation"],
  },
  { title: "Users", icon: Users, urls: ["/user/all", "/user/roles", "/user/access-control"] },
  { title: "Website", icon: Globe, urls: ["/website/content", "/branch/website-settings", "/branch/website-view"] },
  {
    title: "Settings",
    icon: Settings,
    urls: ["/settings/general", "/session/all", "/settings/payment-gateway", "/settings/payment-qr", "/settings/batch-qr"],
  },
  { title: "Live Class", icon: MonitorPlay, urls: ["/live-class/view", "/live-class/setup", "/tools/code-lab", "/tools/whiteboard"] },
  { title: "Partners", icon: Handshake, urls: ["/partners/all", "/partners/add", "/partners/transactions"] },
];

/** Admin and student panels keep their module groups, each as a heading. */
function fromGroups(groups: MenuItem[]): ClassicEntry[] {
  return groups.map((group) => ({
    title: group.title.replace(" Management", ""),
    icon: group.icon,
    items: group.items.map((item) => ({ title: item.title, url: item.url })),
  }));
}

function fromPlan(plan: Plan, groups: MenuItem[]): ClassicEntry[] {
  // Every page this login may open, with the name the module gave it.
  const open = new Map(groups.flatMap((g) => g.items.map((i) => [i.url, i.title] as const)));
  const entries: ClassicEntry[] = [];
  for (const step of plan) {
    const items = step.urls
      .map((u) => (Array.isArray(u) ? { url: u[0], title: u[1] } : { url: u, title: open.get(u) || "" }))
      .filter((item) => open.has(item.url.split("?")[0]));
    if (items.length === 1 && step.urls.length === 1) entries.push({ title: step.title, icon: step.icon, url: items[0].url });
    else if (items.length) entries.push({ title: step.title, icon: step.icon, items });
  }
  return entries;
}

export function classicMenu(view: View, allowed?: string[] | null): ClassicEntry[] {
  const groups = menuFor(view, allowed);
  const dashboard: ClassicEntry = {
    title: "Dashboard",
    icon: LayoutDashboard,
    url: view === "student" ? "/me" : "/",
  };
  if (view === "student") return [dashboard, ...fromGroups(groups)];
  if (view === "admin") return [dashboard, ...fromPlan(ADMIN_PLAN, groups)];

  const entries: ClassicEntry[] = [dashboard, ...fromPlan(FRANCHISE_PLAN, groups)];
  // Anything the centre can open that the plan above does not place still gets
  // a home, so a page added to the franchise menu later is never unreachable.
  const placed = new Set(FRANCHISE_PLAN.flatMap((p) => p.urls.map((u) => (Array.isArray(u) ? u[0] : u).split("?")[0])));
  const superseded = new Set(["/reception/enquiry", "/reception/dispatch", "/student/view", "/student/admission-form", "/student/online-admissions", "/enquiry/branch", "/enquiry/online-student", "/course/batch/create", "/course/batch/timing", "/course/batch/assign", "/course/batch/assign-students", "/attendance/mark", "/attendance/qr", "/attendance/report", "/attendance/logs", "/online-exam/create", "/online-exam/assign", "/online-exam/marks", "/exam/guide", "/exam/schedule", "/exam/marks-list", "/expense/expense-voucher", "/expense/deposit-voucher", "/branch/wallet", "/branch/transactions", "/branch/charges", "/enquiry/admission-leads"]);
  const rest = groups.flatMap((g) => g.items).filter((i) => !placed.has(i.url) && !superseded.has(i.url));
  if (rest.length) entries.push({ title: "More", icon: Users, items: rest.map((i) => ({ title: i.title, url: i.url })) });
  return entries;
}

/** The entry and page a path belongs to, for the page bar's breadcrumb. */
export function classicLocate(entries: ClassicEntry[], pathname: string, search = ""): { entry?: ClassicEntry; page?: ClassicLink } {
  const full = pathname + search;
  for (const entry of entries) {
    if (entry.url === full || entry.url === pathname) return { entry };
    const page = entry.items?.find((i) => i.url === full) || entry.items?.find((i) => i.url === pathname);
    if (page) return { entry, page };
  }
  return {};
}

