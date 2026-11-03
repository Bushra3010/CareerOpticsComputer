/**
 * A centre's own website (/c/<slug>, or its own domain): the calls behind
 * My Website (centre) and Franchise Websites (head office). The tables,
 * guard and functions are in supabase/schema/branch-sites.sql; connecting a
 * domain on Vercel is the manage-domain Edge Function.
 */
import { supabase } from "./client";
import { updateBranchSettings } from "./data";
import type { DomainStatus } from "@/lib/branchSite";

const SETUP_HINT = "Centre websites are not set up yet. Run supabase/schema/branch-sites.sql in Supabase.";

/** The database words its refusals for people after "INVALID: "; anything else is passed on plainly. */
export function siteError(error: unknown): Error {
  const raw = error instanceof Error ? error.message : String((error as { message?: string })?.message ?? error ?? "");
  if (/INVALID:/.test(raw)) return new Error(raw.replace(/^[\s\S]*INVALID:\s*/, ""));
  if (/branch_settings_slug_key/.test(raw)) return new Error("That link is already taken by another centre. Please choose another.");
  if (/branch_settings_custom_domain_key/.test(raw)) return new Error("That domain is already connected to another centre.");
  if (/branch_settings_slug_format/.test(raw)) return new Error("The link may use only lowercase letters, numbers and hyphens.");
  if (/function .*(branch_slug_available|request_branch_domain).*does not exist|PGRST202|schema cache/i.test(raw)) return new Error(SETUP_HINT);
  return new Error(raw || "Something went wrong. Please try again.");
}

/** The content fields My Website edits; branch-sites.sql adds the ones the old form lacked. */
export const SITE_CONTENT_FIELDS = ["bannerTitle", "bannerSubtitle", "aboutText", "highlights", "logo", "banner"] as const;
export type SiteContent = Partial<Record<(typeof SITE_CONTENT_FIELDS)[number], string>>;

/**
 * Saves a centre's link and copy. Fields the database does not have yet are
 * dropped by updateBranchSettings and reported back, as on Website Settings.
 */
export async function saveSiteContent(branchId: string, input: SiteContent & { slug?: string }) {
  try {
    return await updateBranchSettings(branchId, input);
  } catch (error) {
    throw siteError(error);
  }
}

/** Whether no other centre has this link. A centre cannot read other centres' rows, so the database answers. */
export async function isSlugAvailable(slug: string, branchId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("branch_slug_available", { p_slug: slug, p_branch_id: branchId });
  if (error) throw siteError(error);
  return data !== false;
}

/**
 * A centre asks for its own domain (null withdraws it). It is stored as
 * PENDING and the head office gets a Help & Support ticket to connect it.
 */
export async function requestDomain(branchId: string, domain: string | null) {
  const { data, error } = await supabase.rpc("request_branch_domain", { p_branch_id: branchId, p_domain: domain });
  if (error) throw siteError(error);
  return data as { customDomain: string | null; domainStatus: DomainStatus };
}

/** Head office: switch a site on or off, or set / clear its domain directly. */
export async function updateSiteAdmin(branchId: string, patch: { siteEnabled?: boolean; customDomain?: string | null; domainStatus?: DomainStatus }) {
  try {
    return await updateBranchSettings(branchId, patch);
  } catch (error) {
    throw siteError(error);
  }
}

export type DomainAction = "add" | "check" | "remove";

export interface DomainResult {
  domain: string;
  domainStatus: DomainStatus;
  message: string;
  /** DNS records still to be set, as Vercel reports them. */
  records?: Array<{ type: string; name: string; value: string }>;
}

/**
 * Connects, checks or removes a centre's domain on the Vercel project. The
 * Edge Function holds the Vercel token; the browser never sees it.
 */
export async function manageDomain(action: DomainAction, branchId: string): Promise<DomainResult> {
  const { data, error } = await supabase.functions.invoke("manage-domain", { body: { action, branchId } });
  if (error) {
    // The function's own JSON error is the useful part of a non-2xx reply.
    const context = (error as { context?: { json?: () => Promise<{ error?: string }> } }).context;
    const body = context?.json ? await context.json().catch(() => null) : null;
    throw new Error(body?.error || error.message || "The domain service could not be reached.");
  }
  if (data?.error) throw new Error(String(data.error));
  return data as DomainResult;
}
