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
    const { data } = await sbFetch("profiles?select=id,email,username,full_name,role,organization_id,branch_id,is_active,last_login_at&id=eq." + req.userId + "&limit=1");
    res.json({ success: true, data: data && data.length > 0 ? data[0] : null });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/dashboard", async (req, res) => {
  try {
    const branchId = req.branchId;
    const orgId = req.organizationId;
    const [studentsData, enquiriesData, coursesData] = await Promise.all([
      sbFetch("students?select=count&branch_id=eq." + encodeURIComponent(branchId) + "&is_active=eq.true&head=true"),
      sbFetch("visit_enquiries?select=count&branch_id=eq." + encodeURIComponent(branchId) + "&head=true"),
      sbFetch("courses?select=count&organization_id=eq." + encodeURIComponent(orgId) + "&is_active=eq.true&head=true")
    ]);
    res.json({ success: true, data: { students: 0, enquiriesToday: 0, courses: 0, feesCollected: 0, outstanding: 0, attendancePercentage: 0, attendance: [] } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
