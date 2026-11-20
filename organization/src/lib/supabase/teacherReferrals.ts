import { supabase } from "./client";

/**
 * Teacher referral program (supabase/schema/teacher-referrals.sql).
 *
 * Every teacher login can be given a referral code and a percentage. When
 * someone joins as a teacher on that code, the head office records it here
 * and the teacher earns that percentage of the base amount. RLS lets an
 * organisation admin manage everything and a teacher read only their own.
 */

const SETUP_HINT =
  "The teacher referral tables are not set up yet. Run supabase/schema/teacher-referrals.sql in Supabase.";

const missingTable = (error: { code?: string; message?: string }) =>
  error.code === "42P01" || error.code === "PGRST205" || /does not exist|schema cache/i.test(error.message || "");

function fail(error: { code?: string; message?: string }): never {
  if (error.code === "23505") throw new Error("That referral code is already taken. Choose another.");
  throw new Error(missingTable(error) ? SETUP_HINT : error.message || "Request failed");
}

/* ------------------------------------------------------------------ Teachers */

export interface TeacherLogin {
  id: string;
  name: string;
  email: string;
  phone: string;
  branchId: string | null;
}

/** Every teacher login in the organisation: the people who can hold a code. */
export async function listTeachers(organizationId: string): Promise<TeacherLogin[]> {
  const { data, error } = await supabase
    .from("users")
    .select("id, name, email, phone, branchId")
    .eq("organizationId", organizationId)
    .eq("role", "TEACHER")
    .order("name");
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => {
    const r = row as Record<string, unknown>;
    return {
      id: String(r.id),
      name: String(r.name ?? ""),
      email: String(r.email ?? ""),
      phone: String(r.phone ?? ""),
      branchId: (r.branchId as string) ?? null,
    };
  });
}

/* --------------------------------------------------------------------- Codes */

export interface ReferralCode {
  id: string;
  organizationId: string;
  userId: string;
  code: string;
  commissionPercent: number;
  isActive: boolean;
}

const CODE_COLUMNS = 'id, "organizationId", "userId", code, "commissionPercent", "isActive"';

const toCode = (row: Record<string, unknown>): ReferralCode =>
  ({ ...row, commissionPercent: Number(row.commissionPercent ?? 0) }) as ReferralCode;

export const CODE_RE = /^[A-Z0-9-]{4,20}$/;

/** Upper-case, spaces dropped: codes are read out over the phone. */
export const normaliseCode = (code: string) => code.trim().toUpperCase().replace(/\s+/g, "");

/** A starting code from the teacher's name: "Priya Shinde" -> "PRIYA-4821". */
export function suggestCode(name: string, random: () => number = Math.random): string {
  const stem =
    name
      .toUpperCase()
      .replace(/[^A-Z ]/g, "")
      .trim()
      .split(/\s+/)[0]
      ?.slice(0, 8) || "TEACH";
  const digits = String(Math.floor(1000 + random() * 9000));
  return `${stem.length >= 2 ? stem : "TEACH"}-${digits}`;
}

export function validatePercent(text: string): string | null {
  const t = text.trim();
  if (!/^\d{1,3}(\.\d{1,2})?$/.test(t) || Number(t) > 100) return "Enter a percentage between 0 and 100.";
  return null;
}

export async function listReferralCodes(organizationId: string): Promise<ReferralCode[]> {
  const { data, error } = await supabase
    .from("teacher_referral_codes")
    .select(CODE_COLUMNS)
    .eq("organizationId", organizationId);
  if (error) fail(error);
  return (data ?? []).map((r) => toCode(r as Record<string, unknown>));
}

/** The signed-in teacher's own code, or null when none has been given yet. */
export async function getMyReferralCode(userId: string): Promise<ReferralCode | null> {
  const { data, error } = await supabase
    .from("teacher_referral_codes")
    .select(CODE_COLUMNS)
    .eq("userId", userId)
    .maybeSingle();
  if (error) fail(error);
  return data ? toCode(data as Record<string, unknown>) : null;
}

/** Gives a teacher a code, or changes the one they have. */
export async function saveReferralCode(
  organizationId: string,
  input: { userId: string; code: string; commissionPercent: number; isActive: boolean },
): Promise<ReferralCode> {
  const code = normaliseCode(input.code);
  if (!CODE_RE.test(code)) throw new Error("A code is 4–20 letters, digits or dashes.");
  const { data, error } = await supabase
    .from("teacher_referral_codes")
    .upsert({ ...input, code, organizationId }, { onConflict: "userId" })
    .select(CODE_COLUMNS)
    .single();
  if (error) fail(error);
  return toCode(data as Record<string, unknown>);
}

/* ----------------------------------------------------------------- Referrals */

export const REFERRAL_STATUSES = ["PENDING", "APPROVED", "PAID", "REJECTED"] as const;
export type ReferralStatus = (typeof REFERRAL_STATUSES)[number];

export const STATUS_LABELS: Record<ReferralStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  PAID: "Paid",
  REJECTED: "Rejected",
};

export const STATUS_STYLE: Record<ReferralStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-blue-100 text-blue-800",
  PAID: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-muted text-muted-foreground",
};

export interface TeacherReferral {
  id: string;
  organizationId: string;
  referrerUserId: string;
  codeUsed: string;
  referredName: string;
  referredPhone: string | null;
  referredEmail: string | null;
  joinedOn: string;
  baseAmount: number;
  commissionPercent: number;
  rewardAmount: number;
  status: ReferralStatus;
  paidOn: string | null;
  paymentReference: string | null;
  note: string | null;
  createdAt: string;
}

