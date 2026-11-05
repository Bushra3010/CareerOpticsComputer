/**
 * Franchise centre websites: the rules shared by the ERP screens, the Vercel
 * middleware (middleware.ts) and the tests. The public page's own script,
 * website/behaviour/site.js, runs without a bundler and carries a copy of
 * `resolveSite` and `isHeadOfficeHost` -- change them together.
 *
 * The database holds the same rules (supabase/schema/branch-sites.sql), so a
 * value these accept is one the save accepts.
 */

/** Where the head-office website and every centre's free link live. */
export const MAIN_SITE_HOST = "www.careeropticscomputer.in";
export const MAIN_SITE_ORIGIN = `https://${MAIN_SITE_HOST}`;

/**
 * Hosts that serve the head-office website rather than a centre's. Add the
 * organisation's own domain here (and in site.js) when it gets one.
 */
export const HEAD_OFFICE_HOSTS = [
  // Compared after normaliseHost, which drops "www." -- so this covers both
  // careeropticscomputer.in and www.careeropticscomputer.in.
  "careeropticscomputer.in",
  "career-optics-computer.vercel.app",
  "localhost",
  "127.0.0.1",
  "[::1]",
  "::1",
];

/** What a centre points its domain at, as Vercel asks. */
export const DNS_A_RECORD = "76.76.21.21";
export const DNS_CNAME_TARGET = "cname.vercel-dns.com";

export const SLUG_MIN = 3;
export const SLUG_MAX = 40;
const SLUG_RE = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;

export const siteLink = (slug: string) => `${MAIN_SITE_ORIGIN}/c/${slug}`;

/** Lowercase, no scheme, path, port, trailing dot or leading `www.`. */
export function normaliseHost(input: string | null | undefined): string {
  return String(input ?? "")
    .trim()
    .toLowerCase()
    .replace(/^[a-z]+:\/\//, "")
    .replace(/[/?#].*$/, "")
    .replace(/(:\d+)?\.?$/, "")
    .replace(/^www\./, "");
}

/**
 * Vercel's own hosts are the head office too: preview deployments live on
 * `*.vercel.app`, and a centre cannot own a name there anyway.
 */
export function isHeadOfficeHost(hostname: string): boolean {
  const host = normaliseHost(hostname);
  return !host || HEAD_OFFICE_HOSTS.includes(host) || host.endsWith(".vercel.app") || host.endsWith(".localhost");
}

/** Text as a slug: "Ara Main Centre" → "ara-main-centre". */
export function slugify(text: string): string {
  return String(text ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_MAX)
    .replace(/-+$/g, "");
}

/** Why a slug cannot be used, or null when it can. */
export function slugError(slug: string): string | null {
  const value = String(slug ?? "").trim();
  if (!value) return "Enter a link name.";
  if (value.length < SLUG_MIN) return `Use at least ${SLUG_MIN} characters.`;
  if (value.length > SLUG_MAX) return `Use at most ${SLUG_MAX} characters.`;
  if (/[A-Z]/.test(value)) return "Use lowercase letters only.";
  if (!/^[a-z0-9-]+$/.test(value)) return "Use only letters a–z, numbers and hyphens (-).";
  if (!SLUG_RE.test(value)) return "The link cannot start or end with a hyphen.";
  return null;
}

/** Why a domain cannot be connected, or null when it can. Checks the normalised form. */
export function hostnameError(input: string): string | null {
  const host = normaliseHost(input);
  if (!host) return "Enter your domain, like mycentre.com.";
  if (host.length > 253) return "That domain is too long.";
  const labels = host.split(".");
  if (labels.length < 2) return "Enter the full domain, like mycentre.com.";
  for (const label of labels) {
    if (!label || label.length > 63 || !/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(label)) {
      return `"${host}" is not a valid domain. Enter it like mycentre.com, without https://.`;
    }
  }
  const tld = labels[labels.length - 1];
  if (!/^([a-z]{2,63}|xn--[a-z0-9-]{1,59})$/.test(tld)) return `"${host}" does not end in a real domain ending like .com or .in.`;
  if (isHeadOfficeHost(host) || /(^|\.)(vercel\.com|supabase\.co)$/.test(host)) return "Please enter a domain you own, like mycentre.com.";
  return null;
}

export type SiteTarget = { slug: string } | { host: string } | null;

/**
 * Which centre a request is for: `/c/<slug>` names it on any host; otherwise
 * a host that is not the head office's is a centre's own domain. Null means
 * the head-office website.
 */
export function resolveSite(pathname: string, hostname: string): SiteTarget {
  const match = /^\/c\/([^/?#]+)\/?$/.exec(pathname || "");
  if (match) {
    let slug = match[1];
    try {
      slug = decodeURIComponent(slug);
    } catch {
      /* a broken escape stays as typed; the lookup simply finds nothing */
    }
    return { slug: slug.toLowerCase() };
  }
  if (!isHeadOfficeHost(hostname)) return { host: normaliseHost(hostname) };
  return null;
}

export type DomainStatus = "NONE" | "PENDING" | "LIVE" | "ERROR";

export const DOMAIN_STATUS_LABEL: Record<DomainStatus, string> = {
  NONE: "Not connected",
  PENDING: "Pending",
  LIVE: "Live",
  ERROR: "Needs attention",
};
