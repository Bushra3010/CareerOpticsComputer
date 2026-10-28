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
    const { data } = await sbFetch("courses?select=*&organization_id=eq." + encodeURIComponent(req.organizationId) + "&is_active=eq.true&order=name.asc");
    res.json({ success: true, data: data || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, code, category, duration_value, duration_unit, base_fee, description } = req.body;
    const data = await sbFetch("courses", "POST", { name, code, category: category || "COMPUTER", duration_value: Number(duration_value) || 1, duration_unit: duration_unit || "MONTHS", base_fee: Number(base_fee) || 0, description, organization_id: req.organizationId });
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
