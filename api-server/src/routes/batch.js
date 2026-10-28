const { Router } = require("express");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function sbFetch(path, method, body) {
  const res = await fetch(SUPABASE_URL + "/rest/v1/" + path, {
    method: method || "GET",
    headers: { "Content-Type": "application/json", "apikey": SERVICE_KEY, "Authorization": "Bearer " + SERVICE_KEY, "Prefer": "return=representation" },
    body: body ? JSON.stringify(body) : undefined
  });
  if (!res.ok) { const err = await res.text(); const e = new Error("Supabase " + res.status + ": " + err); e.status = res.status; throw e; }
  return res.json();
}

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { data } = await sbFetch("batches?select=*,course:course_id(*)&branch_id=eq." + encodeURIComponent(req.branchId) + "&is_active=eq.true&order=start_date.desc");
    res.json({ success: true, data: data || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { course_id, name, code, max_seats, start_date, end_date } = req.body;
    const data = await sbFetch("batches", "POST", { branch_id: req.branchId, course_id, name, code, max_seats: max_seats ? Number(max_seats) : null, start_date, end_date: end_date || null, status: start_date ? (new Date(start_date) > new Date() ? "UPCOMING" : "ACTIVE") : "UPCOMING" });
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
