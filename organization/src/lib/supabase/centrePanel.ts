import { useEffect, useState } from "react";

import { supabase } from "./client";
import { getBranches } from "./data";

/**
 * The centre panel's own records (supabase/schema/centre-panel.sql):
 * expenses, marketing spend, support tickets, awards and certificate orders.
 *
 * Row-level security does the scoping: a centre login reads its own branch's
 * rows and an organisation admin reads every branch of its organisation. The
 * `branchId` filter below is only there so an admin "acting as" a centre sees
 * that centre alone.
 */

const SETUP_HINT = "The centre panel tables are not set up yet. Run supabase/schema/centre-panel.sql in Supabase.";

const missingTable = (error: { code?: string; message?: string } | null) =>
  !!error && (error.code === "42P01" || error.code === "PGRST205" || /does not exist|schema cache/i.test(error.message || ""));

function fail(error: { code?: string; message?: string }): never {
  throw new Error(missingTable(error) ? SETUP_HINT : error.message || "Request failed");
}

const BRANCH_JOIN = "branch:branches(id, name, code)";
type BranchRef = { id: string; name: string; code: string | null } | null;

/* ------------------------------------------------------------------ Expenses */

export const EXPENSE_MODES = ["Cash", "UPI", "Phonpe", "Gpay", "Bank Transfer"] as const;

export interface CentreExpense {
  id: string;
  branchId: string;
  date: string;
  amount: number;
  mode: string;
  type: "debit" | "credit";
  reference: string | null;
  createdAt: string;
  branch?: BranchRef;
}

/** Credits add to the till and debits take from it: the "Total" the classic panel shows. */
export const expenseTotal = (rows: Array<Pick<CentreExpense, "amount" | "type">>) =>
  rows.reduce((sum, row) => sum + (row.type === "credit" ? 1 : -1) * (Number(row.amount) || 0), 0);

export async function listCentreExpenses(branchId: string | null, range: { from?: string; to?: string } = {}) {
  let query = supabase.from("centre_expenses").select(`*, ${BRANCH_JOIN}`).order("date", { ascending: false }).order("createdAt", { ascending: false });
  if (branchId) query = query.eq("branchId", branchId);
  if (range.from) query = query.gte("date", range.from);
  if (range.to) query = query.lte("date", range.to);
  const { data, error } = await query;
  if (error) fail(error);
  return (data || []).map((row) => ({ ...row, amount: Number(row.amount) || 0 })) as CentreExpense[];
}

export async function createCentreExpense(input: { branchId: string; date: string; amount: number; mode: string; type: "debit" | "credit"; reference?: string }) {
  const { data, error } = await supabase.from("centre_expenses").insert({ ...input, reference: input.reference || null }).select("*").single();
  if (error) fail(error);
  return data as CentreExpense;
}

export async function deleteCentreExpense(id: string) {
  const { error } = await supabase.from("centre_expenses").delete().eq("id", id);
  if (error) fail(error);
}

/* --------------------------------------------------------- Marketing spend */

export interface MarketingExpense {
  id: string;
  branchId: string;
  amount: number;
  remarks: string | null;
  photo: string | null;
  createdAt: string;
  branch?: BranchRef;
}

export async function listMarketingExpenses(branchId: string | null) {
  let query = supabase.from("marketing_expenses").select(`*, ${BRANCH_JOIN}`).order("createdAt", { ascending: false });
  if (branchId) query = query.eq("branchId", branchId);
  const { data, error } = await query;
  if (error) fail(error);
  return (data || []).map((row) => ({ ...row, amount: Number(row.amount) || 0 })) as MarketingExpense[];
}

export async function createMarketingExpense(input: { branchId: string; amount: number; remarks?: string; photo?: string | null }) {
  const { data, error } = await supabase
    .from("marketing_expenses")
    .insert({ branchId: input.branchId, amount: input.amount, remarks: input.remarks || null, photo: input.photo || null })
    .select("*")
    .single();
  if (error) fail(error);
  return data as MarketingExpense;
}

export async function deleteMarketingExpense(id: string) {
  const { error } = await supabase.from("marketing_expenses").delete().eq("id", id);
  if (error) fail(error);
}

/* ------------------------------------------------------------------ Tickets */

export const TICKET_STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];

