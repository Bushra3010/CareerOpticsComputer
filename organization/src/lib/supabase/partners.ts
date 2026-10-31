import { supabase } from "./client";

/**
 * Referral partners and their commission ledger (supabase/schema/partners.sql).
 *
 * Row-level security limits both tables to organisation admins of the
 * partner's own organisation; the `organizationId` filters below only keep a
 * super admin's view to the organisation it is signed in to.
 */

const SETUP_HINT = "The partner tables are not set up yet. Run supabase/schema/partners.sql in Supabase.";

const missingTable = (error: { code?: string; message?: string }) =>
  error.code === "42P01" || error.code === "PGRST205" || /does not exist|schema cache/i.test(error.message || "");

function fail(error: { code?: string; message?: string }): never {
  throw new Error(missingTable(error) ? SETUP_HINT : error.message || "Request failed");
}

/* ------------------------------------------------------------------ Partners */

export const PARTNER_TYPES = ["individual", "organization", "institution"] as const;
export type PartnerType = (typeof PARTNER_TYPES)[number];
export type PartnerStatus = "ACTIVE" | "INACTIVE";

export interface Partner {
  id: string;
  organizationId: string;
  name: string;
  partnerType: PartnerType;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  commissionPercent: number;
  status: PartnerStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PartnerInput {
  name: string;
  partnerType: PartnerType;
  contactPerson: string | null;
  phone: string;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  commissionPercent: number;
  status: PartnerStatus;
  notes: string | null;
}

/** What the partner form holds: every field as typed. */
export interface PartnerFormValues {
  name: string;
  partnerType: PartnerType;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  commissionPercent: string;
  status: PartnerStatus;
  notes: string;
}

export const EMPTY_PARTNER_FORM: PartnerFormValues = {
  name: "",
  partnerType: "individual",
  contactPerson: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  state: "",
  commissionPercent: "",
  status: "ACTIVE",
  notes: "",
};

export const partnerToForm = (p: Partner): PartnerFormValues => ({
  name: p.name,
  partnerType: p.partnerType,
  contactPerson: p.contactPerson ?? "",
  phone: p.phone ?? "",
  email: p.email ?? "",
  address: p.address ?? "",
  city: p.city ?? "",
  state: p.state ?? "",
  commissionPercent: String(p.commissionPercent ?? ""),
  status: p.status,
  notes: p.notes ?? "",
});

// Indian mobile numbers: ten digits, the first 6-9.
const PHONE_RE = /^[6-9]\d{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type PartnerErrors = Partial<Record<keyof PartnerFormValues, string>>;

export function validatePartner(form: PartnerFormValues): { errors: PartnerErrors; value: PartnerInput | null } {
  const errors: PartnerErrors = {};
  const name = form.name.trim();
  // Spaces and dashes are how people type numbers; anything else is a mistake.
  const phone = form.phone.replace(/[\s-]/g, "");
  const email = form.email.trim();
  const commissionText = form.commissionPercent.trim();
  const commission = commissionText === "" ? 0 : Number(commissionText);

  if (!name) errors.name = "Partner name is required.";
  if (!PHONE_RE.test(phone)) errors.phone = "Enter a 10-digit mobile number starting with 6, 7, 8 or 9.";
  if (email && !EMAIL_RE.test(email)) errors.email = "Enter a valid email address.";
  if (!Number.isFinite(commission) || commission < 0 || commission > 100 || !/^\d+(\.\d{1,2})?$/.test(commissionText || "0"))
    errors.commissionPercent = "Commission must be between 0 and 100, with at most 2 decimals.";

  if (Object.keys(errors).length) return { errors, value: null };
  const orNull = (v: string) => v.trim() || null;
  return {
    errors,
    value: {
      name,
      partnerType: form.partnerType,
      contactPerson: orNull(form.contactPerson),
      phone,
      email: email || null,
      address: orNull(form.address),
      city: orNull(form.city),
      state: orNull(form.state),
      commissionPercent: commission,
      status: form.status,
      notes: orNull(form.notes),
    },
  };
}

const PARTNER_COLUMNS =
  'id, "organizationId", name, "partnerType", "contactPerson", phone, email, address, city, state, "commissionPercent", status, notes, "createdAt", "updatedAt"';

const toPartner = (row: Record<string, unknown>): Partner =>
  ({ ...row, commissionPercent: Number(row.commissionPercent ?? 0) }) as Partner;

export async function listPartners(organizationId: string): Promise<Partner[]> {
  const { data, error } = await supabase
    .from("partners")
    .select(PARTNER_COLUMNS)
    .eq("organizationId", organizationId)
    .is("deletedAt", null)
    .order("name");
  if (error) fail(error);
  return (data ?? []).map((r) => toPartner(r as Record<string, unknown>));
}

export async function createPartner(organizationId: string, input: PartnerInput): Promise<Partner> {
  const { data, error } = await supabase
    .from("partners")
    .insert({ ...input, organizationId })
    .select(PARTNER_COLUMNS)
    .single();
  if (error) fail(error);
  return toPartner(data as Record<string, unknown>);
}

export async function updatePartner(id: string, patch: Partial<PartnerInput>): Promise<void> {
  const { data, error } = await supabase.from("partners").update(patch).eq("id", id).select("id");
  if (error) fail(error);
  if (!data?.length) throw new Error("Partner not found, or you do not have permission to change it.");
}

/** Soft delete: the partner's ledger is history and stays. */
export async function deletePartner(id: string): Promise<void> {
  const { data, error } = await supabase
    .from("partners")
    .update({ deletedAt: new Date().toISOString() })
    .eq("id", id)
    .select("id");
  if (error) fail(error);
  if (!data?.length) throw new Error("Partner not found, or you do not have permission to delete it.");
}

/* -------------------------------------------------------------- Transactions */

export const TRANSACTION_TYPES = ["COMMISSION", "PAYOUT", "ADJUSTMENT"] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];
export type AdjustmentDirection = "CREDIT" | "DEBIT";

export interface PartnerTransaction {
  id: string;
  organizationId: string;
  partnerId: string;
  type: TransactionType;
  /** Only an adjustment has one; commission is always owed, a payout always paid. */
  direction: AdjustmentDirection | null;
  amount: number;
  reference: string | null;
  note: string | null;
  date: string;
  createdAt: string;
}

export interface TransactionInput {
  partnerId: string;
  type: TransactionType;
  direction: AdjustmentDirection | null;
  amount: number;
  reference: string | null;
  note: string | null;
  date: string;
}

export interface TransactionFormValues {
  partnerId: string;
  type: TransactionType;
  direction: AdjustmentDirection;
  amount: string;
  date: string;
  reference: string;
  note: string;
}

export type TransactionErrors = Partial<Record<keyof TransactionFormValues, string>>;

// numeric(12,2): up to ten digits before the point, two after.
const AMOUNT_RE = /^\d{1,10}(\.\d{1,2})?$/;

export function validateTransaction(form: TransactionFormValues): {
  errors: TransactionErrors;
  value: TransactionInput | null;
} {
  const errors: TransactionErrors = {};
  const amountText = form.amount.trim();
  if (!form.partnerId) errors.partnerId = "Choose a partner.";
  if (!AMOUNT_RE.test(amountText) || Number(amountText) <= 0)
    errors.amount = "Enter an amount greater than 0, with at most 2 decimals.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(form.date)) errors.date = "Choose a date.";
  if (Object.keys(errors).length) return { errors, value: null };
  return {
    errors,
    value: {
      partnerId: form.partnerId,
      type: form.type,
      direction: form.type === "ADJUSTMENT" ? form.direction : null,
      amount: Number(amountText),
      reference: form.reference.trim() || null,
      note: form.note.trim() || null,
      date: form.date,
    },
  };
}

const TX_COLUMNS = 'id, "organizationId", "partnerId", type, direction, amount, reference, note, date, "createdAt"';

const toTransaction = (row: Record<string, unknown>): PartnerTransaction =>
  ({ ...row, amount: Number(row.amount ?? 0) }) as PartnerTransaction;

export async function listPartnerTransactions(organizationId: string): Promise<PartnerTransaction[]> {
  const { data, error } = await supabase
    .from("partner_transactions")
    .select(TX_COLUMNS)
    .eq("organizationId", organizationId)
    .order("date", { ascending: false })
    .order("createdAt", { ascending: false });
  if (error) fail(error);
  return (data ?? []).map((r) => toTransaction(r as Record<string, unknown>));
}

export async function createPartnerTransaction(
  organizationId: string,
  input: TransactionInput,
): Promise<PartnerTransaction> {
  const { data, error } = await supabase
    .from("partner_transactions")
    .insert({ ...input, organizationId })
    .select(TX_COLUMNS)
    .single();
  if (error) fail(error);
  return toTransaction(data as Record<string, unknown>);
}

/* ------------------------------------------------------------------- Balance */

/** In paise, so a column of rupee amounts adds up exactly. */
const paise = (amount: number) => Math.round(amount * 100);

/** What the transaction does to the amount owed to the partner. */
export function signedAmount(tx: Pick<PartnerTransaction, "type" | "direction" | "amount">): number {
  if (tx.type === "COMMISSION") return tx.amount;
  if (tx.type === "PAYOUT") return -tx.amount;
  return tx.direction === "DEBIT" ? -tx.amount : tx.amount;
}

export interface LedgerSummary {
  commission: number;
  payouts: number;
  /** Net of credit and debit adjustments. */
  adjustments: number;
  /** commission - payouts + adjustments: positive means still owed to the partner. */
  balance: number;
}

export function summarise(txs: Pick<PartnerTransaction, "type" | "direction" | "amount">[]): LedgerSummary {
  let commission = 0;
  let payouts = 0;
  let adjustments = 0;
  for (const tx of txs) {
    const p = paise(tx.amount);
    if (tx.type === "COMMISSION") commission += p;
    else if (tx.type === "PAYOUT") payouts += p;
    else adjustments += tx.direction === "DEBIT" ? -p : p;
  }
  return {
    commission: commission / 100,
    payouts: payouts / 100,
    adjustments: adjustments / 100,
    balance: (commission - payouts + adjustments) / 100,
  };
}

/** Balance owed to each partner, by partner id. A partner with no rows is absent. */
export function partnerBalances(txs: PartnerTransaction[]): Map<string, number> {
  const byPartner = new Map<string, number>();
  for (const tx of txs) {
    byPartner.set(tx.partnerId, (byPartner.get(tx.partnerId) ?? 0) + paise(signedAmount(tx)));
  }
  return new Map([...byPartner].map(([id, p]) => [id, p / 100]));
}

export const formatRupees = (amount: number) =>
  `${amount < 0 ? "−" : ""}₹${Math.abs(amount).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
