import { useEffect, useMemo, useState } from "react";
import { Award, FileText, Loader2, Printer } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { DceButton, DcePanel } from "@/components/dce/Dce";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { effectiveRate, getCentreRates, getCourses } from "@/lib/supabase/data";
import { getCourseSubjects } from "@/lib/supabase/examWorkflow";
import type { CourseSubject } from "@/lib/examWorkflow";
import { certificatePdf, marksheetPdf, type StudentDocument } from "@/lib/documents";
import { loadInstituteLogo } from "@/lib/instituteLogo";

/**
 * Every course with its fee, duration and what a centre pays per
 * certificate, and a sample certificate and marksheet for each -- printed on
 * the real sheet with a made-up student, so a centre can show a visitor what
 * the course leads to.
 */

type Course = { id: string; name: string; code: string; fee: number; duration: string };

const inr = (n: number) => (n ? n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—");

const durationOf = (value: unknown, unit: unknown) => {
  const n = Number(value) || 0;
  if (!n) return "";
  const u = String(unit || "MONTHS").toUpperCase();
  const word = u.startsWith("YEAR") ? "Year" : u.startsWith("WEEK") ? "Week" : u.startsWith("DAY") ? "Day" : u.startsWith("HOUR") ? "Hour" : "Month";
  return `${n} ${word}${n === 1 ? "" : "s"}`;
};

/** A made-up student for the course, with marks for each of its papers. */
export function sampleDocument(course: Course, subjects: CourseSubject[], centre: { name: string; code: string; logo: string | null }): StudentDocument {
  const today = new Date().toISOString().slice(0, 10);
  const papers = subjects.flatMap((s) => {
    const rows: StudentDocument["examResults"] = [];
    const add = (paper: "Theory" | "Practical", max: number, min: number) =>
      rows.push({
        marks: Math.round(max * 0.82),
        exam: { name: "Final Examination", subject: subjects.length ? `${s.name} (${paper})` : s.name, base: s.name, paper, maxMarks: max, passMarks: min, examDate: today },
      });
    if (s.subjectType !== "PRACTICAL" && s.theoryMax) add("Theory", s.theoryMax, s.theoryMin);
    if (s.subjectType !== "THEORY" && s.practicalMax) add("Practical", s.practicalMax, s.practicalMin);
    return rows;
  });
  const examResults = papers.length
    ? papers
    : [{ marks: 82, exam: { name: "Final Examination", subject: course.name, maxMarks: 100, passMarks: 40, examDate: today } }];
  return {
    firstName: "Sample",
    lastName: "Student",
    enrollmentNo: "SAMPLE-0001",
    rollNo: "0001",
    fatherName: "Sample Guardian",
    parentage: "Son of",
    dateOfBirth: "2006-01-01",
    admissionDate: today,
    issueDate: today,
    examinationDate: today,
    session: "Sample",
    course: { name: course.name, code: course.code, duration: course.duration },
    branch: { name: centre.name, code: centre.code, phone: "", email: "", logo: centre.logo, organization: { name: "Career Optics Computer Academy" } },
    feeInvoices: [],
    examResults,
  };
}

export default function SampleCertificates() {
  const { user, branchId, organizationId } = useAuth();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<CourseSubject[]>([]);
  const [price, setPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const [c, s, rates] = await Promise.all([
          getCourses(organizationId ?? null, branchId ?? null),
          getCourseSubjects().catch(() => [] as CourseSubject[]),
          getCentreRates().catch(() => null),
        ]);
        if (!live) return;
        setCourses(
          ((c.data || []) as Record<string, unknown>[])
            .filter((r) => r.isActive !== false)
            .map((r) => ({
              id: String(r.id),
              name: String(r.name ?? ""),
              code: String(r.code ?? ""),
              fee: Number(r.branchFee ?? r.baseFee) || 0,
              duration: durationOf(r.durationValue, r.durationUnit),
            }))
            .sort((a, b) => a.name.localeCompare(b.name)),
        );
        setSubjects(s);
        // What a centre pays the head office per certificate: its own rate, or every centre's.
        if (rates) setPrice(effectiveRate(rates, branchId ?? null, "CERTIFICATE") || 0);
      } catch (e) {
        toast({ title: "Could not load the courses", description: e instanceof Error ? e.message : undefined, variant: "destructive" });
      } finally {
        if (live) setLoading(false);
      }
    })();
    return () => {
      live = false;
    };
  }, [organizationId, branchId, toast]);

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? courses.filter((c) => `${c.name} ${c.code}`.toLowerCase().includes(q)) : courses;
  }, [courses, search]);

  const print = async (course: Course, kind: "certificate" | "marksheet") => {
    setBusy(`${course.id}:${kind}`);
    try {
      const logo = await loadInstituteLogo(branchId).catch(() => null);
      const doc = sampleDocument(course, subjects.filter((s) => s.courseId === course.id), {
        name: user?.name || "Career Optics Computer Academy",
        code: "SAMPLE",
        logo,
      });
      if (kind === "certificate") await certificatePdf(doc, { certificate_no: "SAMPLE", serial_no: "SAMPLE" });
      else await marksheetPdf(doc);
    } catch (e) {
      toast({ title: `Could not make the sample ${kind}`, description: e instanceof Error ? e.message : undefined, variant: "destructive" });
    } finally {
      setBusy("");
    }
  };

  return (
    <AppLayout>
      <div className="mb-4">
        <h1 className="text-[15px] font-bold uppercase tracking-wide text-slate-800">Sample Certificate</h1>
        <p className="text-[12.5px] text-slate-500">A sample certificate and marksheet for every course, on the real sheet with a made-up student.</p>
      </div>
      <DcePanel title="Sample Certificate">
        <div className="mb-3 flex justify-end">
          <label className="flex items-center gap-2 text-[13px] font-semibold text-slate-700">
            Search:
            <input value={search} onChange={(e) => setSearch(e.target.value)} className="rounded border border-slate-300 px-2 py-1.5 text-[13px] font-normal outline-none focus:border-[#38c3be]" aria-label="Search courses" />
          </label>
        </div>
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-slate-400" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-[13.5px]">
              <thead className="border-b-2 text-[12.5px] font-bold text-slate-700">
                <tr>
                  <th className="px-3 py-2">#</th>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Short form</th>
                  <th className="px-3 py-2">Fees</th>
                  <th className="px-3 py-2">Duration</th>
                  <th className="px-3 py-2">Franchise Price</th>
                  <th className="px-3 py-2">Demo</th>
                </tr>
              </thead>
              <tbody>
                {shown.length === 0 && (
                  <tr><td colSpan={7} className="py-8 text-center text-slate-500">No courses.</td></tr>
                )}
                {shown.map((c, i) => (
                  <tr key={c.id} className="border-b align-top">
                    <td className="px-3 py-3 text-slate-500">{i + 1}</td>
                    <td className="px-3 py-3 text-slate-700">{c.name}</td>
                    <td className="px-3 py-3 text-slate-600">{c.code || "—"}</td>
                    <td className="px-3 py-3">{inr(c.fee)}</td>
                    <td className="px-3 py-3">{c.duration || "—"}</td>
                    <td className="px-3 py-3 font-semibold text-[#2fb878]">{price ? price : "—"}</td>
                    <td className="px-3 py-3">
                      <div className="flex flex-col gap-1.5">
                        <DceButton size="sm" tone="blue" aria-label={`Sample certificate for ${c.name}`} disabled={!!busy} onClick={() => void print(c, "certificate")}>
                          {busy === `${c.id}:certificate` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Award className="h-3.5 w-3.5" />} Certificate
                        </DceButton>
                        <DceButton size="sm" tone="teal" aria-label={`Sample marksheet for ${c.name}`} disabled={!!busy} onClick={() => void print(c, "marksheet")}>
                          {busy === `${c.id}:marksheet` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />} Marksheet
                        </DceButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DcePanel>
      <p className="mt-3 flex items-center gap-1.5 text-[12px] text-slate-500"><Printer className="h-3.5 w-3.5" /> Samples carry "SAMPLE" in place of the certificate number and are not valid documents.</p>
    </AppLayout>
  );
}
