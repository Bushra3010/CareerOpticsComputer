#!/usr/bin/env node
/**
 * Development seed — build plan §6 step 9, which Phase 1 never finished.
 *
 * `supabase/seed.sql` creates the organisation, permissions, roles and the
 * course catalogue. It creates no centres and no students, so every dashboard
 * renders its empty state and the three portals look broken rather than new.
 * This fills that in.
 *
 * WHAT THIS IS NOT
 * ----------------
 * This is not a fixture for the mockup numbers. The Super Admin mockup shows
 * 128 centres and 12,840 students; this creates 18 and about 580. Inserting
 * thirteen thousand students to make a screenshot match would be dressing the
 * database to flatter a picture. The point is a system with enough real shape
 * that the charts curve, the rankings rank and the empty states step aside.
 *
 * CLAUDE.md forbids placeholder data on a production path, and it means it.
 * This writes to whatever project `.env.local` points at, so:
 *   - it refuses to run when NEXT_PUBLIC_APP_ENV is 'production'
 *   - every row it writes, it can remove again: `--remove`
 *   - the data is deterministic, so the script is its own manifest. There is
 *     no marker column to keep in step and nothing to leak into the UI.
 *
 * Names, districts and amounts are invented but plausible for an Indian
 * computer-academy franchise — style guide §1.1: "realistic synthetic data
 * during development; never meaningless lorem ipsum". No real person's
 * details are here.
 *
 *   node scripts/seed-dev-data.mjs            # create
 *   node scripts/seed-dev-data.mjs --remove   # take it all back out
 */

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

// --- environment -----------------------------------------------------------

function loadEnvLocal() {
  let raw;
  try {
    raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  } catch {
    return;
  }
  for (const line of raw.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]])
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
loadEnvLocal();

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL_ || !KEY) {
  console.error(
    "Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.",
  );
  process.exit(1);
}

if (process.env.NEXT_PUBLIC_APP_ENV === "production") {
  console.error("NEXT_PUBLIC_APP_ENV is 'production'. Refusing to seed.");
  process.exit(1);
}

// The service role bypasses RLS, which is exactly why this is a script and not
// a server action: there is no user session to attribute a seed to, and
// lib/db/service-role.ts is reserved for the four callers that have a real
// reason. CLAUDE.md §3.
const db = createClient(URL_, KEY, { auth: { persistSession: false } });

const REMOVE = process.argv.includes("--remove");

// --- the data --------------------------------------------------------------

/**
 * Eighteen centres across the belt the academy actually franchises in. The
 * code is the join key for removal, so these must stay stable — changing one
 * orphans whatever the previous run created under the old code.
 */
