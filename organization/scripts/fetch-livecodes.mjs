#!/usr/bin/env node
/**
 * Puts the full LiveCodes app (menus, projects, templates, import/export,
 * every language) in public/coder/, for the Code Lab.
 *
 * Why not the SDK's embed: livecodes.io always shows its cut-down embed UI
 * when it is inside a frame on another site. The app shows its full UI only
 * when it is served from our own origin, so the release's app files are
 * self-hosted here (as LiveCodes documents for self-hosting). They must be:
 * LiveCodes' compiler sandbox answers only the origin the app files came from.
 *
 * One patch: `?full` opens the full UI even inside a frame -- the frame is
 * ours, the Code Lab page. Without it the loader behaves as shipped. Student
 * code still runs on LiveCodes' sandbox origin, never on ours.
 *
 * Only the app is kept from the release: its docs and storybook are ~140 MB.
 *
 * Run from organization/:  node scripts/fetch-livecodes.mjs [version]
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const version = process.argv[2] || "49";
const url = `https://github.com/live-codes/livecodes/releases/download/v${version}/livecodes-v${version}.tar.gz`;
const out = path.resolve("public/coder");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "livecodes-"));

try {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url}: ${response.status}`);
  const archive = path.join(tmp, "livecodes.tar.gz");
  fs.writeFileSync(archive, Buffer.from(await response.arrayBuffer()));
  execFileSync("tar", ["xzf", archive, "-C", tmp]);

  const build = path.join(tmp, "build");
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });
  for (const item of ["index.html", "app.html", "favicon.ico", "livecodes"]) {
    fs.cpSync(path.join(build, item), path.join(out, item), { recursive: true });
  }

  const loaderName = fs.readdirSync(path.join(out, "livecodes")).find((f) => /^index\.[a-f0-9]+\.js$/.test(f));
  if (!loaderName) throw new Error("No loader script in the release.");
  const loaderPath = path.join(out, "livecodes", loaderName);
  const from = 'r.get("embed")!=null&&r.get("embed")!=="false"||O()';
  const loader = fs.readFileSync(loaderPath, "utf8");
  if (!loader.includes(from)) throw new Error(`LiveCodes v${version} changed; cannot patch the embed check.`);
  fs.writeFileSync(loaderPath, loader.replace(from, `${from}&&r.get("full")==null`));

  console.log(`LiveCodes v${version} ready in ${path.relative(process.cwd(), out)}/`);
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
