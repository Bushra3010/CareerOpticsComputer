/**
 * Vercel Routing Middleware: a franchise centre's own domain shows that
 * centre's website.
 *
 * Every centre's site is one static page, /site.html, which reads the host
 * in the browser and loads the centre from Supabase (website/behaviour/
 * site.js). So a request for a page on a centre's domain -- "/", "/about.html"
 * or any other page address -- is rewritten to /site.html; the address bar
 * keeps what the visitor typed.
 *
 * Left alone:
 *  - the head office's hosts (careeropticscomputer.in with or without www,
 *    career-optics-computer.vercel.app, preview
 *    deployments, localhost): they serve the website exactly as before;
 *  - the ERP (/computercentre), images, assets and /c/<slug> (vercel.json
 *    already sends that to /site.html), and any file with an extension other
 *    than .html/.php, so the page's own scripts, styles and logo load.
 *
 * Self-contained on purpose: this file runs on the edge, outside Vite's
 * build, and a failure here takes the whole website down (every page
 * answers 500). So it imports nothing, decides with plain string checks, and
 * on any surprise lets the request through untouched. The host rules mirror
 * isHeadOfficeHost in src/lib/branchSite.ts -- change them together.
 */

export const config = {
  matcher: ["/((?!computercentre/|image/|assets/|css/|c/|_vercel/).*)"],
};

/** Hosts that serve the head-office website rather than a centre's. */
const HEAD_OFFICE_HOSTS = ["careeropticscomputer.in", "career-optics-computer.vercel.app", "localhost", "127.0.0.1", "[::1]", "::1"];

/** Lowercase, no port, trailing dot or leading `www.`. */
function normaliseHost(input: string): string {
  return String(input || "")
    .trim()
    .toLowerCase()
    .replace(/(:\d+)?\.?$/, "")
    .replace(/^www\./, "");
}

function isHeadOfficeHost(hostname: string): boolean {
  const host = normaliseHost(hostname);
  return !host || HEAD_OFFICE_HOSTS.indexOf(host) >= 0 || host.endsWith(".vercel.app") || host.endsWith(".localhost");
}

/** A page address: "/", a path with no extension, or an .html/.php file. */
function isPage(pathname: string): boolean {
  return pathname === "/" || !/\.[a-z0-9]+$/i.test(pathname) || /\.(html|php)$/i.test(pathname);
}

const SKIP = /^\/(computercentre|image|assets|css|c)(\/|$)/;

export default function middleware(request: Request): Response | undefined {
  try {
    const url = new URL(request.url);
    const host = request.headers.get("host") || url.hostname;
    if (isHeadOfficeHost(host) || SKIP.test(url.pathname) || !isPage(url.pathname)) return undefined;
    return new Response(null, {
      headers: { "x-middleware-rewrite": `${url.protocol}//${url.host}/site.html` },
    });
  } catch {
    return undefined;
  }
}