const CENTRES = [
  {
    code: "CO-LKO01",
    name: "Career Optics Hazratganj",
    city: "Lucknow",
    state: "Uttar Pradesh",
    pincode: "226001",
    students: 62,
    status: "active",
  },
  {
    code: "CO-LKO02",
    name: "Career Optics Gomti Nagar",
    city: "Lucknow",
    state: "Uttar Pradesh",
    pincode: "226010",
    students: 48,
    status: "active",
  },
  {
    code: "CO-KNP01",
    name: "Career Optics Kanpur Central",
    city: "Kanpur",
    state: "Uttar Pradesh",
    pincode: "208001",
    students: 55,
    status: "active",
  },
  {
    code: "CO-VNS01",
    name: "Career Optics Lanka",
    city: "Varanasi",
    state: "Uttar Pradesh",
    pincode: "221005",
    students: 41,
    status: "active",
  },
  {
    code: "CO-PRJ01",
    name: "Career Optics Civil Lines",
    city: "Prayagraj",
    state: "Uttar Pradesh",
    pincode: "211001",
    students: 37,
    status: "active",
  },
  {
    code: "CO-AGR01",
    name: "Career Optics Sanjay Place",
    city: "Agra",
    state: "Uttar Pradesh",
    pincode: "282002",
    students: 33,
    status: "active",
  },
  {
    code: "CO-MRT01",
    name: "Career Optics Shastri Nagar",
    city: "Meerut",
    state: "Uttar Pradesh",
    pincode: "250004",
    students: 29,
    status: "active",
  },
  {
    code: "CO-GKP01",
    name: "Career Optics Golghar",
    city: "Gorakhpur",
    state: "Uttar Pradesh",
    pincode: "273001",
    students: 26,
    status: "active",
  },
  {
    code: "CO-PAT01",
    name: "Career Optics Boring Road",
    city: "Patna",
    state: "Bihar",
    pincode: "800001",
    students: 44,
    status: "active",
  },
  {
    code: "CO-PAT02",
    name: "Career Optics Kankarbagh",
    city: "Patna",
    state: "Bihar",
    pincode: "800020",
    students: 31,
    status: "active",
  },
  {
    code: "CO-MZF01",
    name: "Career Optics Motijheel",
    city: "Muzaffarpur",
    state: "Bihar",
    pincode: "842001",
    students: 22,
    status: "active",
  },
  {
    code: "CO-BHP01",
    name: "Career Optics MP Nagar",
    city: "Bhopal",
    state: "Madhya Pradesh",
    pincode: "462011",
    students: 35,
    status: "active",
  },
  {
    code: "CO-IND01",
    name: "Career Optics Vijay Nagar",
    city: "Indore",
    state: "Madhya Pradesh",
    pincode: "452010",
    students: 39,
    status: "active",
  },
  {
    code: "CO-JBP01",
    name: "Career Optics Napier Town",
    city: "Jabalpur",
    state: "Madhya Pradesh",
    pincode: "482001",
    students: 18,
    status: "active",
  },
  {
    code: "CO-RNC01",
    name: "Career Optics Lalpur",
    city: "Ranchi",
    state: "Jharkhand",
    pincode: "834001",
    students: 24,
    status: "active",
  },
  {
    code: "CO-DEH01",
    name: "Career Optics Rajpur Road",
    city: "Dehradun",
    state: "Uttarakhand",
    pincode: "248001",
    students: 20,
    status: "active",
  },
  // Not every centre is healthy. A dashboard where 100% are active teaches
  // nobody what a suspended one looks like.
  {
    code: "CO-ALG01",
    name: "Career Optics Ramghat Road",
    city: "Aligarh",
    state: "Uttar Pradesh",
    pincode: "202001",
    students: 11,
    status: "suspended",
  },
  {
    code: "CO-SAH01",
    name: "Career Optics Chowk",
    city: "Saharanpur",
    state: "Uttar Pradesh",
    pincode: "247001",
    students: 7,
    status: "closed",
  },
];

const FIRST_NAMES = [
  "Aarav",
  "Vivaan",
  "Aditya",
  "Vihaan",
  "Arjun",
  "Sai",
  "Reyansh",
  "Krishna",
  "Ishaan",
  "Rudra",
  "Ananya",
  "Diya",
  "Aadhya",
  "Saanvi",
  "Pari",
  "Anika",
  "Navya",
  "Myra",
  "Kiara",
  "Riya",
  "Rohit",
  "Priya",
  "Amit",
  "Neha",
  "Suresh",
  "Kavita",
  "Manish",
  "Pooja",
  "Rakesh",
  "Sunita",
];
const SURNAMES = [
  "Sharma",
  "Verma",
  "Gupta",
  "Yadav",
  "Singh",
  "Kumar",
  "Mishra",
  "Pandey",
  "Tiwari",
  "Srivastava",
  "Chauhan",
  "Jaiswal",
  "Prasad",
  "Sinha",
  "Rastogi",
];

