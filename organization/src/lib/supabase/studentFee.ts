/**
 * Student + Fee data access.
 *
 * This file exists because several helpers in `data.ts` write column names and
 * enum values that do not exist in the live database, which makes the whole fee
 * module non-functional:
 *
 *   - `getInvoices()` filters on status IN ("PENDING","PARTIAL","OVERDUE").
 *     The live `FeeStatus` enum is DUE | PARTIAL | PAID | VOID, so Postgres
 *     rejects the query with 22P02 and the call ALWAYS throws.
 *   - `createInvoice()` inserts `invoiceNumber` (the real column is `invoiceNo`)
 *     and silently drops the `branchId` argument it is handed.
 *
 * Everything here was verified against the live PostgREST endpoint.
 *
 * Live column inventory (probed, not taken from prisma/schema.prisma):
 *   fee_invoices: id, invoiceNo, studentId, branchId, description, totalAmount,
 *                 paidAmount, dueDate, status, feeGroupId, createdAt, updatedAt
 *   fee_payments: id, invoiceId, amount, method, referenceNo, receiptNo, paidAt,
 *                 receivedById, reversedAt, createdAt
 */
import { supabase } from "./client";
import { newId } from "../id";

/* ============================
   ENUMS (verified live)
   ============================ */

/** Live `FeeStatus` enum. PENDING and OVERDUE are NOT valid values. */
export const FEE_STATUSES = ["DUE", "PARTIAL", "PAID", "VOID"] as const;
export type FeeStatusValue = (typeof FEE_STATUSES)[number];

/** Live `AdmissionStatus` enum. PENDING and UNDER_REVIEW are NOT valid values. */
export const ADMISSION_STATUSES = ["DRAFT", "SUBMITTED", "APPROVED", "REJECTED"] as const;
export type AdmissionStatusValue = (typeof ADMISSION_STATUSES)[number];

/** Live payment method enum. */
export const PAYMENT_METHODS = ["CASH", "CARD", "UPI", "BANK_TRANSFER", "CHEQUE"] as const;
export type PaymentMethodValue = (typeof PAYMENT_METHODS)[number];

export function toFeeStatus(value: unknown): FeeStatusValue {
  const raw = String(value ?? "").toUpperCase();
  if (raw === "PENDING" || raw === "OVERDUE" || raw === "UNPAID") return "DUE";
  if (raw === "CANCELLED" || raw === "CANCELED") return "VOID";
  return (FEE_STATUSES as readonly string[]).includes(raw) ? (raw as FeeStatusValue) : "DUE";
}

export function toAdmissionStatus(value: unknown): AdmissionStatusValue {
  const raw = String(value ?? "").toUpperCase().replace(/[\s-]+/g, "_");
  switch (raw) {
    case "PENDING":
    case "UNDER_REVIEW":
    case "REVIEW":
    case "DOCUMENTS_REQUESTED":
    case "WAITLISTED":
      return "SUBMITTED";
    case "ACCEPTED":
      return "APPROVED";
    case "DECLINED":
      return "REJECTED";
    default:
      return (ADMISSION_STATUSES as readonly string[]).includes(raw)
        ? (raw as AdmissionStatusValue)
        : "SUBMITTED";
  }
}

export function toPaymentMethod(value: unknown): PaymentMethodValue {
  const raw = String(value ?? "").toUpperCase().replace(/[\s-]+/g, "_");
  if (raw === "BANK" || raw === "NEFT" || raw === "RTGS" || raw === "ONLINE") return "BANK_TRANSFER";
  if (raw === "DD" || raw === "DEMAND_DRAFT") return "CHEQUE";
  if (raw === "DEBIT_CARD" || raw === "CREDIT_CARD") return "CARD";
  return (PAYMENT_METHODS as readonly string[]).includes(raw) ? (raw as PaymentMethodValue) : "CASH";
}

