import { defineConfig, loadEnv, type Plugin, type ViteDevServer } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, pathToFileURL } from "node:url";
import fs from "node:fs";
import path from "node:path";

/** The ERP lives under this path; the public website owns everything else. */
const APP_BASE = "/computercentre/";

const root = fileURLToPath(new URL(".", import.meta.url));
const websiteDir = path.join(root, "website");
/** The website's images, scripts and styles, served as they are. */
const websitePublic = path.join(websiteDir, "public");
const distDir = path.join(root, "dist");

/**
 * What website/public/cms.js needs to read the content the ERP saves: the same
 * Supabase project and public (anon) key the ERP itself is built with.
 */
function cmsConfig(env: Record<string, string>) {
  const config = { url: env.VITE_SUPABASE_URL || "", key: env.VITE_SUPABASE_ANON_KEY || "" };
  return `window.CMS_CONFIG = ${JSON.stringify(config)};\n`;
}

/** The website's React renderer: website/render.tsx. */
type WebsiteRenderer = { pageNames: string[]; renderPage: (name: string) => string | null };

/** Every page of the website, named for the ERP's page picker. */
function websitePages(site: WebsiteRenderer) {
  return site.pageNames.map((name) => {
    const html = site.renderPage(name) ?? "";
    const h1 = /<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(html)?.[1] ?? "";
    const heading = h1.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&[a-z#0-9]+;/gi, " ").replace(/\s+/g, " ").trim();
    return { name, heading: heading.slice(0, 80) };
  });
}

/** In dev: the renderer, reloaded from source on each request. */
const devRenderer = (server: ViteDevServer) =>
  server.ssrLoadModule("/website/render.tsx") as Promise<WebsiteRenderer>;

/**
 * For a build: the renderer compiled once for Node, the way Vite compiles the
 * ERP, then loaded. Its output sits under node_modules so it resolves React
 * from the project.
 */
async function buildRenderer(): Promise<WebsiteRenderer> {
  const { build } = await import("vite");
  const outDir = path.join(root, "node_modules", ".website-ssr");
  await build({
    configFile: false,
    root,
    logLevel: "warn",
    plugins: [react()],
    publicDir: false, // the ERP's public files are not the website's
    build: { ssr: path.join(websiteDir, "render.tsx"), outDir, emptyOutDir: true, minify: false },
  });
  const entry = fs.readdirSync(outDir).find((f) => /^render\.m?js$/.test(f));
  if (!entry) throw new Error("The website renderer did not build.");
  return import(`${pathToFileURL(path.join(outDir, entry)).href}?t=${Date.now()}`);
}

/**
 * The public website (React pages in `website/`) is served from the site
 * root, next to the ERP. Its pages are rendered to HTML -- per request in
 * dev, once on build into `dist/` around the ERP's own `dist/computercentre/`
 * -- together with the host redirects that keep the ERP's client-side routes
 * and the old `.php` addresses working.
 */
function website(env: Record<string, string>): Plugin {
  return {
    name: "public-website",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = decodeURIComponent((req.url || "/").split("?")[0]);
        // The Code Lab's LiveCodes app (public/coder) is served untouched: the
        // dev server would otherwise inject its client into the HTML ahead of
        // LiveCodes' import map, which the browser then ignores, and the app
        // never finishes loading. Its compiler, on LiveCodes' sandbox origin,
        // also reads these files cross-origin.
        if (url.startsWith(`${APP_BASE}coder/`)) {
          const coderDir = path.join(root, "public", "coder");
          let file = path.join(coderDir, url.slice(`${APP_BASE}coder/`.length));
          if (file.endsWith(path.sep) || file === coderDir) file = path.join(file, "index.html");
          if (!file.startsWith(coderDir) || !fs.existsSync(file) || !fs.statSync(file).isFile()) return next();
          const types: Record<string, string> = {
            ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json",
            ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".xml": "application/xml", ".ico": "image/x-icon", ".woff2": "font/woff2", ".wasm": "application/wasm",
            ".webmanifest": "application/manifest+json",
          };
          res.setHeader("Content-Type", types[path.extname(file)] || "application/octet-stream");
          res.setHeader("Access-Control-Allow-Origin", "*");
          return void fs.createReadStream(file).pipe(res);
        }
        if (url.startsWith(APP_BASE) || url === APP_BASE.slice(0, -1)) return next();
        if (url === "/cms-config.js") {
          res.setHeader("Content-Type", "text/javascript");
          return res.end(cmsConfig(env));
        }
        try {
          if (url === "/cms-pages.json") {
            res.setHeader("Content-Type", "application/json");
            return res.end(JSON.stringify(websitePages(await devRenderer(server))));
          }
          const page = url === "/" ? "index" : /^\/([^/]+)\.(html|php)$/.exec(url)?.[1];
          if (page) {
            const html = (await devRenderer(server)).renderPage(page);
            if (html !== null) {
              res.setHeader("Content-Type", "text/html; charset=utf-8");
              return res.end(html);
            }
          }
        } catch (error) {
          return next(error);
        }
        const file = path.join(websitePublic, url);
        if (!file.startsWith(websitePublic) || !fs.existsSync(file) || !fs.statSync(file).isFile()) return next();
        const types: Record<string, string> = { ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml" };
        res.setHeader("Content-Type", types[path.extname(file).toLowerCase()] || "application/octet-stream");
        fs.createReadStream(file).pipe(res);
      });
    },
    buildStart() {
      fs.rmSync(distDir, { recursive: true, force: true });
    },
    async closeBundle() {
      const site = await buildRenderer();
      for (const name of site.pageNames) fs.writeFileSync(path.join(distDir, `${name}.html`), site.renderPage(name)!);
      const pageList = websitePages(site); // headings read before the optimiser rewrites the pages
      fs.cpSync(websitePublic, distDir, { recursive: true });
      // Tailwind, icons and images, done once here instead of in every
      // visitor's browser. See scripts/optimize-website.mjs.
      const { optimizeWebsite } = await import("./scripts/optimize-website.mjs");
      const report = await optimizeWebsite(distDir, { supabaseUrl: env.VITE_SUPABASE_URL });
      this.info?.(`website optimised: ${JSON.stringify(report)}`);
      fs.writeFileSync(path.join(distDir, "cms-config.js"), cmsConfig(env));
      fs.writeFileSync(path.join(distDir, "cms-pages.json"), JSON.stringify(pageList));
      const redirects = [
        `${APP_BASE.slice(0, -1)}  ${APP_BASE}  301`,
        `${APP_BASE}*  ${APP_BASE}index.html  200`,
        ...site.pageNames.map((p) => `/${p}.php  /${p}.html  301`),
      ];
      fs.writeFileSync(path.join(distDir, "_redirects"), redirects.join("\n") + "\n");
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: APP_BASE,
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), website({ ...loadEnv(mode, root, "VITE_"), ...process.env } as Record<string, string>)],
  build: {
    outDir: "dist/computercentre",
    emptyOutDir: true,
    rolldownOptions: {
      output: {
        codeSplitting: { groups: [
          { name: "ui", test: /node_modules\/@radix-ui/ },
          { name: "react", test: /node_modules\/(react|react-dom|react-router)/ },
          { name: "icons", test: /node_modules\/lucide-react/ },
          { name: "data", test: /node_modules\/(@tanstack|date-fns|zod)/ },
        ] },
      },
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
}));