const APPLICATIONS = [
  {
    n: "Digital Future Academy",
    who: "Ritesh Ranjan",
    city: "Sitapur",
    state: "Uttar Pradesh",
    pin: "261001",
    status: "submitted",
  },
  {
    n: "Bright Skill Institute",
    who: "Farhana Khatoon",
    city: "Darbhanga",
    state: "Bihar",
    pin: "846004",
    status: "under_review",
  },
  {
    n: "Nav Disha Computer Hub",
    who: "Mahesh Kushwaha",
    city: "Rewa",
    state: "Madhya Pradesh",
    pin: "486001",
    status: "changes_requested",
  },
  {
    n: "Smart Learning Point",
    who: "Sandhya Tirkey",
    city: "Hazaribagh",
    state: "Jharkhand",
    pin: "825301",
    status: "approved",
  },
  {
    n: "Vision Computer Centre",
    who: "Imran Qureshi",
    city: "Bareilly",
    state: "Uttar Pradesh",
    pin: "243001",
    status: "submitted",
  },
  {
    n: "Prayas Institute",
    who: "Deepak Nishad",
    city: "Chhindwara",
    state: "Madhya Pradesh",
    pin: "480001",
    status: "rejected",
  },
];

const LEADS = [
  {
    name: "Shivani Maurya",
    phone: "9838100201",
    city: "Lucknow",
    status: "new",
  },
  {
    name: "Abhay Pratap",
    phone: "9838100202",
    city: "Kanpur",
    status: "contacted",
  },
  { name: "Rukhsar Bano", phone: "9838100203", city: "Patna", status: "new" },
  {
    name: "Nitin Ahirwar",
    phone: "9838100204",
    city: "Bhopal",
    status: "contacted",
  },
  {
    name: "Jyoti Kumari",
    phone: "9838100205",
    city: "Ranchi",
    status: "converted",
  },
  {
    name: "Salman Ansari",
    phone: "9838100206",
    city: "Varanasi",
    status: "new",
  },
  {
    name: "Tripti Sahu",
    phone: "9838100207",
    city: "Indore",
    status: "closed",
  },
];

const METHODS = ["cash", "upi", "upi", "upi", "bank_transfer", "card"];

// Deterministic pseudo-randomness. Math.random() would make two runs disagree
// and the removal path harder to reason about.
function mulberry(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const iso = (daysAgo, hour = 10) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - daysAgo);
  d.setUTCHours(hour, (daysAgo * 7) % 60, 0, 0);
  return d.toISOString();
};

const chunk = (arr, n) =>
  Array.from({ length: Math.ceil(arr.length / n) }, (_, i) =>
    arr.slice(i * n, i * n + n),
  );

async function insert(table, rows, opts = {}) {
  if (rows.length === 0) return [];
  const out = [];
  for (const part of chunk(rows, 400)) {
    const q = db.from(table).insert(part);
    const { data, error } = opts.select ? await q.select(opts.select) : await q;
    if (error) throw new Error(`${table}: ${error.message}`);
    if (data) out.push(...data);
  }
  return out;
}

// --- removal ---------------------------------------------------------------

