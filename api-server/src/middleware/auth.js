const jwt = require("jsonwebtoken");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function sbFetch(path) {
  const res = await fetch(SUPABASE_URL + "/rest/v1/" + path, {
    headers: { "Content-Type": "application/json", "apikey": SERVICE_KEY, "Authorization": "Bearer " + SERVICE_KEY }
  });
  if (!res.ok) { const err = await res.text(); throw new Error("Supabase " + res.status + ": " + err); }
  return res.json();
}

async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ success: false, message: "Authentication required" });
  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.role = decoded.role;
    const data = await sbFetch("profiles?select=organization_id,branch_id,role&id=eq." + decoded.userId + "&limit=1");
    const profile = data && data.length > 0 ? data[0] : null;
    if (!profile) return res.status(401).json({ success: false, message: "Session expired" });
    req.organizationId = profile.organization_id;
    req.branchId = profile.branch_id;
    next();
  } catch {
    res.status(401).json({ success: false, message: "Session expired or invalid" });
  }
}

module.exports = { authenticate };
