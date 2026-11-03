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
 *  - the head office's hosts (career-optics-computer.vercel.app, preview
 *    deployments, localhost): they serve the website exactly as before;
 *  - the ERP (/computercentre), images, assets and /c/<slug> (vercel.json
 *    already sends that to /site.html), and any file with an extension other
 *    than .html/.php, so the page's own scripts, styles and logo load.
 *
 * No dependency: the rewrite is the `x-middleware-rewrite` header that
 * @vercel/functions' rewrite() would set.
 */
import { isHeadOfficeHost } from "./src/lib/branchSite";

export const config = {
  // Static files never reach the middleware at all.
  matcher: [
    "/((?!computercentre|image/|assets/|css/|c/|_vercel|.*\\.(?:js|mjs|css|png|jpe?g|webp|gif|svg|ico|json|txt|xml|webmanifest|woff2?|ttf|map|pdf|mp4)$).*)",
  ],
};

const SKIP = /^\/(computercentre|image|assets|css|c)(\/|$)/;

export default function middleware(request: Request): Response {
  const url = new URL(request.url);
  const host = request.headers.get("host") || url.hostname;
  const isPage = url.pathname === "/" || !/\.[a-z0-9]+$/i.test(url.pathname) || /\.(html|php)$/i.test(url.pathname);

  if (isHeadOfficeHost(host) || SKIP.test(url.pathname) || !isPage) {
    return new Response(null, { headers: { "x-middleware-next": "1" } });
  }
  return new Response(null, { headers: { "x-middleware-rewrite": new URL("/site.html", url).toString() } });
}