async function remove() {
  const codes = CENTRES.map((c) => c.code);
  const { data: centres } = await db
    .from("centres")
    .select("id")
    .in("code", codes);
  const centreIds = (centres ?? []).map((c) => c.id);

  if (centreIds.length === 0) {
    console.log("Nothing to remove — no seeded centres found.");
  } else {
    console.log(
      `Removing ${centreIds.length} seeded centres and everything under them…`,
    );

    const ids = async (table, col, filterCol, vals) => {
      if (!vals.length) return [];
      const { data } = await db.from(table).select(col).in(filterCol, vals);
      return (data ?? []).map((r) => r[col]);
    };

    const pubIds = await ids(
      "result_publications",
      "id",
      "centre_id",
      centreIds,
    );
    const planIds = await ids("fee_plans", "id", "centre_id", centreIds);
    const instIds = await ids("fee_instalments", "id", "fee_plan_id", planIds);

    // Foreign keys are RESTRICT, so children first, and issued_documents
    // before student_results because it references both that and students.
    await db.from("issued_documents").delete().in("centre_id", centreIds);
    if (instIds.length)
      await db
        .from("payment_allocations")
        .delete()
        .in("fee_instalment_id", instIds);
    await db.from("payments").delete().in("centre_id", centreIds);
    if (pubIds.length)
      await db.from("student_results").delete().in("publication_id", pubIds);
    await db.from("result_publications").delete().in("centre_id", centreIds);
    if (planIds.length)
      await db.from("fee_instalments").delete().in("fee_plan_id", planIds);
    await db.from("fee_plans").delete().in("centre_id", centreIds);
    await db.from("student_documents").delete().in("centre_id", centreIds);
    await db.from("enrolments").delete().in("centre_id", centreIds);
    await db.from("students").delete().in("centre_id", centreIds);
    await db.from("memberships").delete().in("centre_id", centreIds);
    await db.from("document_sequences").delete().in("centre_id", centreIds);
    // An application that was approved points at its centre; break that first.
    await db
      .from("centre_applications")
      .update({ centre_id: null })
      .in("centre_id", centreIds);
    await db.from("centres").delete().in("id", centreIds);
  }

  await db
    .from("centre_applications")
    .delete()
    .in(
      "application_number",
      APPLICATIONS.map((_, i) => `APP-DEV-${String(i + 1).padStart(4, "0")}`),
    );
  await db
    .from("leads")
    .delete()
    .in(
      "phone",
      LEADS.map((l) => l.phone),
    );

  console.log("Removed.");
}

// --- creation --------------------------------------------------------------

