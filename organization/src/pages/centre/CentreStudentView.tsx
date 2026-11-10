import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Award, FileText, IdCard, KeyRound, Loader2, MessageCircle, Pencil, Printer, Search, Wallet } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { DceBadge, DceInput } from "@/components/dce/Dce";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase/client";
import { getStudentDocument, type StudentRosterRow } from "@/lib/supabase/data";
import { listStudentAttendance, type AttendanceRow } from "@/lib/supabase/examAttendance";
import { admissionPdf } from "@/lib/documents";
import { enrollmentSlipsPdf, studentCardsPdf } from "@/lib/brand/brandDocuments";
import { canIssueStudentLogin } from "@/lib/roles";
import { StudentLoginDialog } from "@/components/student/StudentLoginDialog";

/**
 * One student on a page of their own (Students -> All Students -> the eye),
 * laid out as the centre panel's other screens: the student's documents
 * across the top, every particular the admission recorded, and their
 * attendance beside it. Marksheet and certificate open their own pages with
 * the student already chosen, so approval and the wallet charge still apply.
 */

type Raw = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

const longDate = (value: unknown) => {
  const text = String(value ?? "");
  if (!text) return "";
  const d = new Date(text.length === 10 ? `${text}T00:00:00` : text);
  return Number.isNaN(d.getTime()) ? text : d.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
};
const dayName = (iso: string) => {
  const d = new Date(`${iso.slice(0, 10)}T00:00:00`);
  return `${d.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })} (${d.toLocaleDateString("en-GB", { weekday: "long" })})`;
};
const photoOf = (s: Raw): string => {
  const pick = (v: unknown): string => {
    if (typeof v === "string" && /^(data:image|https?:)/.test(v)) return v;
    if (v && typeof v === "object") {
      const o = v as Record<string, unknown>;
      return pick(o.dataUrl) || pick(o.url);
    }
    return "";
  };
  return pick((s.documents as Raw | null)?.passportPhoto) || pick(s.photo);
};
const present = (status: unknown) => /^(present|p|late)$/i.test(String(status ?? ""));