/* ============================
   GRACEFUL DEGRADATION
   ============================

   Same idea as NOTICE_OPTIONAL_COLUMNS / BRANCH_OPTIONAL_COLUMNS in data.ts:
   when the live schema has not been migrated yet, PostgREST answers PGRST204
   ("Could not find the '<col>' column ... in the schema cache") or 42703.
   Rather than failing the user's action outright we strip the optional columns
   and retry, so the core row still gets written. */

/** Columns `supabase/schema/add-student-fee-fields.sql` adds. */
export const STUDENT_OPTIONAL_COLUMNS = [
  "decisionNote",
  "requestedDocuments",
  "documents",
  "guardianName",
  "guardianPhone",
  "emergencyName",
  "emergencyPhone",
  "previousSchool",
  "previousClass",
  "alternatePhone",
  "rollNo",
  "feeGroupId",
  // add-student-parentage.sql
  "parentage",
  "maritalStatus",
];

/** Columns the fee pages want on fee_invoices / fee_payments. */
export const INVOICE_OPTIONAL_COLUMNS = ["discount", "lateFee", "notes"];
export const PAYMENT_OPTIONAL_COLUMNS = ["note", "lateFee", "discount"];

type PgError = { code?: string; message?: string } | null;

export function isMissingColumnError(error: PgError, columns: string[]): boolean {
  if (!error) return false;
  const code = error.code;
  if (code !== "PGRST204" && code !== "42703") return false;
  const message = error.message || "";
  return columns.length === 0 || columns.some((column) => message.includes(column));
}

function stripColumns<T extends Record<string, unknown>>(payload: T, columns: string[]): T {
  const next = { ...payload } as Record<string, unknown>;
  for (const column of columns) delete next[column];
  return next as T;
}

/** Remove undefined values so PostgREST does not try to write them. */
export function compact<T extends Record<string, unknown>>(payload: T): T {
  const next: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (value !== undefined) next[key] = value;
  }
  return next as T;
}

/* ============================
   INVOICES
   ============================ */

export interface InvoicePayment {
  id: string;
  amount: number | string | null;
  method: string | null;
  receiptNo: string | null;
  referenceNo: string | null;
  paidAt: string | null;
  reversedAt: string | null;
}

export interface InvoiceStudent {
  id?: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  email?: string | null;
  enrollmentNo?: string | null;
  applicationNo?: string | null;
  courseId?: string | null;
  batchId?: string | null;
  /** The course itself, embedded through the student. `courseId` alone is an
   *  opaque key, and the fee pages need a name to put in a Course column. */
  course?: { name?: string | null; code?: string | null } | null;
}

export interface InvoiceRow {
  id: string;
  invoiceNo?: string | null;
  studentId?: string | null;
  branchId?: string | null;
  description?: string | null;
  totalAmount?: number | string | null;
  paidAmount?: number | string | null;
  dueDate?: string | null;
  status?: string | null;
  feeGroupId?: string | null;
  /** Only present once add-student-fee-fields.sql has been run. */
  discount?: number | string | null;
  lateFee?: number | string | null;
  notes?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  payments?: InvoicePayment[] | null;
  student?: InvoiceStudent | null;
}

const PAYMENTS_EMBED =
  "payments:fee_payments(id,amount,method,receiptNo,referenceNo,paidAt,reversedAt)";
const STUDENT_COLUMNS =
  "id,firstName,lastName,phone,email,enrollmentNo,applicationNo,courseId,batchId";

/**
 * Tried in order, richest first. The course is nested two levels deep
 * (invoice → student → course), which not every deployment exposes; without
 * this ladder a database that rejects the nested embed would drop all the way
 * to a flat select and lose the payments too, which is what decides whether an
 * invoice reads as paid.
 */
const INVOICE_SELECTS = [
  `*,${PAYMENTS_EMBED},student:students(${STUDENT_COLUMNS},course:courses(name,code))`,
  `*,${PAYMENTS_EMBED},student:students(${STUDENT_COLUMNS})`,
  "*",
];

