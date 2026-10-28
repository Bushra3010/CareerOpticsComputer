const { Router } = require("express");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { z } = require("zod");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function sbFetch(path, method, body) {
  const res = await fetch(SUPABASE_URL + "/rest/v1/" + path, {
    method: method || "GET",
    headers: {
      "Content-Type": "application/json",
      "apikey": SERVICE_KEY,
      "Authorization": "Bearer " + SERVICE_KEY,
      "Prefer": "return=representation"
    },
    body: body ? JSON.stringify(body) : undefined
  });
  if (!res.ok) {
    const err = await res.text();
    const e = new Error("Supabase " + res.status + ": " + err);
    e.status = res.status;
    throw e;
  }
  return res.json();
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return salt + ":" + hash;
}

function checkPassword(password, stored) {
  if (!stored || stored.indexOf(":") === -1) return false;
  const parts = stored.split(":");
  const salt = parts[0];
  const hash = parts[1];
  const testHash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return hash === testHash;
}

const router = Router();

router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = z.object({ identifier: z.string().min(3), password: z.string().min(1) }).parse(req.body);
    let email = identifier;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) {
      const data = await sbFetch("profiles?select=email&username=eq." + encodeURIComponent(identifier));
      if (data && data.length > 0) email = data[0].email;
    }
    const profiles = await sbFetch("profiles?select=*&email=eq." + encodeURIComponent(email));
    const profile = profiles && profiles.length > 0 ? profiles[0] : null;
    if (!profile || !checkPassword(password, profile.password_hash)) {
      return res.status(401).json({ success: false, message: "Incorrect email/username or password" });
    }
    const token = jwt.sign({ userId: profile.id, role: profile.role, email: profile.email }, process.env.JWT_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ userId: profile.id, nonce: Date.now().toString() }, process.env.JWT_REFRESH_SECRET, { expiresIn: "30d" });
    await sbFetch("profiles?id=eq." + profile.id, "PATCH", { last_login_at: new Date().toISOString() });
    res.json({
      success: true,
      data: {
        accessToken: token,
        refreshToken,
        user: { id: profile.id, email: profile.email, name: profile.full_name, role: profile.role, organizationId: profile.organization_id, branchId: profile.branch_id }
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message || "Login failed" });
  }
});

router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = z.object({ refreshToken: z.string() }).parse(req.body);
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const profiles = await sbFetch("profiles?select=*&id=eq." + decoded.userId);
    const profile = profiles && profiles.length > 0 ? profiles[0] : null;
    if (!profile) return res.status(401).json({ success: false, message: "Session expired" });
    const token = jwt.sign({ userId: profile.id, role: profile.role, email: profile.email }, process.env.JWT_SECRET, { expiresIn: "15m" });
    res.json({ success: true, data: { accessToken: token } });
  } catch {
    res.status(401).json({ success: false, message: "Refresh token invalid" });
  }
});

router.post("/bootstrap", async (req, res) => {
  try {
    const body = z.object({
      organizationName: z.string().min(2),
      adminName: z.string().min(2),
      email: z.string().email(),
      phone: z.string().min(10),
      branchName: z.string().min(2),
      city: z.string().min(2),
      state: z.string().min(2),
      pincode: z.string().min(6)
    }).parse(req.body);
    const { organizationName, adminName, email, phone, branchName, city, state, pincode } = body;
    const profiles = await sbFetch("profiles?select=count&head=true");
    if (profiles && profiles.length >= 0) return res.status(400).json({ success: false, message: "System already initialized" });
    const password = "admin123";
    const passwordHash = hashPassword(password);
    const orgCode = "ORG-" + Date.now();
    const org = await sbFetch("organizations", "POST", {
      name: organizationName, code: orgCode, email, phone, street_address: "To be updated", city, state, district: city, pincode
    });
    const branchCode = "BR-" + Date.now();
    const branch = await sbFetch("branches", "POST", {
      organization_id: org.id, name: branchName, code: branchCode, phone, email: "branch." + email, academic_year: "2026-27"
    });
    const adminId = crypto.randomUUID();
    await sbFetch("profiles", "POST", {
      id: adminId, email, username: "admin", full_name: adminName, role: "ORGANIZATION_ADMIN", user_type: "ORGANIZATION",
      organization_id: org.id, branch_id: branch.id, is_active: true, password_hash: passwordHash
    });
    const branchAdminId = crypto.randomUUID();
    await sbFetch("profiles", "POST", {
      id: branchAdminId, email: "branch." + email, username: "branch." + email,
      full_name: branchName + " Admin", role: "BRANCH_ADMIN", user_type: "BRANCH",
      organization_id: org.id, branch_id: branch.id, is_active: true, password_hash: passwordHash
    });
    res.status(201).json({ success: true, data: { organizationId: org.id, branchId: branch.id, adminEmail: email } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || "Bootstrap failed" });
  }
});

module.exports = router;
