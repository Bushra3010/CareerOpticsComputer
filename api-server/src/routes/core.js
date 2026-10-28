const { Router } = require("express");
const jwt = require("jsonwebtoken");

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

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { data } = await sbFetch("organizations?select=id,email,username,full_name,role,organization_id,branch_id,is_active,last_login_at");
    res.json({ success: true, data: data || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/dashboard", async (req, res) => {
  try {
    const branchId = req.branchId;
    const orgId = req.organizationId;
    const studentsRes = await sbFetch("students?select=count&branch_id=eq." + encodeURIComponent(branchId) + "&is_active=eq.true&head=true");
    const enquiriesRes = await sbFetch("visit_enquiries?select=count&branch_id=eq." + encodeURIComponent(branchId) + "&head=true");
    const coursesRes = await sbFetch("courses?select=count&organization_id=eq." + encodeURIComponent(orgId) + "&is_active=eq.true&head=true");
    res.json({ success: true, data: { students: studentsRes.length > 0 ? 0 : 0, enquiriesToday: enquiriesRes.length > 0 ? 0 : 0, courses: coursesRes.length > 0 ? 0 : 0, feesCollected: 0, outstanding: 0, attendancePercentage: 0, attendance: [] } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/batches", async (req, res) => {
  try {
    const { data } = await sbFetch("batches?select=*,course:course_id(*)&branch_id=eq." + encodeURIComponent(req.branchId) + "&is_active=eq.true&order=start_date.desc");
    res.json({ success: true, data: data || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/batches", async (req, res) => {
  try {
    const { course_id, name, code, max_seats, start_date, end_date } = req.body;
    const data = await sbFetch("batches", "POST", { branch_id: req.branchId, course_id, name, code, max_seats: max_seats ? Number(max_seats) : null, start_date, end_date: end_date || null, status: start_date ? (new Date(start_date) > new Date() ? "UPCOMING" : "ACTIVE") : "UPCOMING" });
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/attendance", async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().slice(0, 10);
    const { data } = await sbFetch("attendance_records?select=*&branch_id=eq." + encodeURIComponent(req.branchId) + "&date=eq." + date);
    res.json({ success: true, data: data || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/attendance", async (req, res) => {
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

router.get("/enquiries", async (req, res) => {
  try {
    const { data } = await sbFetch("visit_enquiries?select=*&branch_id=eq." + encodeURIComponent(req.branchId) + "&order=created_at.desc");
    res.json({ success: true, data: data || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/enquiries", async (req, res) => {
  try {
    const data = await sbFetch("visit_enquiries", "POST", { ...req.body, branch_id: req.branchId });
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/students", async (req, res) => {
  try {
    const { data } = await sbFetch("students?select=*,course:course_id(*),batch:batch_id(*)&branch_id=eq." + encodeURIComponent(req.branchId) + "&is_active=eq.true&order=created_at.desc");
    res.json({ success: true, data: data || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/students", async (req, res) => {
  try {
    const studentData = { ...req.body, branch_id: req.branchId };
    const data = await sbFetch("students", "POST", studentData);
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/students/:id", async (req, res) => {
  try {
    const { data } = await sbFetch("students?select=*,course:course_id(*),batch:batch_id(*)" + "&id=eq." + req.params.id + "&branch_id=eq." + encodeURIComponent(req.branchId));
    if (!data || data.length === 0) return res.status(404).json({ success: false, message: "Student not found" });
    res.json({ success: true, data: data[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/courses", async (req, res) => {
  try {
    const { data } = await sbFetch("courses?select=*&organization_id=eq." + encodeURIComponent(req.organizationId) + "&is_active=eq.true&order=name.asc");
    res.json({ success: true, data: data || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/courses", async (req, res) => {
  try {
    const { name, code, category, duration_value, duration_unit, base_fee, description } = req.body;
    const data = await sbFetch("courses", "POST", { name, code, category: category || "COMPUTER", duration_value: Number(duration_value) || 1, duration_unit: duration_unit || "MONTHS", base_fee: Number(base_fee) || 0, description, organization_id: req.organizationId });
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/exams", async (req, res) => {
  try {
    const { data } = await sbFetch("exams?select=*,course:course_id(*),batch:batch_id(*)" + "&branch_id=eq." + encodeURIComponent(req.branchId) + "&order=exam_date.desc");
    res.json({ success: true, data: data || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/exams", async (req, res) => {
  try {
    const { course_id, batch_id, name, subject, exam_date, max_marks, pass_marks } = req.body;
    const data = await sbFetch("exams", "POST", { branch_id: req.branchId, course_id, batch_id, name, subject, exam_date, max_marks: Number(max_marks) || 100, pass_marks: Number(pass_marks) || 40 });
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/exams/:id/results", async (req, res) => {
  try {
    const { results, publish } = req.body;
    const examId = req.params.id;
    await sbFetch("exam_results", "POST", results.map((r) => ({ exam_id: examId, ...r })));
    await sbFetch("exams?id=eq." + examId, "PATCH", { status: publish ? "PUBLISHED" : "MARKS_ENTRY" });
    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/fees/invoices", async (req, res) => {
  try {
    const { data } = await sbFetch("fee_invoices?select=*,student:student_id(*)" + "&branch_id=eq." + encodeURIComponent(req.branchId) + "&order=created_at.desc");
    res.json({ success: true, data: data || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/fees/invoices", async (req, res) => {
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

router.post("/fees/invoices/:id/payments", async (req, res) => {
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