/**
 * Replacement for data.ts `getInvoices`, which always throws because it filters
 * on FeeStatus values the live enum does not contain.
 *
 * Returns every non-void invoice with its payments and student embedded, so the
 * fee pages no longer need N+1 lookups. Follows the `{ success, data }` envelope
 * used everywhere else in the app.
 */
export async function listInvoices(
  branchId: string | null,
  options: { statuses?: FeeStatusValue[]; includeVoid?: boolean } = {},
): Promise<{ success: true; data: InvoiceRow[] }> {
  const statuses =
    options.statuses && options.statuses.length
      ? options.statuses
      : options.includeVoid
        ? [...FEE_STATUSES]
        : (["DUE", "PARTIAL", "PAID"] as FeeStatusValue[]);

  const run = async (select: string) => {
    let query = supabase.from("fee_invoices").select(select).in("status", statuses);
    if (branchId) query = query.eq("branchId", branchId);
    return query.order("createdAt", { ascending: false });
  };

  // Step down the ladder until one select is accepted, so a missing embed costs
  // that embed rather than the page.
  let lastError: { message?: string } | null = null;
  for (const select of INVOICE_SELECTS) {
    const { data, error } = await run(select);
    if (!error) return { success: true as const, data: (data || []) as unknown as InvoiceRow[] };
    lastError = error;
  }
  throw new Error(lastError?.message || "Could not load invoices.");
}

/** Sum of non-reversed payments on an invoice, safe against missing embeds. */
export function paidFromPayments(invoice: Pick<InvoiceRow, "payments" | "paidAmount">): number {
  const payments = Array.isArray(invoice?.payments) ? invoice.payments : null;
  if (payments) {
    return payments
      .filter((payment) => payment && !payment.reversedAt)
      .reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);
  }
  return Number(invoice?.paidAmount) || 0;
}

export function invoiceNumber(seed = Date.now()): string {
  return `INV-${seed.toString(36).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`;
}

export interface CreateInvoiceInput {
  studentId: string;
  description?: string;
  totalAmount: number;
  dueDate?: string | null;
  feeGroupId?: string | null;
  status?: FeeStatusValue;
  discount?: number;
  lateFee?: number;
  notes?: string;
}

/**
 * Replacement for data.ts `createInvoice`, which writes the nonexistent
 * `invoiceNumber` column and ignores the branchId it is given.
 */
export async function createInvoiceRow(
  branchId: string | null,
  input: CreateInvoiceInput,
): Promise<{ success: true; data: InvoiceRow }> {
  const payload = compact({
    invoiceNo: invoiceNumber(),
    branchId: branchId || undefined,
    studentId: input.studentId,
    description: input.description || "Fee invoice",
    totalAmount: Number(input.totalAmount) || 0,
    paidAmount: 0,
    dueDate: input.dueDate || undefined,
    feeGroupId: input.feeGroupId || undefined,
    status: toFeeStatus(input.status || "DUE"),
    discount: input.discount,
    lateFee: input.lateFee,
    notes: input.notes,
  }) as Record<string, unknown>;

  let { data, error } = await supabase.from("fee_invoices").insert(payload).select("*").single();
  if (error && isMissingColumnError(error, INVOICE_OPTIONAL_COLUMNS)) {
    ({ data, error } = await supabase
      .from("fee_invoices")
      .insert(stripColumns(payload, INVOICE_OPTIONAL_COLUMNS))
      .select("*")
      .single());
  }
  if (error) throw new Error(error.message);
  return { success: true, data: data as unknown as InvoiceRow };
}

export async function updateInvoiceRow(
  id: string,
  changes: Record<string, unknown>,
): Promise<{ success: true; data: InvoiceRow }> {
  const payload = compact(changes);
  let { data, error } = await supabase
    .from("fee_invoices")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();
  if (error && isMissingColumnError(error, INVOICE_OPTIONAL_COLUMNS)) {
    ({ data, error } = await supabase
      .from("fee_invoices")
      .update(stripColumns(payload, INVOICE_OPTIONAL_COLUMNS))
      .eq("id", id)
      .select("*")
      .single());
  }
  if (error) throw new Error(error.message);
  return { success: true, data: data as unknown as InvoiceRow };
}

