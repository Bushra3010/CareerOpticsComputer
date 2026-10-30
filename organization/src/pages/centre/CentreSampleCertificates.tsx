import { useEffect, useState } from "react";

import { AppLayout } from "@/components/layout/AppLayout";
import { DceButton, DcePanel, DceSelect, DceTable, inr, type DceColumn } from "@/components/dce/Dce";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { SAMPLE_DATA, canvasSize, designHtml, type DocumentKind, type TokenData } from "@/lib/documentDesigner";
import { printDesignPages } from "@/lib/export";
import { loadInstituteName } from "@/lib/instituteName";
import { qrImages } from "@/lib/studentTemplateDocument";
import { useBranchOptions } from "@/lib/supabase/centrePanel";
import { supabase } from "@/lib/supabase/client";
import { getCentreSummary, getCourses } from "@/lib/supabase/data";
import { loadDesignFor } from "@/lib/supabase/documentTemplates";

interface CourseRow {
  id: string;
  name: string;
  code: string;
  baseFee: number;
  registrationFee: number;
  examFee: number;
  duration: string;
  branchFee: number | null;
}

const UNIT: Record<string, string> = { DAYS: "Days", WEEKS: "Weeks", MONTHS: "Months", YEARS: "Years" };
const durationOf = (value: unknown, unit: unknown) => {
  const n = Number(value) || 0;
  if (!n) return "—";
  const label = UNIT[String(unit || "MONTHS").toUpperCase()] || String(unit || "Months");
  return `${n} ${n === 1 ? label.replace(/s$/, "") : label}`;
};

/**
 * Lays a diagonal "SAMPLE" across a drawn page, so a demo printed from here
 * can never pass for an issued certificate.
 */
function watermarked(html: string, width: number, height: number) {
  const size = Math.round(Math.min(width, height) / 4);
  return (
    `<div style="position:relative;width:${width}px;height:${height}px;overflow:hidden">${html}` +
    `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;z-index:9999">` +
    `<span style="transform:rotate(-30deg);font:900 ${size}px Arial,sans-serif;letter-spacing:.08em;color:rgba(220,38,38,.22);border:8px solid rgba(220,38,38,.22);padding:0 .25em">SAMPLE</span>` +
    `</div></div>`
  );
}

/**
 * "Sample Certificate": every course the centre runs, its fees, and a demo
 * certificate and marksheet drawn from the same template the centre's real
 * documents use -- with a dummy student and a SAMPLE watermark.
 */
export default function CentreSampleCertificates() {
  const { branchId, organizationId } = useAuth();
  const { toast } = useToast();
  const isAdmin = !branchId;
  const branches = useBranchOptions(organizationId, isAdmin);
  const [picked, setPicked] = useState("");
  const target = branchId || picked || null;

  const [rows, setRows] = useState<CourseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    setLoading(true);
    (async () => {
      const [courses, fees] = await Promise.all([
        getCourses(organizationId, target),
        target
          ? Promise.resolve(supabase.from("branch_courses").select("courseId, branchFee").eq("branchId", target)).then(({ data }) => data || [])
          : Promise.resolve([] as Array<{ courseId: string; branchFee: number | null }>),
      ]);
      const feeByCourse = new Map(
        (fees as Array<{ courseId: string; branchFee: number | null }>).filter((f) => f.branchFee != null).map((f) => [String(f.courseId), Number(f.branchFee)]),
      );
      return (courses.data || []).map(
        (c): CourseRow => ({
          id: String(c.id),
          name: String(c.name || ""),
          code: String(c.code || ""),
          baseFee: Number(c.baseFee) || 0,
          registrationFee: Number(c.registrationFee) || 0,
          examFee: Number(c.examFee) || 0,
          duration: durationOf(c.durationValue, c.durationUnit),
          branchFee: feeByCourse.get(String(c.id)) ?? null,
        }),
      );
    })()
      .then((r) => live && setRows(r))
      .catch((error) => {
        if (!live) return;
        setRows([]);
        toast({ title: "Could not load courses", description: (error as Error).message, variant: "destructive" });
      })
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [organizationId, target, toast]);

  const demo = async (course: CourseRow, kind: Extract<DocumentKind, "certificate" | "marksheet">) => {
    setBusy(`${course.id}:${kind}`);
    try {
      const [{ design }, institute, centre] = await Promise.all([
        loadDesignFor(kind, organizationId, target),
        loadInstituteName(target),
        getCentreSummary(target),
      ]);
      const data: TokenData = {
        ...SAMPLE_DATA,
        course_name: course.name,
        course_duration: course.duration === "—" ? SAMPLE_DATA.course_duration : course.duration,
        institute,
        ...(centre ? { branch_name: centre.name, centre_code: centre.code } : {}),
      };
      const html = designHtml(kind, design, data, await qrImages(design, data));
      const { width, height } = canvasSize(kind, design);
      printDesignPages(`Sample ${kind === "certificate" ? "Certificate" : "Marksheet"} — ${course.name}`, [watermarked(html, width, height)], width, height);
    } catch (error) {
      toast({ title: "Could not draw the sample", description: (error as Error).message, variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const columns: DceColumn<CourseRow>[] = [
    { key: "n", label: "#", render: (_r, i) => i + 1 },
    { key: "name", label: "NAME", render: (r) => <span className="font-semibold">{r.name}</span> },
    { key: "code", label: "Short Form", render: (r) => r.code || "—" },
    { key: "fees", label: "Fees", render: (r) => inr(r.baseFee) },
    { key: "duration", label: "Duration", render: (r) => r.duration },
    { key: "online", label: "Online Fees", render: (r) => inr(r.registrationFee + r.examFee) },
    { key: "franchise", label: "Franchise Price", render: (r) => (r.branchFee == null ? "—" : inr(r.branchFee)) },
    {
      key: "demo",
      label: "Demo",
      render: (r) => (
        <div className="flex flex-wrap gap-1.5">
          <DceButton size="sm" tone="teal" disabled={busy !== null} onClick={() => void demo(r, "certificate")}>
            {busy === `${r.id}:certificate` ? "Drawing…" : "Certificate"}
          </DceButton>
          <DceButton size="sm" tone="orange" disabled={busy !== null} onClick={() => void demo(r, "marksheet")}>
            {busy === `${r.id}:marksheet` ? "Drawing…" : "Marksheet"}
          </DceButton>
        </div>
      ),
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-5">
        {isAdmin && (
          <div className="max-w-xs">
            <DceSelect value={picked} onChange={(e) => setPicked(e.target.value)} aria-label="Branch">
              <option value="">All courses (no branch)</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </DceSelect>
          </div>
        )}
        <DcePanel title="Sample Certificate">
          <DceTable columns={columns} rows={rows} rowKey={(r) => r.id} loading={loading} empty="No courses are assigned to this centre yet." />
          <p className="mt-3 text-[11.5px] text-slate-500">Online Fees = registration fee + exam fee. Samples use a dummy student and carry a SAMPLE watermark.</p>
        </DcePanel>
      </div>
    </AppLayout>
  );
}
