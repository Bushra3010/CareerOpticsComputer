// Creates (or resets) the ERP admin through Supabase's admin API, which skips
// the public sign-up's mailbox check that rejects domains like careeroptics.in.
//
//   SUPABASE_ACCESS_TOKEN=sbp_... node scripts/create-admin.mjs
//
// The service-role key is fetched at runtime with the access token and never
// written to disk.
import readline from "node:readline/promises";
import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  (await readFile(new URL("../.env", import.meta.url), "utf-8"))
    .split("\n")
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
);
const url = env.VITE_SUPABASE_URL;
const ref = new URL(url).hostname.split(".")[0];
const token = process.env.SUPABASE_ACCESS_TOKEN;
if (!token) throw new Error("Set SUPABASE_ACCESS_TOKEN");

let keys;
for (let attempt = 1; attempt <= 5; attempt++) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/api-keys`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  keys = await res.json().catch(() => null);
  if (Array.isArray(keys)) break;
  console.log(`Supabase answered ${res.status}: ${JSON.stringify(keys)} — retrying...`);
  await new Promise((r) => setTimeout(r, 3000 * attempt));
}
if (!Array.isArray(keys)) throw new Error("Could not read the project's API keys");
const serviceKey = keys.find((k) => k.name === "service_role")?.api_key;
if (!serviceKey) throw new Error("Could not read the service_role key");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const email = (await rl.question("Email [admin@careeroptics.in]: ")).trim() || "admin@careeroptics.in";
const password = (await rl.question("Password (min 6 chars): ")).trim();
rl.close();
if (password.length < 6) throw new Error("Password must be at least 6 characters");

const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
const user_metadata = { name: "Career Optics Admin", role: "SUPER_ADMIN", userType: "ORGANIZATION" };

const { data: list } = await admin.auth.admin.listUsers();
const existing = list?.users.find((u) => u.email === email);
const { error } = existing
  ? await admin.auth.admin.updateUserById(existing.id, { password, email_confirm: true })
  : await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata });
if (error) throw error;
console.log(`\n${existing ? "Password reset for" : "Created"} ${email}. Organization link follows automatically.`);