/* ============================
   PAYMENTS
   ============================ */

export interface RecordPaymentInput {
  amount: number;
  method?: string;
  referenceNo?: string;
  receiptNo?: string;
  paidAt?: string;
  note?: string;
  /** Overrides the signed-in user. Only worth passing where the person taking
   *  the money is not the person at the keyboard. */
  receivedById?: string;
}

export function receiptNumber(): string {
  return `RCP-${Date.now().toString(36).toUpperCase()}`;
}

/**
 * Who is booking the receipt.
 *
 * `fee_payments.receivedById` is NOT NULL with no default and nothing was
 * filling it, so every collection — at the counter and from the student's own
 * portal — died on "null value in column receivedById violates not-null
 * constraint". That is a message about the schema, not about the money, and it
 * told the branch nothing it could act on.
 *
 * The session, not `getUser()`: it is read locally, it is the same identity the
 * insert will run under, and a collection should not wait on a round trip to
 * learn who is collecting.
 */
async function currentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id ?? null;
}

/**
 * Insert a payment and roll the parent invoice's paidAmount/status forward.
 * data.ts `addPayment` writes whatever the caller hands it, which is how the
 * nonexistent `note` column ended up being sent from FeeAllocation.
 */
export async function recordPayment(
  invoice: InvoiceRow,
  input: RecordPaymentInput,
): Promise<{ success: true; data: { payment: Record<string, unknown>; invoice: InvoiceRow | null } }> {
  const amount = Number(input.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Enter a payment amount greater than zero.");
  }

  const receivedById = input.receivedById || (await currentUserId());
  if (!receivedById) {
    throw new Error("Your session has expired. Sign in again to record this payment.");
  }

  const payload = compact({
    // `id` has no database default either -- see lib/id.ts. Supplying it costs
    // nothing where a default was since added, and is the difference between
    // working and not where one was not.
    id: newId("pay"),
    invoiceId: invoice.id,
    amount,
    method: toPaymentMethod(input.method),
    referenceNo: input.referenceNo || undefined,
    receiptNo: input.receiptNo || receiptNumber(),
    paidAt: input.paidAt || new Date().toISOString(),
    receivedById,
    note: input.note || undefined,
  }) as Record<string, unknown>;

  let { data, error } = await supabase.from("fee_payments").insert(payload).select("*").single();
  if (error && isMissingColumnError(error, PAYMENT_OPTIONAL_COLUMNS)) {
    ({ data, error } = await supabase
      .from("fee_payments")
      .insert(stripColumns(payload, PAYMENT_OPTIONAL_COLUMNS))
      .select("*")
      .single());
  }
  if (error) throw new Error(error.message);

  const total = Number(invoice.totalAmount) || 0;
  const alreadyPaid = paidFromPayments(invoice);
  const paidAmount = Math.round((alreadyPaid + amount) * 100) / 100;
  const status: FeeStatusValue = paidAmount >= total && total > 0 ? "PAID" : paidAmount > 0 ? "PARTIAL" : "DUE";

  let updated: InvoiceRow | null = null;
  try {
    const result = await updateInvoiceRow(invoice.id, { paidAmount, status });
    updated = result.data;
  } catch {
    // The payment row is the source of truth; a failed roll-up should not
    // make the collection look like it failed.
    updated = null;
  }

  return { success: true, data: { payment: data as Record<string, unknown>, invoice: updated } };
}

/* ============================
   STUDENTS
   ============================ */

/**
 * Update a student with only columns that exist on the live table, retrying
 * without the optional ones when the schema has not been migrated.
 * `admissionStatus` is coerced to a valid AdmissionStatus enum member.
 */