/** Main topic -> its sub topics, as the head office sorts incoming tickets. */
export const TICKET_TOPICS: Record<string, string[]> = {
  "Student Registration": ["New admission", "Edit student details", "Enrollment number", "Photo / documents", "Delete request"],
  Exam: ["Exam schedule", "Admit card", "Online exam", "Result / marks", "Re-exam"],
  Certificate: ["Certificate not generated", "Correction in certificate", "Marksheet", "Certificate dispatch"],
  "Wallet/Payment": ["Recharge not credited", "Wrong deduction", "Refund", "Payment proof"],
  "Login/Technical": ["Cannot log in", "Password reset", "Page not loading", "Other technical issue"],
  Franchise: ["Renewal", "Authorization letter", "Centre details change", "New course request"],
  Other: ["General query", "Feedback", "Complaint"],
};

export interface SupportTicket {
  id: string;
  code: string;
  branchId: string;
  category: string;
  subcategory: string | null;
  subject: string;
  content: string | null;
  image: string | null;
  status: TicketStatus;
  reply: string | null;
  createdAt: string;
  updatedAt: string;
  branch?: BranchRef;
}

export async function listSupportTickets(branchId: string | null) {
  let query = supabase.from("support_tickets").select(`*, ${BRANCH_JOIN}`).order("createdAt", { ascending: false });
  if (branchId) query = query.eq("branchId", branchId);
  const { data, error } = await query;
  if (error) fail(error);
  return (data || []) as SupportTicket[];
}

export async function createSupportTicket(input: { branchId: string; category: string; subcategory?: string; subject: string; content?: string; image?: string | null }) {
  const { data, error } = await supabase
    .from("support_tickets")
    .insert({
      branchId: input.branchId,
      category: input.category,
      subcategory: input.subcategory || null,
      subject: input.subject,
      content: input.content || null,
      image: input.image || null,
    })
    .select("*")
    .single();
  if (error) fail(error);
  return data as SupportTicket;
}

/** The trigger quietly drops a centre's reply/status edits (other than closing), so this is safe to call from either side. */
export async function updateSupportTicket(id: string, patch: { reply?: string | null; status?: TicketStatus }) {
  const { data, error } = await supabase.from("support_tickets").update(patch).eq("id", id).select("*").single();
  if (error) fail(error);
  return data as SupportTicket;
}

/* ------------------------------------------------------------------- Awards */

export interface CentreAward {
  id: string;
  branchId: string;
  name: string;
  description: string | null;
  image: string | null;
  status: "ACTIVE" | "INACTIVE";
  awardedAt: string;
  branch?: BranchRef;
}

export async function listCentreAwards(branchId: string | null) {
  let query = supabase.from("centre_awards").select(`*, ${BRANCH_JOIN}`).order("awardedAt", { ascending: false });
  if (branchId) query = query.eq("branchId", branchId);
  const { data, error } = await query;
  if (error) fail(error);
  return (data || []) as CentreAward[];
}

export async function createCentreAward(input: { branchId: string; name: string; description?: string; image?: string | null; status?: "ACTIVE" | "INACTIVE"; awardedAt?: string }) {
  const { data, error } = await supabase
    .from("centre_awards")
    .insert({
      branchId: input.branchId,
      name: input.name,
      description: input.description || null,
      image: input.image || null,
      status: input.status || "ACTIVE",
      ...(input.awardedAt ? { awardedAt: input.awardedAt } : {}),
    })
    .select("*")
    .single();
  if (error) fail(error);
  return data as CentreAward;
}

export async function updateCentreAward(id: string, patch: Partial<Pick<CentreAward, "name" | "description" | "image" | "status">>) {
  const { error } = await supabase.from("centre_awards").update(patch).eq("id", id);
  if (error) fail(error);
}

export async function deleteCentreAward(id: string) {
  const { error } = await supabase.from("centre_awards").delete().eq("id", id);
  if (error) fail(error);
}

/* -------------------------------------------------------- Certificate orders */

