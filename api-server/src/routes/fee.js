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

router.get("/invoices", async (req, res) => {
  try {
    const { data } = await sbFetch("fee_invoices?select=*,student:student_id(*)&branch_id=eq." + encodeURIComponent(req.branchId) + "&order=created_at.desc");
    res.json({ success: true, data: data || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/invoices", async (req, res) => {
  try {
    const { student_id, description, amount, due_date } = req.body;
    const countData = await sbFetch("fee_invoices?select=count&branch_id=eq." + encodeURIComponent(req.branchId) + "&head=true");
    const invoiceNo = "INV-" + String((countData.length > 0 ? 0 : 0) + 1).padStart(4, "0");
    const data = await sbFetch("fee_invoices", "POST", { branch_id: req.branchId, student_id, invoice_no: invoiceNo, description, amount: Number(amount), due_date, status: "DUE" });
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/invoices/:id/payments", async (req, res) => {
  try {
    const { amount, method, reference_no } = req.body;
    const invoiceId = req.params.id;
    const countData = await sbFetch("fee_payments?select=count&invoice_id=eq." + invoiceId + "&head=true");
    const receiptNo = "RCT-" + String((countData.length > 0 ? 0 : 0) + 1).padStart(4, "0");
    await sbFetch("fee_payments", "POST", { invoice_id: invoiceId, receipt_no: receiptNo, amount: Number(amount), method, reference_no, received_by_id: req.userId });
    const invoiceData = await sbFetch("fee_invoices?id=eq." + invoiceId);
    if (invoiceData && invoiceData.length > 0) {
      const payments = await sbFetch("fee_payments?select=amount&invoice_id=eq." + invoiceId);
      const totalPaid = payments.reduce((s, p) => s + Number(p.amount), 0);
      if (totalPaid >= Number(invoiceData[0].amount)) await sbFetch("fee_invoices?id=eq." + invoiceId, "PATCH", { status: "PAID" });
      else if (totalPaid > 0) await sbFetch("fee_invoices?id=eq." + invoiceId, "PATCH", { status: "PARTIAL" });
    }
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