export async function updateStudentRow(
  id: string,
  changes: Record<string, unknown>,
): Promise<{ success: true; data: Record<string, unknown> }> {
  const payload = compact({ ...changes }) as Record<string, unknown>;
  if ("admissionStatus" in payload) {
    payload.admissionStatus = toAdmissionStatus(payload.admissionStatus);
  }
  // `status` is not a column on students; the live column is `admissionStatus`.
  if ("status" in payload) {
    if (!("admissionStatus" in payload)) payload.admissionStatus = toAdmissionStatus(payload.status);
    delete payload.status;
  }
  if (Array.isArray(payload.requestedDocuments)) {
    payload.requestedDocuments = (payload.requestedDocuments as unknown[]).join(", ");
  }

  let { data, error } = await supabase
    .from("students")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();
  if (error && isMissingColumnError(error, STUDENT_OPTIONAL_COLUMNS)) {
    ({ data, error } = await supabase
      .from("students")
      .update(stripColumns(payload, STUDENT_OPTIONAL_COLUMNS))
      .eq("id", id)
      .select("*")
      .single());
  }
  if (error) throw new Error(error.message);
  return { success: true, data: (data || {}) as Record<string, unknown> };
}

/* ============================
   FORMATTING GUARDS
   ============================ */

/** `new Date("—")` renders "Invalid Date"; this returns a dash instead. */
export function formatDate(value: unknown, fallback = "—"): string {
  if (value === null || value === undefined || value === "") return fallback;
  const date = new Date(value as string);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function toNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function formatCurrency(value: unknown): string {
  return `₹${toNumber(value).toLocaleString("en-IN")}`;
}

/** Whole days until `value`; null when the date is missing or unparseable. */
export function daysUntil(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const time = new Date(value as string).getTime();
  if (Number.isNaN(time)) return null;
  return Math.round((time - Date.now()) / 86400000);
}

export function safeDivide(numerator: number, denominator: number, fallback = 0): number {
  if (!Number.isFinite(denominator) || denominator === 0) return fallback;
  const result = numerator / denominator;
  return Number.isFinite(result) ? result : fallback;
}

export function studentName(student?: InvoiceStudent | null, fallback = "Unknown student"): string {
  if (!student) return fallback;
  const name = [student.firstName, student.lastName].filter(Boolean).join(" ").trim();
  return name || fallback;
}

/* ============================
   STUDENT LIST
   ============================ */

export interface StudentRow {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  email?: string | null;
  enrollmentNo?: string | null;
  applicationNo?: string | null;
  admissionStatus?: string | null;
  admissionDate?: string | null;
  courseId?: string | null;
  batchId?: string | null;
  branchId?: string | null;
  course?: { id?: string; name?: string | null } | null;
  batch?: { id?: string; name?: string | null } | null;
  [key: string]: unknown;
}

/**
 * Students with their course and batch names resolved. `data.ts getStudents`
 * selects "*", which leaves every course/batch cell showing a raw UUID.
 * Falls back to the flat select when the embeds are unavailable.
 */
export async function listStudents(
  branchId: string | null,
  limit = 200,
): Promise<{ success: true; data: StudentRow[] }> {
  const run = async (select: string) => {
    let query = supabase
      .from("students")
      .select(select)
      .is("deletedAt", null)
      .order("createdAt", { ascending: false })
      .limit(limit);
    if (branchId) query = query.eq("branchId", branchId);
    return query;
  };

  let { data, error } = await run("*,course:courses(id,name),batch:batches(id,name)");
  if (error) {
    const flat = await run("*");
    if (flat.error) throw new Error(flat.error.message);
    data = flat.data;
    error = null;
  }
  return { success: true, data: (data || []) as unknown as StudentRow[] };
}

/** Human-readable identifier for a student row (there is no `studentId` column). */
export function studentCode(student: Partial<StudentRow> | null | undefined): string {
  if (!student) return "—";
  return (
    (student.enrollmentNo as string) ||
    (student.applicationNo as string) ||
    (student.id ? `#${String(student.id).slice(-6)}` : "—")
  );
}