export const ORDER_STATUSES = ["PENDING", "APPROVED", "DISPATCHED", "REJECTED"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface CertificateOrder {
  id: string;
  orderNo: string;
  branchId: string;
  studentIds: string[];
  amount: number;
  status: OrderStatus;
  note: string | null;
  createdAt: string;
  branch?: BranchRef;
}

export async function listCertificateOrders(branchId: string | null) {
  let query = supabase.from("certificate_orders").select(`*, ${BRANCH_JOIN}`).order("createdAt", { ascending: false });
  if (branchId) query = query.eq("branchId", branchId);
  const { data, error } = await query;
  if (error) fail(error);
  return (data || []).map((row) => ({ ...row, amount: Number(row.amount) || 0, studentIds: row.studentIds || [] })) as CertificateOrder[];
}

/** The insert trigger zeroes the amount and forces PENDING for a centre, so none is sent. */
export async function createCertificateOrder(input: { branchId: string; studentIds: string[]; note?: string }) {
  const { data, error } = await supabase
    .from("certificate_orders")
    .insert({ branchId: input.branchId, studentIds: input.studentIds, note: input.note || null })
    .select("*")
    .single();
  if (error) fail(error);
  return data as CertificateOrder;
}

export async function updateCertificateOrder(id: string, patch: { amount?: number; status?: OrderStatus; note?: string | null }) {
  const { data, error } = await supabase.from("certificate_orders").update(patch).eq("id", id).select("*").single();
  if (error) fail(error);
  return data as CertificateOrder;
}

export interface OrderableStudent {
  id: string;
  branchId: string;
  name: string;
  enrollmentNo: string | null;
  courseId: string | null;
  /** True when the student has a passed final-term marksheet (exam-workflow.sql). */
  passed: boolean;
}

const ADMITTED = ["APPROVED", "COMPLETED"];

/**
 * Students a centre could order certificates for: admitted, active, and not
 * already on an order that is still standing (a rejected order frees them).
 */
export async function listOrderableStudents(branchId: string, orders: CertificateOrder[]): Promise<OrderableStudent[]> {
  const { data, error } = await supabase
    .from("students")
    .select('id, "branchId", "firstName", "lastName", "enrollmentNo", "courseId", "admissionStatus", "isActive"')
    .eq("branchId", branchId)
    .is("deletedAt", null)
    .order("firstName")
    .limit(5000);
  if (error) fail(error);
  const taken = new Set(orders.filter((o) => o.status !== "REJECTED").flatMap((o) => o.studentIds));
  const rows = (data || []).filter(
    (s) => s.isActive !== false && ADMITTED.includes(String(s.admissionStatus || "").toUpperCase()) && !taken.has(String(s.id)),
  );

  // Marksheets arrived with exam-workflow.sql; without the table nobody is marked passed.
  const passed = new Set<string>();
  const { data: sheets } = await supabase.from("marksheets").select('"studentId"').eq("branchId", branchId).eq("isFinal", true).eq("result", "PASS");
  for (const sheet of sheets || []) passed.add(String((sheet as { studentId: string }).studentId));

  return rows.map((s) => ({
    id: String(s.id),
    branchId: String(s.branchId),
    name: [s.firstName, s.lastName].filter(Boolean).join(" ") || "Unnamed",
    enrollmentNo: s.enrollmentNo || null,
    courseId: s.courseId || null,
    passed: passed.has(String(s.id)),
  }));
}

/** Names for the students on an order, for its "view students" list. */
export async function getStudentsByIds(ids: string[]) {
  if (!ids.length) return [];
  const { data, error } = await supabase.from("students").select('id, "firstName", "lastName", "enrollmentNo"').in("id", ids);
  if (error) fail(error);
  return (data || []).map((s) => ({
    id: String(s.id),
    name: [s.firstName, s.lastName].filter(Boolean).join(" ") || "Unnamed",
    enrollmentNo: (s.enrollmentNo as string | null) || null,
  }));
}

/* ------------------------------------------------------------------ Helpers */

/**
 * An uploaded picture as a JPEG data URL no larger than `max` px on its long
 * side. These photos are stored in a text column, and a phone camera's 4000px
 * original would make every list query megabytes heavy.
 */
export function resizeImage(file: File, max = 1000, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!/^image\//.test(file.type)) {
      reject(new Error("Please choose an image file (PNG or JPG)."));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read the file."));
    reader.onload = () => {
      const src = String(reader.result || "");
      const img = new Image();
      img.onerror = () => reject(new Error("Could not open the image."));
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext("2d");
        // No canvas (jsdom, very old browsers): keep the original rather than fail the upload.
        if (!ctx) return resolve(src);
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * The branches an organisation admin can pick from. A centre login gets an
 * empty list and never shows the picker.
 */
export function useBranchOptions(organizationId: string | null, enabled: boolean) {
  const [branches, setBranches] = useState<Array<{ id: string; name: string; code?: string | null }>>([]);
  useEffect(() => {
    if (!enabled) return;
    let live = true;
    getBranches(organizationId)
      .then((r) => live && setBranches((r.data || []).map((b) => ({ id: String(b.id), name: String(b.name || ""), code: b.code ?? null }))))
      .catch(() => live && setBranches([]));
    return () => {
      live = false;
    };
  }, [organizationId, enabled]);
  return branches;
}

export const HELPLINE = "8252532179";
export const COMPANY_NAME = "Career Optics Education Service Private Limited";
