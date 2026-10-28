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
    const date = req.query.date || new Date().toISOString().slice(0, 10);
    const { data } = await sbFetch("attendance_records?select=*&branch_id=eq." + encodeURIComponent(req.branchId) + "&date=eq." + date);
    res.json({ success: true, data: data || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { date, records } = req.body;
    const results = [];
    for (const record of records) {
      const data = await sbFetch("attendance_records", "POST", { student_id: record.studentId, branch_id: req.branchId, date, status: record.status, remarks: record.remarks || "", marked_by_id: req.userId });
      results.push(data);
    }
    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