const REFERRAL_COLUMNS =
  'id, "organizationId", "referrerUserId", "codeUsed", "referredName", "referredPhone", "referredEmail", "joinedOn", "baseAmount", "commissionPercent", "rewardAmount", status, "paidOn", "paymentReference", note, "createdAt"';

const toReferral = (row: Record<string, unknown>): TeacherReferral =>
  ({
    ...row,
    baseAmount: Number(row.baseAmount ?? 0),
    commissionPercent: Number(row.commissionPercent ?? 0),
    rewardAmount: Number(row.rewardAmount ?? 0),
  }) as TeacherReferral;

/** The reward the database will store: base × percent, rounded to the paisa. */
export const rewardFor = (baseAmount: number, percent: number) =>
  Math.round((Math.round(baseAmount * 100) * percent) / 100) / 100;

export interface ReferralFormValues {
  code: string;
  referredName: string;
  referredPhone: string;
  referredEmail: string;
  joinedOn: string;
  baseAmount: string;
  note: string;
}

export type ReferralErrors = Partial<Record<keyof ReferralFormValues, string>>;

export interface ReferralInput {
  referrerUserId: string;
  codeUsed: string;
  referredName: string;
  referredPhone: string | null;
  referredEmail: string | null;
  joinedOn: string;
  baseAmount: number;
  commissionPercent: number;
  note: string | null;
}

/** Checks the form and resolves the quoted code to the teacher it belongs to. */
export function validateReferral(
  form: ReferralFormValues,
  codes: ReferralCode[],
): { errors: ReferralErrors; value: ReferralInput | null } {
  const errors: ReferralErrors = {};
  const code = normaliseCode(form.code);
  const owner = codes.find((c) => c.code === code);
  if (!code) errors.code = "Enter the referral code the new teacher quoted.";
  else if (!owner) errors.code = "No teacher has this code.";
  else if (!owner.isActive) errors.code = "This code is switched off.";
  if (!form.referredName.trim()) errors.referredName = "Enter the new teacher's name.";
  const phone = form.referredPhone.trim();
  if (phone && !/^\+?[\d\s-]{10,15}$/.test(phone)) errors.referredPhone = "Enter a valid phone number.";
  const email = form.referredEmail.trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.referredEmail = "Enter a valid email.";
  const amount = form.baseAmount.trim();
  if (!/^\d{1,10}(\.\d{1,2})?$/.test(amount)) errors.baseAmount = "Enter an amount, with at most 2 decimals.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(form.joinedOn)) errors.joinedOn = "Choose a date.";
  if (Object.keys(errors).length || !owner) return { errors, value: null };
  return {
    errors,
    value: {
      referrerUserId: owner.userId,
      codeUsed: code,
      referredName: form.referredName.trim(),
      referredPhone: phone || null,
      referredEmail: email || null,
      joinedOn: form.joinedOn,
      baseAmount: Number(amount),
      commissionPercent: owner.commissionPercent,
      note: form.note.trim() || null,
    },
  };
}

export async function listReferrals(organizationId: string): Promise<TeacherReferral[]> {
  const { data, error } = await supabase
    .from("teacher_referrals")
    .select(REFERRAL_COLUMNS)
    .eq("organizationId", organizationId)
    .order("joinedOn", { ascending: false })
    .order("createdAt", { ascending: false });
  if (error) fail(error);
  return (data ?? []).map((r) => toReferral(r as Record<string, unknown>));
}

/** The signed-in teacher's own referrals. */
export async function listMyReferrals(userId: string): Promise<TeacherReferral[]> {
  const { data, error } = await supabase
    .from("teacher_referrals")
    .select(REFERRAL_COLUMNS)
    .eq("referrerUserId", userId)
    .order("joinedOn", { ascending: false });
  if (error) fail(error);
  return (data ?? []).map((r) => toReferral(r as Record<string, unknown>));
}

export async function createReferral(organizationId: string, input: ReferralInput): Promise<TeacherReferral> {
  const { data, error } = await supabase
    .from("teacher_referrals")
    .insert({ ...input, organizationId })
    .select(REFERRAL_COLUMNS)
    .single();
  if (error) fail(error);
  return toReferral(data as Record<string, unknown>);
}

/** Moves a referral along. Paying it stamps the date and the reference. */
export async function setReferralStatus(
  id: string,
  status: ReferralStatus,
  payment?: { paidOn: string; paymentReference: string | null },
): Promise<TeacherReferral> {
  const patch =
    status === "PAID"
      ? { status, paidOn: payment?.paidOn ?? null, paymentReference: payment?.paymentReference ?? null }
      : { status, paidOn: null, paymentReference: null };
  const { data, error } = await supabase
    .from("teacher_referrals")
    .update(patch)
    .eq("id", id)
    .select(REFERRAL_COLUMNS)
    .single();
  if (error) fail(error);
  return toReferral(data as Record<string, unknown>);
}

/* ------------------------------------------------------------------- Summary */

export interface ReferralSummary {
  count: number;
  /** Approved but not yet paid. */
  owed: number;
  pending: number;
  paid: number;
}

export function summariseReferrals(rows: Pick<TeacherReferral, "status" | "rewardAmount">[]): ReferralSummary {
  const paise = { owed: 0, pending: 0, paid: 0 };
  let count = 0;
  for (const r of rows) {
    if (r.status === "REJECTED") continue;
    count += 1;
    const p = Math.round(r.rewardAmount * 100);
    if (r.status === "APPROVED") paise.owed += p;
    else if (r.status === "PENDING") paise.pending += p;
    else if (r.status === "PAID") paise.paid += p;
  }
  return { count, owed: paise.owed / 100, pending: paise.pending / 100, paid: paise.paid / 100 };
}
