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
    const { data } = await sbFetch("students?select=*,course:course_id(*),batch:batch_id(*)&branch_id=eq." + encodeURIComponent(req.branchId) + "&is_active=eq.true&order=created_at.desc");
    res.json({ success: true, data: data || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { data } = await sbFetch("students?select=*,course:course_id(*),batch:batch_id(*)&id=eq." + req.params.id + "&branch_id=eq." + encodeURIComponent(req.branchId) + "&limit=1");
    if (!data || data.length === 0) return res.status(404).json({ success: false, message: "Student not found" });
    res.json({ success: true, data: data[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const studentData = { ...req.body, branch_id: req.branchId };
    const data = await sbFetch("students", "POST", studentData);
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