export default function CentreStudentView() {
  const [params] = useSearchParams();
  const id = params.get("id") || "";
  const { branchId: ownBranch, user } = useAuth();
  const { toast } = useToast();
  const mayIssueLogin = canIssueStudentLogin(user?.role);

  const [s, setS] = useState<Raw | null>(null);
  const [course, setCourse] = useState<Raw | null>(null);
  const [branch, setBranch] = useState<Raw | null>(null);
  const [batch, setBatch] = useState<Raw | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [range, setRange] = useState<{ from: string; to: string }>({ from: "", to: "" });
  const [loginOpen, setLoginOpen] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      let query = supabase.from("students").select("*").eq("id", id).is("deletedAt", null);
      if (ownBranch) query = query.eq("branchId", ownBranch);
      const { data, error: e } = await query.maybeSingle();
      if (e) throw new Error(e.message);
      if (!data) throw new Error("Student not found.");
      const row = data as Raw;
      setS(row);
      const one = async (table: string, key: unknown) =>
        key ? ((await supabase.from(table).select("*").eq("id", String(key)).maybeSingle()).data as Raw | null) : null;
      const [c, b, bt, att] = await Promise.all([
        one("courses", row.courseId),
        one("branches", row.branchId),
        one("batches", row.batchId),
        listStudentAttendance(row.id).catch(() => [] as AttendanceRow[]),
      ]);
      setCourse(c);
      setBranch(b);
      setBatch(bt);
      setAttendance(att);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load the student.");
    } finally {
      setLoading(false);
    }
  }, [id, ownBranch]);
  useEffect(() => {
    void load();
  }, [load]);

  const name = s ? [s.firstName, s.middleName, s.lastName].filter(Boolean).join(" ") : "";
  const regNo = s ? String(s.enrollmentNo || s.applicationNo || "") : "";
  const photo = s ? photoOf(s) : "";
  const address = s ? [s.streetAddress, s.block, s.city, s.district, s.state, s.pincode].filter(Boolean).join(", ") : "";
  const months = course ? Number(course.durationValue) * (String(course.durationUnit || "MONTHS") === "YEARS" ? 12 : 1) : 0;
  const shown = useMemo(
    () => attendance.filter((a) => (!range.from || a.date.slice(0, 10) >= range.from) && (!range.to || a.date.slice(0, 10) <= range.to)),
    [attendance, range],
  );
  const presentDays = attendance.filter((a) => present(a.status)).length;
  const percent = attendance.length ? Math.round((presentDays / attendance.length) * 100) : 0;

  const run = async (key: string, task: () => Promise<unknown>, done: string) => {
    setBusy(key);
    try {
      await task();
      toast({ title: done, description: "Check your Downloads." });
    } catch (e) {
      toast({ title: "Could not make the document", description: e instanceof Error ? e.message : undefined, variant: "destructive" });
    } finally {
      setBusy("");
    }
  };

  const applicationForm = () =>
    run("form", async () => {
      const { data } = await getStudentDocument(id, ownBranch ?? null);
      admissionPdf(data);
    }, "Application form ready");

  const enrollmentSlip = () =>
    run("slip", () =>
      enrollmentSlipsPdf(
        [
          {
            enrollmentNo: regNo,
            centreCode: String(branch?.code || ""),
            admissionDate: String(s?.admissionDate || s?.createdAt || ""),
            name,
            dateOfBirth: String(s?.dateOfBirth || ""),
            fatherName: String(s?.fatherName || ""),
            motherName: String(s?.motherName || ""),
            mobile: String(s?.phone || s?.fatherPhone || ""),
            course: String(course?.name || ""),
            duration: months ? `${months} Months` : "",
            session: String(s?.academicYear || ""),
            centreName: String(branch?.name || ""),
            photo: photo || null,
          },
        ],
        `enrollment-slip-${regNo.replace(/[^\w-]+/g, "-")}`,
      ), "Enrollment slip ready");

  const idCard = () =>
    run("id", () =>
      studentCardsPdf(
        [
          {
            name,
            studentId: regNo,
            course: String(course?.code || course?.name || ""),
            session: String(s?.academicYear || ""),
            fatherName: String(s?.fatherName || ""),
            dob: String(s?.dateOfBirth || "").slice(0, 10),
            mobile: String(s?.phone || s?.fatherPhone || ""),
            address,
            validTill: `${new Date().getFullYear() + 1}-03-31`,
            photo: photo || null,
          },
        ],
        `id-card-${regNo.replace(/[^\w-]+/g, "-")}.pdf`,
      ), "ID card ready");

  // The certificate and marksheet carry QR codes that open the verification page; that page is what is sent.
  const whatsapp = () => {
    const phone = String(s?.phone || s?.whatsappNumber || s?.fatherPhone || "").replace(/\D/g, "");
    if (!phone) return toast({ title: "No mobile number on record", variant: "destructive" });
    const site = "https://www.careeropticscomputer.in/verification.html";
    const text =
      `Dear ${name},\nYour Registration No. is ${regNo}.\n` +
      `Check your result: ${site}?no=${encodeURIComponent(regNo)}#result\n` +
      `Verify your certificate: ${site}?no=${encodeURIComponent(regNo)}#certificate\n` +
      `— Career Optics Computer Academy`;
    window.open(`https://wa.me/${phone.length === 10 ? `91${phone}` : phone}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  };

  const docLink = `/certificate/issue?branch=${encodeURIComponent(String(s?.branchId || ""))}&student=${encodeURIComponent(id)}`;

  const Q = ({ label, value, wide }: { label: string; value: unknown; wide?: boolean }) => (
    <div className={wide ? "sm:col-span-2" : ""}>
      <div className="text-[13px] font-bold text-slate-800">{label}</div>
      <div className="mt-1.5 text-[13.5px] text-slate-700">
        <span className="text-[#5867dd]">Answer: </span>
        {value ? String(value) : "—"}
      </div>
    </div>
  );

  const btn = "inline-flex items-center gap-1.5 rounded px-3 py-2 text-[12.5px] font-semibold text-white shadow-sm transition hover:brightness-95 disabled:opacity-60";

  return (
    <AppLayout>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-[15px] font-bold uppercase tracking-wide text-slate-800">Students</h1>
        <div className="text-[13px] text-slate-500">
          <Link to="/centre/students?type=all" className="hover:underline">Students</Link>
          <span className="mx-2">/</span>
          <span className="text-[#2ea8a8]">View student{regNo ? ` - ${regNo}` : ""}</span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
      ) : error || !s ? (
        <div className="rounded border bg-white p-8 text-center text-sm text-slate-600">
          {error || "Student not found."}{" "}
          <Link to="/centre/students?type=all" className="font-semibold text-[#2ea8a8] hover:underline">Back to students</Link>
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
          <section className="overflow-hidden rounded-sm bg-white shadow-sm">
            <header className="flex flex-wrap items-center gap-2 bg-[#3d4451] px-5 py-4">
              <h2 className="mr-auto text-[16px] font-bold uppercase text-white">{name}</h2>
              <button className={`${btn} bg-[#34bfa3]`} onClick={whatsapp}><MessageCircle className="h-3.5 w-3.5" /> Send Cert. &amp; Marks on WhatsApp</button>
              <button className={`${btn} bg-[#2f80ed]`} onClick={applicationForm} disabled={!!busy}>
                {busy === "form" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Printer className="h-3.5 w-3.5" />} Application Form
              </button>
              <button className={`${btn} bg-[#0ea5a4]`} onClick={enrollmentSlip} disabled={!!busy}>
                {busy === "slip" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />} Enrollment Slip
              </button>
              <Link className={`${btn} bg-[#f4516c]`} to={docLink}><FileText className="h-3.5 w-3.5" /> Marksheet</Link>
              <Link className={`${btn} bg-[#34bf6b]`} to={docLink}><Award className="h-3.5 w-3.5" /> Certificate</Link>
              <button className={`${btn} bg-[#716aca]`} onClick={idCard} disabled={!!busy}>
                {busy === "id" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <IdCard className="h-3.5 w-3.5" />} ID Card
              </button>
              <Link className={`${btn} bg-[#36a3f7]`} to={`/student/add?id=${encodeURIComponent(id)}`}><Pencil className="h-3.5 w-3.5" /> Edit</Link>
            </header>

            <div className="p-6">
              <div className="flex flex-wrap items-start gap-6">
                <div className="grid min-w-0 flex-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                  <Q label="Registration No." value={regNo} />
                  <Q label="Applicant Name" value={name.toUpperCase()} />
                  <Q label="Gender" value={s.gender} />
                  <Q label="Date of Birth" value={longDate(s.dateOfBirth)} />
                </div>
                <div className="shrink-0 text-center">
                  {photo ? (
                    <img src={photo} alt="" className="h-[124px] w-[104px] rounded border object-cover" />
                  ) : (
                    <div className="flex h-[124px] w-[104px] items-center justify-center rounded border bg-slate-100 text-[11px] text-slate-400">No photo</div>
                  )}
                  <div className="mt-2"><DceBadge status={s.isActive === false ? "INACTIVE" : String(s.admissionStatus || "PENDING")} label={s.isActive === false ? "Deactivated" : String(s.admissionStatus || "Pending").toLowerCase()} /></div>
                </div>
              </div>

              <hr className="my-6 border-slate-200" />
              <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
                <Q label="Franchise" value={String(branch?.name || "").toUpperCase()} />
                <Q label="Course" value={String(course?.name || "").toUpperCase()} />
                <Q label="ATP Code" value={branch?.code} />
                <Q label="Batch" value={batch?.name} />
                <Q label="Admission Date" value={longDate(s.admissionDate || s.createdAt)} />
                <Q label="Session" value={s.academicYear} />
              </div>

              <hr className="my-6 border-slate-200" />
              <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
                <Q label="Father Name" value={String(s.fatherName || "").toUpperCase()} />
                <Q label="Mother Name" value={String(s.motherName || "").toUpperCase()} />
                <Q label="Email" value={String(s.email || "").toUpperCase()} />
                <Q label="Mobile" value={s.phone} />
                <Q label="Guardian Mobile" value={s.fatherPhone || s.guardianPhone} />
                <Q label="WhatsApp" value={s.whatsappNumber} />
                <Q label="Aadhaar Number" value={s.aadharNumber} />
                <Q label="Education" value={s.education || s.previousClass} />
                <Q label="Category" value={s.category} />
                <Q label="Religion" value={s.religion} />
                <Q label="Address" value={address.toUpperCase()} wide />
              </div>

              <hr className="my-6 border-slate-200" />
              <div className="flex flex-wrap gap-2">
                <Link className={`${btn} bg-[#f4a142]`} to={`/centre/student-payments?id=${encodeURIComponent(id)}`}><Wallet className="h-3.5 w-3.5" /> Fees &amp; Payments</Link>
                {mayIssueLogin && (
                  <button className={`${btn} bg-[#3d4451]`} onClick={() => setLoginOpen(true)}>
                    <KeyRound className="h-3.5 w-3.5" /> {s.userId ? "Reset student login" : "Create student login"}
                  </button>
                )}
              </div>
            </div>
          </section>

          <aside className="self-start overflow-hidden rounded-sm bg-white shadow-sm">
            <header className="flex items-center justify-between bg-[#3d4451] px-5 py-4">
              <h2 className="text-[16px] font-bold text-white">Attendance Report</h2>
              <span className="rounded bg-[#f4516c] px-2.5 py-1 text-[12px] font-bold text-white">{percent}%</span>
            </header>
            <div className="p-5">
              <dl className="divide-y border-y text-[13.5px]">
                <div className="flex justify-between py-3"><dt className="font-semibold text-[#f4516c]">Total Course Duration</dt><dd className="font-bold text-[#f4516c]">{months ? `${months} months` : "—"}</dd></div>
                <div className="flex justify-between py-3"><dt className="font-semibold text-[#f4516c]">Total Attendance</dt><dd className="font-bold text-[#f4516c]">{presentDays} / {attendance.length}</dd></div>
              </dl>

              <h3 className="mt-5 text-[15px] text-slate-800">Filter Attendance</h3>
              <div className="mt-2 grid grid-cols-[1fr_1fr_auto] items-end gap-2">
                <label className="text-[12.5px] font-semibold text-slate-700">From Date<DceInput type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></label>
                <label className="text-[12.5px] font-semibold text-slate-700">To Date<DceInput type="date" value={to} onChange={(e) => setTo(e.target.value)} /></label>
                <button aria-label="Filter attendance" className={`${btn} mb-[1px] bg-[#34bfa3]`} onClick={() => setRange({ from, to })}><Search className="h-4 w-4" /></button>
              </div>

              <div className="mt-4 flex justify-between border-b pb-2 text-[13px] font-semibold">
                <span className="text-[#5867dd]">Recent Attendance</span><span className="text-slate-700">A/P</span>
              </div>
              {shown.length === 0 ? (
                <p className="py-6 text-center text-[13px] text-slate-500">No attendance marked{range.from || range.to ? " in these dates" : " yet"}.</p>
              ) : (
                <ul className="divide-y text-[13px]">
                  {shown.slice(0, 60).map((a) => (
                    <li key={a.id} className="flex justify-between py-3">
                      <span className={new Date(`${a.date.slice(0, 10)}T00:00:00`).getDay() === 0 ? "text-[#f4516c]" : "text-slate-700"}>{dayName(a.date)}</span>
                      <span className={present(a.status) ? "font-semibold text-[#34bf6b]" : "font-semibold text-[#f4516c]"}>{present(a.status) ? "Present" : String(a.status || "Absent").replace(/^\w/, (c) => c.toUpperCase())}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </div>
      )}

      <StudentLoginDialog
        student={loginOpen && s ? ({ id, name, admissionNo: regNo, hasLogin: Boolean(s.userId) } as StudentRosterRow) : null}
        onOpenChange={() => setLoginOpen(false)}
        onSaved={() => setS((cur) => (cur ? { ...cur, userId: cur.userId || "issued" } : cur))}
      />
    </AppLayout>
  );
}
