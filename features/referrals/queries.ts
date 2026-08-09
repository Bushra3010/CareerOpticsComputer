import { createClient } from "@/lib/db/server";
import { formatPaise, type Paise } from "@/lib/money";

export interface ReferralCodeRow {
  id: string;
  code: string;
  ownerType: "centre" | "user";
  ownerLabel: string;
  status: "draft" | "active" | "retired";
  validUntil: string | null;
  createdOn: string;
}

async function centreNamesByIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  ids: string[],
): Promise<Map<string, string>> {
  if (ids.length === 0) return new Map();
  const { data } = await supabase
    .from("centres")
    .select("id, name")
    .in("id", ids);
  return new Map((data ?? []).map((c) => [c.id, c.name]));
}

export async function listReferralCodesForAdmin(): Promise<ReferralCodeRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("referral_codes")
    .select("id, code, owner_type, owner_id, status, valid_until, created_at")
    .order("created_at", { ascending: false });

  const rows = data ?? [];
  const centreIds = rows
    .filter((r) => r.owner_type === "centre")
    .map((r) => r.owner_id);
  const names = await centreNamesByIds(supabase, centreIds);

  return rows.map((r) => ({
    id: r.id,
    code: r.code,
    ownerType: r.owner_type,
    ownerLabel:
      r.owner_type === "centre"
        ? (names.get(r.owner_id) ?? "Unknown centre")
        : "Individual user",
    status: r.status,
    validUntil: r.valid_until,
    createdOn: r.created_at.slice(0, 10),
  }));
}

/** A centre's own codes — RLS already scopes this to codes it owns. */
export async function listReferralCodesForCentre(): Promise<ReferralCodeRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("referral_codes")
    .select("id, code, owner_type, owner_id, status, valid_until, created_at")
    .order("created_at", { ascending: false });

  return (data ?? []).map((r) => ({
    id: r.id,
    code: r.code,
    ownerType: r.owner_type,
    ownerLabel: "Your centre",
    status: r.status,
    validUntil: r.valid_until,
    createdOn: r.created_at.slice(0, 10),
  }));
}

export interface ReferralRow {
  id: string;
  code: string;
  referredEntityType: "lead" | "student" | "centre";
  referredEntityLabel: string;
  status: "pending" | "attributed" | "expired" | "rejected";
  qualifyingEvent: string | null;
  createdOn: string;
}

export async function listReferralsForAdmin(): Promise<ReferralRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("referrals")
    .select(
      "id, referred_entity_type, referred_entity_id, status, qualifying_event, created_at, referral_codes(code)",
    )
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as unknown as {
    id: string;
    referred_entity_type: "lead" | "student" | "centre";
    referred_entity_id: string;
    status: "pending" | "attributed" | "expired" | "rejected";
    qualifying_event: string | null;
    created_at: string;
    referral_codes: { code: string } | { code: string }[] | null;
  }[];

  const centreIds = rows
    .filter((r) => r.referred_entity_type === "centre")
    .map((r) => r.referred_entity_id);
  const names = await centreNamesByIds(supabase, centreIds);

  return rows.map((r) => {
    const codeRel = r.referral_codes;
    const code = Array.isArray(codeRel)
      ? (codeRel[0]?.code ?? "")
      : (codeRel?.code ?? "");
    return {
      id: r.id,
      code,
      referredEntityType: r.referred_entity_type,
      referredEntityLabel:
        r.referred_entity_type === "centre"
          ? (names.get(r.referred_entity_id) ?? "Unknown centre")
          : `${r.referred_entity_type} ${r.referred_entity_id.slice(0, 8)}`,
      status: r.status,
      qualifyingEvent: r.qualifying_event,
      createdOn: r.created_at.slice(0, 10),
    };
  });
}

export interface CommissionRuleRow {
  id: string;
  event: string;
  amountLabel: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  status: "draft" | "active" | "retired";
}

export async function listCommissionRules(): Promise<CommissionRuleRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("commission_rules")
    .select(
      "id, event, amount_type, flat_amount_paise, percentage, effective_from, effective_to, status",
    )
    .order("effective_from", { ascending: false });

  return (data ?? []).map((r) => ({
    id: r.id,
    event: r.event,
    amountLabel:
      r.amount_type === "flat"
        ? formatPaise(r.flat_amount_paise as Paise)
        : `${r.percentage}%`,
    effectiveFrom: r.effective_from,
    effectiveTo: r.effective_to,
    status: r.status,
  }));
}

export interface CommissionEntryRow {
  id: string;
  beneficiaryType: "centre" | "user";
  beneficiaryLabel: string;
  amountLabel: string;
  status: "pending" | "approved" | "payable" | "paid" | "reversed";
  createdOn: string;
}

export async function listCommissionEntriesForAdmin(): Promise<
  CommissionEntryRow[]
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("commission_entries")
    .select(
      "id, beneficiary_type, beneficiary_id, amount_paise, status, created_at",
    )
    .order("created_at", { ascending: false });

  const rows = data ?? [];
  const centreIds = rows
    .filter((r) => r.beneficiary_type === "centre")
    .map((r) => r.beneficiary_id);
  const names = await centreNamesByIds(supabase, centreIds);

  return rows.map((r) => ({
    id: r.id,
    beneficiaryType: r.beneficiary_type,
    beneficiaryLabel:
      r.beneficiary_type === "centre"
        ? (names.get(r.beneficiary_id) ?? "Unknown centre")
        : "Individual user",
    amountLabel: formatPaise(r.amount_paise as Paise),
    status: r.status,
    createdOn: r.created_at.slice(0, 10),
  }));
}

/** A centre's own commission entries — RLS scopes this to entries it is the beneficiary of. */
export async function listCommissionEntriesForCentre(): Promise<
  CommissionEntryRow[]
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("commission_entries")
    .select("id, beneficiary_type, amount_paise, status, created_at")
    .order("created_at", { ascending: false });

  return (data ?? []).map((r) => ({
    id: r.id,
    beneficiaryType: r.beneficiary_type,
    beneficiaryLabel: "Your centre",
    amountLabel: formatPaise(r.amount_paise as Paise),
    status: r.status,
    createdOn: r.created_at.slice(0, 10),
  }));
}

export interface PendingReferralOption {
  id: string;
  code: string;
  referredLabel: string;
}

/** Referrals still `pending`, for the "qualify" picker. */
export async function listPendingReferrals(): Promise<PendingReferralOption[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("referrals")
    .select(
      "id, referred_entity_type, referred_entity_id, referral_codes(code)",
    )
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as unknown as {
    id: string;
    referred_entity_type: string;
    referred_entity_id: string;
    referral_codes: { code: string } | { code: string }[] | null;
  }[];

  return rows.map((r) => {
    const codeRel = r.referral_codes;
    const code = Array.isArray(codeRel)
      ? (codeRel[0]?.code ?? "")
      : (codeRel?.code ?? "");
    return {
      id: r.id,
      code,
      referredLabel: `${r.referred_entity_type} ${r.referred_entity_id.slice(0, 8)}`,
    };
  });
}