async function seed() {
  const { data: org } = await db
    .from("organizations")
    .select("id")
    .limit(1)
    .single();
  if (!org) throw new Error("No organisation — run supabase/seed.sql first.");
  const orgId = org.id;

  const { data: courses } = await db
    .from("courses")
    .select("id, name, fee_paise")
    .order("display_order");
  if (!courses?.length)
    throw new Error("No courses — run supabase/seed.sql first.");

  const { data: existing } = await db
    .from("centres")
    .select("code")
    .in(
      "code",
      CENTRES.map((c) => c.code),
    );
  if (existing?.length) {
    console.log(
      `${existing.length} seeded centres already exist. Run with --remove first.`,
    );
    return;
  }

  const rnd = mulberry(20260805);

  // 1. Centres, backdated so the growth chart has a slope instead of a cliff.
  console.log("Centres…");
  const centreRows = CENTRES.map((c, i) => ({
    organization_id: orgId,
    code: c.code,
    name: c.name,
    city: c.city,
    state: c.state,
    pincode: c.pincode,
    address: `${1 + i} ${c.city} Road, ${c.city}`,
    status: c.status,
    created_at: iso(300 - i * 15),
  }));
  const centres = await insert("centres", centreRows, {
    select: "id, code, name",
  });
  const byCode = new Map(centres.map((c) => [c.code, c]));
  console.log(`  ${centres.length}`);

  // 2. Students and enrolments.
  console.log("Students and enrolments…");
  const studentRows = [];
  for (const spec of CENTRES) {
    const centre = byCode.get(spec.code);
    for (let i = 0; i < spec.students; i += 1) {
      const first = FIRST_NAMES[Math.floor(rnd() * FIRST_NAMES.length)];
      const last = SURNAMES[Math.floor(rnd() * SURNAMES.length)];
      const n = studentRows.length + 1;
      studentRows.push({
        organization_id: orgId,
        centre_id: centre.id,
        registration_number: `${spec.code}-${String(i + 1).padStart(4, "0")}`,
        full_name: `${first} ${last}`,
        phone: `9${String(700000000 + n).slice(0, 9)}`,
        email: `${first.toLowerCase()}.${last.toLowerCase()}${n}@example.in`,
        status: rnd() < 0.08 ? "completed" : "active",
        created_at: iso(Math.floor(rnd() * 240) + 5),
      });
    }
  }
  const students = await insert("students", studentRows, {
    select: "id, centre_id, created_at",
  });
  console.log(`  ${students.length}`);

  const enrolRows = students.map((s) => {
    const course = courses[Math.floor(rnd() * courses.length)];
    return {
      organization_id: orgId,
      centre_id: s.centre_id,
      student_id: s.id,
      course_id: course.id,
      enrolled_at: s.created_at,
      created_at: s.created_at,
    };
  });
  const enrolments = await insert("enrolments", enrolRows, {
    select: "id, centre_id, student_id, course_id",
  });
  console.log(`  ${enrolments.length} enrolments`);

  // 3. Fee plans, instalments and payments.
  //
  // Written directly rather than through create_fee_plan/post_payment. Those
  // are SECURITY INVOKER and check app.has_permission() against a session this
  // script does not have; the arithmetic they enforce is reproduced here
  // instead — instalments sum to exactly the total, and allocations sum to
  // exactly the payment.
  console.log("Fees and payments…");
  const feeByCourse = new Map(
    courses.map((c) => [c.id, c.fee_paise ?? 500000]),
  );

  const planRows = enrolments.map((e) => ({
    organization_id: orgId,
    centre_id: e.centre_id,
    enrolment_id: e.id,
    total_paise: feeByCourse.get(e.course_id) ?? 500000,
  }));
  const plans = await insert("fee_plans", planRows, {
    select: "id, centre_id, enrolment_id, total_paise",
  });

  const enrolById = new Map(enrolments.map((e) => [e.id, e]));
  const instRows = [];
  for (const p of plans) {
    const count = 3;
    // Integer split with the remainder on the first instalment, so the parts
    // sum to the total exactly. This is the invariant the fee tests assert.
    const base = Math.floor(p.total_paise / count);
    const remainder = p.total_paise - base * count;
    for (let i = 0; i < count; i += 1) {
      const due = new Date();
      due.setUTCDate(due.getUTCDate() - 60 + i * 30);
      instRows.push({
        fee_plan_id: p.id,
        sequence: i + 1,
        due_date: due.toISOString().slice(0, 10),
        amount_paise: i === 0 ? base + remainder : base,
        status: "pending",
      });
    }
  }
  const instalments = await insert("fee_instalments", instRows, {
    select: "id, fee_plan_id, sequence, amount_paise",
  });

  const instByPlan = new Map();
  for (const i of instalments) {
    if (!instByPlan.has(i.fee_plan_id)) instByPlan.set(i.fee_plan_id, []);
    instByPlan.get(i.fee_plan_id).push(i);
  }
  for (const list of instByPlan.values())
    list.sort((a, b) => a.sequence - b.sequence);

  const paymentRows = [];
  const paidPlans = [];
  let receipt = 0;
  for (const p of plans) {
    // Not everyone has paid, and not everyone who has paid has finished.
    const roll = rnd();
    const paying = roll < 0.72 ? (roll < 0.34 ? 3 : roll < 0.55 ? 2 : 1) : 0;
    if (paying === 0) continue;

    const list = instByPlan.get(p.id) ?? [];
    for (let i = 0; i < paying && i < list.length; i += 1) {
      receipt += 1;
      const daysAgo = Math.floor(rnd() * 28);
      paymentRows.push({
        organization_id: orgId,
        centre_id: p.centre_id,
        student_id: enrolById.get(p.enrolment_id).student_id,
        fee_plan_id: p.id,
        receipt_number: `RCP-DEV-${String(receipt).padStart(6, "0")}`,
        amount_paise: list[i].amount_paise,
        method: METHODS[Math.floor(rnd() * METHODS.length)],
        posted_at: iso(daysAgo, 9 + Math.floor(rnd() * 9)),
        _instalment: list[i].id,
      });
    }
    paidPlans.push({ plan: p, paying });
  }

  const payments = await insert(
    "payments",
    paymentRows.map(({ _instalment, ...r }) => r),
    { select: "id, receipt_number" },
  );
  const paymentByReceipt = new Map(
    payments.map((p) => [p.receipt_number, p.id]),
  );

  await insert(
    "payment_allocations",
    paymentRows.map((r) => ({
      payment_id: paymentByReceipt.get(r.receipt_number),
      fee_instalment_id: r._instalment,
      amount_paise: r.amount_paise,
    })),
  );

  // The instalments those payments settled are no longer pending. Done in one
  // statement rather than per row.
  const settled = paymentRows.map((r) => r._instalment);
  for (const part of chunk(settled, 400)) {
    await db.from("fee_instalments").update({ status: "paid" }).in("id", part);
  }
  console.log(`  ${plans.length} plans, ${payments.length} payments`);

  // 4. Applications in every reviewable state, and public enquiries.
  console.log("Applications and leads…");
  await insert(
    "centre_applications",
    APPLICATIONS.map((a, i) => ({
      organization_id: orgId,
      application_number: `APP-DEV-${String(i + 1).padStart(4, "0")}`,
      applicant_name: a.who,
      applicant_email: `${a.who.split(" ")[0].toLowerCase()}@example.in`,
      applicant_phone: `98381${String(20000 + i)}`,
      proposed_centre_name: a.n,
      city: a.city,
      state: a.state,
      pincode: a.pin,
      address: `${a.n}, ${a.city}`,
      status: a.status,
      created_at: iso(i * 4 + 1),
    })),
  );

  await insert(
    "leads",
    LEADS.map((l, i) => ({
      organization_id: orgId,
      full_name: l.name,
      phone: l.phone,
      email: `${l.name.split(" ")[0].toLowerCase()}@example.in`,
      city: l.city,
      course_interest_id: courses[i % courses.length].id,
      status: l.status,
      created_at: iso(i * 2),
    })),
  );

  // 5. One published result set per active centre, and certificates for the
  //    students who passed — enough for the certificate and result counters to
  //    be something other than zero.
  console.log("Results and certificates…");
  const activeCentres = CENTRES.filter((c) => c.status === "active");
  const pubRows = activeCentres.map((c) => ({
    organization_id: orgId,
    centre_id: byCode.get(c.code).id,
    course_id: courses[0].id,
    term_label: "2026 Term 1",
    version: 1,
    published_at: iso(20),
  }));
  const pubs = await insert("result_publications", pubRows, {
    select: "id, centre_id",
  });

  const enrolByCentre = new Map();
  for (const e of enrolments) {
    if (e.course_id !== courses[0].id) continue;
    if (!enrolByCentre.has(e.centre_id)) enrolByCentre.set(e.centre_id, []);
    enrolByCentre.get(e.centre_id).push(e);
  }

  const resultRows = [];
  for (const pub of pubs) {
    for (const e of (enrolByCentre.get(pub.centre_id) ?? []).slice(0, 12)) {
      const obtained = 28 + Math.floor(rnd() * 72);
      resultRows.push({
        publication_id: pub.id,
        enrolment_id: e.id,
        max_marks: 100,
        obtained_marks: obtained,
        outcome:
          obtained >= 75 ? "distinction" : obtained >= 40 ? "pass" : "fail",
      });
    }
  }
  const results = await insert("student_results", resultRows, {
    select: "id, enrolment_id, outcome",
  });

  const passed = results.filter((r) => r.outcome !== "fail");
  let certNo = 0;
  await insert(
    "issued_documents",
    passed.map((r) => {
      certNo += 1;
      const e = enrolById.get(r.enrolment_id);
      return {
        organization_id: orgId,
        centre_id: e.centre_id,
        student_id: e.student_id,
        student_result_id: r.id,
        document_type: "certificate",
        document_number: `CO-CERT-DEV-${String(certNo).padStart(6, "0")}`,
        status: "issued",
        issued_at: iso(15),
      };
    }),
  );
  console.log(`  ${results.length} results, ${passed.length} certificates`);

  console.log("\nDone. Sign in at /admin to see it.");
}

try {
  await (REMOVE ? remove() : seed());
} catch (err) {
  console.error(`\nFailed: ${err.message}`);
  console.error(
    "Re-run with --remove to clear anything partial, then try again.",
  );
  process.exit(1);
}
